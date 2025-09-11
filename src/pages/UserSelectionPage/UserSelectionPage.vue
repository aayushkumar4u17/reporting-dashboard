<template>
  <div class="user-selection-page">
    <div class="selection-container">
      <div class="header">
        <img src="/fuelbuddy-logo.svg" alt="FuelBuddy Logo" class="logo" />
        <!-- Add logout button for testing -->
        <button @click="handleLogout" class="logout-btn">Logout</button>
      </div>
      
      <h1 class="title">Select Organization</h1>
      <p class="subtitle">Choose an organization to access the dashboard</p>
      
      <div v-if="loading" class="loading">
        <p>Loading organizations...</p>
      </div>
      
      <div v-else-if="error" class="error-message">
        <p>{{ error }}</p>
        <button @click="retryFetch" class="retry-btn">Retry</button>
      </div>
      
      <div v-else class="users-grid">
        <div 
          v-for="org in organizations" 
          :key="org.id"
          class="user-card"
          @click="selectOrganization(org)"
        >
          <div class="user-avatar" :style="{ background: org.color }">
            <span class="user-initial">{{ getInitials(org.name) }}</span>
          </div>
          <p class="user-name">{{ org.name }}</p>
          <p class="user-role">Owner</p>
        </div>
      </div>
      
      <div v-if="!loading && !error && organizations.length === 0" class="no-organizations">
        <p>No organizations found. Please contact your administrator.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { getSdk } from '@/sdk'
import client from '@/actions/GraphQLClient'
import { canAccessIndusDashboard } from '@/utils/auth'
import { useUserStore } from '@/store'

const router = useRouter()
const userStore = useUserStore()
const organizations = ref([])
const loading = ref(true)
const error = ref(null)
let authStateCheckInterval = null

// Generate a color based on organization name
const getColorForOrg = (name) => {
  const colors = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    'linear-gradient(135deg, #fad0c4 0%, #ffd1ff 100%)'
  ]
  
  // Generate a consistent index based on the name
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  return colors[Math.abs(hash) % colors.length]
}

// Get initials from organization name
const getInitials = (name) => {
  if (!name) return 'O'
  return name.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase()
}

// Select organization and navigate to dashboard
const selectOrganization = (org) => {
  // Store selected organization
  localStorage.setItem('selectedOrganization', JSON.stringify(org))
  
  // Navigate to dashboard
  router.push('/dashboard')
}

// Handle logout for testing
const handleLogout = async () => {
  try {
    // Import signOutUser function
    const { signOutUser } = await import('@/actions/auth')
    
    // Perform logout
    await signOutUser(() => {
      console.log('Logout completed')
      router.push('/login')
    })
  } catch (error) {
    console.error('Error during logout:', error)
    // Fallback navigation
    router.push('/login')
  }
}

// Function to get Hasura user ID from Firebase JWT token with retry mechanism
const getHasuraUserIdFromToken = async (maxRetries = 5) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Import Firebase auth
      const { getAuth } = await import('firebase/auth')
      
      // Check if Firebase app is initialized
      let auth
      try {
        auth = getAuth()
      } catch (error) {
        console.error('Firebase not initialized:', error)
        throw new Error('Firebase authentication not available')
      }
      
      const user = auth.currentUser
      
      if (!user) {
        throw new Error('No authenticated user found')
      }
      
      // Get the ID token which contains the claims
      const idToken = await user.getIdToken(true) // Force refresh to get latest claims
      
      // Decode the JWT token to get claims
      const payload = JSON.parse(atob(idToken.split('.')[1]))
      
      // Extract Hasura user ID from claims
      const hasuraClaims = payload['https://hasura.io/jwt/claims']
      if (hasuraClaims && hasuraClaims['x-hasura-user-id']) {
        return hasuraClaims['x-hasura-user-id']
      }
      
      // If no claims found and not last attempt, wait and retry
      if (attempt < maxRetries) {
        console.log(`Hasura claims not found, waiting for attempt ${attempt + 1}`)
        await new Promise(resolve => setTimeout(resolve, 2000 * attempt))
        continue
      }
      
      throw new Error('Hasura user ID not found in token claims')
    } catch (error) {
      console.error(`Error getting Hasura user ID from token (attempt ${attempt}):`, error)
      
      // If not last attempt, wait and retry
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 2000 * attempt))
        continue
      }
      
      throw error
    }
  }
}

