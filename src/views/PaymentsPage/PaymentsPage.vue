<template>
  <div class="payments-page">

    
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
          <AnimatedButton @click="downloadPayments" variant="danger" size="small">
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
            <th>Customer ID</th>
            <th>Customer Name</th>
            <th>Credit Limit</th>
            <th>Outstanding Amount</th>
            <th>Overdue Amount</th>
            <th>Payment Terms</th>
            <th>Phone Number</th>
            <th>Credit Breach</th>
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
            <td>{{ payment.customerId }}</td>
            <td>{{ payment.customerName }}</td>
            <td>{{ formatCurrency(payment.creditLimit) }}</td>
            <td>{{ formatCurrency(payment.outstandingAmount) }}</td>
            <td>{{ formatCurrency(payment.overdueAmount) }}</td>
            <td>{{ payment.paymentTerms }} days</td>
            <td>{{ payment.phoneNumber }}</td>
            <td>
              <span :class="['status-badge', payment.allowedCreditBreach === 'Y' ? 'status-allowed' : 'status-not-allowed']">
                {{ payment.allowedCreditBreach === 'Y' ? 'Allowed' : 'Not Allowed' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
      
      <!-- No data message -->
      <div v-if="!loading && payments.length === 0" class="no-data-message">
        No data found
      </div>
    </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AnimatedButton from '@/components/layout/AnimatedButton.vue'
import SkeletonLoader from '@/components/layout/SkeletonLoader.vue'
import { useFilters } from '@/composables/useFilters'
import { usePointOfContactStore } from '@/stores/pointOfContact'
import { fetchPointOfContactPaymentReport, mapPaymentData, calculateSummary } from '@/api/pointOfContactPaymentReport'
import { generatePaymentsPDF } from '@/utils/pdfGenerator'

// Animation state
const isLoaded = ref(false)
const loading = ref(true)
const summaryLoading = ref(true)

// Point of Contact Store
const pointOfContactStore = usePointOfContactStore()

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

const loadData = async () => {
  try {
    loading.value = true
    summaryLoading.value = true
    
    let organizationUserId = pointOfContactStore.selectedUserId
    
    // If store is empty, try to refresh from localStorage
    if (!organizationUserId) {
      pointOfContactStore.refreshFromStorage()
      organizationUserId = pointOfContactStore.selectedUserId
    }
    
    if (!organizationUserId) {
      throw new Error('No organization selected. Please go back and select an organization.')
    }
    
    const filterPayload = buildFilterPayload(organizationUserId)
    const rawData = await fetchPointOfContactPaymentReport(organizationUserId, filterPayload)
    
    payments.value = mapPaymentData(rawData)
    summaryData.value = calculateSummary(rawData)
    
  } catch (error) {
    console.error('Error loading payment data:', error)
  } finally {
    loading.value = false
    summaryLoading.value = false
  }
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
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0
  }).format(numAmount || 0)
}

const downloadPayments = () => {
  const selectedPayments = payments.value.filter(payment => payment.selected)
  const hasSelection = selectedPayments.length > 0
  generatePaymentsPDF(payments.value, hasSelection)
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

onMounted(() => {
  setTimeout(() => {
    isLoaded.value = true
  }, 100)
  
  loadData()
})
</script>

<style scoped>
  /* All CSS has been moved to PaymentsPage.css */
  @import './PaymentsPage.css';
</style>