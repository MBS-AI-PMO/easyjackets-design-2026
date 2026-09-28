import axios from 'axios'
import { BASE_URL } from './url'

// console.log(token)

const fileInstance = axios.create({
  baseURL : BASE_URL,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
})

fileInstance.interceptors.request.use(
  (config) => {
    // Get the token from sessionStorage (or localStorage if using localStorage)
    const token = JSON.parse(sessionStorage.getItem("auth")) ? JSON.parse(sessionStorage.getItem("auth")).token : "";
    // You can switch to localStorage if needed
    if (token) {
      config.headers['Authorization'] = `${token}`; // Add the token to Authorization header
    }

    return config;
  },
  (error) => {
    // Handle the request error here
    return Promise.reject(error);
  }
);

export default fileInstance

