import axios from 'axios';

// Create axios instance with default config
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

// Request interceptor (add auth tokens, etc.)
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if it exists
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor (handle errors globally)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 unauthorized globally
    if (error.response?.status === 401) {
      console.error('Unauthorized - redirecting to login');
      // Future: window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);