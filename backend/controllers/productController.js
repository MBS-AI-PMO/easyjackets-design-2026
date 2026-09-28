import mongoose from "mongoose";
import path from "path";
import { UPLOADS_ROOT } from "../helpers/localUploadStorage.js";
import productModel from "../models/productModel.js";
import CategoryModel from "../models/CategoryModel.js";
import ColorModel from "../models/color.js";
import fs from "fs";
import slugify from "slugify";
import orderModel from "../models/orderModel.js";
import Design from "../models/design.js";
import randomString from 'randomstring'
import formidable from "formidable";
import uploadToS3 from "../helpers/fileUpload.js";
import addWatermark from "../helpers/watermark.js";
import { queueProductCutout } from "../helpers/backgroundRemoval.js";
import gateway from "../config/braintree.js";

const escapeRegex = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const isObjectId = (value = "") => /^[0-9a-fA-F]{24}$/.test(value);

const resolveCategoryId = async (categoryValue) => {
  if (!categoryValue) return null;
  const trimmed = categoryValue.toString().trim();
  if (!trimmed) return null;

  if (isObjectId(trimmed)) return trimmed;

  const category = await CategoryModel.findOne({
    $or: [
      { slug: trimmed.toLowerCase() },
      { name: new RegExp(`^${escapeRegex(trimmed.replace(/-/g, ' '))}$`, 'i') },
    ],
  }).select('_id');

  return category?._id || null;
};

const resolveColorId = async (colorValue) => {
  if (!colorValue) return null;
  const trimmed = colorValue.toString().trim();
  if (!trimmed) return null;

  if (isObjectId(trimmed)) return trimmed;

  const colorName = trimmed.replace(/-/g, " ");
  const color = await ColorModel.findOne({
    $or: [
      { id: trimmed },
      { name: new RegExp(`^\\s*${escapeRegex(colorName)}\\s*$`, "i") },
    ],
  }).select("_id");

  return color?._id || null;
};

const normalizeMaterialFilter = (value = "") =>
  value.toString().trim().replace(/-/g, " ");

const normalizeSizeFilter = (value = "") =>
  value.toString().trim().replace(/-tall$/i, "/TALL").toUpperCase();

const sendEmptyProductFilterResponse = (res, page = 1, limit = 8) => {
  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.max(parseInt(limit, 10) || 8, 1);

  return res.status(200).send({
    success: true,
    totalPages: 1,
    totalProducts: 0,
    total: 0,
    count: 0,
    products: [],
    currentPage: pageNum,
    limit: limitNum,
  });
};

const cleanSeoText = (value = "") =>
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
  cleanSeoText(value).replace(/\s*[-|]\s*Easy Jackets?$/i, "").trim();

const normalizeProductSlug = (value = "") =>
  slugify(cleanProductTitle(value) || "product", {
    lower: true,
    strict: true,
    trim: true,
  }) || "product";

const buildUniqueProductSlug = async (source, excludeId = null) => {
  const base = normalizeProductSlug(source);
  let candidate = base;
  let counter = 2;

  while (true) {
    const filter = { slug: new RegExp(`^${escapeRegex(candidate)}$`, "i") };
    if (excludeId) filter._id = { $ne: excludeId };
    const existing = await productModel.exists(filter);
    if (!existing) return candidate;
    candidate = `${base}-${counter}`;
    counter += 1;
  }
};

const buildUniqueProductName = async (source, excludeId = null) => {
  const base = cleanProductTitle(source) || "Product";
  let candidate = base;
  let counter = 2;

  while (true) {
    const filter = { name: new RegExp(`^${escapeRegex(candidate)}$`, "i") };
    if (excludeId) filter._id = { $ne: excludeId };
    const existing = await productModel.exists(filter);
    if (!existing) return candidate;
    candidate = `${base} ${counter}`;
    counter += 1;
  }
};

const trimMetaDescription = (value = "", maxLength = 155) => {
  const text = cleanSeoText(value);
  if (text.length <= maxLength) return text;

  const clipped = text.slice(0, maxLength - 1);
  const lastSpace = clipped.lastIndexOf(" ");
  return `${clipped.slice(0, lastSpace > 80 ? lastSpace : clipped.length).trim()}.`;
};

const needsSeoValue = (value) => !cleanSeoText(value);
const needsSeoCleanup = (value = "") => /<[^>]+>|&nbsp;|&amp;|&quot;|&#39;|&lt;|&gt;/i.test(String(value));

