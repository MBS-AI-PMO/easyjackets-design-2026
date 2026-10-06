import axios from 'axios';
import baseURL from '../config/url.js';
// Create an Axios instance
const axiosInstance = axios.create({
    baseURL,
});

// Saving over a design needs the right to change it (backend controllers/designController.js): the cart
// design's own key (?key=, on the storefront cart's "Edit design" link) or the admin's design ticket
// (?ticket=, on the admin Products screen's link). Both come in the address this builder was opened with.
const launch = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
const designKey = launch.get('key') || '';
const designTicket = launch.get('ticket') || '';
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
