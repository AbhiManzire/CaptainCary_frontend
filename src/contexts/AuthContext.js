import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
    
    // Listen for logout events from API interceptor
    const handleLogout = (event) => {
      console.log('Received logout event:', event.detail);
      setUser(null);
      setUserType(null);
    };
    
    window.addEventListener('auth:logout', handleLogout);
    
    // Keep alive mechanism - enabled for both development and production
    const keepAliveInterval = setInterval(async () => {
      if (user) {
        try {
          await api.get('/auth/keep-alive');
        } catch (error) {
          console.error('Keep alive ping failed:', error);
          if (error.response?.status === 401) {
            logout();
          }
        }
      }
    }, 30 * 60 * 1000); // Every 30 minutes

    // Token refresh mechanism - enabled for both development and production
    const tokenRefreshInterval = setInterval(async () => {
      if (user) {
        try {
          const response = await api.post('/auth/refresh');
          const { token } = response.data;
          localStorage.setItem('token', token);
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          console.log('Token refreshed successfully');
        } catch (error) {
          console.error('Token refresh failed:', error);
          if (error.response?.status === 401) {
            logout();
          }
        }
      }
    }, 20 * 60 * 60 * 1000); // Every 20 hours (before 24h expiration)
    
    // Additional frequent token refresh for active users (every 2 hours)
    const frequentRefreshInterval = setInterval(async () => {
      if (user) {
        try {
          const response = await api.post('/auth/refresh');
          const { token } = response.data;
          localStorage.setItem('token', token);
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          console.log('Frequent token refresh completed');
        } catch (error) {
          console.error('Frequent token refresh failed:', error);
          // Don't logout on frequent refresh failure, just log it
        }
      }
    }, 2 * 60 * 60 * 1000); // Every 2 hours
    
    return () => {
      window.removeEventListener('auth:logout', handleLogout);
      if (keepAliveInterval) clearInterval(keepAliveInterval);
      if (tokenRefreshInterval) clearInterval(tokenRefreshInterval);
      if (frequentRefreshInterval) clearInterval(frequentRefreshInterval);
    };
  }, []); // Remove user dependency to prevent infinite loop

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Checking auth status, token exists:', !!token);
      
      if (!token) {
        console.log('No token found, setting loading to false');
        setLoading(false);
        return;
      }

      // Set token in headers before making request
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Try to get user info
      console.log('Making /auth/me request...');
      const response = await api.get('/auth/me');
      console.log('Auth response:', response.data);
      
      if (response.data && response.data.user) {
        console.log('Setting user:', response.data.user);
        console.log('Setting userType:', response.data.userType);
        setUser(response.data.user);
        setUserType(response.data.userType);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Auth check failed:', error.response?.data?.message || error.message);
      
      // Only clear token for specific auth errors
      const authErrorMessages = [
        'Token has expired',
        'Invalid token', 
        'Token is not valid',
        'No token, authorization denied'
      ];
      
      // Try to refresh token if it's expired
      if (error.response?.status === 401) {
        const token = localStorage.getItem('token');
        if (token) {
          try {
            console.log('Attempting token refresh...');
            const refreshResponse = await api.post('/auth/refresh');
            const { token: newToken } = refreshResponse.data;
            localStorage.setItem('token', newToken);
            api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
            
            // Retry the auth check with new token
            const retryResponse = await api.get('/auth/me');
            if (retryResponse.data && retryResponse.data.user) {
              console.log('Token refresh successful, setting user:', retryResponse.data.user);
              setUser(retryResponse.data.user);
              setUserType(retryResponse.data.userType);
              setLoading(false);
              return;
            }
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
          }
        }
        
        // Only clear token if refresh also failed
        if (authErrorMessages.includes(error.response?.data?.message)) {
          localStorage.removeItem('token');
          delete api.defaults.headers.common['Authorization'];
          setUser(null);
          setUserType(null);
        }
      } else {
        // For network errors, keep the token and try again later
        console.log('Network error, keeping token for retry');
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password, type) => {
    try {
      const response = await api.post(`/auth/${type}/login`, {
        email,
        password
      });

      const { token, user: userData } = response.data;
      
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(userData);
      setUserType(type);
      
      return { success: true };
    } catch (error) {
      console.error('Login failed:', error.response?.data?.message || error.message);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const refreshToken = async () => {
    try {
      const response = await api.post('/auth/refresh');
      const { token, user: userData, userType: type } = response.data;
      
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(userData);
      setUserType(type);
      
      return { success: true };
    } catch (error) {
      console.error('Token refresh failed:', error.response?.data?.message || error.message);
      logout();
      return { success: false };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    setUserType(null);
  };

  const value = {
    user,
    userType,
    loading,
    login,
    logout,
    refreshToken,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
