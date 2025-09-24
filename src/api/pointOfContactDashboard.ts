import client from './APIClient'
import type { FilterPayload } from '@/composables/useFilters'

// Updated interface to match the actual GraphQL response structure
export interface PointOfContactData {
  cancelled_count?: number | null
  cancelled_qty?: number | null
  delivered_orders?: number | null
  delivered_qty?: number | null
  order_count?: number | null
  ordered_qty?: number | null
  planned_orders?: number | null
  planned_qty?: number | null
  rescheduled_count?: number | null
  rescheduled_qty?: number | null
}

export const fetchPointOfContactDashboard = async (organizationId: string, filters?: Partial<FilterPayload>): Promise<PointOfContactData | null> => {
  try {
    const graphqlClient = await client()
    
    // Execute the combined query with new parameter structure
    const response = await graphqlClient.DashboardQuery({
      org_id: organizationId,
      delivered_date: filters?.delivery_date_from || '',
      city: filters?.cities?.[0] || '',
      ordered_date: filters?.order_date_from || '',
      point_of_contact: filters?.point_of_contact?.[0] || ''
    })

    const dashboardData = response.pointOfContactDashboard?.data?.[0]
    const rescheduleData = response.pointOfContactDashboardReschedule?.data?.[0]

    // Combine the results from both parts of the query
    return {
      cancelled_count: dashboardData?.cancelled_count || 0,
      cancelled_qty: dashboardData?.cancelled_qty || 0,
      delivered_orders: dashboardData?.delivered_orders || 0,
      delivered_qty: dashboardData?.delivered_qty || 0,
      order_count: dashboardData?.order_count || 0,
      ordered_qty: dashboardData?.ordered_qty || 0,
      planned_orders: dashboardData?.planned_orders || 0,
      planned_qty: dashboardData?.planned_qty || 0,
      rescheduled_count: rescheduleData?.rescheduled_count || 0,
      rescheduled_qty: rescheduleData?.rescheduled_qty || 0
    }
  } catch (error) {
    console.error('Error fetching point of contact dashboard:', error)
    throw error
  }
}