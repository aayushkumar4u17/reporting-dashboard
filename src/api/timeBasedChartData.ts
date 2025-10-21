import { fetchPointOfContactDashboard } from './pointOfContactDashboard'

export interface TimeBasedChartData {
  label: string
  ordersPlaced: number
  ordersDelivered: number
  ordersCancelled: number
  ordersRescheduled: number
  period: string
}

// Cached data to avoid multiple API calls
let cachedData: { [key: string]: TimeBasedChartData[] } = {}
let cacheTimestamp: { [key: string]: number } = {}
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

const getDateRanges = (period: 'weekly' | 'monthly' | 'yearly') => {
  const now = new Date()
  const ranges = []
  
  if (period === 'weekly') {
    for (let i = 3; i >= 0; i--) {
      const endDate = new Date(now)
      endDate.setDate(endDate.getDate() - (i * 7))
      const startDate = new Date(endDate)
      startDate.setDate(startDate.getDate() - 6)
      ranges.push({
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0],
        label: `Week ${4 - i}`
      })
    }
  } else if (period === 'yearly') {
    const currentYear = now.getFullYear()
    for (let month = 0; month < 12; month++) {
      const start = new Date(currentYear, month, 1)
      const end = new Date(currentYear, month + 1, 0)
      ranges.push({
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0],
        label: start.toLocaleDateString('en-US', { month: 'short' })
      })
    }
  } else {
    for (let i = 3; i >= 0; i--) {
      const start = new Date(Date.UTC(now.getFullYear(), now.getMonth() - i, 1))
      const end = new Date(Date.UTC(now.getFullYear(), now.getMonth() - i + 1, 0))
      ranges.push({
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0],
        label: start.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' })
      })
    }
  }
  return ranges
}

export const fetchTimeBasedChartData = async (
  organizationId: string,
  period: 'weekly' | 'monthly' | 'yearly'
): Promise<TimeBasedChartData[]> => {
  const cacheKey = `${organizationId}-${period}`
  const now = Date.now()
  
  // Return cached data if available and not expired
  if (cachedData[cacheKey] && cacheTimestamp[cacheKey] && (now - cacheTimestamp[cacheKey]) < CACHE_DURATION) {
    return cachedData[cacheKey]
  }
  
  try {
    const ranges = getDateRanges(period)
    const promises = ranges.map(async (range) => {
      const data = await fetchPointOfContactDashboard(organizationId, {
        order_date_from: range.start,
        order_date_to: range.end
      })
      
      return {
        label: range.label,
        ordersPlaced: data?.order_count || 0,
        ordersDelivered: data?.delivered_orders || 0,
        ordersCancelled: data?.cancelled_count || 0,
        ordersRescheduled: 0, // Will be fetched separately from reschedule API
        period: range.start
      }
    })

    const results = await Promise.all(promises)
    
    // Cache the results
    cachedData[cacheKey] = results
    cacheTimestamp[cacheKey] = now
    
    return results
  } catch (error) {
    console.error('Error fetching time-based chart data:', error)
    return []
  }
}