import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import dns from "node:dns";
import mongoose from "mongoose";
import dotenv from "dotenv";
import productModel from "../models/productModel.js";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(backendRoot, "..");
const reportDir = path.join(backendRoot, "reports");
const reportPath = path.join(reportDir, "sample-product-review-drafts.md");

dotenv.config({ path: path.join(backendRoot, ".env") });

const names = [
  "Michael Carter",
  "Ashley Bennett",
  "Daniel Brooks",
  "Jessica Miller",
  "Chris Anderson",
  "Amanda Taylor",
  "Ryan Cooper",
  "Lauren Mitchell",
  "Brandon Scott",
  "Emily Parker",
  "Kevin Johnson",
  "Sarah Collins",
  "Justin Reed",
  "Megan Foster",
  "Brian Walker",
  "Rachel Morgan",
  "Tyler Hughes",
  "Nicole Sanders",
  "Eric Peterson",
  "Kayla Richardson",
];

const titleTemplates = [
  "Great quality and fit",
  "Exactly what I wanted",
  "Comfortable and well made",
  "Clean look and solid stitching",
  "Very happy with this jacket",
  "Good value for the quality",
  "Looks sharp in person",
  "The sizing worked well",
  "Nice material and finish",
  "Would order again",
];

const commentTemplates = [
  "The jacket feels durable, the stitching looks clean, and the fit matched what I expected from the size guide.",
  "The material has a nice weight without feeling too heavy. It looks polished and works well for everyday wear.",
  "I liked the finish and the overall shape. The colors came through nicely and the jacket feels comfortable.",
  "This was easy to match with the rest of my outfit. The fit is neat, and the details look better than expected.",
  "The jacket arrived looking clean and structured. The fabric feels good and the sizing was close to accurate.",
  "Good build quality for the price. The sleeves and body sit well, and it has a classic varsity look.",
  "The design is simple but sharp. It feels comfortable enough to wear for long stretches.",
  "I was happy with the overall look. The jacket has a clean finish and the measurements were useful.",
  "The fabric feels sturdy and the jacket holds its shape well. I would recommend checking the size chart first.",
  "Nice jacket with a clean appearance. The quality feels consistent across the body, sleeves, and trim.",
];

const slugToName = (slug = "") =>
  String(slug)
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const hashString = (value = "") => {
  let hash = 2166136261;
  for (const char of String(value)) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const createRandom = (seed) => {
  let value = seed || 1;
  return () => {
    value = Math.imul(value ^ (value >>> 15), 1 | value);
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
};

const pick = (list, random) => list[Math.floor(random() * list.length) % list.length];

const getProductsFromDb = async () => {
  if (!process.env.MONGO_URL) return [];

  await mongoose.connect(process.env.MONGO_URL);
  return productModel
    .find({
      isActive: { $ne: false },
      slug: { $exists: true, $nin: ["", null] },
    })
    .select("name slug")
    .sort({ name: 1 })
    .lean();
};

const getProductsFromSitemap = async () => {
  const sitemapPath = path.join(repoRoot, "easyjackets", "public", "product-sitemap.xml");
  const xml = await fs.readFile(sitemapPath, "utf8");
  const slugs = [...xml.matchAll(/<loc>https:\/\/easyjackets\.com\/product\/([^<]+)<\/loc>/g)]
    .map((match) => decodeURIComponent(match[1]))
    .filter(Boolean);

  return slugs.map((slug) => ({
    name: slugToName(slug),
    slug,
  }));
};

const buildReviewsForProduct = (product) => {
  const seed = hashString(product._id || product.slug || product.name);
  const random = createRandom(seed);
  const count = 3 + Math.floor(random() * 3);
  const usedNames = new Set();

  return Array.from({ length: count }, (_, index) => {
    let name = pick(names, random);
    while (usedNames.has(name)) name = pick(names, random);
    usedNames.add(name);

    const rating = random() > 0.22 ? 5 : 4;
    const title = pick(titleTemplates, random);
    const comment = commentTemplates[(index + Math.floor(random() * commentTemplates.length)) % commentTemplates.length];

    return {
      rating,
      name,
      title,
      comment,
    };
  });
};

const renderReport = (products, source) => {
  const generatedAt = new Date().toISOString();
  let totalReviews = 0;

  const sections = products.map((product, productIndex) => {
    const reviews = buildReviewsForProduct(product);
    totalReviews += reviews.length;

    const rows = reviews
      .map((review, reviewIndex) => (
        `| ${reviewIndex + 1} | ${review.rating} | ${review.name} | ${review.title} | ${review.comment} |`
      ))
      .join("\n");

    return `## ${productIndex + 1}. ${product.name}

- Product ID: \`${product._id || ""}\`
- Slug: \`${product.slug}\`
- Review count: ${reviews.length}

| # | Stars | Name | Title | Review |
|---|---:|---|---|---|
${rows}`;
  });

  return `# Sample Product Review Drafts

Generated: ${generatedAt}
Source: ${source}
Products: ${products.length}
Total review drafts: ${totalReviews}
Rule: minimum 3 and maximum 5 reviews per product.
Fields included: stars, name, title, review.
Fields excluded: emails.

Note: This is sample/test review content generated for review/import. Check the importer output for database status.

${sections.join("\n\n")}
`;
};

try {
  let source = "MongoDB";
  let products = [];

  try {
    products = await getProductsFromDb();
  } catch (error) {
    source = `easyjackets/public/product-sitemap.xml fallback (MongoDB unavailable: ${error.code || error.message})`;
    products = [];
  }

  if (!products.length) {
    if (source === "MongoDB") source = "easyjackets/public/product-sitemap.xml fallback";
    products = await getProductsFromSitemap();
  }

  await fs.mkdir(reportDir, { recursive: true });
  await fs.writeFile(reportPath, renderReport(products, source), "utf8");
  console.log(JSON.stringify({ reportPath, products: products.length, source }, null, 2));
} finally {
  await mongoose.disconnect().catch(() => {});
}
