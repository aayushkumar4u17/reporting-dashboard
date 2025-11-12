<template>
  <div class="dashboard-page">
    <div class="dashboard-container" :class="{ 'fade-in': isLoaded, 'sidebar-collapsed': isSidebarCollapsed }">
        <!-- Filter Bar -->
        <FilterBar
          :key="`filter-${orgId}`"
          :filters="['dateRanges', 'city', 'poc']"
          v-model="filterValues"
          :city-options="cityOptions"
          :poc-options="pocOptions"
          @apply="handleApplyFilters"
          @clear="handleClearFilters"
          :loading="loading"
        />

      <!-- Main Dashboard Content -->
      <div class="dashboard-content">
        <!-- Metric Cards Section - All at the top -->
        <div class="analytics-section">
          <h2 class="section-title">Order Analytics</h2>
          <div class="metrics-grid">
            <MetricCard
              title="Orders Placed"
              variant="placed"
              :items="[
                { label: 'Total Count', value: formatNumber(dashboardData.totalOrdersPlaced.count) },
                { label: 'Volume (L)', value: formatNumber(dashboardData.totalOrdersPlaced.quantity) }
              ]"
              :loading="loading"
              :animation-delay="0.2"
            >
              <template #icon>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
                </svg>
              </template>
            </MetricCard>

            <MetricCard
              title="Orders Delivered"
              variant="delivered"
              :items="[
                { label: 'Total Count', value: formatNumber(dashboardData.totalOrdersDelivered.count) },
                { label: 'Volume (L)', value: formatNumber(dashboardData.totalOrdersDelivered.quantity) }
              ]"
              :loading="loading"
              :animation-delay="0.4"
            >
              <template #icon>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 3h15l-1 13H3z"/>
                  <path d="M16 8h4l3 5v4a2 2 0 0 1-2 2h-2"/>
                  <circle cx="7" cy="20" r="2"/>
                  <circle cx="17" cy="20" r="2"/>
                </svg>
              </template>
            </MetricCard>

            <MetricCard
              title="Orders Cancelled"
              variant="cancelled"
              :items="[
                { label: 'Total Count', value: formatNumber(dashboardData.totalOrdersCancelled.count) },
                { label: 'Volume (L)', value: formatNumber(dashboardData.totalOrdersCancelled.quantity) }
              ]"
              :loading="loading"
              :animation-delay="0.6"
            >
              <template #icon>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="15" y1="9" x2="9" y2="15"/>
                  <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
              </template>
            </MetricCard>

            <MetricCard
              title="Orders Rescheduled"
              variant="rescheduled"
              :items="[
                { label: 'Total Count', value: formatNumber(dashboardData.totalOrdersRescheduled.count) },
                { label: 'Volume (L)', value: formatNumber(dashboardData.totalOrdersRescheduled.quantity) }
              ]"
              :loading="loading"
              :animation-delay="0.8"
            >
              <template #icon>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="23,4 23,10 17,10"/>
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                </svg>
              </template>
            </MetricCard>

            <MetricCard
              title="Pending Orders"
              variant="pending"
              :items="[
                { label: 'Total Count', value: formatNumber(dashboardData.totalPendingOrders.count) },
                { label: 'Volume (L)', value: formatNumber(dashboardData.totalPendingOrders.quantity) }
              ]"
              :loading="loading"
              :animation-delay="1.0"
            >
              <template #icon>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </template>
            </MetricCard>


          </div>
        </div>

        <!-- Charts Section - Below all metric cards -->
        <div class="charts-section">
          <h2 class="section-title">Analytics Overview</h2>
          <ModernCharts 
            ref="modernChartsRef"
            :key="chartKey" 
            :data="chartData" 
            :loading="chartsLoading"
            :organization-id="getOrganizationId()"
            :filters="filters"
            @fetch-time-data="handleFetchTimeData"
          />
        </div>
      </div>
      </div>
    
    <!-- Error Popup -->
    <ErrorPopup 
      :show="showErrorPopup" 
      :title="errorTitle"
      :message="errorMessage" 
      :showRetry="true"
      buttonText="Close"
      @close="hideError" 
      @retry="retryDashboardData" 
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import FilterBar from '@/components/ui/FilterBar.vue'
import MetricCard from '@/components/ui/MetricCard.vue'
import ModernCharts from '@/components/ui/ModernCharts.vue'
import ErrorPopup from '@/components/layout/ErrorPopup.vue'
import { usePointOfContactStore } from '@/stores/pointOfContact'
import { useOrganization } from '@/composables/useOrganization'
import { fetchPointOfContactDashboard } from '@/api/pointOfContactDashboard'
import { fetchPointOfContactDashboardReschedule } from '@/api/pointOfContactDashboardReschedule'
import { fetchTimeBasedChartData } from '@/api/timeBasedChartData'
import { fetchDashboardAnalytics, transformAnalyticsData } from '@/api/dashboardAnalytics'
import { useFilters } from '@/composables/useFilters'
import { usePOCFilters } from '@/composables/usePOCFilters'
import { useSidebar } from '@/composables/useSidebar'

