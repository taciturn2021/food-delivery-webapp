import React, { createContext, useState, useEffect, useContext } from 'react';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';

const AuthContext = createContext(null);

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    bootstrapAsync();
  }, []);

  const bootstrapAsync = async () => {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      
      if (!token) {
        setIsLoading(false);
        return;
      }
      
      api.setAuthToken(token);
      await fetchUserData();
    } catch (error) {
      console.error('Error during bootstrap:', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserData = async () => {
    try {
      const response = await api.getProfile();
      const userData = response.data;
      
      // Verify that the user is a rider
      if (userData.role !== 'rider') {
        throw new Error('Access denied. This app is for riders only.');
      }

      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError(error.message || 'Failed to fetch user data');
      await logout();
      throw error;
    }
  };

  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.login({ email, password });
      const { token, user: userData } = response.data;
      
      // Verify that the user is a rider
      if (userData.role !== 'rider') {
        throw new Error('Access denied. This app is for riders only.');
      }

      await SecureStore.setItemAsync('authToken', token);
      api.setAuthToken(token);
      
      setUser(userData);
      setIsAuthenticated(true);
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      
      let errorMessage = 'Login failed. Please check your credentials.';
      if (error.message === 'Access denied. This app is for riders only.') {
        errorMessage = error.message;
      } else if (error.response?.status === 401) {
        errorMessage = 'Invalid email or password';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message === 'Network Error') {
        errorMessage = 'Network error. Please check your internet connection.';
      }
      
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync('authToken');
      api.clearAuthToken();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateUser = (userData) => {
    setUser(prev => ({
      ...prev,
      ...userData
    }));
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        error,
        login,
        logout,
        updateUser,
        // Add rider-specific helper
        riderId: user?.riderId
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider, useAuth };