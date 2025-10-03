import client from './APIClient'

interface LocalFilterPayload {
  city?: string
  delivery_date_from?: string
  delivery_date_to?: string
  order_date_from?: string
  order_date_to?: string
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
      delivery_date_from: filters?.delivery_date_from || '',
      delivery_date_to: filters?.delivery_date_to || '',
      order_date_from: filters?.order_date_from || '',
      order_date_to: filters?.order_date_to || '',
      point_of_contact: filters?.point_of_contact || ''
    })

    return response.pointOfContactInvoiceReport?.data || []
  } catch (error) {
    console.error('Error fetching point of contact invoice report:', error)
    throw error
  }
}