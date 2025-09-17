<template>
  <button 
    :class="[
      'animated-btn',
      `btn-${variant}`,
      `btn-${size}`,
      { 'btn-loading': loading, 'btn-disabled': disabled }
    ]"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <span v-if="loading" class="loading-spinner"></span>
    <span :class="{ 'btn-content': loading }">
      <slot></slot>
    </span>
  </button>
</template>

<script setup lang="ts">
const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value: string) => ['primary', 'secondary', 'success', 'danger', 'warning', 'clear'].includes(value)
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value: string) => ['small', 'medium', 'large'].includes(value)
  },
  loading: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<style scoped>
.animated-btn {
  position: relative;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  text-decoration: none;
  outline: none;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.animated-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.animated-btn:hover::before {
  left: 100%;
}

.animated-btn:hover:not(.btn-disabled) {
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.animated-btn:active:not(.btn-disabled) {
  transform: translateY(0);
}

.animated-btn:focus {
  box-shadow: 0 0 0 3px rgba(0, 200, 81, 0.3);
}

/* Sizes */
.btn-small {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  border-radius: 8px;
}

.btn-medium {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
}

.btn-large {
  padding: 1rem 2rem;
  font-size: 1.1rem;
  border-radius: 14px;
}

/* Variants */
.btn-primary {
  background: linear-gradient(135deg, #00C851 0%, #00A844 100%);
  color: white;
}

.btn-primary:hover:not(.btn-disabled) {
  background: linear-gradient(135deg, #00A844 0%, #008A3A 100%);
  box-shadow: 0 2px 6px rgba(0, 200, 81, 0.15);
}

.btn-secondary {
  background: transparent;
  color: #00C851;
  border: 2px solid #00C851;
}

.btn-secondary:hover:not(.btn-disabled) {
  background: #00C851;
  color: white;
}

.btn-success {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  color: white;
}

.btn-success:hover:not(.btn-disabled) {
  background: linear-gradient(135deg, #20c997 0%, #17a2b8 100%);
  box-shadow: 0 2px 6px rgba(40, 167, 69, 0.15);
}

.btn-danger {
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
  color: white;
}

.btn-danger:hover:not(.btn-disabled) {
  background: linear-gradient(135deg, #c82333 0%, #a71e2a 100%);
  box-shadow: 0 2px 6px rgba(220, 53, 69, 0.15);
}

.btn-warning {
  background: linear-gradient(135deg, #ffc107 0%, #e0a800 100%);
  color: #212529;
}

.btn-warning:hover:not(.btn-disabled) {
  background: linear-gradient(135deg, #e0a800 0%, #d39e00 100%);
  box-shadow: 0 2px 6px rgba(255, 193, 7, 0.15);
}

.btn-clear {
  background: linear-gradient(135deg, #00C851 0%, #00A844 100%);
  color: white;
}

.btn-clear:hover:not(.btn-disabled) {
  background: linear-gradient(135deg, #00A844 0%, #008A3A 100%);
  box-shadow: 0 2px 6px rgba(0, 200, 81, 0.15);
}

/* States */
.btn-disabled {
  background: #e9ecef !important;
  color: #6c757d !important;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
  border-color: #e9ecef !important;
}

.btn-loading {
  cursor: wait;
}

.btn-content {
  opacity: 0.7;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 768px) {
  .btn-large {
    padding: 0.875rem 1.75rem;
    font-size: 1rem;
  }
  
  .btn-medium {
    padding: 0.625rem 1.25rem;
    font-size: 0.9rem;
  }
  
  .btn-small {
    padding: 0.5rem 0.875rem;
    font-size: 0.8rem;
  }
}
</style>