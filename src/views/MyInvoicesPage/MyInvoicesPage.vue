<template>
  <div class="my-invoices-page">
    <div class="invoices-container" :class="{ 'fade-in': isLoaded }">
      <!-- Filter Bar -->
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

      <!-- Main Content -->
      <div class="invoices-content">
        <!-- Invoice Summary Section -->
        <div class="invoice-summary-section">
          <h2 class="section-title">Invoice Summary</h2>
          <div class="summary-grid">
            <div class="summary-card metric-total animate-fade-in-up" style="animation-delay: 0.2s">
              <div class="card-header">
                <div class="summary-icon icon-total">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14,2 14,8 20,8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                  </svg>
                </div>
                <h3 class="summary-title">Total Invoices</h3>
              </div>
              <div v-if="!loading" class="summary-value">{{ totalInvoices }}</div>
              <div v-else class="metric-loader">
                <SkeletonLoader height="1.2rem" width="2.5rem" />
              </div>
            </div>
            <div class="summary-card metric-pending animate-fade-in-up" style="animation-delay: 0.4s">
              <div class="card-header">
                <div class="summary-icon icon-pending">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12,6 12,12 16,14"/>
                  </svg>
                </div>
                <h3 class="summary-title">Pending Deliveries</h3>
              </div>
              <div v-if="!loading" class="summary-value">{{ pendingDeliveries }}</div>
              <div v-else class="metric-loader">
                <SkeletonLoader height="1.2rem" width="2.5rem" />
              </div>
            </div>
            <div class="summary-card metric-volume animate-fade-in-up" style="animation-delay: 0.6s">
              <div class="card-header">
                <div class="summary-icon icon-volume">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                </div>
                <h3 class="summary-title">Total Fuel (Ltr)</h3>
              </div>
              <div v-if="!loading" class="summary-value">{{ totalFuelVolume }}</div>
              <div v-else class="metric-loader">
                <SkeletonLoader height="1.2rem" width="3rem" />
              </div>
            </div>
            <div class="summary-card metric-efficiency animate-fade-in-up" style="animation-delay: 0.8s">
              <div class="card-header">
                <div class="summary-icon icon-efficiency">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 12l2 2 4-4"/>
                    <circle cx="12" cy="12" r="10"/>
                  </svg>
                </div>
                <h3 class="summary-title">Delivery Rate</h3>
              </div>
              <div v-if="!loading" class="summary-value">{{ deliveryEfficiency }}%</div>
              <div v-else class="metric-loader">
                <SkeletonLoader height="1.2rem" width="3rem" />
              </div>
            </div>
          </div>
        </div>

        <!-- Invoices Table Section -->
        <div class="table-section">
          <h2 class="section-title">Invoice Management</h2>
          <div class="card">
            <DataTable
              :value="loading ? skeletonData : filteredInvoices"
              :frozenValue="lockedInvoices"
              paginator
              showGridlines
              :rows="10"
              dataKey="id"
              :pt="{
                table: { style: 'min-width: 50rem' },
                bodyrow: ({ props }) => ({
                  class: [{ 'font-bold': props.frozenRow }]
                })
              }"
            >
              <template #empty>
                <div style="text-align: center; font-weight: bold; padding: 2rem; color: var(--text-primary);">
                  No invoices found.
                </div>
              </template>
              
              <Column style="min-width: 60px; width: auto">
                <template #header>
                  <input 
                    type="checkbox" 
                    :checked="selectAll" 
                    @change="toggleSelectAll"
                    class="invoice-checkbox"
                    title="Select/Deselect All for Download"
                  />
                </template>
                <template #body="{ data, frozenRow }">
                  <SkeletonLoader v-if="loading" width="18px" height="18px" border-radius="4px" />
                  <input 
                    v-else
                    type="checkbox" 
                    :checked="selectedInvoices.has(data.id)"
                    @change="toggleInvoiceSelection(data.id)"
                    class="invoice-checkbox"
                    title="Select for Download"
                  />
                </template>
              </Column>
              
              <Column field="aspOrderCode" header="Order Code" style="min-width: 100px; width: auto">
                <template #body="{ data }">
                  <SkeletonLoader v-if="loading" width="80px" height="16px" />
                  <span v-else>{{ data.aspOrderCode }}</span>
                </template>
              </Column>
              
              <Column field="salesInvoiceNumber" header="Sales Invoice No." style="min-width: 220px; width: auto; white-space: nowrap">
                <template #body="{ data }">
                  <SkeletonLoader v-if="loading" width="90px" height="16px" />
                  <span v-else>{{ data.salesInvoiceNumber }}</span>
                </template>
              </Column>
              
              <Column field="salesOrderCode" header="Sales Order Code" style="min-width: 250px; width: auto; white-space: nowrap">
                <template #body="{ data }">
                  <SkeletonLoader v-if="loading" width="90px" height="16px" />
                  <span v-else>{{ data.salesOrderCode }}</span>
                </template>
              </Column>
              
              <Column field="orderedDate" header="Order Date" style="min-width: 140px; width: auto">
                <template #body="{ data }">
                  <SkeletonLoader v-if="loading" width="70px" height="16px" />
                  <span v-else>{{ data.orderedDate }}</span>
                </template>
              </Column>
              
              <Column field="deliveredDate" header="Delivery Date" style="min-width: 140px; width: auto">
                <template #body="{ data }">
                  <SkeletonLoader v-if="loading" width="70px" height="16px" />
                  <span v-else>{{ data.deliveredDate }}</span>
                </template>
              </Column>
              
              <Column field="orderedQuantity" header="Order Qty" style="min-width: 120px; width: auto">
                <template #body="{ data }">
                  <SkeletonLoader v-if="loading" width="50px" height="16px" />
                  <span v-else>{{ data.orderedQuantity }}</span>
                </template>
              </Column>
              
              <Column field="deliveredQuantity" header="Delivery Qty" style="min-width: 130px; width: auto">
                <template #body="{ data }">
                  <SkeletonLoader v-if="loading" width="50px" height="16px" />
                  <span v-else>{{ data.deliveredQuantity }}</span>
                </template>
              </Column>
              
              <Column field="amount" header="Amount" style="min-width: 120px; width: auto">
                <template #body="{ data }">
                  <SkeletonLoader v-if="loading" width="60px" height="16px" />
                  <span v-else>{{ data.amount }}</span>
                </template>
              </Column>
              
              <Column field="deliveryLocation" header="City" style="min-width: 100px; width: auto">
                <template #body="{ data }">
                  <SkeletonLoader v-if="loading" width="80px" height="16px" />
                  <span v-else>{{ data.deliveryLocation }}</span>
                </template>
              </Column>
              
              <Column field="pocName" header="POC Name" style="min-width: 150px; width: auto">
                <template #body="{ data }">
                  <SkeletonLoader v-if="loading" width="100px" height="16px" />
                  <span v-else>{{ data.pocName }}</span>
                </template>
              </Column>
              
              <Column field="pocContact" header="POC Contact" style="min-width: 150px; width: auto">
                <template #body="{ data }">
                  <SkeletonLoader v-if="loading" width="90px" height="16px" />
                  <span v-else>{{ data.pocContact }}</span>
                </template>
              </Column>
              
              <Column header="Download" style="min-width: 100px; width: auto">
                <template #body="{ data }">
                  <SkeletonLoader v-if="loading" width="40px" height="32px" border-radius="6px" />
                  <div v-else style="display: flex; justify-content: center;">
                    <ModernDownloadButton 
                      @click="downloadInvoice(data.id)" 
                      :loading="downloadingInvoice === data.id"
                    />
                  </div>
                </template>
              </Column>
            </DataTable>
          </div>
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
            
            <button class="action-card" @click="navigateToOrders">
              <div class="action-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
                </svg>
              </div>
              <div class="action-content">
                <div class="action-title">View All Orders</div>
                <div class="action-subtitle">Manage and track orders</div>
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
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import FilterBar from '@/components/ui/FilterBar.vue'
import AnimatedButton from '@/components/layout/AnimatedButton.vue'
import ModernDownloadButton from '@/components/layout/ModernDownloadButton.vue'
import SkeletonLoader from '@/components/layout/SkeletonLoader.vue'
import { fetchPointOfContactInvoiceReport } from '@/api/pointOfContactInvoiceReport'
import { usePointOfContactStore } from '@/stores/pointOfContact'
import { useFilters } from '@/composables/useFilters'
import { useOrganization } from '@/composables/useOrganization'
import { downloadInvoices as downloadInvoicesPdf } from '@/api/salesInvoicePdf'
import { usePOCFilters } from '@/composables/usePOCFilters'
import { useRouter } from 'vue-router'

