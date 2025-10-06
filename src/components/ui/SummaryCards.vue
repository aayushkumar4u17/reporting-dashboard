<template>
  <div class="summary-section" :class="{ 'animate-fade-in-up': isLoaded }">
    <div class="summary-cards">
      <div v-for="card in cards" :key="card.key" class="summary-card" :class="card.class">
        <div class="card-header">{{ card.label }}</div>
        <div v-if="!loading" class="card-value" :class="card.valueClass">{{ card.value }}</div>
        <ModernLoader v-else width="60%" height="24px" />
      </div>
      
      <div v-if="showActions" class="action-buttons">
        <div v-for="action in actions" :key="action.key" class="summary-card action-card">
          <AnimatedButton 
            :variant="action.variant" 
            size="small" 
            style="width: 100%;"
            @click="$emit('action-click', action.key)"
          >
            {{ action.label }}
          </AnimatedButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import ModernLoader from '@/components/ui/ModernLoader.vue'
import AnimatedButton from '@/components/layout/AnimatedButton.vue'

const props = defineProps({
  cards: {
    type: Array,
    required: true
  },
  actions: {
    type: Array,
    default: () => []
  },
  showActions: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['action-click'])

const isLoaded = ref(false)

onMounted(() => {
  setTimeout(() => {
    isLoaded.value = true
  }, 100)
})
</script>

<style scoped>
.summary-section {
  margin-bottom: 1.5rem;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.summary-section.animate-fade-in-up {
  opacity: 1;
  transform: translateY(0);
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  align-items: stretch;
}

.summary-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(99, 102, 241, 0.15);
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.summary-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 32px rgba(107, 114, 128, 0.12);
  border-color: rgba(107, 114, 128, 0.25);
}

.card-header {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.card-value {
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1.2;
}

.card-value.green {
  color: #00C851;
}

.card-value.red {
  color: #e53e3e;
}

.card-value.blue {
  color: #3b82f6;
}

.card-value.orange {
  color: #f59e0b;
}

.action-buttons {
  display: contents;
}

.action-card {
  padding: 0.75rem;
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
}

/* Custom button styling for action cards */
.action-card :deep(.animated-btn) {
  background: linear-gradient(135deg, #00C851, #00A844) !important;
  color: white !important;
  border: none !important;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 12px rgba(0, 200, 81, 0.3);
}

.action-card :deep(.animated-btn:hover) {
  background: linear-gradient(135deg, #00A844, #008A3A) !important;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 200, 81, 0.4);
}

.action-card:nth-child(5) :deep(.animated-btn) {
  background: linear-gradient(135deg, #00C851, #00A844) !important;
}

.action-card:nth-child(6) :deep(.animated-btn) {
  background: linear-gradient(135deg, #f59e0b, #d97706) !important;
}

.action-card:nth-child(6) :deep(.animated-btn:hover) {
  background: linear-gradient(135deg, #d97706, #b45309) !important;
  box-shadow: 0 6px 16px rgba(245, 158, 11, 0.4);
}

@media (max-width: 768px) {
  .summary-cards {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 0.75rem;
  }
  
  .summary-card {
    padding: 1rem;
  }
  
  .card-header {
    font-size: 0.8rem;
    margin-bottom: 0.5rem;
  }
  
  .card-value {
    font-size: 1.25rem;
  }
}

@media (max-width: 480px) {
  .summary-cards {
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
  }
  
  .summary-card {
    padding: 0.75rem;
  }
  
  .card-header {
    font-size: 0.75rem;
  }
  
  .card-value {
    font-size: 1.1rem;
  }
}
</style>