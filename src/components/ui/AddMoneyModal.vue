<template>
  <div v-if="isOpen" class="modal-overlay" @click="closeModal">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h3 class="modal-title">Add Money to Wallet</h3>
        <button class="close-btn" @click="closeModal">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="modal-body">
        <!-- Amount Selection -->
        <div class="amount-section">
          <h4 class="section-title">Select Amount</h4>
          <div class="amount-options">
            <div 
              class="amount-option" 
              :class="{ active: selectedAmountType === 'overdue' }"
              @click="selectAmountType('overdue')"
            >
              <div class="option-icon danger">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 9v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
                </svg>
              </div>
              <div class="option-content">
                <div class="option-title">Total Overdue Amount</div>
                <div class="option-amount danger">{{ formatCurrency(overdueAmount) }}</div>
              </div>
            </div>

            <div 
              class="amount-option" 
              :class="{ active: selectedAmountType === 'outstanding' }"
              @click="selectAmountType('outstanding')"
            >
              <div class="option-icon warning">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
              <div class="option-content">
                <div class="option-title">Total Outstanding Balance</div>
                <div class="option-amount warning">{{ formatCurrency(outstandingAmount) }}</div>
              </div>
            </div>

            <div 
              class="amount-option" 
              :class="{ active: selectedAmountType === 'custom' }"
              @click="selectAmountType('custom')"
            >
              <div class="option-icon info">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
              <div class="option-content">
                <div class="option-title">Custom Amount</div>
                <input 
                  v-if="selectedAmountType === 'custom'"
                  v-model="customAmount"
                  type="number"
                  placeholder="Enter amount"
                  class="custom-input"
                  @input="validateCustomAmount"
                />
                <div v-else class="option-amount info">Enter your amount</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Payment Method Selection -->
        <div class="payment-section">
          <h4 class="section-title">Pay Via</h4>
          <div class="payment-methods">
            <div 
              class="payment-method" 
              :class="{ active: selectedPaymentMethod === 'easebuzz' }"
              @click="selectedPaymentMethod = 'easebuzz'"
            >
              <div class="payment-icon">
                <img src="/easebuzz-logo.svg" alt="Easebuzz" class="payment-logo" />
              </div>
              <div class="payment-name">Easebuzz</div>
            </div>

            <div class="payment-method disabled">
              <div class="payment-icon">
                <img src="/iciciLogo.webp" alt="ICICI" class="payment-logo" />
              </div>
              <div class="payment-info">
                <div class="payment-name">ICICI Cobranded Card</div>
                <div class="coming-soon">Coming Soon</div>
              </div>
            </div>

            <div class="payment-method disabled">
              <div class="payment-icon">
                <img src="/axisbanklogo.png" alt="Axis" class="payment-logo" />
              </div>
              <div class="payment-info">
                <div class="payment-name">Axis Cobranded Card</div>
                <div class="coming-soon">Coming Soon</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Amount Summary -->
        <div class="summary-section">
          <div class="summary-row">
            <span class="summary-label">Amount to Pay:</span>
            <span class="summary-amount">{{ formatCurrency(finalAmount) }}</span>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-secondary" @click="closeModal">Cancel</button>
        <button 
          class="btn-primary" 
          :disabled="!canProceed || loading"
          @click="handlePayment"
        >
          <span v-if="loading" class="loading-spinner"></span>
          {{ loading ? 'Processing...' : 'Proceed to Pay' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  overdueAmount: {
    type: Number,
    default: 0
  },
  outstandingAmount: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['close', 'payment'])

const selectedAmountType = ref('')
const selectedPaymentMethod = ref('easebuzz')
const customAmount = ref('')
const loading = ref(false)

const finalAmount = computed(() => {
  switch (selectedAmountType.value) {
    case 'overdue':
      return props.overdueAmount
    case 'outstanding':
      return props.outstandingAmount
    case 'custom':
      return parseFloat(customAmount.value) || 0
    default:
      return 0
  }
})

const canProceed = computed(() => {
  return selectedAmountType.value && 
         selectedPaymentMethod.value && 
         finalAmount.value > 0
})

const selectAmountType = (type) => {
  selectedAmountType.value = type
  if (type === 'custom') {
    customAmount.value = ''
  }
}

const validateCustomAmount = () => {
  const amount = parseFloat(customAmount.value)
  if (amount > 100000000) {
    customAmount.value = '100000000'
  }
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0
  }).format(amount || 0)
}

const closeModal = () => {
  selectedAmountType.value = ''
  selectedPaymentMethod.value = 'easebuzz'
  customAmount.value = ''
  loading.value = false
  emit('close')
}

const handlePayment = async () => {
  if (!canProceed.value) return
  
  loading.value = true
  
  try {
    await emit('payment', {
      amount: finalAmount.value,
      paymentMethod: selectedPaymentMethod.value,
      amountType: selectedAmountType.value
    })
  } finally {
    loading.value = false
  }
}

