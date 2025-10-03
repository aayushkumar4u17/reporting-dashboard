import { createRouter, createWebHistory } from 'vue-router'
import DashboardPage from '@/views/DashboardPage/DashboardPage.vue'
import LoginPage from '@/views/LoginPage/LoginPage.vue'
import UserSelectionPage from '@/views/UserSelectionPage/UserSelectionPage.vue'
import MyInvoicesPage from '@/views/MyInvoicesPage/MyInvoicesPage.vue'
import MyOrdersPage from '@/views/MyOrdersPage/MyOrdersPage.vue'
import PaymentsPage from '@/views/PaymentsPage/PaymentsPage.vue'
import PointOfContactPage from '@/views/PointOfContactPage/PointOfContactPage.vue'
import { canAccessIndusDashboard } from '@/utils/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: LoginPage
    },
    {
      path: '/login',
      name: 'login-page',
      component: LoginPage
    },
    {
      path: '/select-user',
      name: 'select-user',
      component: UserSelectionPage
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardPage
    },
    {
      path: '/point-of-contact',
      name: 'point-of-contact',
      component: PointOfContactPage
    },
    {
      path: '/my-orders',
      name: 'my-orders',
      component: MyOrdersPage
    },
    {
      path: '/my-invoices',
      name: 'my-invoices',
      component: MyInvoicesPage
    },
    {
      path: '/payments',
      name: 'payments',
      component: PaymentsPage
    }
  ]
})

let cachedAuthState: { isLoggedIn: boolean; timestamp: number } | null = null
const AUTH_CACHE_DURATION = 3000

export const clearRouterAuthCache = () => {
  cachedAuthState = null
}

const waitForAuthState = (): Promise<boolean> => {
  return new Promise((resolve) => {
    let attempts = 0
    const maxAttempts = 20
    const authCheckInterval = 100

    const checkAuth = async () => {
      attempts++
      try {
        const { getAuth } = await import('firebase/auth')
        const auth = getAuth()
        
        if (auth.currentUser !== undefined) {
          resolve(!!auth.currentUser)
          return
        }
      } catch (error) {
        // Firebase not ready yet, continue waiting
      }
      
      if (attempts < maxAttempts) {
        setTimeout(checkAuth, authCheckInterval)
      } else {
        const hasReportingFlag = sessionStorage.getItem('isLoggedInReportingDashboard') === 'true'
        const hasIndusFlag = sessionStorage.getItem('isLoggedInIndusDashboard') === 'true'
        resolve(hasReportingFlag && hasIndusFlag)
      }
    }
    
    checkAuth()
  })
}

router.beforeEach(async (to, _from) => {
  if (to.path === '/' || to.path === '/login') {
    cachedAuthState = null
    return true
  }
  
  const now = Date.now()
  let isLoggedIn: boolean

  if (cachedAuthState && (now - cachedAuthState.timestamp) < AUTH_CACHE_DURATION) {
    isLoggedIn = cachedAuthState.isLoggedIn
  } else {
    const hasFirebaseUser = await waitForAuthState()
    
    if (hasFirebaseUser) {
      isLoggedIn = canAccessIndusDashboard()
    } else {
      const hasReportingFlag = sessionStorage.getItem('isLoggedInReportingDashboard') === 'true'
      const hasIndusFlag = sessionStorage.getItem('isLoggedInIndusDashboard') === 'true'
      isLoggedIn = hasReportingFlag && hasIndusFlag
    }
    
    cachedAuthState = { isLoggedIn, timestamp: now }
  }
  
  if (!isLoggedIn) {
    return '/'
  }
  
  if (to.path !== '/select-user') {
    const selectedOrg = localStorage.getItem('selectedOrganization')
    if (!selectedOrg) {
      return '/select-user'
    }
  }
  
  return true
})

export default router