import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('gym_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('gym_auth_token');
      localStorage.removeItem('gym_current_admin');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  
  getProfile: () =>
    api.get('/auth/profile'),
  
  updateProfile: (data: any) =>
    api.put('/auth/profile', data),
};

// Members API
export const membersAPI = {
  getAll: (params?: any) =>
    api.get('/members', { params }),
  
  getById: (id: string) =>
    api.get(`/members/${id}`),
  
  getByMemberId: (memberId: string) =>
    api.get(`/members/member-id/${memberId}`),
  
  create: (data: any) =>
    api.post('/members', data),
  
  update: (id: string, data: any) =>
    api.put(`/members/${id}`, data),
  
  delete: (id: string) =>
    api.delete(`/members/${id}`),
  
  getStats: () =>
    api.get('/members/stats'),
};

// Check-ins API
export const checkInsAPI = {
  getAll: (params?: any) =>
    api.get('/checkins', { params }),
  
  getByDate: (date: string) =>
    api.get(`/checkins/date/${date}`),
  
  getByMember: (memberId: string, params?: any) =>
    api.get(`/checkins/member/${memberId}`, { params }),
  
  create: (data: any) =>
    api.post('/checkins', data),
  
  update: (id: string, data: any) =>
    api.put(`/checkins/${id}`, data),
  
  getStats: () =>
    api.get('/checkins/stats'),
};

// Plans API
export const plansAPI = {
  getAll: (params?: any) =>
    api.get('/plans', { params }),
  
  getById: (id: string) =>
    api.get(`/plans/${id}`),
  
  create: (data: any) =>
    api.post('/plans', data),
  
  update: (id: string, data: any) =>
    api.put(`/plans/${id}`, data),
  
  delete: (id: string) =>
    api.delete(`/plans/${id}`),
  
  toggleStatus: (id: string) =>
    api.put(`/plans/${id}/toggle-status`),
};

// Admin API
export const adminAPI = {
  getAll: () =>
    api.get('/admin'),
  
  create: (data: any) =>
    api.post('/admin', data),
  
  update: (id: string, data: any) =>
    api.put(`/admin/${id}`, data),
  
  delete: (id: string) =>
    api.delete(`/admin/${id}`),
  
  getStats: () =>
    api.get('/admin/stats'),
};

export default api;