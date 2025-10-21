<template>
  <div class="my-orders-page">
    <div class="orders-container" :class="{ 'fade-in': isLoaded }">
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

      <!-- Main Content -->
      <div class="orders-content">
        <!-- Orders Table Section -->
        <div class="table-section">
          <h2 class="section-title">Order Management</h2>
          <DataTable
            :columns="orderColumns"
            :data="filteredOrders"
            :loading="loading"
            :pagination="true"
            :items-per-page="8"
          >
            <template #cell-deliveryStatus="{ value }">
              <span class="status-badge" :class="getStatusClass(value)">
                {{ value }}
              </span>
            </template>
          </DataTable>
        </div>

        <!-- Quick Actions Panel -->
        <div class="quick-actions-section">
          <h2 class="section-title">Quick Actions</h2>
          <div class="actions-grid">
            <button class="action-card" @click="navigateToPointOfContact">
              <div class="action-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <div class="action-content">
                <div class="action-title">Point of Contact</div>
                <div class="action-subtitle">View contact details</div>
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
import DataTable from '@/components/ui/DataTable.vue'
import { fetchPointOfContactDetailedReport } from '@/api/pointOfContactDetailedReport'
import { usePointOfContactStore } from '@/stores/pointOfContact'
import { useOrganization } from '@/composables/useOrganization'
import { useFilters } from '@/composables/useFilters'
import { usePOCFilters } from '@/composables/usePOCFilters'
import { useRouter } from 'vue-router'

// Animation state
const isLoaded = ref(false)
const loading = ref(true)

// Get current date in YYYY-MM-DD format
const getCurrentDate = () => {
  const today = new Date()
  return today.toISOString().split('T')[0]
}

// Get last month date range
const getLastMonthRange = () => {
  const today = new Date()
  const firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
  const lastDayLastMonth = new Date(today.getFullYear(), today.getMonth(), 0)
  
  return {
    from: firstDayLastMonth.toISOString().split('T')[0],
    to: lastDayLastMonth.toISOString().split('T')[0]
  }
}

// Filter states using composable
const { filters, clearFilters, buildFilterPayload } = useFilters()
const { cityOptions, pocOptions, loadPOCFilterData, clearPOCData } = usePOCFilters()
const router = useRouter()

