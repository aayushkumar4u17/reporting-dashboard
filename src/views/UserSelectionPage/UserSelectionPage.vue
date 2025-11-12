<template>
  <div class="user-selection-page">
    <!-- Loading Spinner Overlay -->
    <div v-if="showInitialLoader" class="initial-loader-overlay">
      <div class="initial-loader">
        <div class="spinner"></div>
        <p>Loading organizations...</p>
      </div>
    </div>
    
    <div class="selection-container" :class="{ 'fade-in': !showInitialLoader }">
      <div class="header">
        <img src="/fuelbuddy-logo.svg" alt="FuelBuddy Logo" class="logo" />
      </div>
      
      <h1 class="title">Select Organization</h1>
      <p class="subtitle">Choose an organization to access the dashboard</p>
      
      <!-- Search Bar -->
      <div class="search-container">
        <div class="search-input-wrapper">
          <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <input 
            v-model="searchInput" 
            @keyup.enter="performSearch"
            type="text" 
            placeholder="Search organizations..." 
            class="search-input"
          />
          <button v-if="searchQuery" @click="clearSearch" class="clear-search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>
      
      <div v-if="loading" class="users-grid">
        <div v-for="i in 6" :key="i" class="user-card skeleton-card">
          <SkeletonLoader width="120px" height="120px" class="skeleton-avatar" />
          <SkeletonLoader width="70%" height="20px" class="skeleton-name" />
          <SkeletonLoader width="50%" height="16px" class="skeleton-role" />
        </div>
      </div>
      
      <div v-else-if="error" class="error-message">
        <p>{{ error }}</p>
        <button v-if="!error.includes('being set up') && !error.includes('associated with any organizations')" @click="retryFetch" class="retry-btn">Retry</button>
      </div>
      
      <div v-else class="users-grid">
        <div 
          v-for="org in filteredOrganizations" 
          :key="org.uniqueKey || `${org.id}-${org.name}`"
          class="user-card"
          :class="{ 'selected': isSelectedOrganization(org.id) }"
          @click="selectOrganization(org)"
        >
          <div class="user-avatar">
            <img 
              v-if="org.brand_logo" 
              :src="org.brand_logo" 
              :alt="org.name"
              class="brand-logo"
              @error="(e) => handleImageError(e, org)"
            />
            <div 
              v-if="!org.brand_logo || org.showFallback" 
              class="fallback-avatar" 
              :style="{ background: org.color }"
            >
              <span class="user-initial">{{ getInitials(org.name) }}</span>
            </div>
          </div>
          <p class="user-name">{{ org.name }}</p>
          <div v-if="isSelectedOrganization(org.id)" class="selected-tick">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20,6 9,17 4,12"/>
            </svg>
          </div>
        </div>
      </div>
      
      <div v-if="!loading && !error && organizations.length === 0" class="no-organizations">
        <p>No delivery organizations found. Please contact your administrator.</p>
      </div>
      
      <div v-if="!loading && !error && organizations.length > 0 && filteredOrganizations.length === 0" class="no-results">
        <p>No organizations found matching "{{ searchQuery }}"</p>
        <button @click="clearSearch" class="clear-search-btn">Clear Search</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getSdk } from '@/sdk'
import client from '@/api/APIClient'
import { canAccessIndusDashboard } from '@/utils/auth'
import { useUserStore } from '@/stores'
import { useThemeStore } from '@/stores/theme'
import { usePointOfContactStore } from '@/stores/pointOfContact'
import { useOrganizationStore } from '@/stores/organization'
import { useGlobalErrorHandler } from '@/composables/useGlobalErrorHandler'
import SkeletonLoader from '@/components/layout/SkeletonLoader.vue'

const router = useRouter()
const userStore = useUserStore()
const themeStore = useThemeStore()
const pointOfContactStore = usePointOfContactStore()
const organizationStore = useOrganizationStore()
const { showError, showNetworkError, showAuthError, showDataLoadError } = useGlobalErrorHandler()
const organizations = ref([])
const loading = ref(true)
const error = ref(null)
const showInitialLoader = ref(true)
const searchQuery = ref('')
const searchInput = ref('')
let authStateCheckInterval = null

// Development mode check
const isDevelopment = import.meta.env.MODE === 'development'

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

