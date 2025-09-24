import client from './APIClient'
import type { FilterPayload } from '@/composables/useFilters'

export interface OrderDate {
  value: string;
}

export interface PointOfContactDetailedReportData {
  actual_delivery_date?: string | null
  app_order_code?: string | null
  backend_order_status?: string | null
  city?: string | null
  customer_name?: string | null
  delivery_slot?: string | null
  erp_order_code?: string | null
  erp_order_status?: string | null
  first_name?: string | null
  last_name?: string | null
  order_amount?: number | null
  order_date?: string | OrderDate | null
  order_delivered_qty?: number | null
  order_qty?: number | null
  phone_number?: string | null
  shipping_address?: string | null
}

interface FilterParams {
  city?: string
  delivered_date?: string
  ordered_date?: string
  point_of_contact?: string
}

export const fetchPointOfContactDetailedReport = async (organizationId: string, filters?: FilterParams): Promise<PointOfContactDetailedReportData[]> => {
  try {
    const graphqlClient = await client()
    
    const response = await graphqlClient.OrdersQuery({
      org_id: organizationId,
      city: filters?.city || '',
      delivered_date: filters?.delivered_date || '',
      ordered_date: filters?.ordered_date || '',
      point_of_contact: filters?.point_of_contact || ''
    })

    return response.pointOfContactDetailedReport?.data || []
  } catch (error) {
    console.error('Error fetching point of contact detailed report:', error)
    throw error
  }
}