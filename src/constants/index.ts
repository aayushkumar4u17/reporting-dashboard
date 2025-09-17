// Application constants
export const APP_NAME = 'FuelBuddy Dashboard';

export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  ORDERS: '/orders',
  INVOICES: '/invoices',
  PAYMENTS: '/payments',
  POINT_OF_CONTACT: '/point-of-contact',
  USER_SELECTION: '/user-selection'
} as const;

export const API_ENDPOINTS = {
  AUTH: '/auth',
  DASHBOARD: '/dashboard',
  ORDERS: '/orders',
  INVOICES: '/invoices'
} as const;