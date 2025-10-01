<template>
  <div class="point-of-contact-page">
    <div class="poc-container">
      <!-- Filter Component -->
      <FilterBar
        :filters="['state', 'city', 'poc']"
        :state-options="uniqueStates"
        :city-options="uniqueCities"
        :poc-options="uniquePOCs"
        @apply="handleApplyFilters"
        @clear="handleClearFilters"
        :loading="loading"
      />

      <!-- Data Table -->
      <DataTable
        :columns="locationColumns"
        :data="filteredLocations"
        :loading="loading"
        :pagination="true"
        :items-per-page="10"
      >
        <template #cell-email="{ value }">
          <a v-if="value && value !== 'Add +' && value !== '—'" :href="`mailto:${value}`" class="email-link">
            {{ value }}
          </a>
          <span v-else class="empty-value">{{ value || '—' }}</span>
        </template>
        <template #cell-contactNumber="{ value }">
          <a v-if="value && value !== '—'" :href="`tel:${value}`" class="phone-link">
            {{ value }}
          </a>
          <span v-else class="empty-value">{{ value || '—' }}</span>
        </template>
      </DataTable>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import FilterBar from '@/components/ui/FilterBar.vue'
import DataTable from '@/components/ui/DataTable.vue'
import { fetchPointOfContactReport } from '@/api/pointOfContact'
import { usePointOfContactStore } from '@/stores/pointOfContact'
import { useOrganization } from '@/composables/useOrganization'
import { useFilters } from '@/composables/useFilters'

// Animation state
const isLoaded = ref(false)
const loading = ref(true)

// Filter states using composable
const { filters, clearFilters } = useFilters()

// Applied filter states
const appliedFilters = ref({
  state: '',
  city: '',
  poc: ''
})

// Locations data
const locations = ref([])
const allLocations = ref([])
const initialData = ref([]) // Store initial data for filter options

// Table columns configuration
const locationColumns = [
  { key: 'pocName', label: 'POC Name' },
  { key: 'contactNumber', label: 'Contact Number' },
  { key: 'email', label: 'Email ID' },
  { key: 'name', label: 'My Locations' }
]

const pointOfContactStore = usePointOfContactStore()
const { getOrganizationId, watchOrganizationChange } = useOrganization()

// Watch for organization changes
let unwatchOrganization = null

// Computed properties for unique states and cities from initial data
const uniqueStates = computed(() => {
  const states = initialData.value.map(loc => loc.state).filter(state => state && state.trim() && state !== '—')
  return [...new Set(states)].sort()
})

const uniqueCities = computed(() => {
  const cities = initialData.value.map(loc => loc.city).filter(city => city && city.trim() && city !== '—')
  return [...new Set(cities)].sort()
})

const uniquePOCs = computed(() => {
  const pocs = initialData.value.map(loc => loc.pocName).filter(poc => poc && poc.trim() && poc !== '—')
  return [...new Set(pocs)].sort()
})

// Show locations with frontend filtering (only POC, state/city handled by backend)
const filteredLocations = computed(() => {
  let filtered = locations.value
  
  if (appliedFilters.value.poc) {
    filtered = filtered.filter(location => location.pocName === appliedFilters.value.poc)
  }
  
  return filtered
})

const mapLocationData = (contacts) => {
  return contacts.map((contact, index) => ({
    id: index + 1,
    name: contact.address === '—' ? '' : contact.address,
    pocName: contact.full_name === '— —' ? '' : contact.full_name,
    contactNumber: contact.phone_number === '—' ? '' : contact.phone_number,
    email: contact.email === '—' ? '' : contact.email,
    state: contact.state === '—' ? '' : contact.state,
    city: contact.city === '—' ? '' : contact.city
  }))
}

const handleClearFilters = async () => {
  appliedFilters.value = {
    state: '',
    city: '',
    poc: ''
  }
  
  // Clear existing data immediately
  locations.value = []
  
  await loadInitialData()
}

const handleApplyFilters = async (newFilters) => {
  appliedFilters.value = {
    state: newFilters.state || '',
    city: newFilters.city || '',
    poc: newFilters.poc || ''
  }
  
  // Clear existing data immediately
  locations.value = []
  
  try {
    loading.value = true
    const organizationId = getOrganizationId()
    
    if (!organizationId) return
    
    const payload = {
      organization_id: organizationId
    }
    
    if (appliedFilters.value.state) {
      payload.state = appliedFilters.value.state
    }
    
    if (appliedFilters.value.city) {
      payload.city = appliedFilters.value.city
    }
    
    const response = await fetchPointOfContactReport(payload)
    
    const mappedData = mapLocationData(response.contacts)
    locations.value = mappedData
  } catch (error) {
    console.error('Error applying filters:', error)
    locations.value = []
  } finally {
    loading.value = false
  }
}

const loadInitialData = async () => {
  try {
    loading.value = true
    const organizationId = getOrganizationId()
    
    if (!organizationId) {
      console.warn('No organization selected')
      return
    }
    
    const response = await fetchPointOfContactReport({
      organization_id: organizationId
    })
    
    const mappedData = mapLocationData(response.contacts)
    initialData.value = mappedData // Store for filter options
    allLocations.value = mappedData
    locations.value = mappedData
  } catch (error) {
    console.error('Error loading point of contact data:', error)
    initialData.value = []
    allLocations.value = []
    locations.value = []
  } finally {
    loading.value = false
  }
}

const loadData = () => {
  loadInitialData()
}

// Initialize animations on component mount
onMounted(() => {
  setTimeout(() => {
    isLoaded.value = true
  }, 100)
  
  loadData()
  
  // Watch for organization changes and reload data
  unwatchOrganization = watchOrganizationChange((newOrgId, oldOrgId) => {
    if (newOrgId && newOrgId !== oldOrgId) {
      // Clear existing data first
      locations.value = []
      allLocations.value = []
      initialData.value = []
      appliedFilters.value = {
        state: '',
        city: '',
        poc: ''
      }
      loading.value = true
      loadData()
    }
  })
})

// Cleanup watcher on unmount
onUnmounted(() => {
  if (unwatchOrganization) {
    unwatchOrganization()
  }
})
</script>

<style scoped>
@import './PointOfContactPage.css';
</style>