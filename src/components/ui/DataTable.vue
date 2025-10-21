<template>
  <div class="table-container" :class="{ 'animate-fade-in-up': isLoaded }">
    <div class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr class="table-header">
            <th v-if="showCheckbox" class="checkbox-column">
              <input type="checkbox" v-model="selectAll" @change="toggleAllSelection">
            </th>
            <th v-for="column in columns" :key="column.key" class="header-cell">
              {{ column.label }}
            </th>
          </tr>
        </thead>
        <tbody>
          <!-- Skeleton loading rows -->
          <tr v-if="loading" v-for="i in 5" :key="i" class="table-row skeleton-row">
            <td v-if="showCheckbox" class="table-cell">
              <SkeletonLoader width="16px" height="16px" />
            </td>
            <td v-for="column in columns" :key="column.key" class="table-cell">
              <SkeletonLoader width="80%" height="16px" />
            </td>
          </tr>
          
          <!-- Actual data rows -->
          <tr v-for="(item, index) in paginatedData" :key="item.id || index" 
              class="table-row" 
              :class="{ 'selected': item.selected }">
            <td v-if="showCheckbox" class="checkbox-column">
              <input type="checkbox" v-model="item.selected" @change="onItemSelectionChange">
            </td>
            <td v-for="column in columns" :key="column.key" 
                class="table-cell" 
                :class="{ 'center-cell': column.key === 'downloadAction' }"
                :title="item[column.key]">
              <slot :name="`cell-${column.key}`" :item="item" :value="item[column.key]">
                <span v-if="column.type === 'status'" 
                      :class="['status-badge', getStatusClass(item[column.key])]">
                  {{ item[column.key] }}
                </span>
                <span v-else-if="column.type === 'currency'">
                  {{ formatCurrency(item[column.key]) }}
                </span>
                <span v-else>{{ item[column.key] }}</span>
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- No data message -->
    <div v-if="!loading && data.length === 0" class="no-data-message">
      No data found
    </div>
    
    <!-- Pagination -->
    <div v-if="pagination && !loading && data.length > 0" class="pagination">
      <button @click="prevPage" :disabled="currentPage === 1" class="pagination-btn">
        Previous
      </button>
      <span class="pagination-info">
        Page {{ currentPage }} of {{ totalPages }} ({{ data.length }} total)
      </span>
      <button @click="nextPage" :disabled="currentPage === totalPages" class="pagination-btn">
        Next
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import SkeletonLoader from '@/components/layout/SkeletonLoader.vue'

const props = defineProps({
  columns: {
    type: Array,
    required: true
  },
  data: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  showCheckbox: {
    type: Boolean,
    default: false
  },
  pagination: {
    type: Boolean,
    default: false
  },
  itemsPerPage: {
    type: Number,
    default: 10
  },

})

const emit = defineEmits(['selection-change'])

const isLoaded = ref(false)
const selectAll = ref(false)
const currentPage = ref(1)

const totalPages = computed(() => {
  if (!props.pagination) return 1
  return Math.ceil(props.data.length / props.itemsPerPage)
})

const paginatedData = computed(() => {
  if (!props.pagination) return props.data
  const start = (currentPage.value - 1) * props.itemsPerPage
  const end = start + props.itemsPerPage
  return props.data.slice(start, end)
})



// Watch for changes in data selection to update selectAll state
watch(() => props.data.map(item => item.selected), () => {
  updateSelectAllState()
}, { deep: true })

const updateSelectAllState = () => {
  if (props.data.length === 0) {
    selectAll.value = false
    return
  }
  selectAll.value = props.data.every(item => item.selected)
}

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

const toggleAllSelection = () => {
  props.data.forEach(item => {
    item.selected = selectAll.value
  })
  emit('selection-change', props.data.filter(item => item.selected))
}

const onItemSelectionChange = () => {
  updateSelectAllState()
  emit('selection-change', props.data.filter(item => item.selected))
}

