<template>
  <div v-if="isOpen" class="modal-overlay">
    <div class="status-modal">
      <div class="status-content">
        <!-- Processing State -->
        <div v-if="status === 'processing'" class="status-section">
          <div class="processing-spinner"></div>
          <h3 class="status-title">Processing Payment</h3>
          <p class="status-message">Please wait while we process your payment...</p>
        </div>

        <!-- Success State -->
        <div v-else-if="status === 'success'" class="status-section">
          <div class="success-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <h3 class="status-title success">Payment Successful!</h3>
          <p class="status-message">{{ formatCurrency(amount) }} has been added to your wallet.</p>
          <button class="status-btn success" @click="$emit('close')">Continue</button>
        </div>

        <!-- Failed State -->
        <div v-else-if="status === 'failed'" class="status-section">
          <div class="error-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </div>
          <h3 class="status-title error">Payment Failed</h3>
          <p class="status-message">{{ errorMessage || 'Something went wrong. Please try again.' }}</p>
          <div class="status-actions">
            <button class="status-btn secondary" @click="$emit('close')">Cancel</button>
            <button class="status-btn primary" @click="$emit('retry')">Try Again</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    default: 'processing' // processing, success, failed
  },
  amount: {
    type: Number,
    default: 0
  },
  errorMessage: {
    type: String,
    default: ''
  }
})

defineEmits(['close', 'retry'])

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0
  }).format(amount || 0)
}
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
  z-index: 1001;
  animation: fadeIn 0.3s ease;
}

.status-modal {
  background: var(--bg-glass);
  backdrop-filter: blur(20px);
  border: 1px solid var(--border-light);
  border-radius: 16px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
}

.status-content {
  padding: 2rem;
}

.status-section {
  text-align: center;
}

.processing-spinner {
  width: 60px;
  height: 60px;
  border: 4px solid var(--border-light);
  border-top: 4px solid var(--accent-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1.5rem;
}

.success-icon {
  width: 60px;
  height: 60px;
  background: rgba(16, 185, 129, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  color: #10b981;
}

.success-icon svg {
  width: 32px;
  height: 32px;
}

.error-icon {
  width: 60px;
  height: 60px;
  background: rgba(220, 53, 69, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  color: #dc3545;
}

.error-icon svg {
  width: 32px;
  height: 32px;
}

.status-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.75rem;
}

.status-title.success {
  color: #10b981;
}

.status-title.error {
  color: #dc3545;
}

.status-message {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.status-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.status-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.status-btn.primary {
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  color: white;
}

.status-btn.primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 20px var(--accent-light);
}

.status-btn.secondary {
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border-medium);
}

.status-btn.secondary:hover {
  background: var(--bg-glass);
  color: var(--text-primary);
}

.status-btn.success {
  background: #10b981;
  color: white;
  width: 100%;
}

.status-btn.success:hover {
  background: #059669;
  transform: translateY(-1px);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
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
</style>