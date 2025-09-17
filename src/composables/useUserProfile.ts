import { ref, computed } from 'vue'
import { getCurrentUserId } from '@/utils/user'
import { getUserOrganizationData } from '@/utils/auth'
import { validateIndusDashboardUser } from '@/api/IndusDashboardAuthService'
import { checkHasuraUserId } from '@/api/general'

export interface UserProfile {
  id: string
  firstName?: string
  lastName?: string
  phoneNumber?: string
  email?: string
  organizationName?: string
  organizationId?: string
  organizationAvatar?: string
  organizationInitials?: string
}

export const useUserProfile = () => {
  const userProfile = ref<UserProfile | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Computed property for display name
  const displayName = computed(() => {
    if (!userProfile.value) return 'User'
    
    const { firstName, lastName } = userProfile.value
    
    if (firstName && lastName) {
      return `${firstName} ${lastName}`
    } else if (firstName) {
      return firstName
    } else if (lastName) {
      return lastName
    }
    
    return 'User'
  })

  // Computed property for organization name
  const organizationName = computed(() => {
    return userProfile.value?.organizationName || 'Unknown Organization'
  })

  // Fetch user profile data
  const fetchUserProfile = async (): Promise<void> => {
    try {
      isLoading.value = true
      error.value = null

      // Get Firebase user ID
      const firebaseUserId = getCurrentUserId()
      if (!firebaseUserId) {
        throw new Error('No user ID found')
      }

      // Get Hasura user ID
      const hasuraUserId = await checkHasuraUserId()
      if (!hasuraUserId || typeof hasuraUserId !== 'string') {
        throw new Error('User session not ready')
      }

      // Get organization data from localStorage first (quick access)
      const orgData = getUserOrganizationData()

      // Validate user and get full profile data
      const validation = await validateIndusDashboardUser(firebaseUserId)
      
      if (validation.success && validation.data) {
        const userData = validation.data.user
        const orgData = validation.data.organization

        // Get organization avatar info from localStorage
        const selectedOrg = JSON.parse(localStorage.getItem('selectedOrganization') || '{}')
        
        userProfile.value = {
          id: hasuraUserId,
          firstName: userData.first_name || undefined,
          lastName: userData.last_name || undefined,
          phoneNumber: userData.phone_number || undefined,
          email: userData.email || undefined,
          organizationName: selectedOrg.name || orgData.name || 'Unknown Organization',
          organizationId: validation.data.organization_id,
          organizationAvatar: selectedOrg.avatar || selectedOrg.color,
          organizationInitials: selectedOrg.initials || orgData.name?.substring(0, 2).toUpperCase()
        }
      } else {
        // Fallback to organization data from localStorage if available
        if (orgData) {
          const selectedOrg = JSON.parse(localStorage.getItem('selectedOrganization') || '{}')
          userProfile.value = {
            id: hasuraUserId,
            organizationName: orgData.name,
            organizationId: orgData.id,
            organizationAvatar: selectedOrg.avatar || selectedOrg.color,
            organizationInitials: selectedOrg.initials || orgData.name?.substring(0, 2).toUpperCase()
          }
        } else {
          throw new Error(validation.error || 'Failed to load user profile')
        }
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to load user profile'
      console.error('Error fetching user profile:', err)
      
      // Fallback to organization name from localStorage if available
      const orgData = getUserOrganizationData()
      if (orgData) {
        const selectedOrg = JSON.parse(localStorage.getItem('selectedOrganization') || '{}')
        userProfile.value = {
          id: getCurrentUserId() || 'unknown',
          organizationName: orgData.name,
          organizationId: orgData.id,
          organizationAvatar: selectedOrg.avatar || selectedOrg.color,
          organizationInitials: selectedOrg.initials || orgData.name?.substring(0, 2).toUpperCase()
        }
        error.value = null // Clear error if we have fallback data
      }
    } finally {
      isLoading.value = false
    }
  }

  // Clear user profile
  const clearUserProfile = (): void => {
    userProfile.value = null
    error.value = null
  }

  return {
    userProfile,
    isLoading,
    error,
    displayName,
    organizationName,
    fetchUserProfile,
    clearUserProfile
  }
}