import { testDashboardQueries } from '@/utils/testDashboardQueries'

const router = useRouter()

// Sidebar state
const { isSidebarCollapsed } = useSidebar()



// Animation state
const isLoaded = ref(false)

// Chart key for forcing re-render
const chartKey = ref(0)
const modernChartsRef = ref(null)

// Computed data for modern charts
const chartData = computed(() => ({
  order_count: dashboardData.value.totalOrdersPlaced.count,
  cancelled_count: dashboardData.value.totalOrdersCancelled.count,
  pending_orders: dashboardData.value.totalPendingOrders.count,
  delivered_orders: dashboardData.value.totalOrdersDelivered.count,
  rescheduled_count: dashboardData.value.totalOrdersRescheduled.count
}))

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

// Format last updated time
const lastUpdated = ref('')
const updateLastUpdatedTime = () => {
  const now = new Date()
  lastUpdated.value = now.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour12: true,
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: 'short'
  })
}

const formatNumber = (num: number | string): string => {
  const numValue = typeof num === 'string' ? parseFloat(num) || 0 : num
  return new Intl.NumberFormat('en-IN').format(numValue)
}

const formatCurrency = (amount: number | string): string => {
  const num = parseInt(String(amount)) || 0
  return new Intl.NumberFormat('en-IN').format(num)
}

// Update charts with real data
const updateChartsWithRealData = (data: any) => {
  // Charts are now reactive and will update automatically
}

// Navigation functions
const navigateToOrders = () => {
  router.push('/my-orders')
}

const navigateToInvoices = () => {
  router.push('/my-invoices')
}

const navigateToPayments = () => {
  router.push('/payments')
}

const refreshDashboard = () => {
  fetchDashboardData()
}

// Handle time-based chart data fetching
const handleFetchTimeData = async (period: string) => {
  try {
    const organizationId = getOrganizationId()
    if (!organizationId) return

    // Try new analytics API first, fallback to old API if needed
    try {
      const analyticsData = await fetchDashboardAnalytics(organizationId)
      let periodData = []
      
      switch (period) {
        case 'weekly':
          periodData = transformAnalyticsData(analyticsData.weeks)
          break
        case 'yearly':
          periodData = transformAnalyticsData(analyticsData.year)
          break
        default:
          periodData = transformAnalyticsData(analyticsData.months)
      }
      
      // Update the chart component with new data
      if (modernChartsRef.value && typeof (modernChartsRef.value as any).updateTimeBasedData === 'function') {
        (modernChartsRef.value as any).updateTimeBasedData(periodData)
      }
    } catch (analyticsError) {
      
      // Fallback to old API
      const timeBasedData = await fetchTimeBasedChartData(
        organizationId,
        period as 'weekly' | 'monthly' | 'yearly',
        filters.value
      )

      // Update the chart component with new data
      if (modernChartsRef.value && typeof (modernChartsRef.value as any).updateTimeBasedData === 'function') {
        (modernChartsRef.value as any).updateTimeBasedData(timeBasedData)
      }
    }
  } catch (error) {
    // Handle error silently
  }
}

