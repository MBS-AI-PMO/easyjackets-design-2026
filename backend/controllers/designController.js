import Design from "../models/design.js";
import mongoose from "mongoose";
import Category from "../models/CategoryModel.js";
import Material from "../models/material.js";
import Color from "../models/color.js"
import Part from '../models/part.js'
import Size from '../models/size.js'
import Closure from '../models/closure.js'
import Collar from '../models/collars.js'
import Pocket from '../models/pockets.js'
import Lining from '../models/lining.js'
import DesignType from '../models/designsType.js'
import User from '../models/userModel.js'
import CustomCart from "../models/customCart.js";
import JWT from 'jsonwebtoken'
import { sendEmail } from "../helpers/email.js";
import productModel from "../models/productModel.js";
import path from 'path';
import { fileURLToPath } from 'url';
import uploadToS3, { bufferToS3, getPublicFileUrl } from '../helpers/fileUpload.js'
import moment from "moment/moment.js";
import { sendFileEmail } from "../helpers/fileEmail.js";
import { designReviewUrl, resumeDesignUrl } from "../helpers/customJacketUrl.js";
import formidable from "formidable";

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const designImageUrls = (req, {
  custom_image,
  custom_image_back,
  custom_image_left,
  custom_image_right,
}) => ({
  custom_image: getPublicFileUrl(custom_image, req),
  custom_image_back: getPublicFileUrl(custom_image_back, req),
  custom_image_left: getPublicFileUrl(custom_image_left, req),
  custom_image_right: getPublicFileUrl(custom_image_right, req),
});

// all Materials , colors , parts , Size
export const getDesignDataByCategoryCode = async (req, res) => {
  try {

    const getCategory = await Category.findOne({ code: req.query.code })
    const { section } = req.query;
    let categoryFilter = {};
    if (section) {
      categoryFilter.section = section;
    }
    const getAllCategory = await Category.find(categoryFilter)
    const getMaterials = await Material.find()
    const getColors = await Color.find({ isActive: true })
    const getParts = await Part.find()
    const getSizes = await Size.find()
    const getClosure = await Closure.find()
    const getCollar = await Collar.find()
    const getPocket = await Pocket.find()
    const getLining = await Lining.find()
    const getdesignType = await DesignType.find()


    const materialPrice = getMaterials.reduce(
      (acc, item) => {
        const bodyPrice = item["body-price"] || 0;
        const sleevesPrice = item["sleeves-price"] || 0;
        const materialKey = item.name.toLowerCase().replace(/\s+/g, ""); // Normalize the name to a consistent format

        acc.body[materialKey] = bodyPrice;
        acc.sleeves[materialKey] = sleevesPrice;

        return acc;
      },
      { body: {}, sleeves: {} } // Initial structure
    );

    const closurePrice = getClosure.reduce((acc, item) => {
      const closureKey = item.name.toLowerCase().replace(/\s+/g, ""); // Normalize name
      acc[closureKey] = item.price || 0; // Assign price
      return acc;
    }, {});

    const collarPrice = getCollar.reduce((acc, item) => {
      const collarKey = item.name.toLowerCase().replace(/\s+/g, ""); // Normalize name
      acc[collarKey] = item.price || 0; // Assign price
      return acc;
    }, {});


    const pocketPrice = getPocket.reduce((acc, item) => {
      const pocketKey = item.name.toLowerCase().replace(/\s+/g, ""); // Normalize name
      acc[pocketKey] = item.price || 0; // Assign price
      return acc;
    }, {});

    const liningPrice = getLining.reduce((acc, item) => {
      const liningKey = item.name.toLowerCase().replace(/\s+/g, ""); // Normalize name
      acc[liningKey] = item.price || 0; // Assign price
      return acc;
    }, {});

    const designPrice = getdesignType.reduce((acc, item) => {
      const designKey = item.name.toLowerCase().replace(/\s+/g, ""); // Normalize name
      acc[designKey] = item.price || 0; // Assign price
      return acc;
    }, {});

    const sizePrice = getSizes.reduce((acc, item) => {
      const sizeKey = item.size.toLowerCase().replace(/\s+/g, ""); // Normalize name
      acc[sizeKey] = item.price || 0; // Assign price
      return acc;
    }, {});

    return res.status(200).json({
      success: true,
      message: "design fetched",
      category: getCategory,
      materials: getMaterials,
      colors: getColors,
      sizes: getSizes,
      parts: getParts,
      allCategory: getAllCategory,
      materialPrice,
      closurePrice,
      collarPrice,
      pocketPrice,
      designPrice,
      liningPrice,
      sizePrice
    })
  }
  catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Eror while getitng design",
      error,
    });
  }
}


