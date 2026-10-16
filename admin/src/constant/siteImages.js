// The storefront's replaceable photos (Content -> Site Images): where each one is, its shape and the size to
// upload. The keys match the storefront (frontend/src/lib/siteImages.js) and the backend
// (backend/helpers/siteImageDefaults.js, which stores the shipped photos in the database).
//
// Sizes: every upload is converted to WebP and scaled down to 1600 px on its longest side
// (backend/helpers/fileUpload.js), so 1600 px is the most that is ever stored. `fit: 'cover'` fills the box
// and crops what does not fit (from the centre); `fit: 'contain'` shows the whole picture inside the box.
// `wire` draws the small page sketch in the admin: which layout, and which box is this photo.

const portrait = { ratio: [4, 5], recommended: [1280, 1600], minimum: [960, 1200] };
const landscape43 = { ratio: [4, 3], recommended: [1600, 1200], minimum: [1200, 900] };

export const SITE_IMAGE_GROUPS = [
  {
    id: 'home',
    title: 'Home page',
    slots: [
      {
        key: 'home-hero', title: 'Hero photo', path: '/', fit: 'cover', ...portrait,
        where: 'The big photo at the very top of the home page, to the right of the headline.',
        note: 'The gold "Free design proof" tag sits over its top-right corner, so keep faces and logos away from that corner.',
        wire: { layout: 'hero' },
      },
      {
        key: 'home-builder', title: '"Design your own jacket" photo', path: '/#builder', fit: 'cover', ...landscape43,
        where: 'Home page, the dark "Online builder · Design your own jacket" band below Popular picks, on the left.',
        note: 'The gold "Live preview" tag sits over its bottom-left corner.',
        wire: { layout: 'band' },
      },
    ],
  },
  {
    id: 'campaign',
    title: 'Campaign card (14 pages)',
    slots: [
      {
        key: 'campaign', title: '"Design your custom letterman & varsity jacket" card', path: '/shop', fit: 'cover',
        ratio: [1, 1], recommended: [1600, 1600], minimum: [1000, 1000],
        where: 'The square "Online builder · Free proof — Start →" card at the top right of 14 pages: Shop, About, Contact, FAQ, Gallery, Reviews, Size Chart, Fabrics, Material Colors, Embroidery & Patches, How to Design, United States, every state page and the keyword landing pages.',
        note: 'The bottom half is darkened under the card\'s text and Start button; the subject reads best in the top half.',
        wire: { layout: 'card' },
      },
    ],
  },
  {
    id: 'bulk',
    title: 'Bulk Orders page',
    slots: [
      {
        key: 'bulk-hero', title: 'Team photo', path: '/bulk-order', fit: 'cover',
        ratio: [16, 10], recommended: [1600, 1000], minimum: [1280, 800],
        where: 'Bulk Orders page, left column, under the "10+ · Up to 30% · Free · 3–4 wks" figures (the quote form is on the right).',
        wire: { layout: 'bulkHero' },
      },
      ...[['bulk-schools', 'Schools'], ['bulk-teams', 'Teams'], ['bulk-businesses', 'Businesses'], ['bulk-clubs', 'Clubs']].map(([key, name], index) => ({
        key, title: `"${name}" card`, path: '/bulk-order', fit: 'cover', ...portrait,
        where: `Bulk Orders page, "Who orders in bulk — One jacket, the whole crew", card ${index + 1} of 4 (${name}).`,
        note: 'The card\'s name and line of text sit over the bottom of the photo on a dark fade.',
        wire: { layout: 'grid4', index, tall: true },
      })),
    ],
  },
  {
    id: 'about',
    title: 'About page',
    slots: [
      {
        key: 'about-wide', title: 'Wide photo', path: '/about-us', fit: 'cover',
        ratio: [16, 9], recommended: [1600, 900], minimum: [1280, 720],
        where: 'About page, the full-width photo under the page header ("Made by hand, worn for life").',
        wire: { layout: 'wide' },
      },
      ...[['about-value1', 'Made to order'], ['about-value2', 'Real materials'], ['about-value3', 'No minimums'], ['about-value4', 'Fair to makers']].map(([key, name], index) => ({
        key, title: `"${name}" photo`, path: '/about-us', fit: 'cover', ...landscape43,
        where: `About page, "What we stand for", card ${index + 1} of 4 (${name}).`,
        wire: { layout: 'grid4', index },
      })),
    ],
  },
  {
    id: 'contact',
    title: 'Contact page',
    slots: [
      {
        key: 'contact-photo', title: 'Photo', path: '/contact-us', fit: 'cover', ...landscape43,
        where: 'Contact page, left column under the address and social links (the message form is on the right).',
        wire: { layout: 'contact' },
      },
    ],
  },
  {
    id: 'size',
    title: 'Size Chart page',
    slots: [
      {
        key: 'size-measure', title: '"How to measure" diagram', path: '/sizechart', fit: 'contain', ...portrait,
        where: 'Size Chart page, "How to measure — Grab a jacket you love", on the left of the five numbered measurements.',
        note: 'Shown whole on a cream panel (nothing is cropped): a diagram on a white or transparent background works best.',
        wire: { layout: 'diagramLeft' },
      },
      {
        key: 'size-youth', title: 'Youth varsity diagram', path: '/sizechart#sc-youth-title', fit: 'contain',
        ratio: [5, 4], recommended: [1600, 1280], minimum: [1000, 800],
        where: 'Size Chart page, "Youth Varsity Jacket", to the right of the youth size table.',
        note: 'Shown whole on a cream panel (nothing is cropped).',
        wire: { layout: 'diagramRight' },
      },
      {
        key: 'size-coach', title: 'Coach jacket diagram', path: '/sizechart#sc-coach-title', fit: 'contain',
        ratio: [16, 10], recommended: [1600, 1000], minimum: [1000, 625],
        where: 'Size Chart page, "Coach Jacket Fit Guide", to the right of the three steps.',
        note: 'Shown whole on a cream panel (nothing is cropped).',
        wire: { layout: 'diagramRight' },
      },
    ],
  },
  {
    id: 'notfound',
    title: '"Page not found" page',
    slots: [
      {
        key: 'notfound-photo', title: 'Photo', path: '/this-page-does-not-exist', fit: 'cover', ...portrait,
        where: 'The page visitors see for an address that does not exist (404), on the right.',
        wire: { layout: 'notFound' },
      },
    ],
  },
];

export const SITE_IMAGE_SLOTS = SITE_IMAGE_GROUPS.flatMap((g) => g.slots);