// Filter states using composable
const { filters, clearFilters, buildFilterPayload } = useFilters()
const { cityOptions, pocOptions, loadPOCFilterData, clearPOCData } = usePOCFilters()
const filterValues = ref({
  deliveryDateFrom: '',
  deliveryDateTo: '',
  orderDateFrom: '',
  orderDateTo: '',
  orderDateRange: { from: '', to: '' },
  deliveryDateRange: { from: '', to: '' },
  city: '',
  poc: ''
})

// Dashboard data with fallback initialization
const initializeDashboardData = () => ({
  totalOrdersPlaced: { count: 0, quantity: 0 },
  totalOrdersDelivered: { count: 0, quantity: 0 },
  totalOrdersRescheduled: { count: 0, quantity: 0 },
  totalOrdersCancelled: { count: 0, quantity: 0 },
  totalPendingOrders: { count: 0, quantity: 0 },
  totalCostSaved: { quantity: '0', amount: '0' }
})

const dashboardData = ref(initializeDashboardData())

// Error state
const error = ref<string | null>(null)
const loading = ref(false)
const chartsLoading = ref(false)
const showErrorPopup = ref(false)
const errorTitle = ref('Error')
const errorMessage = ref('')
const isOfflineMode = ref(false)

// Fallback demo data for offline mode
const getDemoData = () => ({
  totalOrdersPlaced: { count: 25, quantity: 500 },
  totalOrdersDelivered: { count: 20, quantity: 400 },
  totalOrdersRescheduled: { count: 3, quantity: 60 },
  totalOrdersCancelled: { count: 2, quantity: 40 },
  totalPendingOrders: { count: 15, quantity: 300 },
  totalCostSaved: { quantity: '50', amount: '5000' }
})

const pointOfContactStore = usePointOfContactStore()
const { getOrganizationId, watchOrganizationChange, initialize } = useOrganization()
// Analytics data will be handled by existing time-based chart data API



// Get organization ID reactively
const orgId = computed(() => {
  try {
    return getOrganizationId()
  } catch (e) {
    return undefined
  }
})

// Watch for organization changes - will be set up after functions are defined
let unwatchOrganization: (() => void) | null = null

const handleApplyFilters = (appliedFilters: any) => {
  if (appliedFilters.orderDateFrom) {
    filters.value.orderedDateFrom = appliedFilters.orderDateFrom
    filters.value.orderedDateTo = appliedFilters.orderDateTo || appliedFilters.orderDateFrom
    filters.value.deliveredDateFrom = ''
    filters.value.deliveredDateTo = ''
  } else if (appliedFilters.deliveryDateFrom) {
    filters.value.deliveredDateFrom = appliedFilters.deliveryDateFrom
    filters.value.deliveredDateTo = appliedFilters.deliveryDateTo || appliedFilters.deliveryDateFrom
    filters.value.orderedDateFrom = ''
    filters.value.orderedDateTo = ''
  }
  filters.value.selectedCity = appliedFilters.city
  filters.value.selectedPOC = appliedFilters.poc
  
  // Only show donut chart loading, not bar chart
  chartsLoading.value = false
  fetchDashboardData()
}

const handleClearFilters = () => {
  filterValues.value = {
    deliveryDateFrom: '',
    deliveryDateTo: '',
    orderDateFrom: '',
    orderDateTo: '',
    orderDateRange: { from: '', to: '' },
    deliveryDateRange: { from: '', to: '' },
    city: '',
    poc: ''
  }
  clearFilters()
  fetchDashboardData()
}

const hideError = () => {
  showErrorPopup.value = false
  error.value = null
}

const retryDashboardData = () => {
  hideError()
  fetchDashboardData()
}

const showErrorDialog = (title: string, message: string) => {
  errorTitle.value = title
  errorMessage.value = message
  showErrorPopup.value = true
}