const getStatusClass = (status) => {
  const statusMap = {
    'Delivered': 'status-delivered',
    'In Transit': 'status-in-transit',
    'To be assigned': 'status-to-be-assigned',
    'Paid': 'status-paid',
    'Unpaid': 'status-unpaid',
    'Overdue': 'status-overdue',
    'Y': 'status-allowed',
    'N': 'status-not-allowed',
    'Allowed': 'status-allowed',
    'Not Allowed': 'status-not-allowed'
  }
  return statusMap[status] || 'status-default'
}

const formatCurrency = (amount) => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0
  }).format(numAmount || 0)
}

onMounted(() => {
  setTimeout(() => {
    isLoaded.value = true
  }, 100)
})
</script>

<style scoped>
.table-container {
  background: var(--bg-glass);
  backdrop-filter: blur(12px);
  border: 1px solid var(--border-color);
  /* border-radius: 16px; */
  /* box-shadow: 0 8px 32px var(--shadow-color), 0 0 0 1px var(--border-light); */
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0;
  transform: translateY(20px);
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.table-container.animate-fade-in-up {
  opacity: 1;
  transform: translateY(0);
}

.table-wrapper {
  flex: 1;
  overflow-y: auto;
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: auto;
  min-width: 1000px;
}

.table-header {
  background-color: var(--bg-secondary);
}

.header-cell {
  padding: 1rem 0.75rem;
  text-align: left;
  font-weight: 600;
  color: var(--text-primary);
  border-bottom: 2px solid var(--border-medium);
  font-size: 0.9rem;
  white-space: nowrap;
  min-width: 120px;
}

.checkbox-column {
  width: 40px;
  text-align: center;
}

.table-row {
  border-bottom: 1px solid var(--border-medium);
  transition: background-color 0.2s ease;
}

.table-row:hover {
  background-color: var(--bg-hover);
}

.table-row.selected {
  background-color: var(--accent-light);
}

.table-cell {
  padding: 1rem 0.75rem;
  color: var(--text-primary);
  font-size: 0.85rem;
  vertical-align: middle;
  word-wrap: break-word;
  word-break: break-word;
  min-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.center-cell {
  text-align: center;
}

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 500;
  text-align: center;
  display: inline-block;
  min-width: 80px;
}

.status-delivered,
.status-paid,
.status-allowed {
  background-color: var(--status-success);
  color: var(--status-success-text);
  border: 1px solid var(--status-success-text);
}

.status-in-transit,
.status-unpaid {
  background-color: var(--status-warning);
  color: var(--status-warning-text);
  border: 1px solid var(--status-warning-text);
}

.status-to-be-assigned,
.status-overdue,
.status-not-allowed {
  background-color: var(--status-error);
  color: var(--status-error-text);
  border: 1px solid var(--status-error-text);
}

.status-default {
  background-color: var(--bg-secondary);
  color: var(--text-secondary);
  border: 1px solid var(--border-medium);
}

.skeleton-row .table-cell {
  padding: 0.6rem 0.4rem;
}

.no-data-message {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
  font-size: 1rem;
  font-weight: 500;
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-top: 1px solid var(--border-medium);
  background: var(--bg-glass-secondary);
  flex-shrink: 0;
}

.pagination-btn {
  padding: 0.5rem 1rem;
  border: 1px solid var(--accent-primary);
  background: var(--bg-primary);
  color: var(--accent-primary);
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s ease;
}

.pagination-btn:hover:not(:disabled) {
  background: var(--accent-primary);
  color: var(--text-inverse);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  font-size: 0.85rem;
  color: var(--text-secondary);
  font-weight: 500;
}

@media (max-width: 1200px) {
  .header-cell,
  .table-cell {
    padding: 0.6rem 0.3rem;
    font-size: 0.75rem;
  }
}

@media (max-width: 768px) {
  .data-table {
    font-size: 0.7rem;
  }
  
  .header-cell,
  .table-cell {
    padding: 0.4rem 0.2rem;
    font-size: 0.65rem;
    word-break: break-all;
  }
  
  .table-cell {
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

@media (max-width: 480px) {
  .header-cell,
  .table-cell {
    padding: 0.3rem 0.15rem;
    font-size: 0.6rem;
  }
  
  .table-cell {
    max-width: 80px;
  }
}
</style>