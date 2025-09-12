<template>
  <div class="dashboard-page">
    <div class="dashboard-container">
      <!-- Error message -->
      <div v-if="error" class="error-container">
        <div class="error-message">
          <p>Unable to load dashboard data. Please try again.</p>
          <AnimatedButton @click="fetchDashboardData" variant="primary" size="small">
            Retry
          </AnimatedButton>
        </div>
      </div>
      
      <!-- Filter Bar -->
      <div v-else class="filter-bar" :class="{ 'animate-slide-down': isLoaded }">
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
            <option value="bangalore">Bangalore</option>
            <option value="mumbai">Mumbai</option>
            <option value="delhi">Delhi</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label class="filter-label">Point of Contact</label>
          <select v-model="selectedPOC" class="filter-select">
            <option value="">Select POC</option>
            <option value="john">John Doe</option>
            <option value="jane">Jane Smith</option>
            <option value="mike">Mike Johnson</option>
          </select>
        </div>
        
        <AnimatedButton @click="clearAllFilters" variant="clear" size="small">
          Clear All Filters
        </AnimatedButton>
      </div>

      <!-- Metrics Cards -->
      <div v-if="!error" class="metrics-container">
        <div class="metrics-grid">
          <!-- Total Orders Placed Card -->
          <div class="metric-card" :class="{ 'animate-fade-in-up': isLoaded }" style="animation-delay: 0.2s;">
            <h3 class="metric-title">Total Orders Placed</h3>
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
            <h3 class="metric-title">Total Orders Delivered</h3>
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
            <h3 class="metric-title">Total Orders Rescheduled</h3>
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
            <h3 class="metric-title">Total Orders Cancelled</h3>
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

          <!-- Total Cost Saved Card -->
          <div class="metric-card cost-saved-card" :class="{ 'animate-fade-in-up': isLoaded }" style="animation-delay: 1.0s;">
            <h3 class="metric-title">Total Cost Saved</h3>
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AnimatedButton from '@/components/common/AnimatedButton.vue'
import { ValidateIndusDashboardUserDocument, PointOfContactDashboardDocument } from '@/sdk'
import client from '@/actions/GraphQLClient'
import { useUserStore } from '@/store/user'
import { checkHasuraUserId } from '@/actions/general'

// Animation state
const isLoaded = ref(false)

// Filter states
const orderedDate = ref('')
const deliveredDate = ref('')
const selectedCity = ref('')
const selectedPOC = ref('')

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
  totalCostSaved: {
    quantity: '0 Litres',
    amount: 'Rs. 0'
  }
})

// Error state
const error = ref(null)
const loading = ref(false)

const userStore = useUserStore()

const clearAllFilters = () => {
  orderedDate.value = ''
  deliveredDate.value = ''
  selectedCity.value = ''
  selectedPOC.value = ''
}

// Fetch dashboard data
const fetchDashboardData = async () => {
  try {
    loading.value = true
    error.value = null
    
    // Get Hasura user ID from JWT claims
    const hasuraUserId = await checkHasuraUserId()
    
    if (!hasuraUserId) {
      throw new Error('User authentication not properly configured. Please try logging in again.')
    }
    
    // First validate the user to ensure they have dashboard access
    const graphqlClient = await client
    const validationResult = await graphqlClient.request(
      ValidateIndusDashboardUserDocument,
      { user_id: hasuraUserId },
      hasuraUserId // Pass hasuraUserId for session variables
    )
    
    // Check if user has valid dashboard access
    if (!validationResult.organization_user || validationResult.organization_user.length === 0) {
      throw new Error('User does not have dashboard access')
    }
    
    // Try to fetch dashboard data, fallback to zeros on error
    try {
      const dashboardResult = await graphqlClient.request(
        PointOfContactDashboardDocument,
        { object: { user_id: hasuraUserId } },
        hasuraUserId
      )
      
      const data = dashboardResult.pointOfContactDashboard?.data
      if (data) {
        dashboardData.value = {
          ...dashboardData.value,
          totalOrdersPlaced: {
            count: data.order_count || 0,
            quantity: data.ordered_qty || 0
          },
          totalOrdersDelivered: {
            count: data.delivered_orders || 0,
            quantity: data.delivered_qty || 0
          },
          totalOrdersRescheduled: {
            count: data.rescheduled_count || 0,
            quantity: data.rescheduled_qty || 0
          },
          totalOrdersCancelled: {
            count: data.cancelled_count || 0,
            quantity: data.cancelled_qty || 0
          },
          totalCostSaved: {
            quantity: `${data.planned_qty || 0} Litres`,
            amount: 'Rs. 0'
          }
        }
      } else {
        // Set zero values if no data
        dashboardData.value = {
          ...dashboardData.value,
          totalOrdersPlaced: { count: 0, quantity: 0 },
          totalOrdersDelivered: { count: 0, quantity: 0 },
          totalOrdersRescheduled: { count: 0, quantity: 0 },
          totalOrdersCancelled: { count: 0, quantity: 0 },
          totalCostSaved: { quantity: '0 Litres', amount: 'Rs. 0' }
        }
      }
    } catch (dashboardError) {
      // On any error, set zero values and don't throw
      console.warn('Dashboard data fetch failed, showing zeros:', dashboardError)
      dashboardData.value = {
        ...dashboardData.value,
        totalOrdersPlaced: { count: 0, quantity: 0 },
        totalOrdersDelivered: { count: 0, quantity: 0 },
        totalOrdersRescheduled: { count: 0, quantity: 0 },
        totalOrdersCancelled: { count: 0, quantity: 0 },
        totalCostSaved: { quantity: '0 Litres', amount: 'Rs. 0' }
      }
    }
    

  } catch (err) {
    console.error('Error fetching dashboard data:', err)
    error.value = err.message || 'Failed to fetch dashboard data'
  } finally {
    loading.value = false
  }
}

// Initialize animations and fetch data on component mount
onMounted(() => {
  setTimeout(() => {
    isLoaded.value = true
  }, 1000)
  
  // Fetch dashboard data when component mounts
  fetchDashboardData()
})
</script>

<style scoped>
  /* All CSS has been moved to DashboardPage.css */
  @import './DashboardPage.css';
</style>