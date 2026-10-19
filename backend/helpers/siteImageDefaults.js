// The storefront's replaceable photos (admin: Content -> Site Images), stored in the site settings row
// (Metadata route '/global-settings', field `siteImages`). These are the photos the storefront shipped with
// (frontend/public/images/...), written into the database on start-up for every slot that is not there yet,
// so every photo is a database entry the admin edits. An admin's choice is never overwritten.
// The same list is the storefront's fallback (frontend/src/lib/siteImages.js); the admin describes each
// slot (admin/src/constant/siteImages.js).
import Metadata from '../models/metaData.js';

const IMG = '/images/site';

export const SITE_IMAGE_DEFAULTS = {
  'home-hero': { src: `${IMG}/hero-red-navy-varsity.webp`, alt: 'Customer wearing a custom red and navy varsity jacket' },
  'home-builder': { src: `${IMG}/campaign-coach-duo.webp`, alt: 'Two Easy Jacket coach jackets from the campaign shoot' },
  campaign: { src: `${IMG}/campaign-varsity-back.webp`, alt: 'Navy and red varsity jacket with Senior Class 26 Brooklyn lettering on the back' },
  'contact-photo': { src: `${IMG}/campaign-coach-duo.webp`, alt: 'Two Easy Jacket coach jackets from the campaign shoot' },
  'bulk-hero': { src: `${IMG}/bulk-team-madden.webp`, alt: 'A team celebrating in the locker room in matching black Team Madden 2024 varsity jackets' },
  'bulk-schools': { src: `${IMG}/bulk-seg-schools.webp`, alt: 'Students on a campus in navy varsity jackets' },
  'bulk-teams': { src: `${IMG}/bulk-team-madden.webp`, alt: 'A team in matching Team Madden 2024 jackets celebrating in the locker room' },
  'bulk-businesses': { src: `${IMG}/bulk-seg-businesses.webp`, alt: 'An office team in matching branded white varsity jackets' },
  'bulk-clubs': { src: `${IMG}/team-varsity-group.webp`, alt: 'Five people in custom varsity jackets in different colors with chenille letters and numbers' },
  'about-wide': { src: `${IMG}/bulk-team-madden.webp`, alt: 'A team celebrating in the locker room in matching black Team Madden 2024 varsity jackets' },
  'about-value1': { src: `${IMG}/bulk-seg-schools.webp`, alt: 'Students on a campus in navy varsity jackets' },
  'about-value2': { src: `${IMG}/bulk-team-madden.webp`, alt: 'A team in matching Team Madden 2024 jackets celebrating in the locker room' },
  'about-value3': { src: `${IMG}/bulk-seg-businesses.webp`, alt: 'An office team in matching branded white varsity jackets' },
  'about-value4': { src: `${IMG}/team-varsity-group.webp`, alt: 'Five people in custom varsity jackets in different colors with chenille letters and numbers' },
  'size-measure': { src: `${IMG}/jacket-measurement.webp`, alt: 'Diagram of a varsity jacket front and back with the five measurements numbered' },
  'size-youth': { src: '/images/size-chart/youth-varsity-measure.webp', alt: 'Youth varsity jacket measurement guide showing chest, body length, across shoulder, and sleeve length' },
  'size-coach': { src: '/images/size-chart/coach-jacket-measure.webp', alt: 'Coach jacket measurement guide showing sleeve length, body width, and body length' },
  'size-cropped': { src: '/images/size-chart/cropped-jacket.webp', alt: 'Baby pink cropped varsity jacket with grey and green striped trim' },
  'notfound-photo': { src: `${IMG}/woman-red-white-detail.webp`, alt: 'Red and white cropped varsity jacket' },
};

// Slots that may hold a slideshow: the most photos in it. The first photo is the slot's own `src`/`alt` (so a
// single photo is stored exactly like every other slot); the rest are `more: [{ src, alt }, …]`, in order.
export const SITE_IMAGE_SLIDES = { 'home-hero': 8 };

/** Writes the shipped photo into the settings row for every slot it does not have yet. Returns the keys added. */
export async function ensureSiteImageDefaults() {
  // the settings row itself, as the admin creates it (Settings -> Site Identity) when a database has none yet
  await Metadata.updateOne(
    { route: '/global-settings' },
    { $setOnInsert: { route: '/global-settings', title: 'Global Site Settings', description: 'Stores site-wide logos and settings', sitemapEnabled: false, sitemapOrder: 9999, sitemapPriority: 0, sitemapChangefreq: 'never' } },
    { upsert: true },
  );
  const row = await Metadata.findOne({ route: '/global-settings' }).select('siteImages').lean();
  if (!row) return [];
  const have = row.siteImages && typeof row.siteImages === 'object' ? row.siteImages : {};
  // (a slot without a shipped file would have nothing to store)
  const missing = Object.keys(SITE_IMAGE_DEFAULTS).filter((key) => SITE_IMAGE_DEFAULTS[key].src && !have[key]?.src);
  if (!missing.length) return [];
  const set = {};
  for (const key of missing) set[`siteImages.${key}`] = { ...SITE_IMAGE_DEFAULTS[key], ...(have[key]?.alt ? { alt: have[key].alt } : {}) };
  // only slots still empty at the moment of writing (an admin's save in between is kept)
  const filter = { route: '/global-settings', $and: missing.map((key) => ({ [`siteImages.${key}.src`]: { $in: [null, ''] } })) };
  await Metadata.updateOne(filter, { $set: set });
  return missing;
}