// Animation state
const isLoaded = ref(false)
const loading = ref(true)
const filterLoading = ref(false)
const showNoDataPopup = ref(false)
const errorMessage = ref('')
const downloadingInvoice = ref(null)
const downloadingBulk = ref(false)

// Filter states using composable
const { filters, clearFilters, buildFilterPayload } = useFilters()
const { cityOptions, pocOptions, loadPOCFilterData, clearPOCData } = usePOCFilters()
const router = useRouter()

// Navigation functions
const navigateToPointOfContact = () => {
  router.push('/point-of-contact')
}

const navigateToOrders = () => {
  router.push('/my-orders')
}

const navigateToPayments = () => {
  router.push('/payments')
}

const navigateToDashboard = () => {
  router.push('/dashboard')
}

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

// Optimized select all state
const selectAll = computed(() => {
  if (selectedInvoices.value.size === 0) return false
  const totalCount = invoices.value.length + lockedInvoices.value.length
  return totalCount > 0 && selectedInvoices.value.size === totalCount
})

// Cached summary statistics to avoid recalculation
const summaryStats = ref({
  totalInvoices: 0,
  totalAmount: '0.00',
  pendingDeliveries: 0,
  totalFuelVolume: '0',
  deliveryEfficiency: '0'
})

// Optimized summary stats calculation
const calculateSummaryStats = () => {
  const allInvoices = [...invoices.value, ...lockedInvoices.value]
  
  if (allInvoices.length === 0) {
    summaryStats.value = {
      totalInvoices: 0,
      totalAmount: '0.00',
      pendingDeliveries: 0,
      totalFuelVolume: '0',
      deliveryEfficiency: '0'
    }
    return
  }
  
  // Use reduce for better performance
  const stats = allInvoices.reduce((acc, invoice) => {
    // Amount calculation
    const amount = parseFloat(invoice.amount?.replace('₹ ', '') || '0')
    acc.totalAmount += amount
    
    // Pending deliveries
    if (!invoice.deliveredDate?.trim()) {
      acc.pendingCount++
    } else {
      acc.deliveredCount++
    }
    
    // Fuel volume
    const qty = parseInt(invoice.orderedQuantity?.replace(' Ltr', '') || '0')
    acc.totalFuel += qty
    
    return acc
  }, { totalAmount: 0, pendingCount: 0, totalFuel: 0, deliveredCount: 0 })
  
  summaryStats.value = {
    totalInvoices: allInvoices.length,
    totalAmount: stats.totalAmount.toFixed(2),
    pendingDeliveries: stats.pendingCount,
    totalFuelVolume: stats.totalFuel.toLocaleString(),
    deliveryEfficiency: Math.round((stats.deliveredCount / allInvoices.length) * 100).toString()
  }
}

