import mongoose from 'mongoose';
import productModel from '../models/productModel.js';
import Design from '../models/design.js';
import Material from '../models/material.js';
import Closure from '../models/closure.js';
import Collar from '../models/collars.js';
import Pocket from '../models/pockets.js';
import Lining from '../models/lining.js';
import DesignType from '../models/designsType.js';
import Size from '../models/size.js';
import { calculateShipping } from './shippingRates.js';

// The price of a cart, worked out here from the database: every checkout charges this, never the prices
// the browser sends (anyone could send $0.50 for a $400 jacket, or leave the shipping out).
//   shop product: its size's price (else its standard price), less its discount %, in whole dollars, as
//                 the storefront shows it (frontend/src/lib/catalog.js normalizeProduct)
//   builder design: the builder's own sum (custom-jacket/src/utils/index.js getPrice) over the design's
//                 saved options, with the same price list (its built-in prices, overridden by the
//                 database's, store/actions/defaults.js)
//   shipping: the admin's rate table for the quantity and the destination country (helpers/shippingRates.js)

export class CartError extends Error {}

const MAX_LINES = 50;
const MAX_QUANTITY = 500;
const PRICES_TTL_MS = 60 * 1000;

// custom-jacket/src/store/reducers/pricing.js (its initState)
const BUILDER_PRICES = {
  collar: { classic: 0, simple: 5, rollup: 8, hood: 10, zipperhood: 15, shirtcollar: 8, sailor: 15, band: 5, overlap: 5 },
  sleeves: { setin: 0, raglan: 10 },
  closure: { buttons: 0, zipper: 8, flap: 20, pullover: 0 },
  pocket: { slashpocket: 0, weltpocket: 4, flappocket: 4, snappocket: 4, straightpocket: 0, zipperpocket: 4 },
  lining: { quilt: 0, satin: 0, fur: 10, polarfleece: 10, brushedtricot: 10, cotton: 8, zipout: 0 },
  materials: {
    body: { cowhideleather: 65, meltonwool: 30, cottontwill: 25, sheepleather: 75, nylonmemory: 25, cottonfleece: 25, softshell: 25, satin: 25, synthaticleather: 25, nylon: 25, taffeta: 25 },
    sleeves: { cowhideleather: 0, meltonwool: 0, cottontwill: 0, sheepleather: 0, nylonmemory: 0, cottonfleece: 0, softshell: 0, satin: 0, synthaticleather: 0, nylon: 0, taffeta: 0 },
  },
  designs: {
    frontcenter: 25, backtop: 25, backbottom: 25, backmiddle: 25, leftchest: 20, rightchest: 20, leftpocket: 15, rightpocket: 0,
    leftsleeve: 0, rightsleeve: 10, leftsleeveend: 10, rightsleeveend: 10,
    rightsleevemidupper: 8, leftsleevemidupper: 8, rightsleevemidlower: 8, leftsleevemidlower: 8,
  },
  sizes: {
    xxs: 0, xs: 0, s: 0, m: 0, mtall: 0, l: 0, ltall: 0, xl: 0, xltall: 5, '2xl': 5, '2xltall': 5,
    '3xl': 10, '4xl': 10, '5xl': 10, '6xl': 10, custom: 20,
  },
  advance: { chestPocket: 8, proCuff: 8, insertsCount1: 8, insertsCount2: 16, piping: 5 },
};

