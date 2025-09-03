import { getAuth } from 'firebase/auth'
import { createRouter, createWebHistory } from 'vue-router'
import { app } from '../firebase'
import { useUserStore } from '../store'
import { canAccessReportingDashboard, clearLoginState } from '@/utils/auth'
import DashboardPage from '../pages/DashboardPage.vue'
import LoginPage from '../pages/LoginPage.vue'
import UserSelectionPage from '../pages/UserSelectionPage.vue'
import MyInvoicesPage from '../pages/MyInvoicesPage.vue'
import MyOrdersPage from '../pages/MyOrdersPage.vue'
import PaymentsPage from '../pages/PaymentsPage.vue'
import PointOfContactPage from '../pages/PointOfContactPage.vue'

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

// Navigation guard to protect routes - following customer dashboard pattern
router.beforeEach(async (to, from) => {
  getAuth(app)
  const userStore = useUserStore()
  
  // Check if the route is the login page
  if (to.path === '/login') {
    return true // Allow access to login page
  }
  
  // Check login state from localStorage
  if (!canAccessReportingDashboard()) {
    return '/login'
  }
  
  // User is logged in as owner, allow navigation
  try {
    // Additional checks can be added here if needed
    return true // Allow navigation
  } catch (error) {
    console.error('Error during navigation guard:', error)
    // If there's a critical error, redirect to login
    if (error instanceof Error && error.message.includes('unauthorized')) {
      clearLoginState()
      return '/login'
    }
    // For other errors, allow navigation but log the error
    return true
  }
})

export default router