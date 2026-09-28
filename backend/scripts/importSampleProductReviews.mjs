import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import dns from "node:dns";
import mongoose from "mongoose";
import dotenv from "dotenv";
import productModel from "../models/productModel.js";
import productReviewModel from "../models/productReviewModel.js";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.resolve(__dirname, "..");
const defaultReportPath = path.join(backendRoot, "reports", "sample-product-review-drafts.md");

dotenv.config({ path: path.join(backendRoot, ".env") });

const IMPORT_MARKER = "Imported from sample-product-review-drafts.md as test review content.";
const VALID_STATUSES = new Set(["pending", "approved", "rejected"]);
const IMPORT_START_DATE = new Date("2025-09-01T08:00:00.000Z").getTime();
const normalizeSlug = (value = "") => String(value).trim().toLowerCase();

const reportPath = process.env.REVIEW_REPORT_PATH
  ? path.resolve(process.env.REVIEW_REPORT_PATH)
  : defaultReportPath;
const importStatus = VALID_STATUSES.has(process.env.REVIEW_IMPORT_STATUS)
  ? process.env.REVIEW_IMPORT_STATUS
  : "pending";
const dryRun = String(process.env.DRY_RUN || "").toLowerCase() === "true";

const hashString = (value = "") => {
  let hash = 2166136261;
  for (const char of String(value)) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const buildReviewDate = (slug, reviewIndex) => {
  const endDate = Date.now();
  const range = Math.max(endDate - IMPORT_START_DATE, 1);
  const seed = hashString(`${slug}:${reviewIndex}`);
  const offset = seed % range;
  return new Date(IMPORT_START_DATE + offset);
};

const cleanCell = (value = "") => String(value).trim().replace(/\\\|/g, "|");

const parseReviewReport = async () => {
  const markdown = await fs.readFile(reportPath, "utf8");
  const lines = markdown.split(/\r?\n/);
  const products = [];
  let currentProduct = null;

  for (const line of lines) {
    const sectionMatch = line.match(/^##\s+\d+\.\s+(.+)$/);
    if (sectionMatch) {
      currentProduct = {
        name: sectionMatch[1].trim(),
        productId: "",
        slug: "",
        reviews: [],
      };
      products.push(currentProduct);
      continue;
    }

    const productIdMatch = line.match(/^- Product ID:\s+`([^`]+)`/);
    if (productIdMatch && currentProduct) {
      currentProduct.productId = productIdMatch[1].trim();
      continue;
    }

    const slugMatch = line.match(/^- Slug:\s+`([^`]+)`/);
    if (slugMatch && currentProduct) {
      currentProduct.slug = slugMatch[1].trim();
      continue;
    }

    const rowMatch = line.match(/^\|\s*(\d+)\s*\|\s*(\d+)\s*\|\s*([^|]+)\|\s*([^|]+)\|\s*(.+)\|\s*$/);
    if (rowMatch && currentProduct) {
      currentProduct.reviews.push({
        rating: Math.min(5, Math.max(1, Number(rowMatch[2]))),
        name: cleanCell(rowMatch[3]),
        title: cleanCell(rowMatch[4]),
        comment: cleanCell(rowMatch[5]),
      });
    }
  }

  return products.filter(product => product.slug && product.reviews.length);
};

const reviewKey = (review) => [
  String(review.product || ""),
  review.name,
  review.title,
  review.comment,
].map(value => String(value || "").trim().toLowerCase()).join("|");

try {
  if (!process.env.MONGO_URL) {
    throw new Error("MONGO_URL is not configured");
  }

  if (process.env.ALLOW_SAMPLE_REVIEW_IMPORT !== "true") {
    throw new Error("Set ALLOW_SAMPLE_REVIEW_IMPORT=true to import sample reviews into MongoDB");
  }

  await mongoose.connect(process.env.MONGO_URL);

  const reportProducts = await parseReviewReport();
  const dbProducts = await productModel.find({
    $or: [
      { slug: { $exists: true, $nin: ["", null] } },
      { _id: { $in: reportProducts.map(product => product.productId).filter(mongoose.Types.ObjectId.isValid) } },
    ],
  })
    .select("_id name slug")
    .sort({ createdAt: -1 })
    .lean();
  const dbProductById = new Map(dbProducts.map(product => [String(product._id), product]));
  const dbProductBySlug = new Map();
  dbProducts.forEach((product) => {
    const key = normalizeSlug(product.slug);
    if (key && !dbProductBySlug.has(key)) dbProductBySlug.set(key, product);
  });

  const existingSeedReviews = await productReviewModel
    .find({ adminNote: IMPORT_MARKER })
    .select("product name title comment")
    .lean();
  const existingKeys = new Set(existingSeedReviews.map(reviewKey));

  const docs = [];
  const missingProducts = [];
  let matchedReportProducts = 0;
  let skippedExisting = 0;
  let reviewsInReport = 0;

  reportProducts.forEach((reportProduct) => {
    const dbProduct = dbProductById.get(String(reportProduct.productId || ""))
      || dbProductBySlug.get(normalizeSlug(reportProduct.slug));
    if (!dbProduct) {
      missingProducts.push(reportProduct.slug);
      return;
    }

    matchedReportProducts += 1;
    reportProduct.reviews.forEach((review, reviewIndex) => {
      reviewsInReport += 1;
      const candidate = {
        product: dbProduct._id,
        productSlug: dbProduct.slug,
        name: review.name,
        title: review.title,
        comment: review.comment,
      };

      if (existingKeys.has(reviewKey(candidate))) {
        skippedExisting += 1;
        return;
      }

      const createdAt = buildReviewDate(dbProduct.slug, reviewIndex);
      docs.push({
        product: dbProduct._id,
        productSlug: dbProduct.slug,
        productName: dbProduct.name,
        name: review.name,
        email: "",
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        status: importStatus,
        adminNote: IMPORT_MARKER,
        approvedAt: importStatus === "approved" ? createdAt : null,
        approvedBy: null,
        createdAt,
        updatedAt: new Date(),
      });
    });
  });

  let inserted = 0;
  if (!dryRun && docs.length) {
    const result = await productReviewModel.insertMany(docs, { ordered: false });
    inserted = result.length;
  }

  console.log(JSON.stringify({
    success: true,
    dryRun,
    status: importStatus,
    reportPath,
    productsInReport: reportProducts.length,
    productsMatched: matchedReportProducts,
    dbProductsAvailable: dbProducts.length,
    productsMissing: missingProducts.length,
    missingProducts: missingProducts.slice(0, 20),
    reviewsInReport,
    inserted,
    skippedExisting,
    emailsInserted: 0,
  }, null, 2));
} catch (error) {
  console.error(JSON.stringify({
    success: false,
    message: error.message,
    code: error.code,
  }, null, 2));
  process.exitCode = 1;
} finally {
  await mongoose.disconnect().catch(() => {});
}