// Computed properties that return cached values
const totalInvoices = computed(() => summaryStats.value.totalInvoices)
const totalAmount = computed(() => summaryStats.value.totalAmount)
const pendingDeliveries = computed(() => summaryStats.value.pendingDeliveries)
const totalFuelVolume = computed(() => summaryStats.value.totalFuelVolume)
const deliveryEfficiency = computed(() => summaryStats.value.deliveryEfficiency)

// Invoices data
const invoices = ref([])
const lockedInvoices = ref([])
const selectedInvoices = ref(new Set())

// Skeleton data for loading state
const skeletonData = ref(Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  aspOrderCode: '',
  salesInvoiceNumber: '',
  salesOrderCode: '',
  orderedDate: '',
  deliveredDate: '',
  orderedQuantity: '',
  deliveredQuantity: '',
  amount: '',
  deliveryLocation: '',
  pocName: '',
  pocContact: ''
})))





// Optimized filtered invoices
const filteredInvoices = computed(() => {
  const searchQuery = appliedFilters.value.search?.trim()
  
  if (!searchQuery) {
    return invoices.value
  }
  
  const searchLower = searchQuery.toLowerCase()
  return invoices.value.filter(invoice => 
    invoice.aspOrderCode?.toLowerCase().includes(searchLower) ||
    invoice.salesInvoiceNumber?.toLowerCase().includes(searchLower) ||
    invoice.salesOrderCode?.toLowerCase().includes(searchLower) ||
    invoice.pocName?.toLowerCase().includes(searchLower) ||
    invoice.deliveryLocation?.toLowerCase().includes(searchLower)
  )
})

