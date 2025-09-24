<template>
  <div class="payments-page">

    
    <div class="payments-container">
      <!-- Filter Section -->
    <div class="filter-section" :class="{ 'animate-slide-down': isLoaded }">
      <div class="filter-row">
        <div class="filter-group">
          <label>Order Date</label>
          <DatePicker v-model="orderedDate" placeholder="Select Order Date" />
        </div>
        
        <div class="filter-group">
          <label>Delivery Date</label>
          <DatePicker v-model="deliveredDate" placeholder="Select Delivery Date" />
        </div>
        
        <div class="filter-group">
          <label>City</label>
          <select v-model="selectedCity" class="filter-select">
            <option value="">Select City</option>
            <option v-for="city in availableCities" :key="city" :value="city">{{ city }}</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>Point of Contact</label>
          <select v-model="selectedPOC" class="filter-select">
            <option value="">Select POC</option>
            <option v-for="poc in availablePOCs" :key="poc" :value="poc">{{ poc }}</option>
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
            <!-- <th>Phone Number</th> -->
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

    <!-- No Data Popup -->
    <div v-if="showNoDataPopup" class="popup-overlay" @click="showNoDataPopup = false">
      <div class="popup-content" @click.stop>
        <h3>No Data Found</h3>
        <p>No data available to download</p>
        <AnimatedButton @click="showNoDataPopup = false" variant="primary" size="small">
          OK
        </AnimatedButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AnimatedButton from '@/components/layout/AnimatedButton.vue'
import SkeletonLoader from '@/components/layout/SkeletonLoader.vue'
import DatePicker from '@/components/layout/DatePicker.vue'
import { useFilters } from '@/composables/useFilters'
import { usePointOfContactStore } from '@/stores/pointOfContact'
import { fetchPointOfContactPaymentReport, mapPaymentData, calculateSummary } from '@/api/pointOfContactPaymentReport'
import { generatePaymentsPDF } from '@/utils/pdfGenerator'

// Animation state
const isLoaded = ref(false)
const loading = ref(true)
const summaryLoading = ref(true)
const showNoDataPopup = ref(false)

// Point of Contact Store
const pointOfContactStore = usePointOfContactStore()

// Filter states using composable
const { filters, clearFilters, buildFilterPayload } = useFilters()
const orderedDate = ref('')
const deliveredDate = ref('')
const selectedCity = ref('')
const selectedPOC = ref('')

// Reactive data
const selectAll = ref(false)
const payments = ref([])
const availableCities = ref([])
const availablePOCs = ref([])

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
    
    // Extract unique cities and POCs from the data
    const cities = [...new Set(rawData.map(item => item.city).filter(Boolean))]
    const pocs = [...new Set(rawData.map(item => item.point_of_contact).filter(Boolean))]
    
    availableCities.value = cities.sort()
    availablePOCs.value = pocs.sort()
    
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
  // Apply current filter values
  loadData()
}

const clearAllFilters = () => {
  orderedDate.value = ''
  deliveredDate.value = ''
  selectedCity.value = ''
  selectedPOC.value = ''
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
  if (payments.value.length === 0) {
    showNoDataPopup.value = true
    return
  }
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

  .popup-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .popup-content {
    background: white;
    padding: 20px;
    border-radius: 8px;
    text-align: center;
    min-width: 300px;
  }

  .popup-content h3 {
    margin: 0 0 10px 0;
    color: #333;
  }

  .popup-content p {
    margin: 0 0 20px 0;
    color: #666;
  }
</style>