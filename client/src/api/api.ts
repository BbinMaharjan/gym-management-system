import api from './axios';
import type {
  User, LoginResponse, MembershipPlan, Member, Equipment,
  Payment, AttendanceRecord, DashboardSummary, RevenueTrend,
  AttendanceTrend, MemberGrowth, PaymentMethod, ShiftData,
} from '../types';

export const authAPI = {
  login: (data: { email: string; password: string }) =>
    api.post<LoginResponse>('/auth/login', data),
  getMe: () => api.get<{ user: User }>('/auth/me'),
};

export const usersAPI = {
  getAll: (search?: string) =>
    api.get<User[]>('/users', { params: { search } }),
  getOne: (id: string) => api.get<User>(`/users/${id}`),
  create: (data: Partial<User> & { password?: string }) =>
    api.post<User>('/users', data),
  update: (id: string, data: Partial<User>) =>
    api.put<User>(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
};

export const membersAPI = {
  getAll: (params?: Record<string, unknown>) =>
    api.get<Member[]>('/members', { params }),
  getOne: (id: string) => api.get<Member>(`/members/${id}`),
  getNextNumber: () =>
    api.get<{ membershipNumber: string }>('/members/next-number'),
  create: (data: FormData) =>
    api.post<Member>('/members', data),
  update: (id: string, data: FormData) =>
    api.put<Member>(`/members/${id}`, data),
  delete: (id: string) => api.delete(`/members/${id}`),
  assignPlan: (id: string, data: { planId: string }) =>
    api.put(`/members/${id}/assign-plan`, data),
  getAttendance: (id: string) =>
    api.get<AttendanceRecord[]>(`/members/${id}/attendance`),
  checkIn: (id: string) =>
    api.post(`/members/${id}/attendance/check-in`),
  checkOut: (id: string) =>
    api.post(`/members/${id}/attendance/check-out`),
  getPayments: (id: string) =>
    api.get<Payment[]>(`/members/${id}/payments`),
  createPayment: (id: string, data: Record<string, unknown>) =>
    api.post(`/members/${id}/payments`, data),
};

export const plansAPI = {
  getAll: () => api.get<MembershipPlan[]>('/plans'),
  getOne: (id: string) => api.get<MembershipPlan>(`/plans/${id}`),
  create: (data: Partial<MembershipPlan>) =>
    api.post<MembershipPlan>('/plans', data),
  update: (id: string, data: Partial<MembershipPlan>) =>
    api.put<MembershipPlan>(`/plans/${id}`, data),
  delete: (id: string) => api.delete(`/plans/${id}`),
};

export const equipmentAPI = {
  getAll: (params?: Record<string, unknown>) =>
    api.get<Equipment[]>('/equipment', { params }),
  getOne: (id: string) => api.get<Equipment>(`/equipment/${id}`),
  create: (data: Partial<Equipment>) =>
    api.post<Equipment>('/equipment', data),
  update: (id: string, data: Partial<Equipment>) =>
    api.put<Equipment>(`/equipment/${id}`, data),
  delete: (id: string) => api.delete(`/equipment/${id}`),
  getMaintenanceLogs: (id: string) =>
    api.get(`/equipment/${id}/maintenance`),
  createMaintenanceLog: (id: string, data: Record<string, unknown>) =>
    api.post(`/equipment/${id}/maintenance`, data),
};

export const dashboardAPI = {
  getSummary: () => api.get<DashboardSummary>('/dashboard/summary'),
  getRevenueTrend: () => api.get<RevenueTrend[]>('/dashboard/revenue-trend'),
  getAttendanceTrend: () => api.get<AttendanceTrend[]>('/dashboard/attendance-trend'),
  getMemberGrowth: () => api.get<MemberGrowth[]>('/dashboard/member-growth'),
  getPaymentMethods: () => api.get<PaymentMethod[]>('/dashboard/payment-methods'),
  getShiftDistribution: () => api.get<ShiftData[]>('/dashboard/shift-distribution'),
  getAttendance: (params?: Record<string, unknown>) =>
    api.get<AttendanceRecord[]>('/dashboard/attendance', { params }),
  getTodayCheckedIn: () =>
    api.get<AttendanceRecord[]>('/dashboard/attendance/today'),
  deleteAttendance: (id: string) =>
    api.delete(`/dashboard/attendance/${id}`),
  getPayments: (params?: Record<string, unknown>) =>
    api.get<Payment[]>('/dashboard/payments', { params }),
  updatePayment: (id: string, data: Partial<Payment>) =>
    api.put<Payment>(`/dashboard/payments/${id}`, data),
  deletePayment: (id: string) =>
    api.delete(`/dashboard/payments/${id}`),
};
