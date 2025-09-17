<template>
  <div class="payments-page">
    <!-- Debug: Simple test content -->
    <!-- <div style="background: red; color: white; padding: 20px; margin: 20px; font-size: 24px; z-index: 9999; position: relative;">
      🔥 PAYMENTS PAGE IS LOADING! 🔥
    </div> -->
    
    <div class="payments-container">
      <!-- Filter Section -->
    <div class="filter-section" :class="{ 'animate-slide-down': isLoaded }">
      <div class="filter-row">
        <div class="filter-group">
          <label>Ordered Date</label>
          <select v-model="orderedDate" class="filter-select">
            <option value="">Select Date</option>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="last-week">Last 7 days</option>
            <option value="last-month">Last 30 days</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>Delivered Date</label>
          <select v-model="deliveredDate" class="filter-select">
            <option value="">Select Date</option>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="last-week">Last 7 days</option>
            <option value="last-month">Last 30 days</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>City</label>
          <select v-model="selectedCity" class="filter-select">
            <option value="">Select City</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>Point of Contact</label>
          <select v-model="selectedPOC" class="filter-select">
            <option value="">Select POC</option>
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
        
        <!-- Download Section -->
        <div class="download-section">
          <!-- <button class="download-btn excel">
            <span>Download Invoice</span>
            <div class="download-options">
              <span>Excel</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7,10 12,15 17,10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
            </div>
          </button> -->
          
          <AnimatedButton variant="danger" size="small">
            <span>PDF</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7,10 12,15 17,10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          </AnimatedButton>
        </div>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="summary-section" :class="{ 'animate-fade-in-up': isLoaded }">
      <div class="summary-cards">
        <div class="summary-card">
          <div class="card-header">Credit Limit</div>
          <div v-if="!summaryLoading" class="card-value green">{{ summaryData.creditLimit }}</div>
          <SkeletonLoader v-else width="60%" height="24px" />
        </div>
        
        <div class="summary-card">
          <div class="card-header">Available Balance</div>
          <div v-if="!summaryLoading" class="card-value green">{{ summaryData.availableBalance }}</div>
          <SkeletonLoader v-else width="60%" height="24px" />
        </div>
        
        <div class="summary-card">
          <div class="card-header">Total Outstanding</div>
          <div v-if="!summaryLoading" class="card-value green">{{ summaryData.totalOutstanding }}</div>
          <SkeletonLoader v-else width="60%" height="24px" />
        </div>
        
        <div class="summary-card">
          <div class="card-header">Total Overdue</div>
          <div v-if="!summaryLoading" class="card-value red">{{ summaryData.totalOverdue }}</div>
          <SkeletonLoader v-else width="60%" height="24px" />
        </div>
        
        <div class="action-buttons">
          <div class="summary-card action-card">
            <AnimatedButton variant="success" size="small" style="width: 100%;">
              Pay Outstanding
            </AnimatedButton>
          </div>
          
          <div class="summary-card action-card">
            <AnimatedButton variant="warning" size="small" style="width: 100%;">
              Pay Overdue
            </AnimatedButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Table Section -->
    <div class="table-container" :class="{ 'animate-fade-in-up': isLoaded }">
      <table class="payments-table">
        <thead>
          <tr>
            <th class="checkbox-column">
              <input type="checkbox" v-model="selectAll" @change="toggleAllSelection">
            </th>
            <th>Asp Order Code</th>
            <th>Sales Invoice Number</th>
            <th>Order Date</th>
            <th>Delivery Date</th>
            <th>Payment Due Date</th>
            <th>Order Quantity</th>
            <th>Delivery Quantity</th>
            <th>Amount</th>
            <th>Delivery Location</th>
            <th>POC Name</th>
            <th>POC Contact</th>
            <th>Invoice Status</th>
          </tr>
        </thead>
        <tbody>
          <!-- Skeleton loading rows -->
          <tr v-if="loading" v-for="i in 5" :key="i" class="skeleton-row">
            <td>
              <SkeletonLoader width="16px" height="16px" />
            </td>
            <td><SkeletonLoader width="80%" height="16px" /></td>
            <td><SkeletonLoader width="80%" height="16px" /></td>
            <td><SkeletonLoader width="80%" height="16px" /></td>
            <td><SkeletonLoader width="80%" height="16px" /></td>
            <td><SkeletonLoader width="80%" height="16px" /></td>
            <td><SkeletonLoader width="80%" height="16px" /></td>
            <td><SkeletonLoader width="80%" height="16px" /></td>
            <td><SkeletonLoader width="80%" height="16px" /></td>
            <td><SkeletonLoader width="80%" height="16px" /></td>
            <td><SkeletonLoader width="80%" height="16px" /></td>
            <td><SkeletonLoader width="80%" height="16px" /></td>
            <td>
              <SkeletonLoader width="80%" height="24px" />
            </td>
          </tr>
          
          <!-- Actual data rows -->
          <tr v-for="payment in payments" :key="payment.id" :class="{ 'selected': payment.selected }">
            <td class="checkbox-column">
              <input type="checkbox" v-model="payment.selected">
            </td>
            <td>{{ payment.aspOrderCode }}</td>
            <td>{{ payment.salesInvoiceNumber }}</td>
            <td>{{ payment.orderedDate }}</td>
            <td>{{ payment.deliveredDate }}</td>
            <td>{{ payment.paymentDueDate }}</td>
            <td>{{ payment.orderedQuantity }}</td>
            <td>{{ payment.deliveredQuantity }}</td>
            <td>{{ formatCurrency(payment.amount) }}</td>
            <td>{{ payment.deliveryLocation }}</td>
            <td>{{ payment.pocName }}</td>
            <td>{{ payment.pocContact }}</td>
            <td>
              <span :class="['status-badge', getStatusClass(payment.invoiceStatus)]">
                {{ payment.invoiceStatus }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AnimatedButton from '@/components/layout/AnimatedButton.vue'
import { useFilters } from '@/composables/useFilters'

// Animation state
const isLoaded = ref(false)
const loading = ref(true)
const summaryLoading = ref(true)

// Filter states using composable
const { filters, clearFilters, buildFilterPayload } = useFilters()
const orderedDate = ref('')
const deliveredDate = ref('')
const selectedCity = ref('')
const selectedPOC = ref('')
const paymentDueDate = ref('')

// Reactive data
const selectAll = ref(false)
const payments = ref([])

// Summary data with initial values set to 0
const summaryData = ref({
  creditLimit: '₹ 0',
  availableBalance: '₹ 0',
  totalOutstanding: '₹ 0',
  totalOverdue: '₹ 0'
})

const loadData = () => {
  // TODO: Implement API call to fetch payments data
  loading.value = false
  summaryLoading.value = false
}

// Methods
const applyFilters = () => {
  // Update filters object with current values
  filters.value.orderedDate = orderedDate.value
  filters.value.deliveredDate = deliveredDate.value
  filters.value.selectedCity = selectedCity.value
  filters.value.selectedPOC = selectedPOC.value
  filters.value.paymentDueDate = paymentDueDate.value
  // Apply current filter values
  loadData()
}

const clearAllFilters = () => {
  orderedDate.value = ''
  deliveredDate.value = ''
  selectedCity.value = ''
  selectedPOC.value = ''
  paymentDueDate.value = ''
  clearFilters()
  // Clear all filter values and reload data
  loadData()
}

const toggleAllSelection = () => {
  payments.value.forEach(payment => {
    payment.selected = selectAll.value
  })
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0
  }).format(amount)
}

const getStatusClass = (status) => {
  switch (status.toLowerCase()) {
    case 'paid':
      return 'status-paid'
    case 'unpaid':
      return 'status-unpaid'
    case 'overdue':
      return 'status-overdue'
    default:
      return 'status-default'
  }
}

// Initialize animations on component mount
onMounted(() => {
  setTimeout(() => {
    isLoaded.value = true
  }, 100)
  
  // Simulate data loading
  loadData()
})
</script>

<style scoped>
  /* All CSS has been moved to PaymentsPage.css */
  @import './PaymentsPage.css';
</style>