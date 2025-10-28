<template>
  <div class="table-container" :class="{ 'animate-fade-in-up': isLoaded }">
    <div class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr class="table-header">
            <th v-for="column in columns" :key="column.key" class="header-cell">
              {{ column.label }}
            </th>
          </tr>
        </thead>
        <tbody>
          <!-- Skeleton loading rows -->
          <tr v-if="loading" v-for="i in 5" :key="i" class="table-row skeleton-row">
            <td v-for="column in columns" :key="column.key" class="table-cell">
              <SkeletonLoader width="80%" height="16px" />
            </td>
          </tr>
          
          <!-- Actual data rows -->
          <tr v-for="(item, index) in paginatedData" :key="item.id || index" 
              class="table-row">
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
      <div class="pagination-container">
        <button @click="prevPage" :disabled="currentPage === 1" class="pagination-btn prev-btn">
          <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15,18 9,12 15,6"></polyline>
          </svg>
          <span>Previous</span>
        </button>
        
        <div class="pagination-numbers">
          <button 
            v-for="page in visiblePages" 
            :key="page"
            @click="goToPage(page)"
            :class="['page-number', { active: page === currentPage, ellipsis: page === '...' }]"
            :disabled="page === '...'"
          >
            {{ page }}
          </button>
        </div>
        
        <button @click="nextPage" :disabled="currentPage === totalPages" class="pagination-btn next-btn">
          <span>Next</span>
          <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9,18 15,12 9,6"></polyline>
          </svg>
        </button>
      </div>
      
      <div class="pagination-info">
        <div class="info-section">
          <span class="info-label">Showing</span>
          <span class="info-range">{{ startItem }}-{{ endItem }}</span>
          <span class="info-label">of</span>
          <span class="info-total">{{ data.length }}</span>
          <span class="info-label">entries</span>
        </div>
        <div class="items-per-page">
          <label>Show:</label>
          <select v-model="itemsPerPageLocal" @change="updateItemsPerPage" class="items-select">
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>
        </div>
      </div>
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

  pagination: {
    type: Boolean,
    default: false
  },
  itemsPerPage: {
    type: Number,
    default: 10
  }
})

const isLoaded = ref(false)
const currentPage = ref(1)
const itemsPerPageLocal = ref(props.itemsPerPage)

const totalPages = computed(() => {
  if (!props.pagination) return 1
  return Math.ceil(props.data.length / itemsPerPageLocal.value)
})

const paginatedData = computed(() => {
  if (!props.pagination) return props.data
  const start = (currentPage.value - 1) * itemsPerPageLocal.value
  const end = start + itemsPerPageLocal.value
  return props.data.slice(start, end)
})

const startItem = computed(() => {
  if (props.data.length === 0) return 0
  return (currentPage.value - 1) * itemsPerPageLocal.value + 1
})

const endItem = computed(() => {
  const end = currentPage.value * itemsPerPageLocal.value
  return Math.min(end, props.data.length)
})

const visiblePages = computed(() => {
  const pages = []
  const total = totalPages.value
  const current = currentPage.value
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i)
      pages.push('...')
      pages.push(total)
    } else if (current >= total - 3) {
      pages.push(1)
      pages.push('...')
      for (let i = total - 4; i <= total; i++) pages.push(i)
    } else {
      pages.push(1)
      pages.push('...')
      for (let i = current - 1; i <= current + 1; i++) pages.push(i)
      pages.push('...')
      pages.push(total)
    }
  }
  
  return pages
})



// Watch for itemsPerPage prop changes
watch(() => props.itemsPerPage, (newValue) => {
  itemsPerPageLocal.value = newValue
  currentPage.value = 1
})



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

const updateItemsPerPage = () => {
  currentPage.value = 1
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



.table-row {
  border-bottom: 1px solid var(--border-medium);
  transition: background-color 0.2s ease;
}

.table-row:hover {
  background-color: var(--bg-hover);
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
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid var(--border-medium);
  background: var(--bg-glass);
  backdrop-filter: blur(20px);
  border-radius: 0 0 12px 12px;
  position: relative;
  overflow: hidden;
}

.pagination::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    var(--accent-primary) 50%, 
    transparent 100%);
}