// Navigation functions
const navigateToPointOfContact = () => {
  router.push('/point-of-contact')
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
const currentDate = getCurrentDate()


const filterValues = ref({
  orderDateFrom: '',
  orderDateTo: '',
  deliveryDateFrom: '',
  deliveryDateTo: '',
  city: '',
  poc: '',
  search: ''
})

// Applied filter states
const appliedFilters = ref({
  orderDateFrom: '',
  orderDateTo: '',
  deliveryDateFrom: '',
  deliveryDateTo: '',
  city: '',
  poc: '',
  search: ''
})

// Orders data
const orders = ref([])
const allOrdersData = ref([]) // Store initial data for filter options

// Table columns configuration
const orderColumns = [
  { key: 'aspOrderNo', label: 'App Order No' },
  { key: 'salesOrderCode', label: 'Sales Order Code' },
  { key: 'orderedDate', label: 'Order Date' },
  { key: 'deliveryDate', label: 'Delivery Date' },
  { key: 'deliveryTimeSlot', label: 'Delivery Time' },
  { key: 'orderedQuantity', label: 'Order Quantity' },
  { key: 'deliveryLocation', label: 'City' },
  { key: 'pocName', label: 'POC Name' },
  { key: 'pocContact', label: 'POC Contact' },
  { key: 'deliveryStatus', label: 'Delivery Status', type: 'status' }
]

// Frontend filtering with applied filters (only for search now)
const filteredOrders = computed(() => {
  let filtered = orders.value
  
  if (appliedFilters.value.search) {
    const searchTerm = appliedFilters.value.search.toLowerCase()
    filtered = filtered.filter(order => 
      order.aspOrderNo.toLowerCase().includes(searchTerm) ||
      order.salesOrderCode.toLowerCase().includes(searchTerm) ||
      order.pocName.toLowerCase().includes(searchTerm) ||
      order.deliveryLocation.toLowerCase().includes(searchTerm)
    )
  }
  
  return filtered
})

const handleApplyFilters = (newFilters) => {
  // Apply current filter values
  appliedFilters.value = {
    orderDateFrom: newFilters.orderDateFrom || '',
    orderDateTo: newFilters.orderDateTo || '',
    deliveryDateFrom: newFilters.deliveryDateFrom || '',
    deliveryDateTo: newFilters.deliveryDateTo || '',
    city: newFilters.city || '',
    poc: newFilters.poc || '',
    search: newFilters.search || ''
  }
  
  // Check if only search filter is applied (frontend only)
  const hasBackendFilters = appliedFilters.value.orderDateFrom || appliedFilters.value.deliveryDateFrom || 
    appliedFilters.value.city || appliedFilters.value.poc
  const onlySearchFilter = appliedFilters.value.search && !hasBackendFilters
  
  if (onlySearchFilter) {
    return // Only search filter, no need to reload data
  }
  
  orders.value = []
  loading.value = true
  
  // Use order date range if provided, otherwise delivery date range
  if (appliedFilters.value.orderDateFrom) {
    filters.value.orderedDateFrom = appliedFilters.value.orderDateFrom
    filters.value.orderedDateTo = appliedFilters.value.orderDateTo || appliedFilters.value.orderDateFrom
    filters.value.deliveredDateFrom = ''
    filters.value.deliveredDateTo = ''
  } else if (appliedFilters.value.deliveryDateFrom) {
    filters.value.deliveredDateFrom = appliedFilters.value.deliveryDateFrom
    filters.value.deliveredDateTo = appliedFilters.value.deliveryDateTo || appliedFilters.value.deliveryDateFrom
    filters.value.orderedDateFrom = ''
    filters.value.orderedDateTo = ''
  }
  
  filters.value.selectedCity = appliedFilters.value.city
  filters.value.selectedPOC = appliedFilters.value.poc
  loadFilteredData()
}

const handleClearFilters = async () => {
  filterValues.value = {
    orderDateFrom: '',
    orderDateTo: '',
    deliveryDateFrom: '',
    deliveryDateTo: '',
    city: '',
    poc: '',
    search: ''
  }
  appliedFilters.value = {
    orderDateFrom: '',
    orderDateTo: '',
    deliveryDateFrom: '',
    deliveryDateTo: '',
    city: '',
    poc: '',
    search: ''
  }
  
  // Clear existing data and show loading
  orders.value = []
  loading.value = true
  
  clearFilters()
  await loadData()
}



const getStatusClass = (status) => {
  const statusUpper = status?.toUpperCase() || ''
  
  switch (statusUpper) {
    case 'ASSIGNED': return 'status-assigned'
    case 'UNASSIGNED': return 'status-unassigned'
    case 'DELIVERED': return 'status-delivered'
    case 'DISPENSING': return 'status-dispensing'
    case 'CANCELLED': return 'status-cancelled'
    case 'ACCEPTED': return 'status-accepted'
    case 'CONFIRMED': return 'status-confirmed'
    case 'RESCHEDULED': return 'status-rescheduled'
    case 'PICKUP': return 'status-pickup'
    case 'PENDING': return 'status-pending'
    case 'APPROVAL': return 'status-approval'
    default: return 'status-pending'
  }
}

const pointOfContactStore = usePointOfContactStore()
const { getOrganizationId, watchOrganizationChange } = useOrganization()

// Watch for organization changes
let unwatchOrganization = null

const mapOrderData = (reportData) => {
  return reportData.map((item, index) => {
    // Extract order date value if it exists
    let orderDate = ''
    if (item.order_date && typeof item.order_date === 'object' && item.order_date.value) {
      orderDate = item.order_date.value
    } else if (typeof item.order_date === 'string') {
      orderDate = item.order_date
    }
    
    // Extract delivery date value if it exists
    let deliveryDate = ''
    if (item.actual_delivery_date && typeof item.actual_delivery_date === 'object' && item.actual_delivery_date.value) {
      deliveryDate = item.actual_delivery_date.value
    } else if (typeof item.actual_delivery_date === 'string') {
      deliveryDate = item.actual_delivery_date
    }
    
    return {
      id: index + 1,
      checkBN: item.erp_order_code || '',
      aspOrderNo: item.app_order_code || '',
      salesOrderCode: item.erp_order_code || '',
      orderedDate: orderDate,
      deliveryDate: deliveryDate,
      deliveryTimeSlot: item.delivery_slot || '',
      orderedQuantity: item.order_qty ? `${item.order_qty} Ltr` : '0 Ltr',
      deliveryLocation: item.city || '',
      pocName: `${item.first_name || ''} ${item.last_name || ''}`.trim(),
      pocContact: item.phone_number || '',
      deliveryStatus: item.backend_order_status || '',
      city: item.city || '',
      shippingAddress: item.shipping_address || ''
    }
  })
}

const loadInitialData = async () => {
  try {
    const organizationId = getOrganizationId()
    
    if (!organizationId) {
      console.warn('No organization selected')
      return
    }
    
    // Use last month as default for initial load
    const lastMonth = getLastMonthRange()
    const filterParams = {
      city: '',
      order_date_from: lastMonth.from,
      order_date_to: lastMonth.to,
      delivery_date_from: '',
      delivery_date_to: '',
      point_of_contact: ''
    }
    
    console.log('Loading orders with filters:', filterParams)
    const reportData = await fetchPointOfContactDetailedReport(organizationId, filterParams)
    console.log('Loaded orders data:', reportData.length, 'records')
    
    allOrdersData.value = mapOrderData(reportData)
    orders.value = [...allOrdersData.value]
    
    // Update POC filter data with actual data from orders
    updatePOCFilterOptions()
  } catch (error) {
    console.error('Error loading initial data:', error)
  } finally {
    loading.value = false
  }
}

const loadFilteredData = async () => {
  try {
    loading.value = true
    const organizationId = getOrganizationId()
    
    if (!organizationId) return
    
    // Create filter object with applied values - include POC for backend filtering
    const filterParams = {
      city: appliedFilters.value.city || '',
      order_date_from: appliedFilters.value.orderDateFrom || '',
      order_date_to: appliedFilters.value.orderDateTo || appliedFilters.value.orderDateFrom || '',
      delivery_date_from: appliedFilters.value.deliveryDateFrom || '',
      delivery_date_to: appliedFilters.value.deliveryDateTo || appliedFilters.value.deliveryDateFrom || '',
      point_of_contact: appliedFilters.value.poc || ''
    }
    
    console.log('Applying filters:', appliedFilters.value)
    console.log('Filter params for API:', filterParams)
    
    const reportData = await fetchPointOfContactDetailedReport(organizationId, filterParams)
    console.log('Filtered data received:', reportData.length, 'records')
    
    orders.value = mapOrderData(reportData)
  } catch (error) {
    console.error('Error loading filtered data:', error)
  } finally {
    loading.value = false
  }
}

const loadData = async () => {
  await loadInitialData()
}

// Update POC filter options based on current data
const updatePOCFilterOptions = () => {
  // Extract unique POC names from current orders data for debugging
  const pocNamesFromOrders = [...new Set(orders.value.map(order => order.pocName).filter(name => name && name.trim()))]
  console.log('POC names from orders data:', pocNamesFromOrders)
  
  // This will be handled by the usePOCFilters composable
  // The composable already loads POC data from the API
}

// Initialize animations on component mount
onMounted(async () => {
  setTimeout(() => {
    isLoaded.value = true
  }, 100)
  
  // Load initial data first, then POC filter data
  await loadData()
  
  // Load POC filter data for dropdowns
  loadPOCFilterData()
  
  // Watch for organization changes and reload data
  unwatchOrganization = watchOrganizationChange((newOrgId, oldOrgId) => {
    if (newOrgId && newOrgId !== oldOrgId) {
      loading.value = true
      clearPOCData()
      loadPOCFilterData()
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
  /* All CSS has been moved to MyOrdersPage.css */
  @import './MyOrdersPage.css';
</style>