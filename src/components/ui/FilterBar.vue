<template>
  <div class="filter-bar" :class="{ 'animate-slide-down': isLoaded }">
    <div class="filter-group" v-if="filters.includes('deliveryDate')">
      <label class="filter-label">Delivery Date</label>
      <DatePicker v-model="localFilters.deliveryDate" placeholder="Select Delivery Date" />
    </div>

    <div class="filter-group" v-if="filters.includes('orderDate')">
      <label class="filter-label">Order Date</label>
      <DatePicker v-model="localFilters.orderDate" placeholder="Select Order Date" />
    </div>

    <template v-if="filters.includes('deliveryDateRange')">
      <div class="filter-group">
        <label class="filter-label">Delivery Date From</label>
        <DatePicker v-model="localFilters.deliveryDateFrom" placeholder="From Date" />
      </div>
      <div class="filter-group">
        <label class="filter-label">Delivery Date To</label>
        <DatePicker v-model="localFilters.deliveryDateTo" placeholder="To Date" />
      </div>
    </template>

    <template v-if="filters.includes('orderDateRange')">
      <div class="filter-group">
        <label class="filter-label">Order Date From</label>
        <DatePicker v-model="localFilters.orderDateFrom" placeholder="From Date" />
      </div>
      <div class="filter-group">
        <label class="filter-label">Order Date To</label>
        <DatePicker v-model="localFilters.orderDateTo" placeholder="To Date" />
      </div>
    </template>

    <div class="filter-group" v-if="filters.includes('state')">
      <label class="filter-label">State</label>
      <select v-model="localFilters.state" class="filter-select">
        <option value="">Select State</option>
        <option v-for="state in stateOptions" :key="state" :value="state">{{ state }}</option>
      </select>
    </div>

    <div class="filter-group" v-if="filters.includes('city')">
      <label class="filter-label">City</label>
      <select v-model="localFilters.city" class="filter-select">
        <option value="">Select City</option>
        <option v-for="city in cityOptions" :key="city" :value="city">{{ city }}</option>
      </select>
    </div>

    <div class="filter-group" v-if="filters.includes('poc')">
      <label class="filter-label">POC</label>
      <select v-model="localFilters.poc" class="filter-select">
        <option value="">Select POC</option>
        <option v-for="poc in pocOptions" :key="poc" :value="poc">{{ poc }}</option>
      </select>
    </div>

    <div class="filter-group" v-if="filters.includes('search')">
      <label class="filter-label">Search</label>
      <input 
        v-model="localFilters.search" 
        class="filter-input" 
        placeholder="Search orders..."
        type="text"
      />
    </div>

    <div class="filter-actions">
      <slot name="actions"></slot>
      <AnimatedButton @click="applyFilters" variant="primary" size="small" :loading="loading">
        Apply Filter
      </AnimatedButton>
      <AnimatedButton @click="clearFilters" variant="clear" size="small">
        Clear All
      </AnimatedButton>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import DatePicker from '@/components/layout/DatePicker.vue'
import AnimatedButton from '@/components/layout/AnimatedButton.vue'

const props = defineProps({
  filters: {
    type: Array,
    default: () => []
  },
  stateOptions: {
    type: Array,
    default: () => []
  },
  cityOptions: {
    type: Array,
    default: () => []
  },
  pocOptions: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  modelValue: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:modelValue', 'apply', 'clear'])

const isLoaded = ref(false)
const localFilters = ref({
  deliveryDate: '',
  orderDate: '',
  deliveryDateFrom: '',
  deliveryDateTo: '',
  orderDateFrom: '',
  orderDateTo: '',
  state: '',
  city: '',
  poc: '',
  search: ''
})

const isUpdatingFromProps = ref(false)

// Watch for prop changes
watch(() => props.modelValue, (newValue) => {
  isUpdatingFromProps.value = true
  localFilters.value = { ...localFilters.value, ...newValue }
  isUpdatingFromProps.value = false
}, { immediate: true })

// Watch for local changes
watch(localFilters, (newValue) => {
  if (!isUpdatingFromProps.value) {
    emit('update:modelValue', newValue)
  }
}, { deep: true })

const applyFilters = () => {
  emit('apply', localFilters.value)
}

const clearFilters = () => {
  localFilters.value = {
    deliveryDate: '',
    orderDate: '',
    deliveryDateFrom: '',
    deliveryDateTo: '',
    orderDateFrom: '',
    orderDateTo: '',
    state: '',
    city: '',
    poc: '',
    search: ''
  }
  emit('clear')
}

onMounted(() => {
  setTimeout(() => {
    isLoaded.value = true
  }, 100)
})
</script>

<style scoped>
.filter-bar {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 1rem;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.2);
  margin-bottom: 1.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: flex-end;
  border: 1px solid rgba(0, 200, 81, 0.1);
  position: relative;
  z-index: 10;
  opacity: 0;
  transform: translateY(-20px);
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.filter-bar.animate-slide-down {
  opacity: 1;
  transform: translateY(0);
}

.filter-group {
  display: flex;
  flex-direction: column;
  min-width: 130px;
  width: 130px;
  flex-shrink: 0;
}

.filter-label {
  font-size: 0.9rem;
  color: #333;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.filter-select, .filter-input {
  padding: 0.6rem;
  border: 2px solid rgba(0, 200, 81, 0.3);
  border-radius: 10px;
  font-size: 0.85rem;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(5px);
  color: #333;
  width: 130px;
  height: 40px;
  box-sizing: border-box;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.filter-input {
  cursor: text;
}

.filter-select:hover, .filter-input:hover {
  border-color: rgba(0, 200, 81, 0.6);
  background: rgba(255, 255, 255, 0.95);
  transform: translateY(-1px);
}

.filter-select:focus, .filter-input:focus {
  outline: none;
  border-color: #00C851;
  box-shadow: 0 0 0 3px rgba(0, 200, 81, 0.2);
  transform: translateY(-2px);
}

.filter-actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  margin-left: auto;
}

@media (max-width: 768px) {
  .filter-bar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-group {
    min-width: auto;
  }
  
  .filter-actions {
    margin-left: 0;
    width: 100%;
    justify-content: center;
  }
}
</style>