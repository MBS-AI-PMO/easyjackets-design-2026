import crypto from "crypto";
import mongoose from "mongoose";
import AdminLog from "../models/adminLog.js";

// The admin activity ledger (models/adminLog.js): writes one entry for everything an admin changes, and for
// their sign-ins, sign-outs and password changes. Read by routes/adminLogRoutes.js (admin → Activity Log).
//
// Two ways in:
//   - watchAdminRequest(req, res): called by middlewares/authMiddleware.js isAdmin for every request an admin
//     makes; every one that can change something (not GET/HEAD/OPTIONS) gets an entry once it is answered.
//   - recordAdminEvent({...}): called by controllers/authController.js for sign-in, failed sign-in, sign-out
//     and password changes of admin accounts.
// Writing an entry never holds up or breaks the admin's request: it happens after the answer is sent, and a
// failure is only logged to the console.

/* ------------------------------------------------------------------------------------------------ */
/* Hash chain                                                                                        */
/* ------------------------------------------------------------------------------------------------ */

/** prevHash of the very first entry. */
export const GENESIS_HASH = "0".repeat(64);

// The fields an entry's hash covers: all of them except its own hash (and MongoDB's _id).
const HASHED_FIELDS = ["seq", "at", "admin", "area", "action", "method", "path", "target", "details", "status", "ok", "ip", "userAgent", "prevHash"];

const isObjectId = (value) => value instanceof mongoose.Types.ObjectId || value?._bsontype === "ObjectId";

// JSON with keys in sorted order at every level, dates as ISO text and ids as hex, so an entry hashes the
// same when it is written and when it is read back from the database.
const canonicalJson = (value) => {
  if (value === null || value === undefined) return "null";
  if (value instanceof Date) return JSON.stringify(Number.isNaN(value.getTime()) ? null : value.toISOString());
  if (isObjectId(value)) return JSON.stringify(String(value));
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (typeof value === "object") {
    const keys = Object.keys(value).filter((key) => value[key] !== undefined).sort();
    return `{${keys.map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(",")}}`;
  }
  if (typeof value === "number") return Number.isFinite(value) ? JSON.stringify(value) : "null";
  return JSON.stringify(value);
};

/** sha256(prevHash + canonical JSON of the entry's fields except hash). */
export const hashEntry = (entry) => {
  const fields = {};
  for (const key of HASHED_FIELDS) fields[key] = entry[key];
  return crypto.createHash("sha256").update(String(entry.prevHash || "") + canonicalJson(fields)).digest("hex");
};

/* ------------------------------------------------------------------------------------------------ */
/* Writing, one entry at a time                                                                      */
/* ------------------------------------------------------------------------------------------------ */

// Entries are written one after another through this queue (one backend instance), so two at the same moment
// cannot both take the same seq or link to the same entry. `head` is the newest entry this process knows of,
// read from the database at the first write.
let queue = Promise.resolve();
let head = null; // { seq, hash }

/** The newest entry this process wrote or read ({ seq, hash }), or null before the first write. */
export const ledgerHead = () => (head ? { ...head } : null);

const readHead = async () => {
  const last = await AdminLog.findOne({}, { seq: 1, hash: 1 }).sort({ seq: -1 }).lean();
  return last ? { seq: last.seq, hash: last.hash } : { seq: 0, hash: GENESIS_HASH };
};

const MAX_ATTEMPTS = 5;
const appendNow = async (fields) => {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    if (!head) head = await readHead();
    const entry = new AdminLog({ ...fields, seq: head.seq + 1, prevHash: head.hash, hash: "-" });
    // hashed as mongoose will store it (ids cast, defaults filled in)
    entry.hash = hashEntry(entry.toObject());
    try {
      await entry.save();
      head = { seq: entry.seq, hash: entry.hash };
      return entry;
    } catch (err) {
      // another writer (a second backend instance) took this seq first: read the newest entry again and retry
      if (err?.code === 11000) {
        head = null;
        continue;
      }
      throw err;
    }
  }
  throw new Error(`no free seq after ${MAX_ATTEMPTS} attempts`);
};

