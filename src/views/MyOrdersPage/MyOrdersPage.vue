<template>
  <div class="my-orders-page">
    <div class="orders-container">
      <!-- Filter Bar -->
      <div class="filter-bar" :class="{ 'animate-slide-down': isLoaded }">
        <div class="filter-group">
          <label class="filter-label">Delivery Date</label>
          <DatePicker v-model="deliveryDate" placeholder="Select Delivery Date" />
        </div>
        
        <div class="filter-group">
          <label class="filter-label">Order Date</label>
          <DatePicker v-model="orderedDate" placeholder="Select Order Date" />
        </div>
        
        <div class="filter-group">
          <label class="filter-label">City</label>
          <select v-model="selectedCity" class="filter-select">
            <option value="">Select City</option>
            <option v-for="city in uniqueCities" :key="city" :value="city">
              {{ city }}
            </option>
          </select>
        </div>
        
        <div class="filter-group">
          <label class="filter-label">Point of Contact</label>
          <select v-model="selectedPOC" class="filter-select">
            <option value="">Select POC</option>
            <option v-for="poc in uniquePOCs" :key="poc" :value="poc">
              {{ poc }}
            </option>
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

      <!-- Orders Table -->
      <div class="table-container" :class="{ 'animate-fade-in-up': isLoaded }">
        <table class="orders-table">
          <thead>
            <tr class="table-header">
              <th class="header-cell checkbox-column">
                <input type="checkbox" v-model="selectAll" @change="toggleSelectAll" class="header-checkbox" />
              </th>
              <!-- <th class="header-cell">Check BN</th> -->
              <th class="header-cell">Asp Order No</th>
              <th class="header-cell">Sales Order Code</th>
              <th class="header-cell">Order Date</th>
              <th class="header-cell">Delivery Date</th>
              <th class="header-cell">Delivery Time</th>
              <th class="header-cell">Order Quantity</th>
              <th class="header-cell">City</th>
              <th class="header-cell">POC Name</th>
              <th class="header-cell">POC Contact</th>
              <th class="header-cell">Delivery Status</th>
            </tr>
          </thead>
          <tbody>
            <!-- Skeleton loading rows -->
            <tr v-if="loading" v-for="i in 5" :key="i" class="table-row skeleton-row">
              <td class="table-cell checkbox-column">
                <SkeletonLoader width="16px" height="16px" />
              </td>
              <td class="table-cell"><SkeletonLoader width="80%" height="16px" /></td>
              <td class="table-cell"><SkeletonLoader width="80%" height="16px" /></td>
              <td class="table-cell"><SkeletonLoader width="80%" height="16px" /></td>
              <td class="table-cell"><SkeletonLoader width="80%" height="16px" /></td>
              <td class="table-cell"><SkeletonLoader width="80%" height="16px" /></td>
              <td class="table-cell"><SkeletonLoader width="80%" height="16px" /></td>
              <td class="table-cell"><SkeletonLoader width="80%" height="16px" /></td>
              <td class="table-cell"><SkeletonLoader width="80%" height="16px" /></td>
              <td class="table-cell"><SkeletonLoader width="80%" height="16px" /></td>
              <td class="table-cell"><SkeletonLoader width="80%" height="16px" /></td>
              <td class="table-cell"><SkeletonLoader width="80%" height="16px" /></td>
            </tr>
            
            <!-- Actual data rows -->
            <tr v-for="order in filteredOrders" :key="order.id" class="table-row">
              <td class="table-cell checkbox-column">
                <input type="checkbox" v-model="order.selected" class="row-checkbox" />
              </td>
              <!-- <td class="table-cell">{{ order.checkBN }}</td> -->
              <td class="table-cell">{{ order.aspOrderNo }}</td>
              <td class="table-cell">{{ order.salesOrderCode }}</td>
              <td class="table-cell">{{ order.orderedDate }}</td>
              <td class="table-cell">{{ order.deliveryDate }}</td>
              <td class="table-cell">{{ order.deliveryTimeSlot }}</td>
              <td class="table-cell">{{ order.orderedQuantity }}</td>
              <td class="table-cell delivery-location">{{ order.deliveryLocation }}</td>
              <td class="table-cell">{{ order.pocName }}</td>
              <td class="table-cell">{{ order.pocContact }}</td>
              <td class="table-cell">
                <span class="status-badge" :class="getStatusClass(order.deliveryStatus)">
                  {{ order.deliveryStatus }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
        
        <!-- No data message -->
        <div v-if="!loading && filteredOrders.length === 0" class="no-data-message">
          No data found
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AnimatedButton from '@/components/layout/AnimatedButton.vue'
import DatePicker from '@/components/layout/DatePicker.vue'
import { fetchPointOfContactDetailedReport } from '@/api/pointOfContactDetailedReport'
import { usePointOfContactStore } from '@/stores/pointOfContact'
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
const orderedDate = ref(currentDate)
const deliveryDate = ref(currentDate)
const selectedCity = ref('')
const selectedPOC = ref('')
const selectAll = ref(false)

// Applied filter states
const appliedOrderedDate = ref('')
const appliedDeliveryDate = ref('')
const appliedCity = ref('')
const appliedPOC = ref('')

// Orders data
const orders = ref([])
const allOrdersData = ref([]) // Store initial data for filter options

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
  
  if (appliedPOC.value) {
    filtered = filtered.filter(order => order.pocName === appliedPOC.value)
  }
  
  return filtered
})

