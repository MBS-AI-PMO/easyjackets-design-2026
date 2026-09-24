// Hand conversions applied on top of tools/convert-design.mjs output.
// Every edit targets a freshly generated page; run this after each re-conversion.
import fs from 'node:fs';

const edit = (file, pairs) => {
  let s = fs.readFileSync(file, 'utf8');
  for (const [from, to] of pairs) {
    if (!s.includes(from)) throw new Error(`${file}: pattern not found:\n${from}`);
    s = s.replace(from, to);
  }
  fs.writeFileSync(file, s);
  console.log('post-convert:', file);
};

// MaterialColors: the copy-toast timer lived on the class instance
edit('src/pages/MaterialColors.jsx', [
  ["import { useDcState } from '../lib/useDcState';", "import { useRef } from 'react';\nimport { useDcState } from '../lib/useDcState';"],
  ["  const [state, setState] = useDcState(INITIAL_STATE);\n", "  const [state, setState] = useDcState(INITIAL_STATE);\n  const timer = useRef(null);\n"],
  ["clearTimeout(this.t);", "clearTimeout(timer.current);"],
  ["this.t = setTimeout(", "timer.current = setTimeout("],
]);

// Cart: the scenario prop seeded state by assigning this.state mid-render
edit('src/pages/Cart.jsx', [
  ["import { usePageProps } from '../lib/usePageProps';", "import { useEffect } from 'react';\nimport { usePageProps } from '../lib/usePageProps';"],
  ["export default function Cart() {\n  const props = usePageProps(PAGE_PROPS);\n  const [state, setState] = useDcState(INITIAL_STATE);\n",
   "// The cart contents follow the `scenario` prop (filled / team / empty).\nconst scenarioState = (scenario) => ({\n  items: scenario === 'empty' ? [] : scenario === 'team' ? TEAM : ITEMS,\n  scenario,\n  promo: scenario === 'team' ? 'TEAM10' : '',\n  promoMsg: scenario === 'team' ? 'TEAM10 applied — 10% off' : '',\n});\n\nexport default function Cart() {\n  const props = usePageProps(PAGE_PROPS);\n  const scenario = props.scenario ?? 'filled';\n  const [state, setState] = useDcState({ ...INITIAL_STATE, ...scenarioState(scenario) });\n  useEffect(() => {\n    setState((prev) => (prev.scenario === scenario ? prev : scenarioState(scenario)));\n  }, [scenario, setState]);\n"],
  ["    const scenario = props.scenario ?? 'filled';\n    if (state.scenario !== scenario) {\n      const items = scenario === 'empty' ? [] : scenario === 'team' ? TEAM : ITEMS;\n      state = { ...state, items, scenario, promo: scenario === 'team' ? 'TEAM10' : '', promoMsg: scenario === 'team' ? 'TEAM10 applied — 10% off' : '' };\n    }\n", ""],
]);

// BlogPost: reading-progress bar was a componentDidMount scroll listener
{
  const file = 'src/pages/BlogPost.jsx';
  let s = fs.readFileSync(file, 'utf8');
  const re = /\n  \/\/ LIFECYCLE componentDidMount[\s\S]*?\/\/   window\.removeEventListener\('scroll', this\.onScroll\);\n/;
  if (!re.test(s)) throw new Error('BlogPost lifecycle block not found');
  s = s.replace(re, `
  // Reading progress: measured on scroll, throttled to one update per frame
  // and only committed when the rounded value actually changes.
  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      const a = document.getElementById('article'); if (!a) return;
      const r = a.getBoundingClientRect(), vh = window.innerHeight;
      const p = Math.min(1, Math.max(0, (vh - r.top) / (r.height + vh * 0.5)));
      const progress = Math.round(p * 100);
      setState((prev) => (prev.progress === progress ? prev : { progress }));
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(measure); };
    window.addEventListener('scroll', onScroll, { passive: true });
    measure();
    return () => { window.removeEventListener('scroll', onScroll); if (frame) cancelAnimationFrame(frame); };
  }, [setState]);
`);
  fs.writeFileSync(file, s); console.log('post-convert:', file);
}

