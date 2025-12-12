import client from './APIClient'
// Removed unused import
// import type { FilterPayload } from '@/composables/useFilters'

export interface DetailedOrderDate {
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
  order_date?: string | DetailedOrderDate | null
  order_delivered_qty?: number | null
  order_qty?: number | null
  phone_number?: string | null
  shipping_address?: string | null
}

interface FilterParams {
  city?: string
  delivery_date_from?: string
  delivery_date_to?: string
  order_date_from?: string
  order_date_to?: string
  point_of_contact?: string
}

export const fetchPointOfContactDetailedReport = async (organizationId: string, filters?: FilterParams): Promise<PointOfContactDetailedReportData[]> => {
  try {
    const graphqlClient = await client()
    
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
    console.error('Error fetching point of contact detailed report:', error)
    throw error
  }
}