const applyFilters = () => {
  // Ensure dates have values (use current date if empty)
  const currentDate = getCurrentDate()
  const orderDateValue = orderedDate.value || currentDate
  const deliveryDateValue = deliveryDate.value || currentDate
  
  // Apply current filter values
  appliedOrderedDate.value = orderDateValue
  appliedDeliveryDate.value = deliveryDateValue
  appliedCity.value = selectedCity.value
  appliedPOC.value = selectedPOC.value
  
  // Check if only POC filter is applied (frontend filter)
  const onlyPOCFilter = appliedPOC.value && !orderDateValue && !deliveryDateValue && !appliedCity.value
  
  if (onlyPOCFilter) {
    // Use frontend filtering for POC only
    return
  }
  
  // Clear existing data first
  orders.value = []
  loading.value = true
  
  // Update filters object with applied values
  filters.value.orderedDateFrom = orderDateValue
  filters.value.deliveredDateFrom = deliveryDateValue
  filters.value.selectedCity = appliedCity.value
  filters.value.selectedPOC = appliedPOC.value
  
  // Load filtered data (exclude POC from API call)
  loadFilteredData()
}

const clearAllFilters = () => {
  const currentDate = getCurrentDate()
  orderedDate.value = currentDate
  deliveryDate.value = currentDate
  selectedCity.value = ''
  selectedPOC.value = ''
  appliedOrderedDate.value = ''
  appliedDeliveryDate.value = ''
  appliedCity.value = ''
  appliedPOC.value = ''
  clearFilters()
  loadData()
}

const toggleSelectAll = () => {
  orders.value.forEach(order => {
    order.selected = selectAll.value
  })
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

const mapOrderData = (reportData) => {
  return reportData.map((item, index) => {
    // Extract order date value if it exists
    let orderDate = ''
    if (item.order_date && typeof item.order_date === 'object' && item.order_date.value) {
      orderDate = item.order_date.value
    } else if (typeof item.order_date === 'string') {
      orderDate = item.order_date
    }
    
    return {
      id: index + 1,
      checkBN: item.erp_order_code || '',
      aspOrderNo: item.app_order_code || '',
      salesOrderCode: item.erp_order_code || '',
      orderedDate: orderDate,
      deliveryDate: item.actual_delivery_date || '',
      deliveryTimeSlot: item.delivery_slot || '',
      orderedQuantity: item.order_qty ? `${item.order_qty} Ltr` : '0 Ltr',
      deliveryLocation: item.city || '',
      pocName: `${item.first_name || ''} ${item.last_name || ''}`.trim(),
      pocContact: item.phone_number || '',
      deliveryStatus: item.backend_order_status || '',
      city: item.city || '',
      selected: false,
      shippingAddress: item.shipping_address || ''
    }
  })
}

const loadInitialData = async () => {
  try {
    let userId = pointOfContactStore.selectedUserId
    
    if (!userId) {
      pointOfContactStore.refreshFromStorage()
      userId = pointOfContactStore.selectedUserId
    }
    
    if (!userId) return
    
    // Use current date as default for initial load
    const currentDate = getCurrentDate()
    const filterParams = {
      city: '',
      ordered_date: currentDate,
      delivered_date: currentDate,
      point_of_contact: ''
    }
    
    const reportData = await fetchPointOfContactDetailedReport(userId, filterParams)
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
    let userId = pointOfContactStore.selectedUserId
    
    if (!userId) return
    
    // Ensure dates have values - use current date if empty
    const currentDate = getCurrentDate()
    const orderDate = appliedOrderedDate.value || orderedDate.value || currentDate
    const deliveryDate = appliedDeliveryDate.value || deliveryDate.value || currentDate
    
    // Create filter object with applied values (exclude POC for frontend filtering)
    const filterParams = {
      city: appliedCity.value || '',
      ordered_date: orderDate,
      delivered_date: deliveryDate,
      point_of_contact: ''
    }
    
    const reportData = await fetchPointOfContactDetailedReport(userId, filterParams)
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
})
</script>

<style scoped>
  /* All CSS has been moved to MyOrdersPage.css */
  @import './MyOrdersPage.css';
</style>