const append = (fields) => {
  const run = queue.then(() => appendNow(fields));
  queue = run.catch((err) => {
    console.error("Admin log: could not write an entry:", err?.message || err);
  });
  return queue;
};

/* ------------------------------------------------------------------------------------------------ */
/* What is kept of a request's body                                                                  */
/* ------------------------------------------------------------------------------------------------ */

// Values of these keys are never stored ("[hidden]"). SEO "keywords" are not keys.
const SECRET_KEY = /pass|secret|token|key|otp|code|card|cvc|authorization/i;
const NOT_SECRET_KEY = /^(meta[_-]?)?keywords?$/i;
const isSecretKey = (key) => SECRET_KEY.test(key) && !NOT_SECRET_KEY.test(key);

const MAX_TEXT = 200; // longer text is cut to this many characters
const MAX_DEPTH = 2; // body.a.b is kept; an object one level deeper (body.a.b.c) is summarised as "{N fields}"
const MAX_FIELDS = 40; // per object
const MAX_ARRAY = 10; // a short list of plain values is kept; anything else becomes "N items"
const MAX_DETAILS = 4096; // bytes of JSON for a whole entry's details
const HUGE_BODY = 256 * 1024; // a request this big (a saved design, a blog post with images) keeps only its field names

// Text that MongoDB stores exactly as given: a lone half of a surrogate pair (e.g. from cutting text in the
// middle of an emoji) would be changed on the way in, and the entry's hash would no longer match.
const LONE_SURROGATE = /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g;
const wellFormed = (text) => text.replace(LONE_SURROGATE, "�");
const text = (value, max = MAX_TEXT) => wellFormed(String(value ?? "").slice(0, max));

const BASE64_RUN = /^[A-Za-z0-9+/=\r\n_-]+$/;
const cleanString = (value) => {
  if (/^data:/i.test(value)) return /^data:image\//i.test(value) ? "[image]" : "[file]";
  if (value.length > MAX_TEXT && BASE64_RUN.test(value.slice(0, 2000))) return "[image]";
  if (value.length > MAX_TEXT) return `${text(value)}…`;
  return wellFormed(value);
};

// Field names as MongoDB accepts them in a stored object.
const cleanKey = (key) => {
  const name = text(String(key).replace(/\0/g, "").replace(/\./g, "_").replace(/^\$/, "_"), 60);
  return name === "__proto__" ? "_proto_" : name;
};

const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;
const isPlain = (value) => value === null || ["string", "number", "boolean"].includes(typeof value);

const cleanValue = (value, depth) => {
  if (value === undefined || typeof value === "function" || typeof value === "symbol") return undefined;
  if (value === null || typeof value === "boolean") return value;
  if (typeof value === "string") return cleanString(value);
  if (typeof value === "number") return Number.isFinite(value) ? value : String(value);
  if (typeof value === "bigint") return String(value);
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? "Invalid date" : value.toISOString();
  if (Buffer.isBuffer(value)) return "[file]";
  if (isObjectId(value)) return String(value);
  if (Array.isArray(value)) {
    if (value.length <= MAX_ARRAY && value.every(isPlain)) {
      return value.map((item) => (typeof item === "string" ? cleanString(item) : item));
    }
    return plural(value.length, "item");
  }
  if (typeof value === "object") {
    if (depth >= MAX_DEPTH) return `{${plural(Object.keys(value).length, "field")}}`;
    return cleanObject(value, depth + 1);
  }
  return text(value);
};

const cleanObject = (source, depth) => {
  const out = {};
  const keys = Object.keys(source);
  for (const rawKey of keys.slice(0, MAX_FIELDS)) {
    const value = isSecretKey(rawKey) ? (source[rawKey] === undefined ? undefined : "[hidden]") : cleanValue(source[rawKey], depth);
    if (value !== undefined) out[cleanKey(rawKey)] = value;
  }
  if (keys.length > MAX_FIELDS) out["…"] = `${keys.length - MAX_FIELDS} more fields`;
  return out;
};

