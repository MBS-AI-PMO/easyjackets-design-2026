// Editable storefront pages (admin: Content -> How to Design Page, Content -> Terms & Conditions): the content
// each page shipped with, stored in the database on start-up when the page has no row yet, and the cleaning
// applied to every save and read (only the known fields, plain text of a bounded length, image addresses on the
// web or this site, links to this site or https). The storefront renders this content as text (React escapes
// it); the one exception is a Terms section's text, which is HTML reduced to the blog articles' safe subset.
import PageContent from '../models/pageContent.js';
import { sanitizeArticleHtml } from './ssrHtml.js';
import { TERMS_DEFAULTS } from '../data/termsDefaults.js';

const HTD = '/images/how-to-design';

const HOW_TO_DESIGN = {
  header: {
    eyebrow: 'Design guide',
    titleLine1: 'How to design',
    titleLine2: 'your jacket.',
    intro: 'A step-by-step walkthrough of our Design Lab — choose materials, styles, colors, and add your personal touch.',
    chips: ['Custom Varsity Jackets', 'Custom Bomber Jackets', 'Custom Fleece Jackets', 'Custom Coach Jackets'],
  },
  overview: {
    image: `${HTD}/overview.webp`,
    alt: 'Select custom jacket style: varsity jacket, bomber jacket, fleece hoodie and coach jacket',
  },
  steps: [
    {
      title: 'Choose Your Material',
      desc: 'The tool will ask which material you want for your jacket. Choose from premium options including our famous cowhide leather.',
      image: `${HTD}/1-material.webp`,
    },
    {
      title: 'Select Your Style',
      desc: 'Customize every detail of your jacket with 6 different styling options across various parts.',
      substeps: [
        { label: 'Collar Type', detail: '6 various collar types to choose from', image: `${HTD}/2-collar.webp` },
        { label: 'Sleeve Style', detail: '2 sleeve styles available', image: `${HTD}/2-sleeves.webp` },
        { label: 'Front Closure', detail: 'Zipper or button options', image: `${HTD}/2-front-closure.webp` },
        { label: 'Pocket Style', detail: '6 pocket options to choose from', image: `${HTD}/2-pockets.webp` },
        { label: 'Knit / Trim', detail: '5 options to choose from', image: `${HTD}/2-knit-trim.webp` },
        { label: 'Lining', detail: '3 lining options available', image: `${HTD}/2-lining.webp` },
      ],
    },
    {
      title: 'Advanced Options',
      desc: 'Add extra details to make your jacket truly unique.',
      bullets: ['Add a chest pocket', 'Shoulder inserts available', 'Piping can be added', 'Cuffs pro/simple options'],
      image: `${HTD}/3-advanced.webp`,
    },
    {
      title: 'Pick Your Colors',
      desc: 'Color every part of the jacket body to match your personal style or team colors.',
      image: `${HTD}/4-colors.webp`,
      resultImage: `${HTD}/4-colors-result.webp`,
      resultCaption: 'After choosing colors, here’s a sample result:',
    },
    {
      title: 'Add Custom Designs',
      desc: 'Upload your custom logos, patches, or embroidery for the shoulder, arm area, collar, and more.',
      image: `${HTD}/5-designs.webp`,
      resultImage: `${HTD}/5-designs-result.webp`,
      resultCaption: 'With custom patches and text applied:',
    },
    {
      title: 'Review & Order',
      desc: 'Preview your fully designed jacket in 360° and place your order. We’ll handcraft it and deliver it to you.',
      image: `${HTD}/6-review.webp`,
    },
  ],
  cta: {
    eyebrow: 'Ready?',
    titleLine1: 'Start designing',
    titleLine2: 'your dream jacket.',
    text: 'Jump into our Design Lab and bring your vision to life with premium materials and endless customization.',
    primaryLabel: 'Launch Design Lab →',
    primaryHref: '/design-custom-jacket',
    secondaryLabel: 'View Fabrics',
    secondaryHref: '/fabrics',
  },
};

