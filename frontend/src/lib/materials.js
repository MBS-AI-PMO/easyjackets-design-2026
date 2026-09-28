// Data for the support pages: the materials guide (body/sleeve prices and
// pairings), the size chart and the shipping rates the checkout uses.
import { api } from './api';

const listOf = (res, ...keys) => { for (const k of keys) if (Array.isArray(res?.[k])) return res[k]; return Array.isArray(res) ? res : []; };

export const slugify = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
export const money = (n) => `$${Math.round(Number(n) || 0).toLocaleString('en-US')}`;

// ---- materials ------------------------------------------------------------

/**
 * What the customiser charges for a material on the body and on the sleeves
 * (GET /property/materials, the same list fetchMaterials() reads names from),
 * keyed by material id. `pairsWith` is the admin's "mat-parent": the body
 * materials the material is offered alongside.
 */
export const fetchMaterialPricing = async (signal) => {
  const list = listOf(await api.get('/property/materials', { auth: false, signal }), 'materials', 'data');
  return new Map(list.map((m) => [m._id, {
    bodyPrice: Number(m['body-price']) || 0,
    sleevesPrice: Number(m['sleeves-price']) || 0,
    forBody: m.body === 'on',
    forSleeves: m.sleeves === 'on',
    pairsWith: (Array.isArray(m['mat-parent']) ? m['mat-parent'] : []).map((p) => String(p || '').trim()).filter((p) => p && p.toLowerCase() !== String(m.name || '').trim().toLowerCase()),
  }]));
};

/**
 * Every colour the design lab offers (GET /property/colors): its hex code and
 * the materials it is available in — what the Material Colors page groups by.
 */
export const fetchColorOptions = async (signal) =>
  listOf(await api.get('/property/colors', { auth: false, signal }), 'colors', 'data')
    .filter((c) => c.isActive !== false && c.name)
    .map((c) => ({
      id: c._id,
      order: Number(c.id) || 0,
      name: String(c.name).trim(),
      code: /^#?[0-9a-f]{3,8}$/i.test(String(c.code || '').trim()) ? (String(c.code).trim().startsWith('#') ? String(c.code).trim() : `#${String(c.code).trim()}`) : '',
      materials: (Array.isArray(c.materials) ? c.materials : []).map((m) => String(m || '').trim()).filter(Boolean),
      parts: (Array.isArray(c.parts) ? c.parts : []).map((p) => String(p || '').trim()).filter(Boolean),
    }))
    .sort((a, b) => a.order - b.order);

// Words that do not identify a material on their own ("Cowhide Leather" is the cowhide).
const GENERIC = new Set(['leather', 'wool', 'color', 'colors', 'colour', 'colours', 'collection', 'fabric', 'polyester', 'and', 'the']);
const words = (s) => String(s || '').toLowerCase().split(/[^a-z]+/).filter((w) => w && !GENERIC.has(w));

/** The fabric-colour section (fetchFabricSections) whose swatches belong to a material, or null. */
export const sectionForMaterial = (materialName, sections = []) => {
  const need = words(materialName);
  if (!need.length) return null;
  return sections.find((s) => {
    const have = new Set(words(`${s.name} ${s.title} ${s.key}`));
    return need.every((w) => have.has(w));
  }) || null;
};
/** The material (fetchMaterials) a fabric-colour section belongs to, or null. */
export const materialForSection = (section, materials = []) => materials.find((m) => sectionForMaterial(m.name, [section]) === section) || null;

// ---- sizes ----------------------------------------------------------------

/**
 * The size chart (GET /property/sizes): body measurements the size fits and
 * the finished jacket's measurements, in inches as the admin typed them
 * ("44-46", "7.25"), plus the surcharge the larger sizes carry.
 */
export const fetchSizes = async (signal) =>
  listOf(await api.get('/property/sizes', { auth: false, signal }), 'sizes')
    .map((s) => ({
      id: s._id,
      order: Number(s.id) || 0,
      size: String(s.size || '').trim().toUpperCase(),
      body: { chest: s.chest || '', waist: s.waist || '', sleeves: s.sleeves || '', backLength: s.backlength || '' },
      jacket: { chest: s.jchest || '', sleeves: s.jsleeves || '', acrossShoulder: s.jashoulder || '', shoulder: s.jshoulder || '', backLength: s.jbacklength || '' },
      surcharge: Number(s.price) || 0,
    }))
    .filter((s) => s.size)
    .sort((a, b) => a.order - b.order);