// Keeps the whole thing under MAX_DETAILS: big nested values are summarised, then fields past the limit dropped.
const capSize = (details) => {
  if (JSON.stringify(details).length <= MAX_DETAILS) return details;
  const out = {};
  const keys = Object.keys(details);
  let used = 2;
  for (let i = 0; i < keys.length; i += 1) {
    let value = details[keys[i]];
    let size = JSON.stringify(keys[i]).length + JSON.stringify(value).length + 2;
    if (size > 600 && value && typeof value === "object") {
      value = Array.isArray(value) ? plural(value.length, "item") : `{${plural(Object.keys(value).length, "field")}}`;
      size = JSON.stringify(keys[i]).length + JSON.stringify(value).length + 2;
    }
    if (used + size > MAX_DETAILS - 40) {
      out["…"] = `${keys.length - i} more fields`;
      break;
    }
    out[keys[i]] = value;
    used += size;
  }
  return out;
};

/** What an entry keeps of `value` (usually a request body): secrets hidden, images and long text cut, at most ~4 KB. */
export const cleanDetails = (value) => {
  try {
    if (value === undefined || value === null) return {};
    if (typeof value !== "object" || Array.isArray(value)) return capSize({ value: cleanValue(value, 0) });
    return capSize(cleanObject(value, 0));
  } catch {
    return {};
  }
};

// The details of an admin request: its body, or for an upload form or a huge body just a note of what it was.
const requestDetails = (req) => {
  if (req.is?.("multipart/form-data")) return { form: "File upload (its fields are not recorded)" };
  const body = req.body;
  if (!body || typeof body !== "object") return {};
  const size = Number(req.headers?.["content-length"]) || 0;
  if (size > HUGE_BODY) {
    const keys = Object.keys(body);
    return {
      fields: text(keys.slice(0, 30).map(cleanKey).join(", ") + (keys.length > 30 ? `, +${keys.length - 30} more` : ""), 1000),
      size: `${(size / 1024 / 1024).toFixed(1)} MB (too large to record)`,
    };
  }
  return cleanDetails(body);
};

/* ------------------------------------------------------------------------------------------------ */
/* Naming what happened: area and action for every admin route                                       */
/* ------------------------------------------------------------------------------------------------ */

const isOn = (value) => value === true || value === "true" || value === 1 || value === "1";

