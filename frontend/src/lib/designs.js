// Jackets designed in the builder (custom-jacket/ in this repo). The builder saves each design
// through the backend's /custom routes and sends the visitor to /cart?index=<cart ids>; a design
// in the cart is a line with a designId and no product id (the checkout reads it that way).
import { api, uploadUrl } from './api';
import { builderUrl } from './catalog';

export const fetchDesign = async (id, signal) => (await api.get(`/custom/getDesign/${encodeURIComponent(id)}`, { auth: false, signal }))?.data || null;

/** The builder's saved cart entries (each with its design), as /cart?index= names them. */
export const fetchBuilderCarts = async (ids, signal) => {
  const r = await api.post('/custom/getAllCustomCart', { carts: ids }, { auth: false, signal });
  return (r?.data || []).filter((c) => c && c.designId && c.designId._id);
};

// "Varsity Jackets" -> "Varsity Jacket", "Hoodies" -> "Hoodie"
const singular = (name) => String(name || 'Jacket').trim().replace(/s$/i, '');
export const designName = (d) => `Custom ${singular(d?.globals?.catName)}`;

/** The cart line for a saved design (price, size and image as the builder saved them). */
export const designLine = (d) => ({
  designId: d._id,
  categoryCode: d.categoryCode || '',
  name: designName(d),
  price: Number(d.custom_price) || 0,
  size: d.sizes?.size || '',
  image: uploadUrl(d.custom_image || ''),
  custom: true,
});

export const isDesignLine = (line) => Boolean(line?.designId && !line?.id);

/** Reopen the visitor's own cart design in the builder; "Update cart" there saves it in place. */
export const editDesignUrl = (line) => builderUrl({ code: line.categoryCode, designedit: line.designId });
/** Start a new jacket from a saved design (the builder's Add to cart saves a copy). */
export const startFromDesignUrl = (d) => builderUrl({ code: d.categoryCode, design: d._id });

export const designViews = (d) => [
  ['Front', d?.custom_image],
  ['Back', d?.custom_image_back],
  ['Left', d?.custom_image_left],
  ['Right', d?.custom_image_right],
].filter(([, src]) => src).map(([label, src]) => ({ label, src: uploadUrl(src) }));

// "chestPocket" -> "Chest pocket"
const label = (key) => {
  const words = String(key).replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
};
const isHex = (v) => typeof v === 'string' && /^#[0-9a-f]{3,8}$/i.test(v.trim());
const text = (v) => (v === true ? 'Yes' : v === false ? 'No' : v == null || v === '' ? '' : String(v));
const SCALE = { in: 'Inches', cm: 'Centimetres' };

// the builder's placements, in the order they sit on the jacket
export const PLACEMENTS = [
  'Front Center', 'Right Chest', 'Left Chest', 'Right Chest Verticle', 'Left Chest Verticle',
  'Right Pocket', 'Left Pocket', 'Right Sleeve', 'Left Sleeve', 'Right Mid Sleeve Upper', 'Left Mid Sleeve Upper',
  'Right Mid Sleeve Lower', 'Left Mid Sleeve Lower', 'Right Sleeve End', 'Left Sleeve End', 'Back Top', 'Back Middle', 'Back Bottom',
];
const placeName = (p) => p.replace('Verticle', 'Vertical');

// one saved placement ({ done, <section>: {...} }) as rows, swatches and, for a logo, its image
function artwork(place, entry) {
  const [section, v] = Object.entries(entry || {}).find(([k, val]) => k !== 'done' && val && typeof val === 'object') || [];
  if (!section) return null;
  const rows = [];
  const swatches = [['Fill', v.fill], ['Outline', v.stroke], ['Border', v.border]].filter(([, hex]) => isHex(hex)).map(([name, hex]) => ({ name, hex }));
  let kind = label(section);
  let image = '';
  if (section === 'name') {
    kind = 'Name';
    rows.push(['Text', v.title], ['Style', v.appearance], ['Font', v.font]);
  } else if (section === 'letters') {
    kind = v.type === 'Ready To Use' ? 'Ready-made patch' : 'Letters';
    rows.push(['Text', v.title], ['Style', v.appearance], ['Font', v.font], ['Chenille treatment', v.treatment ? 'Yes' : '']);
    if (v.type === 'Ready To Use' && typeof v.path === 'string' && v.path.length < 80) rows.push(['Patch', v.path.split('/').pop().replace(/\.\w+$/, '')]);
  } else if (section === 'editables') {
    kind = 'Editable badge';
    rows.push(['Line 1', v.txt1], ['Line 2', v.txt2]);
  } else if (section === 'symbol') {
    kind = v.type ? label(v.type) : 'Symbol';
    rows.push(['Symbol', typeof v.flag === 'string' ? v.flag.replace(/[-_]+/g, ' ') : '']);
  } else if (section === 'upload') {
    kind = 'Your artwork';
    image = v.image ? uploadUrl(v.image) : typeof v.file === 'string' && v.file.startsWith('data:image') ? v.file : '';
  }
  return { place: placeName(place), kind, rows: rows.filter(([, val]) => text(val)).map(([k, val]) => [k, text(val)]), swatches, image };
}

/**
 * Everything saved with a design, grouped as the review page shows it (the live site's design page
 * plus the artwork on every placement): materials, sizing, colors, styles, advanced options, artwork.
 */
export function designDetails(d) {
  if (!d) return null;
  const materials = [['Body material', d.materials?.body], ['Sleeves material', d.materials?.sleeves]];
  const s = d.sizes || {};
  const sizing = [['Selected size', s.custom ? 'Custom measurements' : s.size], ['Scale', SCALE[s.scale] || s.scale]];
  for (const [k, v] of Object.entries(s)) {
    if (['custom', 'scale', 'size', 'price'].includes(k) || v == null || v === '' || typeof v === 'object') continue;
    sizing.push([label(k), `${v}${s.scale && /^\d+(\.\d+)?$/.test(String(v)) ? ` ${s.scale}` : ''}`]);
  }
  const styles = Object.entries(d.styles || {}).filter(([k, v]) => k !== 'section' && (typeof v !== 'object' || v === null)).map(([k, v]) => [label(k), text(v) || '—']);
  const a = d.advance || {};
  const advanced = Object.entries(a).filter(([k, v]) => k !== 'insertsCount' && typeof v === 'boolean').map(([k, v]) => [label(k), v ? 'Included' : 'None']);
  if (a.inserts && a.insertsCount) advanced.push(['Number of inserts', String(a.insertsCount)]);
  const colors = Object.entries(d.colors || {}).filter(([k, v]) => k !== 'defaults' && isHex(v)).map(([k, v]) => ({ name: label(k), hex: v.trim() }));
  const places = [...PLACEMENTS, ...Object.keys(d.designs || {}).filter((k) => !PLACEMENTS.includes(k))];
  const art = places.map((p) => (d.designs?.[p] && typeof d.designs[p] === 'object' ? artwork(p, d.designs[p]) : null)).filter(Boolean);
  return { materials: materials.map(([k, v]) => [k, text(v) || '—']), sizing: sizing.map(([k, v]) => [k, text(v) || '—']), styles, advanced, colors, artwork: art };
}

/** Email the design (the builder's Share, from the review page): the backend sends it with a PDF spec. */
export const shareDesign = (design, { name, email }) => api.post('/custom/share', { name, email, design }, { auth: false });
