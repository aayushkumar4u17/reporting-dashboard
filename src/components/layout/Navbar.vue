<template>
  <header class="navbar">
    <div class="navbar-left">
      <div class="logo">
        <img src="/fuelbuddy-logo.svg" alt="FuelBuddy Logo" class="logo-image" />
      </div>
    </div>
    <div class="navbar-right">
      <div class="user-section">
        <!-- Theme Toggle -->
        <ThemeToggle />
        
        <!-- Clickable Avatar -->
        <div class="avatar-container" @click="navigateToSelectUser" title="Switch Organization">
          <div class="avatar" :style="{ background: userProfile?.organizationAvatar || '#6b7280' }">
            <span v-if="userProfile?.organizationInitials" class="avatar-initials">{{ userProfile.organizationInitials }}</span>
          </div>
        </div>
        
        <!-- Username with popup -->
        <div class="user-profile" @click="toggleUserPopup">
          <span class="username" :class="{ 'loading': isLoading }">{{ displayName }}</span>
          
          <!-- User Info Popup -->
          <div v-if="showUserPopup" class="user-popup" :class="{ 'show': showUserPopup }" @click.stop>
            <div class="popup-item">
              <span class="popup-label">Name:</span>
              <span class="popup-value">{{ displayName }}</span>
            </div>
            <div class="popup-item">
              <span class="popup-label">Email:</span>
              <span class="popup-value">{{ userProfile?.email || 'N/A' }}</span>
            </div>
            <div class="popup-item">
              <span class="popup-label">Phone:</span>
              <span class="popup-value">{{ userProfile?.phoneNumber || 'N/A' }}</span>
            </div>
            <div class="popup-item">
              <span class="popup-label">Organization:</span>
              <span class="popup-value">{{ userProfile?.organizationName || 'N/A' }}</span>
            </div>
          </div>
        </div>
      </div>
      <button 
        class="hamburger-menu" 
        @click="toggleMobileMenu"
        :class="{ 'active': isMobileMenuOpen }"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
    </div>
  </header>

  <!-- Organization Selection Popup -->
  <div v-if="showOrgPopup" class="org-popup-overlay" @click="closeOrgPopup">
    <div class="org-popup" @click.stop>
      <div class="org-popup-header">
        <h3>Select Organization</h3>
        <button @click="closeOrgPopup" class="close-btn">×</button>
      </div>
      
      <div class="org-search">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Search organizations..." 
          class="org-search-input"
        />
      </div>
      
      <div class="org-list">
        <div v-if="orgLoading" class="org-loading">
          <div class="loading-spinner"></div>
          <p>Loading organizations...</p>
        </div>
        
        <div v-else-if="orgError" class="org-error">
          <p>{{ orgError }}</p>
        </div>
        
        <div v-else-if="filteredOrganizations.length === 0" class="org-no-results">
          <p>No organizations found</p>
        </div>
        
        <div v-else class="org-grid">
          <div 
            v-for="org in filteredOrganizations" 
            :key="org.id"
            class="org-card"
            :class="{ 'selecting': selectingOrgId === org.id }"
            @click="selectOrganization(org)"
          >
            <div class="org-avatar" :style="{ background: org.color }">
              <div v-if="selectingOrgId === org.id" class="org-loading-spinner"></div>
              <span v-else class="org-initials">{{ getInitials(org.name) }}</span>
            </div>
            <p class="org-name">{{ org.name }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Sidebar Navigation -->
  <aside class="sidebar" :class="{ 'mobile-open': isMobileMenuOpen }">
    <nav class="nav-menu">
      <router-link to="/dashboard" class="nav-item" active-class="active" @click="closeMobileMenu">
        <svg class="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="7" height="7"/>
          <rect x="14" y="3" width="7" height="7"/>
          <rect x="14" y="14" width="7" height="7"/>
          <rect x="3" y="14" width="7" height="7"/>
        </svg>
        <span>Dashboard</span>
      </router-link>
      <router-link to="/point-of-contact" class="nav-item" active-class="active" @click="closeMobileMenu">
        <svg class="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
        <span>Point of Contact</span>
      </router-link>
      <router-link to="/my-orders" class="nav-item" active-class="active" @click="closeMobileMenu">
        <svg class="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
        </svg>
        <span>My Orders</span>
      </router-link>
      <router-link to="/my-invoices" class="nav-item" active-class="active" @click="closeMobileMenu">
        <svg class="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14,2 14,8 20,8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10,9 9,9 8,9"/>
        </svg>
        <span>My Invoices</span>
      </router-link>
      <router-link to="/payments" class="nav-item" active-class="active" @click="closeMobileMenu">
        <svg class="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
          <line x1="1" y1="10" x2="23" y2="10"/>
        </svg>
        <span>Payments</span>
      </router-link>
    </nav>
    <div class="nav-item logout" @click="handleLogout" :class="{ 'loading': isLoggingOut }">
      <svg v-if="!isLoggingOut" class="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
        <polyline points="16,17 21,12 16,7"/>
        <line x1="21" y1="12" x2="9" y2="12"/>
      </svg>
      <span v-if="!isLoggingOut">Logout</span>
      <span v-else class="logout-loading">
        <span class="loading-spinner"></span>
        Signing out...
      </span>
    </div>
  </aside>
  
  <div 
    class="mobile-overlay" 
    :class="{ 'active': isMobileMenuOpen }"
    @click="closeMobileMenu"
  ></div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { signOutUser } from '@/api/auth'
import { useUserProfile } from '@/composables/useUserProfile'
import { getSdk } from '@/sdk'
import client from '@/api/APIClient'
import { usePointOfContactStore } from '@/stores/pointOfContact'
import { useOrganizationStore } from '@/stores/organization'
import ThemeToggle from '@/components/ui/ThemeToggle.vue'

const router = useRouter()
const pointOfContactStore = usePointOfContactStore()
const organizationStore = useOrganizationStore()
const isMobileMenuOpen = ref(false)
const isLoggingOut = ref(false)
const showUserPopup = ref(false)
const showOrgPopup = ref(false)
const organizations = ref([])
const orgLoading = ref(false)
const orgError = ref(null)
const searchQuery = ref('')
const selectingOrgId = ref(null)

// User profile composable
const { displayName, organizationName, fetchUserProfile, clearUserProfile, isLoading, userProfile } = useUserProfile()

const handleLogout = async () => {
  if (isLoggingOut.value) return
  
  isLoggingOut.value = true
  
  try {
    // Clear user profile data
    clearUserProfile()
    await signOutUser(() => {
      router.push('/login')
    })
  } catch (error) {
    console.error('Error during logout:', error)
    router.push('/login')
  } finally {
    isLoggingOut.value = false
  }
}

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}

