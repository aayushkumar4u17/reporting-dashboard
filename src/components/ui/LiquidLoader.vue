<template>
  <div class="liquid-loader" :class="variant" :style="{ height, width }">
    <div class="liquid-container">
      <div class="liquid-wave wave-1"></div>
      <div class="liquid-wave wave-2"></div>
      <div class="liquid-wave wave-3"></div>
    </div>
    <div class="liquid-content">
      <div class="liquid-dots">
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
      </div>
    </div>
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
.liquid-loader {
  position: relative;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%);
  border: 1px solid rgba(107, 114, 128, 0.08);
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 1.5rem;
  backdrop-filter: blur(10px);
}

.liquid-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
}

.liquid-wave {
  position: absolute;
  top: 0;
  left: -100%;
  width: 200%;
  height: 100%;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(107, 114, 128, 0.1) 25%, 
    rgba(107, 114, 128, 0.2) 50%, 
    rgba(107, 114, 128, 0.1) 75%, 
    transparent 100%
  );
  animation: liquid-flow 3s ease-in-out infinite;
}

.wave-1 {
  animation-delay: 0s;
  opacity: 0.6;
}

.wave-2 {
  animation-delay: 1s;
  opacity: 0.4;
}

.wave-3 {
  animation-delay: 2s;
  opacity: 0.3;
}

.liquid-content {
  position: relative;
  z-index: 2;
}

.liquid-dots {
  display: flex;
  gap: 4px;
  align-items: center;
}

.dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #6b7280;
  animation: dot-bounce 1.4s ease-in-out infinite;
}

.dot:nth-child(1) { animation-delay: 0s; }
.dot:nth-child(2) { animation-delay: 0.2s; }
.dot:nth-child(3) { animation-delay: 0.4s; }

/* Variant-specific colors */
.liquid-loader.placed .liquid-wave {
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(59, 130, 246, 0.1) 25%, 
    rgba(59, 130, 246, 0.2) 50%, 
    rgba(59, 130, 246, 0.1) 75%, 
    transparent 100%
  );
}

.liquid-loader.placed .dot {
  background: #3b82f6;
}

.liquid-loader.delivered .liquid-wave {
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(34, 197, 94, 0.1) 25%, 
    rgba(34, 197, 94, 0.2) 50%, 
    rgba(34, 197, 94, 0.1) 75%, 
    transparent 100%
  );
}

.liquid-loader.delivered .dot {
  background: #22c55e;
}

.liquid-loader.rescheduled .liquid-wave {
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(245, 158, 11, 0.1) 25%, 
    rgba(245, 158, 11, 0.2) 50%, 
    rgba(245, 158, 11, 0.1) 75%, 
    transparent 100%
  );
}

.liquid-loader.rescheduled .dot {
  background: #f59e0b;
}

.liquid-loader.cancelled .liquid-wave {
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(239, 68, 68, 0.1) 25%, 
    rgba(239, 68, 68, 0.2) 50%, 
    rgba(239, 68, 68, 0.1) 75%, 
    transparent 100%
  );
}

.liquid-loader.cancelled .dot {
  background: #ef4444;
}

.liquid-loader.planned .liquid-wave {
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(139, 92, 246, 0.1) 25%, 
    rgba(139, 92, 246, 0.2) 50%, 
    rgba(139, 92, 246, 0.1) 75%, 
    transparent 100%
  );
}

.liquid-loader.planned .dot {
  background: #8b5cf6;
}

.liquid-loader.cost-saved .liquid-wave {
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(16, 185, 129, 0.1) 25%, 
    rgba(16, 185, 129, 0.2) 50%, 
    rgba(16, 185, 129, 0.1) 75%, 
    transparent 100%
  );
}

.liquid-loader.cost-saved .dot {
  background: #10b981;
}

@keyframes liquid-flow {
  0% {
    left: -100%;
    transform: skewX(-5deg);
  }
  100% {
    left: 100%;
    transform: skewX(5deg);
  }
}

@keyframes dot-bounce {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 1;
  }
  30% {
    transform: translateY(-4px);
    opacity: 0.7;
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .dot {
    width: 3px;
    height: 3px;
  }
}
</style>