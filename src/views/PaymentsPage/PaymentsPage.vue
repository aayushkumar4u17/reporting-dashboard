<template>
  <div class="payments-page">
    <div class="payments-container">
      
      <!-- Dashboard Header -->
      <div class="dashboard-header">
        <!-- Wallet Balance Card -->
        <div class="wallet-card premium-wallet">
          <div class="wallet-chip-icon">💳</div>
          <div class="wallet-brand">
            <div class="brand-accent"></div>
            <span class="brand-text">Wallet Balance</span>
          </div>
          <div class="wallet-amount-large">{{ summaryData.availableBalance }}</div>
          <div class="wallet-actions">
            <AnimatedButton variant="primary" size="small" class="glow-btn">Add Money</AnimatedButton>
            <span class="wallet-hint">Available Balance</span>
          </div>
        </div>

        <!-- Overview Cards -->
        <div class="overview-cards">
          <div class="overview-card premium-card danger">
            <div class="card-icon">⚠️</div>
            <div class="oc-title">Overdue Amount</div>
            <div class="oc-subtitle">Past-due</div>
            <div class="oc-value" style="color: #dc3545;">{{ summaryData.totalOverdue }}</div>
          </div>
          <div class="overview-card premium-card warning">
            <div class="card-icon">💰</div>
            <div class="oc-title">Outstanding Amount</div>
            <div class="oc-subtitle">Balance</div>
            <div class="oc-value" style="color: #f59e0b;">{{ summaryData.totalOutstanding }}</div>
          </div>
          <div class="overview-card premium-card info">
            <div class="card-icon">💳</div>
            <div class="oc-title">Credit Limit</div>
            <div class="oc-subtitle">Maximum</div>
            <div class="oc-value" style="color: #3b82f6;">{{ summaryData.creditLimit }}</div>
          </div>
          <div class="overview-card premium-card success">
            <div class="card-icon">✅</div>
            <div class="oc-title">Remaining Limit</div>
            <div class="oc-subtitle">Available</div>
            <div class="oc-value" style="color: #10b981;">{{ summaryData.availableBalance }}</div>
          </div>
        </div>

        <!-- Bank Details Card -->
        <div class="bank-details-card premium-bank">
          <div class="bank-header">🏦 Bank Details</div>
          <div class="bank-info">
            <div class="bank-row"><span class="label">A/C:</span> <span class="masked">XXXX1234</span></div>
            <div class="bank-row"><span class="label">IFSC:</span> <span class="masked">SBIN0001234</span></div>
            <div class="bank-row"><span class="label">Bank:</span> State Bank of India</div>
            <div class="bank-row"><span class="label">Beneficiary:</span> FuelBuddy Ltd.</div>
          </div>
        </div>
      </div>

      <!-- Table Topbar -->
      <div class="table-topbar premium-topbar">
        <div class="tabs premium-tabs">
          <div 
            v-for="tab in tabs" 
            :key="tab.key" 
            :class="['tab premium-tab', { active: activeTab === tab.key }]"
            @click="activeTab = tab.key"
          >
            {{ tab.label }}
          </div>
        </div>
        <div class="topbar-right">
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="🔍 Search customers..." 
            class="search-input premium-search"
          />
          <AnimatedButton variant="success" size="small" @click="handleSummaryAction('payOutstanding')">
            Pay Outstanding
          </AnimatedButton>
          <AnimatedButton variant="warning" size="small" @click="handleSummaryAction('payOverdue')">
            Pay Overdue
          </AnimatedButton>
          <AnimatedButton variant="primary" size="small" @click="downloadPayments">
            📄 Export PDF
          </AnimatedButton>
        </div>
      </div>

      <!-- Data Table -->
      <div class="premium-table-wrapper">
        <DataTable
          :columns="paymentColumns"
          :data="filteredRows"
          :loading="loading"
          :show-checkbox="true"
          @selection-change="handleSelectionChange"
        >
        <template #cell-creditLimit="{ value }">
          {{ formatCurrency(value) }}
        </template>
        <template #cell-outstandingAmount="{ value }">
          {{ formatCurrency(value) }}
        </template>
        <template #cell-overdueAmount="{ value }">
          {{ formatCurrency(value) }}
        </template>
        <template #cell-allowedCreditBreach="{ value }">
          <span :class="['status-badge', value === 'Y' ? 'status-allowed' : 'status-not-allowed']">
            {{ value === 'Y' ? 'Allowed' : 'Not Allowed' }}
          </span>
        </template>
        </DataTable>
      </div>
    </div>

    <!-- No Data Popup -->
    <div v-if="showNoDataPopup" class="popup-overlay" @click="showNoDataPopup = false">
      <div class="popup-content" @click.stop>
        <h3>No Data Found</h3>
        <p>No data available to download</p>
        <AnimatedButton @click="showNoDataPopup = false" variant="primary" size="small">
          OK
        </AnimatedButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import DataTable from '@/components/ui/DataTable.vue'