const toggleUserPopup = () => {
  showUserPopup.value = !showUserPopup.value
}

const navigateToSelectUser = async () => {
  showOrgPopup.value = true
  await fetchOrganizations()
}

const closeOrgPopup = () => {
  // Add closing animation class
  const popup = document.querySelector('.org-popup')
  if (popup) {
    popup.style.animation = 'slideDown 0.2s cubic-bezier(0.4, 0, 0.2, 1) forwards'
    setTimeout(() => {
      showOrgPopup.value = false
      searchQuery.value = ''
      selectingOrgId.value = null
    }, 200)
  } else {
    showOrgPopup.value = false
    searchQuery.value = ''
    selectingOrgId.value = null
  }
}

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
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

const getInitials = (name) => {
  if (!name) return 'O'
  return name.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase()
}

const getUserIdForAPI = async () => {
  try {
    const { getAuth } = await import('firebase/auth')
    const auth = getAuth()
    const user = auth.currentUser
    if (!user) throw new Error('No authenticated user found')
    const isDevelopment = import.meta.env.MODE === 'development'
    if (isDevelopment) return user.uid
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
    return user.uid
  } catch (error) {
    console.error('Error getting user ID for API:', error)
    throw error
  }
}

const fetchOrganizations = async () => {
  try {
    orgLoading.value = true
    orgError.value = null
    const userId = await getUserIdForAPI()
    if (!userId) {
      orgError.value = 'Authentication error'
      return
    }
    const wrappedClient = await client()
    const { fetchUserOrganizations } = await import('@/api/IndusDashboardAuthService')
    const organizationUsers = await fetchUserOrganizations(userId)
    if (organizationUsers && organizationUsers.length > 0) {
      const uniqueOrgs = new Map()
      organizationUsers.forEach(orgUser => {
        const orgId = orgUser.organization.id
        const existing = uniqueOrgs.get(orgId)
        if (!existing || new Date(orgUser.created_at || 0) > new Date(existing.created_at || 0)) {
          uniqueOrgs.set(orgId, orgUser)
        }
      })
      organizations.value = Array.from(uniqueOrgs.values()).map(orgUser => ({
        id: orgUser.organization.id,
        name: orgUser.organization.name || 'Unnamed Organization',
        color: getColorForOrg(orgUser.organization.name || 'Unnamed Organization'),
        created_at: orgUser.organization.created_at || orgUser.created_at
      })).sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
    } else {
      organizations.value = []
      orgError.value = 'No organizations found'
    }
  } catch (err) {
    console.error('Error fetching organizations:', err)
    orgError.value = 'Failed to load organizations'
    organizations.value = []
  } finally {
    orgLoading.value = false
  }
}

