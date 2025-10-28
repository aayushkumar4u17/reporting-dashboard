<template>
  <div class="point-of-contact-page">
    <div class="poc-container" :class="{ 'fade-in': isLoaded }">
      <!-- Filter Bar -->
      <FilterBar
        :filters="['state', 'city', 'poc']"
        :state-options="uniqueStates"
        :city-options="uniqueCities"
        :poc-options="uniquePOCs"
        @apply="handleApplyFilters"
        @clear="handleClearFilters"
        :loading="loading"
      />

      <!-- Main Content -->
      <div class="poc-content">
        <!-- Data Table Section -->
        <div class="table-section">
          <h2 class="section-title">Point of Contact Details</h2>
          <DataTable :value="loading ? skeletonData : filteredLocations" scrollable scrollHeight="550px" tableStyle="min-width: 50rem" class="fixed-height-table">
            <template #empty>
              <div style="text-align: center; font-weight: bold; padding: 2rem; color: var(--text-primary);">
                No contacts found.
              </div>
            </template>
            <Column field="pocName" header="POC Name">
              <template #body="{ data }">
                <SkeletonLoader v-if="loading" width="100px" height="16px" />
                <span v-else>{{ data.pocName }}</span>
              </template>
            </Column>
            <Column field="contactNumber" header="Contact Number">
              <template #body="{ data }">
                <SkeletonLoader v-if="loading" width="90px" height="16px" />
                <template v-else>
                  <a v-if="data.contactNumber && data.contactNumber !== '—'" :href="`tel:${data.contactNumber}`" class="phone-link">
                    {{ data.contactNumber }}
                  </a>
                  <span v-else class="empty-value">{{ data.contactNumber || '—' }}</span>
                </template>
              </template>
            </Column>
            <Column field="email" header="Email ID">
              <template #body="{ data }">
                <SkeletonLoader v-if="loading" width="120px" height="16px" />
                <template v-else>
                  <a v-if="data.email && data.email !== 'Add +' && data.email !== '—'" :href="`mailto:${data.email}`" class="email-link">
                    {{ data.email }}
                  </a>
                  <span v-else class="empty-value">{{ data.email || '—' }}</span>
                </template>
              </template>
            </Column>
            <Column field="name" header="My Locations">
              <template #body="{ data }">
                <SkeletonLoader v-if="loading" width="150px" height="16px" />
                <span v-else>{{ data.name }}</span>
              </template>
            </Column>
          </DataTable>
        </div>

        <!-- Quick Actions Panel -->
        <div class="quick-actions-section">
          <h2 class="section-title">Quick Actions</h2>
          <div class="actions-grid">
            <button class="action-card" @click="navigateToOrders">
              <div class="action-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
                </svg>
              </div>
              <div class="action-content">
                <div class="action-title">View All Orders</div>
                <div class="action-subtitle">Manage and track orders</div>
              </div>
            </button>
            
            <button class="action-card" @click="navigateToInvoices">
              <div class="action-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10,9 9,9 8,9"/>
                </svg>
              </div>
              <div class="action-content">
                <div class="action-title">Generate Reports</div>
                <div class="action-subtitle">Download invoices & reports</div>
              </div>
            </button>
            
            <button class="action-card" @click="navigateToPayments">
              <div class="action-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                  <line x1="1" y1="10" x2="23" y2="10"/>
                </svg>
              </div>
              <div class="action-content">
                <div class="action-title">Payment Status</div>
                <div class="action-subtitle">Track payment history</div>
              </div>
            </button>
            
            <button class="action-card" @click="navigateToDashboard">
              <div class="action-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="7" height="7"/>
                  <rect x="14" y="3" width="7" height="7"/>
                  <rect x="14" y="14" width="7" height="7"/>
                  <rect x="3" y="14" width="7" height="7"/>
                </svg>
              </div>
              <div class="action-content">
                <div class="action-title">Dashboard</div>
                <div class="action-subtitle">View analytics overview</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import FilterBar from '@/components/ui/FilterBar.vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import SkeletonLoader from '@/components/layout/SkeletonLoader.vue'
import { fetchPointOfContactReport } from '@/api/pointOfContact'
import { usePointOfContactStore } from '@/stores/pointOfContact'
import { useOrganization } from '@/composables/useOrganization'
import { useFilters } from '@/composables/useFilters'
import { useRouter } from 'vue-router'

// Animation state
const isLoaded = ref(false)
const loading = ref(true)

// Filter states using composable
const { filters, clearFilters } = useFilters()
const router = useRouter()

// Navigation functions
const navigateToOrders = () => {
  router.push('/my-orders')
}

const navigateToInvoices = () => {
  router.push('/my-invoices')
}

const navigateToPayments = () => {
  router.push('/payments')
}

const navigateToDashboard = () => {
  router.push('/dashboard')
}

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

// Skeleton data for loading state
const skeletonData = ref(Array(14).fill(null).map((_, index) => ({ id: index })))



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
  
  // Refresh data
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