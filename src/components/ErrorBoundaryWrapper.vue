<template>
  <div class="error-boundary-wrapper">
    <div v-if="errorState.hasError" class="error-fallback">
      <div class="error-container">
        <div class="error-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        </div>
        <h3>{{ getErrorTitle() }}</h3>
        <p>{{ errorState.errorInfo?.message || 'An unexpected error occurred' }}</p>
        <div class="error-actions">
          <button @click="handleRetry" class="btn-primary">
            Try Again
          </button>
          <button @click="handleNavigateHome" class="btn-secondary">
            Go to Dashboard
          </button>
        </div>
        <div v-if="showDetails" class="error-details">
          <p><strong>Component:</strong> {{ errorState.errorInfo?.component }}</p>
          <p><strong>Time:</strong> {{ formatTime(errorState.errorInfo?.timestamp) }}</p>
          <p v-if="errorState.errorInfo?.code"><strong>Code:</strong> {{ errorState.errorInfo.code }}</p>
        </div>
        <button @click="showDetails = !showDetails" class="details-toggle">
          {{ showDetails ? 'Hide' : 'Show' }} Details
        </button>
      </div>
    </div>
    <slot v-else />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useErrorIsolation } from '@/composables/useErrorIsolation'

interface Props {
  componentName?: string
  onRetry?: () => void
}

const props = withDefaults(defineProps<Props>(), {
  componentName: 'Component'
})

const { errorState, resetError, navigateWithErrorReset } = useErrorIsolation(props.componentName)
const showDetails = ref(false)

const getErrorTitle = () => {
  const severity = errorState.value.errorInfo?.severity
  switch (severity) {
    case 'critical':
      return 'Critical Error'
    case 'high':
      return 'Service Unavailable'
    case 'medium':
      return 'Something Went Wrong'
    default:
      return 'Minor Issue'
  }
}

const formatTime = (timestamp?: number) => {
  if (!timestamp) return 'Unknown'
  return new Date(timestamp).toLocaleString()
}

const handleRetry = () => {
  resetError()
  if (props.onRetry) {
    props.onRetry()
  }
}

const handleNavigateHome = () => {
  navigateWithErrorReset('/dashboard')
}
</script>

<style scoped>
.error-boundary-wrapper {
  width: 100%;
  height: 100%;
}

.error-fallback {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  padding: 2rem;
}

.error-container {
  text-align: center;
  max-width: 500px;
  padding: 2rem;
  border-radius: 12px;
  background: var(--bg-secondary, #f8f9fa);
  border: 1px solid var(--border-color, #dee2e6);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.error-icon {
  color: #dc3545;
  margin-bottom: 1rem;
}

.error-container h3 {
  color: var(--text-primary, #212529);
  margin-bottom: 1rem;
  font-size: 1.25rem;
}

.error-container p {
  color: var(--text-secondary, #6c757d);
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.error-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 1rem;
}

.btn-primary, .btn-secondary {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
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

.error-details {
  background: var(--bg-tertiary, #f1f3f4);
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  text-align: left;
  font-size: 0.875rem;
}

.error-details p {
  margin-bottom: 0.5rem;
}

.details-toggle {
  background: none;
  border: none;
  color: var(--primary-color, #007bff);
  cursor: pointer;
  text-decoration: underline;
  font-size: 0.875rem;
}

.details-toggle:hover {
  color: var(--primary-hover, #0056b3);
}
</style>