const buildProductMetaDescription = (product) => {
  const categoryName = cleanSeoText(product.category?.name);
  const source = cleanSeoText(product.metaDescription)
    || cleanSeoText(product.shortdescription)
    || cleanSeoText(product.description);

  if (source) {
    const suffix = categoryName && !source.toLowerCase().includes(categoryName.toLowerCase())
      ? ` Available in our ${categoryName} collection.`
      : "";
    return trimMetaDescription(`${source}${suffix}`);
  }

  const title = cleanProductTitle(product.name);
  return trimMetaDescription(
    categoryName
      ? `Shop ${title} from our ${categoryName} collection at Easy Jackets. Premium materials, custom styling, and worldwide shipping.`
      : `Shop ${title} at Easy Jackets. Premium quality materials, custom styling, and worldwide shipping.`
  );
};

export const createDraftProduct = async (req, res) => {
  try {
    const createProduct = await productModel.create({
      category: req.params.cid, sku: randomString.generate({
        length: 7,
        charset: ['alphanumeric', '-']
      })
    })

    return res.status(201).send({
      success: true,
      message: "Product Created Successfully",
      product: createProduct
    });
  }
  catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in crearing product",
    });
  }
}

export const createProductController = async (req, res) => {
  const form = formidable({});
  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).send('Error parsing the files.');
    }


    try {
      // Handle front image
      let data;
      if (files.frontImage || files.otherImages) {
        let frontImageUrl = ''
        if (files.frontImage) {
          const buffer = await addWatermark(files.frontImage[0])
          const frontImageFile = files.frontImage[0];
          const url = await uploadToS3(frontImageFile, null, buffer)
          queueProductCutout(url) // background removed afterwards; the file keeps its URL
          frontImageUrl = `${process.env.AWS_FILE_PATH}${url}`;
        }
        // Handle additional images
        let additionalImageUrls = [];
        if (files.otherImages) {

          const additionalImageFiles = [...files.otherImages] || [];

          for (const file of additionalImageFiles) {
            const buffer = await addWatermark(file)
            const url = await uploadToS3(file, null, buffer)
            queueProductCutout(url)
            additionalImageUrls.push(process.env.AWS_FILE_PATH + url);
          }
        }
        data = {
          name: fields.name[0],
          slug: await buildUniqueProductSlug(fields.name[0]),
          description: fields.description[0],
          careInstructions: fields.careInstructions?.[0] || '',
          shortdescription: fields.shortdescription[0],
          metaTitle: fields.metaTitle[0],
          metaDescription: fields.metaDescription[0],
          sku: fields.name[0] + randomString.generate({
            length: 7,
            charset: ['alphanumeric', '-']
          }),
          standardPrice: fields.standardPrice[0],
          discountPrice: fields.discountPrice[0],
          color: fields.color[0] || null,
          imageAlt: fields.imageAlt[0],
          category: fields.category[0],
          material: {
            body: JSON.parse(fields.material[0]).body,
            sleeves: JSON.parse(fields.material[0]).sleeves
          },
          sizes: [...JSON.parse(fields.sizes[0])]
        }

        if (frontImageUrl) {
          data.frontImage = frontImageUrl
        }
        if (additionalImageUrls?.length !== 0) {
          data.otherImages = [...additionalImageUrls]
        }

      }
      else {
        data = {
          name: fields.name[0],
          slug: await buildUniqueProductSlug(fields.name[0]),
          description: fields.description[0],
          careInstructions: fields.careInstructions?.[0] || '',
          shortdescription: fields.shortdescription[0],
          metaTitle: fields.metaTitle[0],
          metaDescription: fields.metaDescription[0],
          sku: randomString.generate({
            length: 7,
            charset: ['alphanumeric', '-']
          }),
          standardPrice: Number(fields.standardPrice[0]),
          discountPrice: Number(fields.discountPrice[0]),
          color: fields.color[0] || null,
          imageAlt: fields.imageAlt[0],
          category: fields.category[0],
          material: {
            body: JSON.parse(fields.material[0]).body,
            sleeves: JSON.parse(fields.material[0]).sleeves
          },
          sizes: [...JSON.parse(fields.sizes[0])]
        }
      }
      await productModel.create(data);


      return res.status(200).json({
        success: true,
        message: "product created successfully"
      });
    } catch (err) {
      console.log(err)
      res.status(500).send({
        success: false,
        message: "Error creating product",
        error: err.message
      });
    }
  });
};

