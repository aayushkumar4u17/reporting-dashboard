<template>
  <div>
    <div v-if="isChecking" class="min-h-screen flex items-center justify-center bg-gray-50">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p class="mt-4 text-gray-600">Verifying access...</p>
      </div>
    </div>

    <slot v-else-if="isAuthenticated" />

    <div v-else class="min-h-screen flex items-center justify-center bg-gray-50">
      <div class="text-center">
        <h2 class="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
        <p class="text-gray-600 mb-4">Redirecting to login...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
// import { signOutUser } from '@/api/auth'
import { canAccessIndusDashboard, clearLoginState } from '@/utils/auth'

const router = useRouter()

const isChecking = ref(true)
const isAuthenticated = ref(false)

let isCheckingAuth = false
let authCheckPromise: Promise<void> | null = null

// Enhanced authentication check with better handling for page refreshes
const checkAuthentication = async () => {
  if (isCheckingAuth || authCheckPromise) {
    return authCheckPromise
  }
  
  isCheckingAuth = true
  isChecking.value = true
  
  authCheckPromise = performAuthCheck()
  return authCheckPromise
}

const performAuthCheck = async () => {
  
  try {
    // First check sessionStorage flags as a quick validation
    const hasReportingFlag = sessionStorage.getItem('isLoggedInReportingDashboard') === 'true'
    const hasIndusFlag = sessionStorage.getItem('isLoggedInIndusDashboard') === 'true'
    
    // If flags are not set, definitely not authenticated
    if (!hasReportingFlag || !hasIndusFlag) {
      redirectToLogin()
      return
    }
    
    // Wait for Firebase to be ready with extended timeout for page refreshes
    let attempts = 0
    const maxAttempts = 20 // Increased for page refresh scenarios
    
    while (attempts < maxAttempts) {
      try {
        const { getAuth } = await import('firebase/auth')
        const auth = getAuth()
        
        // Firebase is ready
        if (auth.currentUser !== undefined) {
          break
        }
      } catch (error) {
        // Firebase not ready yet
      }
      
      attempts++
      // Longer wait time for page refresh scenarios
      await new Promise(resolve => setTimeout(resolve, 150))
    }
    
    // Final auth check after Firebase is ready or timeout
    if (!canAccessIndusDashboard()) {
      redirectToLogin()
      return
    }

    if (!isAuthenticated.value) {
      isAuthenticated.value = true
    }
    
  } catch (error) {
    console.error('AuthGuard: Error during authentication check:', error)
    redirectToLogin()
  } finally {
    isChecking.value = false
    isCheckingAuth = false
    authCheckPromise = null
  }
}

const redirectToLogin = () => {
  if (isAuthenticated.value !== false) {
    isAuthenticated.value = false
  }
  clearLoginState()
  router.push('/login')
}

onMounted(() => {
  checkAuthentication()
})

onUnmounted(() => {
  isCheckingAuth = false
})
</script>