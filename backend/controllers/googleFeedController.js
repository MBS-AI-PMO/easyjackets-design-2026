import productModel from "../models/productModel.js";

const BASE_URL = "https://easyjackets.com";
const STORE_NAME = "Easy Jackets";

/**
 * Escapes special XML characters in a string.
 */
const escapeXml = (str = "") =>
  String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

/**
 * Strips HTML tags from shortdescription / description fields.
 */
const stripHtml = (html = "") =>
  String(html).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

const toAbsoluteUrl = (value = "") => {
  const input = String(value || "").trim();
  if (!input) return "";
  if (/^https?:\/\//i.test(input)) return input;
  return `${BASE_URL}${input.startsWith("/") ? input : `/${input}`}`;
};

/**
 * Calculates the final discounted price.
 * discountPrice field stores the discount PERCENTAGE (e.g. 20 = 20% off).
 */
const getFinalPrice = (standardPrice = 0, discountPrice = 0) => {
  const base = Number(standardPrice) || 0;
  const discountPct = Number(discountPrice) || 0;
  if (discountPct > 0 && discountPct < 100) {
    return (base - (base * discountPct) / 100).toFixed(2);
  }
  return base.toFixed(2);
};

/**
 * GET /api/v1/product/google-feed
 * Returns a Google Merchant Center-compatible RSS 2.0 XML product feed.
 * No authentication required — Google fetches this directly.
 */
export const googleShoppingFeed = async (req, res) => {
  try {
    // isActive: { $ne: false } includes products where isActive is true OR undefined
    const products = await productModel
      .find({ isActive: { $ne: false } })
      .populate("category")
      .populate("color")
      .sort({ createdAt: -1 });

    console.log(`[Google Feed] Total products fetched: ${products.length}`);

    const items = products
      .filter((p) => p.name && p.slug && p.frontImage && p.standardPrice > 0)
      .map((p) => {
        const basePrice = (Number(p.standardPrice) || 0).toFixed(2);
        const discountPct = Number(p.discountPrice) || 0;
        const hasSale = discountPct > 0 && discountPct < 100;
        const salePrice = hasSale ? getFinalPrice(p.standardPrice, p.discountPrice) : null;
        const productUrl = `${BASE_URL}/product/${encodeURIComponent(String(p.slug).toLowerCase())}`;
        const title = escapeXml(p.name);
        const description = escapeXml(
          stripHtml(p.shortdescription || p.description || p.name)
        );
        const imageLink = escapeXml(toAbsoluteUrl(p.frontImage));
        const categoryName = escapeXml(p.category?.name || "Jackets");
        const sku = escapeXml(p.sku || p._id.toString());
        const brand = escapeXml(STORE_NAME);

        // Build additional image links (max 10 allowed by Google)
        const additionalImages = (p.otherImages || [])
          .slice(0, 9)
          .map(
            (img) =>
              `<g:additional_image_link>${escapeXml(toAbsoluteUrl(img))}</g:additional_image_link>`
          )
          .join("\n        ");

        const fallbackSizes = [
          "XXS", "XS", "S", "M", "M/TALL", "L", "L/TALL",
          "XL", "XL/TALL", "2XL", "2XL/TALL", "3XL", "4XL", "5XL", "6XL"
        ];
        const productSizes = Array.isArray(p.sizes) && p.sizes.length
          ? p.sizes.map((item) => item?.size).filter(Boolean)
          : fallbackSizes;

        const sizeEntries = productSizes
          .map((s) => `<g:size>${escapeXml(s)}</g:size>`)
          .join("\n        ");

        return `
    <item>
      <g:id>${escapeXml(p._id.toString())}</g:id>
      <g:title>${title}</g:title>
      <g:description>${description}</g:description>
      <g:link>${productUrl}</g:link>
      <g:image_link>${imageLink}</g:image_link>
      ${additionalImages}
      <g:condition>new</g:condition>
      <g:availability>in stock</g:availability>
      <g:price>${basePrice} USD</g:price>${hasSale ? `\n      <g:sale_price>${salePrice} USD</g:sale_price>` : ""}
      <g:brand>${brand}</g:brand>
      <g:mpn>${sku}</g:mpn>
      <g:google_product_category>5598</g:google_product_category>
      <g:product_type>${categoryName}</g:product_type>
      <g:item_group_id>${escapeXml(p.slug || p._id.toString())}</g:item_group_id>
      <g:color>${escapeXml(p.color?.name || "Multicolor")}</g:color>
      <g:gender>${categoryName.toLowerCase().includes("ladies") ? "female" : "unisex"}</g:gender>
      <g:age_group>adult</g:age_group>
      <g:material>${escapeXml(p.material?.body || "Leather")}</g:material>
      <g:pattern>Solid</g:pattern>
      <g:identifier_exists>false</g:identifier_exists>
      <g:shipping>
        <g:country>US</g:country>
        <g:service>Free Shipping</g:service>
        <g:price>0 USD</g:price>
      </g:shipping>
      ${sizeEntries}
      <g:size_type>regular</g:size_type>
      <g:size_system>US</g:size_system>
    </item>`;
      })
      .join("");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${escapeXml(STORE_NAME)}</title>
    <link>${BASE_URL}</link>
    <description>Premium custom varsity and letterman jackets from ${escapeXml(STORE_NAME)}.</description>
    ${items}
  </channel>
</rss>`;

    res.set("Content-Type", "application/xml; charset=utf-8");
    res.set("Cache-Control", "public, max-age=3600"); // Cache for 1 hour
    return res.status(200).send(xml);
  } catch (error) {
    console.error("Google Feed Error:", error);
    return res.status(500).json({ success: false, message: "Error generating feed", error: error.message });
  }
};