//get all products
export const getProductController = async (req, res) => {
  try {
    const { page, limit, category, color, sku } = req.query

    let filter = {};

    if (category) {
      const categoryId = await resolveCategoryId(category);
      if (!categoryId) {
        return sendEmptyProductFilterResponse(res, page, limit);
      }
      filter.category = categoryId;
    }

    if (color) {
      filter.color = color;
    }

    if (sku) {
      filter.sku = sku
    }

    const { section } = req.query;
    if (!category && section) {
      let catFilter = {};
      if (section === 'jackets') {
        catFilter.$or = [{ section: 'jackets' }, { section: { $exists: false } }];
      } else {
        catFilter.section = section;
      }
      const categoriesInSection = await CategoryModel.find(catFilter);
      const categoryIds = categoriesInSection.map(cat => cat._id);
      filter.category = { $in: categoryIds };
    }

    const products = await productModel.find(filter).skip(page ? (page - 1) * limit : 1).limit(limit ? limit : 8).populate('color').populate('category').sort({ createdAt: -1 });
    const totalProducts = await productModel.countDocuments(filter);
    res.status(200).send({
      success: true,
      totalPages: Math.ceil(totalProducts / limit),
      totalProducts,
      products,
      currentPage: page,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Erorr in getting products",
      error: error.message,
    });
  }
};

export const duplicateProduct = async (req, res) => {
  try {
    const { id } = req.params
    const product = await productModel
      .findById(id)
      .populate('designId')
      .lean();

    if (!product) {
      return res.status(404).send({
        success: false,
        message: "Product not found",
      });
    }

    let designId = undefined;
    if (product.designId && typeof product.designId === 'object') {
      const { _id, createdAt, updatedAt, __v, ...designData } = product.designId;
      const newDesign = await Design.create(designData);
      designId = newDesign._id;
    }

    const { _id, createdAt, updatedAt, __v, designId: _oldDesignId, ...productData } = product;
    const name = await buildUniqueProductName(`${product.name || "Product"} Copy`);
    const slug = await buildUniqueProductSlug(name);

    const duplicateproduct = await productModel.create({
      ...productData,
      name,
      slug,
      ...(designId ? { designId } : {}),
    });

    return res.status(200).send({
      success: true,
      message: "duplicate product",
      product: duplicateproduct,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "duplicate single product",
      error,
    });
  }
}

export const backfillProductSeoController = async (req, res) => {
  try {
    const products = await productModel
      .find({})
      .select("name metaTitle metaDescription imageAlt shortdescription description category")
      .populate("category", "name");

    let updated = 0;
    let titles = 0;
    let descriptions = 0;
    let imageAlts = 0;

    for (const product of products) {
      const update = {};

      if (needsSeoValue(product.metaTitle)) {
        update.metaTitle = cleanProductTitle(product.name);
        titles += 1;
      }

      if (needsSeoValue(product.metaDescription) || needsSeoCleanup(product.metaDescription)) {
        update.metaDescription = buildProductMetaDescription(product);
        descriptions += 1;
      }

      if (needsSeoValue(product.imageAlt)) {
        update.imageAlt = cleanProductTitle(product.name);
        imageAlts += 1;
      }

      if (!Object.keys(update).length) continue;

      await productModel.updateOne({ _id: product._id }, { $set: update });
      updated += 1;
    }

    res.status(200).send({
      success: true,
      message: `Generated clean SEO metadata for ${updated} products.`,
      updated,
      titles,
      descriptions,
      imageAlts,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while generating product SEO metadata",
      error,
    });
  }
};

// get single product
export const getSingleProductController = async (req, res) => {
  try {
    const param = req.params.id;
    let product = await productModel
      .findOne({ slug: param })
      .populate("category")
      .populate("color");

    if (!product) {
      product = await productModel
        .findOne({ slug: new RegExp(`^${escapeRegex(param)}$`, "i") })
        .populate("category")
        .populate("color");
    }

    // Fall back to ObjectId lookup so legacy /product/<id> URLs resolve
    // and the frontend can 301 them to the slug-based canonical.
    if (!product && /^[a-f\d]{24}$/i.test(param)) {
      product = await productModel
        .findById(param)
        .populate("category")
        .populate("color");
    }

    res.status(200).send({
      success: true,
      message: "Single Product Fetched",
      product,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Eror while getitng single product",
      error,
    });
  }
};

// get photo
export const productPhotoController = async (req, res) => {
  try {
    const product = await productModel.findById(req.params.pid).select("photo");
    const { index } = req.params
    if (product.photo[index].data) {
      res.set("Content-type", product.photo[index].contentType);
      return res.status(200).send(product.photo[index].data);
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Erorr while getting photo",
      error,
    });
  }
};

