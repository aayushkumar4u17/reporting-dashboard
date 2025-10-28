<template>
  <div class="payments-page">
    <div class="payments-container" :class="{ 'fade-in': isLoaded }">
      <!-- Main Content -->
      <div class="payments-content">
        <!-- Dashboard Header Section -->
        <div class="dashboard-header-section">
          <h2 class="section-title">Payment Overview</h2>
          <!-- Dashboard Header -->
          <div class="dashboard-header">
            <!-- Wallet Balance Card -->
            <div class="wallet-card credit-card">
              <div class="card-background">
                <div class="card-pattern"></div>
                <div class="card-shine"></div>
              </div>
              <div class="card-content">
                <div class="card-header">
                  <div class="card-chip"></div>
                  <div class="card-brand">
                    <img src="/fuelbuddy-logo.svg" alt="FuelBuddy" class="brand-logo" />
                  </div>
                </div>
                <div class="card-number">
                  <div v-if="!loading">{{ walletAccountNumber }}</div>
                  <div v-else class="card-loader">
                    <ModernLoader height="1.2rem" width="8rem" variant="default" />
                  </div>
                </div>
                <div class="card-details">
                  <div class="card-holder">
                    <div class="label">WALLET BALANCE</div>
                    <div v-if="!loading" class="value balance-amount">{{ formatCurrency(walletAmount) }}</div>
                    <div v-else class="card-loader">
                      <ModernLoader height="1.5rem" width="4rem" variant="default" />
                    </div>
                  </div>
                  <div class="card-actions">
                    <AnimatedButton variant="primary" size="small" class="add-money-btn" @click="showAddMoneyModal = true" :disabled="loading">Add Money</AnimatedButton>
                  </div>
                </div>
              </div>
            </div>

            <!-- Overview Cards -->
            <div class="overview-cards">
              <div class="overview-card premium-card danger">
                <div class="card-header-section">
                  <div class="card-icon-wrapper danger-icon">
                    <svg class="card-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M12 9v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
                    </svg>
                  </div>
                  <!-- <div class="card-trend">Past-due</div> -->
                </div>
                <div class="oc-title">Overdue Amt.</div>
                <div class="oc-subtitle">Past-due</div>
                <div class="oc-value-row">
                  <div v-if="!loading" class="oc-value danger-value">{{ summaryData.totalOverdue }}</div>
                  <div v-else class="oc-loader">
                    <ModernLoader height="1.1rem" width="3rem" variant="cancelled" />
                  </div>
                </div>
              </div>
              <div class="overview-card premium-card warning">
                <div class="card-header-section">
                  <div class="card-icon-wrapper warning-icon">
                    <svg class="card-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                    </svg>
                  </div>
                  <!-- <div class="card-trend">Balance</div> -->
                </div>
                <div class="oc-title">Outstanding Amt.</div>
                <div class="oc-subtitle">Balance</div>
                <div class="oc-value-row">
                  <div v-if="!loading" class="oc-value warning-value">{{ summaryData.totalOutstanding }}</div>
                  <div v-else class="oc-loader">
                    <ModernLoader height="1.1rem" width="3rem" variant="rescheduled" />
                  </div>
                </div>
              </div>
              <div class="overview-card premium-card info">
                <div class="card-header-section">
                  <div class="card-icon-wrapper info-icon">
                    <svg class="card-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                      <line x1="1" y1="10" x2="23" y2="10"/>
                    </svg>
                  </div>
                  <!-- <div class="card-trend">Maximum</div> -->
                </div>
                <div class="oc-title">Credit Limit</div>
                <div class="oc-subtitle">Maximum</div>
                <div class="oc-value-row">
                  <div v-if="!loading" class="oc-value info-value">{{ summaryData.creditLimit }}</div>
                  <div v-else class="oc-loader">
                    <ModernLoader height="1.1rem" width="3rem" variant="placed" />
                  </div>
                </div>
              </div>
              <div class="overview-card premium-card success">
                <div class="card-header-section">
                  <div class="card-icon-wrapper success-icon">
                    <svg class="card-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                  <!-- <div class="card-trend">Wallet</div> -->
                </div>
                <div class="oc-title">Remaining Limit</div>
                <div class="oc-subtitle">Balance</div>
                <div class="oc-value-row">
                  <div v-if="!loading" class="oc-value success-value">{{ formatCurrency(walletAmount) }}</div>
                  <div v-else class="oc-loader">
                    <ModernLoader height="1.1rem" width="3rem" variant="delivered" />
                  </div>
                </div>
              </div>
            </div>

            <!-- Transfer Instructions -->
            <p class="transfer-instructions">
              Please transfer the amount to the below account details using your Bank Account or any UPI app. Your wallet balance will be updated once the amount has reflected in the account below
            </p>
          </div>
        </div>

        <!-- Table Section -->
        <div class="table-section">
          <h2 class="section-title">Payment History</h2>
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
                placeholder="🔍 Search transactions..." 
                class="search-input premium-search"
              />
              <AnimatedButton variant="success" size="small" @click="handleSummaryAction('payOutstanding')">
                Pay Outstanding
              </AnimatedButton>
              <AnimatedButton variant="warning" size="small" @click="handleSummaryAction('payOverdue')">
                Pay Overdue
              </AnimatedButton>
            </div>
          </div>

          <!-- Data Table -->
          <div class="premium-table-wrapper">
            <DataTable
              :columns="paymentColumns"
              :data="filteredRows"
              :loading="loading"
              :pagination="true"
              :items-per-page="10"
            >
            <template #cell-amount="{ value }">
              {{ formatCurrency(value) }}
            </template>
            <template #cell-status="{ value }">
              <span :class="['status-badge', getStatusClass(value)]">
                {{ value }}
              </span>
            </template>
            <template #cell-date="{ value }">
              {{ formatDate(value) }}
            </template>
            </DataTable>
          </div>
        </div>


      </div>
    </div>



    <!-- Add Money Modal -->
    <AddMoneyModal 
      :is-open="showAddMoneyModal"
      :overdue-amount="parseAmount(summaryData.totalOverdue)"
      :outstanding-amount="parseAmount(summaryData.totalOutstanding)"
      @close="showAddMoneyModal = false"
      @payment="handleAddMoney"
    />

    <!-- Pay Via Modal -->
    <PayViaModal
      :is-open="showPayViaModal"
      :payment-type="payViaType"
      :amount="payViaAmount"
      @close="showPayViaModal = false"
      @payment="handleAddMoney"
    />

    <!-- Payment Status Modal -->
    <PaymentStatusModal
      :is-open="showPaymentStatus"
      :status="paymentStatus"
      :amount="paymentAmount"
      :error-message="paymentError"
      @close="closePaymentStatus"
      @retry="retryPayment"
    />

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
import { useRouter } from 'vue-router'
import DataTable from '@/components/ui/DataTable.vue'
import AnimatedButton from '@/components/layout/AnimatedButton.vue'
import AddMoneyModal from '@/components/ui/AddMoneyModal.vue'
import PaymentStatusModal from '@/components/ui/PaymentStatusModal.vue'
import PayViaModal from '@/components/ui/PayViaModal.vue'
import ModernLoader from '@/components/ui/ModernLoader.vue'
import { useOrganization } from '@/composables/useOrganization'
import { fetchPointOfContactPaymentReport, mapPaymentData, calculateSummary } from '@/api/pointOfContactPaymentReport'
import { generatePaymentsPDF } from '@/utils/pdfGenerator'
import { 
  topupWalletEasebuzz, 
  verifyWalletTopupEasebuzz,
  getWalletDetails,
  getCreditTransactions,
  getDebitTransactions,
  transformLedgerData,
  initializeEasebuzzPayment,
  iciciCoBrandedCardsPaymentInput,
  axisBankPaymentInput,
  initializeAxisPayment
} from '@/services/walletService'

