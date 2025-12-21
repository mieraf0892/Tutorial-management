// src/lib/api.ts
import axios from 'axios';

// If localhost doesn't work, try 127.0.0.1
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// Create axios instance with base configuration
export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Accept': 'application/json',
  },
  timeout: 10000,
});

// Add request interceptor to handle errors
api.interceptors.request.use(
  (config) => {
    // You can add auth tokens here later
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Export commonly used methods
export const apiClient = {
  get: (url: string, config?: any) => api.get(url, config),
  post: (url: string, data?: any, config?: any) => api.post(url, data, config),
  put: (url: string, data?: any, config?: any) => api.put(url, data, config),
  delete: (url: string, config?: any) => api.delete(url, config),
  patch: (url: string, data?: any, config?: any) => api.patch(url, data, config),
};

export default api;