// [method, route pattern, area, action (text, or a function of the request), model naming the item, options]
//   model: whose record names the item when the request and its answer do not (see LABEL_FIELDS)
//   options.lookupParam: the route parameter holding that record's id (default: the item's id)
//   options.bodyId: the body field holding the item's id (when the route has none)
//   options.fromAnswer: the item is the one the answer returns (e.g. a new draft), not the route's parameter
const ROUTES = [
  // routes/authRoutes.js (sign-in, sign-out and password changes are recorded by authController.js itself)
  ["POST", "/api/v1/auth/register-admin", "Admins", "Created admin", "User"],
  ["DELETE", "/api/v1/auth/admin/:id", "Admins", "Deleted admin", "User"],
  ["PUT", "/api/v1/auth/order-status/:orderId", "Orders", "Changed order status", "Order"],

  // routes/categoryRoutes.js
  ["POST", "/api/v1/category/create-category", "Categories", "Created category", "Category"],
  ["PUT", "/api/v1/category/update-category/:id", "Categories", "Updated category", "Category"],
  ["DELETE", "/api/v1/category/delete-category/:id", "Categories", "Deleted category", "Category"],

  // routes/productRoutes.js
  ["POST", "/api/v1/product/create/:cid", "Products", "Started a new product", "Products", { fromAnswer: true }],
  ["POST", "/api/v1/product/create-product", "Products", "Created product", "Products"],
  ["PUT", "/api/v1/product/update-product/:pid", "Products", "Updated product", "Products"],
  ["PUT", "/api/v1/product/active/:pid", "Products", (req) => (isOn(req.body?.isActive) ? "Activated product" : "Deactivated product"), "Products"],
  ["POST", "/api/v1/product/duplicate-product/:id", "Products", "Duplicated product", "Products"],
  ["POST", "/api/v1/product/backfill-seo", "SEO", "Filled in missing product SEO"],
  ["DELETE", "/api/v1/product/delete-product/:pid", "Products", "Deleted product", "Products"],

  // routes/designRoutes.js (a saved product design itself is sent with a design ticket, not an admin login,
  // so only opening the builder is recorded)
  ["POST", "/api/v1/custom/design-ticket", "Designs", "Opened product in the builder", "Products", { bodyId: "productId" }],
  ["POST", "/api/v1/custom/product-design", "Designs", "Saved product design", "Products", { bodyId: "productId" }],
  ["PUT", "/api/v1/custom/updateDesign/:designId", "Designs", "Updated design"],

  // routes/orderRoutes.js
  ["PUT", "/api/v1/order/:id", "Orders", "Updated order", "Order"],
  ["DELETE", "/api/v1/order/:id", "Orders", "Deleted order", "Order"],
  ["PUT", "/api/v1/order/restore/:id", "Orders", "Restored order", "Order"],
  ["DELETE", "/api/v1/order/permanent/:id", "Orders", "Deleted order for good", "Order"],
  ["DELETE", "/api/v1/order/clear-deleted", "Orders", "Emptied deleted orders"],
  ["DELETE", "/api/v1/order/bulk/:id", "Bulk orders", "Deleted bulk order", "bulkorder"],
  ["PUT", "/api/v1/order/bulk/restore/:id", "Bulk orders", "Restored bulk order", "bulkorder"],
  ["DELETE", "/api/v1/order/bulk/permanent/:id", "Bulk orders", "Deleted bulk order for good", "bulkorder"],

  // routes/featureRoutes.js
  ["PUT", "/api/v1/features/website/details", "Website", "Updated website details"],
  ["POST", "/api/v1/features/blogs", "Blog", "Created blog post", "Blog"],
  ["POST", "/api/v1/features/blogs/upload-image", "Blog", "Uploaded blog image"],
  ["PUT", "/api/v1/features/blogs/:id", "Blog", "Updated blog post", "Blog"],
  ["DELETE", "/api/v1/features/blogs/:id", "Blog", "Deleted blog post", "Blog"],
  ["PUT", "/api/v1/features/blogs/:blogId/comments/:commentId/approve", "Blog", "Approved comment", "Blog", { lookupParam: "blogId" }],
  ["DELETE", "/api/v1/features/blogs/:blogId/comments/:commentId", "Blog", "Deleted comment", "Blog", { lookupParam: "blogId" }],
  ["POST", "/api/v1/features/page-faqs", "FAQs", "Created FAQ", "PageFaq"],
  ["PUT", "/api/v1/features/page-faqs/reorder", "FAQs", "Reordered FAQs"],
  ["PUT", "/api/v1/features/page-faqs/:id", "FAQs", "Updated FAQ", "PageFaq"],
  ["DELETE", "/api/v1/features/page-faqs/:id", "FAQs", "Deleted FAQ", "PageFaq"],
  ["PUT", "/api/v1/features/top-bar", "Website", "Updated top bar"],
  ["POST", "/api/v1/features", "Website", "Updated features"],
  ["PUT", "/api/v1/features/subscribers/:id", "Subscribers", "Updated subscriber", "NewsletterSubscriber"],
  ["DELETE", "/api/v1/features/subscribers/:id", "Subscribers", "Removed subscriber", "NewsletterSubscriber"],

  // routes/metadataRoutes.js
  ["POST", "/api/v1/metadata/upload", "SEO", "Uploaded SEO image"],
  ["POST", "/api/v1/metadata/seed-required", "SEO", "Added missing SEO pages"],
  ["POST", "/api/v1/metadata", "SEO", "Created page metadata"],
  ["PUT", "/api/v1/metadata/:route", "SEO", "Updated page metadata"],
  ["DELETE", "/api/v1/metadata/:route", "SEO", "Deleted page metadata"],

  // routes/seoHealthRoutes.js
  ["POST", "/api/v1/seo-health/upload-social-image", "SEO", "Uploaded social image"],
  ["PUT", "/api/v1/seo-health/metadata", "SEO", "Saved page metadata"],
  ["PUT", "/api/v1/seo-health/indexing", "SEO", (req) => (isOn(req.body?.noIndex) ? "Hid page from search" : "Let search engines index page")],
  ["PUT", "/api/v1/seo-health/indexing/bulk", "SEO", "Changed indexing of several pages"],
  ["POST", "/api/v1/seo-health/audit", "SEO", "Ran SEO audit"],
  ["POST", "/api/v1/seo-health/audit-all", "SEO", "Ran SEO audit of every page"],

  // routes/siteTagRoutes.js
  ["POST", "/api/v1/sitetags", "Site tags", "Created site tag", "SiteTag"],
  ["PUT", "/api/v1/sitetags/:id", "Site tags", "Updated site tag", "SiteTag"],
  ["DELETE", "/api/v1/sitetags/:id", "Site tags", "Deleted site tag", "SiteTag"],

  // routes/fontRoutes.js
  ["POST", "/api/v1/fonts", "Fonts", "Added font", "Font"],
  ["PUT", "/api/v1/fonts/:id", "Fonts", "Updated font", "Font"],
  ["DELETE", "/api/v1/fonts/:id", "Fonts", "Deleted font", "Font"],

  // routes/galleryRoutes.js
  ["POST", "/api/v1/gallery", "Gallery", "Uploaded gallery photos", "Gallery"],
  ["PUT", "/api/v1/gallery/:id", "Gallery", "Updated gallery photo", "Gallery"],
  ["DELETE", "/api/v1/gallery/:id", "Gallery", "Deleted gallery photo", "Gallery"],
  ["DELETE", "/api/v1/gallery/permanent/:id", "Gallery", "Deleted gallery photo for good", "Gallery"],

  // routes/patchPhotoRoutes.js
  ["POST", "/api/v1/patches", "Patches", "Uploaded patch photos", "PatchPhoto"],
  ["PUT", "/api/v1/patches/:id", "Patches", "Updated patch photo", "PatchPhoto"],
  ["DELETE", "/api/v1/patches/:id", "Patches", "Deleted patch photo", "PatchPhoto"],
  ["DELETE", "/api/v1/patches/permanent/:id", "Patches", "Deleted patch photo for good", "PatchPhoto"],

  // routes/fabricColorRoutes.js
  ["POST", "/api/v1/fabric-colors/sections", "Fabric colours", "Created fabric section", "FabricSection"],
  ["PUT", "/api/v1/fabric-colors/sections/:id", "Fabric colours", "Updated fabric section", "FabricSection"],
  ["DELETE", "/api/v1/fabric-colors/sections/:id", "Fabric colours", "Deleted fabric section", "FabricSection"],
  ["POST", "/api/v1/fabric-colors", "Fabric colours", "Added fabric colour", "FabricColor"],
  ["PUT", "/api/v1/fabric-colors/:id", "Fabric colours", "Updated fabric colour", "FabricColor"],
  ["DELETE", "/api/v1/fabric-colors/:id", "Fabric colours", "Deleted fabric colour", "FabricColor"],

  // routes/productReviewRoutes.js
  ["PUT", "/api/v1/reviews/admin/:id", "Reviews", "Updated review", "ProductReview"],
  ["DELETE", "/api/v1/reviews/admin/:id", "Reviews", "Deleted review", "ProductReview"],

  // settings: email, payments, analytics, shipping, site status
  ["PUT", "/api/v1/email-config", "Email", "Saved email settings"],
  ["POST", "/api/v1/email-config/test", "Email", "Sent a test email"],
  ["PUT", "/api/v1/payment-config", "Payments", "Saved payment settings"],
  ["POST", "/api/v1/payment-config/test", "Payments", "Tested payment settings"],
  ["POST", "/api/v1/analytics/config", "Analytics", "Saved analytics settings"],
  ["DELETE", "/api/v1/visitor-analytics/purge", "Analytics", "Deleted visitor data"],
  ["PUT", "/api/v1/shipping-rates", "Shipping", "Saved shipping rates"],
  ["POST", "/api/v1/shipping-rates/seed", "Shipping", "Loaded default shipping rates"],
  ["PUT", "/api/v1/site-status", "Settings", "Updated site status text"],
];

