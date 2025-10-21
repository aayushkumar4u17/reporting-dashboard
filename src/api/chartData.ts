import client from './APIClient'
import type { FilterPayload } from '@/composables/useFilters'

export interface ChartDataPoint {
  date: string
  value: number
  label?: string
}

export interface RegionalData {
  region: string
  value: number
}

export interface ProductData {
  product: string
  value: number
}

// Generate historical data based on current metrics
export const generateHistoricalData = (
  currentValue: number, 
  periods: number, 
  periodType: 'day' | 'week' | 'month' | 'year' = 'month'
): ChartDataPoint[] => {
  const data: ChartDataPoint[] = []
  const now = new Date()
  
  for (let i = periods - 1; i >= 0; i--) {
    const date = new Date(now)
    let label = ''
    
    switch (periodType) {
      case 'day':
        date.setDate(date.getDate() - i)
        label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        break
      case 'week':
        date.setDate(date.getDate() - (i * 7))
        label = `Week ${Math.ceil(date.getDate() / 7)}`
        break
      case 'year':
        date.setFullYear(date.getFullYear() - i)
        label = date.getFullYear().toString()
        break
      default: // month
        date.setMonth(date.getMonth() - i)
        label = date.toLocaleDateString('en-US', { month: 'short' })
    }
    
    // Generate realistic variation (±30% of current value)
    const variation = 0.7 + (Math.random() * 0.6) // 70% to 130%
    const value = Math.round(currentValue * variation)
    
    data.push({
      date: date.toISOString(),
      value: Math.max(0, value),
      label
    })
  }
  
  return data
}

// Simulate regional distribution
export const generateRegionalData = (totalValue: number): RegionalData[] => {
  const regions = [
    { name: 'North', ratio: 0.25 },
    { name: 'South', ratio: 0.35 },
    { name: 'East', ratio: 0.20 },
    { name: 'West', ratio: 0.20 }
  ]
  
  return regions.map(region => ({
    region: region.name,
    value: Math.round(totalValue * region.ratio)
  }))
}

// Simulate product distribution
export const generateProductData = (totalValue: number): ProductData[] => {
  const products = [
    { name: 'Standard Diesel', ratio: 0.60 },
    { name: 'Premium Diesel', ratio: 0.30 },
    { name: 'Bio-Diesel', ratio: 0.10 }
  ]
  
  return products.map(product => ({
    product: product.name,
    value: Math.round(totalValue * product.ratio)
  }))
}

// Fetch detailed orders for more accurate chart data
export const fetchDetailedOrdersForCharts = async (
  organizationId: string, 
  filters?: Partial<FilterPayload>
): Promise<any[]> => {
  try {
    const graphqlClient = await client()
    
    // Use the detailed report query to get individual orders
    const response = await graphqlClient.OrdersQuery({
      org_id: organizationId,
      city: filters?.city || '',
      delivery_date_from: filters?.delivery_date_from || '',
      delivery_date_to: filters?.delivery_date_to || '',
      order_date_from: filters?.order_date_from || '',
      order_date_to: filters?.order_date_to || '',
      point_of_contact: filters?.point_of_contact || ''
    })
    
    return response.pointOfContactDetailedReport?.data || []
  } catch (error) {
    console.error('Error fetching detailed orders for charts:', error)
    return []
  }
}

// Process orders data for charts
export const processOrdersForCharts = (orders: any[]) => {
  // Group orders by month for trend analysis
  const monthlyData = new Map<string, { volume: number, count: number }>()
  const cityData = new Map<string, number>()
  const statusData = { delivered: 0, rescheduled: 0, cancelled: 0 }
  
  orders.forEach(order => {
    // Monthly trend data
    if (order.order_date) {
      const date = new Date(order.order_date)
      const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      
      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, { volume: 0, count: 0 })
      }
      
      const monthData = monthlyData.get(monthKey)!
      monthData.volume += parseFloat(order.order_delivered_qty || order.order_qty || 0)
      monthData.count += 1
    }
    
    // City/Regional data
    if (order.city) {
      const currentValue = cityData.get(order.city) || 0
      cityData.set(order.city, currentValue + parseFloat(order.order_delivered_qty || order.order_qty || 0))
    }
    
    // Status data
    const status = order.backend_order_status?.toLowerCase() || ''
    if (status.includes('delivered')) {
      statusData.delivered += 1
    } else if (status.includes('reschedule')) {
      statusData.rescheduled += 1
    } else if (status.includes('cancel')) {
      statusData.cancelled += 1
    }
  })
  
  return {
    monthlyData: Array.from(monthlyData.entries()).map(([month, data]) => ({
      label: month,
      volume: data.volume,
      count: data.count
    })),
    cityData: Array.from(cityData.entries()).map(([city, volume]) => ({
      city,
      volume
    })),
    statusData
  }
}