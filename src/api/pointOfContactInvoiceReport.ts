import client from './APIClient'

interface LocalFilterPayload {
  city?: string
  delivered_date?: string
  ordered_date?: string
  point_of_contact?: string
}

export interface InvoiceOrderDate {
  value: string;
}

export interface PointOfContactInvoiceReportData {
  erp_order_code?: string | null
  invoice?: string | null
  delivered_date?: string | InvoiceOrderDate | null
  app_order_code?: string | null
  order_date?: string | InvoiceOrderDate | null
  order_qty?: number | null
  order_delivered_qty?: number | null
  order_amount?: number | string | null
  shipping_address?: string | null
  city?: string | null
  first_name?: string | null
  last_name?: string | null
  phone_number?: string | null
}

export const fetchPointOfContactInvoiceReport = async (organizationId: string, filters?: Partial<LocalFilterPayload>): Promise<PointOfContactInvoiceReportData[]> => {
  try {
    const graphqlClient = await client()
    
    const response = await graphqlClient.InvoicesQuery({
      org_id: organizationId,
      city: filters?.city || '',
      delivered_date: filters?.delivered_date || '',
      ordered_date: filters?.ordered_date || '',
      point_of_contact: ''
    })

    return response.pointOfContactInvoiceReport?.data || []
  } catch (error) {
    console.error('Error fetching point of contact invoice report:', error)
    throw error
  }
}