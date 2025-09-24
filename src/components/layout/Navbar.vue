<template>
  <header class="navbar">
    <div class="navbar-left">
      <div class="logo">
        <img src="/fuelbuddy-logo.svg" alt="FuelBuddy Logo" class="logo-image" />
      </div>
    </div>
    <div class="navbar-right">
      <div class="user-section">
        <!-- Clickable Avatar -->
        <div class="avatar-container" @click="navigateToSelectUser" title="Switch Organization">
          <div class="avatar" :style="{ background: userProfile?.organizationAvatar || 'linear-gradient(135deg, #00C851, #00A844)' }">
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

  <!-- Sidebar Navigation -->
  <aside class="sidebar" :class="{ 'mobile-open': isMobileMenuOpen }">
    <nav class="nav-menu">
      <router-link to="/dashboard" class="nav-item" active-class="active" @click="closeMobileMenu">
        <span>Dashboard</span>
      </router-link>
      <router-link to="/point-of-contact" class="nav-item" active-class="active" @click="closeMobileMenu">
        <span>Point of Contact</span>
      </router-link>
      <router-link to="/my-orders" class="nav-item" active-class="active" @click="closeMobileMenu">
        <span>My orders</span>
      </router-link>
      <router-link to="/my-invoices" class="nav-item" active-class="active" @click="closeMobileMenu">
        <span>My invoices</span>
      </router-link>
      <router-link to="/payments" class="nav-item" active-class="active" @click="closeMobileMenu">
        <span>Payments</span>
      </router-link>
    </nav>
    <div class="nav-item logout" @click="handleLogout" :class="{ 'loading': isLoggingOut }">
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
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { signOutUser } from '@/api/auth'
import { useUserProfile } from '@/composables/useUserProfile'

const router = useRouter()
const isMobileMenuOpen = ref(false)
const isLoggingOut = ref(false)
const showUserPopup = ref(false)

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

const navigateToSelectUser = () => {
  router.push('/select-user')
}

// Close popup when clicking outside
const handleClickOutside = (event) => {
  if (!event.target.closest('.user-profile')) {
    showUserPopup.value = false
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
  background: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1002;
  height: 64px;
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
  transition: all 0.3s ease;
}

.logo-image:hover {
  filter: drop-shadow(0 4px 8px rgba(0, 200, 81, 0.25));
  transform: scale(1.05);
}

.tagline {
  font-size: 0.75rem;
  color: #666;
  margin-top: -2px;
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.notification {
  position: relative;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.notification:hover {
  background-color: rgba(0, 200, 81, 0.1);
  transform: translateY(-2px);
}

.bell-icon {
  font-size: 1.2rem;
  color: #666;
  transition: color 0.3s ease;
}

.notification:hover .bell-icon {
  color: #00C851;
}

.notification-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  background: #ff4444;
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 0.7rem;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: pulse 2s infinite;
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
  /* gap: 0.2rem; */
}

.avatar-container {
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.avatar-container:hover {
  background-color: rgba(0, 200, 81, 0.1);
  transform: scale(1.1);
}

.user-profile {
  display: flex;
  align-items: center;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
}

.user-profile:hover {
  background-color: rgba(0, 200, 81, 0.1);
  transform: translateY(-2px);
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #00C851, #00A844);
  transition: transform 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-initials {
  color: white;
  font-size: 13px;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.user-popup {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 1rem;
  min-width: 250px;
  z-index: 1001;
  border: 1px solid #e0e0e0;
  opacity: 0;
  transform: translateY(-10px);
  transition: all 0.3s ease;
  pointer-events: none;
}

.user-popup.show {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}

.popup-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.popup-item:last-child {
  border-bottom: none;
}

.popup-label {
  font-weight: 600;
  color: #666;
  font-size: 0.85rem;
}

.popup-value {
  color: #333;
  font-size: 0.85rem;
  text-align: right;
  max-width: 150px;
  word-break: break-word;
}



.username {
  font-weight: 500;
  color: #333;
  transition: color 0.3s ease;
}

.username.loading {
  opacity: 0.7;
  color: #666;
}

.user-profile:hover .username {
  color: #00C851;
}

/* Sidebar Styles */
.sidebar {
  width: 200px;
  background: white;
  padding: 0;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 4px rgba(0,0,0,0.1);
  position: fixed;
  top: 64px;
  left: 0;
  height: calc(100vh - 64px);
  z-index: 1000;
}

.nav-menu {
  flex: 1;
}

.nav-item {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: #666;
  text-decoration: none;
  display: block;
  position: relative;
  overflow: hidden;
}

.nav-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 200, 81, 0.1), transparent);
  transition: left 0.5s ease;
}

.nav-item:hover::before {
  left: 100%;
}

.nav-item:hover {
  background-color: #f8f9fa;
  transform: translateX(4px);
  color: #00C851;
}

.nav-item.active {
  background-color: #e8f5e8;
  color: #00C851;
  border-right: 3px solid #00C851;
  transform: translateX(4px);
}

.nav-item.active::after {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 3px;
  background: linear-gradient(180deg, #00C851, #00A844);
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
  border-top: 1px solid #eee;
}

.nav-item.logout:hover {
  background-color: #ffeaea;
  color: #c82333;
  transform: translateX(4px);
}

.nav-item.logout.loading {
  opacity: 0.7;
  cursor: not-allowed;
  pointer-events: none;
}

.nav-item.logout.loading:hover {
  transform: none;
  background-color: #ffeaea;
}

.logout-loading {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.loading-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid #f3f3f3;
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
  background-color: #333;
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
  background: white;
  padding: 0;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 4px rgba(0,0,0,0.1);
  position: fixed;
  top: 64px;
  left: 0;
  height: calc(100vh - 64px);
  z-index: 999;
  transition: transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

/* Responsive Design */
@media (max-width: 768px) {
  .navbar {
    padding: 1rem;
  }
  
  .navbar-right {
    gap: 1rem;
  }
  
  .hamburger-menu {
    display: flex;
  }
  
  .mobile-overlay {
    display: block;
  }
  
  .sidebar {
    transform: translateX(-100%);
    width: 280px;
    box-shadow: 4px 0 20px rgba(0, 0, 0, 0.15);
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
}

@media (max-width: 480px) {
  .navbar {
    padding: 0.75rem;
  }
  
  .logo-image {
    height: 32px;
  }
  
  .tagline {
    font-size: 0.7rem;
  }
  
  .nav-item {
    padding: 0.75rem 0.5rem;
    font-size: 0.9rem;
    min-width: 100px;
  }
}
</style>