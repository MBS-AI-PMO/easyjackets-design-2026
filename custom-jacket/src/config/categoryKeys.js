/**
 * Which jacket the builder is showing, resolved from the category's code.
 *
 * Every screen in the builder branches on `globals.catName` — which colour
 * parts a jacket has, which advance options it offers, which design areas it
 * shows. Those comparisons are against the strings below. They used to be the
 * category's display name straight from the database, so when an admin renamed
 * "ladies Varsity Jackets" to "Cropped Varsity Jackets" the cropped jacket
 * silently lost its colour panel, its advance options and its pocket design
 * areas: nothing matched any more.
 *
 * The code never changes — it is also what saved designs and share links carry
 * as categoryCode, and what the builder already keys the cropped and coach
 * geometry on. So the key is resolved from it here, once, and the display name
 * is only ever a fallback. Renaming a category in the admin no longer touches
 * the builder.
 *
 * The strings on the right are internal identifiers now, not labels. Do not
 * "tidy" one to match a new display name — every comparison in the builder
 * would have to change with it.
 */
export const CATEGORY_KEY_BY_CODE = {
  '5893': 'Varsity Jackets',
  '5944': 'Bomber Jackets',
  '5995': 'Hoodies',
  '6046': 'Coach Jackets',
  '4893': 'ladies Varsity Jackets',
};

// Names these categories have carried over time. Older saved designs store the
// key as text rather than a code, so a bare name still has to resolve.
const CATEGORY_KEY_BY_NAME = {
  'varsity jackets': 'Varsity Jackets',
  'varsity jacket': 'Varsity Jackets',
  'bomber jackets': 'Bomber Jackets',
  'bomber jacket': 'Bomber Jackets',
  'hoodies': 'Hoodies',
  'hoodie': 'Hoodies',
  'coach jackets': 'Coach Jackets',
  'coach jacket': 'Coach Jackets',
  'ladies varsity jackets': 'ladies Varsity Jackets',
  'ladies varsity jacket': 'ladies Varsity Jackets',
  'cropped varsity jackets': 'ladies Varsity Jackets',
  'cropped varsity jacket': 'ladies Varsity Jackets',
  'cropped ladies varsity jackets': 'ladies Varsity Jackets',
};

/**
 * @param category  the category document from the API ({ code, name, … }), or
 *                  a bare string — a code or a name — from a saved design
 * @param code      the code the builder was opened with, tried when the
 *                  category itself does not carry one
 */
export const categoryKey = (category, code) => {
  const candidates = [
    category?.code,
    code,
    typeof category === 'string' ? category : null,
  ];
  for (const candidate of candidates) {
    const key = CATEGORY_KEY_BY_CODE[String(candidate ?? '').trim()];
    if (key) return key;
  }

  const name = String(
    (typeof category === 'string' ? category : category?.name) ?? ''
  ).trim();
  return CATEGORY_KEY_BY_NAME[name.toLowerCase()] || name;
};
