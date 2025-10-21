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

    <template v-if="filters.includes('dateRanges')">
      <div class="filter-group">
        <label class="filter-label">Delivery Date</label>
        <DateRangePicker v-model="localFilters.deliveryDateRange" placeholder="Select Delivery Date" @update:modelValue="onDeliveryDateChange" />
      </div>
      <div class="filter-group">
        <label class="filter-label">Order Date</label>
        <DateRangePicker v-model="localFilters.orderDateRange" placeholder="Select Order Date" @update:modelValue="onOrderDateChange" />
      </div>
    </template>

    <!-- Legacy support for existing filters -->
    <template v-if="filters.includes('deliveryDateRange') && !filters.includes('dateRange')">
      <div class="filter-group">
        <label class="filter-label">Delivery Date From</label>
        <DatePicker v-model="localFilters.deliveryDateFrom" placeholder="From Date" />
      </div>
      <div class="filter-group">
        <label class="filter-label">Delivery Date To</label>
        <DatePicker v-model="localFilters.deliveryDateTo" placeholder="To Date" />
      </div>
    </template>

    <template v-if="filters.includes('orderDateRange') && !filters.includes('dateRange')">
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
      <CustomDropdown 
        v-model="localFilters.state" 
        :options="stateOptions"
        placeholder="Select State"
      />
    </div>

    <div class="filter-group" v-if="filters.includes('city')">
      <label class="filter-label">City</label>
      <CustomDropdown 
        v-model="localFilters.city" 
        :options="cityOptions"
        placeholder="Select City"
      />
    </div>

    <div class="filter-group" v-if="filters.includes('poc')">
      <label class="filter-label">POC</label>
      <CustomDropdown 
        v-model="localFilters.poc" 
        :options="pocOptions"
        placeholder="Select POC"
      />
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
      <button 
        @click="applyFilters" 
        class="apply-filter-btn" 
        :disabled="loading"
      >
        {{ loading ? 'Applying...' : 'Apply Filter' }}
      </button>
      <button 
        @click="clearFilters" 
        class="clear-all-btn" 
        :disabled="loading"
      >
        {{ loading ? 'Clearing...' : 'Clear All' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import DatePicker from '@/components/layout/DatePicker.vue'
import DateRangePicker from '@/components/layout/DateRangePicker.vue'
import AnimatedButton from '@/components/layout/AnimatedButton.vue'
import CustomDropdown from '@/components/ui/CustomDropdown.vue'

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
  orderDateRange: { from: '', to: '' },
  deliveryDateRange: { from: '', to: '' },
  state: '',
  city: '',
  poc: '',
  search: ''
})

const isUpdatingFromProps = ref(false)

// Watch for prop changes
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    isUpdatingFromProps.value = true
    Object.assign(localFilters.value, newValue)
    isUpdatingFromProps.value = false
  }
}, { immediate: true })

// Watch for local changes with debounce
watch(localFilters, (newValue) => {
  if (!isUpdatingFromProps.value) {
    emit('update:modelValue', newValue)
  }
}, { deep: true, flush: 'post' })

const applyFilters = () => {
  // Convert date range objects to individual date fields for backend compatibility
  const filtersToEmit = { 
    ...localFilters.value,
    orderDateFrom: localFilters.value.orderDateRange.from || '',
    orderDateTo: localFilters.value.orderDateRange.to || '',
    deliveryDateFrom: localFilters.value.deliveryDateRange.from || '',
    deliveryDateTo: localFilters.value.deliveryDateRange.to || '',
    city: localFilters.value.city || '',
    poc: localFilters.value.poc || '',
    search: localFilters.value.search || ''
  }
  
  emit('apply', filtersToEmit)
}

const onDeliveryDateChange = (value) => {
  if (value && (value.from || value.to)) {
    localFilters.value.orderDateRange = { from: '', to: '' }
  }
}

const onOrderDateChange = (value) => {
  if (value && (value.from || value.to)) {
    localFilters.value.deliveryDateRange = { from: '', to: '' }
  }
}

