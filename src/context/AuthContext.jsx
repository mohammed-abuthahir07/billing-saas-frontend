import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Check localStorage for persistent user sessions on load
  useEffect(() => {
    const savedUser = localStorage.getItem('billing_user');
    const savedToken = localStorage.getItem('billing_token');
    if (savedUser && savedToken) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('billing_user');
        localStorage.removeItem('billing_token');
      }
    }
  }, []);

  const login = async (email, password) => {
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
  };

  const register = async (name, email, password) => {
    try {
      const response = await api.post('/auth/register', { name, email, password });
      
      const { token, user: userData } = response.data;
      
      // const userObj = {
      //   ...userData,
      //   avatar: userData.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${name}&backgroundColor=2563eb`
      // };
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
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('billing_user');
    localStorage.removeItem('billing_token');
  };

  const openLoginModal = () => {
    setIsLoginModalOpen(true);
    setIsRegisterModalOpen(false);
  };

  const openRegisterModal = () => {
    setIsRegisterModalOpen(true);
    setIsLoginModalOpen(false);
  };

  const closeModals = () => {
    setIsLoginModalOpen(false);
    setIsRegisterModalOpen(false);
  };

  return (
    <AuthContext.Provider value={{
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
    }}>
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
