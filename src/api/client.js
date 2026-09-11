import axios from 'axios';

// Base URL prefers Vite env var or falls back to direct backend URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000,
});

// Request Interceptor: Attach JWT token from sessionStorage if present
apiClient.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('skillsetu_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle unauthenticated responses (401)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and cached user if session has expired or token is invalid
      sessionStorage.removeItem('skillsetu_token');
      sessionStorage.removeItem('skillsetu_user');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
