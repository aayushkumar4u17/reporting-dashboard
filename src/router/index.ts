import { createRouter, createWebHistory } from 'vue-router'
import DashboardPage from '@/views/DashboardPage/DashboardPage.vue'
import LoginPage from '@/views/LoginPage/LoginPage.vue'
import UserSelectionPage from '@/views/UserSelectionPage/UserSelectionPage.vue'
import MyInvoicesPage from '@/views/MyInvoicesPage/MyInvoicesPage.vue'
import MyOrdersPage from '@/views/MyOrdersPage/MyOrdersPage.vue'
import PaymentsPage from '@/views/PaymentsPage/PaymentsPage.vue'
import PointOfContactPage from '@/views/PointOfContactPage/PointOfContactPage.vue'
import { canAccessIndusDashboard } from '@/utils/auth'
import '@/config'

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

// Function to clear router auth cache
export const clearRouterAuthCache = () => {
  cachedAuthState = null
}

// Enhanced auth state waiting with better handling for page refreshes
const waitForAuthState = (): Promise<boolean> => {
  return new Promise((resolve) => {
    let attempts = 0
    const maxAttempts = 30 // Increased from 15
    const authCheckInterval = 100 // Kept at 100ms

    const checkAuth = async () => {
      attempts++
      try {
        const { getAuth } = await import('firebase/auth')
        const auth = getAuth()
        
        // Check if Firebase is fully initialized
        if (auth.currentUser !== undefined) {
          resolve(!!auth.currentUser)
          return
        }
      } catch (error) {
        // Firebase not ready yet, continue waiting
      }
      
      // Extended waiting time for page refresh scenarios
      if (attempts < maxAttempts) {
        setTimeout(checkAuth, authCheckInterval)
      } else {
        // Even if we've exhausted attempts, check sessionStorage as fallback
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
    // Clear cache when going to login page
    cachedAuthState = null
    return true;
  }
  
  const now = Date.now();
  let isLoggedIn: boolean;

  // Check if we have a recent cached auth state
  if (cachedAuthState && (now - cachedAuthState.timestamp) < AUTH_CACHE_DURATION) {
    isLoggedIn = cachedAuthState.isLoggedIn;
  } else {
    // Wait for Firebase auth state to be ready
    const hasFirebaseUser = await waitForAuthState();
    
    if (hasFirebaseUser) {
      isLoggedIn = canAccessIndusDashboard();
    } else {
      // Check sessionStorage as a fallback for page refresh scenarios
      const hasReportingFlag = sessionStorage.getItem('isLoggedInReportingDashboard') === 'true';
      const hasIndusFlag = sessionStorage.getItem('isLoggedInIndusDashboard') === 'true';
      isLoggedIn = hasReportingFlag && hasIndusFlag;
    }
    
    // Cache the result
    cachedAuthState = { isLoggedIn, timestamp: now };
  }
  
  if (!isLoggedIn) {
    return '/';
  }
  
  // Check for organization selection
  if (to.path !== '/select-user') {
    const selectedOrg = localStorage.getItem('selectedOrganization');
    if (!selectedOrg) {
      return '/select-user';
    }
  }
  
  return true;
})

export default router