const clearFilters = () => {
  localFilters.value = {
    deliveryDate: '',
    orderDate: '',
    deliveryDateFrom: '',
    deliveryDateTo: '',
    orderDateFrom: '',
    orderDateTo: '',
    orderDateRange: { from: '', to: '' },
    deliveryDateRange: { from: '', to: '' },
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
  top: auto;
  background: var(--bg-glass);
  backdrop-filter: blur(10px);
  padding: 1rem 2rem;
  margin-left: -2rem;
  margin-right: -2rem;
  display: flex;
  flex-wrap: wrap;
  gap: 4rem;
  align-items: flex-end;
  position: relative;
  z-index: 10;
  opacity: 0;
  transform: translateY(-20px);
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  box-sizing: border-box;
  border: 1px solid var(--border-color);
  /* border-radius: 12px; */
  /* box-shadow: 0 8px 32px var(--shadow-color), 0 0 0 1px var(--border-light); */
}

.filter-bar.animate-slide-down {
  opacity: 1;
  transform: translateY(0);
}

.filter-group {
  display: flex;
  flex-direction: column;
  min-width: 130px;
  flex: 1;
  position: relative;
  z-index: 1;
}

.filter-group:has(.date-range-picker) {
  min-width: 220px;
  width: 220px;
  z-index: 100000;
}

.filter-label {
  font-size: 1rem;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.filter-select, .filter-input {
  padding: 0.6rem;
  border: 2px solid var(--border-medium);
  border-radius: 10px;
  font-size: 0.85rem;
  background: var(--bg-primary);
  color: var(--text-primary);
  width: 100px;
  height: 40px;
  box-sizing: border-box;
  transition: all 0.3s ease;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-right: 2.5rem;
  position: relative;
  z-index: 10;
}

.filter-input {
  cursor: text;
  background-image: none;
  padding-right: 0.6rem;
}



.filter-select:focus, .filter-input:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px var(--accent-light);
  z-index: 100;
}

.filter-actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  margin-left: auto;
  flex-shrink: 0;
}

.apply-filter-btn {
  background: transparent;
  color: var(--text-primary);
  border: 2px solid var(--border-medium);
  border-radius: 8px;
  padding: 0.6rem 1.2rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  min-width: 100px;
  height: 40px;
}

.apply-filter-btn:hover:not(:disabled) {
  background: var(--accent-primary);
  color: var(--text-inverse);
  border-color: var(--accent-primary);
  transform: translateY(-1px);
}

.apply-filter-btn:active:not(:disabled) {
  transform: translateY(0);
}

.apply-filter-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.clear-all-btn {
  background: transparent;
  color: var(--text-primary);
  border: 2px solid var(--border-medium);
  border-radius: 8px;
  padding: 0.6rem 1.2rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  min-width: 80px;
  height: 40px;
}

.clear-all-btn:hover:not(:disabled) {
  background: var(--accent-primary);
  color: var(--text-inverse);
  border-color: var(--accent-primary);
  transform: translateY(-1px);
}

.clear-all-btn:active:not(:disabled) {
  transform: translateY(0);
}

.clear-all-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .filter-bar {
    flex-direction: column;
    align-items: stretch;
    padding: 1rem;
    margin-left: -1rem;
    margin-right: -1rem;
    width: 100vw;
  }
  
  .filter-group {
    min-width: auto;
  }
  
  .filter-actions {
    margin-left: 0;
    width: 100%;
    justify-content: center;
    margin-top: 1rem;
  }
  
  .apply-filter-btn,
  .clear-all-btn {
    flex: 1;
    max-width: 120px;
  }
}

@media (max-width: 480px) {
  .filter-bar {
    padding: 0.75rem;
    margin: 0.75rem;
    width: calc(100% - 1.5rem);
    gap: 0.75rem;
  }
  
  .filter-actions {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .apply-filter-btn,
  .clear-all-btn {
    max-width: none;
  }
}
</style>