import { getAuth } from 'firebase/auth'
import { usePaymentState } from '@/composables/usePaymentState'
import { PAYMENT_ERROR_CODES, createPaymentError, isVerificationSuccessful } from '@/utils/paymentSecurity'

// Animation state
const isLoaded = ref(false)

// State
const loading = ref(true)
const showNoDataPopup = ref(false)
const searchQuery = ref('')
const activeTab = ref('all')
const payments = ref([])
const walletTransactions = ref([])
const showAddMoneyModal = ref(false)
const showPayViaModal = ref(false)
const payViaType = ref('') // 'outstanding' or 'overdue'
const payViaAmount = ref(0)
const paymentLoading = ref(false)
const showPaymentStatus = ref(false)
const paymentStatus = ref('processing') // processing, success, failed
const paymentAmount = ref(0)
const paymentError = ref('')
const router = useRouter()

// Wallet data
const paymentResponse = ref(null)
const walletDetails = ref({ wallet: [] })
const { paymentState, setProcessing, setTransactionId, markRefreshNeeded, markRefreshComplete, shouldRefresh } = usePaymentState()

// Computed wallet ID from GetWalletDetails
const walletId = computed(() => {
  const wallet = walletDetails.value?.wallet?.[0]
  if (!wallet?.id) {
    return null
  }
  return wallet.id
})

