import client from './APIClient'
import type { FilterPayload } from '@/composables/useFilters'

export interface PointOfContactDetailedReportData {
  erp_order_code?: string | null
  app_order_code?: string | null
  order_date?: string | null
  delivery_slot?: string | null
  order_qty?: number | null
  erp_order_status?: string | null
  backend_order_status?: string | null
  customer_name?: string | null
  actual_delivery_date?: string | null
  shipping_address?: string | null
  city?: string | null
  first_name?: string | null
  last_name?: string | null
  phone_number?: string | null
  order_delivered_qty?: number | null
  order_amount?: number | null
}

export const fetchPointOfContactDetailedReport = async (organizationUserId: string, filters?: Partial<FilterPayload>): Promise<PointOfContactDetailedReportData[]> => {
  try {
    const graphqlClient = await client()
    
    const payload = {
      org_user_id: [organizationUserId],
      ...filters
    }
    
    const response = await graphqlClient.PointOfContactDetailedReport({
      object: payload
    })

    return response.pointOfContactDetailedReport?.data || []
  } catch (error) {
    console.error('Error fetching point of contact detailed report:', error)
    throw error
  }
}