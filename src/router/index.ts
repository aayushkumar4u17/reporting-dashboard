import { createRouter, createWebHistory } from 'vue-router'
import DashboardPage from '../pages/DashboardPage/DashboardPage.vue'
import LoginPage from '../pages/LoginPage/LoginPage.vue'
import UserSelectionPage from '../pages/UserSelectionPage/UserSelectionPage.vue'
import MyInvoicesPage from '../pages/MyInvoicesPage/MyInvoicesPage.vue'
import MyOrdersPage from '../pages/MyOrdersPage/MyOrdersPage.vue'
import PaymentsPage from '../pages/PaymentsPage/PaymentsPage.vue'
import PointOfContactPage from '../pages/PointOfContactPage/PointOfContactPage.vue'
import { canAccessIndusDashboard } from '../utils/auth'

// Ensure Firebase is initialized before router is used
import '../firebase'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      name: 'login',
      component: LoginPage
    },
    {
      path: '/select-user',
      name: 'select-user',
      component: UserSelectionPage,
      meta: { requiresAuth: true }
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardPage,
      meta: { requiresAuth: true }
    },
    {
      path: '/point-of-contact',
      name: 'point-of-contact',
      component: PointOfContactPage,
      meta: { requiresAuth: true }
    },
    {
      path: '/my-orders',
      name: 'my-orders',
      component: MyOrdersPage,
      meta: { requiresAuth: true }
    },
    {
      path: '/my-invoices',
      name: 'my-invoices',
      component: MyInvoicesPage,
      meta: { requiresAuth: true }
    },
    {
      path: '/payments',
      name: 'payments',
      component: PaymentsPage,
      meta: { requiresAuth: true }
    }
  ]
})

// Cache the auth state to avoid repeated checks
let cachedAuthState: { isLoggedIn: boolean; timestamp: number } | null = null
const AUTH_CACHE_DURATION = 3000 // 3 seconds cache

// Simple check for Firebase auth initialization
const isFirebaseReady = () => {
  try {
    // Just check if the module can be imported without waiting
    return typeof require('../firebase') === 'object'
  } catch (e) {
    return false
  }
}

router.beforeEach((to, from) => {
  // Use cached auth state when possible to reduce performance impact
  const now = Date.now()
  let isLoggedIn: boolean
  
  if (cachedAuthState && (now - cachedAuthState.timestamp) < AUTH_CACHE_DURATION) {
    isLoggedIn = cachedAuthState.isLoggedIn
  } else {
    // Only check auth state if cache is expired or doesn't exist
    isLoggedIn = canAccessIndusDashboard()
    cachedAuthState = { isLoggedIn, timestamp: now }
  }
  
  if (to.path === '/login') {
    return isLoggedIn ? '/select-user' : true
  }
  
  if (to.meta?.requiresAuth && !isLoggedIn) {
    return '/login'
  }
  
  return true
})

export default router