// Check if organization is currently selected
const isSelectedOrganization = (orgId) => {
  // Initialize organization store if needed
  organizationStore.initialize()
  const selectedOrg = organizationStore.selectedOrganization || JSON.parse(localStorage.getItem('selectedOrganization') || 'null')

  return selectedOrg?.id === orgId
}

// Clear search query
const clearSearch = () => {
  searchQuery.value = ''
  searchInput.value = ''
}

// Perform search when Enter is pressed
const performSearch = () => {
  searchQuery.value = searchInput.value
}

// Watch searchInput for automatic search
watch(searchInput, (newValue) => {
  searchQuery.value = newValue
})

// Computed property for filtered and sorted organizations
const filteredOrganizations = computed(() => {
  let filtered = organizations.value
  
  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    filtered = filtered.filter(org => 
      org.name.toLowerCase().includes(query)
    )
  }
  
  // Sort by creation date (newest first)
  return filtered.sort((a, b) => {
    const dateA = new Date(a.created_at || 0)
    const dateB = new Date(b.created_at || 0)
    return dateB - dateA // Newest first
  })
})

// Select organization and navigate to dashboard
const selectOrganization = (org) => {
  // Store selected organization with avatar info
  const orgWithAvatar = {
    ...org,
    avatar: org.brand_logo || org.color,
    initials: getInitials(org.name)
  }
  localStorage.setItem('selectedOrganization', JSON.stringify(orgWithAvatar))
  
  // Store organization ID for point of contact dashboard
  pointOfContactStore.setSelectedUserId(org.id)
  
  // Navigate to dashboard
  router.push('/dashboard')
}



// Function to get user ID for API calls (uses Firebase UID in development)
const getUserIdForAPI = async () => {
  try {
    // Import Firebase auth
    const { getAuth } = await import('firebase/auth')
    
    const auth = getAuth()
    const user = auth.currentUser
    
    if (!user) {
      throw new Error('No authenticated user found')
    }
    
    // In development, use Firebase UID directly
    const isDevelopment = import.meta.env.MODE === 'development'
    if (isDevelopment) {
      return user.uid
    }
    
    // In production, try to get Hasura user ID from claims
    try {
      const idToken = await user.getIdToken(true)
      const payload = JSON.parse(atob(idToken.split('.')[1]))
      const hasuraClaims = payload['https://hasura.io/jwt/claims']
      
      if (hasuraClaims && hasuraClaims['x-hasura-user-id']) {
        return hasuraClaims['x-hasura-user-id']
      }
    } catch (claimsError) {
      console.warn('Could not get Hasura claims, falling back to Firebase UID:', claimsError)
    }
    
    // Fallback to Firebase UID
    return user.uid
  } catch (error) {
    console.error('Error getting user ID for API:', error)
    throw error
  }
}

