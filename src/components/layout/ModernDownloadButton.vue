<template>
  <button 
    :class="[
      'modern-download-btn',
      { 'loading': loading, 'disabled': disabled }
    ]"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <div class="btn-content">
      <div v-if="loading" class="spinner">
        <svg viewBox="0 0 24 24" class="spinner-icon">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" stroke-dasharray="31.416" stroke-dashoffset="31.416">
            <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416" repeatCount="indefinite"/>
            <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416" repeatCount="indefinite"/>
          </circle>
        </svg>
      </div>
      <svg v-else viewBox="0 0 24 24" class="download-icon">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7,10 12,15 17,10"/>
        <line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
    </div>
  </button>
</template>

<script setup>
const props = defineProps({
  loading: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click'])

const handleClick = (event) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<style scoped>
.modern-download-btn {
  position: relative;
  width: 36px;
  height: 36px;
  border: 2px solid rgba(0, 200, 81, 0.3);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(5px);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.modern-download-btn:hover:not(.disabled):not(.loading) {
  border-color: rgba(0, 200, 81, 0.6);
  background: rgba(255, 255, 255, 0.95);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 200, 81, 0.15);
}

.modern-download-btn:active:not(.disabled):not(.loading) {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(0, 200, 81, 0.1);
}

.modern-download-btn:focus {
  outline: none;
  border-color: #00C851;
  box-shadow: 0 0 0 3px rgba(0, 200, 81, 0.2);
}

.modern-download-btn.loading {
  cursor: wait;
  border-color: rgba(0, 200, 81, 0.4);
}

.modern-download-btn.disabled {
  background: #e9ecef;
  border-color: #e9ecef;
  cursor: not-allowed;
  box-shadow: none;
}

.btn-content {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.download-icon {
  width: 16px;
  height: 16px;
  stroke: #00C851;
  stroke-width: 2;
  fill: none;
  transition: transform 0.3s ease;
}

.modern-download-btn:hover:not(.disabled):not(.loading) .download-icon {
  transform: translateY(1px);
}

.modern-download-btn.disabled .download-icon {
  stroke: #6c757d;
}

.spinner {
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner-icon {
  width: 16px;
  height: 16px;
  stroke: #00C851;
  stroke-width: 2;
  fill: none;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .modern-download-btn {
    width: 32px;
    height: 32px;
    border-radius: 8px;
  }
  
  .download-icon,
  .spinner-icon {
    width: 14px;
    height: 14px;
  }
}
</style>