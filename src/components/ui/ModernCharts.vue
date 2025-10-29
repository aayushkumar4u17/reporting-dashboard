<template>
  <div class="modern-charts">
    <!-- Order Status Distribution (Pie Chart) -->
    <div class="chart-card pie-chart">
      <div class="chart-header">
        <h3 class="chart-title">Order Status Distribution</h3>
      </div>
      <div class="chart-container">
        <div v-if="donutChartLoading || props.loading" class="chart-skeleton">
          <div class="donut-skeleton">
            <div class="skeleton-circle"></div>
            <div class="skeleton-legend">
              <div class="skeleton-legend-item" v-for="n in 4" :key="n"></div>
            </div>
          </div>
        </div>
        <div v-else class="pie-chart-wrapper">
          <Chart type="pie" :data="pieChartData" :options="pieChartOptions" class="pie-chart-canvas" />
        </div>
      </div>
    </div>

    <!-- Orders Comparison (Bar Chart) -->
    <div class="chart-card bar-chart">
      <div class="chart-header">
        <h3 class="chart-title">{{ chartTitle }}</h3>
        <div class="chart-toggle-buttons">
          <button 
            v-for="period in periods" 
            :key="period.value"
            @click="setActivePeriod(period.value)"
            :class="['toggle-btn', { active: activePeriod === period.value }]"
            :disabled="barChartLoading"
          >
            {{ period.label }}
          </button>
        </div>
      </div>
      <div class="chart-container">
        <div v-if="barChartLoading" class="chart-skeleton">
          <div class="bar-skeleton">
            <div class="skeleton-bars">
              <div class="skeleton-bar" v-for="n in 4" :key="n" :style="{ height: Math.random() * 60 + 20 + '%' }"></div>
            </div>
            <div class="skeleton-legend-bottom">
              <div class="skeleton-legend-dot" v-for="n in 4" :key="n"></div>
            </div>
          </div>
        </div>
        <Bar v-else :data="timeBasedChartData" :options="timeBasedChartOptions" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
import { useThemeStore } from '@/stores/theme'
import { Bar } from 'vue-chartjs'
import Chart from 'primevue/chart'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

interface DashboardData {
  order_count: number
  cancelled_count: number
  pending_orders: number
  delivered_orders: number
  rescheduled_count: number
}

interface Props {
  data: DashboardData
  loading?: boolean
  organizationId?: string
  filters?: any
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits(['fetch-time-data'])

// Theme store
const themeStore = useThemeStore()

// Time-based chart state
const activePeriod = ref('monthly')
const barChartLoading = ref(false)
const donutChartLoading = ref(false)
const timeBasedData = ref<any[]>([])
const windowWidth = ref(window.innerWidth)

const periods = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' }
]

const chartTitle = computed(() => {
  switch (activePeriod.value) {
    case 'weekly': return 'Last 4 Weeks Orders'
    default: return 'Last 4 Months Orders'
  }
})

// Status Distribution Chart (Pie Chart)
const pieChartData = computed(() => {
  const delivered = props.data.delivered_orders || 0
  const cancelled = props.data.cancelled_count || 0
  const pending = props.data.pending_orders || 0
  const rescheduled = props.data.rescheduled_count || 0
  
  return {
    labels: ['Delivered', 'Cancelled', 'Pending', 'Rescheduled'],
    datasets: [{
      data: [delivered, cancelled, pending, rescheduled],
      backgroundColor: [
        '#22c55e', // delivered - green
        '#ef4444', // cancelled - red
        '#8b5cf6', // pending - purple
        '#f59e0b'  // rescheduled - amber
      ],
      hoverBackgroundColor: [
        '#16a34a', // delivered hover
        '#dc2626', // cancelled hover
        '#7c3aed', // pending hover
        '#d97706'  // rescheduled hover
      ]
    }]
  }
})

