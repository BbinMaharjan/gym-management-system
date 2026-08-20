import api from './axios';

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

export const usersAPI = {
  getAll: (search) => api.get('/users', { params: { search } }),
  getOne: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};

export const membersAPI = {
  getAll: (params) => api.get('/members', { params }),
  getOne: (id) => api.get(`/members/${id}`),
  getNextNumber: () => api.get('/members/next-number'),
  create: (data) => api.post('/members', data),
  update: (id, data) => api.put(`/members/${id}`, data),
  delete: (id) => api.delete(`/members/${id}`),
  assignPlan: (id, data) => api.put(`/members/${id}/assign-plan`, data),
  getAttendance: (id) => api.get(`/members/${id}/attendance`),
  checkIn: (id) => api.post(`/members/${id}/attendance/check-in`),
  checkOut: (id) => api.post(`/members/${id}/attendance/check-out`),
  getPayments: (id) => api.get(`/members/${id}/payments`),
  createPayment: (id, data) => api.post(`/members/${id}/payments`, data),
};

export const plansAPI = {
  getAll: () => api.get('/plans'),
  getOne: (id) => api.get(`/plans/${id}`),
  create: (data) => api.post('/plans', data),
  update: (id, data) => api.put(`/plans/${id}`, data),
  delete: (id) => api.delete(`/plans/${id}`),
};

export const equipmentAPI = {
  getAll: (params) => api.get('/equipment', { params }),
  getOne: (id) => api.get(`/equipment/${id}`),
  create: (data) => api.post('/equipment', data),
  update: (id, data) => api.put(`/equipment/${id}`, data),
  delete: (id) => api.delete(`/equipment/${id}`),
  getMaintenanceLogs: (id) => api.get(`/equipment/${id}/maintenance`),
  createMaintenanceLog: (id, data) => api.post(`/equipment/${id}/maintenance`, data),
};

export const dashboardAPI = {
  getSummary: () => api.get('/dashboard/summary'),
  getAttendance: (params) => api.get('/dashboard/attendance', { params }),
  getTodayCheckedIn: () => api.get('/dashboard/attendance/today'),
  deleteAttendance: (id) => api.delete(`/dashboard/attendance/${id}`),
  getPayments: (params) => api.get('/dashboard/payments', { params }),
  updatePayment: (id, data) => api.put(`/dashboard/payments/${id}`, data),
  deletePayment: (id) => api.delete(`/dashboard/payments/${id}`),
};
