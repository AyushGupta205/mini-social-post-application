import React, { createContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('social_app_token') || null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('social_app_token');
      const storedUser = localStorage.getItem('social_app_user');

      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
          // Verify with backend silently
          const response = await authService.getMe();
          if (response.user) {
            setUser(response.user);
            localStorage.setItem('social_app_user', JSON.stringify(response.user));
          }
        } catch (error) {
          console.warn('Session expired or invalid token:', error.message);
          logout();
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    const response = await authService.login(email, password);
    if (response.token && response.user) {
      localStorage.setItem('social_app_token', response.token);
      localStorage.setItem('social_app_user', JSON.stringify(response.user));
      setToken(response.token);
      setUser(response.user);
    }
    return response;
  };

  const signup = async (username, email, password) => {
    const response = await authService.signup(username, email, password);
    if (response.token && response.user) {
      localStorage.setItem('social_app_token', response.token);
      localStorage.setItem('social_app_user', JSON.stringify(response.user));
      setToken(response.token);
      setUser(response.user);
    }
    return response;
  };

  const logout = () => {
    localStorage.removeItem('social_app_token');
    localStorage.removeItem('social_app_user');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    signup,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
