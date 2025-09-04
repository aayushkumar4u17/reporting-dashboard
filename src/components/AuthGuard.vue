<template>
  <div>
    <!-- Loading state while checking authentication -->
    <div v-if="isChecking" class="min-h-screen flex items-center justify-center bg-gray-50">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p class="mt-4 text-gray-600">Verifying access...</p>
      </div>
    </div>

    <!-- Render app content if authenticated -->
    <slot v-else-if="isAuthenticated" />

    <!-- Redirect to login if not authenticated -->
    <div v-else class="min-h-screen flex items-center justify-center bg-gray-50">
      <div class="text-center">
        <h2 class="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
        <p class="text-gray-600 mb-4">Redirecting to login...</p>
      </div>
    </div>

    <!-- Error modal for owner access violations -->
    <div v-if="showErrorModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3 text-center">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L3.316 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 class="text-lg leading-6 font-medium text-gray-900 mt-2">{{ errorTitle }}</h3>
          <div class="mt-2 px-7 py-3">
            <p class="text-sm text-gray-500">{{ errorMessage }}</p>
            <p v-if="errorDetails" class="text-xs text-gray-400 mt-2">{{ errorDetails }}</p>
          </div>
          <div class="items-center px-4 py-3">
            <button
              @click="handleRetry"
              class="px-4 py-2 bg-red-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300"
            >
              Return to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { signOutUser } from '../actions/GraphQLAuth'
import { canAccessReportingDashboard, clearLoginState } from '../utils/auth'
import { useErrorHandler } from '../composables/useErrorHandler'

const router = useRouter()
const { errorState, showOwnerAccessError } = useErrorHandler()

const isChecking = ref(true)
const isAuthenticated = ref(false)
const showErrorModal = ref(false)
const errorTitle = ref('')
const errorMessage = ref('')
const errorDetails = ref('')

const checkAuthentication = async () => {
  try {
    // Check basic login state
    if (!canAccessReportingDashboard()) {
      console.log('AuthGuard: No valid login state found')
      redirectToLogin()
      return
    }

    // User is authenticated - skip owner checks
    isAuthenticated.value = true
    
  } catch (error) {
    console.error('AuthGuard: Error during authentication check:', error)
    redirectToLogin()
  } finally {
    isChecking.value = false
  }
}

const redirectToLogin = () => {
  clearLoginState()
  router.push('/login')
}

const showAccessDeniedError = () => {
  errorTitle.value = 'Access Restricted - Owner Only'
  errorMessage.value = 'This reporting dashboard is only accessible to organization owners.'
  errorDetails.value = 'You need to be marked as an owner in the organization_user table with is_owner=true. Please contact your system administrator if you believe you should have access.'
  showErrorModal.value = true
}

const handleRetry = () => {
  showErrorModal.value = false
  clearLoginState()
  window.location.href = '/login'
}

onMounted(() => {
  checkAuthentication()
})


</script>