// --- cleaning -------------------------------------------------------------------------------------------
const IMAGE = /^(https?:\/\/[^\s"'<>]+|\/(uploads|images)\/[^\s"'<>]+)$/i;
const LINK = /^(\/[A-Za-z0-9\-._~/?#=&%+]*|https:\/\/[^\s"'<>]+)$/;
const text = (value, max) => (typeof value === 'string' ? value.replace(/\s+/g, ' ').trim().slice(0, max) : '');
const image = (value) => {
  const v = typeof value === 'string' ? value.trim() : '';
  return v && v.length <= 1000 && IMAGE.test(v) ? v : '';
};
const link = (value, fallback) => {
  const v = typeof value === 'string' ? value.trim() : '';
  return v && v.length <= 500 && LINK.test(v) ? v : fallback;
};
const list = (value, max, fn) => (Array.isArray(value) ? value.slice(0, max).map(fn).filter(Boolean) : []);
const obj = (value) => (value && typeof value === 'object' && !Array.isArray(value) ? value : {});

const cleanHowToDesign = (input) => {
  const d = obj(input);
  const header = obj(d.header);
  const overview = obj(d.overview);
  const cta = obj(d.cta);
  return {
    header: {
      eyebrow: text(header.eyebrow, 60),
      titleLine1: text(header.titleLine1, 60),
      titleLine2: text(header.titleLine2, 60),
      intro: text(header.intro, 400),
      chips: list(header.chips, 8, (c) => text(c, 40)),
    },
    overview: { image: image(overview.image), alt: text(overview.alt, 300) },
    steps: list(d.steps, 12, (raw) => {
      const s = obj(raw);
      const step = { title: text(s.title, 80), desc: text(s.desc, 600) };
      if (!step.title && !step.desc) return null;
      const substeps = list(s.substeps, 12, (rawSub) => {
        const sub = obj(rawSub);
        const out = { label: text(sub.label, 60), detail: text(sub.detail, 160), image: image(sub.image) };
        return out.label || out.image ? out : null;
      });
      if (substeps.length) step.substeps = substeps;
      else {
        step.image = image(s.image);
        const bullets = list(s.bullets, 12, (b) => text(b, 120));
        if (bullets.length) step.bullets = bullets;
        const resultImage = image(s.resultImage);
        if (resultImage) {
          step.resultImage = resultImage;
          step.resultCaption = text(s.resultCaption, 160);
        }
      }
      return step;
    }),
    cta: {
      eyebrow: text(cta.eyebrow, 60),
      titleLine1: text(cta.titleLine1, 60),
      titleLine2: text(cta.titleLine2, 60),
      text: text(cta.text, 400),
      primaryLabel: text(cta.primaryLabel, 40),
      primaryHref: link(cta.primaryHref, '/design-custom-jacket'),
      secondaryLabel: text(cta.secondaryLabel, 40),
      secondaryHref: link(cta.secondaryHref, '/fabrics'),
    },
  };
};

// Terms & Conditions: a header and the sections, each a title (text) and its text as HTML from the admin's rich
// text editor. The HTML keeps headings, paragraphs, lists, bold, italic, links, quotes and tables, nothing else
// (helpers/ssrHtml.js sanitizeArticleHtml: no scripts, styles, images, event handlers or javascript: links). The
// section title is the page's H2, so headings inside a section are H3 (the editor's Heading 1, 2 or 3) and H4
// (its Heading 4). The levels are raised one step before cleaning (which keeps them from skipping a level) and
// lowered after it, so sibling sub-headings stay level and a saved section reads back exactly as it was.
const TERMS_BODY_MAX = 100000;
const RAISE = { 1: 2, 2: 2, 3: 2, 4: 3, 5: 4, 6: 4 };
const termsBody = (value) => (typeof value === 'string'
  ? sanitizeArticleHtml(value.slice(0, TERMS_BODY_MAX).replace(/<(\/?)h([1-6])\b/gi, (tag, close, level) => `<${close}h${RAISE[level]}`))
    .replace(/<(\/?)h([2-4])>/g, (tag, close, level) => `<${close}h${Math.min(4, Number(level) + 1)}>`)
  : '');
export const visibleText = (html) => String(html || '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/gi, ' ').replace(/\s+/g, ' ').trim();

const cleanTerms = (input) => {
  const d = obj(input);
  const header = obj(d.header);
  return {
    header: {
      title: text(header.title, 80),
      intro: text(header.intro, 600),
      effectiveDate: text(header.effectiveDate, 80),
    },
    sections: list(d.sections, 60, (raw) => {
      const s = obj(raw);
      const section = { title: text(s.title, 160), body: termsBody(s.body) };
      // a section with neither a title nor any text shows nothing: dropped
      return section.title || visibleText(section.body) ? section : null;
    }),
  };
};

export const PAGE_CONTENT = {
  'how-to-design': {
    defaults: HOW_TO_DESIGN,
    clean: cleanHowToDesign,
    problem: (c) => (c.steps?.length ? '' : 'The page needs at least one step.'),
  },
  terms: {
    defaults: TERMS_DEFAULTS,
    clean: cleanTerms,
    problem: (c) => (c.sections?.some((s) => visibleText(s.body)) ? '' : 'The terms need at least one section with text.'),
  },
};

/** Stores the shipped content for every editable page that has no row yet. Returns the keys added. */
export async function ensurePageContentDefaults() {
  const added = [];
  for (const [key, page] of Object.entries(PAGE_CONTENT)) {
    // $setOnInsert: an existing row (the admin's content) is never touched
    const result = await PageContent.updateOne({ key }, { $setOnInsert: { key, data: page.defaults } }, { upsert: true });
    if (result.upsertedCount) added.push(key);
  }
  return added;
}
