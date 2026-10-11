// Old addresses that search engines still show (Search Console, 12 months to Oct 2026) and that no page
// answers any more: each gets a permanent (301) redirect to its closest page from the storefront server
// (server.mjs). Keys are lower case, as the server compares them. The live site's other aliases are the
// <Navigate> routes in App.jsx, which the server also answers with a 301. (SEO audit B-T5 and N-T7)
export const LEGACY_REDIRECTS = {
  // old routes
  '/allproducts': '/shop',
  '/register': '/account',
  '/varsity': '/shop/category/varsity-jackets',
  '/varsity-jackets-patches-embroideries': '/embroidery-and-patches',
  // the ladies collection (the live site's name for the 2 cropped jackets, a duplicate of that category,
  // linked from nowhere): women's jackets have their own page
  '/products/ladies-varsity-jackets': '/womens-varsity-jackets',
  '/shop/category/ladies-varsity-jackets': '/womens-varsity-jackets',
  // sports and spirit wear: no sports products exist on either site, so these 8 pages (136 impressions in
  // 12 months) point to the team jackets page, which covers those sports (N-T17)
  '/sports-spirit-wears': '/team-jackets',
  '/sports-spirit-wears/category/volleyball': '/team-jackets',
  '/sports-spirit-wears/category/basketball': '/team-jackets',
  '/sports-spirit-wears/category/soccer': '/team-jackets',
  '/sports-spirit-wears/category/ice-hockey': '/team-jackets',
  '/sports-spirit-wears/category/baseball': '/team-jackets',
  '/sports-spirit-wears/category/sportswear': '/team-jackets',
  '/sports-spirit-wears/category/american-football': '/team-jackets',
  // a literal route pattern that leaked into search results
  '/product/%3aslug': '/shop',
  // an old WordPress product address that other sites still link to (P-4)
  '/product/black-wool-leather-varsity-jacket': '/product/black-letterman-jacket-wool-and-genuine-leather-sleeves',
  // products that were renamed or merged: their closest current product
  '/product/purple-and-gold-varsity-jacket': '/product/purple-and-gold-wool-varsity-jacket',
  '/product/black-varsity-hoodie': '/product/black-hooded-varsity-jacket',
  '/product/red-and-athletic-gold-high-school-varsity-letterman-jacket-leather-sleeves': '/product/red-and-gold-custom-sports-letterman-jacket',
  '/product/baby-pink-cropped-varsity-jacket250': '/product/baby-pink-cropped-varsity-jacket',
  '/product/white-and-baby-pink-varsity-letterman-jacket': '/product/white-and-baby-pink-satin-varsity-letterman-jacket',
  '/product/all-black-varsity-varsity-jacket': '/product/all-black-letterman-jacket-leather-sleeves',
  '/product/orange-satin-high-school-varsity-jacket': '/product/orange-satin-high-school-varsity-letterman-jacket',
  '/product/sublimated-satin-varsity-jacket': '/product/sublimated-ombre-satin-varsity-jacket',
  '/product/navy-blue-orange-unisex-varsity-jacket': '/product/navy-blue-and-orange-unisex-varsity-jacket',
};

/** In-app fallback (the server answers these with a 301 on a full page load): where an old address now lives. */
export const legacyTarget = (pathname = '') => {
  let path = String(pathname).replace(/\/+$/, '');
  try { path = decodeURIComponent(path); } catch { /* keep */ }
  return LEGACY_REDIRECTS[encodeURI(path).toLowerCase()] || LEGACY_REDIRECTS[path.toLowerCase()] || null;
};
