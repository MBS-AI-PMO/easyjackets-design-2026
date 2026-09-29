import axios from 'axios';
import baseURL from '../config/url.js';
// Create an Axios instance
const axiosInstance = axios.create({
    baseURL,
});

axiosInstance.interceptors.request.use(
    config => {
        config.headers['Content-Type'] = 'application/json';
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

export default axiosInstance;