//delete controller
export const deleteProductController = async (req, res) => {
  try {
    const deleteProduct = await productModel.findOneAndDelete({ _id: req.params.pid })

    if (deleteProduct?.designId) {
      await Design.findOneAndDelete({ _id: deleteProduct.designId })
    }
    res.status(200).send({
      success: true,
      message: "Product Deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while deleting product",
      error,
    });
  }
};

//upate products
export const updateProductController = async (req, res) => {
  const form = formidable({});
  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).send('Error parsing the files.');
    }

    let data = {}
    try {
      // Handle front image
      if (files.frontImage || files.otherImages) {
        let frontImageUrl = ''
        if (files.frontImage) {
          const frontImageFile = files.frontImage[0];
          const buffer = await addWatermark(files.frontImage[0])
          const url = await uploadToS3(frontImageFile, null, buffer)
          queueProductCutout(url) // background removed afterwards; the file keeps its URL
          frontImageUrl = `${process.env.AWS_FILE_PATH}${url}`;
        }
        // Handle additional images
        let additionalImageUrls = [];
        if (files.otherImages) {
          const additionalImageFiles = [...files.otherImages] || [];

          for (const file of additionalImageFiles) {
            const buffer = await addWatermark(file)
            const url = await uploadToS3(file, null, buffer)
            queueProductCutout(url)

            additionalImageUrls.push(process.env.AWS_FILE_PATH + url);
          }
        }
        data = {
          name: fields.name[0],
          slug: await buildUniqueProductSlug(fields.name[0], req.params.pid),
          description: fields.description[0],
          careInstructions: fields.careInstructions?.[0] || '',
          shortdescription: fields.shortdescription[0],
          metaTitle: fields.metaTitle[0],
          metaDescription: fields.metaDescription[0],
          sku: fields.name[0] + randomString.generate({
            length: 7,
            charset: ['alphanumeric', '-']
          }),
          standardPrice: Number(fields.standardPrice[0]),
          discountPrice: Number(fields.discountPrice[0]),
          color: fields.color[0],
          imageAlt: fields.imageAlt[0],
          category: fields.category[0],
          material: {
            body: JSON.parse(fields.material[0]).body,
            sleeves: JSON.parse(fields.material[0]).sleeves
          },
          sizes: [...JSON.parse(fields.sizes[0])]
        }



        if (frontImageUrl) {
          data.frontImage = frontImageUrl
        }
        if (additionalImageUrls?.length !== 0) {
          data.otherImages = [...additionalImageUrls]
        }
      }
      else {
        data = {
          name: fields.name[0],
          slug: await buildUniqueProductSlug(fields.name[0], req.params.pid),
          description: fields.description[0],
          careInstructions: fields.careInstructions?.[0] || '',
          metaTitle: fields.metaTitle[0],
          metaDescription: fields.metaDescription[0],
          shortdescription: fields.shortdescription[0],
          sku: fields.name[0] + randomString.generate({
            length: 7,
            charset: ['alphanumeric', '-']
          }),
          standardPrice: Number(fields.standardPrice[0]),
          discountPrice: Number(fields.discountPrice[0]),
          color: fields.color[0],
          imageAlt: fields.imageAlt[0],
          category: fields.category[0],
          material: {
            body: JSON.parse(fields.material[0]).body,
            sleeves: JSON.parse(fields.material[0]).sleeves
          },
          sizes: [...JSON.parse(fields.sizes[0])]
        }
      }


      const products = await productModel.findByIdAndUpdate(
        req.params.pid,
        { ...data },
        { new: true }
      );

      return res.status(201).send({
        success: true,
        message: "Product Updated Successfully",
        products,
      });
    }
    catch (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        error,
        message: "Error in Update product",
      });
    }
  })
};


export const activateAndDeactivateProduct = async (req, res) => {
  try {
    const { isActive } = req.body
    const products = await productModel.findByIdAndUpdate(
      req.params.pid,
      { isActive },
      { new: true }
    )

    return res.status(201).send({
      success: true,
      message: "Product Updated Successfully",

    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in Update product",
    });
  }
}

