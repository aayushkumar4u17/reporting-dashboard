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
        
        <AnimatedButton @click="clearAllFilters" variant="clear" size="medium">
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
.my-orders-page {
  width: 100%;
  min-height: calc(100vh - 56px);
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  position: relative;
  overflow-x: hidden;
  overflow-y: auto;
  scroll-behavior: smooth;
}

.my-orders-page::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 20% 80%, rgba(0, 200, 81, 0.05) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(0, 200, 81, 0.03) 0%, transparent 50%);
  pointer-events: none;
}

.orders-container {
  width: 100%;
  padding: 1.5rem;
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
}

/* Filter Bar Styles */
.filter-bar {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 1rem;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.2);
  margin-bottom: 1.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: flex-end;
  border: 1px solid rgba(0, 200, 81, 0.1);
  opacity: 0;
  transform: translateY(-20px);
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.filter-bar.animate-slide-down {
  opacity: 1;
  transform: translateY(0);
}

.filter-group {
  display: flex;
  flex-direction: column;
  min-width: 130px;
}

.filter-label {
  font-size: 0.9rem;
  color: #333;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.filter-select {
  padding: 0.6rem;
  border: 2px solid rgba(0, 200, 81, 0.3);
  border-radius: 10px;
  font-size: 0.85rem;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(5px);
  color: #333;
  min-width: 120px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.filter-select:hover {
  border-color: rgba(0, 200, 81, 0.6);
  background: rgba(255, 255, 255, 0.95);
  transform: translateY(-1px);
}

.filter-select:focus {
  outline: none;
  border-color: #00C851;
  box-shadow: 0 0 0 3px rgba(0, 200, 81, 0.2);
  transform: translateY(-2px);
}



/* Table Styles */
.table-container {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(0, 200, 81, 0.15);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.2);
  overflow-x: auto;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0;
  transform: translateY(20px);
}

.table-container.animate-fade-in-up {
  opacity: 1;
  transform: translateY(0);
}

.table-container:hover {
  box-shadow: 0 12px 40px rgba(0, 200, 81, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.3);
}

.orders-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 1200px;
}

.table-header {
  background-color: #f8f9fa;
}

.header-cell {
  padding: 0.6rem 0.4rem;
  text-align: left;
  font-weight: 600;
  color: #333;
  border-bottom: 2px solid #e9ecef;
  font-size: 0.75rem;
  white-space: nowrap;
}

.checkbox-col {
  width: 40px;
  text-align: center;
}

.table-row {
  border-bottom: 1px solid #e9ecef;
}

.table-row:hover {
  background-color: #f8f9fa;
}

.table-cell {
  padding: 0.6rem 0.4rem;
  color: #333;
  font-size: 0.7rem;
  vertical-align: middle;
  max-width: 180px;
}

.delivery-location {
  max-width: 250px;
  word-wrap: break-word;
  line-height: 1.3;
}

.header-checkbox,
.row-checkbox {
  width: 16px;
  height: 16px;
  accent-color: #00C851;
}

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 500;
  text-align: center;
  display: inline-block;
  min-width: 80px;
}

.status-delivered {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.status-in-transit {
  background-color: #fff3cd;
  color: #856404;
  border: 1px solid #ffeaa7;
}

.status-to-be-assigned {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

/* Responsive Design */
@media (max-width: 768px) {
  .my-orders-page {
    /* No margin-left change needed - handled by App.vue */
  }
  
  .orders-container {
    padding: 1rem;
  }
  
  .filter-bar {
    padding: 1rem;
    gap: 1rem;
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-group {
    min-width: auto;
  }
  
  .clear-filters-btn {
    align-self: center;
    margin-top: 0.5rem;
  }
  
  .orders-table {
    min-width: 1200px;
  }
  
  .header-cell,
  .table-cell {
    padding: 0.5rem 0.25rem;
    font-size: 0.7rem;
  }
}

@media (max-width: 480px) {
  .orders-container {
    padding: 0.5rem;
  }
  
  .filter-bar {
    padding: 0.75rem;
    gap: 0.75rem;
  }
  
  .orders-table {
    min-width: 1000px;
  }
  
  .header-cell,
  .table-cell {
    padding: 0.4rem 0.2rem;
    font-size: 0.65rem;
  }
}
</style>