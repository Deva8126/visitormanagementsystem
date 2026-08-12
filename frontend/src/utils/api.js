import axios from 'axios';

const API = axios.create({
  baseURL: 'https://cgstbhawanvisitor.com/api' || 'http://localhost:5000/api',
  timeout: 15000,
});

// Request interceptor to attach bearer token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cgst_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to intercept unauthenticated errors (401)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear credentials
      localStorage.removeItem('cgst_token');
      localStorage.removeItem('cgst_user');
      // Force redirect to login page
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API;
