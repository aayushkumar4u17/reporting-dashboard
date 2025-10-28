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
        <!-- Order Details Summary -->
        <div class="order-details-section">
          <h2 class="section-title">Order Summary</h2>
          <div class="details-grid">
            <div class="detail-card metric-placed">
              <div class="card-header">
                <div class="detail-icon icon-placed">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
                  </svg>
                </div>
                <h3 class="detail-title">Total Orders</h3>
              </div>
              <div v-if="!loading" class="detail-value">{{ totalOrders }}</div>
              <div v-else class="metric-loader">
                <ModernLoader height="1.2rem" width="2.5rem" variant="placed" />
              </div>
            </div>
            <div class="detail-card metric-delivered">
              <div class="card-header">
                <div class="detail-icon icon-delivered">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 3h15l-1 13H3z"/>
                    <path d="M16 8h4l3 5v4a2 2 0 0 1-2 2h-2"/>
                    <circle cx="7" cy="20" r="2"/>
                    <circle cx="17" cy="20" r="2"/>
                  </svg>
                </div>
                <h3 class="detail-title">Delivered</h3>
              </div>
              <div v-if="!loading" class="detail-value">{{ deliveredOrders }}</div>
              <div v-else class="metric-loader">
                <ModernLoader height="1.2rem" width="2.5rem" variant="delivered" />
              </div>
            </div>
            <div class="detail-card metric-rescheduled">
              <div class="card-header">
                <div class="detail-icon icon-rescheduled">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12,6 12,12 16,14"/>
                  </svg>
                </div>
                <h3 class="detail-title">Pending</h3>
              </div>
              <div v-if="!loading" class="detail-value">{{ pendingOrders }}</div>
              <div v-else class="metric-loader">
                <ModernLoader height="1.2rem" width="2.5rem" variant="rescheduled" />
              </div>
            </div>
            <div class="detail-card metric-cost-saved">
              <div class="card-header">
                <div class="detail-icon icon-cost-saved">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 12l2 2 4-4"/>
                    <circle cx="12" cy="12" r="10"/>
                  </svg>
                </div>
                <h3 class="detail-title">Total Quantity (Ltr)</h3>
              </div>
              <div v-if="!loading" class="detail-value">{{ totalQuantity }}</div>
              <div v-else class="metric-loader">
                <ModernLoader height="1.2rem" width="2.5rem" variant="cost-saved" />
              </div>
            </div>
          </div>
        </div>

        <!-- Orders Table Section -->
        <div class="table-section" style="margin-top: 0.5rem;">
          <h2 class="section-title">Order History</h2>
          <!-- Table Topbar -->
          <div class="table-topbar premium-topbar">
            <div class="tabs premium-tabs">
              <div 
                v-for="tab in orderTabs" 
                :key="tab.key" 
                :class="['tab premium-tab', { active: activeOrderTab === tab.key }]"
                @click="activeOrderTab = tab.key"
              >
                {{ tab.label }}
              </div>
            </div>
            <div class="topbar-right">
              <input 
                v-model="orderSearchQuery" 
                type="text" 
                placeholder="🔍 Search orders..." 
                class="search-input premium-search"
              />
            </div>
          </div>
          
          <div class="card">
            <DataTable 
              :value="loading ? skeletonData : filteredOrders" 
              paginator 
              showGridlines 
              :rows="10" 
              dataKey="id"
            >
              <template #empty>
                <div style="text-align: center; font-weight: bold; padding: 2rem; color: var(--text-primary);">
                  No orders found.
                </div>
              </template>
              
              <Column field="aspOrderNo" header="App Order No" style="min-width: 12rem">
                <template #body="{ data }">
                  <SkeletonLoader v-if="loading" width="80px" height="16px" />
                  <span v-else>{{ data.aspOrderNo }}</span>
                </template>
              </Column>
              
              <Column field="salesOrderCode" header="Sales Order Code" style="min-width: 18rem">
                <template #body="{ data }">
                  <SkeletonLoader v-if="loading" width="90px" height="16px" />
                  <span v-else>{{ data.salesOrderCode }}</span>
                </template>
              </Column>
              
              <Column header="Order Date" field="orderedDate" style="min-width: 9rem">
                <template #body="{ data }">
                  <SkeletonLoader v-if="loading" width="70px" height="16px" />
                  <span v-else>{{ formatDate(data.orderedDate) }}</span>
                </template>
              </Column>
              
              <Column header="Delivery Date" field="deliveryDate" style="min-width: 9rem">
                <template #body="{ data }">
                  <SkeletonLoader v-if="loading" width="70px" height="16px" />
                  <span v-else>{{ formatDate(data.deliveryDate) }}</span>
                </template>
              </Column>
              
              <Column field="deliveryTimeSlot" header="Delivery Time" style="min-width: 10rem">
                <template #body="{ data }">
                  <SkeletonLoader v-if="loading" width="60px" height="16px" />
                  <span v-else>{{ data.deliveryTimeSlot }}</span>
                </template>
              </Column>
              
              <Column field="orderedQuantity" header="Order Quantity" style="min-width: 10rem">
                <template #body="{ data }">
                  <SkeletonLoader v-if="loading" width="50px" height="16px" />
                  <span v-else>{{ data.orderedQuantity }}</span>
                </template>
              </Column>
              
              <Column header="City" field="deliveryLocation" style="min-width: 12rem">
                <template #body="{ data }">
                  <SkeletonLoader v-if="loading" width="80px" height="16px" />
                  <span v-else>{{ data.deliveryLocation }}</span>
                </template>
              </Column>
              
              <Column header="POC Name" field="pocName" style="min-width: 14rem">
                <template #body="{ data }">
                  <SkeletonLoader v-if="loading" width="100px" height="16px" />
                  <span v-else>{{ data.pocName }}</span>
                </template>
              </Column>
              
              <Column field="pocContact" header="POC Contact" style="min-width: 12rem">
                <template #body="{ data }">
                  <SkeletonLoader v-if="loading" width="90px" height="16px" />
                  <span v-else>{{ data.pocContact }}</span>
                </template>
              </Column>
              
              <Column header="Status" field="deliveryStatus" style="min-width: 12rem">
                <template #body="{ data }">
                  <SkeletonLoader v-if="loading" width="80px" height="20px" border-radius="6px" />
                  <Tag v-else :value="data.deliveryStatus" :severity="getSeverity(data.deliveryStatus)" />
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
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import FilterBar from '@/components/ui/FilterBar.vue'
import SkeletonLoader from '@/components/layout/SkeletonLoader.vue'
import ModernLoader from '@/components/ui/ModernLoader.vue'
import { fetchPointOfContactDetailedReport } from '@/api/pointOfContactDetailedReport'
import { usePointOfContactStore } from '@/stores/pointOfContact'
import { useOrganization } from '@/composables/useOrganization'
import { useFilters } from '@/composables/useFilters'
import { usePOCFilters } from '@/composables/usePOCFilters'
import { useRouter } from 'vue-router'

