import axiosInstance from './axiosConfig';

// The admin's Settings → Site Identity & Logos (GET /metadata/global-settings): the tab icons, the
// navbar logo and the footer logo with their sizes. The favicon loader, the site navbar and the
// footer all read it, so the page asks once.
let request = null;

export const getSiteSettings = () => {
  if (!request) {
    request = axiosInstance
      .get('/metadata/global-settings')
      .then((res) => res.data?.metadata || {})
      .catch((error) => {
        request = null; // let the next caller try again
        throw error;
      });
  }
  return request;
};
