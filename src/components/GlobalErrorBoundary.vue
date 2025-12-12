<template>
  <div>
    <slot v-if="!hasError" />
    <div v-else class="global-error-container">
      <div class="error-content">
        <div class="error-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="#ef4444" stroke-width="2"/>
            <path d="M15 9l-6 6M9 9l6 6" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        
        <h2 class="error-title">{{ errorTitle }}</h2>
        <p class="error-message">{{ errorMessage }}</p>
        
        <div class="error-actions">
          <button @click="handleRefresh" class="btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="23,4 23,10 17,10"/>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
            </svg>
            Refresh Page
          </button>
          <button @click="handleRetry" class="btn-secondary">
            Try Again
          </button>
          <button @click="handleGoHome" class="btn-outline">
            Go to Dashboard
          </button>
        </div>
        
        <details v-if="isDevelopment && errorDetails" class="error-details">
          <summary>Technical Details</summary>
          <pre>{{ errorDetails }}</pre>
        </details>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'
import { useRouter } from 'vue-router'
import { getEnvironmentInfo } from '@/utils/envValidator'
import ErrorHandler from '@/utils/errorHandler'

const router = useRouter()
const { isDevelopment } = getEnvironmentInfo()

const hasError = ref(false)
const errorTitle = ref('Something went wrong')
const errorMessage = ref('We encountered an unexpected error. Please try again.')
const errorDetails = ref('')

onErrorCaptured((error: Error, instance, info) => {
  const safeError = ErrorHandler.handleError(error, {
    component: instance?.type?.name || 'Unknown',
    action: `Error boundary: ${info}`
  })
  
  hasError.value = true
  errorTitle.value = getErrorTitle(safeError)
  errorMessage.value = safeError.userMessage
  errorDetails.value = isDevelopment ? `${error.message}\n\nStack: ${error.stack}` : ''
  
  return false
})

const getErrorTitle = (safeError: any) => {
  switch (safeError.severity) {
    case 'critical':
      return 'Critical Error'
    case 'high':
      return 'Application Error'
    case 'medium':
      return 'Something went wrong'
    default:
      return 'Oops!'
  }
}

const handleRefresh = () => {
  window.location.reload()
}

const handleRetry = () => {
  hasError.value = false
  errorTitle.value = 'Something went wrong'
  errorMessage.value = 'We encountered an unexpected error. Please try again.'
  errorDetails.value = ''
}

const handleGoHome = () => {
  hasError.value = false
  router.push('/dashboard')
}
</script>

<style scoped>
.global-error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 2rem;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
}

.error-content {
  text-align: center;
  max-width: 500px;
  padding: 3rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border: 1px solid #e2e8f0;
}

.error-icon {
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: center;
}

.error-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 1rem;
}

.error-message {
  color: #6b7280;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.error-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.btn-primary, .btn-secondary, .btn-outline {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  font-size: 0.875rem;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-secondary:hover {
  background: #4b5563;
}

.btn-outline {
  background: transparent;
  color: #6b7280;
  border: 1px solid #d1d5db;
}

.btn-outline:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.error-details {
  text-align: left;
  margin-top: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.error-details summary {
  cursor: pointer;
  font-weight: 500;
  color: #495057;
  margin-bottom: 0.5rem;
}

.error-details pre {
  font-size: 0.75rem;
  color: #6c757d;
  white-space: pre-wrap;
  word-break: break-word;
  margin: 0;
}

@media (max-width: 640px) {
  .error-content {
    padding: 2rem;
    margin: 1rem;
  }
  
  .error-actions {
    flex-direction: column;
  }
}
</style>