const selectOrganization = async (org) => {
  try {
    selectingOrgId.value = org.id
    
    const orgWithAvatar = {
      ...org,
      avatar: org.color,
      initials: getInitials(org.name)
    }
    
    console.log('Selecting organization:', orgWithAvatar)
    
    // Update organization store
    organizationStore.setSelectedOrganization(orgWithAvatar)
    pointOfContactStore.setSelectedUserId(org.id)
    
    // Refresh user profile to update avatar
    await fetchUserProfile()
    
    // Close popup after successful update
    closeOrgPopup()
  } catch (error) {
    console.error('Error selecting organization:', error)
  } finally {
    selectingOrgId.value = null
  }
}

const filteredOrganizations = computed(() => {
  if (!searchQuery.value.trim()) return organizations.value
  const query = searchQuery.value.toLowerCase().trim()
  return organizations.value.filter(org => 
    org.name.toLowerCase().includes(query)
  )
})

// Close popup when clicking outside
const handleClickOutside = (event) => {
  if (!event.target.closest('.user-profile')) {
    showUserPopup.value = false
  }
  if (!event.target.closest('.org-popup') && !event.target.closest('.avatar-container')) {
    showOrgPopup.value = false
  }
}

// Initialize user profile on component mount
onMounted(async () => {
  try {
    await fetchUserProfile()
  } catch (error) {
    console.error('Failed to load user profile:', error)
  }
  
  // Add click outside listener
  document.addEventListener('click', handleClickOutside)
})