// discountPrice is a percentage off standardPrice (the storefront's
// getProductPrice rule); priceFrom is the price a card shows; popularity
// orders "most popular".
const PCT_EXPR = { $cond: [{ $and: [{ $gt: ['$discountPrice', 0] }, { $lt: ['$discountPrice', 100] }] }, '$discountPrice', 0] };
const PRICE_STAGE = {
  $addFields: {
    discountPct: PCT_EXPR,
    priceFrom: { $round: [{ $multiply: [{ $ifNull: ['$standardPrice', 0] }, { $subtract: [1, { $divide: [PCT_EXPR, 100] }] }] }, 0] },
    popularity: { $add: [{ $ifNull: ['$views', 0] }, { $multiply: [{ $ifNull: ['$clicks', 0] }, 3] }] },
  },
};
// Ratings from approved reviews, so cards need no call per product; view=card
// leaves out the long-text fields.
const ratingStages = (view) => [
  {
    $lookup: {
      from: 'productreviews',
      let: { pid: '$_id' },
      pipeline: [
        { $match: { $expr: { $and: [{ $eq: ['$product', '$pid'] }, { $eq: ['$status', 'approved'] }] } } },
        { $group: { _id: null, avg: { $avg: '$rating' }, n: { $sum: 1 } } },
      ],
      as: 'reviewStats',
    },
  },
  {
    $addFields: {
      rating: { $round: [{ $ifNull: [{ $arrayElemAt: ['$reviewStats.avg', 0] }, 0] }, 1] },
      reviewCount: { $ifNull: [{ $arrayElemAt: ['$reviewStats.n', 0] }, 0] },
    },
  },
  { $project: { reviewStats: 0, ...(view === 'card' ? { description: 0, careInstructions: 0, metaTitle: 0, metaDescription: 0, metaKeywords: 0, ogImage: 0, shortdescription: 0 } : {}) } },
];

// The landing page in one query: two random bestsellers per jacket category
// (drawn from each category's most popular) and one random jacket for each
// "popular pick" (wool & leather, all-leather, all-wool, satin).
const LANDING_PICKS = {
  'wool-leather': { 'material.body': /wool/i, 'material.sleeves': /leather/i, name: { $not: /cropped|women/i } },
  leather: { 'material.body': /leather/i },
  wool: { 'material.body': /wool/i, 'material.sleeves': /wool/i, name: { $not: /cropped|women/i } },
  satin: { 'material.body': /satin/i },
};
// Category and colour come from the same aggregate (one round trip instead of
// a populate per list); the jacket category list is cached for a minute.
const refStages = () => [
  { $lookup: { from: CategoryModel.collection.name, localField: 'category', foreignField: '_id', as: 'category' } },
  { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
  { $lookup: { from: ColorModel.collection.name, localField: 'color', foreignField: '_id', as: 'color' } },
  { $unwind: { path: '$color', preserveNullAndEmptyArrays: true } },
];
let jacketCategoryCache = { at: 0, list: [] };
const jacketCategories = async () => {
  if (Date.now() - jacketCategoryCache.at > 60_000) {
    const list = await CategoryModel.find({ $or: [{ section: 'jackets' }, { section: { $exists: false } }] }).sort({ serial: 1, name: 1 }).select('_id name slug').lean();
    jacketCategoryCache = { at: Date.now(), list };
  }
  return jacketCategoryCache.list;
};
export const landingController = async (req, res) => {
  try {
    const perCategory = Math.min(Math.max(parseInt(req.query.perCategory, 10) || 2, 1), 4);
    const cats = await jacketCategories();
    const tail = [...ratingStages('card'), ...refStages()];
    const facets = {};
    for (const c of cats) facets[`cat_${c._id}`] = [{ $match: { category: c._id } }, { $sort: { popularity: -1, createdAt: -1 } }, { $limit: 24 }, { $sample: { size: perCategory } }, ...tail];
    for (const [key, match] of Object.entries(LANDING_PICKS)) facets[`pick_${key}`] = [{ $match: match }, { $sort: { popularity: -1, createdAt: -1 } }, { $limit: 24 }, { $sample: { size: 3 } }, ...tail];
    const [result] = await productModel.aggregate([PRICE_STAGE, { $facet: facets }]);
    const rounds = Array.from({ length: perCategory }, () => []);
    for (const c of cats) (result[`cat_${c._id}`] || []).forEach((p, i) => rounds[i].push(p));
    const bestsellers = rounds.flat();
    const used = new Set(bestsellers.map((p) => String(p._id)));
    const picks = {};
    for (const key of Object.keys(LANDING_PICKS)) {
      const pool = result[`pick_${key}`] || [];
      const chosen = pool.find((p) => !used.has(String(p._id))) || pool[0] || null;
      if (chosen) used.add(String(chosen._id));
      picks[key] = chosen;
    }
    res.status(200).send({ success: true, bestsellers, picks });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, message: 'Error building the landing page' });
  }
};

