<template>
  <div class="metric-card" :class="[`metric-${variant}`, { 'animate-fade-in-up': isLoaded }]" :style="animationStyle">
    <div class="metric-header">
      <div class="metric-icon" :class="`icon-${variant}`">
        <slot name="icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
        </slot>
      </div>
      <h3 class="metric-title">{{ title }}</h3>
    </div>
    <div class="metric-content">
      <div v-for="item in items" :key="item.label" class="metric-item">
        <span class="metric-label">{{ item.label }}</span>
        <span v-if="!loading" class="metric-value">{{ item.value }}</span>
        <SkeletonLoader v-else height="1.5rem" width="3rem" />
      </div>
    </div>
    <div v-if="trend && trend.value !== '0%'" class="metric-trend" :class="`trend-${trend.type}`">
      <svg v-if="trend.type === 'positive'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="23,6 13.5,15.5 8.5,10.5 1,18"/>
        <polyline points="17,6 23,6 23,12"/>
      </svg>
      <svg v-else-if="trend.type === 'negative'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="23,18 13.5,8.5 8.5,13.5 1,6"/>
        <polyline points="17,18 23,18 23,12"/>
      </svg>
      <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
      <span class="trend-text">{{ trend.value }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import SkeletonLoader from '@/components/layout/SkeletonLoader.vue'

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
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(0, 200, 81, 0.15);
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 
    0 4px 20px rgba(0, 0, 0, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.06);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  opacity: 0;
  transform: translateY(20px);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.metric-card.animate-fade-in-up {
  opacity: 1;
  transform: translateY(0);
}

.metric-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--card-accent, #00C851), var(--card-accent-dark, #00A844));
  border-radius: 12px 12px 0 0;
}

.metric-card.metric-placed {
  --card-accent: #3b82f6;
  --card-accent-dark: #2563eb;
}

.metric-card.metric-delivered {
  --card-accent: #22c55e;
  --card-accent-dark: #16a34a;
}

.metric-card.metric-rescheduled {
  --card-accent: #f59e0b;
  --card-accent-dark: #d97706;
}

.metric-card.metric-cancelled {
  --card-accent: #ef4444;
  --card-accent-dark: #dc2626;
}

.metric-card.metric-planned {
  --card-accent: #8b5cf6;
  --card-accent-dark: #7c3aed;
}

.metric-card.metric-cost-saved {
  --card-accent: #10b981;
  --card-accent-dark: #059669;
}

.metric-card:hover {
  transform: translateY(-6px);
  box-shadow: 
    0 12px 32px rgba(0, 200, 81, 0.15),
    0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: rgba(0, 200, 81, 0.25);
}

.metric-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.metric-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: linear-gradient(135deg, rgba(0, 200, 81, 0.1), rgba(0, 200, 81, 0.05));
}

.metric-icon.icon-placed {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.05));
  color: #3b82f6;
}

.metric-icon.icon-delivered {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(34, 197, 94, 0.05));
  color: #22c55e;
}

.metric-icon.icon-rescheduled {
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(251, 191, 36, 0.05));
  color: #fbbf24;
}

.metric-icon.icon-cancelled {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05));
  color: #ef4444;
}

.metric-icon.icon-planned {
  background: linear-gradient(135deg, rgba(147, 51, 234, 0.1), rgba(147, 51, 234, 0.05));
  color: #9333ea;
}

.metric-icon.icon-cost-saved {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05));
  color: #10b981;
}

.metric-title {
  color: #00C851;
  font-size: 1rem;
  font-weight: 600;
  position: relative;
  margin: 0;
}

.metric-title::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 0;
  width: 30px;
  height: 2px;
  background: linear-gradient(90deg, #00C851, #00A844);
  border-radius: 1px;
}

.metric-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.metric-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  flex: 1;
  padding: 1rem;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(0, 200, 81, 0.08) 0%, rgba(0, 200, 81, 0.04) 100%);
  transition: all 0.3s ease;
}

.metric-item:hover {
  background: linear-gradient(135deg, rgba(0, 200, 81, 0.12) 0%, rgba(0, 200, 81, 0.08) 100%);
  transform: translateY(-2px);
}

.metric-label {
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 0.5rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.8px;
}

.metric-value {
  font-size: 1.2rem;
  font-weight: 700;
  color: #333;
  transition: color 0.3s ease;
  line-height: 1.2;
}

.metric-item:hover .metric-value {
  color: #00C851;
}

@media (max-width: 768px) {
  .metric-card {
    padding: 1.5rem;
    border-radius: 16px;
  }
  
  .metric-content {
    flex-direction: row;
    gap: 1rem;
  }
  
  .metric-item {
    padding: 0.75rem;
  }
  
  .metric-title {
    font-size: 1rem;
    margin-bottom: 1rem;
  }
  
  .metric-value {
    font-size: 1.3rem;
  }
}

.metric-trend {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-top: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
}

.trend-positive {
  background: rgba(34, 197, 94, 0.1);
  color: #16a34a;
}

.trend-negative {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

.trend-neutral {
  background: rgba(107, 114, 128, 0.1);
  color: #6b7280;
}

.trend-text {
  font-size: 0.75rem;
}

@media (max-width: 480px) {
  .metric-card {
    padding: 1.25rem;
    border-radius: 14px;
  }
  
  .metric-content {
    gap: 0.75rem;
  }
  
  .metric-item {
    padding: 0.75rem 0.5rem;
  }
  
  .metric-value {
    font-size: 1.1rem;
  }
  
  .metric-label {
    font-size: 0.75rem;
  }
  
  .metric-trend {
    margin-top: 0.5rem;
    padding: 0.2rem 0.4rem;
  }
}
</style>