const handleApplyFilters = (newFilters) => {
  // Immediate UI update
  Object.assign(appliedFilters.value, newFilters)
  
  // Check if backend call is needed
  const hasBackendFilters = newFilters.orderDateFrom || newFilters.deliveryDateFrom || 
    newFilters.city || newFilters.poc
  
  if (!hasBackendFilters) {
    return // Only search filter, handled by computed property
  }
  
  // Async backend call without blocking UI
  nextTick(async () => {
    loading.value = true
    
    // Update filters for backend call
    if (newFilters.orderDateFrom) {
      filters.value.orderedDateFrom = newFilters.orderDateFrom
      filters.value.orderedDateTo = newFilters.orderDateTo || newFilters.orderDateFrom
      filters.value.deliveredDateFrom = ''
      filters.value.deliveredDateTo = ''
    } else if (newFilters.deliveryDateFrom) {
      filters.value.deliveredDateFrom = newFilters.deliveryDateFrom
      filters.value.deliveredDateTo = newFilters.deliveryDateTo || newFilters.deliveryDateFrom
      filters.value.orderedDateFrom = ''
      filters.value.orderedDateTo = ''
    }
    
    filters.value.selectedCity = newFilters.city
    filters.value.selectedPOC = newFilters.poc
    
    await loadData()
  })
}

const handleClearFilters = () => {
  const hadBackendFilters = appliedFilters.value.orderDateFrom || appliedFilters.value.deliveryDateFrom || 
    appliedFilters.value.city || appliedFilters.value.poc
  
  // Immediate UI update
  const emptyFilters = {
    orderDateFrom: '',
    orderDateTo: '',
    deliveryDateFrom: '',
    deliveryDateTo: '',
    city: '',
    poc: '',
    search: ''
  }
  
  Object.assign(filterValues.value, emptyFilters)
  Object.assign(appliedFilters.value, emptyFilters)
  clearFilters()
  
  if (hadBackendFilters) {
    nextTick(async () => {
      loading.value = true
      await loadData()
    })
  }
}

const handleSelectionChange = (selectedItems) => {
  // Handle selection change if needed
  console.log('Selected items:', selectedItems)
}

