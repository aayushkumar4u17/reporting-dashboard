<template>
  <div v-if="show" class="error-overlay" @click="handleOverlayClick">
    <div class="error-modal" @click.stop>
      <div class="error-header">
        <div class="error-icon" :class="severityClass">
          <svg v-if="severity === 'critical'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
          <svg v-else-if="severity === 'high'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
          <svg v-else-if="severity === 'low'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 16v-4"/>
            <path d="M12 8h.01"/>
          </svg>
          <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>
        <h3 class="error-title">{{ title }}</h3>
        <button class="close-button" @click="closeError">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6L18 18"/>
          </svg>
        </button>
      </div>
      
      <div class="error-content">
        <p class="error-message">{{ message }}</p>
        
        <div v-if="suggestions.length > 0" class="error-suggestions">
          <h4>What you can try:</h4>
          <ul>
            <li v-for="suggestion in suggestions" :key="suggestion">{{ suggestion }}</li>
          </ul>
        </div>
        
        <div v-if="details && showDetails" class="error-details">
          <button @click="showDetails = !showDetails" class="details-toggle">
            {{ showDetails ? 'Hide' : 'Show' }} Technical Details
          </button>
          <div v-if="showDetails" class="details-content">
            <pre>{{ details }}</pre>
          </div>
        </div>
      </div>
      
      <div class="error-actions">
        <button v-if="showRetry" @click="handleRetry" class="btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="23,4 23,10 17,10"/>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
          Try Again
        </button>
        <button @click="handleRefresh" class="btn-secondary">
          Refresh Page
        </button>
        <button @click="closeError" class="btn-outline">
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineProps, defineEmits } from 'vue'

interface Props {
  show: boolean
  title: string
  message: string
  details?: string
  severity?: 'low' | 'medium' | 'high' | 'critical'
  showRetry?: boolean
  suggestions?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  severity: 'medium',
  showRetry: false,
  suggestions: () => [],
  details: ''
})

const emit = defineEmits<{
  close: []
  retry: []
  refresh: []
}>()

const showDetails = ref(false)

const severityClass = computed(() => `severity-${props.severity}`)



const closeError = () => {
  emit('close')
}

const handleRetry = () => {
  emit('retry')
}

const handleRefresh = () => {
  emit('refresh')
}

const handleOverlayClick = () => {
  closeError()
}
</script>

<style scoped>
.error-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  backdrop-filter: blur(4px);
  animation: fadeIn 0.3s ease-out;
}

.error-modal {
  background: white;
  border-radius: 16px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  animation: slideIn 0.3s ease-out;
}

.error-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.5rem 1.5rem 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.error-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.error-icon.severity-critical {
  background: #fef2f2;
  color: #dc2626;
}

.error-icon.severity-high {
  background: #fef2f2;
  color: #ef4444;
}

.error-icon.severity-medium {
  background: #fffbeb;
  color: #f59e0b;
}

.error-icon.severity-low {
  background: #eff6ff;
  color: #3b82f6;
}

.error-title {
  flex: 1;
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
  line-height: 1.3;
}

.close-button {
  background: none;
  border: none;
  cursor: pointer;
  color: #6b7280;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
}

.close-button:hover {
  background: #f3f4f6;
  color: #374151;
}

.error-content {
  padding: 0 1.5rem 1rem 1.5rem;
}

.error-message {
  color: #374151;
  line-height: 1.6;
  margin: 0 0 1rem 0;
}

.error-suggestions {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.error-suggestions h4 {
  margin: 0 0 0.5rem 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.error-suggestions ul {
  margin: 0;
  padding-left: 1.25rem;
  color: #4b5563;
  font-size: 0.875rem;
}

.error-suggestions li {
  margin-bottom: 0.25rem;
}

.error-details {
  margin-top: 1rem;
}

.details-toggle {
  background: none;
  border: none;
  color: #3b82f6;
  cursor: pointer;
  font-size: 0.875rem;
  text-decoration: underline;
  padding: 0;
}

.details-content {
  margin-top: 0.5rem;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.details-content pre {
  margin: 0;
  font-size: 0.75rem;
  color: #6c757d;
  white-space: pre-wrap;
  word-break: break-word;
}

.error-actions {
  display: flex;
  gap: 0.75rem;
  padding: 1rem 1.5rem 1.5rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  justify-content: flex-end;
}

.btn-primary, .btn-secondary, .btn-outline {
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

.btn-outline {
  background: transparent;
  color: #6b7280;
  border: 1px solid #d1d5db;
}

.btn-outline:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (max-width: 640px) {
  .error-modal {
    margin: 1rem;
    width: calc(100% - 2rem);
  }
  
  .error-actions {
    flex-direction: column;
  }
  
  .error-header {
    padding: 1rem;
  }
  
  .error-content {
    padding: 0 1rem 1rem 1rem;
  }
  
  .error-actions {
    padding: 1rem;
  }
}
</style>