// the server's price-list keys (controllers/designController.js getDesignDataByCategoryCode)
const listKey = (name) => String(name || '').toLowerCase().replace(/\s+/g, '');
// the builder's lookups (custom-jacket/src/utils/index.js removeSpace)
const lookupKey = (name) => String(name || '').replace(/\s/g, '').replace(/-/g, '').replace(/\//g, '').toLowerCase();
const num = (value) => (Number.isFinite(Number(value)) ? Number(value) : 0);

let pricesCache = null;
let pricesAt = 0;

/** The builder's price list: its built-in prices, the database's on top (as the builder merges them). */
export const loadDesignPrices = async ({ fresh = false } = {}) => {
  if (!fresh && pricesCache && Date.now() - pricesAt < PRICES_TTL_MS) return pricesCache;
  const [materials, closures, collars, pockets, linings, designTypes, sizes] = await Promise.all([
    Material.find().lean(), Closure.find().lean(), Collar.find().lean(), Pocket.find().lean(),
    Lining.find().lean(), DesignType.find().lean(), Size.find().lean(),
  ]);
  const byName = (list) => Object.fromEntries(list.map((item) => [listKey(item.name), item.price || 0]));
  const materialPrice = {
    body: Object.fromEntries(materials.map((m) => [listKey(m.name), m['body-price'] || 0])),
    sleeves: Object.fromEntries(materials.map((m) => [listKey(m.name), m['sleeves-price'] || 0])),
  };
  const sizePrice = Object.fromEntries(sizes.map((s) => [listKey(s.size), s.price || 0]));
  pricesCache = {
    pricing: {
      collar: { ...BUILDER_PRICES.collar, ...byName(collars) },
      sleeves: { ...BUILDER_PRICES.sleeves },
      closure: { ...BUILDER_PRICES.closure, ...byName(closures) },
      pocket: { ...BUILDER_PRICES.pocket, ...byName(pockets) },
      lining: { ...BUILDER_PRICES.lining, ...byName(linings) },
      // a shallow merge, as the builder's reducer does: the database's body / sleeves lists replace the built-in ones
      materials: { ...BUILDER_PRICES.materials, ...materialPrice },
      designs: { ...BUILDER_PRICES.designs, ...byName(designTypes) },
      sizes: { ...BUILDER_PRICES.sizes, ...sizePrice },
      advance: { ...BUILDER_PRICES.advance },
    },
    sizes,
  };
  pricesAt = Date.now();
  return pricesCache;
};

// the decorated places and their price keys, as the builder adds them up
const PLACES = [
  ['Front Center', 'frontcenter'], ['Back Top', 'backtop'], ['Back Bottom', 'backbottom'], ['Back Middle', 'backmiddle'],
  ['Right Chest', 'rightchest'], ['Left Chest', 'leftchest'], ['Right Pocket', 'rightpocket'], ['Left Pocket', 'leftpocket'],
  ['Right Sleeve', 'rightsleeve'], ['Left Sleeve', 'leftsleeve'], ['Right Sleeve End', 'rightsleeveend'], ['Left Sleeve End', 'leftsleeveend'],
  ['Right Mid Sleeve Upper', 'rightmidsleeveupper'], ['Left Mid Sleeve Upper', 'leftmidsleeveupper'],
  ['Right Mid Sleeve Lower', 'rightmidsleevelower'], ['Left Mid Sleeve Lower', 'leftmidsleevelower'],
];
const LEATHER = new Set(['Cowhide Leather', 'Sheep Leather']);

/** One jacket from the builder, priced as the builder prices it (custom-jacket/src/utils/index.js getPrice). */
export const priceDesign = (design, { pricing, sizes }) => {
  const styles = design?.styles || {};
  const materials = design?.materials || {};
  const designs = design?.designs || {};
  const advance = design?.advance || {};
  const size = design?.sizes || {};

  let price = num(pricing.collar[lookupKey(String(styles.collar || '').toLowerCase())]);
  price += num(pricing.sleeves[lookupKey(styles.sleeves)]);
  price += num(pricing.closure[lookupKey(styles.closure)]);
  price += num(pricing.pocket[lookupKey(styles.pocket)]);
  price += num(pricing.lining[lookupKey(styles.lining)]);
  price += styles.flap ? num(pricing.closure.flap) : 0;
  price += styles.zipout ? num(pricing.lining.zipout) : 0;
  price += num(pricing.materials.body?.[lookupKey(materials.body)]);
  price += num(pricing.materials.sleeves?.[lookupKey(materials.sleeves)]);

  for (const [place, key] of PLACES) {
    if (designs[place]?.done) price += num(pricing.designs[key]);
  }

  if (advance.chestPocket) price += num(pricing.advance.chestPocket);
  if (advance.inserts && advance.insertsCount === 1) price += num(pricing.advance.insertsCount1);
  if (advance.inserts && advance.insertsCount === 2) price += num(pricing.advance.insertsCount2);
  if (advance.piping) price += num(pricing.advance.piping);
  if (advance.proCuff) price += num(pricing.advance.proCuff);

  if (size.custom) {
    price += num(pricing.sizes.custom);
  } else {
    for (const row of sizes) {
      const sizePrice = LEATHER.has(materials.body) ? row.price : row.fprice;
      if (String(row.size || '').toLocaleUpperCase() === size.size) price += num(parseInt(sizePrice, 10));
    }
  }
  return Math.round(price * 100) / 100;
};

/** A shop product at a size, as the storefront shows it (whole dollars, the discount % taken off). */
export const priceProduct = (product, sizeLabel = '') => {
  const pct = Number(product?.discountPrice);
  const discount = pct > 0 && pct < 100 ? pct : 0;
  const standard = num(product?.standardPrice);
  const wanted = String(sizeLabel || '').trim().toUpperCase();
  const size = wanted ? (product?.sizes || []).find((s) => s && String(s.size).toUpperCase() === wanted) : null;
  const base = size ? num(size.price) || standard : standard;
  return Math.round(base * (1 - discount / 100));
};

const isId = (value) => typeof value === 'string' && mongoose.Types.ObjectId.isValid(value);
const text = (value, max = 200) => (typeof value === 'string' ? value.slice(0, max) : '');

/**
 * The cart as charged: each line priced here (the browser's prices and any shipping line it sends are
 * ignored), then shipping for the destination. `country`: the ISO code from the checkout form.
 * Throws CartError with a message for the customer when the cart cannot be priced.
 */
export const priceCart = async (items, { country = 'US' } = {}) => {
  const wanted = Array.isArray(items) ? items.filter((item) => item && item.id !== 'shipping_fee') : [];
  if (!wanted.length) throw new CartError('Your cart is empty.');
  if (wanted.length > MAX_LINES) throw new CartError('Your cart has too many lines. Please split the order.');

  const prices = await loadDesignPrices();
  const lines = [];
  for (const item of wanted) {
    const quantity = Number(item.quantity);
    const label = text(item.name, 80) || 'An item';
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
      throw new CartError(`Check the quantity of ${label}.`);
    }

    let price;
    let name;
    if (isId(item.id)) {
      const product = await productModel.findById(item.id).select('name standardPrice discountPrice sizes').lean();
      if (!product) throw new CartError(`${label} is no longer available. Please remove it from your cart.`);
      price = priceProduct(product, item.size);
      name = product.name;
    } else if (!item.id && isId(item.designId)) {
      const design = await Design.findById(item.designId).select('title styles materials designs advance sizes').lean();
      if (!design) throw new CartError(`${label} could not be found. Please design it again.`);
      price = priceDesign(design, prices);
      name = text(item.name, 120) || design.title;
    } else {
      throw new CartError(`${label} is no longer available. Please remove it from your cart.`);
    }
    if (!(price > 0)) throw new CartError(`${label} has no price yet. Please contact us to order it.`);

    lines.push({
      id: isId(item.id) ? item.id : null,
      designId: isId(item.designId) ? item.designId : null,
      name,
      quantity,
      price,
      size: text(item.size, 20),
      color: text(item.color, 60),
      slug: text(item.slug, 200),
    });
  }

  const subtotal = Math.round(lines.reduce((sum, l) => sum + l.price * l.quantity, 0) * 100) / 100;
  const count = lines.reduce((sum, l) => sum + l.quantity, 0);
  const shipping = Math.round(num(await calculateShipping(count, country, subtotal)) * 100) / 100;
  return { lines, subtotal, shipping, total: Math.round((subtotal + shipping) * 100) / 100 };
};