// Animation state
const isLoaded = ref(false)
const loading = ref(true)

// Skeleton data for loading state
const skeletonData = ref(Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  aspOrderNo: '',
  salesOrderCode: '',
  orderedDate: '',
  deliveryDate: '',
  deliveryTimeSlot: '',
  orderedQuantity: '',
  deliveryLocation: '',
  pocName: '',
  pocContact: '',
  deliveryStatus: ''
})))

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

// Order tab and search states
const activeOrderTab = ref('all')
const orderSearchQuery = ref('')

// Dynamic order tabs based on available statuses
const orderTabs = computed(() => {
  if (loading.value || !orders.value.length) {
    return [{ key: 'all', label: 'All Orders' }]
  }

  const statusCounts = {}
  orders.value.forEach(order => {
    const status = order.deliveryStatus?.toLowerCase() || ''
    if (status === 'delivered') statusCounts.delivered = (statusCounts.delivered || 0) + 1
    else if (['pending', 'approval'].includes(status)) statusCounts.pending = (statusCounts.pending || 0) + 1
    else if (status === 'assigned') statusCounts.assigned = (statusCounts.assigned || 0) + 1
    else if (status === 'unassigned') statusCounts.unassigned = (statusCounts.unassigned || 0) + 1
    else if (status === 'confirmed') statusCounts.confirmed = (statusCounts.confirmed || 0) + 1
    else if (status === 'dispensing') statusCounts.dispensing = (statusCounts.dispensing || 0) + 1
    else if (status === 'cancelled') statusCounts.cancelled = (statusCounts.cancelled || 0) + 1
    else if (status === 'rescheduled') statusCounts.rescheduled = (statusCounts.rescheduled || 0) + 1
  })

  const tabs = [{ key: 'all', label: 'All Orders' }]
  
  if (statusCounts.delivered) tabs.push({ key: 'delivered', label: 'Delivered' })
  if (statusCounts.pending) tabs.push({ key: 'pending', label: 'Pending' })
  if (statusCounts.assigned) tabs.push({ key: 'assigned', label: 'Assigned' })
  if (statusCounts.unassigned) tabs.push({ key: 'unassigned', label: 'Unassigned' })
  if (statusCounts.confirmed) tabs.push({ key: 'confirmed', label: 'Confirmed' })
  if (statusCounts.dispensing) tabs.push({ key: 'dispensing', label: 'Dispensing' })
  if (statusCounts.cancelled) tabs.push({ key: 'cancelled', label: 'Cancelled' })
  if (statusCounts.rescheduled) tabs.push({ key: 'rescheduled', label: 'Rescheduled' })
  
  return tabs
})

