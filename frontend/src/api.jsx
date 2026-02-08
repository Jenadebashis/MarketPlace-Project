import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL;
// Create the base instance
const client = axios.create({
  baseURL: API_URL,
  timeout: 8000,
});

// --- THE INTERCEPTOR ---
client.interceptors.request.use(
  (config) => {
    // Retrieve the token (usually stored during login)
    const token = localStorage.getItem('token');

    if (token) {
      // Attach the JWT to the Authorization header
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    // Handle request errors (e.g., network issues before sending)
    return Promise.reject(error);
  }
);

// This is the function your appMiddleware calls
export const apiCall = async (endpoint, method, data) => {
  const response = await client.request({
    url: endpoint,
    method,
    data
  });
  return response.data;
};