import { getAuth } from 'firebase/auth'
import { GraphQLClient } from 'graphql-request'

interface InvoiceInput {
  sales_invoice_erp_code: string
  isPickup?: boolean
}

interface InvoiceResponse {
  data: string
  error: string | null
  sales_invoice_erp_code: string
  success: boolean
}

interface FetchInvoicesPdfResponse {
  code: number
  error: string | null
  message: string
  data: InvoiceResponse[]
}

interface GraphQLResponse {
  fetchMultipleInvoicesPdf: FetchInvoicesPdfResponse
}

export const fetchInvoicesPdf = async (invoices: InvoiceInput[]): Promise<FetchInvoicesPdfResponse> => {
  const auth = getAuth()
  const token = await auth.currentUser?.getIdToken()
  
  const client = new GraphQLClient(import.meta.env.VITE_GRAPHQL_SCHEMA_PATH, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  
  const mutation = `
    mutation MyMutation($object: FetchMultipleInvoiceInput!) {
      fetchMultipleInvoicesPdf(object: $object) {
        code
        error
        message
        data {
          data
          error
          sales_invoice_erp_code
          success
        }
      }
    }
  `
  
  const response = await client.request<GraphQLResponse>(mutation, { object: { invoices } })
  return response.fetchMultipleInvoicesPdf
}

const downloadPdf = (base64Data: string, filename: string): void => {
  const byteCharacters = atob(base64Data)
  const byteArray = new Uint8Array(byteCharacters.length)
  for (let i = 0; i < byteCharacters.length; i++) {
    byteArray[i] = byteCharacters.charCodeAt(i)
  }
  
  const blob = new Blob([byteArray], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export const downloadInvoices = async (invoices: InvoiceInput[]): Promise<void> => {
  try {
    const response = await fetchInvoicesPdf(invoices)
    
    if (response.code === 200 && response.data) {
      let successCount = 0
      
      response.data.forEach(invoice => {
        if (invoice.success && invoice.data) {
          downloadPdf(invoice.data, `Invoice_${invoice.sales_invoice_erp_code}.pdf`)
          successCount++
        }
      })
      
      const failedCount = response.data.length - successCount
      if (failedCount > 0) {
        throw new Error(`${failedCount} invoice(s) failed to download`)
      }
    } else {
      throw new Error(response.error || 'Failed to download invoices')
    }
  } catch (error) {
    console.error('Error downloading invoices:', error)
    throw error
  }
}