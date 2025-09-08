<template>
  <div class="dashboard-page">
    <div class="dashboard-container">
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
      <div class="metrics-container">
        <div class="metrics-grid">
          <div class="metric-card" :class="{ 'animate-fade-in-up': isLoaded }" style="animation-delay: 0.2s;">
            <h3 class="metric-title">Total Orders Placed</h3>
            <div class="metric-content">
              <div class="metric-item">
                <span class="metric-label">Count</span>
                <span class="metric-value">{{ dashboardData.totalOrdersPlaced.count }}</span>
              </div>
              <div class="metric-item">
                <span class="metric-label">Quantity</span>
                <span class="metric-value">{{ dashboardData.totalOrdersPlaced.quantity }}</span>
              </div>
            </div>
          </div>

          <div class="metric-card" :class="{ 'animate-fade-in-up': isLoaded }" style="animation-delay: 0.4s;">
            <h3 class="metric-title">Total Orders Delivered</h3>
            <div class="metric-content">
              <div class="metric-item">
                <span class="metric-label">Count</span>
                <span class="metric-value">{{ dashboardData.totalOrdersDelivered.count }}</span>
              </div>
              <div class="metric-item">
                <span class="metric-label">Quantity</span>
                <span class="metric-value">{{ dashboardData.totalOrdersDelivered.quantity }}</span>
              </div>
            </div>
          </div>

          <div class="metric-card" :class="{ 'animate-fade-in-up': isLoaded }" style="animation-delay: 0.6s;">
            <h3 class="metric-title">Total Orders Rescheduled</h3>
            <div class="metric-content">
              <div class="metric-item">
                <span class="metric-label">Count</span>
                <span class="metric-value">{{ dashboardData.totalOrdersRescheduled.count }}</span>
              </div>
              <div class="metric-item">
                <span class="metric-label">Quantity</span>
                <span class="metric-value">{{ dashboardData.totalOrdersRescheduled.quantity }}</span>
              </div>
            </div>
          </div>

          <div class="metric-card" :class="{ 'animate-fade-in-up': isLoaded }" style="animation-delay: 0.8s;">
            <h3 class="metric-title">Total Orders Cancelled</h3>
            <div class="metric-content">
              <div class="metric-item">
                <span class="metric-label">Count</span>
                <span class="metric-value">{{ dashboardData.totalOrdersCancelled.count }}</span>
              </div>
              <div class="metric-item">
                <span class="metric-label">Quantity</span>
                <span class="metric-value">{{ dashboardData.totalOrdersCancelled.quantity }}</span>
              </div>
            </div>
          </div>

          <div class="metric-card cost-saved-card" :class="{ 'animate-fade-in-up': isLoaded }" style="animation-delay: 1.0s;">
            <h3 class="metric-title">Total Cost Saved</h3>
            <div class="metric-content">
              <div class="metric-item">
                <span class="metric-label">Quantity</span>
                <span class="metric-value">{{ dashboardData.totalCostSaved.quantity }}</span>
              </div>
              <div class="metric-item">
                <span class="metric-label">Amount</span>
                <span class="metric-value">{{ dashboardData.totalCostSaved.amount }}</span>
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

// Animation state
const isLoaded = ref(false)

// Filter states
const orderedDate = ref('')
const deliveredDate = ref('')
const selectedCity = ref('')
const selectedPOC = ref('')

// Mock data for dashboard metrics
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

const clearAllFilters = () => {
  orderedDate.value = ''
  deliveredDate.value = ''
  selectedCity.value = ''
  selectedPOC.value = ''
}

// Initialize animations on component mount
onMounted(() => {
  setTimeout(() => {
    isLoaded.value = true
  }, 100)
})
</script>

<style scoped>
  /* All CSS has been moved to DashboardPage.css */
  @import './DashboardPage.css';
</style>