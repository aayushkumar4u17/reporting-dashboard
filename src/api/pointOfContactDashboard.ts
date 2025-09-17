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

export const fetchPointOfContactDashboard = async (organizationUserId: string, filters?: Partial<FilterPayload>): Promise<PointOfContactData | null> => {
  try {
    const graphqlClient = await client()
    
    const payload = {
      org_user_id: [organizationUserId],
      ...filters
    }
    
    const response = await graphqlClient.PointOfContactDashboard({
      object: payload
    })

    return response.pointOfContactDashboard?.data?.[0] || null
  } catch (error) {
    console.error('Error fetching point of contact dashboard:', error)
    throw error
  }
}