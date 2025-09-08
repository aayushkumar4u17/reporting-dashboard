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
        
        <div class="filter-actions">
          <AnimatedButton @click="clearAllFilters" variant="clear" size="small">
            Clear All Filters
          </AnimatedButton>
          
          <AnimatedButton @click="downloadAllInvoices" variant="primary" size="small">
            Download Invoice
          </AnimatedButton>
        </div>
      </div>

      <!-- Download Options -->
      <div class="download-options" :class="{ 'animate-fade-in-up': isLoaded }">
        <div class="download-format">
          <span class="format-label">Excel</span>
          <AnimatedButton @click="downloadExcel" variant="success" size="small">📄</AnimatedButton>
        </div>
        <div class="download-format">
          <span class="format-label">PDF</span>
          <AnimatedButton @click="downloadPDF" variant="danger" size="small">📄</AnimatedButton>
        </div>
      </div>

      <!-- Invoices Table -->
      <div class="table-container" :class="{ 'animate-fade-in-up': isLoaded }">
        <table class="invoices-table">
          <thead>
            <tr class="table-header">
              <th class="header-cell checkbox-col">
                <input type="checkbox" v-model="selectAll" @change="toggleSelectAll" class="header-checkbox" />
              </th>
              <th class="header-cell">Check BN</th>
              <th class="header-cell">Asp Order Code</th>
              <th class="header-cell">Sales Invoice Number</th>
              <th class="header-cell">Sales Order Code</th>
              <th class="header-cell">Ordered Date</th>
              <th class="header-cell">Delivered Date</th>
              <th class="header-cell">Ordered Quantity</th>
              <th class="header-cell">Delivered Quantity</th>
              <th class="header-cell">Amount</th>
              <th class="header-cell">Delivery Location</th>
              <th class="header-cell">POC Name</th>
              <th class="header-cell">POC Contact</th>
              <th class="header-cell">Download Invoice</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="invoice in filteredInvoices" :key="invoice.id" class="table-row">
              <td class="table-cell checkbox-col">
                <input type="checkbox" v-model="invoice.selected" class="row-checkbox" />
              </td>
              <td class="table-cell">{{ invoice.checkBN }}</td>
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
const deliveredDate = ref('')
const selectedCity = ref('')
const selectedPOC = ref('')
const selectAll = ref(false)

// Mock invoices data based on the image
const invoices = ref([])

// Computed property for filtered invoices
const filteredInvoices = computed(() => {
  return invoices.value.filter(invoice => {
    const cityMatch = !selectedCity.value || invoice.city === selectedCity.value
    const pocMatch = !selectedPOC.value || invoice.poc === selectedPOC.value
    // Add date filtering logic here when implementing actual date filtering
    return cityMatch && pocMatch
  })
})

const clearAllFilters = () => {
  orderedDate.value = ''
  deliveredDate.value = ''
  selectedCity.value = ''
  selectedPOC.value = ''
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

// Initialize animations on component mount
onMounted(() => {
  setTimeout(() => {
    isLoaded.value = true
  }, 100)
})
</script>

<style scoped>
  /* All CSS has been moved to MyInvoicesPage.css */
  @import './MyInvoicesPage.css';
</style>