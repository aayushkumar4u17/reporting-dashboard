<template>
  <div v-if="hasError" class="error-boundary">
    <div class="error-container">
      <h2>Something went wrong</h2>
      <p v-if="isDevelopment">{{ errorMessage }}</p>
      <p v-else>We're experiencing technical difficulties. Please try refreshing the page.</p>
      <div class="error-actions">
        <button @click="handleRefresh" class="btn-primary">
          Refresh Page
        </button>
        <button @click="handleRetry" class="btn-secondary">
          Try Again
        </button>
      </div>
    </div>
  </div>
  <slot v-else />
</template>

<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'
import { getEnvironmentInfo } from '@/utils/envValidator'

const hasError = ref(false)
const errorMessage = ref('')
const { isDevelopment } = getEnvironmentInfo()

onErrorCaptured((error: Error) => {
  hasError.value = true
  errorMessage.value = error.message
  
  // Log error for monitoring (sanitized)
  console.error('Application Error:', {
    message: 'Component error occurred',
    timestamp: new Date().toISOString(),
    isDevelopment
  })
  
  return false
})

const handleRefresh = () => {
  window.location.reload()
}

const handleRetry = () => {
  hasError.value = false
  errorMessage.value = ''
}
</script>

<style scoped>
.error-boundary {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
}

.error-container {
  text-align: center;
  max-width: 500px;
  padding: 40px;
  border-radius: 8px;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
}

.error-container h2 {
  color: #dc3545;
  margin-bottom: 16px;
}

.error-container p {
  color: #6c757d;
  margin-bottom: 24px;
  line-height: 1.5;
}

.error-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.btn-primary, .btn-secondary {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover {
  background-color: #0056b3;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #545b62;
}
</style>