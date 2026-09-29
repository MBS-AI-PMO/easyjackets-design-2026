import axios from 'axios';
import baseURL from '../config/url.js';
// Create an Axios instance
const fileInstance = axios.create({
    baseURL,
});

fileInstance.interceptors.request.use(
    config => {
        config.headers['Content-Type'] = 'multipart/form-data';
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

export default fileInstance;