// How many products each category holds — the shop's category tabs.
export const productCategoryCountsController = async (req, res) => {
  try {
    const rows = await productModel.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]);
    const cats = await CategoryModel.find({ _id: { $in: rows.map((r) => r._id).filter(Boolean) } }).select('name slug section serial');
    const byId = new Map(cats.map((c) => [String(c._id), c]));
    const counts = rows
      .filter((r) => byId.has(String(r._id)))
      .map((r) => { const c = byId.get(String(r._id)); return { _id: r._id, name: c.name, slug: c.slug, section: c.section || 'jackets', serial: c.serial || 0, count: r.count }; })
      .sort((a, b) => a.serial - b.serial || a.name.localeCompare(b.name));
    res.status(200).send({ success: true, total: rows.reduce((n, r) => n + r.count, 0), counts });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, message: 'Error counting products by category' });
  }
};

export const productFiltersController = async (req, res) => {
  try {
    const { page, limit, category, color, slug, search, material, size } = req.query

    let filter = {};

    if (category) {
      const categoryId = await resolveCategoryId(category);
      if (!categoryId) {
        return sendEmptyProductFilterResponse(res, page, limit);
      }
      filter.category = categoryId;
    }

    if (color) {
      const colorId = await resolveColorId(color);
      if (!colorId) {
        return sendEmptyProductFilterResponse(res, page, limit);
      }
      filter.color = colorId;
    }

    const { section } = req.query;
    if (!category && section) {
      let catFilter = {};
      if (section === 'jackets') {
        catFilter.$or = [{ section: 'jackets' }, { section: { $exists: false } }];
      } else {
        catFilter.section = section;
      }
      const categoriesInSection = await CategoryModel.find(catFilter);
      const categoryIds = categoriesInSection.map(cat => cat._id);
      filter.category = { $in: categoryIds };
    }


    if (slug) {
      let category;
      if (slug === 'ladies-Varsity-Jackets') {
        category = await CategoryModel.findOne({ code: 4893 })
      }
      else {
        category = await CategoryModel.findOne({ slug })
      }
      filter.category = category?._id
    }

    const searchTerm = typeof search === 'string' ? search.trim() : '';
    if (searchTerm) {
      const searchRegex = new RegExp(escapeRegex(searchTerm), 'i');
      const [matchingCategories, matchingColors] = await Promise.all([
        CategoryModel.find({
          $or: [
            { name: searchRegex },
            { slug: searchRegex },
            { code: searchRegex },
          ],
        }).select('_id'),
        ColorModel.find({
          $or: [
            { name: searchRegex },
            { code: searchRegex },
            { id: searchRegex },
          ],
        }).select('_id'),
      ]);

      filter.$or = [
        { name: searchRegex },
        { slug: searchRegex },
        { description: searchRegex },
        { shortdescription: searchRegex },
        { metaTitle: searchRegex },
        { metaDescription: searchRegex },
        { imageAlt: searchRegex },
        { sku: searchRegex },
        { 'material.body': searchRegex },
        { 'material.sleeves': searchRegex },
      ];

      const categoryIds = matchingCategories.map((item) => item._id);
      if (categoryIds.length) filter.$or.push({ category: { $in: categoryIds } });

      const colorIds = matchingColors.map((item) => item._id);
      if (colorIds.length) filter.$or.push({ color: { $in: colorIds } });
    }

    const materialTerm = typeof material === 'string' ? normalizeMaterialFilter(material) : '';
    if (materialTerm) {
      const materialRegex = new RegExp(`^${escapeRegex(materialTerm)}$`, 'i');
      const materialFilter = [
        { 'material.body': materialRegex },
        { 'material.sleeves': materialRegex },
      ];
      if (filter.$or) {
        filter.$and = [{ $or: filter.$or }, { $or: materialFilter }];
        delete filter.$or;
      } else {
        filter.$or = materialFilter;
      }
    }

    const sizeTerm = typeof size === 'string' ? normalizeSizeFilter(size) : '';
    if (sizeTerm) {
      filter['sizes.size'] = new RegExp(`^${escapeRegex(sizeTerm)}$`, 'i');
    }

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 8, 1), 200);
    const { sort, minPrice, maxPrice, view } = req.query;

    const base = [{ $match: filter }, PRICE_STAGE];
    const priceMatch = {};
    if (minPrice !== undefined && minPrice !== '' && !Number.isNaN(Number(minPrice))) priceMatch.$gte = Number(minPrice);
    if (maxPrice !== undefined && maxPrice !== '' && !Number.isNaN(Number(maxPrice))) priceMatch.$lte = Number(maxPrice);
    if (Object.keys(priceMatch).length) base.push({ $match: { priceFrom: priceMatch } });

    const SORTS = {
      new: { createdAt: -1, _id: -1 },
      popular: { popularity: -1, createdAt: -1 },
      'price-asc': { priceFrom: 1, createdAt: -1 },
      'price-desc': { priceFrom: -1, createdAt: -1 },
      rating: { rating: -1, reviewCount: -1, createdAt: -1 },
    };
    const [docs, totals] = await Promise.all([
      productModel.aggregate([
        ...base,
        ...ratingStages(view),
        { $sort: SORTS[sort] || SORTS.new },
        { $skip: (pageNum - 1) * limitNum },
        { $limit: limitNum },
      ]),
      productModel.aggregate([...base, { $count: 'n' }]),
    ]);
    const products = await productModel.populate(docs, [{ path: 'color' }, { path: 'category' }]);
    const totalProducts = totals[0]?.n || 0;
    res.status(200).send({
      success: true,
      totalPages: Math.max(1, Math.ceil(totalProducts / limitNum)),
      totalProducts,
      total: totalProducts,
      products,
      currentPage: pageNum,
      limit: limitNum,
      sort: SORTS[sort] ? sort : 'new',
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error WHile Filtering Products",
      error,
    });
  }
};