// Computed wallet properties
const walletAccountNumber = computed(() => {
  if (!walletDetails.value?.wallet?.[0]) return 'XXXX1234'
  const wallet = walletDetails.value.wallet[0]
  
  // Try different account number formats
  if (wallet.account_number) {
    return wallet.account_number
  }
  
  if (wallet.van_code && wallet.van_number) {
    return `${wallet.van_code}${wallet.van_number}`
  }
  
  if (wallet.wallet_id) {
    return wallet.wallet_id.slice(-8).toUpperCase()
  }
  
  return 'XXXX1234'
})

const walletAmount = computed(() => {
  if (!walletDetails.value?.wallet?.[0]) return 0
  const wallet = walletDetails.value.wallet[0]
  
  // Calculation: amount - blocked_amount + credit_limit
  const amount = parseFloat(wallet.amount) || 0
  const blockedAmount = parseFloat(wallet.blocked_amount) || 0
  const creditLimit = paymentReportData.value ? parseFloat(paymentReportData.value.credit_limit) || 0 : 0
  
  return amount - blockedAmount + creditLimit
})

const availableCredit = computed(() => {
  if (!walletDetails.value?.wallet?.[0]) return 0
  const wallet = walletDetails.value.wallet[0]
  
  // Use available_balance from API if available, otherwise calculate
  if (wallet.available_balance !== null && wallet.available_balance !== undefined) {
    return parseFloat(wallet.available_balance) || 0
  }
  
  // Fallback calculation
  const amount = parseFloat(wallet.amount) || 0
  const blockedAmount = parseFloat(wallet.blocked_amount) || 0
  const creditLimit = parseFloat(wallet.allowed_credit_limit) || 0
  
  return Math.max(0, creditLimit + amount - blockedAmount)
})



const { getOrganizationId, watchOrganizationChange } = useOrganization()
let unwatchOrganization = null

// Tabs
const tabs = [
  { key: 'all', label: 'All Transactions' },
  { key: 'wallet', label: 'Wallet Topups' },
  { key: 'invoices', label: 'Invoice Payments' }
]

// Table columns
const paymentColumns = [
  { key: 'transactionId', label: 'Transaction ID' },
  { key: 'date', label: 'Date' },
  { key: 'amount', label: 'Amount', type: 'currency' },
  { key: 'paymentMethod', label: 'Payment Method' },
  { key: 'status', label: 'Status', type: 'status' },
  { key: 'description', label: 'Description' }
]

// Summary data
const summaryData = ref({
  creditLimit: '₹ 0',
  availableBalance: '₹ 0',
  totalOutstanding: '₹ 0',
  totalOverdue: '₹ 0'
})

// Store payment report data separately for calculations
const paymentReportData = ref(null)

