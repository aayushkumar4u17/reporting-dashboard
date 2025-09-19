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
  AUTHENTICATION: '/auth',
  DASHBOARD: '/dashboard',
  ORDERS: '/orders',
  INVOICES: '/invoices'
} as const;

// Environment-based configuration
export const getConfig = () => ({
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
  graphqlEndpoint: import.meta.env.VITE_GRAPHQL_ENDPOINT,
  environment: import.meta.env.VITE_APP_ENVIRONMENT || 'production',
  isDevelopment: import.meta.env.MODE === 'development',
  isProduction: import.meta.env.MODE === 'production'
});