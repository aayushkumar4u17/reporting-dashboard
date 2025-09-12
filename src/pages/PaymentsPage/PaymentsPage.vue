<template>
  <div class="payments-page">
    <!-- Debug: Simple test content -->
    <!-- <div style="background: red; color: white; padding: 20px; margin: 20px; font-size: 24px; z-index: 9999; position: relative;">
      🔥 PAYMENTS PAGE IS LOADING! 🔥
    </div> -->
    
    <div class="payments-container">
      <!-- Filter Section -->
    <div class="filter-section" :class="{ 'animate-slide-down': isLoaded }">
      <div class="filter-row">
        <div class="filter-group">
          <label>Ordered Date</label>
          <select class="filter-select">
            <option>Select Date</option>
            <option>Today</option>
            <option>Yesterday</option>
            <option>Last 7 days</option>
            <option>Last 30 days</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>Delivered Date</label>
          <select class="filter-select">
            <option>Select Date</option>
            <option>Today</option>
            <option>Yesterday</option>
            <option>Last 7 days</option>
            <option>Last 30 days</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>City</label>
          <select class="filter-select">
            <option>Select City</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>Point of Contact</label>
          <select class="filter-select">
            <option>Select POC</option>
          </select>
        </div>
        
        <AnimatedButton variant="clear" size="small">
          Clear All Filters
        </AnimatedButton>
        
        <!-- Download Section -->
        <div class="download-section">
          <!-- <button class="download-btn excel">
            <span>Download Invoice</span>
            <div class="download-options">
              <span>Excel</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7,10 12,15 17,10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
            </div>
          </button> -->
          
          <AnimatedButton variant="danger" size="small">
            <span>PDF</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7,10 12,15 17,10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          </AnimatedButton>
        </div>
      </div>
    </div>

    <!-- Table Section -->
    <div class="table-container" :class="{ 'animate-fade-in-up': isLoaded }">
      <table class="payments-table">
        <thead>
          <tr>
            <th>
              <input type="checkbox" v-model="selectAll" @change="toggleAllSelection">
            </th>
            <th>Asp Order Code</th>
            <th>Sales Invoice Number</th>
            <th>Ordered Date</th>
            <th>Delivered Date</th>
            <th>Payment Due Date</th>
            <th>Ordered Quantity</th>
            <th>Delivered Quantity</th>
            <th>Amount</th>
            <th>Delivery Location</th>
            <th>POC Name</th>
            <th>POC Contact</th>
            <th>Invoice Status</th>
          </tr>
        </thead>
        <tbody>
          <!-- Skeleton loading rows -->
          <tr v-if="loading" v-for="i in 5" :key="i" class="skeleton-row">
            <td>
              <SkeletonLoader width="16px" height="16px" />
            </td>
            <td><SkeletonLoader width="80%" height="16px" /></td>
            <td><SkeletonLoader width="80%" height="16px" /></td>
            <td><SkeletonLoader width="80%" height="16px" /></td>
            <td><SkeletonLoader width="80%" height="16px" /></td>
            <td><SkeletonLoader width="80%" height="16px" /></td>
            <td><SkeletonLoader width="80%" height="16px" /></td>
            <td><SkeletonLoader width="80%" height="16px" /></td>
            <td><SkeletonLoader width="80%" height="16px" /></td>
            <td><SkeletonLoader width="80%" height="16px" /></td>
            <td><SkeletonLoader width="80%" height="16px" /></td>
            <td><SkeletonLoader width="80%" height="16px" /></td>
            <td>
              <SkeletonLoader width="80%" height="24px" />
            </td>
          </tr>
          
          <!-- Actual data rows -->
          <tr v-for="payment in payments" :key="payment.id" :class="{ 'selected': payment.selected }">
            <td>
              <input type="checkbox" v-model="payment.selected">
            </td>
            <td>{{ payment.aspOrderCode }}</td>
            <td>{{ payment.salesInvoiceNumber }}</td>
            <td>{{ payment.orderedDate }}</td>
            <td>{{ payment.deliveredDate }}</td>
            <td>{{ payment.paymentDueDate }}</td>
            <td>{{ payment.orderedQuantity }}</td>
            <td>{{ payment.deliveredQuantity }}</td>
            <td>{{ formatCurrency(payment.amount) }}</td>
            <td>{{ payment.deliveryLocation }}</td>
            <td>{{ payment.pocName }}</td>
            <td>{{ payment.pocContact }}</td>
            <td>
              <span :class="['status-badge', getStatusClass(payment.invoiceStatus)]">
                {{ payment.invoiceStatus }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Summary Cards -->
    <div class="summary-section" :class="{ 'animate-fade-in-up': isLoaded }">
      <div class="summary-cards">
        <div class="summary-card">
          <div class="card-header">Credit Limit</div>
          <div v-if="!summaryLoading" class="card-value green">{{ summaryData.creditLimit }}</div>
          <SkeletonLoader v-else width="60%" height="24px" />
        </div>
        
        <div class="summary-card">
          <div class="card-header">Available Balance</div>
          <div v-if="!summaryLoading" class="card-value green">{{ summaryData.availableBalance }}</div>
          <SkeletonLoader v-else width="60%" height="24px" />
        </div>
        
        <div class="summary-card">
          <div class="card-header">Total Outstanding</div>
          <div v-if="!summaryLoading" class="card-value green">{{ summaryData.totalOutstanding }}</div>
          <SkeletonLoader v-else width="60%" height="24px" />
        </div>
        
        <div class="summary-card">
          <div class="card-header">Total Overdue</div>
          <div v-if="!summaryLoading" class="card-value red">{{ summaryData.totalOverdue }}</div>
          <SkeletonLoader v-else width="60%" height="24px" />
        </div>
        
        <div class="summary-card action-card">
          <AnimatedButton variant="success" size="medium" style="width: 100%;">
            Pay Outstanding
          </AnimatedButton>
        </div>
        
        <div class="summary-card action-card">
          <AnimatedButton variant="warning" size="medium" style="width: 100%;">
            Pay Overdue
          </AnimatedButton>
        </div>
      </div>
    </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AnimatedButton from '@/components/common/AnimatedButton.vue'

// Animation state
const isLoaded = ref(false)
const loading = ref(true)
const summaryLoading = ref(true)

// Reactive data
const selectAll = ref(false)
const payments = ref([])

// Summary data with initial values set to 0
const summaryData = ref({
  creditLimit: '₹ 0',
  availableBalance: '₹ 0',
  totalOutstanding: '₹ 0',
  totalOverdue: '₹ 0'
})

// Simulate data loading
const loadData = () => {
  // In a real implementation, this would fetch data from an API
  setTimeout(() => {
    // Mock data would be replaced with actual API call
    payments.value = [
      {
        id: 1,
        aspOrderCode: 'ASP001',
        salesInvoiceNumber: 'SIN001',
        orderedDate: '2023-06-15',
        deliveredDate: '2023-06-16',
        paymentDueDate: '2023-06-20',
        orderedQuantity: '1000 Ltr',
        deliveredQuantity: '1000 Ltr',
        amount: 50000,
        deliveryLocation: 'Bangalore, Karnataka',
        pocName: 'Student',
        pocContact: '9876543210',
        invoiceStatus: 'Paid',
        selected: false
      },
      {
        id: 2,
        aspOrderCode: 'ASP002',
        salesInvoiceNumber: 'SIN002',
        orderedDate: '2023-06-14',
        deliveredDate: '2023-06-15',
        paymentDueDate: '2023-06-19',
        orderedQuantity: '500 Ltr',
        deliveredQuantity: '500 Ltr',
        amount: 25000,
        deliveryLocation: 'Mumbai, Maharashtra',
        pocName: 'Chetan',
        pocContact: '9876543211',
        invoiceStatus: 'Unpaid',
        selected: false
      },
      {
        id: 3,
        aspOrderCode: 'ASP003',
        salesInvoiceNumber: 'SIN003',
        orderedDate: '2023-06-13',
        deliveredDate: '2023-06-14',
        paymentDueDate: '2023-06-18',
        orderedQuantity: '750 Ltr',
        deliveredQuantity: '750 Ltr',
        amount: 37500,
        deliveryLocation: 'Delhi',
        pocName: 'Gaurav',
        pocContact: '9876543212',
        invoiceStatus: 'Overdue',
        selected: false
      }
    ]
    loading.value = false
  }, 1000)
  
  // Simulate summary data loading
  setTimeout(() => {
    summaryData.value = {
      creditLimit: '₹ 5,00,000',
      availableBalance: '₹ 3,50,000',
      totalOutstanding: '₹ 1,25,000',
      totalOverdue: '₹ 25,000'
    }
    summaryLoading.value = false
  }, 1500)
}

// Methods
const toggleAllSelection = () => {
  payments.value.forEach(payment => {
    payment.selected = selectAll.value
  })
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0
  }).format(amount)
}

const getStatusClass = (status) => {
  switch (status.toLowerCase()) {
    case 'paid':
      return 'status-paid'
    case 'unpaid':
      return 'status-unpaid'
    case 'overdue':
      return 'status-overdue'
    default:
      return 'status-default'
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
  /* All CSS has been moved to PaymentsPage.css */
  @import './PaymentsPage.css';
</style>