// Fetch dashboard data using point of contact API
let isFetchingData = false
const fetchDashboardData = async (skipDefaultDates = false) => {
  if (isFetchingData) {
    return
  }
  
  try {
    isFetchingData = true
    loading.value = true
    chartsLoading.value = true
    error.value = null
    
    // Get organization ID
    const organizationId = getOrganizationId()
    
    if (!organizationId) {
      throw new Error('No organization selected. Please go back and select an organization.')
    }
    

    
    // Use current filter values or defaults
    const tempFilters = { ...filters.value }
    if (!skipDefaultDates && !tempFilters.orderedDateFrom && !tempFilters.deliveredDateFrom) {
      const currentDate = getCurrentDate()
      tempFilters.orderedDateFrom = currentDate
      tempFilters.orderedDateTo = currentDate
      
      // Update filter display to show current date
      filterValues.value.orderDateRange = { from: currentDate, to: currentDate }
    }
    
    // Build filter payload using temp filters
    const filterPayload = {
      org_user_id: [organizationId],
      ...(tempFilters.orderedDateFrom && { order_date_from: tempFilters.orderedDateFrom }),
      ...(tempFilters.orderedDateTo && { order_date_to: tempFilters.orderedDateTo }),
      ...(tempFilters.deliveredDateFrom && { delivery_date_from: tempFilters.deliveredDateFrom }),
      ...(tempFilters.deliveredDateTo && { delivery_date_to: tempFilters.deliveredDateTo }),
      ...(tempFilters.selectedCity && { cities: [tempFilters.selectedCity], city: tempFilters.selectedCity }),
      ...(tempFilters.selectedPOC && { point_of_contact: tempFilters.selectedPOC })
    }
    
    // Fetch dashboard and reschedule data with individual error handling
    let data = null
    let rescheduleData = null
    let dashboardError = null
    let rescheduleError = null
    
    // Call both queries in parallel for better performance
    const [dashboardResult, rescheduleResult] = await Promise.allSettled([
      fetchPointOfContactDashboard(organizationId, filterPayload),
      fetchPointOfContactDashboardReschedule(organizationId, filterPayload)
    ])
    
    // Process dashboard query result
    if (dashboardResult.status === 'fulfilled') {
      data = dashboardResult.value
    } else {
      dashboardError = dashboardResult.reason
    }
    
    // Process reschedule query result
    if (rescheduleResult.status === 'fulfilled') {
      rescheduleData = rescheduleResult.value
    } else {
      rescheduleError = rescheduleResult.reason
    }
    
    // Map the GraphQL response to our dashboard data structure
    dashboardData.value = {
      totalOrdersPlaced: {
        count: data?.order_count || 0,
        quantity: data?.ordered_qty ? Number(data.ordered_qty) : 0
      },
      totalOrdersDelivered: {
        count: data?.delivered_orders || 0,
        quantity: data?.delivered_qty ? Number(data.delivered_qty) : 0
      },
      totalOrdersRescheduled: {
        count: rescheduleData?.rescheduled_count || 0,
        quantity: rescheduleData?.rescheduled_qty ? Number(rescheduleData.rescheduled_qty) : 0
      },
      totalOrdersCancelled: {
        count: data?.cancelled_count || 0,
        quantity: data?.cancelled_qty ? Number(data.cancelled_qty) : 0
      },
      totalPendingOrders: {
        count: data?.pending_orders || data?.planned_orders || 0,
        quantity: data?.pending_qty ? Number(data.pending_qty) : (data?.planned_qty ? Number(data.planned_qty) : 0)
      },
      totalCostSaved: {
        quantity: String(data?.pending_qty ?? data?.planned_qty ?? 0),
        amount: String((data?.pending_orders ?? data?.planned_orders ?? 0) * 100)
      }
    }
    

    
    // Store data if available
    if (data) {
      pointOfContactStore.setDashboardData(data)
    }
    
    // Update charts with real data
    updateChartsWithRealData(data)
    
    // If both queries failed, throw an error
    if (!data && !rescheduleData) {
      const errorMessage = `Both queries failed. Dashboard: ${dashboardError?.message || 'Unknown error'}. Reschedule: ${rescheduleError?.message || 'Unknown error'}`
      throw new Error(errorMessage)
    }
    

    
  } catch (err) {
    console.error('Dashboard data loading error:', err)
    error.value = err instanceof Error ? err.message : String(err)
    
    // Check if it's a network error (CORS, connection issues)
    const isNetworkError = err instanceof Error && 
      (err.message.includes('CORS') || err.message.includes('fetch') || err.message.includes('network'))
    
    if (isNetworkError) {
      isOfflineMode.value = true
      dashboardData.value = getDemoData()
      showErrorDialog('Demo Mode', 'Unable to connect to server. Showing demo data.')
    } else {
      showErrorDialog('Error', err instanceof Error ? err.message : 'Unable to load dashboard data. Please try again.')
      dashboardData.value = initializeDashboardData()
    }
  } finally {
    loading.value = false
    chartsLoading.value = false
    pointOfContactStore.setLoading(false)
    isFetchingData = false
  }
}