// Cleanup on unmount
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* Header Styles */
.navbar {
  background: var(--bg-glass);
  backdrop-filter: blur(16px);
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1002;
  height: 70px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.navbar-left .logo {
  display: flex;
  flex-direction: column;
}

.logo-image {
  height: 40px;
  width: auto;
  object-fit: contain;
  filter: drop-shadow(0 2px 4px rgba(0, 200, 81, 0.15));
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.logo-image:hover {
  filter: drop-shadow(0 4px 8px rgba(0, 200, 81, 0.25));
  transform: scale(1.05);
}

.tagline {
  font-size: 0.75rem;
  /* color: #666; */
  margin-top: -2px;
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

.user-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.avatar-container {
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.avatar-container:hover {
  transform: scale(1.05);
}

.user-profile {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 0.75rem;
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  background: var(--bg-secondary);
  border: 1px solid var(--border-light);
}

.user-profile:hover {
  background: var(--bg-hover);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px var(--shadow-color);
  border-color: var(--border-color);
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  /* background: #1bbb4b; */
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  /* box-shadow: 0 2px 8px rgba(107, 114, 128, 0.2); */
}

.avatar-initials {
  color: white;
  font-size: 14px;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.user-popup {
  position: absolute;
  top: 100%;
  right: 0;
  background: var(--bg-glass);
  backdrop-filter: blur(12px);
  border-radius: 12px;
  box-shadow: 0 8px 32px var(--shadow-medium), 0 0 0 1px var(--border-light);
  padding: 1.25rem;
  min-width: 280px;
  z-index: 1001;
  border: 1px solid var(--border-light);
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
}

.user-popup.show {
  opacity: 1;
  transform: translateY(0) scale(1);
  pointer-events: auto;
}

.popup-item {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--border-light);
  transition: all 0.3s ease;
}

.popup-item:last-child {
  border-bottom: none;
}

.popup-item:hover {
  background: var(--bg-hover);
  margin: 0 -0.5rem;
  padding: 0.75rem 0.5rem;
  border-radius: 8px;
}

.popup-label {
  font-weight: 600;
  color: var(--text-secondary);
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.popup-value {
  color: var(--text-primary);
  font-size: 0.9rem;
  font-weight: 500;
  text-align: right;
  max-width: 160px;
  word-break: break-word;
}

.username {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.9rem;
  transition: all 0.3s ease;
  text-align: center;
}

.username.loading {
  opacity: 0.7;
  color: var(--text-secondary);
}

.user-profile:hover .username {
  color: var(--text-primary);
  transform: translateX(2px);
}



.nav-menu {
  flex: 1;
}

.nav-item {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-light);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: var(--text-secondary);
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  position: relative;
  overflow: hidden;
  font-size: 1rem;
  font-weight: 500;
}

.nav-icon {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0.7;
}

.nav-item:hover .nav-icon,
.nav-item.active .nav-icon {
  opacity: 1;
  transform: scale(1.1);
}

.nav-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, var(--accent-light), transparent);
  transition: left 0.4s ease;
}

.nav-item:hover::before {
  left: 100%;
}

.nav-item:hover {
  background: var(--bg-hover);
  transform: translateX(3px);
  color: var(--accent-primary);
  box-shadow: inset 3px 0 0 var(--accent-light);
}

.nav-item.active {
  background: linear-gradient(90deg, var(--accent-light), var(--bg-hover));
  color: var(--accent-primary);
  transform: translateX(3px);
  box-shadow: inset 3px 0 0 var(--accent-primary);
  font-weight: 600;
}

.nav-item.active::after {
  content: '';
  position: absolute;
  right: 0;
  top: 0;
  height: 100%;
  width: 2px;
  background: linear-gradient(180deg, var(--accent-primary), var(--accent-secondary));
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    height: 0;
  }
  to {
    height: 100%;
  }
}

.nav-item.logout {
  color: #dc3545;
  border-top: 1px solid rgba(220, 53, 69, 0.1);
  margin-top: auto;
}

.nav-item.logout:hover {
  background: rgba(220, 53, 69, 0.05);
  color: #c82333;
  transform: translateX(3px);
  box-shadow: inset 3px 0 0 rgba(220, 53, 69, 0.3);
}

.nav-item.logout.loading {
  opacity: 0.7;
  cursor: not-allowed;
  pointer-events: none;
}

.nav-item.logout.loading:hover {
  transform: none;
  background: rgba(220, 53, 69, 0.05);
}

.logout-loading {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: 1.5rem;
}

.loading-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid var(--bg-secondary);
  border-top: 2px solid #dc3545;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Hamburger Menu Styles */
.hamburger-menu {
  display: none;
  flex-direction: column;
  justify-content: space-around;
  width: 24px;
  height: 24px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  z-index: 1001;
}

.hamburger-menu span {
  display: block;
  height: 3px;
  width: 100%;
  background-color: var(--text-primary);
  border-radius: 2px;
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  transform-origin: center;
}

.hamburger-menu.active span:nth-child(1) {
  transform: rotate(45deg) translate(5px, 5px);
}

.hamburger-menu.active span:nth-child(2) {
  opacity: 0;
  transform: scale(0);
}

.hamburger-menu.active span:nth-child(3) {
  transform: rotate(-45deg) translate(7px, -6px);
}

/* Mobile Overlay */
.mobile-overlay {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 998;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.mobile-overlay.active {
  opacity: 1;
}

/* Enhanced Sidebar Transitions */
.sidebar {
  width: 200px;
  background: var(--bg-glass);
  backdrop-filter: blur(12px);
  padding: 0;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--border-light);
  position: fixed;
  top: 70px;
  left: 0;
  bottom: 0;
  z-index: 999;
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

/* Responsive Design */
@media (max-width: 768px) {
  .navbar {
    padding: 0.75rem 1rem;
  }
  
  .navbar-right {
    gap: 0.75rem;
  }
  
  .hamburger-menu {
    display: flex;
  }
  
  .mobile-overlay {
    display: block;
  }
  
  .sidebar {
    transform: translateX(-100%);
    width: 260px;
    /* box-shadow: 4px 0 20px rgba(0, 0, 0, 0.15); */
  }
  
  .sidebar.mobile-open {
    transform: translateX(0);
  }
  
  .username {
    display: none;
  }
  
  .user-section {
    gap: 0.5rem;
  }
  
  .nav-item {
    padding: 0.75rem 1rem;
    font-size: 0.85rem;
  }
  
  .nav-icon {
    width: 16px;
    height: 16px;
  }
}

/* Organization Popup Styles */
.org-popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  z-index: 1003;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.org-popup {
  background: var(--bg-glass);
  backdrop-filter: blur(16px);
  border-radius: 16px;
  box-shadow: 0 20px 60px var(--shadow-medium), 0 0 0 1px var(--border-light);
  border: 1px solid var(--border-color);
  width: 90%;
  max-width: 650px;
  max-height: 85vh;
  overflow: hidden;
  animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.org-popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.75rem 2rem;
  background: linear-gradient(135deg, var(--accent-light), var(--bg-hover));
  border-bottom: 1px solid var(--border-color);
}

.org-popup-header h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.4rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.close-btn {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  font-size: 1.25rem;
  color: #ef4444;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #dc2626;
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
}

.org-search {
  padding: 1.5rem 2rem;
  background: var(--bg-hover);
  border-bottom: 1px solid var(--border-color);
}

.org-search-input {
  width: 100%;
  padding: 0.875rem 1.25rem;
  border: 2px solid var(--border-color);
  border-radius: 12px;
  font-size: 0.95rem;
  background: var(--bg-secondary);
  color: var(--text-primary);
  backdrop-filter: blur(5px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.org-search-input:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px var(--accent-light);
  background: var(--bg-primary);
  transform: translateY(-1px);
}

.org-list {
  padding: 2rem;
  max-height: 450px;
  overflow-y: auto;
}

.org-loading, .org-error, .org-no-results {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
}

.org-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.org-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 1.25rem;
}

.org-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem 1rem;
  background: var(--bg-secondary);
  backdrop-filter: blur(8px);
  border: 1px solid var(--border-light);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: center;
  position: relative;
  overflow: hidden;
}

.org-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 200, 81, 0.1), transparent);
  transition: left 0.5s ease;
}