const pieChartOptions = computed(() => {
  const documentStyle = getComputedStyle(document.documentElement)
  const textColor = documentStyle.getPropertyValue('--p-text-color') || (themeStore.isDark ? '#b3b3b3' : '#6B7280')
  const isMobile = windowWidth.value <= 768
  
  return {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 2,
        bottom: 2,
        left: 1,
        right: 1
      }
    },
    plugins: {
      legend: {
        position: isMobile ? 'bottom' : 'right',
        labels: {
          usePointStyle: true,
          color: textColor,
          padding: isMobile ? 8 : 12,
          font: { size: isMobile ? 10 : 12 },
          boxWidth: isMobile ? 8 : 12,
          generateLabels: (chart: any) => {
            const data = chart.data
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label: string, i: number) => {
                const value = data.datasets[0].data[i]
                return {
                  text: `${label}: ${value}`,
                  fillStyle: data.datasets[0].backgroundColor[i],
                  strokeStyle: data.datasets[0].backgroundColor[i],
                  lineWidth: 0,
                  pointStyle: 'circle',
                  hidden: false,
                  index: i
                }
              })
            }
            return []
          }
        }
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            return `${context.label}: ${context.parsed} orders`
          }
        }
      }
    }
  }
})

// Time-based chart data
const timeBasedChartData = computed(() => {
  if (!timeBasedData.value.length) {
    return {
      labels: [],
      datasets: []
    }
  }

  const labels = timeBasedData.value.map(item => item.label)
  
  return {
    labels,
    datasets: [
      {
        label: 'Orders Placed',
        data: timeBasedData.value.map(item => item.ordersPlaced || 0),
        backgroundColor: '#3b82f6', // placed - blue
        borderRadius: 4,
        maxBarThickness: 40
      },
      {
        label: 'Orders Delivered',
        data: timeBasedData.value.map(item => item.ordersDelivered || 0),
        backgroundColor: '#22c55e', // delivered - green
        borderRadius: 4,
        maxBarThickness: 40
      },
      {
        label: 'Orders Cancelled',
        data: timeBasedData.value.map(item => item.ordersCancelled || 0),
        backgroundColor: '#ef4444', // cancelled - red
        borderRadius: 4,
        maxBarThickness: 40
      },
      {
        label: 'Pending Orders',
        data: timeBasedData.value.map(item => item.ordersPending || 0),
        backgroundColor: '#8b5cf6', // pending - purple
        borderRadius: 4,
        maxBarThickness: 40
      }
    ]
  }
})

const timeBasedChartOptions = computed(() => {
  const isMobile = windowWidth.value <= 768
  const isDark = themeStore.isDark
  
  return {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 10,
        bottom: isMobile ? 5 : 10,
        left: isMobile ? 5 : 10,
        right: isMobile ? 5 : 10
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'bottom' as const,
        labels: {
          color: isDark ? '#b3b3b3' : '#6B7280',
          padding: isMobile ? 4 : 8,
          font: { size: isMobile ? 8 : 10 },
          usePointStyle: true,
          boxWidth: isMobile ? 6 : 8
        }
      },
      tooltip: {
        backgroundColor: isDark ? 'rgba(45, 45, 45, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        titleColor: isDark ? '#ffffff' : '#111827',
        bodyColor: isDark ? '#b3b3b3' : '#374151',
        callbacks: {
          label: (context: any) => {
            return `${context.dataset.label}: ${context.parsed.y} orders`
          }
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: isDark ? '#808080' : '#9CA3AF',
          font: { size: isMobile ? 8 : 10 },
          maxRotation: isMobile ? 45 : 0
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: isDark ? '#404040' : '#E5E7EB',
          drawBorder: false
        },
        ticks: {
          color: isDark ? '#808080' : '#9CA3AF',
          font: { size: isMobile ? 8 : 10 },
          callback: function(value: any) {
            return new Intl.NumberFormat('en-IN').format(value)
          }
        }
      }
    }
  }
})

