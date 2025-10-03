<template>
  <div class="my-invoices-page">
    <div class="invoices-container">
      <!-- Filter Component -->
      <FilterBar
        :filters="['dateRanges', 'city', 'poc']"
        v-model="filterValues"
        :city-options="cityOptions"
        :poc-options="pocOptions"
        @apply="handleApplyFilters"
        @clear="handleClearFilters"
        :loading="loading"
      >
        <template #actions>
          <AnimatedButton @click="downloadInvoices" variant="success" size="small" :loading="downloadingBulk">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7,10 12,15 17,10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Download Invoices
          </AnimatedButton>
        </template>
      </FilterBar>

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
      <DataTable
        :columns="invoiceColumns"
        :data="filteredInvoices"
        :loading="loading"
        :show-checkbox="true"
        :pagination="true"
        :items-per-page="10"
        @selection-change="handleSelectionChange"
      >
        <template #cell-downloadAction="{ item }">
          <div style="display: flex; justify-content: center;">
            <ModernDownloadButton 
              @click="downloadInvoice(item.id)" 
              :loading="downloadingInvoice === item.id"
            />
          </div>
        </template>
      </DataTable>
    </div>

    <!-- Error Popup -->
    <div v-if="showNoDataPopup" class="popup-overlay" @click="closeErrorPopup">
      <div class="popup-content" @click.stop>
        <h3>{{ errorMessage ? 'Error' : 'No Data Found' }}</h3>
        <p>{{ errorMessage || 'No data available to download' }}</p>
        <AnimatedButton @click="closeErrorPopup" variant="primary" size="small">
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
import AnimatedButton from '@/components/layout/AnimatedButton.vue'
import ModernDownloadButton from '@/components/layout/ModernDownloadButton.vue'
import { fetchPointOfContactInvoiceReport } from '@/api/pointOfContactInvoiceReport'
import { usePointOfContactStore } from '@/stores/pointOfContact'
import { useFilters } from '@/composables/useFilters'
import { useOrganization } from '@/composables/useOrganization'
import { downloadInvoices as downloadInvoicesPdf } from '@/api/salesInvoicePdf'
import { usePOCFilters } from '@/composables/usePOCFilters'

// Animation state
const isLoaded = ref(false)
const loading = ref(true)
const showNoDataPopup = ref(false)
const errorMessage = ref('')
const downloadingInvoice = ref(null)
const downloadingBulk = ref(false)

// Filter states using composable
const { filters, clearFilters, buildFilterPayload } = useFilters()
const { cityOptions, pocOptions, loadPOCFilterData, clearPOCData } = usePOCFilters()
const selectAll = ref(false)

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

// Invoices data
const invoices = ref([])

// Table columns configuration
const invoiceColumns = [
  { key: 'aspOrderCode', label: 'Order Code' },
  { key: 'salesInvoiceNumber', label: 'Sales Invoice No.' },
  { key: 'salesOrderCode', label: 'Sales Order Code' },
  { key: 'orderedDate', label: 'Order Date' },
  { key: 'deliveredDate', label: 'Delivery Date' },
  { key: 'orderedQuantity', label: 'Order Qty' },
  { key: 'deliveredQuantity', label: 'Delivery Qty' },
  { key: 'amount', label: 'Amount' },
  { key: 'deliveryLocation', label: 'City' },
  { key: 'pocName', label: 'POC Name' },
  { key: 'pocContact', label: 'POC Contact' },
  { key: 'downloadAction', label: 'Download Invoice' }
]