.org-card:hover::before {
  left: 100%;
}

.org-card:hover {
  border-color: var(--accent-primary);
  transform: translateY(-4px);
  box-shadow: 0 8px 25px var(--accent-light);
  background: var(--bg-primary);
}

.org-card.selecting {
  opacity: 0.9;
  pointer-events: none;
  border-color: #00C851;
  box-shadow: 0 8px 25px rgba(0, 200, 81, 0.3);
  transform: scale(0.95);
  background: rgba(0, 200, 81, 0.05);
}

.org-avatar {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  /* box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1); */
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.org-initials {
  color: white;
  font-size: 1.25rem;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.org-name {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
  word-break: break-word;
  line-height: 1.3;
}

.org-loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.org-card.selecting .org-avatar {
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes slideDown {
  from {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateY(-20px) scale(0.98);
  }
}

@media (max-width: 480px) {
  .navbar {
    padding: 0.6rem;
  }
  
  .logo-image {
    height: 28px;
  }
  
  .nav-item {
    padding: 0.6rem 0.75rem;
    font-size: 0.8rem;
  }
  
  .nav-icon {
    width: 14px;
    height: 14px;
  }
  
  .sidebar {
    width: 240px;
  }
  
  .org-popup {
    width: 95%;
    max-height: 85vh;
  }
  
  .org-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 0.75rem;
  }
  
  .org-card {
    padding: 0.75rem;
  }
  
  .org-avatar {
    width: 50px;
    height: 50px;
  }
  
  .org-initials {
    font-size: 1rem;
  }
}
</style>