// Shop: honour the nav's ?style= / ?material= links (the export ignored them)
edit('src/pages/Shop.jsx', [
  ["import { useDcState } from '../lib/useDcState';", "import { useEffect, useMemo } from 'react';\nimport { useSearchParams } from 'react-router-dom';\nimport { useDcState } from '../lib/useDcState';"],
  ["export default function Shop() {\n  const [state, setState] = useDcState(INITIAL_STATE);\n",
   "// The header's Shop menu links here with ?style= / ?material=; map those\n// labels onto the page's own filter keys.\nconst STYLE_TO_TYPE = { 'Varsity Jackets': 'varsity', 'Cropped Varsity Jackets': 'varsity', 'Bomber Jackets': 'bomber', 'Coach Jackets': 'coach', Hoodies: 'hoodie' };\nconst MATERIAL_TO_KEY = { 'Melton Wool': 'wool', 'Faux Leather': 'faux', 'Polyester Satin': 'satin', 'Cotton Fleece': 'fleece', 'Sheep Leather': 'leather', 'Cowhide Leather': 'leather', Nylon: 'nylon' };\nconst filtersFromQuery = (params) => ({\n  type: STYLE_TO_TYPE[params.get('style')] ?? 'all',\n  materials: MATERIAL_TO_KEY[params.get('material')] ? [MATERIAL_TO_KEY[params.get('material')]] : [],\n});\n\nexport default function Shop() {\n  const [params] = useSearchParams();\n  const fromQuery = useMemo(() => filtersFromQuery(params), [params]);\n  const [state, setState] = useDcState({ ...INITIAL_STATE, ...fromQuery });\n  useEffect(() => { setState(fromQuery); }, [fromQuery, setState]);\n"],
]);

// Home: the "Popular picks" and bestseller grids go two-up on phones (.ez-grid-2-sm in tokens.css)
edit('src/pages/Home.jsx', [
  ["<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '20px' }}>\n          {picks.map(",
   "<div className=\"ez-grid-2-sm\" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '20px' }}>\n          {picks.map("],
  ["<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '28px 20px' }}>\n          {products.map(",
   "<div className=\"ez-grid-2-sm\" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '28px 20px' }}>\n          {products.map("],
]);


// Home: the hero photo column is right-aligned and vh-sized for desktop; on phones it fills the width (.ez-hero-media in tokens.css)
edit('src/pages/Home.jsx', [
  ["<div style={{ position: 'relative', animation: 'rise .7s .15s ease both', justifySelf: 'end', width: 'min(100%,calc((100vh - 230px) * 0.8))' }}>",
   "<div className=\"ez-hero-media\" style={{ position: 'relative', animation: 'rise .7s .15s ease both', justifySelf: 'end', width: 'min(100%,calc((100vh - 230px) * 0.8))' }}>"],
]);

// Home: bigger hero headline on phones (.ez-hero-title in tokens.css)
edit('src/pages/Home.jsx', [
  ["<h1 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(48px,6.4vw,92px)', lineHeight: '0.88', letterSpacing: '-0.005em', textTransform: 'uppercase', margin: '16px 0 0' }}>",
   "<h1 className=\"ez-hero-title\" style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(48px,6.4vw,92px)', lineHeight: '0.88', letterSpacing: '-0.005em', textTransform: 'uppercase', margin: '16px 0 0' }}>"],
]);

// Home: the two hero buttons are the same size on phones (.ez-hero-actions in tokens.css)
edit('src/pages/Home.jsx', [
  ["<div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginTop: '24px' }}>\n              <A href={primaryHref} className=\"ez-btn ez-btn-ink\">",
   "<div className=\"ez-hero-actions\" style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginTop: '24px' }}>\n              <A href={primaryHref} className=\"ez-btn ez-btn-ink\">"],
]);

// Home: the hero stats line up in two columns on phones (.ez-hero-stats in tokens.css)
edit('src/pages/Home.jsx', [
  ["<div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px 36px', marginTop: '32px' }}>",
   "<div className=\"ez-hero-stats\" style={{ display: 'flex', flexWrap: 'wrap', gap: '20px 36px', marginTop: '32px' }}>"],
]);

