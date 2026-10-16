// The storefront's replaceable photos: every slot the admin can change (Content -> Site Images), with the
// bundled photo and description shown when the admin has not set one. The keys are the admin's
// (admin/src/constant/siteImages.js, which also says where each one is and what size to upload).
const IMG = '/images/site';

export const SITE_IMAGES = {
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

// what the admin may store (the backend keeps only these too: metaDataController.js cleanSiteImages)
const SAFE_SRC = /^(https?:\/\/[^\s"'<>]+|\/(uploads|images)\/[^\s"'<>]+)$/i;

/** The admin's settings for the slots, cleaned: { key: { src?, alt? } }. */
export const cleanSiteImages = (value) => {
  const out = {};
  if (!value || typeof value !== 'object') return out;
  for (const [key, slot] of Object.entries(value)) {
    if (!SITE_IMAGES[key] || !slot || typeof slot !== 'object') continue;
    const entry = {};
    if (typeof slot.src === 'string' && SAFE_SRC.test(slot.src.trim())) entry.src = slot.src.trim();
    if (typeof slot.alt === 'string' && slot.alt.trim()) entry.alt = slot.alt.trim();
    if (Object.keys(entry).length) out[key] = entry;
  }
  return out;
};
