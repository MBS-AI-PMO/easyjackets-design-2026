import axios from 'axios';
import baseURL from '../config/url.js';
// Create an Axios instance
const axiosInstance = axios.create({
    baseURL,
});

// Saving over a design needs the right to change it (backend controllers/designController.js): the cart
// design's own key (on the storefront cart's "Edit design" link) or the admin's design ticket (on the admin
// Products screen's link). Both come after "#" in the address this builder was opened with (older links had
// them in the query, still read). They are taken out of the address bar at once, so they do not stay in the
// browser history or reach an analytics tag, and kept for this tab only (sessionStorage), so a reload still
// saves.
const launchSecret = (name) => {
    if (typeof window === 'undefined') return '';
    const query = new URLSearchParams(window.location.search);
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const value = hash.get(name) || query.get(name) || '';
    const slot = `cjd-${name}:${query.get('designedit') || query.get('product') || ''}`;
    try {
        if (value) sessionStorage.setItem(slot, value);
        else return sessionStorage.getItem(slot) || '';
    } catch { /* private mode: the value is still used for this page */ }
    return value;
};
const designKey = launchSecret('key');
const designTicket = launchSecret('ticket');
if (typeof window !== 'undefined') {
    try {
        const url = new URL(window.location.href);
        const hash = new URLSearchParams(url.hash.replace(/^#/, ''));
        const had = url.searchParams.has('key') || url.searchParams.has('ticket') || hash.has('key') || hash.has('ticket');
        if (had) {
            ['key', 'ticket'].forEach((name) => { url.searchParams.delete(name); hash.delete(name); });
            url.hash = hash.toString();
            window.history.replaceState(window.history.state, '', url.toString());
        }
    } catch { /* an address the URL parser refuses: left as it is */ }
}
const SAVES_A_DESIGN = /\/custom\/(updateDesign|product-design)/;

axiosInstance.interceptors.request.use(
    config => {
        config.headers['Content-Type'] = 'application/json';
        if (SAVES_A_DESIGN.test(config.url || '')) {
            if (designKey) config.headers['x-design-key'] = designKey;
            if (designTicket) config.headers['x-design-ticket'] = designTicket;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

export default axiosInstance;
