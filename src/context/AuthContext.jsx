import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import api from '../services/api';

const AuthContext = createContext();

const readStoredUser = () => {
  try {
    const savedUser = localStorage.getItem('billing_user');
    const savedToken = localStorage.getItem('billing_token');
    if (savedUser && savedToken) {
      return JSON.parse(savedUser);
    }
  } catch (e) {
    localStorage.removeItem('billing_user');
    localStorage.removeItem('billing_token');
  }
  return null;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(readStoredUser);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const login = useCallback(async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      
      // Standard structure expects { token, user }
      const { token, user: userData } = response.data;
      
      // Provide fallback defaults if the API doesn't return avatar
      const userObj = {
        ...userData,
        avatar: userData.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${userData.name || email.split('@')[0]}&backgroundColor=2563eb`
      };
      
      setUser(userObj);
      localStorage.setItem('billing_token', token);
      localStorage.setItem('billing_user', JSON.stringify(userObj));
      
      setIsLoginModalOpen(false);
      setIsRegisterModalOpen(false);
      return { success: true };
    } catch (error) {
      console.error('Login API error:', error);
      const message = error.response?.data?.message || error.response?.data?.error || 'Login failed. Please check your credentials.';
      return { success: false, error: message };
    }
  }, []);

  const register = useCallback(async (name, email, password) => {
    try {
      const response = await api.post('/auth/register', { name, email, password });
      
      const { token, user: userData } = response.data;
      
      const userObj = {
        ...userData,
        avatar: userData?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userData?.name || 'User')}&backgroundColor=2563eb`
      };
      setUser(userObj);
      localStorage.setItem('billing_token', token);
      localStorage.setItem('billing_user', JSON.stringify(userObj));
      
      setIsLoginModalOpen(false);
      setIsRegisterModalOpen(false);
      return { success: true };
    } catch (error) {
      console.error('Registration API error:', error);
      const message = error.response?.data?.message || error.response?.data?.error || 'Registration failed. Please try again.';
      return { success: false, error: message };
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('billing_user');
    localStorage.removeItem('billing_token');
  }, []);

  const openLoginModal = useCallback(() => {
    setIsLoginModalOpen(true);
    setIsRegisterModalOpen(false);
  }, []);

  const openRegisterModal = useCallback(() => {
    setIsRegisterModalOpen(true);
    setIsLoginModalOpen(false);
  }, []);

  const closeModals = useCallback(() => {
    setIsLoginModalOpen(false);
    setIsRegisterModalOpen(false);
  }, []);

  const value = useMemo(() => ({
    user,
    login,
    register,
    logout,
    isLoginModalOpen,
    setIsLoginModalOpen,
    isRegisterModalOpen,
    setIsRegisterModalOpen,
    openLoginModal,
    openRegisterModal,
    closeModals,
    isMobileMenuOpen,
    setIsMobileMenuOpen
  }), [
    user,
    login,
    register,
    logout,
    isLoginModalOpen,
    isRegisterModalOpen,
    openLoginModal,
    openRegisterModal,
    closeModals,
    isMobileMenuOpen
  ]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
