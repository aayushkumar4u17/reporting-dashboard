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
        
        <AnimatedButton variant="clear" size="medium">
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
          
          <AnimatedButton variant="danger" size="medium">
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
          <div class="card-value green">--</div>
        </div>
        
        <div class="summary-card">
          <div class="card-header">Available Balance</div>
          <div class="card-value green">--</div>
        </div>
        
        <div class="summary-card">
          <div class="card-header">Total Outstanding</div>
          <div class="card-value green">--</div>
        </div>
        
        <div class="summary-card">
          <div class="card-header">Total Overdue</div>
          <div class="card-value red">--</div>
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

// Reactive data
const selectAll = ref(false)
const payments = ref([])

// Initialize animations on component mount
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
})
</script>

<style scoped>
.payments-page {
  width: 100%;
  min-height: calc(100vh - 56px);
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  position: relative;
  overflow-x: hidden;
  overflow-y: auto;
  scroll-behavior: smooth;
}

.payments-page::before {
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

.payments-container {
  width: 100%;
  padding: 1.5rem;
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
}

/* Filter Section */
.filter-section {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 1rem;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.2);
  margin-bottom: 1.5rem;
  border: 1px solid rgba(0, 200, 81, 0.1);
  position: relative;
  z-index: 1;
  opacity: 0;
  transform: translateY(-20px);
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.filter-section.animate-slide-down {
  opacity: 1;
  transform: translateY(0);
}

.filter-row {
  display: flex;
  gap: 1rem;
  align-items: flex-end;
  flex-wrap: wrap;
  justify-content: space-between;
}

.filter-group {
  display: flex;
  flex-direction: column;
  min-width: 130px;
}

.filter-group label {
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

.download-section {
  display: flex;
  gap: 12px;
  align-items: flex-end;
  margin-left: auto;
}

/* Table Section */
.table-container {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(0, 200, 81, 0.15);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.2);
  margin-bottom: 24px;
  position: relative;
  z-index: 1;
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

.payments-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8rem;
}

.payments-table th {
  background: #f8f9fa;
  padding: 0.6rem 0.4rem;
  text-align: left;
  font-weight: 600;
  border-bottom: 1px solid #dee2e6;
  color: #495057;
  white-space: nowrap;
  font-size: 0.75rem;
}

.payments-table td {
  padding: 0.6rem 0.4rem;
  border-bottom: 1px solid #dee2e6;
  color: #495057;
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 0.7rem;
}

.payments-table tbody tr:hover {
  background-color: #f8f9fa;
}

.payments-table tbody tr.selected {
  background-color: #e3f2fd;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  text-transform: capitalize;
}

.status-paid {
  background: #d4edda;
  color: #155724;
}

.status-unpaid {
  background: #f8d7da;
  color: #721c24;
}

.status-overdue {
  background: #fff3cd;
  color: #856404;
}

/* Summary Section */
.summary-section {
  margin-top: 24px;
  position: relative;
  z-index: 1;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.summary-section.animate-fade-in-up {
  opacity: 1;
  transform: translateY(0);
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.summary-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(0, 200, 81, 0.15);
  padding: 1rem;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.2);
  text-align: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.summary-card.action-card {
  background: transparent;
  border: none;
  box-shadow: none;
  padding: 0;
}

.summary-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 200, 81, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.3);
}

.summary-card.action-card:hover {
  transform: none;
  box-shadow: none;
}

.card-header {
  font-size: 0.8rem;
  font-weight: 600;
  color: #666;
  margin-bottom: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.card-value {
  font-size: 1.2rem;
  font-weight: 700;
  line-height: 1.2;
}

.card-value.green {
  color: #00C851;
}

.card-value.red {
  color: #dc3545;
}


</style>