<template>
  <div class="dashboard-page">
    <div class="dashboard-container" :class="{ 'fade-in': isLoaded }">
      <!-- Filter Bar -->
      <div class="filter-bar" :class="{ 'animate-slide-down': isLoaded }">
        <div class="filter-group">
          <label class="filter-label">Ordered Date</label>
          <select v-model="orderedDate" class="filter-select">
            <option value="">Select Date</option>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="last-week">Last Week</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label class="filter-label">Delivered Date</label>
          <select v-model="deliveredDate" class="filter-select">
            <option value="">Select Date</option>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="last-week">Last Week</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label class="filter-label">City</label>
          <select v-model="selectedCity" class="filter-select">
            <option value="">Select City</option>
          </select>
        </div>
        
        <div class="filter-actions">
          <AnimatedButton @click="applyFilters" variant="primary" size="small">
            Apply Filter
          </AnimatedButton>
          <AnimatedButton @click="clearAllFilters" variant="clear" size="small">
            Clear All Filters
          </AnimatedButton>
        </div>
      </div>

      <!-- Metrics Cards -->
      <div class="metrics-container">
        <div class="metrics-grid">
          <!-- Total Orders Placed Card -->
          <div class="metric-card" :class="{ 'animate-fade-in-up': isLoaded }" style="animation-delay: 0.2s;">
            <div class="metric-header">
              <div class="metric-icon orders-placed">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
                </svg>
              </div>
              <h3 class="metric-title">Total Orders Placed</h3>
            </div>
            <div class="metric-content">
              <div class="metric-item">
                <span class="metric-label">Count</span>
                <span v-if="!loading" class="metric-value">{{ dashboardData.totalOrdersPlaced.count }}</span>
                <SkeletonLoader v-else height="1.5rem" width="3rem" />
              </div>
              <div class="metric-item">
                <span class="metric-label">Quantity</span>
                <span v-if="!loading" class="metric-value">{{ dashboardData.totalOrdersPlaced.quantity }}</span>
                <SkeletonLoader v-else height="1.5rem" width="3rem" />
              </div>
            </div>
          </div>

          <!-- Total Orders Delivered Card -->
          <div class="metric-card" :class="{ 'animate-fade-in-up': isLoaded }" style="animation-delay: 0.4s;">
            <div class="metric-header">
              <div class="metric-icon orders-delivered">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20,6 9,17 4,12"/>
                </svg>
              </div>
              <h3 class="metric-title">Total Orders Delivered</h3>
            </div>
            <div class="metric-content">
              <div class="metric-item">
                <span class="metric-label">Count</span>
                <span v-if="!loading" class="metric-value">{{ dashboardData.totalOrdersDelivered.count }}</span>
                <SkeletonLoader v-else height="1.5rem" width="3rem" />
              </div>
              <div class="metric-item">
                <span class="metric-label">Quantity</span>
                <span v-if="!loading" class="metric-value">{{ dashboardData.totalOrdersDelivered.quantity }}</span>
                <SkeletonLoader v-else height="1.5rem" width="3rem" />
              </div>
            </div>
          </div>

          <!-- Total Orders Rescheduled Card -->
          <div class="metric-card" :class="{ 'animate-fade-in-up': isLoaded }" style="animation-delay: 0.6s;">
            <div class="metric-header">
              <div class="metric-icon orders-rescheduled">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="23,4 23,10 17,10"/>
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                </svg>
              </div>
              <h3 class="metric-title">Total Orders Rescheduled</h3>
            </div>
            <div class="metric-content">
              <div class="metric-item">
                <span class="metric-label">Count</span>
                <span v-if="!loading" class="metric-value">{{ dashboardData.totalOrdersRescheduled.count }}</span>
                <SkeletonLoader v-else height="1.5rem" width="3rem" />
              </div>
              <div class="metric-item">
                <span class="metric-label">Quantity</span>
                <span v-if="!loading" class="metric-value">{{ dashboardData.totalOrdersRescheduled.quantity }}</span>
                <SkeletonLoader v-else height="1.5rem" width="3rem" />
              </div>
            </div>
          </div>

          <!-- Total Orders Cancelled Card -->
          <div class="metric-card" :class="{ 'animate-fade-in-up': isLoaded }" style="animation-delay: 0.8s;">
            <div class="metric-header">
              <div class="metric-icon orders-cancelled">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </div>
              <h3 class="metric-title">Total Orders Cancelled</h3>
            </div>
            <div class="metric-content">
              <div class="metric-item">
                <span class="metric-label">Count</span>
                <span v-if="!loading" class="metric-value">{{ dashboardData.totalOrdersCancelled.count }}</span>
                <SkeletonLoader v-else height="1.5rem" width="3rem" />
              </div>
              <div class="metric-item">
                <span class="metric-label">Quantity</span>
                <span v-if="!loading" class="metric-value">{{ dashboardData.totalOrdersCancelled.quantity }}</span>
                <SkeletonLoader v-else height="1.5rem" width="3rem" />
              </div>
            </div>
          </div>

          <!-- Total Planned Orders Card -->
          <div class="metric-card" :class="{ 'animate-fade-in-up': isLoaded }" style="animation-delay: 1.0s;">
            <div class="metric-header">
              <div class="metric-icon orders-planned">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <h3 class="metric-title">Total Planned Orders</h3>
            </div>
            <div class="metric-content">
              <div class="metric-item">
                <span class="metric-label">Count</span>
                <span v-if="!loading" class="metric-value">{{ dashboardData.totalPlannedOrders.count }}</span>
                <SkeletonLoader v-else height="1.5rem" width="3rem" />
              </div>
              <div class="metric-item">
                <span class="metric-label">Quantity</span>
                <span v-if="!loading" class="metric-value">{{ dashboardData.totalPlannedOrders.quantity }}</span>
                <SkeletonLoader v-else height="1.5rem" width="3rem" />
              </div>
            </div>
          </div>

          <!-- Total Cost Saved Card -->
          <div class="metric-card cost-saved-card" :class="{ 'animate-fade-in-up': isLoaded }" style="animation-delay: 1.2s;">
            <div class="metric-header">
              <div class="metric-icon cost-saved">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="12" y1="1" x2="12" y2="23"/>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
              <h3 class="metric-title">Total Cost Saved</h3>
            </div>
            <div class="metric-content">
              <div class="metric-item">
                <span class="metric-label">Quantity</span>
                <span v-if="!loading" class="metric-value">{{ dashboardData.totalCostSaved.quantity }}</span>
                <SkeletonLoader v-else height="1.5rem" width="5rem" />
              </div>
              <div class="metric-item">
                <span class="metric-label">Amount</span>
                <span v-if="!loading" class="metric-value">{{ dashboardData.totalCostSaved.amount }}</span>
                <SkeletonLoader v-else height="1.5rem" width="5rem" />
              </div>
            </div>
          </div>
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
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import AnimatedButton from '@/components/layout/AnimatedButton.vue'
import SkeletonLoader from '@/components/layout/SkeletonLoader.vue'
import ErrorPopup from '@/components/layout/ErrorPopup.vue'
import { usePointOfContactStore } from '@/stores/pointOfContact'
import { fetchPointOfContactDashboard } from '@/api/pointOfContactDashboard'
import { useFilters } from '@/composables/useFilters'

