<template>
  <div class="table-container" :class="{ 'animate-fade-in-up': isLoaded }">
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
  }
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
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(0, 200, 81, 0.15);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.2);
  overflow-x: auto;
  overflow-y: visible;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0;
  transform: translateY(20px);
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 100%;
}

.table-container.animate-fade-in-up {
  opacity: 1;
  transform: translateY(0);
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.table-header {
  background-color: #f8f9fa;
}

.header-cell {
  padding: 1rem 0.5rem;
  text-align: left;
  font-weight: 600;
  color: #333;
  border-bottom: 2px solid #e9ecef;
  font-size: 0.9rem;
  white-space: nowrap;
}

.checkbox-column {
  width: 40px;
  text-align: center;
}

.table-row {
  border-bottom: 1px solid #e9ecef;
  transition: background-color 0.2s ease;
}

.table-row:hover {
  background-color: #f8f9fa;
}

.table-row.selected {
  background-color: rgba(0, 200, 81, 0.05);
}

.table-cell {
  padding: 1rem 0.5rem;
  color: #333;
  font-size: 0.85rem;
  vertical-align: middle;
  word-wrap: break-word;
  word-break: break-word;
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

.status-delivered {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.status-in-transit {
  background-color: #fff3cd;
  color: #856404;
  border: 1px solid #ffeaa7;
}

.status-to-be-assigned {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.status-paid {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.status-unpaid {
  background-color: #fff3cd;
  color: #856404;
  border: 1px solid #ffeaa7;
}

.status-overdue {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.status-allowed {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.status-not-allowed {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.status-default {
  background-color: #e2e3e5;
  color: #383d41;
  border: 1px solid #d6d8db;
}

.skeleton-row .table-cell {
  padding: 0.6rem 0.4rem;
}

.no-data-message {
  text-align: center;
  padding: 2rem;
  color: #666;
  font-size: 1rem;
  font-weight: 500;
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-top: 1px solid #e9ecef;
  background: rgba(248, 249, 250, 0.8);
}

.pagination-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #00C851;
  background: white;
  color: #00C851;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s ease;
}

.pagination-btn:hover:not(:disabled) {
  background: #00C851;
  color: white;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  font-size: 0.85rem;
  color: #666;
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