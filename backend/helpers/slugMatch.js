// Product addresses are written without apostrophes (/product/mens-red-cotton-fleece-pullover-hoodie for the
// product saved as "men's-red-cotton-fleece-pullover-hoodie"): an apostrophe in an address is encoded three
// different ways by browsers and sitemaps (B-O2). The stored slug stays as it is; lookups ignore apostrophes.
const escapeRegex = (value = '') => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const stripApostrophes = (slug = '') => String(slug || '').replace(/['’‘]/g, '');

/** Matches a slug with or without its apostrophes, any letter case. */
export const slugIgnoringApostrophes = (slug = '') =>
  new RegExp(`^${[...stripApostrophes(slug)].map(escapeRegex).join("['’‘]?")}$`, 'i');