// ---------------------------------------------------------------------------
// Pictures. The converter maps every stock URL to a client picture by file
// name; these are the items whose stock picture stood for something else.
const P = (n) => `/images/products/${n}.webp`, S = (n) => `/images/site/${n}.webp`;
function setImage(file, needle, img) {
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  const hits = lines.map((l, i) => (l.includes(needle) ? i : -1)).filter((i) => i >= 0);
  if (hits.length !== 1) throw new Error(`${file}: expected one line containing ${JSON.stringify(needle)}, found ${hits.length}`);
  const i = hits[0];
  const before = lines[i];
  if (/\b(src|img): /.test(before)) lines[i] = before.replace(/\b(src|img): ('[^']*'|[A-Z]+ \+ '[^']*')/, `$1: '${img}'`);
  else if (/ src="[^"]*"/.test(before)) lines[i] = before.replace(/ src="[^"]*"/, ` src="${img}"`);
  else if (/ shape="rect"/.test(before)) lines[i] = before.replace(/ shape="rect"/, ` shape="rect" src="${img}"`);
  else throw new Error(`${file}: no image on line ${i + 1}`);
  if (lines[i] === before) throw new Error(`${file}: image not changed on line ${i + 1}`);
  fs.writeFileSync(file, lines.join('\n'));
}
const pictures = {
  'src/pages/Home.jsx': [
    ["name: 'All-Leather'", P('black-all-leather-varsity')],
    ["name: 'Puffer'", P('black-softshell-varsity')],
    ["title: 'Styling women’s hoodies, effortlessly'", S('woman-blue-hoodie')],
    ['slot="v2-builder"', S('builder-colors')],
  ],
  'src/pages/Shop.jsx': [
    ["name: 'Maroon Wool, Cream Leather Sleeves'", P('maroon-white-varsity')],
    ["name: 'Forest Green Vegan-Leather Varsity'", P('forest-green-black-varsity')],
    ["name: 'Red & White Fleece Jacket'", P('red-white-hooded-varsity')],
    ["name: 'Black Nylon Bomber'", P('black-satin-bomber')],
    ["name: 'Pullover Fleece Hoodie, Sleeve Stripes'", P('green-hoodie')],
    ["name: 'Red Hooded Coach Jacket'", P('red-coach-jacket')],
    ["name: 'Black Hooded Puffer'", P('black-hooded-varsity')],
  ],
  'src/pages/HowToDesign.jsx': [
    ["slot: 'ht-1'", S('builder-style')],
    ["slot: 'ht-2'", S('builder-body')],
    ["slot: 'ht-3'", S('builder-trim')],
    ["slot: 'ht-4'", S('red-s-jacket')],
    ["slot: 'ht-5'", S('builder-letters')],
    ["slot: 'ht-6'", S('builder-review')],
  ],
  'src/pages/Gallery.jsx': [
    ["cap: 'Suede varsity'", S('woman-red-white-detail')],
    ["cap: 'Back embroidery'", S('back-embroidery-robinson')],
    ["cap: 'Band jackets'", S('jackets-pile')],
    ["cap: 'Staff bombers'", P('black-satin-bomber')],
    ["cap: 'Cropped varsity'", P('red-white-cropped-varsity')],
  ],
  'src/pages/Fabrics.jsx': [
    ["id: 'cowhide-leather'", S('leather-rolls')],
    ["id: 'sheep-leather'", S('leather-navy')],
    ["id: 'faux-leather'", S('leather-olive')],
    ["id: 'polyester-satin'", P('royal-blue-satin-varsity')],
    ["id: 'cotton-twill'", P('black-cotton-twill-racing')],
    ["id: 'soft-shell'", P('black-softshell-varsity')],
  ],
  'src/pages/Dashboard.jsx': [
    ["id: 'EJ-24812'", S('ec-navy-white')],
    ["id: 'EJ-24655'", P('black-satin-bomber')],
    ["id: 'EJ-23190'", P('maroon-white-varsity')],
    ["slot: 'line-1'", S('ec-navy-white')],
    ["slot: 'line-2'", S('chenille-aka')],
    ["slot: 'des-1'", S('ec-navy-white')],
    ["slot: 'des-3'", P('black-satin-bomber')],
  ],
  'src/pages/Cart.jsx': [["name: 'Sleeve number embroidery'", S('red-s-jacket')]],
  'src/pages/About.jsx': [
    ["slot: 'val-2'", S('leather-rolls')],
    ["slot: 'val-4'", S('woman-red-white-detail')],
  ],
  'src/pages/Design.jsx': [
    ["name: 'Cropped Varsity Jackets'", P('pink-cropped-varsity')],
    ["name: 'Coach Jackets'", P('red-coach-jacket')],
    ["name: 'Bomber Jackets'", P('black-satin-bomber')],
  ],
  'src/pages/Contact.jsx': [['slot="contact-photo"', S('jackets-on-rail')]],
  'src/pages/Blog.jsx': [
    ['id: 7,', S('woman-blue-hoodie')],
    ['id: 10,', S('leather-rolls')],
  ],
  'src/pages/SizeChart.jsx': [['slot="size-diagram"', S('jacket-measurement')]],
  'src/pages/Product.jsx': [
    ["alt: 'Chest detail'", P('all-black-leather-varsity-2')],
    ["alt: 'Leather sleeve'", P('all-black-leather-varsity-3')],
  ],
};
if (process.env.EJ_LOCAL_IMAGES === '1') {
  for (const [file, list] of Object.entries(pictures)) for (const [needle, img] of list) setImage(file, needle, img);
  console.log('post-convert: pictures placed on', Object.keys(pictures).length, 'pages');
}
