import { createRouter, createWebHistory } from 'vue-router'
import { canAccessReportingDashboard } from '@/utils/auth'
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

// Navigation guard to protect routes
router.beforeEach((to, from, next) => {
  const isAuthenticated = canAccessReportingDashboard()
  
  // If route requires auth and user is not authenticated, redirect to login
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } 
  // If user is authenticated and trying to access login, redirect to user selection
  else if (to.path === '/login' && isAuthenticated) {
    next('/select-user')
  } 
  // Otherwise, allow navigation
  else {
    next()
  }
})

export default router