// routes/propertyRoutes.js: the jacket options all have the same three routes
const JACKET_OPTIONS = [
  // [route, what one is called, model]
  ["materials", "material", "material"],
  ["collars", "collar", "collar"],
  ["sleeves", "sleeve", "sleeves"],
  ["closures", "closure", "Closure"],
  ["pockets", "pocket", "pocket"],
  ["linings", "lining", "lining"],
  ["designTypes", "design type", "designstype"],
  ["sizes", "size", "size"],
  ["colors", "colour", "color"],
];
for (const [route, noun, model] of JACKET_OPTIONS) {
  ROUTES.push(
    ["POST", `/api/v1/property/${route}`, "Jacket options", `Added ${noun}`, model],
    ["PUT", `/api/v1/property/${route}/:id`, "Jacket options", `Updated ${noun}`, model],
    ["DELETE", `/api/v1/property/${route}/:id`, "Jacket options", `Deleted ${noun}`, model]
  );
}

const normalizePattern = (pattern) => String(pattern || "").replace(/\/+$/, "") || "/";
const RULES = new Map(
  ROUTES.map(([method, pattern, area, action, model = null, options = {}]) => [
    `${method} ${normalizePattern(pattern)}`,
    { area, action, model, ...options },
  ])
);

// A route the table does not know yet still gets a readable entry, from its address:
// "POST /api/v1/foo/bar" → area "Foo", action "Bar"; "DELETE /api/v1/order/:id/note" → "Orders", "Deleted note".
const AREA_BY_MOUNT = {
  auth: "Admins",
  category: "Categories",
  product: "Products",
  custom: "Designs",
  property: "Jacket options",
  order: "Orders",
  features: "Website",
  metadata: "SEO",
  "seo-health": "SEO",
  gallery: "Gallery",
  patches: "Patches",
  analytics: "Analytics",
  "visitor-analytics": "Analytics",
  sitetags: "Site tags",
  fonts: "Fonts",
  reviews: "Reviews",
  "fabric-colors": "Fabric colours",
  "email-config": "Email",
  "payment-config": "Payments",
  "shipping-rates": "Shipping",
  "site-status": "Settings",
  "admin-logs": "Activity log",
};
const words = (segment) => String(segment || "").replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[-_.]+/g, " ").trim().toLowerCase();
const capitalize = (value) => (value ? value.charAt(0).toUpperCase() + value.slice(1) : value);
const describeUnknown = (method, pattern) => {
  const segments = pattern.replace(/^\/api\/v\d+\/?/, "").split("/").filter(Boolean);
  const mount = segments[0] || "";
  const named = segments.filter((segment) => !segment.startsWith(":"));
  const last = words(named[named.length - 1] || mount) || "request";
  const verb = { DELETE: "Deleted", PUT: "Updated", PATCH: "Updated" }[method];
  return {
    area: AREA_BY_MOUNT[mount] || capitalize(words(mount)) || "Other",
    action: verb ? `${verb} ${last}` : capitalize(last),
    model: null,
  };
};

