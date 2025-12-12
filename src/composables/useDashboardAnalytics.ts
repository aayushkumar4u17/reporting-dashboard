import { ref, computed } from 'vue'
import { getSdk } from '@/sdk'
import { GraphQLClient } from 'graphql-request'
import type { DashboardAnalyticsQuery } from '@/sdk'

export function useDashboardAnalytics() {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const analyticsData = ref<DashboardAnalyticsQuery['dashboardAnalytics'] | null>(null)

  const client = new GraphQLClient(import.meta.env.VITE_GRAPHQL_ENDPOINT || 'http://localhost:8080/v1/graphql', {
    headers: {
      'x-hasura-admin-secret': import.meta.env.VITE_GRAPHQL_ADMIN_SECRET || 'myadminsecretkey'
    }
  })

  const sdk = getSdk(client)

  const fetchAnalytics = async (orgId: string) => {
    loading.value = true
    error.value = null
    
    try {
      const result = await sdk.DashboardAnalytics({ orgId })
      analyticsData.value = result.dashboardAnalytics
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch analytics'
    } finally {
      loading.value = false
    }
  }

  const getTimeBasedData = (period: 'weekly' | 'monthly' | 'yearly') => {
    if (!analyticsData.value) return []
    
    const data = period === 'weekly' ? analyticsData.value.weeks :
                 period === 'yearly' ? analyticsData.value.year :
                 analyticsData.value.months
    
    return data.map(item => ({
      label: item.time_range,
      ordersPlaced: item.order_count,
      ordersDelivered: item.delivered_orders,
      ordersCancelled: item.cancelled_count,
      ordersPlanned: item.planned_orders,
      time_range: item.time_range
    }))
  }

  const analytics = computed(() => analyticsData.value)

  return {
    loading,
    error,
    analytics,
    analyticsData,
    fetchAnalytics,
    getTimeBasedData
  }
}