.pagination-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
}

.pagination-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: 1px solid var(--border-light);
  background: var(--accent-primary);
  color: white;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 15px rgba(0, 200, 81, 0.2);
  position: relative;
  overflow: hidden;
  min-width: 100px;
  justify-content: center;
}

.pagination-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, 
    transparent, 
    rgba(255, 255, 255, 0.3), 
    transparent);
  transition: left 0.5s ease;
}

.pagination-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  background: var(--accent-secondary);
  box-shadow: 0 8px 25px rgba(0, 200, 81, 0.3);
}

.pagination-btn:hover:not(:disabled)::before {
  left: 100%;
}

.pagination-btn:active:not(:disabled) {
  transform: translateY(0);
  transition: all 0.1s ease;
}

.pagination-btn:disabled {
  background: var(--bg-secondary);
  color: var(--text-secondary);
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
  border-color: var(--border-medium);
}

.btn-icon {
  width: 16px;
  height: 16px;
  stroke-width: 2;
}

.pagination-numbers {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0 1rem;
}

.page-number {
  width: 40px;
  height: 40px;
  border: 1px solid var(--border-light);
  background: var(--bg-primary);
  color: var(--text-primary);
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px var(--shadow-light);
}

.page-number:hover:not(.active):not(:disabled) {
  background: var(--accent-light);
  border-color: var(--accent-primary);
  color: var(--accent-primary);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 200, 81, 0.2);
}

.page-number.active {
  background: var(--accent-primary);
  color: white;
  border-color: var(--accent-primary);
  box-shadow: 0 4px 15px rgba(0, 200, 81, 0.3);
  transform: translateY(-1px);
}

.page-number.ellipsis {
  background: transparent;
  color: var(--text-tertiary);
  cursor: default;
  box-shadow: none;
  border: none;
  font-weight: 700;
}

.pagination-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: var(--bg-glass-secondary);
  border-radius: 8px;
  border: 1px solid var(--border-light);
  backdrop-filter: blur(8px);
  box-shadow: 0 2px 10px var(--shadow-light);
}

.info-section {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
}

.info-label {
  color: var(--text-secondary);
  font-weight: 500;
}

.info-range, .info-total {
  color: var(--accent-primary);
  font-weight: 700;
}

.items-per-page {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.items-per-page label {
  color: var(--text-secondary);
  font-weight: 600;
  font-size: 0.85rem;
}

.items-select {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border-light);
  border-radius: 6px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.85rem;
}

.items-select:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px var(--accent-light);
}

.items-select:hover {
  border-color: var(--accent-primary);
}

@media (max-width: 1200px) {
  .header-cell,
  .table-cell {
    padding: 0.6rem 0.3rem;
    font-size: 0.75rem;
  }
  
  .pagination {
    padding: 1rem;
    gap: 0.75rem;
  }
  
  .pagination-container {
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .pagination-btn {
    padding: 0.625rem 1rem;
    font-size: 0.8rem;
    min-width: 90px;
  }
  
  .pagination-numbers {
    order: 3;
    width: 100%;
    justify-content: center;
    padding: 0;
  }
  
  .pagination-info {
    flex-direction: column;
    gap: 0.75rem;
    padding: 0.75rem;
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
  
  .pagination {
    padding: 0.75rem 0.5rem;
  }
  
  .pagination-btn {
    padding: 0.5rem 0.75rem;
    font-size: 0.75rem;
    min-width: 80px;
  }
  
  .pagination-btn span {
    display: none;
  }
  
  .page-number {
    width: 32px;
    height: 32px;
    font-size: 0.75rem;
  }
  
  .pagination-info {
    font-size: 0.75rem;
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
  
  .pagination {
    padding: 0.5rem 0.25rem;
  }
  
  .pagination-numbers {
    gap: 0.25rem;
  }
  
  .page-number {
    width: 28px;
    height: 28px;
    font-size: 0.7rem;
  }
  
  .pagination-btn {
    padding: 0.375rem;
    min-width: auto;
    width: 36px;
    height: 36px;
  }
  
  .info-section {
    flex-direction: column;
    gap: 0.25rem;
    text-align: center;
  }
}
</style>