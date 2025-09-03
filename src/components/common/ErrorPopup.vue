<template>
  <div v-if="show" class="error-popup-overlay" @click="closePopup" @keydown.esc="closePopup">
    <div class="error-popup" @click.stop role="dialog" aria-modal="true" :aria-labelledby="'error-title-' + Date.now()">
      <div class="error-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="#ff4444" stroke-width="2" fill="#ffebee"/>
          <path d="M15 9l-6 6M9 9l6 6" stroke="#ff4444" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </div>
      
      <div class="error-content">
        <h3 :id="'error-title-' + Date.now()" class="error-title">{{ title }}</h3>
        <p class="error-message">{{ message }}</p>
      </div>
      
      <div class="error-actions">
        <AnimatedButton @click="closePopup" variant="danger" size="medium" ref="primaryButton">
          {{ buttonText }}
        </AnimatedButton>
        <AnimatedButton v-if="showRetry" @click="retryAction" variant="secondary" size="medium">
          Try Again
        </AnimatedButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue'
import AnimatedButton from '@/components/common/AnimatedButton.vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Error'
  },
  message: {
    type: String,
    default: 'Something went wrong. Please try again.'
  },
  buttonText: {
    type: String,
    default: 'OK'
  },
  showRetry: {
    type: Boolean,
    default: false
  },
  autoClose: {
    type: Number,
    default: 0 // 0 means no auto close
  }
})

const emit = defineEmits(['close', 'retry'])

const primaryButton = ref(null)
let autoCloseTimer = null

const closePopup = () => {
  if (autoCloseTimer) {
    clearTimeout(autoCloseTimer)
    autoCloseTimer = null
  }
  emit('close')
}

const retryAction = () => {
  closePopup()
  emit('retry')
}

// Keyboard event handler
const handleKeydown = (event) => {
  if (event.key === 'Escape') {
    closePopup()
  } else if (event.key === 'Enter') {
    if (props.showRetry && event.shiftKey) {
      retryAction()
    } else {
      closePopup()
    }
  }
}

// Auto close functionality
watch(() => props.show, async (newValue) => {
  if (newValue) {
    // Add keyboard event listener
    document.addEventListener('keydown', handleKeydown)
    
    // Focus management
    await nextTick()
    if (primaryButton.value && typeof primaryButton.value.focus === 'function') {
      try {
        primaryButton.value.focus()
      } catch (error) {
        console.warn('Could not focus primary button:', error)
      }
    }
    
    // Auto close timer
    if (props.autoClose > 0) {
      autoCloseTimer = setTimeout(() => {
        closePopup()
      }, props.autoClose)
    }
  } else {
    // Remove keyboard event listener
    document.removeEventListener('keydown', handleKeydown)
    
    if (autoCloseTimer) {
      clearTimeout(autoCloseTimer)
      autoCloseTimer = null
    }
  }
})

// Cleanup on unmount
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  if (autoCloseTimer) {
    clearTimeout(autoCloseTimer)
  }
})
</script>

<style scoped>
.error-popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.1s ease-out;
}

.error-popup {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  max-width: 400px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.15s ease-out;
  text-align: center;
}

.error-icon {
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: center;
  animation: bounceIn 0.2s ease-out 0.05s both;
}

.error-content {
  margin-bottom: 2rem;
}

.error-title {
  font-size: 1.4rem;
  font-weight: 600;
  color: #ff4444;
  margin-bottom: 0.5rem;
  animation: slideInLeft 0.15s ease-out 0.1s both;
}

.error-message {
  font-size: 1rem;
  color: #666;
  line-height: 1.5;
  margin: 0;
  animation: slideInRight 0.15s ease-out 0.12s both;
}

.error-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  flex-wrap: wrap;
  animation: slideInUp 0.15s ease-out 0.15s both;
}



/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bounceIn {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 480px) {
  .error-popup {
    padding: 1.5rem;
    margin: 1rem;
  }
  
  .error-title {
    font-size: 1.2rem;
  }
  
  .error-message {
    font-size: 0.9rem;
  }
  
  .error-actions {
    flex-direction: column;
  }
  
  .error-btn-primary,
  .error-btn-secondary {
    width: 100%;
    padding: 0.875rem;
  }
}
</style>