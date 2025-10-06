<template>
  <div class="breathing-loader" :class="variant" :style="{ height, width }">
    <div class="breathing-content">
      <div class="breathing-circle"></div>
      <div class="breathing-bars">
        <div class="bar bar-1"></div>
        <div class="bar bar-2"></div>
        <div class="bar bar-3"></div>
      </div>
    </div>
    <div class="glow-effect"></div>
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
.breathing-loader {
  position: relative;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%);
  border: 1px solid rgba(107, 114, 128, 0.1);
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 1.5rem;
  animation: breathing 2s ease-in-out infinite;
  backdrop-filter: blur(8px);
}

.breathing-content {
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 2;
  position: relative;
}

.breathing-circle {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #6b7280;
  animation: circle-pulse 1.5s ease-in-out infinite;
}

.breathing-bars {
  display: flex;
  gap: 2px;
  align-items: center;
}

.bar {
  width: 3px;
  background: #6b7280;
  border-radius: 2px;
  animation: bar-wave 1.2s ease-in-out infinite;
}

.bar-1 {
  height: 8px;
  animation-delay: 0s;
}

.bar-2 {
  height: 12px;
  animation-delay: 0.1s;
}

.bar-3 {
  height: 6px;
  animation-delay: 0.2s;
}

.glow-effect {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 20px;
  height: 20px;
  background: radial-gradient(circle, rgba(107, 114, 128, 0.3) 0%, transparent 70%);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  animation: glow 2s ease-in-out infinite;
}

/* Variant-specific colors */
.breathing-loader.placed .breathing-circle,
.breathing-loader.placed .bar {
  background: #3b82f6;
}

.breathing-loader.placed .glow-effect {
  background: radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%);
}

.breathing-loader.delivered .breathing-circle,
.breathing-loader.delivered .bar {
  background: #22c55e;
}

.breathing-loader.delivered .glow-effect {
  background: radial-gradient(circle, rgba(34, 197, 94, 0.3) 0%, transparent 70%);
}

.breathing-loader.rescheduled .breathing-circle,
.breathing-loader.rescheduled .bar {
  background: #f59e0b;
}

.breathing-loader.rescheduled .glow-effect {
  background: radial-gradient(circle, rgba(245, 158, 11, 0.3) 0%, transparent 70%);
}

.breathing-loader.cancelled .breathing-circle,
.breathing-loader.cancelled .bar {
  background: #ef4444;
}

.breathing-loader.cancelled .glow-effect {
  background: radial-gradient(circle, rgba(239, 68, 68, 0.3) 0%, transparent 70%);
}

.breathing-loader.planned .breathing-circle,
.breathing-loader.planned .bar {
  background: #8b5cf6;
}

.breathing-loader.planned .glow-effect {
  background: radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%);
}

.breathing-loader.cost-saved .breathing-circle,
.breathing-loader.cost-saved .bar {
  background: #10b981;
}

.breathing-loader.cost-saved .glow-effect {
  background: radial-gradient(circle, rgba(16, 185, 129, 0.3) 0%, transparent 70%);
}

@keyframes breathing {
  0%, 100% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.02);
    opacity: 1;
  }
}

@keyframes circle-pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.3);
    opacity: 0.7;
  }
}

@keyframes bar-wave {
  0%, 100% {
    transform: scaleY(1);
  }
  50% {
    transform: scaleY(1.5);
  }
}

@keyframes glow {
  0%, 100% {
    opacity: 0.3;
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    opacity: 0.6;
    transform: translate(-50%, -50%) scale(1.2);
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .breathing-circle {
    width: 6px;
    height: 6px;
  }
  
  .bar {
    width: 2px;
  }
  
  .bar-1 { height: 6px; }
  .bar-2 { height: 10px; }
  .bar-3 { height: 4px; }
}
</style>