// Fetch organizations for the current user
const fetchOrganizations = async () => {
  try {
    // Reset error state
    error.value = null
    
    // Get Hasura user ID from Firebase JWT token with retry mechanism
    const userId = await getHasuraUserIdFromToken()
    
    if (!userId) {
      router.replace('/login')
      return
    }
    
    // Get GraphQL client
    const graphqlClient = await client
    const sdk = getSdk(graphqlClient)
    
    // Execute the validateIndusDashboardUser query to get organizations
    const result = await sdk.validateIndusDashboardUser({ user_id: userId })
    
    // Transform the data for display
    if (result.organization_user && result.organization_user.length > 0) {
      const orgs = result.organization_user.map(orgUser => ({
        id: orgUser.organization.id,
        name: orgUser.organization.name || 'Unnamed Organization',
        user_id: orgUser.user_id,
        is_active: orgUser.is_active,
        is_owner: orgUser.is_owner,
        created_at: orgUser.created_at,
        color: getColorForOrg(orgUser.organization.name || 'Unnamed Organization')
      }))
      
      organizations.value = orgs
      
      // Cache organizations in localStorage for quick access on page refresh
      localStorage.setItem('cachedOrganizations', JSON.stringify(orgs))
    } else {
      organizations.value = []
      localStorage.removeItem('cachedOrganizations')
    }
  } catch (err) {
    console.error('Error fetching organizations:', err)
    error.value = 'Failed to load organizations. Please try again.'
    organizations.value = []
    // Try to load cached organizations if available
    const cached = localStorage.getItem('cachedOrganizations')
    if (cached) {
      try {
        organizations.value = JSON.parse(cached)
        error.value = null // Clear error if we have cached data
      } catch (e) {
        console.error('Error parsing cached organizations:', e)
      }
    }
  } finally {
    loading.value = false
  }
}

// Retry fetching organizations
const retryFetch = () => {
  loading.value = true
  fetchOrganizations()
}

// Check authentication and fetch data
const checkAuthAndFetch = async () => {
  try {
    // Check if user has proper access
    if (!canAccessIndusDashboard()) {
      console.warn('User does not have Indus Dashboard access')
      router.replace('/login')
      return
    }
    
    // Try to load cached organizations first for immediate display
    const cached = localStorage.getItem('cachedOrganizations')
    if (cached) {
      try {
        organizations.value = JSON.parse(cached)
        loading.value = false
      } catch (e) {
        console.error('Error parsing cached organizations:', e)
      }
    }
    
    // Fetch fresh data
    await fetchOrganizations()
  } catch (err) {
    console.error('Error during auth check:', err)
    error.value = 'Authentication error. Please try logging in again.'
    loading.value = false
  }
}

// Wait for Firebase auth state to be ready
const waitForAuthState = () => {
  return new Promise((resolve) => {
    let attempts = 0
    const maxAttempts = 10
    
    const checkAuth = async () => {
      attempts++
      try {
        const { getAuth } = await import('firebase/auth')
        const auth = getAuth()
        if (auth.currentUser) {
          resolve(true)
          return
        }
      } catch (error) {
        console.log('Firebase not initialized yet, waiting...')
      }
      
      if (attempts < maxAttempts) {
        setTimeout(checkAuth, 500)
      } else {
        resolve(false)
      }
    }
    
    checkAuth()
  })
}

onMounted(async () => {
  // Wait for Firebase auth state to be ready
  const authReady = await waitForAuthState()
  if (!authReady) {
    console.warn('Firebase auth not ready, checking anyway...')
  }
  
  // Check authentication and fetch organizations
  await checkAuthAndFetch()
  
  // Set up interval to periodically check auth state
  authStateCheckInterval = setInterval(async () => {
    if (!canAccessIndusDashboard()) {
      console.warn('User lost authentication, redirecting to login')
      clearInterval(authStateCheckInterval)
      router.replace('/login')
    }
  }, 5000)
})

onUnmounted(() => {
  // Clear any intervals
  if (authStateCheckInterval) {
    clearInterval(authStateCheckInterval)
  }
})
</script>

<style scoped>
  /* All CSS has been moved to UserSelectionPage.css */
  @import './UserSelectionPage.css';
</style>