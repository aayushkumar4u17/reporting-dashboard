<template>
  <div class="payments-page">

    
    <div class="payments-container">
      <!-- Filter Component -->
      <FilterBar
        :filters="['orderDateRange', 'deliveryDateRange']"
        v-model="filterValues"
        @apply="handleApplyFilters"
        @clear="handleClearFilters"
        :loading="loading"
      />

    <!-- Summary Cards -->
    <SummaryCards
      :cards="summaryCards"
      :actions="summaryActions"
      :show-actions="true"
      :loading="summaryLoading"
      @action-click="handleSummaryAction"
    />

    <!-- Table Section -->
    <DataTable
      :columns="paymentColumns"
      :data="payments"
      :loading="loading"
      :show-checkbox="true"
      @selection-change="handleSelectionChange"
    >
      <template #cell-creditLimit="{ value }">
        {{ formatCurrency(value) }}
      </template>
      <template #cell-outstandingAmount="{ value }">
        {{ formatCurrency(value) }}
      </template>
      <template #cell-overdueAmount="{ value }">
        {{ formatCurrency(value) }}
      </template>
      <template #cell-allowedCreditBreach="{ value }">
        <span :class="['status-badge', value === 'Y' ? 'status-allowed' : 'status-not-allowed']">
          {{ value === 'Y' ? 'Allowed' : 'Not Allowed' }}
        </span>
      </template>
    </DataTable>
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import FilterBar from '@/components/ui/FilterBar.vue'
import DataTable from '@/components/ui/DataTable.vue'
import SummaryCards from '@/components/ui/SummaryCards.vue'
import AnimatedButton from '@/components/layout/AnimatedButton.vue'
import { useFilters } from '@/composables/useFilters'
import { usePointOfContactStore } from '@/stores/pointOfContact'
import { useOrganization } from '@/composables/useOrganization'
import { fetchPointOfContactPaymentReport, mapPaymentData, calculateSummary } from '@/api/pointOfContactPaymentReport'
import { generatePaymentsPDF } from '@/utils/pdfGenerator'

// Animation state
const isLoaded = ref(false)
const loading = ref(true)
const summaryLoading = ref(true)
const showNoDataPopup = ref(false)

// Point of Contact Store
const pointOfContactStore = usePointOfContactStore()
const { getOrganizationId, watchOrganizationChange } = useOrganization()

// Watch for organization changes
let unwatchOrganization = null

// Filter states using composable
const { filters, clearFilters, buildFilterPayload } = useFilters()
const filterValues = ref({
  orderDateFrom: '',
  orderDateTo: '',
  deliveryDateFrom: '',
  deliveryDateTo: '',
  city: '',
  poc: ''
})

// Reactive data
const selectAll = ref(false)
const payments = ref([])
const availableCities = ref([])
const availablePOCs = ref([])

// Table columns configuration
const paymentColumns = [
  { key: 'customerId', label: 'Customer ID' },
  { key: 'customerName', label: 'Customer Name' },
  { key: 'creditLimit', label: 'Credit Limit', type: 'currency' },
  { key: 'outstandingAmount', label: 'Outstanding Amount', type: 'currency' },
  { key: 'overdueAmount', label: 'Overdue Amount', type: 'currency' },
  { key: 'allowedCreditBreach', label: 'Credit Breach', type: 'status' }
]

// Summary cards configuration
const summaryCards = computed(() => [
  { key: 'creditLimit', label: 'Credit Limit', value: summaryData.value.creditLimit, valueClass: 'green' },
  { key: 'availableBalance', label: 'Available Balance', value: summaryData.value.availableBalance, valueClass: 'green' },
  { key: 'totalOutstanding', label: 'Total Outstanding', value: summaryData.value.totalOutstanding, valueClass: 'green' },
  { key: 'totalOverdue', label: 'Total Overdue', value: summaryData.value.totalOverdue, valueClass: 'red' }
])

// Summary actions configuration
const summaryActions = [
  { key: 'payOutstanding', label: 'Pay Outstanding', variant: 'success' },
  { key: 'payOverdue', label: 'Pay Overdue', variant: 'warning' }
]

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
    
    const organizationId = getOrganizationId()
    
    if (!organizationId) {
      console.warn('No organization selected')
      return
    }
    
    const filterPayload = buildFilterPayload(organizationId)
    const rawData = await fetchPointOfContactPaymentReport(organizationId, filterPayload)
    
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
const handleApplyFilters = (appliedFilters) => {
  // Update filters object with applied values
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
  // Apply current filter values
  loadData()
}

const handleClearFilters = () => {
  filterValues.value = {
    orderDateFrom: '',
    orderDateTo: '',
    deliveryDateFrom: '',
    deliveryDateTo: '',
    city: '',
    poc: ''
  }
  clearFilters()
  // Clear all filter values and reload data
  loadData()
}

const handleSelectionChange = (selectedItems) => {
  // Handle selection change if needed
  console.log('Selected items:', selectedItems)
}

const handleSummaryAction = (actionKey) => {
  switch (actionKey) {
    case 'payOutstanding':
      console.log('Pay Outstanding clicked')
      break
    case 'payOverdue':
      console.log('Pay Overdue clicked')
      break
  }
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
  
  // Watch for organization changes and reload data
  unwatchOrganization = watchOrganizationChange((newOrgId, oldOrgId) => {
    if (newOrgId && newOrgId !== oldOrgId) {
      loading.value = true
      summaryLoading.value = true
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