// Orders data
const orders = ref([])
const allOrdersData = ref([])

// Frontend filtering with applied filters and top bar filters
const filteredOrders = computed(() => {
  let filtered = orders.value
  
  // Apply main filter search
  if (appliedFilters.value.search) {
    const searchTerm = appliedFilters.value.search.toLowerCase()
    filtered = filtered.filter(order => 
      order.aspOrderNo.toLowerCase().includes(searchTerm) ||
      order.salesOrderCode.toLowerCase().includes(searchTerm) ||
      order.pocName.toLowerCase().includes(searchTerm) ||
      order.deliveryLocation.toLowerCase().includes(searchTerm)
    )
  }
  
  // Apply top bar search
  if (orderSearchQuery.value) {
    const searchTerm = orderSearchQuery.value.toLowerCase().trim()
    filtered = filtered.filter(order => {
      const aspOrderNo = String(order.aspOrderNo || '').toLowerCase()
      const salesOrderCode = String(order.salesOrderCode || '').toLowerCase()
      return aspOrderNo.includes(searchTerm) || salesOrderCode.includes(searchTerm)
    })
  }
  
  // Apply status filter from tabs
  if (activeOrderTab.value !== 'all') {
    const statusFilter = activeOrderTab.value.toLowerCase()
    filtered = filtered.filter(order => {
      const orderStatus = order.deliveryStatus?.toLowerCase() || ''
      
      switch (statusFilter) {
        case 'delivered':
          return orderStatus === 'delivered'
        case 'pending':
          return ['pending', 'approval'].includes(orderStatus)
        case 'assigned':
          return orderStatus === 'assigned'
        case 'unassigned':
          return orderStatus === 'unassigned'
        case 'confirmed':
          return orderStatus === 'confirmed'
        case 'dispensing':
          return orderStatus === 'dispensing'
        case 'cancelled':
          return orderStatus === 'cancelled'
        case 'rescheduled':
          return orderStatus === 'rescheduled'
        default:
          return true
      }
    })
  }
  
  return filtered
})

// Order summary statistics
const totalOrders = computed(() => filteredOrders.value.length)
const deliveredOrders = computed(() => 
  filteredOrders.value.filter(order => order.deliveryStatus?.toUpperCase() === 'DELIVERED').length
)
const pendingOrders = computed(() => 
  filteredOrders.value.filter(order => 
    ['PENDING', 'ASSIGNED', 'CONFIRMED', 'DISPENSING'].includes(order.deliveryStatus?.toUpperCase())
  ).length
)
const totalQuantity = computed(() => 
  filteredOrders.value.reduce((sum, order) => {
    const qty = parseInt(order.orderedQuantity?.replace(' Ltr', '') || '0')
    return sum + qty
  }, 0)
)

// PrimeVue filter functions removed as they're not needed