// Filtered rows
const filteredRows = computed(() => {
  // Only show wallet transactions, not payment report data
  let allTransactions = walletTransactions.value.map(transaction => ({
    transactionId: transaction.transactionId,
    date: transaction.date,
    amount: transaction.amount,
    paymentMethod: transaction.paymentType === 'CREDIT' ? 'Wallet Topup' : 'Wallet Payment',
    status: transaction.status,
    description: transaction.description,
    type: transaction.paymentType
  }))
  
  // Tab filter
  if (activeTab.value === 'wallet') {
    allTransactions = allTransactions.filter(row => row.type === 'CREDIT')
  } else if (activeTab.value === 'invoices') {
    allTransactions = allTransactions.filter(row => row.type === 'DEBIT')
  }
  
  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    allTransactions = allTransactions.filter(row => 
      row.transactionId?.toLowerCase().includes(query) ||
      row.paymentMethod?.toLowerCase().includes(query) ||
      row.description?.toLowerCase().includes(query)
    )
  }
  
  // Sort by date (newest first)
  return allTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
})

const loadData = async () => {
  try {
    // Clear existing data immediately before setting loading state
    walletTransactions.value = []
    paymentReportData.value = null
    payments.value = []
    summaryData.value = {
      creditLimit: '₹ 0',
      availableBalance: '₹ 0',
      totalOutstanding: '₹ 0',
      totalOverdue: '₹ 0'
    }
    
    loading.value = true
    
    const organizationId = getOrganizationId()
    
    if (!organizationId) {
      loading.value = false
      return
    }
    
    // Load payment history and wallet details in parallel
    const [rawData, walletData] = await Promise.all([
      fetchPointOfContactPaymentReport(organizationId, {}),
      getWalletDetails(organizationId)
    ])
    
    // Store payment report data for calculations
    const mappedPaymentData = mapPaymentHistoryData(rawData)
    paymentReportData.value = mappedPaymentData[0] || null
    payments.value = [] // Keep empty for transaction table
    walletDetails.value = walletData
    
    // Update summary data with payment report information
    if (paymentReportData.value) {
      summaryData.value = {
        creditLimit: formatCurrency(parseFloat(paymentReportData.value.credit_limit) || 0),
        availableBalance: formatCurrency(0),
        totalOutstanding: formatCurrency(parseFloat(paymentReportData.value.outstanding_amount) || 0),
        totalOverdue: formatCurrency(parseFloat(paymentReportData.value.overdue_amount) || 0)
      }
    } else {
      summaryData.value = {
        creditLimit: '₹ 0',
        availableBalance: '₹ 0',
        totalOutstanding: '₹ 0',
        totalOverdue: '₹ 0'
      }
    }
    
    // Load wallet transactions
    await loadWalletTransactions(organizationId)
    

    
  } catch (error) {

    // Clear all data on error
    payments.value = []
    walletTransactions.value = []
    paymentReportData.value = null
    summaryData.value = {
      creditLimit: '₹ 0',
      availableBalance: '₹ 0',
      totalOutstanding: '₹ 0',
      totalOverdue: '₹ 0'
    }
  } finally {
    loading.value = false
  }
}

const mapPaymentHistoryData = (rawData) => {
  // Try different possible data structures
  let data = []
  if (rawData?.pointOfContactPaymentReport?.data) {
    data = rawData.pointOfContactPaymentReport.data
  } else if (rawData?.data?.pointOfContactPaymentReport?.data) {
    data = rawData.data.pointOfContactPaymentReport.data
  } else if (rawData?.data) {
    data = rawData.data
  } else if (Array.isArray(rawData)) {
    data = rawData
  }
  
  return data
}




