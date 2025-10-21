import { computed, watch, ref } from 'vue'
import { useOrganizationStore } from '@/stores/organization'

// Global flag to prevent multiple simultaneous initializations
let isInitializing = false
let initPromise: Promise<void> | null = null

export const useOrganization = () => {
  const organizationStore = useOrganizationStore()

  // Initialize store from localStorage if not already done
  const initialize = async () => {
    if (isInitializing && initPromise) {
      return initPromise
    }
    
    if (!initPromise) {
      isInitializing = true
      initPromise = new Promise<void>((resolve) => {
        try {
          organizationStore.initialize()
          resolve()
        } catch (error) {
          resolve() // Don't reject, just resolve to continue
        } finally {
          isInitializing = false
        }
      })
    }
    
    return initPromise
  }
  
  // Initialize immediately but don't await to prevent blocking
  initialize().catch(console.error)

  // Computed property for organization ID
  const organizationId = computed(() => organizationStore.organizationId)

  // Get organization ID for API calls
  const getOrganizationId = (): string => {
    return organizationStore.organizationId || organizationStore.getStoredOrganizationId()
  }

  // Check if organization is selected
  const hasOrganization = computed(() => {
    return !!organizationStore.organizationId
  })

  // Debounced callback to prevent rapid successive calls
  let debounceTimer: NodeJS.Timeout | null = null
  
  // Watch for organization changes with debouncing
  const watchOrganizationChange = (callback: (newOrgId: string, oldOrgId: string) => void) => {
    return watch(organizationId, (newVal, oldVal) => {
      // Clear existing timer
      if (debounceTimer) {
        clearTimeout(debounceTimer)
      }
      
      // Only trigger if values are actually different and both are truthy
      if (newVal !== oldVal && newVal && oldVal) {
        console.log('Organization ID changed:', { oldVal, newVal })
        
        // Debounce the callback to prevent rapid successive calls
        debounceTimer = setTimeout(() => {
          callback(newVal, oldVal)
          debounceTimer = null
        }, 100)
      }
    }, { immediate: false })
  }

  return {
    organizationId,
    hasOrganization,
    getOrganizationId,
    watchOrganizationChange,
    initialize
  }
}