// Fetch organizations for the current user
const fetchOrganizations = async () => {
  try {
    // Reset error state
    error.value = null
    
    // Get user ID for API calls
    const userId = await getUserIdForAPI()
    
    if (!userId) {
      error.value = 'Authentication error. Please try logging in again.'
      organizations.value = []
      localStorage.removeItem('cachedOrganizations')
      loading.value = false
      return
    }
    
    // Get GraphQL client
    const wrappedClient = await client()
    
    // Remove the direct graphqlClient creation and use the SDK from APIClient
    const sdk = getSdk(wrappedClient)
    
    // Import and use the new fetchUserOrganizations function
    const { fetchUserOrganizations } = await import('@/api/IndusDashboardAuthService')
    const organizationUsers = await fetchUserOrganizations(userId)
    
    // Transform the data for display
    if (organizationUsers && organizationUsers.length > 0) {
      // Handle duplicate entries by creating a unique set based on organization ID
      const uniqueOrgs = new Map();
      
      organizationUsers.forEach(orgUser => {
        const orgId = orgUser.organization.id;
        const existing = uniqueOrgs.get(orgId);
        
        // Include all DELIVERY type organizations (filtering already done by fetchUserOrganizations)
        if (!existing || new Date(orgUser.created_at || 0) > new Date(existing.created_at || 0)) {
          uniqueOrgs.set(orgId, orgUser);
        }
      });
      
      const orgs = Array.from(uniqueOrgs.values()).map((orgUser, index) => ({
        id: orgUser.organization.id,
        name: orgUser.organization.name || 'Unnamed Organization',
        organization_user_id: orgUser.id, // This is the organization_user table id
        user_id: orgUser.user_id,
        is_active: orgUser.is_active,
        is_owner: orgUser.is_owner,
        organization_user_type: orgUser.organization_user_type, // Should be 'DELIVERY'
        created_at: orgUser.organization.created_at || orgUser.created_at, // Use organization creation date first
        brand_logo: orgUser.organization.brand_logo,
        showFallback: false,
        color: getColorForOrg(orgUser.organization.name || 'Unnamed Organization'),
        uniqueKey: `${orgUser.organization.id}-${index}-${Date.now()}` // Ensure uniqueness
      }))
      
      // Sort organizations by creation date (newest first) before setting
      organizations.value = orgs.sort((a, b) => {
        const dateA = new Date(a.created_at || 0)
        const dateB = new Date(b.created_at || 0)
        return dateB - dateA
      })
      
      // Cache organizations in localStorage for quick access on page refresh
      localStorage.setItem('cachedOrganizations', JSON.stringify(orgs))
    } else {
      organizations.value = []
      localStorage.removeItem('cachedOrganizations')
      // Show message for users with no qualifying organizations
      error.value = 'No delivery organizations found. Please contact your administrator.'
    }
  } catch (err) {
    console.error('Error fetching organizations:', err)
    
    if (err.message && err.message.includes('being set up')) {
      error.value = err.message
    } else if (err.message && err.message.includes('associated with any organizations')) {
      error.value = 'You are not associated with any organizations. Please contact your administrator.'
    } else if (isDevelopment) {
      error.value = 'Development Mode: Unable to load organizations. This may be due to backend services not running locally.'
    } else {
      error.value = 'Failed to load organizations. Please try again.'
      
      // Show global error for better UX
      if (err.message?.includes('network') || err.message?.includes('fetch')) {
        showNetworkError(() => retryFetch())
      } else if (err.message?.includes('auth') || err.message?.includes('Authentication')) {
        showAuthError()
      } else {
        showDataLoadError(() => retryFetch())
      }
    }
    
    organizations.value = []
    localStorage.removeItem('cachedOrganizations')
  } finally {
    loading.value = false
  }
}

// Handle image loading errors
const handleImageError = (event, org) => {
  // Mark this organization to show fallback
  org.showFallback = true
  event.target.style.display = 'none'
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

      }
    }
    
    // Fetch fresh data
    await fetchOrganizations()
  } catch (err) {
    console.error('Authentication check error:', err)
    error.value = 'Authentication error. Please try logging in again.'
    loading.value = false
    
    // Show auth error for better UX
    showAuthError()
  }
}

// Wait for Firebase auth state to be ready with improved logic
const waitForAuthState = () => {
  return new Promise((resolve) => {
    let attempts = 0
    const maxAttempts = 20 // Increased attempts
    const authCheckInterval = 500 // Check every 500ms
    
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

      }
      
      // Check localStorage flags as fallback
      const hasReportingFlag = localStorage.getItem('isLoggedInReportingDashboard') === 'true'
      const hasIndusFlag = localStorage.getItem('isLoggedInIndusDashboard') === 'true'
      
      if (hasReportingFlag && hasIndusFlag) {
        resolve(true)
        return
      }
      
      if (attempts < maxAttempts) {
        setTimeout(checkAuth, authCheckInterval)
      } else {
        resolve(false)
      }
    }
    
    checkAuth()
  })
}

onMounted(async () => {
  // Force light mode for user selection page
  themeStore.setTheme('light')
  
  // Show initial loader for 1 second for smooth transition
  setTimeout(() => {
    showInitialLoader.value = false
  }, 1000)
  
  // Wait for Firebase auth state to be ready
  const authReady = await waitForAuthState()
  if (!authReady) {

    // Still proceed with checkAuthAndFetch which will handle redirect if needed
  }
  
  // Check authentication and fetch organizations
  await checkAuthAndFetch()
  
  // Set up interval to periodically check auth state
  authStateCheckInterval = setInterval(async () => {
    if (!canAccessIndusDashboard()) {

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