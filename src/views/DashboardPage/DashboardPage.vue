<template>
  <div class="dashboard-page">
    <div class="dashboard-container" :class="{ 'fade-in': isLoaded }">
      <!-- Filter Bar -->
      <FilterBar
        :filters="['dateRanges', 'city', 'poc']"
        v-model="filterValues"
        :city-options="cityOptions"
        :poc-options="pocOptions"
        @apply="handleApplyFilters"
        @clear="handleClearFilters"
        :loading="loading"
      />

      <!-- Order Analytics Section -->
      <div class="analytics-section">
        <h2 class="section-title">Order Analytics</h2>
        <div class="analytics-grid">
          <!-- Enhanced Metric Cards -->
          <MetricCard
            title="Orders Placed"
            variant="placed"
            :items="[
              { label: 'Total Count', value: dashboardData.totalOrdersPlaced.count },
              { label: 'Volume (L)', value: formatNumber(dashboardData.totalOrdersPlaced.quantity) }
            ]"
            :loading="loading"
            :animation-delay="0.2"

          >
            <template #icon>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
              </svg>
            </template>
          </MetricCard>

          <MetricCard
            title="Orders Delivered"
            variant="delivered"
            :items="[
              { label: 'Total Count', value: dashboardData.totalOrdersDelivered.count },
              { label: 'Volume (L)', value: formatNumber(dashboardData.totalOrdersDelivered.quantity) }
            ]"
            :loading="loading"
            :animation-delay="0.4"

          >
            <template #icon>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 3h15l-1 13H3z"/>
                <path d="M16 8h4l3 5v4a2 2 0 0 1-2 2h-2"/>
                <circle cx="7" cy="20" r="2"/>
                <circle cx="17" cy="20" r="2"/>
              </svg>
            </template>
          </MetricCard>

          <MetricCard
            title="Orders Rescheduled"
            variant="rescheduled"
            :items="[
              { label: 'Total Count', value: dashboardData.totalOrdersRescheduled.count },
              { label: 'Volume (L)', value: formatNumber(dashboardData.totalOrdersRescheduled.quantity) }
            ]"
            :loading="loading"
            :animation-delay="0.6"

          >
            <template #icon>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="23,4 23,10 17,10"/>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
              </svg>
            </template>
          </MetricCard>

          <MetricCard
            title="Orders Cancelled"
            variant="cancelled"
            :items="[
              { label: 'Total Count', value: dashboardData.totalOrdersCancelled.count },
              { label: 'Volume (L)', value: formatNumber(dashboardData.totalOrdersCancelled.quantity) }
            ]"
            :loading="loading"
            :animation-delay="0.8"

          >
            <template #icon>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
            </template>
          </MetricCard>

          <MetricCard
            title="Planned Orders"
            variant="planned"
            :items="[
              { label: 'Total Count', value: dashboardData.totalPlannedOrders.count },
              { label: 'Volume (L)', value: formatNumber(dashboardData.totalPlannedOrders.quantity) }
            ]"
            :loading="loading"
            :animation-delay="1.0"

          >
            <template #icon>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </template>
          </MetricCard>

          <MetricCard
            title="Cost Optimization"
            variant="cost-saved"
            :items="[
              { label: 'Saved Volume (L)', value: formatNumber(dashboardData.totalCostSaved.quantity) },
              { label: 'Amount Saved', value: `₹${formatCurrency(dashboardData.totalCostSaved.amount)}` }
            ]"
            :loading="loading"
            :animation-delay="1.2"

          >
            <template #icon>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </template>
          </MetricCard>
        </div>
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
          
          <button class="action-card" @click="refreshDashboard">
            <div class="action-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="23,4 23,10 17,10"/>
                <polyline points="1,20 1,14 7,14"/>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10M3.51 9a9 9 0 0 1 2.13-9.36L1 14"/>
              </svg>
            </div>
            <div class="action-content">
              <div class="action-title">Refresh Data</div>
              <div class="action-subtitle">Update dashboard metrics</div>
            </div>
          </button>
        </div>
      </div>
    </div>
    
    <!-- Error Popup -->
    <ErrorPopup 
      :show="showErrorPopup" 
      :title="errorTitle"
      :message="errorMessage" 
      :showRetry="true"
      buttonText="Close"
      @close="hideError" 
      @retry="retryDashboardData" 
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import FilterBar from '@/components/ui/FilterBar.vue'
import MetricCard from '@/components/ui/MetricCard.vue'
import ErrorPopup from '@/components/layout/ErrorPopup.vue'
import { usePointOfContactStore } from '@/stores/pointOfContact'
import { useOrganization } from '@/composables/useOrganization'
import { fetchPointOfContactDashboard } from '@/api/pointOfContactDashboard'
import { useFilters } from '@/composables/useFilters'
import { usePOCFilters } from '@/composables/usePOCFilters'

