import client from './APIClient'
import type { FilterPayload } from '@/composables/useFilters'

export interface PointOfContactInvoiceReportData {
  erp_order_code?: string | null
  invoice?: string | null
  delivered_date?: string | null
  app_order_code?: string | null
  order_date?: string | null
  order_qty?: number | null
  order_delivered_qty?: number | null
  order_amount?: number | null
  shipping_address?: string | null
  city?: string | null
  first_name?: string | null
  last_name?: string | null
  phone_number?: string | null
}

export const fetchPointOfContactInvoiceReport = async (organizationUserId: string, filters?: Partial<FilterPayload>): Promise<PointOfContactInvoiceReportData[]> => {
  try {
    const graphqlClient = await client()
    
    const payload = {
      org_user_id: [organizationUserId],
      ...filters
    }
    
    const response = await graphqlClient.PointOfContactInvoiceReport({
      object: payload
    })

    return response.pointOfContactInvoiceReport?.data || []
  } catch (error) {
    console.error('Error fetching point of contact invoice report:', error)
    throw error
  }
}