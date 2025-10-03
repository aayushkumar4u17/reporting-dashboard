import { computed, watch } from 'vue'
import { useOrganizationStore } from '@/stores/organization'

export const useOrganization = () => {
  const organizationStore = useOrganizationStore()

  // Initialize store from localStorage if not already done
  organizationStore.initialize()

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

  // Watch for organization changes
  const watchOrganizationChange = (callback: (newOrgId: string, oldOrgId: string) => void) => {
    return watch(organizationId, (newVal, oldVal) => {
      console.log('Organization ID changed:', { oldVal, newVal })
      callback(newVal, oldVal)
    }, { immediate: false })
  }

  return {
    organizationId,
    hasOrganization,
    getOrganizationId,
    watchOrganizationChange
  }
}