/** "44-46" -> [44, 46]; "38" -> [38, 38]; anything else -> null. */
export const inchRange = (v) => {
  const nums = String(v || '').match(/\d+(\.\d+)?/g)?.map(Number) || [];
  return nums.length ? [nums[0], nums[nums.length - 1]] : null;
};
/** Every number in a measurement string converted to cm ("44-46" -> "112-117"). */
export const toCm = (v) => String(v || '').replace(/\d+(\.\d+)?/g, (n) => String(Math.round(Number(n) * 2.54)));

// ---- shipping -------------------------------------------------------------

const tiers = (list) => (Array.isArray(list) ? list : [])
  .map((t) => ({
    minQty: Math.max(1, Math.trunc(Number(t?.minQty) || 0)),
    maxQty: t?.maxQty === null || t?.maxQty === undefined || t?.maxQty === '' ? null : Math.trunc(Number(t.maxQty)),
    rate: Math.max(0, Number(t?.rate) || 0),
    perItem: t?.perItem === true || t?.perItem === 'true',
    label: String(t?.label || '').trim(),
  }))
  .sort((a, b) => a.minQty - b.minQty);

/** The rates the checkout prices shipping with (GET /shipping-rates/public; the admin's own route needs a token). */
export const fetchShippingRates = async (signal) => {
  const r = (await api.get('/shipping-rates/public', { auth: false, signal }))?.rates || {};
  return {
    usaTiers: tiers(r.usaTiers),
    worldwideTiers: tiers(r.worldwideTiers),
    usaFallbackRate: Math.max(0, Number(r.usaFallbackRate) || 0),
    worldwideFallbackRate: Math.max(0, Number(r.worldwideFallbackRate) || 0),
    freeShippingOver: Math.max(0, Number(r.freeShippingOver) || 0),
    enabled: r.enabled !== false,
    isConfigured: !!r.isConfigured,
  };
};

/**
 * The API's rule (helpers/shippingRates.js): the first bracket holding the
 * quantity wins, a per-item bracket multiplies by the quantity. Returns null
 * when no bracket covers the quantity and there is no fallback rate, so the
 * page can say "quoted at checkout" instead of printing $0.
 */
export const rateForQuantity = (list, quantity, fallback = 0) => {
  const qty = Math.max(0, Math.trunc(Number(quantity) || 0));
  if (!qty) return 0;
  for (const t of list || []) {
    const max = t.maxQty === null ? Infinity : t.maxQty;
    if (qty >= t.minQty && qty <= max) return t.perItem ? t.rate * qty : t.rate;
  }
  return fallback > 0 ? fallback : null;
};

/** Rows for a rates table: consecutive quantities with the same prices are merged into one range. */
export const shippingRateRows = (rates, limit = 25) => {
  const all = [...rates.usaTiers, ...rates.worldwideTiers];
  const max = Math.min(limit, Math.max(1, ...all.map((t) => (t.maxQty === null ? t.minQty : t.maxQty))));
  const rows = [];
  for (let q = 1; q <= max; q += 1) {
    const usa = rateForQuantity(rates.usaTiers, q, rates.usaFallbackRate);
    const world = rateForQuantity(rates.worldwideTiers, q, rates.worldwideFallbackRate);
    const last = rows[rows.length - 1];
    if (last && last.usa === usa && last.world === world) last.to = q;
    else rows.push({ from: q, to: q, usa, world });
  }
  const open = all.some((t) => t.maxQty === null && t.minQty <= max);
  return rows.map((r, i) => ({
    ...r,
    label: r.from === r.to ? (i === rows.length - 1 && open ? `${r.from}+` : String(r.from)) : (i === rows.length - 1 && open ? `${r.from}+` : `${r.from}–${r.to}`),
  }));
};

/** "Free shipping on orders over $1,500", or '' when there is no threshold. */
export const freeShippingLabel = (rates) => (rates?.freeShippingOver > 0 ? `Free shipping on orders over ${money(rates.freeShippingOver)}` : '');