// product count
export const productCountController = async (req, res) => {
  try {
    const total = await productModel.find({}).estimatedDocumentCount();
    res.status(200).send({
      success: true,
      total,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      message: "Error in product count",
      error,
      success: false,
    });
  }
};

// product list base on page
export const productListController = async (req, res) => {
  try {
    const { isActive } = req.query
    const perPage = 6;
    const page = req.params.page ? req.params.page : 1;
    const products = await productModel
      .find({ isActive })
      .populate("category").populate('designId')
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: -1 });

    return res.status(200).send({
      success: true,
      products
    });

  } catch (error) {
    res.status(400).send({
      success: false,
      message: "error in per page ctrl",
      error,
    });
  }
};

export const searchProductController = async (req, res) => {
  try {
    const { keyword } = req.params;
    const resutls = await productModel
      .find({
        $or: [
          { name: { $regex: keyword, $options: "i" } },
          { description: { $regex: keyword, $options: "i" } },
        ],
      })
      .select("-photo");
    res.json(resutls);
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error In Search Product API",
      error,
    });
  }
};

// similar products
export const realtedProductController = async (req, res) => {
  try {
    const { pid, cid } = req.params;
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 4, 1), 12); // the storefront shows a row of four
    // a fresh random set from the same category on every request (not always its first few)
    const products = await productModel.aggregate([
      { $match: { category: new mongoose.Types.ObjectId(String(cid)), _id: { $ne: new mongoose.Types.ObjectId(String(pid)) } } },
      { $sample: { size: limit } },
      { $project: { photo: 0 } },
    ]);
    await productModel.populate(products, { path: "category" });
    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "error while geting related product",
      error,
    });
  }
};

// get prdocyst by catgory
export const productCategoryController = async (req, res) => {
  try {
    const category = await CategoryModel.findOne({ slug: req.params.slug });
    const products = await productModel.find({ category }).populate("category");
    res.status(200).send({
      success: true,
      category,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      error,
      message: "Error While Getting products",
    });
  }
};

const braintreeOff = (res) => res.status(503).send({ success: false, message: "Braintree payments are not configured" });

export const braintreeTokenController = async (req, res) => {
  if (!gateway) return braintreeOff(res);
  try {
    gateway.clientToken.generate({}, function (err, response) {
      if (err) {
        res.status(500).send(err);
      } else {
        res.send(response);
      }
    });
  } catch (error) {
    console.log(error);
  }
};