// The route pattern of a request (/api/v1/product/update-product/:pid). Without a matched route (should not
// happen behind isAdmin), the address with anything that looks like an id replaced by ":id".
const routePattern = (req) => {
  const routePath = req?.route?.path;
  if (typeof routePath === "string") return normalizePattern(`${req.baseUrl || ""}${routePath}`);
  const address = String(req?.originalUrl || req?.url || "").split("?")[0];
  return normalizePattern(address.replace(/\/[0-9a-f]{24}(?=\/|$)/gi, "/:id"));
};

/** { area, action, model, ... } for a request: from the table, else read off the address. */
export const describeRequest = (method, pattern) =>
  RULES.get(`${method} ${pattern}`) || describeUnknown(method, pattern);

/* ------------------------------------------------------------------------------------------------ */
/* The item an entry is about                                                                        */
/* ------------------------------------------------------------------------------------------------ */

// Which fields of a model's records name one (model names as registered in models/*.js).
const LABEL_FIELDS = {
  Products: ["name", "sku"],
  Category: ["name"],
  User: ["name", "email"],
  Order: ["orderId"],
  bulkorder: ["name", "email"],
  Blog: ["title"],
  PageFaq: ["question"],
  SiteTag: ["name"],
  Font: ["name", "family"],
  ProductReview: ["title", "name"],
  FabricColor: ["name"],
  FabricSection: ["title"],
  Gallery: ["description"],
  PatchPhoto: ["description"],
  NewsletterSubscriber: ["email"],
  collar: ["name"],
  sleeves: ["name"],
  Closure: ["name"],
  pocket: ["name"],
  lining: ["name"],
  designstype: ["name"],
  material: ["name"],
  size: ["size"],
  color: ["name"],
};
// Body or answer fields that name the item, in order of preference.
const NAME_KEYS = ["name", "title", "question", "email", "route", "label", "family", "orderId"];
const MAX_LABEL = 120;