// save design and then save cart
export const save_design_to_cart = async (req, res) => {
  try {
    let { categoryCode, product_qty, custom_image, custom_image_back, custom_image_left, custom_image_right, ...rest } = req.body

    const findCategory = await Category.findOne({ code: categoryCode })

    if (!findCategory) {
      return res.status(404).json({
        success: 'false',
        message: 'failed to fetch category'
      })
    }

    custom_image = await bufferToS3(custom_image)
    custom_image_back = await bufferToS3(custom_image_back)
    custom_image_left = await bufferToS3(custom_image_left)
    custom_image_right = await bufferToS3(custom_image_right)

    const save_design = await Design.create({
      categoryCode,
      ...designImageUrls(req, { custom_image, custom_image_back, custom_image_left, custom_image_right }),
      ...rest
    })

    const addTocart = await CustomCart.create({
      // userId,
      categoryId: findCategory._id,
      designId: save_design._id,
      product_qty
    })

    return res.status(200).json({
      success: 'true',
      message: 'add to cart',
      id: addTocart._id
    })
  }
  catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Eror while saving design",
      error,
    });
  }
}

export const save_images = async (req, res) => {

  const form = formidable({});
  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).send('Error parsing the files.');
    }
    try {
      const file = files.file[0];
      const url = await uploadToS3(file)
      return res.status(200).json({
        success: 'true',
        message: 'saved images',
        url: getPublicFileUrl(url, req)
      })
    }
    catch (error) {
      console.log(error);
      return res.status(500).send({
        success: false,
        message: "Eror while saving design",
        error,
      })
    }
  })

}

export const save_design_to_product = async (req, res) => {
  try {
    const { productId } = req.query

    let { categoryCode, product_qty, custom_image, custom_image_back, custom_image_left, custom_image_right, ...rest } = req.body

    const findCategory = await Category.findOne({ code: categoryCode })

    if (!findCategory) {
      return res.status(404).json({
        success: 'false',
        message: 'failed to fetch category'
      })
    }

    if (!productId || !mongoose.Types.ObjectId.isValid(String(productId))) {
      return res.status(400).json({
        success: false,
        message: 'Valid productId is required to save this custom design.'
      });
    }

    const product = await productModel.findById(productId).select('_id');
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found for this custom design.'
      });
    }

    custom_image = await bufferToS3(custom_image)
    custom_image_back = await bufferToS3(custom_image_back)
    custom_image_left = await bufferToS3(custom_image_left)
    custom_image_right = await bufferToS3(custom_image_right)

    const save_design = await Design.create({
      categoryCode,
      ...designImageUrls(req, { custom_image, custom_image_back, custom_image_left, custom_image_right }),
      ...rest
    })

    await productModel.findByIdAndUpdate(
      product._id,
      { designId: save_design._id },
      { new: true }
    );

    return res.status(200).json({
      success: 'true',
      message: 'design saved to product',
    })
  }
  catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Eror while saving design",
      error,
    });
  }
}

// getCart 

//change this
export const getCartById = async (req, res) => {
  try {
    const { cartId } = req.params

    const getCart = await CustomCart.findOne({ _id: cartId }).populate('designId')

    return res.status(200).json({
      success: 'true',
      message: 'getCart',
      data: getCart
    })
  }
  catch (err) {
    return res.status(500).send({
      success: false,
      message: "Eror while saving design",
      err,
    });
  }
}

// update Cart 

export const updateCart = async (req, res) => {
  try {
    const { cartId } = req.params

    const findCart = await CustomCart.findOne({ _id: cartId })

    const updateDesign = await Design.findOneAndUpdate({ _id: findCart.designId }, { ...req.body }, { runValidators: true })

    return res.status(200).json({
      success: 'true',
      message: 'update Cart',
      data: updateDesign
    })
  }
  catch (err) {
    return res.status(500).send({
      success: false,
      message: "Eror while saving design",
      err,
    });
  }
}
// Every jacket in `jackets` carries the four rendered views as base64 on top of
// the configuration, which is roughly 250 KB of the ~280 KB this endpoint used
// to return. Nothing reads them back: the storefront shows custom_image*, and
// the customiser restores from jackets[].data and re-renders its own snapshots
// (getSvg -> saveSvg) before every save. They stay in the database as the copy
// the images can be rebuilt from — they just stop going over the wire.
const DESIGN_SNAPSHOT_FIELDS = {
  'jackets.front': 0,
  'jackets.back': 0,
  'jackets.left': 0,
  'jackets.right': 0,
};

export const getDesignById = async (req, res) => {
  const { designId } = req.params
  const getDesign = await Design.findOne({ _id: designId }, DESIGN_SNAPSHOT_FIELDS)

  return res.status(200).json({
    success: 'true',
    message: 'getDesign',
    data: getDesign
  })
}

