// Builds public/images/ from the client's own pictures:
//   products/  photos from the live catalogue (api.easyjackets.com), picked by slug
//   site/      lifestyle, material and builder shots the storefront already ships
//              (../easyjackets in the monorepo, or pass --site <dir>)
//   logos/     the "trusted by" marquee logos the design hotlinked
// Everything is re-encoded as WebP with a bounded long edge so a phone never
// downloads a 3000px original. Run: node tools/fetch-live-images.mjs
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const API = 'https://api.easyjackets.com';
const OUT = path.resolve('public/images');
const SITE = path.resolve(process.argv.includes('--site') ? process.argv[process.argv.indexOf('--site') + 1] : '../easyjackets');
const MAX_EDGE = 1200;

// out name -> live product slug (front image unless `view` says otherwise)
const PRODUCTS = {
  'all-black-leather-varsity': 'All-Black-Letterman-Jacket-Leather-Sleeves',
  'all-black-leather-varsity-2': { slug: 'All-Black-Letterman-Jacket-Leather-Sleeves', view: 1 },
  'all-black-leather-varsity-3': { slug: 'All-Black-Letterman-Jacket-Leather-Sleeves', view: 2 },
  'black-white-leather-varsity': 'Black-Wool-and-White-Premium-Leather-Sleeve-Varsity-Jacket',
  'red-gold-varsity': 'Red-and-Gold-Custom-Sports-Letterman-Jacket',
  'royal-blue-white-varsity': 'Royal-Blue-and-White-Varsity-Letterman-Jacket',
  'all-black-wool-varsity': 'Full-Wool-Black-Varsity-Jacket',
  'baby-pink-white-varsity': 'Baby-Pink-and-White-Varsity-Jacket-Leather-Sleeves',
  'black-satin-bomber': 'Black-Satin-Bomber-Jacket',
  'black-gold-retro-jacket': 'American-Black-and-Gold-Retro-Jacket',
  'blue-white-hooded-varsity': 'Blue-and-White-Hooded-Varsity-Jacket',
  'maroon-white-varsity': 'Dark-Maroon-and-White-Varsity-Letterman-Jacket',
  'forest-green-black-varsity': 'Forest-Green-and-Black-Letterman-Jacket',
  'red-white-hooded-varsity': 'Red-and-White-Hooded-Varsity-Jacket',
  'royal-blue-satin-bomber': 'Royal-Blue-Satin-Bomber-Jacket',
  'red-hoodie': "Men's-Red-Cotton-Fleece-Pullover-Hoodie",
  'green-hoodie': 'Unisex-Pullover-Hoodie',
  'red-coach-jacket': 'Red-Coach-Jacket',
  'navy-coach-jacket': 'Navy-Blue-Coach-Jacket',
  'sky-blue-grey-varsity': 'Sky-Blue-Dark-Gray-Varsity-Jacket',
  'black-softshell-varsity': 'Black-Softshell-Varsity-Jacket',
  'black-hooded-varsity': 'Black-Hooded-Varsity-Jacket',
  'black-all-leather-varsity': 'Black-All-Leather-Varsity-Jacket',
  'black-melton-wool-varsity': 'Black-Melton-Wool-Varsity-Jacket',
  'royal-blue-satin-varsity': 'Royal-Blue-Satin-Varsity-Jacket',
  'blue-white-sublimated-satin': 'Blue-and-White-Sublimated-Satin-Ombre-Varsity-Jacket',
  'black-cotton-twill-racing': 'Black-Cotton-Twill-Racing-Varsity-Jacket',
  'pink-cropped-varsity': 'Baby-Pink-Cropped-Varsity-Jacket',
  'red-white-cropped-varsity': 'Red-And-White-Cropped-Varsity-Jacket',
};

