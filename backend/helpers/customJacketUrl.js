// helpers/customJacketUrl.js
//
// Where to send a customer who wants to keep working on a design we emailed
// them. The customiser rehydrates a saved design from `?design=<id>` (see
// custom-jacket/src/index.js -> getSetProduct), so a resume link is only ever
// as good as the design id behind it; without one there is nothing to restore
// and the best we can do is drop them on the studio landing page.
//
// Both addresses are the NEW 2026 deployment (this repo's frontend/ and custom-jacket/), never the
// live site: CLIENT_URL / CUSTOM_JACKET_URL, else the new deployment's defaults below.

const NEW_STOREFRONT_URL = 'https://hlfhuuaoepy4uvcbysh4xlk6.145.223.75.247.sslip.io';
const NEW_CUSTOMIZER_URL = 'https://custom.145.223.75.247.sslip.io';

/** The new storefront (CLIENT_URL). */
export const storefrontUrl = () => (process.env.CLIENT_URL || NEW_STOREFRONT_URL).replace(/\/+$/, '');

const customiserBase = () =>
  (process.env.CUSTOM_JACKET_URL || NEW_CUSTOMIZER_URL).replace(/\/+$/, '');

export const designStudioUrl = () => `${storefrontUrl()}/design-custom-jacket`;

/** The storefront's review page for a saved design (every view and the full spec). */
export const designReviewUrl = (designId) =>
  designId ? `${storefrontUrl()}/design/${encodeURIComponent(String(designId))}` : '';

/**
 * Deep link that reopens a saved design in the customiser.
 *
 * @param {string} designId     _id of the persisted design document
 * @param {string} categoryCode jacket category, mirrored from the storefront's
 *                              own patch links so both share one URL shape
 * @returns {string} the resume URL, or the studio landing page when there is no id
 */
export const resumeDesignUrl = (designId, categoryCode) => {
  if (!designId) return designStudioUrl();

  const params = new URLSearchParams();
  if (categoryCode) params.set('id', String(categoryCode));
  params.set('design', String(designId));

  return `${customiserBase()}/?${params.toString()}`;
};