// Methods
const setActivePeriod = async (period: string) => {
  if (period === activePeriod.value || barChartLoading.value) return
  
  barChartLoading.value = true
  activePeriod.value = period
  await fetchTimeBasedData()
}

const fetchTimeBasedData = async () => {
  try {
    emit('fetch-time-data', activePeriod.value)
  } catch (error) {
    console.error('Error fetching time-based data:', error)
    barChartLoading.value = false
  }
}

// Watch for external data updates
watch(() => props.data, (newData, oldData) => {
  // Show donut loading when data changes (filter applied)
  if (oldData && JSON.stringify(newData) !== JSON.stringify(oldData)) {
    donutChartLoading.value = true
    setTimeout(() => {
      donutChartLoading.value = false
    }, 500)
  }
}, { immediate: false })

// Initialize bar chart data only once
watch(() => props.data, () => {
  if (!timeBasedData.value.length) {
    fetchTimeBasedData()
  }
}, { immediate: true, once: true })

// Handle window resize for responsive charts
const handleResize = () => {
  windowWidth.value = window.innerWidth
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

// Expose method to update chart data
const updateTimeBasedData = (data: any[]) => {
  // Transform data to ensure consistent structure
  timeBasedData.value = data.map(item => ({
    label: item.label || item.time_range,
    ordersPlaced: item.ordersPlaced || item.order_count || 0,
    ordersDelivered: item.ordersDelivered || item.delivered_orders || 0,
    ordersCancelled: item.ordersCancelled || item.cancelled_count || 0,
    ordersPending: item.ordersPending || item.pending_orders || item.ordersPlanned || item.planned_orders || 0,
    ordersRescheduled: item.ordersRescheduled || 0,
    period: item.period || item.time_range
  }))
  barChartLoading.value = false
}

defineExpose({ updateTimeBasedData })
</script>

<style scoped>
.modern-charts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  width: 100%;
  margin-bottom: 1rem;
  box-sizing: border-box;
  overflow-x: hidden;
  overflow-y: hidden;
}

.chart-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: 12px;
  padding: 1rem;
  /* box-shadow: 0 1px 3px var(--shadow-light); */
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0;
  transform: translateY(20px);
  animation: slideInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  height: 350px;
}

.chart-card:nth-child(2) {
  animation-delay: 0.2s;
}

.chart-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px var(--shadow-medium), 0 0 0 1px var(--border-light);
}

.chart-header {
  margin-bottom: 0.75rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.chart-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.chart-toggle-buttons {
  display: flex;
  gap: 0.25rem;
  background: var(--bg-secondary);
  border-radius: 6px;
  padding: 2px;
}

.toggle-btn {
  background: transparent;
  border: none;
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-secondary);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 60px;
}

.toggle-btn:hover:not(:disabled) {
  background: var(--accent-primary);
  color: var(--text-inverse);
}

.toggle-btn.active {
  background: var(--accent-primary);
  color: var(--text-inverse);
  box-shadow: 0 1px 3px var(--accent-light);
}

.toggle-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.chart-skeleton {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
}

.donut-skeleton {
  display: flex;
  align-items: center;
  gap: 2rem;
  width: 100%;
  justify-content: center;
}

.skeleton-circle {
  width: 180px;
  height: 180px;
  border: 25px solid var(--bg-secondary);
  border-radius: 50%;
  position: relative;
  animation: shimmer 1.5s infinite;
}

