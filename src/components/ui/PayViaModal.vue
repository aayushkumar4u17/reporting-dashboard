<template>
  <div v-if="isOpen" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>{{ modalTitle }}</h3>
        <button class="close-btn" @click="closeModal">&times;</button>
      </div>
      
      <div class="amount-display">
        <div class="amount-label">Amount to Pay</div>
        <div class="amount-value">{{ formatCurrency(amount) }}</div>
      </div>

      <div class="payment-methods">
        <h4>Select Payment Method</h4>
        
        <div class="payment-option" @click="selectPaymentMethod('easebuzz')">
          <div class="payment-icon">💳</div>
          <div class="payment-info">
            <div class="payment-name">Easebuzz</div>
            <div class="payment-desc">Credit/Debit Card, UPI, Net Banking</div>
          </div>
        </div>

        <div class="payment-option disabled">
          <div class="payment-icon">🏦</div>
          <div class="payment-info">
            <div class="payment-name">ICICI Co-Credit</div>
            <div class="payment-desc">ICICI Bank Co-branded Cards</div>
            <div class="coming-soon">Coming Soon</div>
          </div>
        </div>

        <div class="payment-option disabled">
          <div class="payment-icon">🏛️</div>
          <div class="payment-info">
            <div class="payment-name">Axis Co-Credit</div>
            <div class="payment-desc">Axis Bank Co-branded Cards</div>
            <div class="coming-soon">Coming Soon</div>
          </div>
        </div>
      </div>

      <div class="modal-actions">
        <button class="cancel-btn" @click="closeModal">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  paymentType: {
    type: String,
    required: true // 'outstanding' or 'overdue'
  },
  amount: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['close', 'payment'])

const modalTitle = computed(() => {
  return props.paymentType === 'outstanding' ? 'Pay Outstanding Amount' : 'Pay Overdue Amount'
})

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0
  }).format(amount || 0)
}

const selectPaymentMethod = (method) => {
  emit('payment', {
    amount: props.amount,
    paymentMethod: method,
    amountType: props.paymentType
  })
}

const closeModal = () => {
  emit('close')
}
</script>

<style scoped>
.modal-overlay {
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

.modal-content {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  width: 90%;
  max-width: 400px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.modal-header h3 {
  margin: 0;
  color: #333;
  font-size: 1.25rem;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #333;
}

.amount-display {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
  margin-bottom: 1.5rem;
}

.amount-label {
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.amount-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #333;
}

.payment-methods h4 {
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1rem;
  font-weight: 600;
}

.payment-option {
  display: flex;
  align-items: center;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.payment-option:hover {
  border-color: #3b82f6;
  background: #f8faff;
}

.payment-option.disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: #f5f5f5;
}

.payment-option.disabled:hover {
  border-color: #e5e7eb;
  background: #f5f5f5;
}

.coming-soon {
  font-size: 0.75rem;
  color: #3b82f6;
  font-weight: 600;
  margin-top: 0.25rem;
}

.payment-icon {
  font-size: 1.5rem;
  margin-right: 1rem;
}

.payment-info {
  flex: 1;
}

.payment-name {
  font-weight: 600;
  color: #333;
  margin-bottom: 0.25rem;
}

.payment-desc {
  font-size: 0.875rem;
  color: #666;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.cancel-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  background: white;
  color: #374151;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.cancel-btn:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}
</style>