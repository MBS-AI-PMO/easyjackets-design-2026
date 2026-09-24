// One-shot converter: design/*.dc.html  ->  src/pages/*.jsx (+ .css)
//
// The export is a template language (sc-for / sc-if / {{ }} / image-slot /
// React-style onClick="{{ h }}") plus a logic class whose renderVals() returns
// the object the template renders against. Both halves are converted
// mechanically so nothing is retyped by hand.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as htmlparser2 from 'htmlparser2';

const DESIGN = process.argv[2];
const OUT = process.argv[3];
const WRITE_SHARED_CSS = process.argv.includes('--css');
const CHROME_OUT = process.argv.includes('--chrome') ? path.join(path.dirname(fileURLToPath(import.meta.url)), 'chrome') : null;

// file -> { route (pattern), link (href target), name, slug }
const PAGES = [
  ['Easy Jackets Landing v2.dc.html',        '/',                          'Home',              null],
  ['Easy Jackets Listing.dc.html',           '/shop',                      'Shop',              null],
  ['Easy Jackets Product.dc.html',           '/product',                   'Product',           null],
  ['Easy Jackets Design.dc.html',            '/design',                    'Design',            null],
  ['Easy Jackets How To Design.dc.html',     '/how-to-design',             'HowToDesign',       null],
  ['Easy Jackets Bulk.dc.html',              '/bulk-orders',               'BulkOrders',        null],
  ['Easy Jackets Blog.dc.html',              '/blog',                      'Blog',              null],
  ['Easy Jackets Blog Post.dc.html',         '/blog/:slug',                'BlogPost',          '/blog/design-a-jacket-thats-uniquely-yours'],
  ['Easy Jackets FAQ.dc.html',               '/faq',                       'Faq',               null],
  ['Easy Jackets Size Chart.dc.html',        '/size-chart',                'SizeChart',         null],
  ['Easy Jackets Material Colors.dc.html',   '/material-colors',           'MaterialColors',    null],
  ['Easy Jackets Fabrics.dc.html',           '/fabrics',                   'Fabrics',           null],
  ['Easy Jackets Gallery.dc.html',           '/gallery',                   'Gallery',           null],
  ['Easy Jackets About.dc.html',             '/about',                     'About',             null],
  ['Easy Jackets Contact.dc.html',           '/contact',                   'Contact',           null],
  ['Easy Jackets Reviews.dc.html',           '/reviews',                   'Reviews',           null],
  ['Easy Jackets Shipping Returns.dc.html',  '/shipping-returns',          'ShippingReturns',   null],
  ['Easy Jackets Privacy Policy.dc.html',    '/privacy-policy',            'PrivacyPolicy',     null],
  ['Easy Jackets Terms.dc.html',             '/terms',                     'Terms',             null],
  ['Easy Jackets Track Order.dc.html',       '/track-order',               'TrackOrder',        null],
  ['Easy Jackets Cart.dc.html',              '/cart',                      'Cart',              null],
  ['Easy Jackets Checkout.dc.html',          '/checkout',                  'Checkout',          null],
  ['Easy Jackets Order Confirmation.dc.html','/order-confirmation',        'OrderConfirmation', null],
  ['Easy Jackets Account.dc.html',           '/account',                   'Account',           null],
  ['Easy Jackets Dashboard.dc.html',         '/dashboard',                 'Dashboard',         null],
  ['Easy Jackets United States.dc.html',     '/united-states',             'UnitedStates',      null],
  ['Easy Jackets State.dc.html',             '/united-states/:state',      'StatePage',         '/united-states/alabama'],
  ['Easy Jackets Style Guide.dc.html',       '/style-guide',               'StyleGuide',        null],
  ['Easy Jackets 404.dc.html',               '*',                          'NotFound',          '/404'],
].map(([file, route, name, link]) => ({ file, route, name, link: link ?? route, slug: name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase() }));
const LINK = new Map(PAGES.map(p => [p.file, p.link]));

const warn = (...a) => console.warn('  !', ...a);