export const updateDesign = async (req, res) => {
  try {
    const { designId } = req.params
    let { custom_image, custom_image_back, custom_image_left, custom_image_right, ...rest } = req.body

    const findDesign = await Design.findOne({ _id: designId })
    custom_image = await bufferToS3(custom_image, findDesign.custom_image)
    custom_image_back = await bufferToS3(custom_image_back, findDesign.custom_image_back)
    custom_image_left = await bufferToS3(custom_image_left, findDesign.custom_image_left)
    custom_image_right = await bufferToS3(custom_image_right, findDesign.custom_image_right)

    const updateDesign = await Design.findOneAndUpdate({ _id: designId }, {
      ...designImageUrls(req, { custom_image, custom_image_back, custom_image_left, custom_image_right }),
      ...rest
    }, { runValidators: true })

    return res.status(200).json({
      success: 'true',
      message: 'update design',
      data: updateDesign
    })
  }
  catch (err) {
    return res.status(500).send({
      success: false,
      message: "Eror while saving design",
      err,
    });
  }
}


// update cart and adds userId
export const getAllCustomCart = async (req, res) => {
  try {
    const { carts } = req.body
    // if(carts) {
    //     for(let cart in carts){
    //         await CustomCart.findOneAndUpdate({_id : cart}, {userId : req.user._id} , { runValidators : true})
    //     }
    //    }
    const getCart = await CustomCart.find({ _id: { $in: [...carts] } }).populate({
      path: 'designId',
      model: 'design',
      select: {
        _id: 1,
        custom_image: 1,
        custom_price: 1,
        globals: 1,
        sizes: 1
      }
    })
    return res.status(200).json({
      success: 'true',
      message: 'getCart',
      data: getCart
    })
  }
  catch (err) {
    return res.status(500).send({
      success: false,
      message: "Eror while saving design",
      err,
    });
  }
}

// The share email's "Continue Designing" button has to drop the customer back on
// the exact jacket they configured, and the customiser only rehydrates from a
// saved design id (?design=<id> -> getSetProduct). Sharing never persisted
// anything, so snapshot the payload here purely to have something to link to.
// Deliberately no CustomCart row: this is a bookmark, not an order.
const snapshotSharedDesign = async (req, design = {}) => {
  const categoryCode = design.categoryCode || design.globals?.productId || design.product_id;
  if (!categoryCode) return null;

  // Back/left/right can legitimately be missing - the customiser does not await
  // every view render before it assembles the payload. Only the front is
  // required by the schema, so bail rather than write a half-built document.
  const isImage = (value) => /^data:image\//i.test(String(value || ''));
  // shared again from the storefront's design page: the design is already saved, so link to it
  if (!isImage(design.custom_image) && /^[0-9a-f]{24}$/i.test(String(design._id || ''))) {
    return (await Design.exists({ _id: design._id })) ? { designId: String(design._id), categoryCode: String(categoryCode) } : null;
  }
  if (!isImage(design.custom_image)) return null;

  const upload = async (value) => (isImage(value) ? bufferToS3(value) : undefined);

  const [custom_image, custom_image_back, custom_image_left, custom_image_right] = await Promise.all([
    upload(design.custom_image),
    upload(design.custom_image_back),
    upload(design.custom_image_left),
    upload(design.custom_image_right),
  ]);

  // Unknown keys (product_id, product_qty) are dropped by the schema.
  const saved = await Design.create({
    ...design,
    categoryCode: String(categoryCode),
    ...designImageUrls(req, { custom_image, custom_image_back, custom_image_left, custom_image_right }),
  });

  return { designId: saved._id, categoryCode: String(categoryCode) };
};

export const shareDesign = async (req, res) => {
  try {
    const { name, email, design } = req.body

    // A failed snapshot costs the resume link, not the email - fall back to the
    // studio landing page and still send the design.
    let snapshot = null;
    try {
      snapshot = await snapshotSharedDesign(req, design);
    } catch (error) {
      console.error("Could not snapshot the shared design - the email will link to the studio instead:".yellow, error?.message);
    }

    const jacket = String(design?.globals?.catName || 'Jacket').trim().replace(/s$/i, '')
    const result = await sendFileEmail(
      `Your custom ${jacket.toLowerCase()} design · Easy Jackets`,
      email,
      { ...design, shareName: name },
      '/views/design.ejs',
      {
        resumeUrl: resumeDesignUrl(snapshot?.designId, snapshot?.categoryCode),
        reviewUrl: designReviewUrl(snapshot?.designId),
      }
    )

    return res.status(200).json({
      success: 'true',
      message: 'send email',
      skipped: Boolean(result?.skipped),
      pdfAttached: Boolean(result?.pdfAttached),
      // Surfaced so a missing PDF can be diagnosed from the response instead of
      // needing shell access to the container logs.
      pdfError: result?.pdfError || null,
      designId: snapshot?.designId || null,
    })
  }
  catch (err) {
    console.error("shareDesign failed:".red, err?.message, err?.stack)
    return res.status(500).send({
      success: false,
      message: "Eror while sharing design",
      // An Error's message and code are non-enumerable, so serialising `err`
      // alone produced an empty object and made this impossible to diagnose.
      error: err?.message,
      code: err?.code,
    });
  }
}
