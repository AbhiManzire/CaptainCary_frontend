import axios from 'axios';

// Ensure API_BASE_URL always ends with /api
const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const API_BASE_URL = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, // 2 minutes timeout for file uploads
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Don't set Content-Type for FormData, let the browser set it with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Only handle 401 errors and avoid infinite loops
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.error('Authentication failed:', error.response?.data?.message || 'Unauthorized');
      console.error('Request URL:', originalRequest.url);
      console.error('Current path:', window.location.pathname);
      
      // Mark this request as retried to prevent infinite loops
      originalRequest._retry = true;
      
      // Only try to refresh token for non-auth endpoints and if we have a token
      const isAuthEndpoint = originalRequest.url.includes('/auth/refresh') || 
                           originalRequest.url.includes('/auth/me') || 
                           originalRequest.url.includes('/auth/keep-alive');
      
      const hasToken = localStorage.getItem('token');
      
      if (!isAuthEndpoint && hasToken) {
        try {
          const refreshResponse = await api.post('/auth/refresh');
          const { token } = refreshResponse.data;
          
          // Update token in localStorage and headers
          localStorage.setItem('token', token);
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          
          // Retry the original request
          return api(originalRequest);
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          // If refresh fails, proceed with logout
        }
      }
      
      // Only logout for specific auth failures, not network errors
      const authErrorMessages = [
        'Token has expired',
        'Invalid token', 
        'Token is not valid',
        'No token, authorization denied'
      ];
      
      if (authErrorMessages.includes(error.response?.data?.message)) {
        // Clear token and auth headers
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
        
        // Dispatch a custom event to notify AuthContext
        window.dispatchEvent(new CustomEvent('auth:logout', { 
          detail: { reason: 'token_expired' } 
        }));
        
        // Only redirect if not already on login page
        const currentPath = window.location.pathname;
        if (!currentPath.includes('/login') && !currentPath.includes('/register')) {
          // Determine correct login page based on current route
          const isClientRoute = currentPath.startsWith('/client/');
          const loginPath = isClientRoute ? '/client/login' : '/admin/login';
          
          // Small delay to allow AuthContext to handle the logout
          setTimeout(() => {
            window.location.href = loginPath;
          }, 100);
        }
      }
    }
    
    // For network errors, don't logout - just reject the promise
    return Promise.reject(error);
  }
);

export default api;
