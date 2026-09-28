// helpers/customJacketUrl.js
//
// Where to send a customer who wants to keep working on a design we emailed
// them. The customiser rehydrates a saved design from `?design=<id>` (see
// custom-jacket/src/index.js -> getSetProduct), so a resume link is only ever
// as good as the design id behind it; without one there is nothing to restore
// and the best we can do is drop them on the studio landing page.

const STUDIO_URL = 'https://easyjackets.com/design-custom-jacket';

const customiserBase = () =>
  (process.env.CUSTOM_JACKET_URL || 'https://custom.easyjackets.com').replace(/\/+$/, '');

export const designStudioUrl = () => STUDIO_URL;

/**
 * Deep link that reopens a saved design in the customiser.
 *
 * @param {string} designId     _id of the persisted design document
 * @param {string} categoryCode jacket category, mirrored from the storefront's
 *                              own patch links so both share one URL shape
 * @returns {string} the resume URL, or the studio landing page when there is no id
 */
export const resumeDesignUrl = (designId, categoryCode) => {
  if (!designId) return STUDIO_URL;

  const params = new URLSearchParams();
  if (categoryCode) params.set('id', String(categoryCode));
  params.set('design', String(designId));

  return `${customiserBase()}/?${params.toString()}`;
};