.skeleton-legend {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.skeleton-legend-item {
  width: 120px;
  height: 16px;
  background: var(--bg-secondary);
  border-radius: 6px;
  animation: shimmer 1.5s infinite;
  animation-delay: calc(var(--i, 0) * 0.1s);
}

.bar-skeleton {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
  justify-content: space-between;
  padding: 1rem 0;
}

.skeleton-bars {
  display: flex;
  align-items: end;
  gap: 1rem;
  height: 70%;
  width: 80%;
  justify-content: center;
}

.skeleton-bar {
  width: 60px;
  background: var(--bg-secondary);
  border-radius: 4px 4px 0 0;
  animation: shimmer 1.5s infinite;
  animation-delay: calc(var(--i, 0) * 0.2s);
}

.skeleton-legend-bottom {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.skeleton-legend-dot {
  width: 80px;
  height: 12px;
  background: var(--bg-secondary);
  border-radius: 4px;
  animation: shimmer 1.5s infinite;
  animation-delay: calc(var(--i, 0) * 0.1s);
}

@keyframes shimmer {
  0% { background-color: var(--bg-secondary); }
  50% { background-color: var(--bg-tertiary); }
  100% { background-color: var(--bg-secondary); }
}

.chart-container {
  position: relative;
  width: 100%;
  height: calc(100% - 50px);
}

/* Specific chart styling */
.donut-chart {
  position: relative;
}

.pie-chart {
  position: relative;
}

.pie-chart-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  box-sizing: border-box;
}

.pie-chart-canvas {
  width: 100% !important;
  height: 100% !important;
  max-width: 500px;
  max-height: 380px;
}

.bar-chart {
  position: relative;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive Design */
@media (max-width: 1024px) {
  .modern-charts {
    gap: 1.25rem;
  }
  
  .chart-card {
    height: 300px;
  }
}

@media (max-width: 768px) {
  .modern-charts {
    grid-template-columns: 1fr;
    gap: 1rem;
    width: 100%;
    overflow-x: hidden;
  }
  
  .chart-card {
    padding: 0.875rem;
    height: 320px;
    width: 100%;
    box-sizing: border-box;
  }
  
  .chart-title {
    font-size: 1rem;
  }
  
  .chart-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }
  
  .chart-toggle-buttons {
    align-self: flex-end;
    width: auto;
  }
  
  .toggle-btn {
    padding: 0.25rem 0.5rem;
    font-size: 0.7rem;
    min-width: 50px;
  }
  
  .chart-container {
    height: calc(100% - 70px);
    width: 100%;
    overflow: hidden;
  }
  
  .pie-chart-wrapper {
    padding: 0.25rem;
  }
  
  .pie-chart-canvas {
    max-width: 320px;
    max-height: 250px;
  }
  
  .donut-skeleton {
    flex-direction: column;
    gap: 1rem;
  }
  
  .skeleton-circle {
    width: 140px;
    height: 140px;
    border-width: 20px;
  }
  
  .skeleton-bars {
    width: 90%;
  }
  
  .skeleton-bar {
    width: 45px;
  }
  
  .skeleton-legend-item {
    width: 100px;
    height: 14px;
  }
  
  .skeleton-legend-dot {
    width: 70px;
    height: 10px;
  }
}

@media (max-width: 480px) {
  .chart-card {
    padding: 0.75rem;
    border-radius: 10px;
    height: 300px;
  }
  
  .chart-title {
    font-size: 0.9rem;
  }
  
  .chart-header {
    margin-bottom: 0.75rem;
    gap: 0.5rem;
  }
  
  .chart-toggle-buttons {
    gap: 0.125rem;
    padding: 1px;
  }
  
  .toggle-btn {
    padding: 0.25rem 0.375rem;
    font-size: 0.65rem;
    min-width: 42px;
  }
  
  .chart-container {
    height: calc(100% - 60px);
  }
  
  .pie-chart-wrapper {
    padding: 0.125rem;
  }
  
  .pie-chart-canvas {
    max-width: 260px;
    max-height: 220px;
  }
}

@media (max-width: 320px) {
  .chart-card {
    padding: 0.5rem;
    height: 280px;
  }
  
  .chart-title {
    font-size: 0.85rem;
  }
  
  .toggle-btn {
    padding: 0.2rem 0.3rem;
    font-size: 0.6rem;
    min-width: 38px;
  }
}
</style>