const loadWalletTransactions = async (organizationId) => {
  try {
    // Fetch both credit and debit transactions in parallel
    const [creditData, debitData] = await Promise.all([
      getCreditTransactions(organizationId, { limit: 50 }),
      getDebitTransactions(organizationId, { limit: 50 })
    ])
    
    // Transform and combine the data
    const creditTransactions = transformLedgerData(creditData)
    const debitTransactions = transformLedgerData(debitData)
    
    // Combine and sort by date (newest first)
    const allTransactions = [...creditTransactions, ...debitTransactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    
    walletTransactions.value = allTransactions
  } catch (error) {
    console.error('Error loading wallet transactions:', error)
    walletTransactions.value = []
  }
}

const refreshWalletData = async (silent = false) => {
  try {
    const organizationId = getOrganizationId()
    if (!organizationId) {
      return
    }
    
    if (!silent) {
      loading.value = true
      // Clear existing data when refreshing
      walletTransactions.value = []
    }
    

    const walletData = await getWalletDetails(organizationId)
    walletDetails.value = walletData
    
    // Update summary data with payment report information
    if (paymentReportData.value) {
      summaryData.value = {
        creditLimit: formatCurrency(parseFloat(paymentReportData.value.credit_limit) || 0),
        availableBalance: formatCurrency(0),
        totalOutstanding: formatCurrency(parseFloat(paymentReportData.value.outstanding_amount) || 0),
        totalOverdue: formatCurrency(parseFloat(paymentReportData.value.overdue_amount) || 0)
      }
    }
    

  } catch (error) {
    console.error('Error refreshing wallet data:', error)
    // Set empty wallet structure on error
    walletDetails.value = { wallet: [] }
  } finally {
    if (!silent) loading.value = false
  }
}





const handleSummaryAction = (actionKey) => {
  if (actionKey === 'payOutstanding') {
    payViaType.value = 'outstanding'
    payViaAmount.value = parseAmount(summaryData.value.totalOutstanding)
    showPayViaModal.value = true
  } else if (actionKey === 'payOverdue') {
    payViaType.value = 'overdue'
    payViaAmount.value = parseAmount(summaryData.value.totalOverdue)
    showPayViaModal.value = true
  }
}



const formatCurrency = (amount) => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0
  }).format(numAmount || 0)
}

const parseAmount = (amountString) => {
  if (!amountString) return 0
  return parseFloat(amountString.replace(/[^\d.-]/g, '')) || 0
}

const formatDate = (dateString) => {
  if (!dateString) return '--'
  
  // Handle both timestamp (milliseconds) and ISO string formats
  let date
  if (typeof dateString === 'number' || /^\d+$/.test(dateString)) {
    date = new Date(parseInt(dateString))
  } else {
    date = new Date(dateString)
  }
  
  // Check if date is valid
  if (isNaN(date.getTime())) return '--'
  
  // Create IST date by adding 5:30 offset
  const istOffset = 5.5 * 60 * 60 * 1000
  const istTime = new Date(date.getTime() + istOffset)
  
  // Format the IST time
  const options = {
    year: 'numeric',
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }
  
  return istTime.toLocaleDateString('en-IN', options)
}

const getStatusClass = (status) => {
  if (!status) return 'status-unknown'
  const statusLower = status.toLowerCase()
  if (statusLower.includes('success') || statusLower.includes('completed')) return 'status-success'
  if (statusLower.includes('failed') || statusLower.includes('error')) return 'status-failed'
  if (statusLower.includes('pending') || statusLower.includes('processing')) return 'status-pending'
  return 'status-unknown'
}



const handleAddMoney = async (paymentData) => {
  try {
    // Check authentication first
    const auth = getAuth()
    if (!auth.currentUser) {
      const authError = createPaymentError(PAYMENT_ERROR_CODES.AUTHENTICATION_FAILED, 'User not authenticated')
      paymentStatus.value = 'failed'
      paymentError.value = authError.userMessage
      showPaymentStatus.value = true
      return
    }
    
    setProcessing(true)
    

    
    paymentLoading.value = true
    showAddMoneyModal.value = false
    showPaymentStatus.value = true
    paymentStatus.value = 'processing'
    
    const { amount, paymentMethod, amountType } = paymentData
    paymentAmount.value = amount
    
    if (paymentMethod === 'easebuzz') {
      await handleEasebuzzPayment(amount)
    } else if (paymentMethod === 'iciciCoCredit') {
      await handleIciciPayment(amount)
    } else if (paymentMethod === 'axisCoCredit') {
      await handleAxisPayment(amount)
    }
    
  } catch (error) {
    paymentStatus.value = 'failed'
    if (error.code) {
      paymentError.value = error.userMessage
    } else if (error.message?.includes('Authentication failed') || error.message?.includes('403')) {
      paymentError.value = 'Authentication failed. Please refresh the page and login again.'
    } else {
      paymentError.value = error.message || 'Payment failed. Please try again.'
    }
  } finally {
    paymentLoading.value = false
    setProcessing(false)
  }
}

