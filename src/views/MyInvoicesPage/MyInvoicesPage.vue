<template>
  <div class="my-invoices-page">
    <div class="invoices-container">
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
          <label class="filter-label">Delivered Date</label>
          <select v-model="deliveredDate" class="filter-select">
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
          <AnimatedButton @click="downloadAllInvoices" variant="success" size="small">
            Download Invoice
          </AnimatedButton>
        </div>
      </div>

      <!-- Download Options -->
      <!-- <div class="download-options" :class="{ 'animate-fade-in-up': isLoaded }"> -->
        <!-- <div class="download-format">
          <span class="format-label">Excel</span>
          <AnimatedButton @click="downloadExcel" variant="success" size="small">📄</AnimatedButton>
        </div> -->
        <!-- <div class="download-format">
          <span class="format-label">PDF</span>
          <AnimatedButton @click="downloadPDF" variant="danger" size="small">📄</AnimatedButton>
        </div>
      </div> -->

      <!-- Invoices Table -->
      <div class="table-container" :class="{ 'animate-fade-in-up': isLoaded }">
        <table class="invoices-table">
          <thead>
            <tr class="table-header">
              <th class="header-cell checkbox-column">
                <input type="checkbox" v-model="selectAll" @change="toggleSelectAll" class="header-checkbox" />
              </th>
              <!-- <th class="header-cell"></th> -->
              <th class="header-cell">Asp Order Code</th>
              <th class="header-cell">Sales Invoice Number</th>
              <th class="header-cell">Sales Order Code</th>
              <th class="header-cell">Order Date</th>
              <th class="header-cell">Delivery Date</th>
              <th class="header-cell">Order Quantity</th>
              <th class="header-cell">Delivery Quantity</th>
              <th class="header-cell">Amount</th>
              <th class="header-cell">Delivery Location</th>
              <th class="header-cell">POC Name</th>
              <th class="header-cell">POC Contact</th>
              <th class="header-cell">Download Invoice</th>
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
              <td class="table-cell amount"><SkeletonLoader width="80%" height="16px" /></td>
              <td class="table-cell"><SkeletonLoader width="80%" height="16px" /></td>
              <td class="table-cell"><SkeletonLoader width="80%" height="16px" /></td>
              <td class="table-cell"><SkeletonLoader width="80%" height="16px" /></td>
              <td class="table-cell download-col">
                <SkeletonLoader width="24px" height="24px" />
              </td>
            </tr>
            
            <!-- Actual data rows -->
            <tr v-for="invoice in filteredInvoices" :key="invoice.id" class="table-row">
              <td class="table-cell checkbox-column">
                <input type="checkbox" v-model="invoice.selected" class="row-checkbox" />
              </td>
              <td class="table-cell">{{ invoice.aspOrderCode }}</td>
              <td class="table-cell">{{ invoice.salesInvoiceNumber }}</td>
              <td class="table-cell">{{ invoice.salesOrderCode }}</td>
              <td class="table-cell">{{ invoice.orderedDate }}</td>
              <td class="table-cell">{{ invoice.deliveredDate }}</td>
              <td class="table-cell">{{ invoice.orderedQuantity }}</td>
              <td class="table-cell">{{ invoice.deliveredQuantity }}</td>
              <td class="table-cell amount">{{ invoice.amount }}</td>
              <td class="table-cell delivery-location">{{ invoice.deliveryLocation }}</td>
              <td class="table-cell">{{ invoice.pocName }}</td>
              <td class="table-cell">{{ invoice.pocContact }}</td>
              <td class="table-cell download-col">
                <AnimatedButton @click="downloadInvoice(invoice.id)" variant="primary" size="small">
                  ⬇️
                </AnimatedButton>
              </td>
            </tr>
          </tbody>
        </table>
        
        <!-- No data message -->
        <div v-if="!loading && filteredInvoices.length === 0" class="no-data-message">
          No data found
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AnimatedButton from '@/components/layout/AnimatedButton.vue'
import { fetchPointOfContactInvoiceReport } from '@/api/pointOfContactInvoiceReport'
import { usePointOfContactStore } from '@/stores/pointOfContact'
import { useFilters } from '@/composables/useFilters'