const router = useRouter()

// Animation state
const isLoaded = ref(false)

// Get current date in YYYY-MM-DD format
const getCurrentDate = () => {
  const today = new Date()
  return today.toISOString().split('T')[0]
}

// Format last updated time
const lastUpdated = ref('')
const updateLastUpdatedTime = () => {
  const now = new Date()
  lastUpdated.value = now.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour12: true,
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: 'short'
  })
}

const formatNumber = (num: number | string): string => {
  const numValue = typeof num === 'string' ? parseFloat(num) || 0 : num
  if (numValue >= 10000000) return (numValue / 10000000).toFixed(1) + 'Cr'
  if (numValue >= 100000) return (numValue / 100000).toFixed(1) + 'L'
  if (numValue >= 1000) return (numValue / 1000).toFixed(1) + 'K'
  return numValue?.toString() || '0'
}

const formatCurrency = (amount: number | string): string => {
  const num = parseInt(String(amount)) || 0
  return new Intl.NumberFormat('en-IN').format(num)
}

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

const refreshDashboard = () => {
  fetchDashboardData()
}

// Filter states using composable
const { filters, clearFilters, buildFilterPayload } = useFilters()
const { cityOptions, pocOptions, loadPOCFilterData, clearPOCData } = usePOCFilters()
const filterValues = ref({
  deliveryDateFrom: '',
  deliveryDateTo: '',
  orderDateFrom: '',
  orderDateTo: '',
  city: '',
  poc: ''
})

// Dashboard data
const dashboardData = ref({
  totalOrdersPlaced: {
    count: 0,
    quantity: 0
  },
  totalOrdersDelivered: {
    count: 0,
    quantity: 0
  },
  totalOrdersRescheduled: {
    count: 0,
    quantity: 0
  },
  totalOrdersCancelled: {
    count: 0,
    quantity: 0
  },
  totalPlannedOrders: {
    count: 0,
    quantity: 0
  },
  totalCostSaved: {
    quantity: '0',
    amount: '0'
  }
})

// Error state
const error = ref<string | null>(null)
const loading = ref(false)
const showErrorPopup = ref(false)
const errorTitle = ref('Error')
const errorMessage = ref('')

const pointOfContactStore = usePointOfContactStore()
const { getOrganizationId, watchOrganizationChange } = useOrganization()

// Watch for organization changes
let unwatchOrganization: (() => void) | null = null

const handleApplyFilters = (appliedFilters: any) => {
  if (appliedFilters.orderDateFrom) {
    filters.value.orderedDateFrom = appliedFilters.orderDateFrom
    filters.value.orderedDateTo = appliedFilters.orderDateTo || appliedFilters.orderDateFrom
    filters.value.deliveredDateFrom = ''
    filters.value.deliveredDateTo = ''
  } else if (appliedFilters.deliveryDateFrom) {
    filters.value.deliveredDateFrom = appliedFilters.deliveryDateFrom
    filters.value.deliveredDateTo = appliedFilters.deliveryDateTo || appliedFilters.deliveryDateFrom
    filters.value.orderedDateFrom = ''
    filters.value.orderedDateTo = ''
  }
  filters.value.selectedCity = appliedFilters.city
  filters.value.selectedPOC = appliedFilters.poc
  fetchDashboardData()
}

const handleClearFilters = () => {
  filterValues.value = {
    deliveryDateFrom: '',
    deliveryDateTo: '',
    orderDateFrom: '',
    orderDateTo: '',
    city: '',
    poc: ''
  }
  clearFilters()
  fetchDashboardData()
}

const hideError = () => {
  showErrorPopup.value = false
  error.value = null
}

const retryDashboardData = () => {
  hideError()
  fetchDashboardData()
}

const showError = (title: string, message: string) => {
  errorTitle.value = title
  errorMessage.value = message
  showErrorPopup.value = true
}

