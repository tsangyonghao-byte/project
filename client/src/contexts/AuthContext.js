import React, { createContext, useContext, useState, useEffect } from 'react';
import { message } from 'antd';
import Cookies from 'js-cookie';
import api from '../services/api';

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
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(Cookies.get('token'));

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = Cookies.get('token');
      if (savedToken) {
        try {
          const response = await api.get('/auth/me');
          setUser(response.data.data);
          setToken(savedToken);
        } catch (error) {
          console.error('Auth initialization failed:', error);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      const { user, token } = response.data.data;
      
      setUser(user);
      setToken(token);
      Cookies.set('token', token, { expires: 7 });
      
      message.success('登录成功');
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || '登录失败';
      message.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      const { user, token } = response.data.data;
      
      setUser(user);
      setToken(token);
      Cookies.set('token', token, { expires: 7 });
      
      message.success('注册成功');
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || '注册失败';
      message.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    Cookies.remove('token');
    message.success('退出登录成功');
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await api.put('/auth/profile', profileData);
      setUser(response.data.data);
      message.success('个人信息更新成功');
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || '更新失败';
      message.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const changePassword = async (passwordData) => {
    try {
      await api.put('/auth/password', passwordData);
      message.success('密码修改成功');
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || '密码修改失败';
      message.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const hasActiveMembership = () => {
    if (!user) return false;
    return user.membership.type !== 'free' && 
           (user.membership.type === 'lifetime' || 
            new Date() < new Date(user.membership.expiresAt));
  };

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    hasActiveMembership,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};