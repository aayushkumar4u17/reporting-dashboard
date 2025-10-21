import client from './APIClient'

export interface DashboardAnalyticsData {
  cancelled_count: number
  delivered_orders: number
  order_count: number
  planned_orders: number
  time_range: string
}

export interface DashboardAnalyticsResponse {
  months: DashboardAnalyticsData[]
  weeks: DashboardAnalyticsData[]
  year: DashboardAnalyticsData[]
}

export interface TimeBasedAnalyticsData {
  label: string
  ordersPlaced: number
  ordersDelivered: number
  ordersCancelled: number
  ordersPlanned: number
  period: string
}

export const fetchDashboardAnalytics = async (
  organizationId: string
): Promise<DashboardAnalyticsResponse> => {
  try {
    const graphqlClient = await client()
    
    // Check if the DashboardAnalytics query exists in the SDK
    if (typeof graphqlClient.DashboardAnalytics === 'function') {
      const response = await graphqlClient.DashboardAnalytics({
        orgId: organizationId
      })
      
      console.log('DashboardAnalytics response:', response)

      return response.dashboardAnalytics || {
        months: [],
        weeks: [],
        year: []
      }
    } else {
      throw new Error('DashboardAnalytics query not available in GraphQL schema')
    }
  } catch (error) {
    console.error('Error fetching dashboard analytics:', error)
    throw error
  }
}

export const transformAnalyticsData = (
  data: DashboardAnalyticsData[]
): TimeBasedAnalyticsData[] => {
  return data.map(item => ({
    label: item.time_range,
    ordersPlaced: item.order_count,
    ordersDelivered: item.delivered_orders,
    ordersCancelled: item.cancelled_count,
    ordersPlanned: item.planned_orders,
    period: item.time_range
  }))
}