const router = useRouter()

// Animation state
const isLoaded = ref(false)

// Filter states using composable
const { filters, clearFilters, buildFilterPayload } = useFilters()
const orderedDate = ref('')
const deliveredDate = ref('')
const selectedCity = ref('')

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
    quantity: '0 Litres',
    amount: 'Rs. 0'
  }
})

// Error state
const error = ref<string | null>(null)
const loading = ref(false)
const showErrorPopup = ref(false)
const errorTitle = ref('Error')
const errorMessage = ref('')

const pointOfContactStore = usePointOfContactStore()

const applyFilters = () => {
  // Update filters object with current values
  filters.value.orderedDate = orderedDate.value
  filters.value.deliveredDate = deliveredDate.value
  filters.value.selectedCity = selectedCity.value
  // Apply current filter values and fetch data
  fetchDashboardData()
}

const clearAllFilters = () => {
  orderedDate.value = ''
  deliveredDate.value = ''
  selectedCity.value = ''
  clearFilters()
  // Refetch data after clearing filters
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
    
    // Get selected organization user ID from store
    let organizationUserId = pointOfContactStore.selectedUserId
    
    // If store is empty, try to refresh from localStorage
    if (!organizationUserId) {
      pointOfContactStore.refreshFromStorage()
      organizationUserId = pointOfContactStore.selectedUserId
    }
    
    if (!organizationUserId) {
      throw new Error('No organization selected. Please go back and select an organization.')
    }
    
    // Build filter payload
    const filterPayload = buildFilterPayload(organizationUserId)
    
    const data = await fetchPointOfContactDashboard(organizationUserId, filterPayload)
    
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
          quantity: `${data.planned_qty ?? 0} Litres`,
          amount: `Rs. ${((data.planned_orders ?? 0) * 100).toString()}`
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
      totalCostSaved: { quantity: '0 Litres', amount: 'Rs. 0' }
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
  
  fetchDashboardData()
})

watch([orderedDate, deliveredDate, selectedCity], () => {
  if (isLoaded.value) {
    fetchDashboardData()
  }
}, { deep: true })
</script>

<style scoped>
  /* All CSS has been moved to DashboardPage.css */
  @import './DashboardPage.css';
</style>