//payment
export const brainTreePaymentController = async (req, res) => {
  if (!gateway) return braintreeOff(res);
  try {
    const { nonce, cart } = req.body;
    let total = 0;
    cart.map((i) => {
      total += i.price;
    });
    let newTransaction = gateway.transaction.sale(
      {
        amount: total,
        paymentMethodNonce: nonce,
        options: {
          submitForSettlement: true,
        },
      },
      function (error, result) {
        if (result) {
          const order = new orderModel({
            products: cart,
            payment: result,
            buyer: req.user._id,
          }).save();
          res.json({ ok: true });
        } else {
          res.status(500).send(error);
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
};

// --- PRODUCT ANALYTICS ---

// Record Product View
export const recordProductView = async (req, res) => {
  try {
    const product = await productModel.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate("category", "name").populate("color");

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.status(200).json({ success: true, message: "View recorded", product });
  } catch (error) {
    console.error("Error recording view:", error);
    res.status(500).json({ success: false, message: "Error recording view" });
  }
};

// Record Product Click
export const recordProductClick = async (req, res) => {
  try {
    const product = await productModel.findByIdAndUpdate(
      req.params.id,
      { $inc: { clicks: 1 } },
      { new: true }
    ).populate("category", "name").populate("color");

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.status(200).json({ success: true, message: "Click recorded", product });
  } catch (error) {
    console.error("Error recording click:", error);
    res.status(500).json({ success: false, message: "Error recording click" });
  }
};

// Get Top Performing Products
export const getTopProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const products = await productModel
      .find({})
      .sort({ views: -1, clicks: -1 })
      .limit(limit)
      .populate("category", "name")
      .populate("color");

    res.status(200).json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error("Error fetching top products:", error);
    res.status(500).json({ success: false, message: "Error fetching analytics" });
  }
};

// GET /product/filter-options?category=<slug|id>
// The materials and colours the catalogue's products are actually made in
// (within one category when given), so the shop's filters never offer a
// choice with no products behind it. Reads only.
export const productFilterOptionsController = async (req, res) => {
  try {
    const match = {};
    if (req.query.category) {
      const categoryId = await resolveCategoryId(req.query.category);
      if (!categoryId) return res.status(200).send({ success: true, materials: [], colors: [] });
      match.category = new mongoose.Types.ObjectId(String(categoryId));
    }
    const [materials, colors] = await Promise.all([
      productModel.aggregate([
        { $match: match },
        // body and sleeve materials, each product counted once per material
        { $project: { m: { $setUnion: [[{ $ifNull: ['$material.body', ''] }], [{ $ifNull: ['$material.sleeves', ''] }]] } } },
        { $unwind: '$m' },
        { $match: { m: { $type: 'string' } } },
        { $project: { m: { $trim: { input: '$m' } } } },
        { $match: { m: { $ne: '' } } },
        { $group: { _id: { $toLower: '$m' }, name: { $first: '$m' }, count: { $sum: 1 } } },
        { $sort: { count: -1, name: 1 } },
        { $project: { _id: 0, name: 1, count: 1 } },
      ]),
      productModel.aggregate([
        { $match: { ...match, color: { $ne: null } } },
        { $group: { _id: '$color', count: { $sum: 1 } } },
        { $lookup: { from: ColorModel.collection.name, localField: '_id', foreignField: '_id', as: 'c' } },
        { $unwind: '$c' },
        { $project: { _id: 1, name: '$c.name', code: '$c.code', count: 1 } },
        { $sort: { count: -1, name: 1 } },
      ]),
    ]);
    res.status(200).send({ success: true, materials, colors });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, message: 'Error listing filter options' });
  }
};

// GET /product/cutouts
// Upload keys of the product photos whose background has been removed, read
// from the file store: every cut-out keeps its untouched original beside it as
// <name>.original.<ext>. Lets the storefront drop the white box around photos
// that no longer need one, with no database field. Rescanned every 30 s.
let cutoutCache = { at: 0, keys: [], versions: {} };
export const productCutoutsController = async (req, res) => {
  try {
    if (Date.now() - cutoutCache.at > 30000) {
      const keys = [];
      const versions = {};
      const walk = async (dir) => {
        let entries = [];
        try { entries = await fs.promises.readdir(dir, { withFileTypes: true }); } catch { return; }
        for (const entry of entries) {
          const full = path.join(dir, entry.name);
          if (entry.isDirectory()) { if (!entry.name.startsWith('.')) await walk(full); }
          else if (/\.original\.[a-z0-9]+$/i.test(entry.name)) {
            const key = path.relative(UPLOADS_ROOT, full).split(path.sep).join('/').replace(/\.original(\.[a-z0-9]+)$/i, '$1');
            // the cut-out's own modification time versions its URL, so browsers that cached the
            // old photo at the same address (uploads are served immutable) fetch the new file
            let version = 0;
            try { version = Math.round((await fs.promises.stat(path.join(UPLOADS_ROOT, ...key.split('/')))).mtimeMs); } catch { /* replaced file missing: unversioned */ }
            keys.push(key);
            versions[key] = version;
          }
        }
      };
      await walk(UPLOADS_ROOT); // product photos live under products/ and, for older uploads, at the root
      cutoutCache = { at: Date.now(), keys, versions };
    }
    res.set('Cache-Control', 'public, max-age=30');
    res.status(200).send({ success: true, count: cutoutCache.keys.length, keys: cutoutCache.keys, versions: cutoutCache.versions });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, message: 'Error listing cut-outs' });
  }
};
