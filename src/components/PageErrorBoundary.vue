<template>
  <div>
    <slot v-if="!hasError" />
    <div v-else class="page-error-container">
      <div class="error-content">
        <div class="error-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="#f59e0b" stroke-width="2" fill="none"/>
            <line x1="12" y1="9" x2="12" y2="13" stroke="#f59e0b" stroke-width="2"/>
            <line x1="12" y1="17" x2="12.01" y2="17" stroke="#f59e0b" stroke-width="2"/>
          </svg>
        </div>
        
        <h3 class="error-title">{{ pageTitle }} Error</h3>
        <p class="error-message">{{ errorMessage }}</p>
        
        <div class="error-actions">
          <button @click="handleRetry" class="btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="23,4 23,10 17,10"/>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
            </svg>
            Try Again
          </button>
          <button @click="handleRefresh" class="btn-secondary">
            Refresh Page
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onErrorCaptured, defineProps } from 'vue'
import ErrorHandler from '@/utils/errorHandler'

interface Props {
  pageTitle?: string
}

const props = withDefaults(defineProps<Props>(), {
  pageTitle: 'Page'
})

const hasError = ref(false)
const errorMessage = ref('')

onErrorCaptured((error: Error, instance, info) => {
  const safeError = ErrorHandler.handleError(error, {
    component: props.pageTitle,
    action: `Page error: ${info}`
  })
  
  hasError.value = true
  errorMessage.value = safeError.userMessage
  
  console.error(`${props.pageTitle} Error:`, {
    message: safeError.message,
    component: instance?.type?.name || 'Unknown',
    info,
    timestamp: new Date().toISOString()
  })
  
  return false
})

const handleRetry = () => {
  hasError.value = false
  errorMessage.value = ''
}

const handleRefresh = () => {
  window.location.reload()
}
</script>

<style scoped>
.page-error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  padding: 2rem;
}

.error-content {
  text-align: center;
  max-width: 400px;
  padding: 2rem;
  background: var(--bg-primary);
  border-radius: 12px;
  box-shadow: 0 8px 32px var(--shadow-color);
  border: 1px solid var(--border-color);
}

.error-icon {
  margin-bottom: 1rem;
  display: flex;
  justify-content: center;
}

.error-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.75rem;
}

.error-message {
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.error-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
}

.btn-primary, .btn-secondary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
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

@media (max-width: 640px) {
  .error-content {
    padding: 1.5rem;
    margin: 1rem;
  }
  
  .error-actions {
    flex-direction: column;
  }
}
</style>