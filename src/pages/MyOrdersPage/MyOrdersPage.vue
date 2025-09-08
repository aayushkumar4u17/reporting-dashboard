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
            <option value="bangalore">Bangalore</option>
            <option value="mumbai">Mumbai</option>
            <option value="delhi">Delhi</option>
            <option value="chennai">Chennai</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label class="filter-label">Point of Contact</label>
          <select v-model="selectedPOC" class="filter-select">
            <option value="">Select POC</option>
            <option value="student">Student</option>
            <option value="chetan">Chetan</option>
            <option value="gaurav">Gaurav</option>
            <option value="laxmi">Laxmi</option>
          </select>
        </div>
        
        <AnimatedButton @click="clearAllFilters" variant="clear" size="small">
          Clear All Filters
        </AnimatedButton>
      </div>

      <!-- Orders Table -->
      <div class="table-container" :class="{ 'animate-fade-in-up': isLoaded }">
        <table class="orders-table">
          <thead>
            <tr class="table-header">
              <th class="header-cell checkbox-col">
                <input type="checkbox" v-model="selectAll" @change="toggleSelectAll" class="header-checkbox" />
              </th>
              <th class="header-cell">Check BN</th>
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
            <tr v-for="order in filteredOrders" :key="order.id" class="table-row">
              <td class="table-cell checkbox-col">
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
import AnimatedButton from '@/components/common/AnimatedButton.vue'

// Animation state
const isLoaded = ref(false)

// Filter states
const orderedDate = ref('')
const deliveryDate = ref('')
const selectedCity = ref('')
const selectedPOC = ref('')
const selectAll = ref(false)

// Mock orders data based on the image
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

const clearAllFilters = () => {
  orderedDate.value = ''
  deliveryDate.value = ''
  selectedCity.value = ''
  selectedPOC.value = ''
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

// Initialize animations on component mount
onMounted(() => {
  setTimeout(() => {
    isLoaded.value = true
  }, 100)
})
</script>

<style scoped>
  /* All CSS has been moved to MyOrdersPage.css */
  @import './MyOrdersPage.css';
</style>