const nameOf = (record, keys = NAME_KEYS) => {
  if (!record || typeof record !== "object") return "";
  const key = keys.find((k) => (typeof record[k] === "string" && record[k].trim()) || typeof record[k] === "number");
  if (!key) return "";
  const label = String(record[key]).trim();
  // a person: "Name (email)"
  if (key === "name" && typeof record.email === "string" && record.email.trim()) return `${label} (${record.email.trim()})`;
  return label;
};

// The record an answer is about: the answer itself, or one of its fields ({ category: {...} }), with an _id.
const answerItem = (answer) => {
  if (!answer || typeof answer !== "object" || Array.isArray(answer)) return null;
  const candidates = [answer, ...Object.values(answer).filter((value) => value && typeof value === "object" && !Array.isArray(value))];
  return candidates.find((item) => item._id && (typeof item._id === "string" || isObjectId(item._id))) || null;
};

const lookupLabel = async (modelName, id) => {
  const Model = modelName && mongoose.models[modelName];
  const fields = LABEL_FIELDS[modelName];
  if (!Model || !fields || !mongoose.isValidObjectId(id)) return "";
  const record = await Model.findById(id).select(fields.join(" ")).lean();
  return nameOf(record, fields);
};

/* ------------------------------------------------------------------------------------------------ */
/* Admin requests                                                                                    */
/* ------------------------------------------------------------------------------------------------ */

const READ_ONLY = new Set(["GET", "HEAD", "OPTIONS"]);

const adminSnapshot = (user) => ({
  _id: user?._id && mongoose.isValidObjectId(user._id) ? user._id : null,
  name: text(user?.name, 120),
  email: text(user?.email, 200),
});

const requestInfo = (req) => ({
  method: text(req?.method, 10),
  path: text(routePattern(req), 300),
  ip: text(req?.ip || req?.socket?.remoteAddress, 64),
  userAgent: text(req?.headers?.["user-agent"], 200),
});

/**
 * Called by isAdmin (middlewares/authMiddleware.js) once the user is known to be an admin (req.adminUser).
 * A request that can change something gets a ledger entry after it is answered. Never throws, never waits.
 */
export const watchAdminRequest = (req, res) => {
  try {
    if (READ_ONLY.has(req.method) || req.adminLedgerWatched) return;
    req.adminLedgerWatched = true;

    const info = requestInfo(req);
    const params = { ...(req.params || {}) };
    const rule = describeRequest(info.method, info.path);

    // the answer, to name an item it created or changed (e.g. { category: { _id, name } }); only kept by reference
    let answer;
    const sendJson = res.json;
    res.json = function keepAnswer(body) {
      answer = body;
      return sendJson.apply(this, arguments);
    };

    // an item about to be deleted: read its name now, while it still exists (not awaited)
    const lookupId = rule.lookupParam ? params[rule.lookupParam] : Object.values(params).pop();
    const nameBeforeDelete = req.method === "DELETE" && rule.model && !rule.fromAnswer
      ? lookupLabel(rule.model, lookupId).catch(() => "")
      : null;

    let answered = false;
    let done = false;
    const record = () => {
      if (done) return;
      done = true;
      // the admin went away before the answer (499): the request may still have done its work, so it is recorded
      const status = answered ? res.statusCode : 499;
      setImmediate(() => {
        recordRequest({ req, info, params, rule, answer, status, nameBeforeDelete }).catch((err) => {
          console.error("Admin log: could not record a request:", err?.message || err);
        });
      });
    };
    res.once("finish", () => {
      answered = true;
      record();
    });
    res.once("close", record);
  } catch (err) {
    console.error("Admin log: could not watch a request:", err?.message || err);
  }
};