// Setup organization watcher after functions are defined
unwatchOrganization = watch(
  orgId,
  (newOrgId, oldOrgId) => {
    // Skip if no organization ID
    if (!newOrgId) {
      return
    }
    
    // Fetch data on initial load (when oldOrgId is undefined) or when organization changes
    if (!oldOrgId || (oldOrgId !== newOrgId)) {
      if (oldOrgId && oldOrgId !== newOrgId) {
        // Reset filters to default when organization changes
        const currentDate = getCurrentDate()
        filterValues.value = {
          deliveryDateFrom: '',
          deliveryDateTo: '',
          orderDateFrom: '',
          orderDateTo: '',
          orderDateRange: { from: currentDate, to: currentDate },
          deliveryDateRange: { from: '', to: '' },
          city: '',
          poc: ''
        }
        clearFilters()
        clearPOCData()
        // Force chart re-render for new organization
        chartKey.value++
        // Load dashboard data and POC filters in parallel when organization changes
        Promise.all([
          fetchDashboardData(),
          loadPOCFilterData()
        ]).catch(() => {})
      } else {
        // Load dashboard data and POC filters in parallel on initial load
        Promise.all([
          fetchDashboardData(),
          loadPOCFilterData()
        ]).catch(() => {})
      }
    }
  },
  { immediate: true }
)

// Setup cleanup handlers before any async operations
let refreshInterval: NodeJS.Timeout | null = null

// Cleanup watcher and interval on unmount
onUnmounted(() => {
  if (unwatchOrganization) {
    unwatchOrganization()
  }
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})

onMounted(async () => {
  // Initialize with current date as default
  const currentDate = getCurrentDate()
  filterValues.value = {
    deliveryDateFrom: '',
    deliveryDateTo: '',
    orderDateFrom: '',
    orderDateTo: '',
    orderDateRange: { from: currentDate, to: currentDate },
    deliveryDateRange: { from: '', to: '' },
    city: '',
    poc: ''
  }
  
  // Update last updated time
  updateLastUpdatedTime()
  
  // Set loaded state with delay
  const fromSelectUser = router.options.history.state.back === '/select-user'
  setTimeout(() => {
    isLoaded.value = true
  }, fromSelectUser ? 500 : 100)
  
  // Wait for next tick to ensure DOM is ready
  await nextTick()
  
  // Initialize organization store and load POC filter data in parallel
  try {
    await Promise.all([
      initialize(),
      loadPOCFilterData()
    ])
  } catch (e) {
    // Handle error silently
  }
  
  // Auto-refresh every 5 minutes
  refreshInterval = setInterval(() => {
    updateLastUpdatedTime()
    if (!isFetchingData && !loading.value) {
      fetchDashboardData()
    }
  }, 300000)
})
</script>

<style scoped>
  /* All CSS has been moved to DashboardPage.css */
  @import './DashboardPage.css';
</style>
