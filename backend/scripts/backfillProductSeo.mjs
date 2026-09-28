import dotenv from "dotenv";
import mongoose from "mongoose";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import productModel from "../models/productModel.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: resolve(__dirname, "../.env") });

const shouldWrite = process.argv.includes("--write");

const cleanText = (value = "") =>
  String(value)
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();

const cleanProductTitle = (value = "") =>
  cleanText(value).replace(/\s*[-|]\s*Easy Jackets?$/i, "").trim();

const needsSeoCleanup = (value = "") => /<[^>]+>|&nbsp;|&amp;|&quot;|&#39;|&lt;|&gt;/i.test(String(value));

const trimSentence = (value, maxLength = 155) => {
  const text = cleanText(value);
  if (text.length <= maxLength) return text;

  const clipped = text.slice(0, maxLength - 1);
  const lastSpace = clipped.lastIndexOf(" ");
  return `${clipped.slice(0, lastSpace > 80 ? lastSpace : clipped.length).trim()}.`;
};

const buildDescription = (product) => {
  const categoryName = cleanText(product.category?.name);
  const source = cleanText(product.shortdescription) || cleanText(product.description);

  if (source) {
    const categorySuffix = categoryName && !source.toLowerCase().includes(categoryName.toLowerCase())
      ? ` Available in our ${categoryName} collection.`
      : "";
    return trimSentence(`${source}${categorySuffix}`);
  }

  return trimSentence(
    categoryName
      ? `Shop ${product.name} from our ${categoryName} collection at Easy Jackets. Premium materials, custom styling, and worldwide shipping.`
      : `Shop ${product.name} at Easy Jackets. Premium quality materials, custom styling, and worldwide shipping.`
  );
};

const needsValue = (value) => !cleanText(value);

const run = async () => {
  await mongoose.connect(process.env.MONGO_URL);

  const products = await productModel
    .find({
      $or: [
        { metaTitle: { $exists: false } },
        { metaTitle: "" },
        { metaDescription: { $exists: false } },
        { metaDescription: "" },
        { metaDescription: /<[^>]+>|&nbsp;|&amp;|&quot;|&#39;|&lt;|&gt;/i },
      ],
    })
    .select("name metaTitle metaDescription shortdescription description category")
    .populate("category", "name")
    .lean();

  let changed = 0;

  for (const product of products) {
    const update = {};

    if (needsValue(product.metaTitle)) {
      update.metaTitle = cleanProductTitle(product.name);
    }

    if (needsValue(product.metaDescription) || needsSeoCleanup(product.metaDescription)) {
      update.metaDescription = buildDescription(product);
    }

    if (!Object.keys(update).length) continue;
    changed += 1;

    if (shouldWrite) {
      await productModel.updateOne({ _id: product._id }, { $set: update });
    }
  }

  console.log(
    shouldWrite
      ? `Updated SEO title/description for ${changed} products.`
      : `Dry run: ${changed} products would get SEO title/description. Run with --write to update.`
  );

  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