// Fetch dashboard data using point of contact API
const fetchDashboardData = async () => {
  try {
    loading.value = true
    error.value = null
    
    // Get organization ID
    const organizationId = getOrganizationId()
    
    if (!organizationId) {
      throw new Error('No organization selected. Please go back and select an organization.')
    }
    
    // Use current filter values or defaults
    const currentDate = getCurrentDate()
    
    // Create a temporary filter object with defaults without mutating reactive state
    const tempFilters = { ...filters.value }
    if (!tempFilters.orderedDateFrom && !tempFilters.deliveredDateFrom) {
      tempFilters.orderedDateFrom = currentDate
      tempFilters.orderedDateTo = currentDate
    }
    
    // Build filter payload using temp filters
    const filterPayload = {
      org_user_id: [organizationId],
      ...(tempFilters.orderedDateFrom && { order_date_from: tempFilters.orderedDateFrom }),
      ...(tempFilters.orderedDateTo && { order_date_to: tempFilters.orderedDateTo }),
      ...(tempFilters.deliveredDateFrom && { delivery_date_from: tempFilters.deliveredDateFrom }),
      ...(tempFilters.deliveredDateTo && { delivery_date_to: tempFilters.deliveredDateTo }),
      ...(tempFilters.selectedCity && { cities: [tempFilters.selectedCity], city: tempFilters.selectedCity }),
      ...(tempFilters.selectedPOC && { point_of_contact: tempFilters.selectedPOC })
    }
    
    const data = await fetchPointOfContactDashboard(organizationId, filterPayload)
    
    if (data) {
      // Map the GraphQL response to our dashboard data structure
      dashboardData.value = {
        totalOrdersPlaced: {
          count: data.order_count || 0,
          quantity: data.ordered_qty ? Number(data.ordered_qty) : 0
        },
        totalOrdersDelivered: {
          count: data.delivered_orders || 0,
          quantity: data.delivered_qty ? Number(data.delivered_qty) : 0
        },
        totalOrdersRescheduled: {
          count: data.rescheduled_count || 0,
          quantity: data.rescheduled_qty ? Number(data.rescheduled_qty) : 0
        },
        totalOrdersCancelled: {
          count: data.cancelled_count || 0,
          quantity: data.cancelled_qty ? Number(data.cancelled_qty) : 0
        },
        totalPlannedOrders: {
          count: data.planned_orders || 0,
          quantity: data.planned_qty ? Number(data.planned_qty) : 0
        },
        totalCostSaved: {
          quantity: String(data.planned_qty ?? 0),
          amount: String((data.planned_orders ?? 0) * 100)
        }
      }
      
      pointOfContactStore.setDashboardData(data)
    } else {
      throw new Error('No data received from the server')
    }
    
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err)
    
    showError('Error', err instanceof Error ? err.message : 'Unable to load dashboard data. Please try again.')
    
    dashboardData.value = {
      totalOrdersPlaced: { count: 0, quantity: 0 },
      totalOrdersDelivered: { count: 0, quantity: 0 },
      totalOrdersRescheduled: { count: 0, quantity: 0 },
      totalOrdersCancelled: { count: 0, quantity: 0 },
      totalPlannedOrders: { count: 0, quantity: 0 },
      totalCostSaved: { quantity: '0', amount: '0' }
    }
  } finally {
    loading.value = false
    pointOfContactStore.setLoading(false)
  }
}

onMounted(() => {
  // Check if coming from select-user page
  const fromSelectUser = router.options.history.state.back === '/select-user'
  
  setTimeout(() => {
    isLoaded.value = true
  }, fromSelectUser ? 500 : 100)
  
  // Initialize with empty filters
  filterValues.value = {
    deliveryDateFrom: '',
    deliveryDateTo: '',
    orderDateFrom: '',
    orderDateTo: '',
    city: '',
    poc: ''
  }
  
  // Update last updated time
  updateLastUpdatedTime()
  
  fetchDashboardData()
  
  // Load POC filter data
  loadPOCFilterData()
  
  // Watch for organization changes and reload data
  unwatchOrganization = watchOrganizationChange((newOrgId, oldOrgId) => {
    if (newOrgId && oldOrgId && newOrgId !== oldOrgId) {
      console.log('Organization changed, reloading dashboard data')
      clearPOCData()
      loadPOCFilterData()
      fetchDashboardData()
    }
  })
  
  // Auto-refresh every 5 minutes
  const refreshInterval = setInterval(() => {
    updateLastUpdatedTime()
    fetchDashboardData()
  }, 300000)
  
  // Cleanup interval on unmount
  onUnmounted(() => {
    clearInterval(refreshInterval)
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
  /* All CSS has been moved to DashboardPage.css */
  @import './DashboardPage.css';
</style>