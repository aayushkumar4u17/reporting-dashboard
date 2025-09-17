<template>
  <div class="my-orders-page">
    <div class="orders-container">
      <!-- Filter Bar -->
      <div class="filter-bar" :class="{ 'animate-slide-down': isLoaded }">
        <div class="filter-group">
          <label class="filter-label">Ordered Date</label>
          <select v-model="orderedDate" class="filter-select">
            <option value="">Select Date</option>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="last-week">Last Week</option>
            <option value="last-month">Last Month</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label class="filter-label">Delivery Date</label>
          <select v-model="deliveryDate" class="filter-select">
            <option value="">Select Date</option>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="last-week">Last Week</option>
            <option value="last-month">Last Month</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label class="filter-label">City</label>
          <select v-model="selectedCity" class="filter-select">
            <option value="">Select City</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label class="filter-label">Point of Contact</label>
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
              <th class="header-cell">Ordered Date</th>
              <th class="header-cell">Delivery Date</th>
              <th class="header-cell">Delivery Time/Slot</th>
              <th class="header-cell">Ordered Quantity</th>
              <th class="header-cell">Delivery Location</th>
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
              <td class="table-cell">{{ order.checkBN }}</td>
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
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AnimatedButton from '@/components/layout/AnimatedButton.vue'
import { fetchPointOfContactDetailedReport } from '@/api/pointOfContactDetailedReport'
import { usePointOfContactStore } from '@/stores/pointOfContact'
import { useFilters } from '@/composables/useFilters'

// Animation state
const isLoaded = ref(false)
const loading = ref(true)

// Filter states using composable
const { filters, clearFilters, buildFilterPayload } = useFilters()
const orderedDate = ref('')
const deliveryDate = ref('')
const selectedCity = ref('')
const selectedPOC = ref('')
const selectAll = ref(false)

// Orders data
const orders = ref([])

// Computed property for filtered orders
const filteredOrders = computed(() => {
  return orders.value.filter(order => {
    const cityMatch = !selectedCity.value || order.city === selectedCity.value
    const pocMatch = !selectedPOC.value || order.poc === selectedPOC.value
    // Add date filtering logic here when implementing actual date filtering
    return cityMatch && pocMatch
  })
})

const applyFilters = () => {
  // Update filters object with current values
  filters.value.orderedDate = orderedDate.value
  filters.value.deliveryDate = deliveryDate.value
  filters.value.selectedCity = selectedCity.value
  filters.value.selectedPOC = selectedPOC.value
  // Apply current filter values
  loadData()
}

const clearAllFilters = () => {
  orderedDate.value = ''
  deliveryDate.value = ''
  selectedCity.value = ''
  selectedPOC.value = ''
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

const loadData = async () => {
  try {
    const userId = pointOfContactStore.selectedUserId
    if (!userId) return
    
    // Build filter payload
    const filterPayload = buildFilterPayload(userId)
    
    const reportData = await fetchPointOfContactDetailedReport(userId, filterPayload)
    orders.value = reportData.map((item, index) => ({
      id: index + 1,
      checkBN: item.erp_order_code || '',
      aspOrderNo: item.app_order_code || '',
      salesOrderCode: item.erp_order_code || '',
      orderedDate: item.order_date || '',
      deliveryDate: item.actual_delivery_date || '',
      deliveryTimeSlot: item.delivery_slot || '',
      orderedQuantity: `${item.order_qty || 0} Ltr`,
      deliveryLocation: item.shipping_address || '',
      pocName: `${item.first_name || ''} ${item.last_name || ''}`.trim(),
      pocContact: item.phone_number || '',
      deliveryStatus: item.backend_order_status || '',
      city: item.city || '',
      selected: false
    }))
  } catch (error) {
    console.error('Error loading orders:', error)
  } finally {
    loading.value = false
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
  /* All CSS has been moved to MyOrdersPage.css */
  @import './MyOrdersPage.css';
</style>