// ---------------------------------------------------------------- links
function rewriteHref(h) {
  const m = h.match(/^(Easy Jackets [^?#]+?\.dc\.html)([?#].*)?$/);
  if (!m) return h;
  const base = LINK.get(m[1]);
  if (!base) throw new Error('unknown page link: ' + h);
  return base + (m[2] || '');
}
const rewriteLinksInJs = (js) => js.replace(/'(Easy Jackets [^']*?\.dc\.html[^']*)'/g, (_, h) => `'${rewriteHref(h)}'`);

// Stock-photo URLs that are dead in the export itself (verified 404), and
// where the same picture actually lives. Applied to templates and logic alike.
// (Each page defines its own CL base — most as …/images/home/, Gallery as
// …/images/ — so only the file's basename is a safe thing to key on.)
const DEAD_IMAGE_FIXES = [
  // the hockey-club customer photo lives under /customer-photos/, not /home/…
  [/https:\/\/clothoo\.com\/frontend\/images\/home\/(?:customer-photos\/)?(maroon-gold-varsity-jackets-with-hockey[^'"]*)/g, 'https://clothoo.com/frontend/images/customer-photos/$1'],
  [/CL \+ '(?:customer-photos\/)?(maroon-gold-varsity-jackets-with-hockey[^']*)'/g, "'https://clothoo.com/frontend/images/customer-photos/$1'"],
];
// The design hotlinked stock photos from two other jacket makers. Every one of
// them maps to a picture of the client's own (see tools/fetch-live-images.mjs),
// keyed by the stock file's basename so the TJM+'…', CL+'…' and literal forms
// all resolve. Items that need a different picture from the one their stock
// URL implies are overridden per item in tools/post-convert.mjs.
const P = (n) => `/images/products/${n}.webp`, S = (n) => `/images/site/${n}.webp`;
const IMAGE_MAP = {
  // thejacketmaker.pk
  'Premium_leather_material_used_in_custom_letterman_jackets_1024x1024.webp?v=1775237981': P('all-black-leather-varsity'),
  'Patches_41cb68d9-f7c0-4b04-8ac9-08cca6394fa0_1024x1024.webp?v=1775219898': P('black-white-leather-varsity'),
  'Embroidery_2_1024x1024.webp?v=1775219897': P('red-gold-varsity'),
  'Logo-Varsity_1_1024x1024.webp?v=1775219897': P('royal-blue-white-varsity'),
  'Wool_fabric_used_in_warm_custom_letterman_jackets_1024x1024.webp?v=1775238036': P('all-black-wool-varsity'),
  'V-Printed_1024x1024.webp?v=1775219901': P('baby-pink-white-varsity'),
  'Chenille_Embroidery_1024x1024.webp?v=1775220008': P('black-gold-retro-jacket'),
  'Suede_leather_material_used_in_custom_letterman_jackets_1024x1024.webp?v=1775238171': P('royal-blue-satin-bomber'),
  'Nylon_fabric_used_in_lightweight_custom_varsity_jackets_1024x1024.webp?v=1775238145': P('navy-coach-jacket'),
  'Denim_and_cotton_fabric_options_used_in_custom_letterman_jackets_1024x1024.webp?v=1775238196': P('sky-blue-grey-varsity'),
  'Technical_fabric_materials_used_for_modern_custom_varsity_jackets_1024x1024.webp?v=1775238114': P('red-hoodie'),
  'Cotton_fabric_material_texture_close_up_for_custom_varisty_jackets_1024x1024.webp?v=1775238632': P('blue-white-hooded-varsity'),
  'Team_1024x1024.webp?v=1775220777': S('team-varsity-group'),
  'School_1024x1024.webp?v=1775220778': S('couple-red-black'),
  'Brand_63f92eec-0544-42c1-8c33-0fe8dd40f4eb_1024x1024.webp?v=1775220871': S('man-black-orange'),
  // clothoo.com
  'custom-jacket-design-options-colors-fabrics-patches-clothoo-600.jpg': S('woman-red-white-varsity'),
  'USA-custom-varsity-letterman-jacket-clothoo-548.jpg': S('hero-red-navy-varsity'),
  'customize-your-jacket.jpg': P('black-satin-bomber'),
  'melton-wool-fabric-for-varsity-jackets-clothoo.jpg': P('black-melton-wool-varsity'),
  'full-grain-cowhide-leather-for-letterman-jackets-clothoo.jpg': S('leather-black'),
  'faux-leather-or-vegan-leather-clothoo.jpg': S('leather-brown'),
  'polyester-satin-quilted-lining-options-clothoo.jpg': P('royal-blue-satin-varsity'),
  'cusotm-embroidery-details-viscose-thread-jacket-clothoo.jpg': S('back-embroidery-robinson'),
  'double-felt-embroidered-patch-clothoo.jpg': S('patches-moldrik'),
  'custom-chenille-triple-felt-clothoo.jpg': S('chenille-aka'),
  'sublimation-printing-clothoo.jpg': P('blue-white-sublimated-satin'),
  'design-your-own-varsity-jacket-builder-online-clothoo-800.jpg': S('builder-colors'),
  'maroon-gold-varsity-jackets-with-hockey-crossed-sticks-logo-student-group-clothoo-600x395.jpg': S('trio-outdoors'),
  'wetzels-pretzels-blue-gold-varsity-jacket-with-wetzside-script-back-design-clothoo-600x395.jpg': S('woman-black-coach'),
  ...Object.fromEntries(['wendys', 'ups-logo', 'pizza-hut-logo', 'penn-state-lions', 'michigan-state-university', 'mcdonald', 'ihop-logo'].map(l => [`${l}.svg`, `/images/logos/${l}.svg`])),
};
const unmappedImages = new Set();
const localImage = (ref) => {
  const hit = IMAGE_MAP[ref.split('/').pop()];
  if (!hit) unmappedImages.add(ref);
  return hit;
};
function mapImages(s) {
  s = s.replace(/\b(TJM|CL)\s*\+\s*'([^']+)'/g, (m, _base, name) => { const l = localImage(name); return l ? `'${l}'` : m; });
  s = s.replace(/https:\/\/(?:www\.thejacketmaker\.pk\/cdn\/shop\/files|clothoo\.com\/frontend\/images)\/[^'"\s)]+/g, (m) => localImage(m) || m);
  return s;
}
// once nothing builds URLs from them, the TJM / CL / B base constants go too
function dropUnusedBases(js) {
  for (const name of ['TJM', 'CL', 'B']) {
    if (new RegExp(`\\b${name}\\s*\\+`).test(js)) continue;
    js = js.replace(new RegExp(`(const\\s+)${name} = '[^']*',\\s*`), '$1');            // first of several
    js = js.replace(new RegExp(`,\\s*${name} = '[^']*'(;)`), '$1');                    // last of several
    js = js.replace(new RegExp(`^[ \\t]*const ${name} = '[^']*';[ \\t]*\\n`, 'm'), ''); // alone
  }
  return js;
}
// Swapping the stock photos for the client's own is opt-in (EJ_LOCAL_IMAGES=1 after
// running tools/fetch-live-images.mjs); by default the pages keep the design's pictures.
const LOCAL_IMAGES = process.env.EJ_LOCAL_IMAGES === '1';
const fixDeadImages = (s) => { const fixed = DEAD_IMAGE_FIXES.reduce((acc, [re, to]) => acc.replace(re, to), s); return LOCAL_IMAGES ? mapImages(fixed) : fixed; };

// ---------------------------------------------------------------- expressions
const JS_GLOBALS = new Set(['true', 'false', 'null', 'undefined', 'Math', 'String', 'Number', 'Boolean', 'Array', 'Object', 'JSON', 'Date']);
const INTERP = /\{\{\s*([\s\S]*?)\s*\}\}/g;
function splitInterp(str) {
  const parts = []; let last = 0; let m;
  INTERP.lastIndex = 0;
  while ((m = INTERP.exec(str))) {
    if (m.index > last) parts.push({ t: 'text', v: str.slice(last, m.index) });
    parts.push({ t: 'expr', v: m[1] });
    last = m.index + m[0].length;
  }
  if (last < str.length) parts.push({ t: 'text', v: str.slice(last) });
  return parts;
}
function noteExpr(expr, ctx) {
  const stripped = expr.replace(/'[^']*'|"[^"]*"/g, '');
  for (const id of stripped.match(/(?<![\w$.])[A-Za-z_$][\w$]*/g) || []) {
    if (JS_GLOBALS.has(id) || ctx.scope.has(id)) continue;
    ctx.used.add(id);
  }
  return expr;
}
const tplEscape = (s) => s.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
// "a {{ x }} b" -> JS expression source
function interpToJs(str, ctx) {
  const parts = splitInterp(str);
  if (parts.length === 1 && parts[0].t === 'expr') return noteExpr(parts[0].v, ctx);
  return '`' + parts.map(p => p.t === 'expr' ? '${' + noteExpr(p.v, ctx) + '}' : tplEscape(p.v)).join('') + '`';
}

// ---------------------------------------------------------------- inline style
const cssProp = (p) => p.startsWith('--') ? `'${p}'` : p.replace(/^-ms-/, 'ms-').replace(/-([a-z])/g, (_, c) => c.toUpperCase());
const jsStr = (s) => "'" + s.replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'";
function styleToJsx(str, ctx) {
  const decls = [];
  let buf = '', depth = 0;
  for (const ch of str) {
    if (ch === '(') depth++; else if (ch === ')') depth--;
    if (ch === ';' && depth === 0) { decls.push(buf); buf = ''; } else buf += ch;
  }
  if (buf.trim()) decls.push(buf);
  const out = [];
  for (const d of decls) {
    const i = d.indexOf(':'); if (i < 0) continue;
    const prop = d.slice(0, i).trim(), val = d.slice(i + 1).trim();
    if (!prop) continue;
    if (/!important/.test(val)) warn('inline !important dropped:', d.trim());
    const v = val.includes('{{') ? interpToJs(val, ctx) : jsStr(val);
    out.push(`${cssProp(prop)}: ${v}`);
  }
  return `{{ ${out.join(', ')} }}`;
}

// ---------------------------------------------------------------- attributes
const ATTR_RENAME = { class: 'className', for: 'htmlFor', tabindex: 'tabIndex', readonly: 'readOnly', maxlength: 'maxLength', minlength: 'minLength', autocomplete: 'autoComplete', autofocus: 'autoFocus', enctype: 'encType', novalidate: 'noValidate', srcset: 'srcSet', crossorigin: 'crossOrigin', allowfullscreen: 'allowFullScreen', frameborder: 'frameBorder', 'xlink:href': 'xlinkHref', 'xmlns:xlink': 'xmlnsXlink', 'accept-charset': 'acceptCharset', 'http-equiv': 'httpEquiv', onInput: 'onChange', oninput: 'onChange', onclick: 'onClick', onchange: 'onChange', onsubmit: 'onSubmit' };
const BOOL_ATTRS = new Set(['required', 'multiple', 'disabled', 'hidden', 'open', 'autoFocus', 'readOnly', 'noValidate', 'defaultChecked', 'checked', 'selected', 'controls', 'autoPlay', 'loop', 'muted', 'playsInline']);
const DROP_ATTRS = new Set(['hint-placeholder-count', 'hint-placeholder-val']);
const FORM_TAGS = new Set(['input', 'select', 'textarea']);
function attrName(name) {
  if (ATTR_RENAME[name]) return ATTR_RENAME[name];
  if (name.startsWith('data-') || name.startsWith('aria-')) return name;
  if (name.includes('-')) return name.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
  return name;
}
const jsxStr = (s) => (/["\n]/.test(s) ? `{${JSON.stringify(s)}}` : `"${s}"`);
function attrsToJsx(el, ctx, extra = {}) {
  const out = [];
  const tag = el.name;
  for (let [name, raw] of Object.entries(el.attribs)) {
    if (DROP_ATTRS.has(name) || name === 'data-screen-label') continue;
    let jsxName = attrName(name);
    const dynamic = raw.includes('{{');
    if (FORM_TAGS.has(tag) && !dynamic) {
      if (jsxName === 'value') jsxName = 'defaultValue';
      if (jsxName === 'checked') jsxName = 'defaultChecked';
    }
    if (jsxName === 'style') { out.push(`style=${styleToJsx(raw, ctx)}`); continue; }
    if (jsxName === 'href') raw = dynamic ? raw.replace(/^(Easy Jackets [^?#{]+?\.dc\.html)/, (m) => rewriteHref(m)) : rewriteHref(raw);
    if (tag === 'img' && jsxName === 'src' && raw === 'assets/easy-jacket-logo.png') raw = '/easy-jacket-logo.png'; // served from public/
    if (dynamic) { out.push(`${jsxName}={${interpToJs(raw, ctx)}}`); ctx.count.bindings++; continue; }
    if (raw === '' && BOOL_ATTRS.has(jsxName)) { out.push(jsxName); continue; }
    out.push(`${jsxName}=${jsxStr(raw)}`);
  }
  for (const [k, v] of Object.entries(extra)) out.push(`${k}=${v}`);
  // Every in-page picture is lazy and decoded off the main thread; the nav
  // and footer logos are handled by their own components.
  if (tag === 'img' && !('loading' in el.attribs)) out.push('loading="lazy"', 'decoding="async"');
  return out.length ? ' ' + out.join(' ') : '';
}

// ---------------------------------------------------------------- text
const jsxText = (s) => s.replace(/[{}<>]/g, (c) => `{'${c}'}`).replace(/ /g, '&nbsp;');
function textToJsx(raw, ctx) {
  if (!raw.trim()) return raw.includes('\n') ? null : "{' '}";
  const lead = /^\s/.test(raw) && !/^\s*\n/.test(raw);
  const trail = /\s$/.test(raw) && !/\n\s*$/.test(raw);
  const body = raw.replace(/\s+/g, ' ').trim();
  const parts = splitInterp(body).map(p => {
    if (p.t === 'expr') { ctx.count.bindings++; return '{' + noteExpr(p.v, ctx) + '}'; }
    return jsxText(p.v);
  }).join('');
  return (lead ? "{' '}" : '') + parts + (trail ? "{' '}" : '');
}

// ---------------------------------------------------------------- nav / footer detection
const textOf = (n) => n.type === 'text' ? n.data : n.type === 'tag' ? n.children.map(textOf).join('') : '';
function* walkTags(n) { if (n.type === 'tag') { yield n; for (const c of n.children) yield* walkTags(c); } else if (n.type === 'root') { for (const c of n.children) yield* walkTags(c); } }
function navProps(nav, ctx) {
  let active = null, cta = null;
  for (const a of walkTags(nav)) {
    if (a.name !== 'a') continue;
    const cls = a.attribs.class || '';
    if (/color:\s*var\(--gold-2\)/.test(a.attribs.style || '')) active = rewriteHref(a.attribs.href || '');
    if (/\bez-btn\b/.test(cls)) cta = { href: a.attribs.href || '', label: textOf(a).trim() };
  }
  const props = [];
  if (active) props.push(`active="${active}"`);
  if (!cta) throw new Error('nav without CTA');
  const lm = cta.label.match(/^Cart · (\{\{\s*cartCount\s*\}\}|\d+)$/);
  if (lm) {
    props.push('cta="cart"');
    if (lm[1].startsWith('{{')) { props.push('cartCount={cartCount}'); ctx.used.add('cartCount'); }
    else if (lm[1] !== '0') props.push(`cartCount={${lm[1]}}`);
  } else if (cta.label === 'Shop jackets' && rewriteHref(cta.href) === '/shop') {
    props.push('cta="shop"');
  } else {
    props.push(`cta={{ label: ${interpToJs(cta.label, ctx)}, href: ${interpToJs(rewriteHref(cta.href), ctx)} }}`);
  }
  return props.join(' ');
}

// ---------------------------------------------------------------- emitter
const meaningful = (kids) => kids.filter(k => !(k.type === 'text' && !k.data.trim()) && k.type !== 'comment');
function emitChildren(kids, ctx, ind) {
  const lines = [];
  for (const k of kids) {
    const s = emitNode(k, ctx, ind);
    if (s != null) lines.push(s);
  }
  return lines;
}
function emitNode(n, ctx, ind) {
  const pad = '  '.repeat(ind);
  if (n.type === 'text') { const t = textToJsx(n.data, ctx); return t == null ? null : pad + t; }
  if (n.type === 'comment') { ctx.count.comments++; return `${pad}{/* ${n.data.trim().replace(/\*\//g, '* /')} */}`; }
  if (n.type !== 'tag' && n.type !== 'script' && n.type !== 'style') return null;
  const tag = n.name;
  if (tag === 'sc-for') return emitFor(n, ctx, ind);
  if (tag === 'sc-if') return emitIf(n, ctx, ind);
  if (tag === 'nav' && /\bez-nav\b/.test(n.attribs.class || '')) { ctx.count.nav++; return `${pad}<Nav ${navProps(n, ctx)} />`; }
  if (tag === 'footer') { ctx.count.footer++; return `${pad}<Footer />`; }
  if (tag === 'image-slot') {
    ctx.count.slots++;
    const attrs = attrsToJsx({ name: 'image-slot', attribs: Object.fromEntries(Object.entries(n.attribs).map(([k, v]) => [k === 'id' ? 'slot' : k, v])) }, ctx);
    return `${pad}<ImageSlot${attrs} />`;
  }
  const label = n.attribs['data-screen-label'];
  const jsxTag = tag === 'a' ? 'A' : tag;
  const attrs = attrsToJsx(n, ctx);
  const kids = n.children || [];
  const pre = label ? `${pad}{/* ${label} */}\n` : '';
  if (label) ctx.count.sections++;
  if (tag === 'textarea' && kids.length) {
    const txt = textOf(n);
    return `${pre}${pad}<textarea${attrs} defaultValue=${jsxStr(txt)} />`;
  }
  if (!meaningful(kids).length && !kids.some(k => k.type === 'text' && k.data.trim())) return `${pre}${pad}<${jsxTag}${attrs} />`;
  const inner = emitChildren(kids, ctx, ind + 1);
  const oneLine = inner.length === 1 && !inner[0].includes('\n') && (inner[0].trim().length + attrs.length + tag.length * 2 + pad.length) < 140 && !/^\s*\{\/\*/.test(inner[0]);
  if (oneLine) return `${pre}${pad}<${jsxTag}${attrs}>${inner[0].trim()}</${jsxTag}>`;
  return `${pre}${pad}<${jsxTag}${attrs}>\n${inner.join('\n')}\n${pad}</${jsxTag}>`;
}
// A section-label comment emitted ahead of an element must sit outside any
// wrapping `cond ? (` / `.map(() => (` parens, or the JSX is invalid.
function hoistComment(s, pad) {
  const m = s.match(/^\s*(\{\/\*[^\n]*\*\/\})\n([\s\S]*)$/);
  return m ? { pre: `${pad}${m[1]}\n`, body: m[2] } : { pre: '', body: s };
}
function emitFor(n, ctx, ind) {
  ctx.count.loops++;
  const pad = '  '.repeat(ind);
  const listExpr = interpToJs(n.attribs.list || '', ctx);
  const as = n.attribs.as || 'item';
  const idx = `${as}Idx`;
  const inner = { ...ctx, scope: new Set([...ctx.scope, as, idx]) };
  const kids = meaningful(n.children);
  if (kids.length === 1 && kids[0].type === 'tag' && kids[0].name !== 'sc-for' && kids[0].name !== 'sc-if') {
    // single element child: put the key straight on it
    const { pre, body } = hoistComment(emitNode(kids[0], inner, ind + 1), pad);
    const s = body.replace(/^(\s*)<([A-Za-z][\w.]*)/, (m, p, t) => `${p}<${t} key={${idx}}`);
    return `${pre}${pad}{${listExpr}.map((${as}, ${idx}) => (\n${s}\n${pad}))}`;
  }
  const body = emitChildren(n.children, inner, ind + 2);
  return `${pad}{${listExpr}.map((${as}, ${idx}) => (\n${pad}  <Fragment key={${idx}}>\n${body.join('\n')}\n${pad}  </Fragment>\n${pad}))}`;
}
function emitIf(n, ctx, ind) {
  ctx.count.conds++;
  const pad = '  '.repeat(ind);
  const cond = interpToJs(n.attribs.value || '', ctx);
  const kids = meaningful(n.children);
  if (kids.length === 1) {
    const { pre, body } = hoistComment(emitNode(kids[0], ctx, ind + 1), pad);
    return `${pre}${pad}{${cond} ? (\n${body}\n${pad}) : null}`;
  }
  const body = emitChildren(n.children, ctx, ind + 2);
  return `${pad}{${cond} ? (\n${pad}  <>\n${body.join('\n')}\n${pad}  </>\n${pad}) : null}`;
}

// ---------------------------------------------------------------- logic
// Scans a JS source at brace depth 0, aware of strings, template literals and comments.
function skipString(src, i) { const q = src[i]; i++; while (i < src.length && src[i] !== q) { if (src[i] === '\\') i++; i++; } return i; }
function scanMembers(src) {
  const members = []; let i = 0; const n = src.length;
  const skipWs = () => { while (i < n && /\s/.test(src[i])) i++; };
  const skipBalanced = (open, close) => { // src[i] === open
    let d = 0;
    for (; i < n; i++) {
      const c = src[i];
      if (c === "'" || c === '"' || c === '`') { i = skipString(src, i); continue; }
      if (c === '/' && src[i + 1] === '/') { while (i < n && src[i] !== '\n') i++; continue; }
      if (c === '/' && src[i + 1] === '*') { i += 2; while (i < n && !(src[i] === '*' && src[i + 1] === '/')) i++; i++; continue; }
      if (c === open) d++;
      else if (c === close) { d--; if (d === 0) { i++; return; } }
    }
  };
  while (i < n) {
    skipWs(); if (i >= n) break;
    const m = src.slice(i).match(/^(static\s+)?([A-Za-z_$][\w$]*)\s*(=|\()/);
    if (!m) throw new Error('cannot parse class member at: ' + src.slice(i, i + 60));
    const isStatic = !!m[1], name = m[2], kind = m[3] === '(' ? 'method' : 'field';
    i += m[0].length - 1;
    if (kind === 'method') {
      const argStart = i; skipBalanced('(', ')'); const args = src.slice(argStart + 1, i - 1);
      skipWs(); if (src[i] !== '{') throw new Error('method body expected for ' + name);
      const bodyStart = i; skipBalanced('{', '}');
      members.push({ kind, name, args, body: src.slice(bodyStart + 1, i - 1) });
    } else {
      i++; // '='
      const valStart = i;
      let d = 0;
      for (; i < n; i++) {
        const c = src[i];
        if (c === "'" || c === '"' || c === '`') { i = skipString(src, i); continue; }
        if (c === '(' || c === '[' || c === '{') d++;
        else if (c === ')' || c === ']' || c === '}') d--;
        else if (c === ';' && d === 0) break;
      }
      members.push({ kind, name, isStatic, value: src.slice(valStart, i).trim() });
      i++;
    }
  }
  return members;
}
const dedent = (s) => {
  const lines = s.replace(/^\n+|\s+$/g, '').split('\n');
  const ind = Math.min(...lines.filter(l => l.trim()).map(l => l.match(/^ */)[0].length));
  return lines.map(l => l.slice(ind)).join('\n');
};
const indent = (s, n) => s.split('\n').map(l => (l.trim() ? ' '.repeat(n) + l : l)).join('\n');

function convertLogic(scriptHtml, page) {
  const res = { statics: [], helpers: [], initialState: null, render: null, lifecycle: [], needsNavigate: false, props: null, notes: [] };
  const pm = scriptHtml.match(/data-props="([^"]*)"/);
  if (pm) res.props = JSON.parse(pm[1].replace(/&quot;/g, '"'));
  let js = scriptHtml.replace(/^[\s\S]*?<script[^>]*>/, '').replace(/<\/script>[\s\S]*$/, '');
  js = rewriteLinksInJs(js);
  const cm = js.match(/class\s+Component\s+extends\s+DCLogic\s*\{/);
  if (!cm) throw new Error('no Component class in ' + page.file);
  const bodyStart = cm.index + cm[0].length;
  const classBody = js.slice(bodyStart, js.lastIndexOf('}'));
  const members = scanMembers(classBody);
  const methodNames = members.filter(m => m.kind === 'method').map(m => m.name);
  const staticNames = members.filter(m => m.isStatic).map(m => m.name);
  const fix = (code) => {
    let c = code;
    c = c.replace(/this\.setState\(/g, 'setState(');
    c = c.replace(/this\.state\b/g, 'state');
    c = c.replace(/this\.props\b/g, 'props');
    for (const s of staticNames) c = c.replace(new RegExp(`Component\\.${s}\\b`, 'g'), s);
    for (const mname of methodNames) c = c.replace(new RegExp(`this\\.${mname}\\(`, 'g'), `${mname}(`);
    c = c.replace(/location\.href\s*=\s*('[^']*')/g, (_, r) => { res.needsNavigate = true; return `navigate(${r})`; });
    if (/\bthis\b/.test(c.replace(/'[^']*'/g, ''))) res.notes.push('remaining `this` reference — needs hand conversion');
    return c;
  };
  for (const m of members) {
    if (m.kind === 'field' && m.name === 'state') res.initialState = fix(m.value);
    else if (m.kind === 'field' && m.isStatic) res.statics.push(`const ${m.name} = ${fix(dedent(m.value))};`);
    else if (m.kind === 'field') res.notes.push(`unhandled field ${m.name}`);
    else if (m.name === 'renderVals') res.render = dropUnusedBases(fix(m.body));
    else if (m.name === 'componentDidMount' || m.name === 'componentWillUnmount' || m.name === 'componentDidUpdate') res.lifecycle.push({ name: m.name, body: fix(m.body) });
    else res.helpers.push(`function ${m.name}(${m.args}) {\n${indent(dedent(m.body), 2)}\n}`);
  }
  if (/\bstate\s*=\s*\{/.test(res.render || '')) res.notes.push('direct state assignment inside renderVals — needs hand conversion');
  if (res.render == null) throw new Error('no renderVals in ' + page.file);
  return res;
}

// ---------------------------------------------------------------- CSS
function flatCss(css) {
  const out = []; let i = 0;
  const readBlock = () => { let d = 0, s = i; for (; i < css.length; i++) { if (css[i] === '{') d++; else if (css[i] === '}') { d--; if (d === 0) { i++; return css.slice(s, i); } } } return css.slice(s); };
  while (i < css.length) {
    const rest = css.slice(i); const m = rest.match(/^\s*([^{]+)\{/); if (!m) break;
    const sel = m[1].trim(); i += m[0].length - 1; const blk = readBlock(); const body = blk.slice(1, -1).trim();
    if (sel.startsWith('@media')) for (const r of flatCss(body)) out.push({ media: sel, sel: r.sel, body: r.body });
    else out.push({ media: null, sel, body: body.replace(/\s+/g, ' ').trim() });
  }
  return out;
}
const propsOf = (body) => body.split(';').map(d => d.split(':')[0].trim().toLowerCase()).filter(Boolean);
// Two rule bodies are the same rule when their declarations are the same:
// duplicates collapse (last wins), whitespace is irrelevant, and `ease` is
// the default timing function so `.15s ease` equals `.15s`.
function normalizeBody(body) {
  const decls = new Map();
  for (const d of body.split(';')) {
    const i = d.indexOf(':'); if (i < 0) continue;
    const prop = d.slice(0, i).trim().toLowerCase();
    let val = d.slice(i + 1).replace(/\s+/g, ' ').trim();
    if (prop === 'transition') val = val.replace(/\s+ease\b(?!-)/g, '');
    if (prop) decls.set(prop, val);
  }
  return [...decls].map(([p, v]) => `${p}:${v}`).join('; ') + ';';
}
const NAV_SEL = /^(\.ez-nav\b|\.ez-dd\b|\.ez-sub\b|footer\b|\.ez-hide-sm\b)/;
const GLOBAL_ALWAYS = /^(:root|html|body|a|a:hover|:focus-visible|@keyframes)/;
const scopeSel = (sel, slug) => sel.split(',').map(s => `.pg-${slug} ${s.trim()}`).join(', ');

// ---------------------------------------------------------------- main
const report = [];
const allCss = new Map(); // key -> Map(body -> [slug])
const pageCss = new Map(); // slug -> flat rules
const parsed = [];
for (const page of PAGES) {
  const html = fs.readFileSync(path.join(DESIGN, page.file), 'utf8');
  const helmet = html.match(/<helmet>([\s\S]*?)<\/helmet>/)[1];
  const css = (helmet.match(/<style>([\s\S]*?)<\/style>/) || [])[1] || '';
  const after = html.slice(html.indexOf('</helmet>') + '</helmet>'.length);
  const scriptIdx = after.indexOf('<script type="text/x-dc"');
  const tpl = fixDeadImages(after.slice(0, scriptIdx).replace(/<\/x-dc>\s*$/, ''));
  const script = fixDeadImages(after.slice(scriptIdx, after.indexOf('</script>', scriptIdx) + '</script>'.length));
  const rules = flatCss(css).map(r => ({ ...r, body: normalizeBody(r.body) }));
  pageCss.set(page.slug, rules);
  for (const r of rules) {
    const k = (r.media || '') + '|' + r.sel;
    if (!allCss.has(k)) allCss.set(k, new Map());
    const m = allCss.get(k); if (!m.has(r.body)) m.set(r.body, []); m.get(r.body).push(page.slug);
  }
  parsed.push({ page, tpl, script, html });
}
// global = majority body when it is shared by >= 2 pages (and not a nav/footer selector)
const globalBody = new Map();
for (const [k, m] of allCss) {
  const sel = k.split('|')[1];
  if (NAV_SEL.test(sel)) continue;
  const [body, pages] = [...m.entries()].sort((a, b) => b[1].length - a[1].length)[0];
  if (pages.length >= 2 || GLOBAL_ALWAYS.test(sel)) globalBody.set(k, body);
}
if (WRITE_SHARED_CSS) {
  const lines = ['/* Shared component classes carried over from the design export. */', ''];
  const byMedia = new Map();
  // tokens.css owns the page-wide rules (:root, body, keyframes…) so they are not repeated here
  for (const [k, body] of globalBody) { const [media, sel] = k.split('|'); if (GLOBAL_ALWAYS.test(sel)) continue; if (!byMedia.has(media)) byMedia.set(media, []); byMedia.get(media).push({ sel, body }); }
  for (const [media, rs] of byMedia) {
    if (media) lines.push(`${media} {`);
    for (const r of rs) lines.push(`${media ? '  ' : ''}${r.sel} { ${r.body} }`);
    if (media) lines.push('}');
  }
  fs.mkdirSync(path.join(OUT, 'styles'), { recursive: true });
  fs.writeFileSync(path.join(OUT, 'styles', 'ui.css'), lines.join('\n') + '\n');
  console.log('wrote styles/ui.css with', globalBody.size, 'rules');
}

fs.mkdirSync(path.join(OUT, 'pages'), { recursive: true });
if (CHROME_OUT) fs.mkdirSync(CHROME_OUT, { recursive: true });
for (const { page, tpl, script } of parsed) {
  const ctx = { scope: new Set(), used: new Set(), count: { loops: 0, conds: 0, slots: 0, bindings: 0, sections: 0, comments: 0, nav: 0, footer: 0 } };
  const doc = htmlparser2.parseDocument(tpl, { lowerCaseTags: false, lowerCaseAttributeNames: false, decodeEntities: true, recognizeSelfClosing: true });
  if (CHROME_OUT && page.name === 'NotFound') {
    for (const t of walkTags(doc)) {
      if (t.name === 'nav' || t.name === 'footer') {
        const c2 = { ...ctx, used: new Set(), count: { ...ctx.count } };
        const out = `<${t.name}${attrsToJsx(t, c2)}>\n${emitChildren(t.children, c2, 1).join('\n')}\n</${t.name}>`;
        fs.writeFileSync(path.join(CHROME_OUT, `${t.name}.jsx`), out + '\n\n// bindings used: ' + [...c2.used].join(', ') + '\n');
      }
    }
  }
  const jsx = emitChildren(doc.children, ctx, 3).join('\n');
  const logic = convertLogic(script, page);

  // page-scoped css
  const scoped = [];
  for (const r of pageCss.get(page.slug)) {
    const k = (r.media || '') + '|' + r.sel;
    if (NAV_SEL.test(r.sel)) continue;
    const g = globalBody.get(k);
    if (g === r.body) continue;
    let body = r.body;
    if (g != null) {
      const missing = propsOf(g).filter(p => !propsOf(r.body).includes(p));
      if (missing.length) body = missing.map(p => `${p}: revert`).join('; ') + '; ' + body;
    }
    const sel = r.sel.startsWith('@keyframes') ? r.sel : scopeSel(r.sel, page.slug);
    scoped.push({ media: r.media, sel, body });
  }
  let cssFile = null;
  if (scoped.length) {
    const lines = [`/* ${page.name}: rules that only this page carries in the design export. */`, ''];
    let curMedia = null;
    for (const r of scoped) {
      if (r.media !== curMedia) { if (curMedia) lines.push('}'); if (r.media) lines.push(`${r.media} {`); curMedia = r.media; }
      lines.push(`${r.media ? '  ' : ''}${r.sel} { ${r.body} }`);
    }
    if (curMedia) lines.push('}');
    cssFile = `${page.name}.css`;
    fs.writeFileSync(path.join(OUT, 'pages', cssFile), lines.join('\n') + '\n');
  }

  // assemble the component
  const usesFragment = /<Fragment\b/.test(jsx);
  const hooks = [];
  if (logic.initialState) hooks.push("import { useDcState } from '../lib/useDcState';");
  if (logic.props) hooks.push("import { usePageProps } from '../lib/usePageProps';");
  const reactImports = [usesFragment && 'Fragment', logic.lifecycle.length && 'useEffect'].filter(Boolean);
  const rr = [logic.needsNavigate && 'useNavigate'].filter(Boolean);
  const comps = [];
  if (/<A\b/.test(jsx)) comps.push("import A from '../components/A';");
  if (/<ImageSlot\b/.test(jsx)) comps.push("import ImageSlot from '../components/ImageSlot';");
  if (/<Nav\b/.test(jsx)) comps.push("import Nav from '../components/Nav';");
  if (/<Footer\b/.test(jsx)) comps.push("import Footer from '../components/Footer';");

  const declared = new Set();
  for (const m of logic.render.matchAll(/\b(?:const|let|var|function)\s+([A-Za-z_$][\w$]*)/g)) declared.add(m[1]);
  const destructure = [...ctx.used].filter(id => !['state', 'setState', 'props', 'navigate'].includes(id)).sort();

  const lines = [];
  lines.push(`// Converted from design/${page.file}`);
  if (reactImports.length) lines.push(`import { ${reactImports.join(', ')} } from 'react';`);
  if (rr.length) lines.push(`import { ${rr.join(', ')} } from 'react-router-dom';`);
  lines.push(...hooks, ...comps);
  if (cssFile) lines.push(`import './${cssFile}';`);
  lines.push('');
  if (logic.props) {
    lines.push('const PAGE_PROPS = {');
    for (const [k, m] of Object.entries(logic.props)) lines.push(`  ${k}: { type: '${m.editor}', ${m.options ? `options: ${JSON.stringify(m.options)}, ` : ''}default: ${JSON.stringify(m.default)} },`);
    lines.push('};', '');
  }
  if (logic.statics.length) lines.push(...logic.statics, '');
  if (logic.initialState) lines.push(`const INITIAL_STATE = ${logic.initialState};`, '');
  lines.push(`export default function ${page.name}() {`);
  if (logic.props) lines.push('  const props = usePageProps(PAGE_PROPS);');
  if (logic.initialState) lines.push('  const [state, setState] = useDcState(INITIAL_STATE);');
  if (logic.needsNavigate) lines.push('  const navigate = useNavigate();');
  for (const lc of logic.lifecycle) lines.push('', `  // LIFECYCLE ${lc.name} — convert to useEffect by hand:`, indent(dedent(lc.body), 2).replace(/^/gm, '  // '));
  if (logic.helpers.length) lines.push('', ...logic.helpers.map(h => indent(h, 2)));
  lines.push('', '  function renderVals() {', indent(dedent(logic.render), 4), '  }', '');
  lines.push(`  const { ${destructure.join(', ')} } = renderVals();`, '');
  lines.push('  return (', `    <div className="pg-${page.slug}">`, jsx, '    </div>', '  );', '}', '');
  fs.writeFileSync(path.join(OUT, 'pages', `${page.name}.jsx`), lines.join('\n'));

  // coverage: what the source contains vs what we emitted
  const src = { loops: (tpl.match(/<sc-for\b/g) || []).length, conds: (tpl.match(/<sc-if\b/g) || []).length, slots: (tpl.match(/<image-slot\b/g) || []).length, sections: (tpl.match(/data-screen-label=/g) || []).length, comments: (tpl.match(/<!--/g) || []).length };
  const c = ctx.count;
  const ok = ['loops', 'conds', 'slots', 'sections', 'comments'].every(k => src[k] === c[k]) && c.nav === 1 && c.footer === 1;
  report.push({ page: page.name, ok, src, out: c, css: scoped.length, notes: logic.notes, declaredCollisions: destructure.filter(d => declared.has(d)) });
}
if (LOCAL_IMAGES && unmappedImages.size) console.log('\n! stock images without a local replacement:\n  ' + [...unmappedImages].join('\n  '));
console.log('\npage                 ok  loops   conds  slots  sect   cmts   css  notes');
for (const r of report) console.log(`${r.page.padEnd(20)} ${r.ok ? 'OK ' : 'XX '} ${String(r.out.loops).padStart(3)}/${String(r.src.loops).padEnd(3)} ${String(r.out.conds).padStart(3)}/${String(r.src.conds).padEnd(3)} ${String(r.out.slots).padStart(2)}/${String(r.src.slots).padEnd(2)} ${String(r.out.sections).padStart(3)}/${String(r.src.sections).padEnd(3)} ${String(r.out.comments).padStart(3)}/${String(r.src.comments).padEnd(3)} ${String(r.css).padStart(3)}  ${r.notes.join('; ')}${r.declaredCollisions.length ? ' | destructure collides with locals: ' + r.declaredCollisions.join(',') : ''}`);
