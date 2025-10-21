import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface SelectedOrganization {
  id: string
  name: string
  avatar?: string
  color?: string
  initials?: string
}

export const useOrganizationStore = defineStore('organization', () => {
  const selectedOrganization = ref<SelectedOrganization | null>(null)

  // Computed property to get organization ID
  const organizationId = computed(() => {
    return selectedOrganization.value?.id || ''
  })

  // Helper function to get organization from localStorage
  const getStoredOrganization = (): SelectedOrganization | null => {
    try {
      const stored = localStorage.getItem('selectedOrganization')
      if (stored) {
        return JSON.parse(stored)
      }
    } catch (error) {
      // Handle error silently
    }
    return null
  }

  // Helper function to get organization ID from localStorage
  const getStoredOrganizationId = (): string => {
    const org = getStoredOrganization()
    return org?.id || ''
  }

  // Set selected organization
  const setSelectedOrganization = (org: SelectedOrganization) => {
    selectedOrganization.value = { ...org } // Force reactivity with new object
    localStorage.setItem('selectedOrganization', JSON.stringify(org))
  }

  // Refresh from localStorage
  const refreshFromStorage = () => {
    selectedOrganization.value = getStoredOrganization()
  }

  // Clear organization data
  const clearOrganization = () => {
    selectedOrganization.value = null
    localStorage.removeItem('selectedOrganization')
  }

  // Initialize from localStorage
  const initialize = () => {
    if (!selectedOrganization.value) {
      refreshFromStorage()
    }
  }

  return {
    selectedOrganization,
    organizationId,
    setSelectedOrganization,
    refreshFromStorage,
    clearOrganization,
    initialize,
    getStoredOrganizationId
  }
})