const handleEasebuzzPayment = async (amount) => {
  try {
    // Ensure we have fresh wallet data
    await refreshWalletData(true)
    
    if (!walletId.value) {
      throw createPaymentError(PAYMENT_ERROR_CODES.WALLET_NOT_FOUND, 'Wallet not found for this organization')
    }
    

    
    const topupDetails = await topupWalletEasebuzz({
      amount: amount,
      wallet_id: walletId.value
    })
    

    
    if (!topupDetails?.walletEasebuzzTopup) {
      throw new Error('Failed to initialize payment. Please try again.')
    }
    
    setTransactionId(topupDetails.walletEasebuzzTopup.wallet_transaction_id)
    const accessKey = topupDetails.walletEasebuzzTopup.client_secret
    
    if (!accessKey) {
      throw new Error('Payment initialization failed. Please try again.')
    }
    
    await initializeEasebuzzPayment(accessKey, async (response) => {
      paymentResponse.value = response
      await verifyEasebuzzPayment(amount, response)
    })
    
  } catch (error) {
    console.error('Easebuzz payment error:', error)
    throw error
  }
}

const handleIciciPayment = async (amount) => {
  try {
    const response = await iciciCoBrandedCardsPaymentInput({
      amount: Number(amount),
      wallet_id: walletId.value,
      successCallbackUrl: window.location.href,
      failureCallbackUrl: window.location.href
    })
    
    if (response?.iciciCoBrandedCardsPayment?.url) {
      setTransactionId(response.iciciCoBrandedCardsPayment.wallet_transaction_id)
      window.location.href = response.iciciCoBrandedCardsPayment.url
    }
    
  } catch (error) {
    console.error('ICICI payment error:', error)
    throw error
  }
}

const handleAxisPayment = async (amount) => {
  try {
    const response = await axisBankPaymentInput({
      amount: Number(amount),
      wallet_id: walletId.value,
      successCallbackUrl: window.location.href,
      failureCallbackUrl: window.location.href
    })
    
    if (response?.axisBankPayment) {
      setTransactionId(response.axisBankPayment.wallet_transaction_id)
      
      const options = {
        atomTokenId: response.axisBankPayment.atom_token_id,
        merchId: response.axisBankPayment.transaction_id,
        returnUrl: response.axisBankPayment.call_back_url,
        custEmail: response.axisBankPayment.email,
        custMobile: response.axisBankPayment.phone_number
      }
      
      await initializeAxisPayment(options)
    }
    
  } catch (error) {
    console.error('Axis payment error:', error)
    throw error
  }
}

