import { createRouter, createWebHistory } from 'vue-router'
import DashboardPage from '../pages/DashboardPage/DashboardPage.vue'
import LoginPage from '../pages/LoginPage/LoginPage.vue'
import UserSelectionPage from '../pages/UserSelectionPage/UserSelectionPage.vue'
import MyInvoicesPage from '../pages/MyInvoicesPage/MyInvoicesPage.vue'
import MyOrdersPage from '../pages/MyOrdersPage/MyOrdersPage.vue'
import PaymentsPage from '../pages/PaymentsPage/PaymentsPage.vue'
import PointOfContactPage from '../pages/PointOfContactPage/PointOfContactPage.vue'

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

router.beforeEach((to, from) => {
  const isLoggedIn = localStorage.getItem('isLoggedInReportingDashboard') === 'true'
  
  if (to.path === '/login') {
    return isLoggedIn ? '/select-user' : true
  }
  
  if (to.meta?.requiresAuth && !isLoggedIn) {
    return '/login'
  }
  
  return true
})

export default router