<template>
  <div class="modern-loader" :class="variant" :style="{ height, width }">
    <div class="pulse-container">
      <div class="pulse-dot pulse-1"></div>
      <div class="pulse-dot pulse-2"></div>
      <div class="pulse-dot pulse-3"></div>
    </div>
    <div class="shimmer-overlay"></div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  width: {
    type: String,
    default: '100%'
  },
  height: {
    type: String,
    default: '1.5rem'
  },
  variant: {
    type: String,
    default: 'default',
    validator: (value: string) => ['default', 'placed', 'delivered', 'rescheduled', 'cancelled', 'planned', 'cost-saved'].includes(value)
  }
})
</script>

<style scoped>
.modern-loader {
  position: relative;
  background: linear-gradient(135deg, rgba(107, 114, 128, 0.08) 0%, rgba(107, 114, 128, 0.04) 100%);
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 1.5rem;
}

.pulse-container {
  display: flex;
  gap: 4px;
  align-items: center;
}

.pulse-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #6b7280;
  animation: pulse-wave 1.4s ease-in-out infinite;
}

.pulse-1 { animation-delay: 0s; }
.pulse-2 { animation-delay: 0.2s; }
.pulse-3 { animation-delay: 0.4s; }

.shimmer-overlay {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.6) 50%,
    transparent 100%
  );
  animation: shimmer 2s ease-in-out infinite;
}

/* Variant-specific colors */
.modern-loader.placed .pulse-dot {
  background: #3b82f6;
}

.modern-loader.delivered .pulse-dot {
  background: #22c55e;
}

.modern-loader.rescheduled .pulse-dot {
  background: #f59e0b;
}

.modern-loader.cancelled .pulse-dot {
  background: #ef4444;
}

.modern-loader.planned .pulse-dot {
  background: #8b5cf6;
}

.modern-loader.cost-saved .pulse-dot {
  background: #10b981;
}

@keyframes pulse-wave {
  0%, 60%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  30% {
    transform: scale(1.4);
    opacity: 0.7;
  }
}

@keyframes shimmer {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .pulse-dot {
    width: 5px;
    height: 5px;
  }
}
</style>