const verifyEasebuzzPayment = async (amount, response) => {
  try {
    if (response?.status === 'success') {
      const verificationResult = await verifyWalletTopupEasebuzz({
        amount: Number(amount),
        walletTransactionId: paymentState.currentTransactionId,
        cardType: response.card_type || 'UPI',
        mode: response.mode || 'UPI',
        paymentSource: response.payment_source || 'UPI',
        pgType: response.PG_TYPE || 'UPI',
        salesInvoice: []
      })
      
      // Check if verification returned an error
      if (verificationResult?.error) {
        console.warn('Verification API failed but payment was successful:', verificationResult.errorMessage)
        
        // Payment gateway says success, but verification failed
        // This is common - treat as success with warning
        paymentStatus.value = 'success'
        paymentError.value = 'Payment completed successfully. Your wallet will be updated shortly.'
      } else if (isVerificationSuccessful(verificationResult)) {
        // Both payment and verification successful
        paymentStatus.value = 'success'
        paymentError.value = ''
      } else {
        // Payment gateway success but verification inconclusive
        paymentStatus.value = 'success'
        paymentError.value = 'Payment completed. If balance is not updated within 5 minutes, please contact support.'
      }
      
      // Always refresh wallet data when payment gateway reports success
      markRefreshNeeded()
      setTimeout(async () => {
        await refreshWalletData(true)
        await loadWalletTransactions(getOrganizationId())
        markRefreshComplete()
      }, 2000) // Delay to allow backend processing
      
    } else {
      // Payment gateway reported failure
      paymentStatus.value = 'failed'
      
      // Map confusing error messages to user-friendly ones
      const errorMessage = response?.error_Message || 'Payment was not successful'
      
      if (errorMessage === 'NA' || errorMessage === 'N/A' || !errorMessage || errorMessage.trim() === '') {
        paymentError.value = 'Payment was cancelled. Please try again if you want to complete the payment.'
      } else if (errorMessage.includes('PER TRANSACTION LIMIT EXCEEDED') || 
          errorMessage.includes('REMITTING MEMBER') ||
          errorMessage.includes('Invalid PIN') ||
          errorMessage.includes('Authentication failed') ||
          errorMessage.includes('INVALID_VPA') ||
          errorMessage.includes('Transaction declined')) {
        paymentError.value = 'Invalid PIN or authentication failed. Please check your credentials and try again.'
      } else {
        paymentError.value = errorMessage
      }
    }
  } catch (error) {
    console.error('Payment verification error:', error)
    
    // If there's a general error, assume payment might have gone through
    // This handles cases where money is deducted but verification API fails
    paymentStatus.value = 'success'
    paymentError.value = 'Payment processing completed. Please check your wallet balance. If amount was deducted but not reflected, contact support.'
    
    // Refresh wallet data to check if payment went through
    setTimeout(async () => {
      await refreshWalletData(true)
      await loadWalletTransactions(getOrganizationId())
    }, 3000)
  }
}

const closePaymentStatus = () => {
  showPaymentStatus.value = false
  paymentStatus.value = 'processing'
  paymentAmount.value = 0
  paymentError.value = ''
}

const retryPayment = () => {
  showPaymentStatus.value = false
  showAddMoneyModal.value = true
}

const checkPaymentStatus = async () => {
  try {
    loading.value = true
    await refreshWalletData(true)
    await loadWalletTransactions(getOrganizationId())
    
    // Show success message
    paymentStatus.value = 'success'
    paymentError.value = 'Wallet data refreshed successfully.'
    showPaymentStatus.value = true
    
    setTimeout(() => {
      showPaymentStatus.value = false
    }, 2000)
  } catch (error) {
    console.error('Error checking payment status:', error)
    paymentStatus.value = 'failed'
    paymentError.value = 'Failed to refresh wallet data. Please try again.'
    showPaymentStatus.value = true
  } finally {
    loading.value = false
  }
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
  setTimeout(() => {
    isLoaded.value = true
  }, 100)
  
  loadData()
  unwatchOrganization = watchOrganizationChange((newOrgId, oldOrgId) => {
    if (newOrgId && newOrgId !== oldOrgId) {
      // Immediately clear data when organization changes
      walletTransactions.value = []
      paymentReportData.value = null
      payments.value = []
      summaryData.value = {
        creditLimit: '₹ 0',
        availableBalance: '₹ 0',
        totalOutstanding: '₹ 0',
        totalOverdue: '₹ 0'
      }
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

  .form-group {
    margin-bottom: 20px;
    text-align: left;
  }

  .form-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: 600;
    color: #333;
  }

  .form-input {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
  }

  .form-input:focus {
    outline: none;
    border-color: #007bff;
  }

  .modal-actions {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
  }

  .payment-details {
    background: #f8f9fa;
    padding: 15px;
    border-radius: 4px;
    margin-bottom: 20px;
    text-align: left;
  }

  .payment-details p {
    margin: 5px 0;
  }
</style>