// Computed property for filtered invoices
const filteredInvoices = computed(() => {
  return invoices.value.filter(invoice => {
    const cityMatch = !appliedFilters.value.city || invoice.city === appliedFilters.value.city
    const pocMatch = !appliedFilters.value.poc || invoice.pocName.includes(appliedFilters.value.poc)
    
    // Search filter
    const searchMatch = !appliedFilters.value.search || 
      invoice.aspOrderCode.toLowerCase().includes(appliedFilters.value.search.toLowerCase()) ||
      invoice.salesInvoiceNumber.toLowerCase().includes(appliedFilters.value.search.toLowerCase()) ||
      invoice.salesOrderCode.toLowerCase().includes(appliedFilters.value.search.toLowerCase()) ||
      invoice.pocName.toLowerCase().includes(appliedFilters.value.search.toLowerCase()) ||
      invoice.deliveryLocation.toLowerCase().includes(appliedFilters.value.search.toLowerCase())
    
    return cityMatch && pocMatch && searchMatch
  })
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
  
  // Check if only frontend filters are applied (city, poc, search)
  const hasDateFilters = appliedFilters.value.orderDateFrom || appliedFilters.value.deliveryDateFrom
  const onlyFrontendFilters = (appliedFilters.value.city || appliedFilters.value.poc || appliedFilters.value.search) && !hasDateFilters
  
  if (onlyFrontendFilters) {
    return
  }
  
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
  
  loadData()
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

const handleSelectionChange = (selectedItems) => {
  // Handle selection change if needed
  console.log('Selected items:', selectedItems)
}

const toggleSelectAll = () => {
  invoices.value.forEach(invoice => {
    invoice.selected = selectAll.value
  })
}

const downloadInvoice = async (invoiceId) => {
  try {
    downloadingInvoice.value = invoiceId
    const invoice = invoices.value.find(inv => inv.id === invoiceId)
    if (!invoice || !invoice.salesInvoiceNumber) {
      errorMessage.value = 'Invoice not found'
      showNoDataPopup.value = true
      return
    }
    
    await downloadInvoicesPdf([{
      sales_invoice_erp_code: invoice.salesInvoiceNumber,
      isPickup: false
    }])
  } catch (error) {
    console.error('Error downloading invoice:', error)
    errorMessage.value = `Failed to download PDF: ${error.message}`
    showNoDataPopup.value = true
  } finally {
    downloadingInvoice.value = null
  }
}

const downloadInvoices = async () => {
  try {
    downloadingBulk.value = true
    if (filteredInvoices.value.length === 0) {
      errorMessage.value = 'No data available to download'
      showNoDataPopup.value = true
      return
    }
    
    const selectedInvoices = invoices.value.filter(invoice => invoice.selected)
    const invoicesToDownload = selectedInvoices.length > 0 ? selectedInvoices : filteredInvoices.value
    
    if (invoicesToDownload.length === 0) {
      errorMessage.value = 'No invoices selected for download'
      showNoDataPopup.value = true
      return
    }
    
    const invoicesWithErpCodes = invoicesToDownload
      .filter(invoice => invoice.salesInvoiceNumber)
      .map(invoice => ({
        sales_invoice_erp_code: invoice.salesInvoiceNumber,
        isPickup: false
      }))
    
    if (invoicesWithErpCodes.length === 0) {
      errorMessage.value = 'No valid invoice codes found'
      showNoDataPopup.value = true
      return
    }
    
    await downloadInvoicesPdf(invoicesWithErpCodes)
  } catch (error) {
    console.error('Error downloading invoices:', error)
    errorMessage.value = `Failed to download PDFs: ${error.message}`
    showNoDataPopup.value = true
  } finally {
    downloadingBulk.value = false
  }
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
const { getOrganizationId, watchOrganizationChange } = useOrganization()

// Watch for organization changes
let unwatchOrganization = null

const loadData = async () => {
  try {
    const organizationId = getOrganizationId()
    
    if (!organizationId) {
      console.warn('No organization selected')
      return
    }
    
    // Build filter payload with organization ID
    const filterPayload = buildFilterPayload(organizationId)
    
    const reportData = await fetchPointOfContactInvoiceReport(organizationId, filterPayload)
    // Sort by latest date first (order date or delivery date)
    const sortedData = reportData.sort((a, b) => {
      const getDate = (item) => {
        let orderDate = ''
        if (item.order_date && typeof item.order_date === 'object' && item.order_date.value) {
          orderDate = item.order_date.value
        } else if (typeof item.order_date === 'string') {
          orderDate = item.order_date
        }
        
        let deliveredDate = ''
        if (item.delivered_date && typeof item.delivered_date === 'object' && item.delivered_date.value) {
          deliveredDate = item.delivered_date.value
        } else if (typeof item.delivered_date === 'string') {
          deliveredDate = item.delivered_date
        }
        
        // Use delivery date if available, otherwise order date
        const dateToUse = deliveredDate || orderDate
        return dateToUse ? new Date(dateToUse) : new Date(0)
      }
      
      return getDate(b) - getDate(a) // Latest first
    })
    
    invoices.value = sortedData.map((item, index) => {
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

const closeErrorPopup = () => {
  showNoDataPopup.value = false
  errorMessage.value = ''
}

// Initialize animations on component mount
onMounted(() => {
  setTimeout(() => {
    isLoaded.value = true
  }, 100)
  
  // Load POC filter data
  loadPOCFilterData()
  
  // Load initial data
  loadData()
  
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
  /* All CSS has been moved to MyInvoicesPage.css */
  @import './MyInvoicesPage.css';

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

  .download-actions {
    margin-bottom: 1.5rem;
    display: flex;
    justify-content: flex-end;
    opacity: 0;
    transform: translateY(20px);
    transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .download-actions.animate-fade-in-up {
    opacity: 1;
    transform: translateY(0);
  }
</style>