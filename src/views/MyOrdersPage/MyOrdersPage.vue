<template>
  <div class="my-orders-page">
    <div class="orders-container">
      <!-- Filter Component -->
      <FilterBar
        :filters="['deliveryDateRange', 'orderDateRange', 'city', 'poc']"
        v-model="filterValues"
        :city-options="uniqueCities"
        :poc-options="uniquePOCs"
        @apply="handleApplyFilters"
        @clear="handleClearFilters"
        :loading="loading"
      />

      <!-- Orders Table -->
      <DataTable
        :columns="orderColumns"
        :data="filteredOrders"
        :loading="loading"
        :pagination="true"
        :items-per-page="10"
      >
        <template #cell-deliveryStatus="{ value }">
          <span class="status-badge" :class="getStatusClass(value)">
            {{ value }}
          </span>
        </template>
      </DataTable>
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

// Animation state
const isLoaded = ref(false)
const loading = ref(true)

// Get current date in YYYY-MM-DD format
const getCurrentDate = () => {
  const today = new Date()
  return today.toISOString().split('T')[0]
}

// Filter states using composable
const { filters, clearFilters, buildFilterPayload } = useFilters()
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

// Computed properties for filter options (from current page data)
const uniqueCities = computed(() => {
  const cities = orders.value.map(order => order.deliveryLocation).filter(city => city && city.trim())
  return [...new Set(cities)].sort()
})

const uniquePOCs = computed(() => {
  const pocs = orders.value.map(order => order.pocName).filter(poc => poc && poc.trim())
  return [...new Set(pocs)].sort()
})

// Frontend filtering with applied filters
const filteredOrders = computed(() => {
  let filtered = orders.value
  
  if (appliedFilters.value.poc) {
    filtered = filtered.filter(order => order.pocName === appliedFilters.value.poc)
  }
  
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
  
  // Check if only POC or search filter is applied (frontend filters)
  const hasDateFilters = appliedFilters.value.orderDateFrom || appliedFilters.value.deliveryDateFrom
  const onlyFrontendFilters = (appliedFilters.value.poc || appliedFilters.value.search) && 
    !hasDateFilters && !appliedFilters.value.city
  
  if (onlyFrontendFilters) {
    return
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
  loadFilteredData()
}

const handleClearFilters = () => {
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
  clearFilters()
  loadData()
}



const getStatusClass = (status) => {
  switch (status) {
    case 'Delivered':
      return 'status-delivered'
    case 'In Transit':
      return 'status-in-transit'
    case 'To be assigned':
      return 'status-to-be-assigned'
    default:
      return ''
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
    
    // Use current date as default for initial load
    const currentDate = getCurrentDate()
    const filterParams = {
      city: '',
      ordered_date: currentDate,
      delivered_date: currentDate,
      point_of_contact: ''
    }
    
    const reportData = await fetchPointOfContactDetailedReport(organizationId, filterParams)
    allOrdersData.value = mapOrderData(reportData)
    orders.value = [...allOrdersData.value]
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
    
    // Create filter object with applied values (exclude POC and search for frontend filtering)
    const filterParams = {
      city: appliedFilters.value.city || '',
      ordered_date: appliedFilters.value.orderDateFrom || '',
      delivered_date: appliedFilters.value.deliveryDateFrom || '',
      point_of_contact: ''
    }
    
    const reportData = await fetchPointOfContactDetailedReport(organizationId, filterParams)
    orders.value = mapOrderData(reportData)
  } catch (error) {
    console.error('Error loading filtered data:', error)
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
  
  // Load initial data for filter options and table
  loadInitialData()
  
  // Watch for organization changes and reload data
  unwatchOrganization = watchOrganizationChange((newOrgId, oldOrgId) => {
    if (newOrgId && newOrgId !== oldOrgId) {
      loading.value = true
      loadInitialData()
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