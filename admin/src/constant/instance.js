import axios from 'axios'
import { BASE_URL } from './url'

// Token handling moved to interceptor

const instance = axios.create({
  baseURL: BASE_URL,
})

instance.interceptors.request.use(
  (config) => {
    try {
      // Get the token from sessionStorage
      const authData = sessionStorage.getItem("auth");

      if (authData) {
        const parsedAuth = JSON.parse(authData);
        const token = parsedAuth?.token;

        if (token) {
          config.headers['Authorization'] = token;
          // console.log("Token attached to request");
        } else {
          console.warn("No token found in auth data");
        }
      } else {
        console.warn("No auth data found in sessionStorage");
      }
    } catch (error) {
      console.error("Error parsing auth token:", error);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// instance.defaults.headers.common['Authorization'] = `Bearer ${token}`

export default instance