const recordRequest = async ({ req, info, params, rule, answer, status, nameBeforeDelete }) => {
  const body = req.body && typeof req.body === "object" && !Array.isArray(req.body) ? req.body : {};
  const item = answerItem(answer);

  // the item: the route's id (or the one the body names), else what the answer returned
  const paramValues = Object.values(params).filter(Boolean);
  let targetId = "";
  let fromAnswer = false;
  if (rule.bodyId && body[rule.bodyId]) targetId = String(body[rule.bodyId]);
  else if (!rule.fromAnswer && paramValues.length) targetId = paramValues.join(" / ");
  else if (item) {
    targetId = String(item._id);
    fromAnswer = true;
  }

  // its name: from the body, from the answer (when it is the same item), else read from its record
  let label = rule.bodyId ? "" : nameOf(body);
  if (!label && item && (fromAnswer || String(item._id) === targetId)) label = nameOf(item);
  if (!label && nameBeforeDelete) label = await nameBeforeDelete;
  if (!label && rule.model) {
    const lookupId = rule.lookupParam ? params[rule.lookupParam] : fromAnswer ? targetId : rule.bodyId ? targetId : paramValues[paramValues.length - 1];
    label = await lookupLabel(rule.model, lookupId).catch(() => "");
  }

  // succeeded: an answer below 400 that does not say { success: false }
  const ok = status < 400 && !(answer && typeof answer === "object" && answer.success === false);
  const details = requestDetails(req);
  if (!ok && answer && typeof answer === "object" && typeof (answer.message || answer.error) === "string") {
    details["Server answer"] = text(answer.message || answer.error);
  }

  let action = rule.action;
  if (typeof action === "function") {
    try {
      action = action(req);
    } catch {
      action = describeUnknown(info.method, info.path).action;
    }
  }
  await append({
    at: new Date(),
    admin: adminSnapshot(req.adminUser),
    area: text(rule.area, 60),
    action: text(action, 120),
    ...info,
    target: { id: text(targetId, 200), label: text(label, MAX_LABEL) },
    details: capSize(details),
    status,
    ok,
  });
};

/* ------------------------------------------------------------------------------------------------ */
/* Events recorded by the auth controller                                                            */
/* ------------------------------------------------------------------------------------------------ */

// The admin an event is about: the given user, or the one with that id or email; nobody unless they are an admin.
const findAdmin = async ({ user, userId, email }) => {
  if (user) return user.role === 1 ? user : null;
  const User = mongoose.models.User;
  if (!User) return null;
  let found = null;
  if (userId && mongoose.isValidObjectId(userId)) found = await User.findById(userId).select("name email role").lean();
  else if (typeof email === "string" && email) found = await User.findOne({ email }).select("name email role").lean();
  return found?.role === 1 ? found : null;
};

/**
 * Records an event about an admin account (sign-in, failed sign-in, sign-out, password change), e.g.
 *   recordAdminEvent({ user, area: "Sign-in", action: "Signed in", req, status: 200 })
 * `user` (a user record), or `userId` / `email` to look one up. Does nothing for an account that is not an
 * admin. `ok` defaults to status < 400; `details` is cleaned like a request body. Never throws, never waits.
 */
export const recordAdminEvent = ({ user, userId, email, area, action, req, status = 200, ok, details, target } = {}) => {
  try {
    const at = new Date();
    const info = requestInfo(req);
    const cleaned = cleanDetails(details);
    setImmediate(() => {
      findAdmin({ user, userId, email })
        .then((admin) => {
          if (!admin) return null;
          return append({
            at,
            admin: adminSnapshot(admin),
            area: text(area, 60),
            action: text(action, 120),
            ...info,
            target: { id: text(target?.id, 200), label: text(target?.label, MAX_LABEL) },
            details: cleaned,
            status: Number(status) || 0,
            ok: typeof ok === "boolean" ? ok : Number(status) < 400,
          });
        })
        .catch((err) => {
          console.error("Admin log: could not record an event:", err?.message || err);
        });
    });
  } catch (err) {
    console.error("Admin log: could not record an event:", err?.message || err);
  }
};
