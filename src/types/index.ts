// Global type definitions
export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface Organization {
  id: string;
  name: string;
}

export interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
}

export interface DashboardData {
  orders: number;
  revenue: number;
  invoices: number;
}