// Reset form when modal opens
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    selectedAmountType.value = ''
    selectedPaymentMethod.value = 'easebuzz'
    customAmount.value = ''
    loading.value = false
  }
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

.modal-container {
  background: var(--bg-glass);
  backdrop-filter: blur(20px);
  border: 1px solid var(--border-light);
  border-radius: 20px;
  width: 520px;
  height: 520px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.4);
  animation: slideUp 0.3s ease;
  margin: auto;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border-light);
  background: linear-gradient(135deg, var(--bg-glass), var(--bg-secondary));
  border-radius: 20px 20px 0 0;
}

.modal-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.close-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: var(--text-primary);
  transform: scale(1.05);
}

.close-btn svg {
  width: 16px;
  height: 16px;
}

.modal-body {
  padding: 1.25rem;
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-title::before {
  content: '';
  width: 4px;
  height: 18px;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  border-radius: 2px;
  box-shadow: 0 2px 8px var(--accent-light);
}

.amount-section {
  flex: 1;
}

.amount-options {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.6rem;
}

.amount-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border: 2px solid var(--border-light);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: var(--bg-primary);
  min-height: 60px;
}

.amount-option:hover {
  border-color: var(--accent-primary);
  background: var(--bg-glass);
}

.amount-option.active {
  border-color: var(--accent-primary);
  background: var(--accent-light);
  box-shadow: 0 6px 25px var(--accent-light);
  transform: translateY(-1px);
}

.option-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.option-icon.danger {
  background: rgba(220, 53, 69, 0.1);
  color: #dc3545;
}

.option-icon.warning {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.option-icon.info {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.option-icon svg {
  width: 20px;
  height: 20px;
}

.option-content {
  flex: 1;
}

.option-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.option-amount {
  font-size: 1.1rem;
  font-weight: 700;
}

.option-amount.danger {
  color: #dc3545;
}

.option-amount.warning {
  color: #f59e0b;
}

.option-amount.info {
  color: #3b82f6;
}

.custom-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--border-light);
  border-radius: 6px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 1rem;
  font-weight: 600;
  outline: none;
  transition: all 0.2s ease;
}

.custom-input:focus {
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px var(--accent-light);
}

/* Hide number input spinner arrows */
.custom-input::-webkit-outer-spin-button,
.custom-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.custom-input[type=number] {
  -moz-appearance: textfield;
}

.payment-section {
  flex-shrink: 0;
}

.payment-methods {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.6rem;
}

.payment-method {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border: 2px solid var(--border-light);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: var(--bg-primary);
  min-height: 56px;
}

.payment-method:hover {
  border-color: var(--accent-primary);
  background: var(--bg-glass);
}

.payment-method.active {
  border-color: var(--accent-primary);
  background: var(--accent-light);
  box-shadow: 0 6px 25px var(--accent-light);
  transform: translateY(-1px);
}

.payment-method.disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: var(--bg-secondary);
}

.payment-method.disabled:hover {
  border-color: var(--border-light);
  background: var(--bg-secondary);
}

.payment-info {
  flex: 1;
}

.coming-soon {
  font-size: 0.75rem;
  color: var(--accent-primary);
  font-weight: 600;
  margin-top: 0.25rem;
}

.payment-icon {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  flex-shrink: 0;
}

.payment-logo {
  width: 28px;
  height: 28px;
  object-fit: contain;
}

.payment-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
}

.summary-section {
  padding: 0.75rem 1rem;
  background: var(--bg-glass);
  border-radius: 10px;
  border: 1px solid var(--border-light);
  margin-top: auto;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.summary-amount {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--accent-primary);
}

.modal-footer {
  display: flex;
  gap: 0.75rem;
  padding: 1.25rem;
  border-top: 1px solid var(--border-light);
  justify-content: flex-end;
  flex-shrink: 0;
}

.btn-secondary {
  padding: 0.75rem 1.5rem;
  border: 1px solid var(--border-medium);
  background: transparent;
  color: var(--text-secondary);
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: var(--bg-glass);
  color: var(--text-primary);
}

.btn-primary {
  padding: 0.75rem 1.5rem;
  border: none;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  color: white;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px var(--accent-light);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(40px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .modal-container {
    width: 95vw;
    height: 85vh;
    max-width: 400px;
    max-height: 600px;
    margin: 1rem;
  }
  
  .modal-header {
    padding: 1rem;
  }
  
  .modal-body {
    padding: 1rem;
    gap: 1rem;
  }
  
  .modal-footer {
    padding: 1rem;
    flex-direction: column;
  }
  
  .btn-secondary,
  .btn-primary {
    width: 100%;
    justify-content: center;
  }
  
  .amount-option,
  .payment-method {
    min-height: 52px;
    padding: 0.6rem;
  }
}
</style>