// Animation state
const isLoaded = ref(false)
const loading = ref(true)

// Filter states using composable
const { filters, clearFilters, buildFilterPayload } = useFilters()
const orderedDate = ref('')
const deliveredDate = ref('')
const selectedCity = ref('')
const selectedPOC = ref('')
const selectAll = ref(false)

// Invoices data
const invoices = ref([])

// Computed property for filtered invoices
const filteredInvoices = computed(() => {
  return invoices.value.filter(invoice => {
    const cityMatch = !selectedCity.value || invoice.city === selectedCity.value
    const pocMatch = !selectedPOC.value || `${invoice.pocName}`.includes(selectedPOC.value)
    // Add date filtering logic here when implementing actual date filtering
    return cityMatch && pocMatch
  })
})

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
  loadData()
}

const toggleSelectAll = () => {
  invoices.value.forEach(invoice => {
    invoice.selected = selectAll.value
  })
}

const downloadInvoice = (invoiceId) => {
  console.log(`Downloading invoice for ID: ${invoiceId}`)
  // Implement individual invoice download logic
}

const downloadAllInvoices = () => {
  console.log('Downloading all selected invoices')
  // Implement bulk download logic
}

const downloadExcel = () => {
  console.log('Downloading Excel format')
  // Implement Excel download logic
}

const downloadPDF = () => {
  console.log('Downloading PDF format')
  // Implement PDF download logic
}

const pointOfContactStore = usePointOfContactStore()

const loadData = async () => {
  try {
    const userId = pointOfContactStore.selectedUserId
    if (!userId) return
    
    // Build filter payload
    const filterPayload = buildFilterPayload(userId)
    
    const reportData = await fetchPointOfContactInvoiceReport(userId, filterPayload)
    invoices.value = reportData.map((item, index) => {
      // Extract order date value if it exists
      let orderDate = ''
      if (item.order_date && typeof item.order_date === 'object' && item.order_date.value) {
        orderDate = item.order_date.value
      } else if (typeof item.order_date === 'string') {
        orderDate = item.order_date
      }
      
      // Extract delivered date value if it exists
      let deliveredDate = ''
      if (item.delivered_date && typeof item.delivered_date === 'object' && item.delivered_date.value) {
        deliveredDate = item.delivered_date.value
      } else if (typeof item.delivered_date === 'string') {
        deliveredDate = item.delivered_date
      }
      
      // Handle order amount (can be number or string)
      let orderAmount = 0
      if (typeof item.order_amount === 'number') {
        orderAmount = item.order_amount
      } else if (typeof item.order_amount === 'string') {
        orderAmount = parseFloat(item.order_amount) || 0
      }
      
      return {
        id: index + 1,
        aspOrderCode: item.app_order_code || '',
        salesInvoiceNumber: item.invoice || '',
        salesOrderCode: item.erp_order_code || '',
        orderedDate: orderDate,
        deliveredDate: deliveredDate,
        orderedQuantity: item.order_qty ? `${item.order_qty} Ltr` : '0 Ltr',
        deliveredQuantity: item.order_delivered_qty ? `${item.order_delivered_qty} Ltr` : '0 Ltr',
        amount: `₹ ${orderAmount.toFixed(2)}`,
        deliveryLocation: item.city || '',
        pocName: `${item.first_name || ''} ${item.last_name || ''}`.trim(),
        pocContact: item.phone_number || '',
        city: item.city || '',
        selected: false
      }
    })
  } catch (error) {
    console.error('Error loading invoices:', error)
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
  /* All CSS has been moved to MyInvoicesPage.css */
  @import './MyInvoicesPage.css';
</style>