import { ref, computed } from 'vue'
import { fetchPointOfContactReport } from '@/api/pointOfContact'
import { useOrganization } from '@/composables/useOrganization'

interface POCFilterData {
  pocName: string
  city: string
  state: string
}

export const usePOCFilters = () => {
  const { getOrganizationId } = useOrganization()
  
  const pocData = ref<POCFilterData[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed properties for filter options
  const cityOptions = computed(() => {
    const cities = pocData.value
      .map(item => item.city)
      .filter(city => city && city.trim() && city !== '—')
    return [...new Set(cities)].sort()
  })

  const pocOptions = computed(() => {
    const pocs = pocData.value
      .map(item => item.pocName)
      .filter(poc => poc && poc.trim() && poc !== '—')
    return [...new Set(pocs)].sort()
  })

  const stateOptions = computed(() => {
    const states = pocData.value
      .map(item => item.state)
      .filter(state => state && state.trim() && state !== '—')
    return [...new Set(states)].sort()
  })

  // Get cities for a specific state
  const getCitiesForState = (stateName: string) => {
    if (!stateName) return cityOptions.value
    
    const cities = pocData.value
      .filter(item => item.state === stateName)
      .map(item => item.city)
      .filter(city => city && city.trim() && city !== '—')
    return [...new Set(cities)].sort()
  }

  // Get POCs for a specific city
  const getPOCsForCity = (cityName: string) => {
    if (!cityName) return pocOptions.value
    
    const pocs = pocData.value
      .filter(item => item.city === cityName)
      .map(item => item.pocName)
      .filter(poc => poc && poc.trim() && poc !== '—')
    return [...new Set(pocs)].sort()
  }

  // Load POC data for filter options
  let isLoadingData = false
  const loadPOCFilterData = async (forceReload = false) => {
    if (isLoadingData) {
      return // Already loading
    }
    
    if (pocData.value.length > 0 && !forceReload) {
      return // Data already loaded
    }

    try {
      isLoadingData = true
      loading.value = true
      error.value = null

      const organizationId = getOrganizationId()
      if (!organizationId) {
        throw new Error('No organization selected')
      }

      const response = await fetchPointOfContactReport({
        organization_id: organizationId
      })

      // Map response to our data structure
      pocData.value = response.contacts.map(contact => ({
        pocName: contact.full_name,
        city: contact.city,
        state: contact.state
      }))

    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load POC data'
    } finally {
      loading.value = false
      isLoadingData = false
    }
  }

  // Clear data (useful when organization changes)
  const clearPOCData = () => {
    pocData.value = []
    error.value = null
    isLoadingData = false
  }

  return {
    pocData: computed(() => pocData.value),
    cityOptions,
    pocOptions,
    stateOptions,
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    loadPOCFilterData,
    clearPOCData,
    getCitiesForState,
    getPOCsForCity
  }
}