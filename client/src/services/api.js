import axios from 'axios';
import Cookies from 'js-cookie';
import { message } from 'antd';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      Cookies.remove('token');
      window.location.href = '/login';
      message.error('登录已过期，请重新登录');
    } else if (error.response?.status === 403) {
      message.error('权限不足');
    } else if (error.response?.status === 404) {
      message.error('请求的资源不存在');
    } else if (error.response?.status === 500) {
      message.error('服务器内部错误');
    } else if (error.code === 'ECONNABORTED') {
      message.error('请求超时，请检查网络连接');
    } else if (!error.response) {
      message.error('网络错误，请检查网络连接');
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getCurrentUser: () => api.get('/auth/me'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  changePassword: (passwordData) => api.put('/auth/password', passwordData),
  logout: () => api.post('/auth/logout'),
};

// Resource API
export const resourceAPI = {
  getResources: (params) => api.get('/resources', { params }),
  getResource: (id) => api.get(`/resources/${id}`),
  getFeaturedResources: (limit) => api.get('/resources/featured', { params: { limit } }),
  getResourceStats: () => api.get('/resources/stats'),
  downloadResource: (id) => api.get(`/resources/${id}/download`, { responseType: 'blob' }),
  createResource: (formData) => api.post('/resources', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateResource: (id, formData) => api.put(`/resources/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteResource: (id) => api.delete(`/resources/${id}`),
  addToFavorites: (resourceId) => api.post('/resources/favorites', { resourceId }),
  removeFromFavorites: (resourceId) => api.delete(`/resources/favorites/${resourceId}`),
};

// User API
export const userAPI = {
  getDashboard: () => api.get('/users/dashboard'),
  getFavorites: (params) => api.get('/users/favorites', { params }),
  getOrders: (params) => api.get('/users/orders', { params }),
  getMembershipStatus: () => api.get('/users/membership'),
  activateMembership: (code) => api.post('/users/activate', { code }),
};

// Admin API
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUserStatus: (userId, data) => api.put(`/admin/users/${userId}/status`, data),
  getOrders: (params) => api.get('/admin/orders', { params }),
  getActivationCodes: (params) => api.get('/admin/activation-codes', { params }),
  generateActivationCodes: (data) => api.post('/admin/activation-codes/generate', data),
  exportActivationCodes: (data) => api.post('/admin/activation-codes/export', data),
  getCategories: (params) => api.get('/admin/categories', { params }),
  createCategory: (data) => api.post('/admin/categories', data),
  updateCategory: (id, data) => api.put(`/admin/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/admin/categories/${id}`),
};

export default api;