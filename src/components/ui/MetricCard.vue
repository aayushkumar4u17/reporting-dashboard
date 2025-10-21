<template>
  <div class="metric-card" :class="[`metric-${variant}`, { 'animate-fade-in-up': isLoaded }]" :style="animationStyle">
    <div class="card-header">
      <div class="card-icon" :class="`icon-${variant}`">
        <slot name="icon">
          <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
        </slot>
      </div>
      <h3 class="card-title">{{ title }}</h3>
    </div>
    <div class="card-metrics">
      <div v-for="item in items" :key="item.label" class="metric-column">
        <div class="metric-label">{{ item.label }}</div>
        <div v-if="!loading" class="metric-value">{{ item.value }}</div>
        <div v-else class="metric-loader">
          <ModernLoader height="1.2rem" width="2.5rem" :variant="variant" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import ModernLoader from '@/components/ui/ModernLoader.vue'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  items: {
    type: Array,
    default: () => []
  },
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'placed', 'delivered', 'rescheduled', 'cancelled', 'planned', 'cost-saved'].includes(value)
  },
  loading: {
    type: Boolean,
    default: false
  },
  animationDelay: {
    type: Number,
    default: 0
  },
  trend: {
    type: Object,
    default: () => ({ value: '0%', type: 'neutral' })
  }
})

const isLoaded = ref(false)

const animationStyle = computed(() => ({
  'animation-delay': `${props.animationDelay}s`
}))

onMounted(() => {
  setTimeout(() => {
    isLoaded.value = true
  }, 100)
})
</script>

<style scoped>
.metric-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: 12px;
  padding: 0.75rem;
  box-shadow: 0 2px 8px var(--shadow-light);
  transition: all 0.3s ease;
  position: relative;
  opacity: 0;
  transform: translateY(20px);
  min-height: 85px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.metric-card.animate-fade-in-up {
  opacity: 1;
  transform: translateY(0);
}

/* Left border colors for each card type */
.metric-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 4px;
  background: var(--card-border-color, #3b82f6);
  border-radius: 12px 0 0 12px;
}

.metric-card.metric-placed {
  --card-border-color: #3b82f6;
}

.metric-card.metric-delivered {
  --card-border-color: #22c55e;
}

.metric-card.metric-rescheduled {
  --card-border-color: #f59e0b;
}

.metric-card.metric-cancelled {
  --card-border-color: #ef4444;
}

.metric-card.metric-planned {
  --card-border-color: #8b5cf6;
}

.metric-card.metric-cost-saved {
  --card-border-color: #06b6d4;
}

.metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px var(--shadow-color);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.card-icon {
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: var(--card-border-color, #3b82f6);
  color: white;
  flex-shrink: 0;
}

.card-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--card-border-color, #3b82f6);
  margin: 0;
  line-height: 1.2;
}

.card-metrics {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.metric-column {
  flex: 1;
  text-align: center;
  padding: 0 0.25rem;
}

.metric-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  margin-bottom: 0.25rem;
}

.metric-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1;
}

.metric-loader {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 1.5rem;
}

@media (max-width: 768px) {
  .metric-card {
    padding: 0.625rem;
    min-height: 70px;
  }
  
  .card-header {
    margin-bottom: 0.375rem;
  }
  
  .card-icon {
    width: 24px;
    height: 24px;
  }
  
  .card-title {
    font-size: 0.9rem;
  }
  
  .metric-value {
    font-size: 1.1rem;
  }
  
  .metric-label {
    font-size: 0.7rem;
  }
}

@media (max-width: 480px) {
  .metric-card {
    padding: 0.5rem;
    min-height: 65px;
  }
  
  .card-metrics {
    gap: 0.25rem;
  }
  
  .metric-value {
    font-size: 0.85rem;
  }
  
  .metric-column {
    padding: 0;
  }
}
</style>