const formatDate = (value) => {
  if (!value) return ''
  const date = typeof value === 'string' ? new Date(value) : value
  return date.toLocaleDateString('en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

// clearPrimeFilter function removed as it's not needed

const handleApplyFilters = (newFilters) => {
  appliedFilters.value = {
    orderDateFrom: newFilters.orderDateFrom || '',
    orderDateTo: newFilters.orderDateTo || '',
    deliveryDateFrom: newFilters.deliveryDateFrom || '',
    deliveryDateTo: newFilters.deliveryDateTo || '',
    city: newFilters.city || '',
    poc: newFilters.poc || '',
    search: newFilters.search || ''
  }
  
  const hasBackendFilters = appliedFilters.value.orderDateFrom || appliedFilters.value.deliveryDateFrom || 
    appliedFilters.value.city || appliedFilters.value.poc
  const onlySearchFilter = appliedFilters.value.search && !hasBackendFilters
  
  if (onlySearchFilter) {
    return
  }
  
  orders.value = []
  loading.value = true
  
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
  
  // Clear top bar filters
  activeOrderTab.value = 'all'
  orderSearchQuery.value = ''
  
  orders.value = []
  loading.value = true
  
  clearFilters()
  await loadData()
}

const getSeverity = (status) => {
  const statusUpper = status?.toUpperCase() || ''
  
  switch (statusUpper) {
    case 'ASSIGNED': return 'info'
    case 'UNASSIGNED': return 'danger'
    case 'DELIVERED': return 'success'
    case 'DISPENSING': return 'warn'
    case 'CANCELLED': return 'secondary'
    case 'ACCEPTED': return 'success'
    case 'CONFIRMED': return 'info'
    case 'RESCHEDULED': return 'warn'
    case 'PICKUP': return 'info'
    case 'PENDING': return 'warn'
    case 'APPROVAL': return 'secondary'
    default: return 'warn'
  }
}

const pointOfContactStore = usePointOfContactStore()
const { getOrganizationId, watchOrganizationChange } = useOrganization()

let unwatchOrganization = null

const mapOrderData = (reportData) => {
  return reportData.map((item, index) => {
    let orderDate = ''
    if (item.order_date && typeof item.order_date === 'object' && item.order_date.value) {
      orderDate = item.order_date.value
    } else if (typeof item.order_date === 'string') {
      orderDate = item.order_date
    }
    
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
    
    const lastMonth = getLastMonthRange()
    const filterParams = {
      city: '',
      order_date_from: lastMonth.from,
      order_date_to: lastMonth.to,
      delivery_date_from: '',
      delivery_date_to: '',
      point_of_contact: ''
    }
    

    const reportData = await fetchPointOfContactDetailedReport(organizationId, filterParams)

    
    allOrdersData.value = mapOrderData(reportData)
    orders.value = [...allOrdersData.value]
    
    updatePOCFilterOptions()
  } catch (error) {

  } finally {
    loading.value = false
  }
}

const loadFilteredData = async () => {
  try {
    loading.value = true
    const organizationId = getOrganizationId()
    
    if (!organizationId) return
    
    const filterParams = {
      city: appliedFilters.value.city || '',
      order_date_from: appliedFilters.value.orderDateFrom || '',
      order_date_to: appliedFilters.value.orderDateTo || appliedFilters.value.orderDateFrom || '',
      delivery_date_from: appliedFilters.value.deliveryDateFrom || '',
      delivery_date_to: appliedFilters.value.deliveryDateTo || appliedFilters.value.deliveryDateFrom || '',
      point_of_contact: appliedFilters.value.poc || ''
    }
    


    
    const reportData = await fetchPointOfContactDetailedReport(organizationId, filterParams)

    
    orders.value = mapOrderData(reportData)
  } catch (error) {

  } finally {
    loading.value = false
  }
}

const loadData = async () => {
  await loadInitialData()
}

const updatePOCFilterOptions = () => {
  const pocNamesFromOrders = [...new Set(orders.value.map(order => order.pocName).filter(name => name && name.trim()))]

}

onMounted(async () => {
  setTimeout(() => {
    isLoaded.value = true
  }, 100)
  
  // Load data and POC filters in parallel
  await Promise.all([
    loadData(),
    loadPOCFilterData()
  ])
  
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

onUnmounted(() => {
  if (unwatchOrganization) {
    unwatchOrganization()
  }
})
</script>

<style scoped>
@import './MyOrdersPage.css';

.card {
  background: var(--bg-glass);
  backdrop-filter: blur(12px);
  border: 1px solid var(--border-color);
  border-top: none;
  border-radius: 0 0 12px 12px;
  box-shadow: 0 8px 32px var(--shadow-color), 0 0 0 1px var(--border-light);
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  width: 100%;
}

.order-details-section {
  opacity: 0;
  transform: translateY(20px);
  animation: slideInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.4s forwards;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.detail-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: 12px;
  padding: 0.75rem;
  box-shadow: 0 2px 8px var(--shadow-light);
  transition: all 0.3s ease;
  position: relative;
  min-height: 85px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.detail-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 4px;
  background: var(--card-border-color, #3b82f6);
  border-radius: 12px 0 0 12px;
}

.detail-card.metric-placed {
  --card-border-color: #3b82f6;
}

.detail-card.metric-delivered {
  --card-border-color: #22c55e;
}

.detail-card.metric-rescheduled {
  --card-border-color: #f59e0b;
}

.detail-card.metric-cost-saved {
  --card-border-color: #06b6d4;
}

.detail-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px var(--shadow-color);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.detail-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  background: var(--card-border-color, #3b82f6);
  color: white;
  flex-shrink: 0;
}

.detail-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--card-border-color, #3b82f6);
  margin: 0;
  line-height: 1.2;
}

.detail-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1;
  text-align: center;
}

.metric-loader {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 1.5rem;
}
</style>