const toggleLockByCheckbox = (data, frozen) => {
  if (frozen) {
    // Unlock: move from locked to regular
    lockedInvoices.value = lockedInvoices.value.filter(invoice => invoice.id !== data.id)
    if (!invoices.value.find(invoice => invoice.id === data.id)) {
      invoices.value.push(data)
    }
  } else {
    // Lock: move from regular to locked (max 3)
    if (lockedInvoices.value.length < 3) {
      invoices.value = invoices.value.filter(invoice => invoice.id !== data.id)
      lockedInvoices.value.push(data)
    }
  }

  // Sort invoices by ID
  invoices.value.sort((val1, val2) => val1.id - val2.id)
  lockedInvoices.value.sort((val1, val2) => val1.id - val2.id)
}

const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedInvoices.value.clear()
  } else {
    // Select all without array spreading
    invoices.value.forEach(invoice => selectedInvoices.value.add(invoice.id))
    lockedInvoices.value.forEach(invoice => selectedInvoices.value.add(invoice.id))
  }
}

const toggleInvoiceSelection = (invoiceId) => {
  if (selectedInvoices.value.has(invoiceId)) {
    selectedInvoices.value.delete(invoiceId)
  } else {
    selectedInvoices.value.add(invoiceId)
  }
}

const downloadInvoice = async (invoiceId) => {
  try {
    downloadingInvoice.value = invoiceId
    const allInvoices = [...invoices.value, ...lockedInvoices.value]
    const invoice = allInvoices.find(inv => inv.id === invoiceId)
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
    
    if (selectedInvoices.value.size === 0) {
      errorMessage.value = 'Please select at least one invoice to download'
      showNoDataPopup.value = true
      return
    }
    
    // Get selected invoices without array spreading
    const invoicesWithErpCodes = []
    
    invoices.value.forEach(invoice => {
      if (selectedInvoices.value.has(invoice.id) && invoice.salesInvoiceNumber) {
        invoicesWithErpCodes.push({
          sales_invoice_erp_code: invoice.salesInvoiceNumber,
          isPickup: false
        })
      }
    })
    
    lockedInvoices.value.forEach(invoice => {
      if (selectedInvoices.value.has(invoice.id) && invoice.salesInvoiceNumber) {
        invoicesWithErpCodes.push({
          sales_invoice_erp_code: invoice.salesInvoiceNumber,
          isPickup: false
        })
      }
    })
    
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
    console.log('Loading invoices with filters:', filterPayload)
    
    const reportData = await fetchPointOfContactInvoiceReport(organizationId, filterPayload)
    console.log('Loaded invoices data:', reportData.length, 'records')
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
    
    invoices.value = sortedData.map((item, index) => ({
      id: index + 1,
      aspOrderCode: item.app_order_code || '',
      salesInvoiceNumber: item.invoice || '',
      salesOrderCode: item.erp_order_code || '',
      orderedDate: item.order_date?.value || item.order_date || '',
      deliveredDate: item.delivered_date?.value || item.delivered_date || '',
      orderedQuantity: item.order_qty ? `${item.order_qty} Ltr` : '0 Ltr',
      deliveredQuantity: item.order_delivered_qty ? `${item.order_delivered_qty} Ltr` : '0 Ltr',
      amount: `₹ ${(parseFloat(item.order_amount) || 0).toFixed(2)}`,
      deliveryLocation: item.city || '',
      pocName: `${item.first_name || ''} ${item.last_name || ''}`.trim(),
      pocContact: item.phone_number || '',
      city: item.city || '',
      selected: false
    }))
    

    
    // Calculate summary stats asynchronously
    nextTick(() => calculateSummaryStats())
    
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
onMounted(async () => {
  setTimeout(() => {
    isLoaded.value = true
  }, 100)
  
  // Load data and POC filters in parallel
  await Promise.all([
    loadData(),
    loadPOCFilterData()
  ])
  
  // Watch for organization changes and reload data
  unwatchOrganization = watchOrganizationChange(async (newOrgId, oldOrgId) => {
    if (newOrgId && newOrgId !== oldOrgId) {
      loading.value = true
      clearPOCData()
      // Load data and POC filters in parallel
      await Promise.all([
        loadData(),
        loadPOCFilterData()
      ])
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