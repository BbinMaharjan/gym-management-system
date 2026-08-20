export interface User {
  _id: string;
  name: string;
  email: string;
  role: "superadmin" | "admin" | "staff";
  permissions: string[];
  isActive: boolean;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface MembershipPlan {
  _id: string;
  name: string;
  durationInDays: number;
  price: number;
  description: string;
  isActive: boolean;
}

export interface Member {
  _id: string;
  membershipNumber: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  dob: string;
  gender: string;
  bloodGroup: string;
  shift: string;
  photo: string;
  membershipPlan: MembershipPlan | string | null;
  planStartDate: string;
  planExpiryDate: string;
  status: "active" | "expired" | "frozen";
  emergencyContact?: { name: string; phone: string };
  createdAt: string;
}

export interface Equipment {
  _id: string;
  name: string;
  category: string;
  brand: string;
  cost: number;
  status: "available" | "in-use" | "maintenance" | "retired";
  purchaseDate: string;
  nextServiceDue: string;
  notes: string;
  createdAt: string;
}

export interface Payment {
  _id: string;
  member: Member | null;
  amount: number;
  method: "cash" | "card" | "bank_transfer" | "other";
  plan: MembershipPlan | null;
  paidOn: string;
  notes: string;
  createdAt: string;
}

export interface AttendanceRecord {
  _id: string;
  member: Member | null;
  checkInTime: string;
  checkOutTime: string | null;
  date: string;
}

export interface DashboardSummary {
  totalActiveMembers: number;
  expiringThisWeek: number;
  totalEquipment: number;
  equipmentUnderMaintenance: number;
  monthlyRevenue: number;
  todayAttendance: number;
  totalMembers: number;
}

export interface RevenueTrend {
  month: string;
  revenue: number;
}

export interface AttendanceTrend {
  day: string;
  attendance: number;
}

export interface MemberGrowth {
  month: string;
  members: number;
}

export interface PaymentMethod {
  method: string;
  count: number;
  total: number;
}

export interface ShiftData {
  shift: string;
  count: number;
}

export interface MaintenanceLog {
  _id: string;
  description: string;
  cost: number;
  performedBy: string;
  date: string;
}