// out name -> file under the storefront checkout
const SITE_FILES = {
  'hero-red-navy-varsity': 'src/assets/Images/enhanced_hero_jacket.webp',
  'woman-red-white-varsity': 'src/assets/Images/editorial_hero_red_white.webp',
  'woman-red-white-detail': 'src/assets/Images/editorial_story_red_white_detail.webp',
  'woman-black-coach': 'src/assets/Images/editorial_hero_black.webp',
  'woman-green-satin': 'src/assets/Images/editorial_promo_green.webp',
  'woman-blue-hoodie': 'src/assets/Images/story_woman_blue_hoodie_v2.webp',
  'man-black-orange': 'src/assets/Images/story_man_black_orange.webp',
  'couple-red-black': 'src/assets/Images/editorial_group_red_black.webp',
  'couple-hoodies': 'src/assets/Images/editorial_group_hoodies.webp',
  'team-varsity-group': 'src/assets/Images/image.webp',
  'trio-outdoors': 'src/assets/Images/Rectangle.webp',
  'jackets-on-rail': 'src/assets/Images/hero-varsity.webp',
  'jackets-pile': 'src/assets/Images/jackTwo.webp',
  'back-embroidery-robinson': 'src/assets/Images/Photo-3.webp',
  'patches-moldrik': 'src/assets/Images/Placeholder.webp',
  'chenille-aka': 'src/assets/Images/_0032_Layer 454 1333.webp',
  'red-s-jacket': 'src/assets/Images/image2.webp',
  'ec-navy-white': 'src/assets/Images/fc-2.webp',
  'leather-rolls': 'src/assets/Images/thumb.webp',
  'leather-black': 'public/gridImage/1178-large_default_1024x1024@2x.webp',
  'leather-brown': 'public/gridImage/1180-large_default_1024x1024@2x.webp',
  'leather-navy': 'public/gridImage/1181-large_default_1024x1024@2x.webp',
  'leather-olive': 'public/gridImage/1182-large_default_1024x1024@2x.webp',
  'builder-colors': 'public/PageImage/10.webp',
  'builder-body': 'public/PageImage/9.webp',
  'builder-trim': 'public/PageImage/12.webp',
  'builder-letters': 'public/PageImage/13.webp',
  'builder-review': 'public/PageImage/14.webp',
  'builder-style': 'public/PageImage/desing-image-1.webp',
  'jacket-measurement': 'public/PageImage/jacket-measurement.webp',
};

const LOGOS = ['wendys', 'ups-logo', 'pizza-hut-logo', 'penn-state-lions', 'michigan-state-university', 'mcdonald', 'ihop-logo'];

const fetchBuf = async (url) => {
  const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return Buffer.from(await r.arrayBuffer());
};
const toWebp = (buf) => sharp(buf).rotate().resize({ width: MAX_EDGE, height: MAX_EDGE, fit: 'inside', withoutEnlargement: true }).webp({ quality: 82 }).toBuffer();
const write = async (dir, name, buf) => {
  fs.mkdirSync(path.join(OUT, dir), { recursive: true });
  const out = await toWebp(buf);
  fs.writeFileSync(path.join(OUT, dir, `${name}.webp`), out);
  const m = await sharp(out).metadata();
  console.log(`${dir}/${name}.webp`.padEnd(46), `${m.width}x${m.height}`.padEnd(10), `${Math.round(out.length / 1024)}K`);
};

// 1. live catalogue
const catalogue = [];
for (let page = 1; ; page++) {
  const r = await fetch(`${API}/api/v1/product/product-filters/?category=&color=&page=${page}&limit=100`, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const j = await r.json();
  catalogue.push(...(j.products || []));
  if (page >= (j.totalPages || 1)) break;
}
const bySlug = new Map(catalogue.map((p) => [p.slug, p]));
console.log(`live catalogue: ${catalogue.length} products\n`);
for (const [name, spec] of Object.entries(PRODUCTS)) {
  const { slug, view = 0 } = typeof spec === 'string' ? { slug: spec } : spec;
  const p = bySlug.get(slug);
  if (!p) { console.error(`  ! no live product with slug ${slug}`); process.exitCode = 1; continue; }
  const url = view === 0 ? p.frontImage : p.otherImages?.[view - 1];
  if (!url) { console.error(`  ! ${slug} has no view ${view}`); process.exitCode = 1; continue; }
  await write('products', name, await fetchBuf(url));
}

// 2. storefront assets
console.log('');
for (const [name, rel] of Object.entries(SITE_FILES)) {
  const file = path.join(SITE, rel);
  if (!fs.existsSync(file)) { console.error(`  ! missing ${file}`); process.exitCode = 1; continue; }
  await write('site', name, fs.readFileSync(file));
}

// 3. marquee logos (SVG, copied as-is)
console.log('');
fs.mkdirSync(path.join(OUT, 'logos'), { recursive: true });
for (const l of LOGOS) {
  const svg = await fetchBuf(`https://clothoo.com/frontend/images/home/logos/${l}.svg`);
  fs.writeFileSync(path.join(OUT, 'logos', `${l}.svg`), svg);
  console.log(`logos/${l}.svg`.padEnd(46), `${Math.round(svg.length / 1024)}K`);
}