import AnimatedButton from '@/components/layout/AnimatedButton.vue'
import { useOrganization } from '@/composables/useOrganization'
import { fetchPointOfContactPaymentReport, mapPaymentData, calculateSummary } from '@/api/pointOfContactPaymentReport'
import { generatePaymentsPDF } from '@/utils/pdfGenerator'

// State
const loading = ref(true)
const showNoDataPopup = ref(false)
const searchQuery = ref('')
const activeTab = ref('all')
const payments = ref([])

const { getOrganizationId, watchOrganizationChange } = useOrganization()
let unwatchOrganization = null

// Tabs
const tabs = [
  { key: 'all', label: 'All' },
  { key: 'inProgress', label: 'In Progress' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'cancelled', label: 'Cancelled' }
]

// Table columns
const paymentColumns = [
  { key: 'customerId', label: 'Customer ID' },
  { key: 'customerName', label: 'Customer Name' },
  { key: 'creditLimit', label: 'Credit Limit', type: 'currency' },
  { key: 'outstandingAmount', label: 'Outstanding Amount', type: 'currency' },
  { key: 'overdueAmount', label: 'Overdue Amount', type: 'currency' },
  { key: 'allowedCreditBreach', label: 'Credit Breach', type: 'status' }
]

// Summary data
const summaryData = ref({
  creditLimit: '₹ 0',
  availableBalance: '₹ 0',
  totalOutstanding: '₹ 0',
  totalOverdue: '₹ 0'
})

// Filtered rows
const filteredRows = computed(() => {
  let filtered = payments.value
  
  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(row => 
      row.customerId?.toLowerCase().includes(query) ||
      row.customerName?.toLowerCase().includes(query)
    )
  }
  
  // Tab filter (placeholder - adapt to your data structure)
  if (activeTab.value !== 'all') {
    // Example: filtered = filtered.filter(row => row.status === activeTab.value)
  }
  
  return filtered
})

const loadData = async () => {
  try {
    loading.value = true
    const organizationId = getOrganizationId()
    
    if (!organizationId) {
      console.warn('No organization selected')
      return
    }
    
    const rawData = await fetchPointOfContactPaymentReport(organizationId, {})
    payments.value = mapPaymentData(rawData)
    summaryData.value = calculateSummary(rawData)
  } catch (error) {
    console.error('Error loading payment data:', error)
  } finally {
    loading.value = false
  }
}

const handleSelectionChange = (selectedItems) => {
  console.log('Selected items:', selectedItems)
}

const handleSummaryAction = (actionKey) => {
  console.log(`${actionKey} clicked`)
}

const formatCurrency = (amount) => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0
  }).format(numAmount || 0)
}

const downloadPayments = () => {
  if (filteredRows.value.length === 0) {
    showNoDataPopup.value = true
    return
  }
  const selectedPayments = filteredRows.value.filter(payment => payment.selected)
  const hasSelection = selectedPayments.length > 0
  generatePaymentsPDF(filteredRows.value, hasSelection)
}

onMounted(() => {
  loadData()
  unwatchOrganization = watchOrganizationChange((newOrgId, oldOrgId) => {
    if (newOrgId && newOrgId !== oldOrgId) {
      loadData()
    }
  })
})

onUnmounted(() => {
  if (unwatchOrganization) unwatchOrganization()
})
</script>

<style scoped>
  /* All CSS has been moved to PaymentsPage.css */
  @import './PaymentsPage.css';

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
</style>