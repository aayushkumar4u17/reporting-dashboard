import { getAuth } from 'firebase/auth'
import { GraphQLClient } from 'graphql-request'

interface InvoiceInput {
  sales_invoice_erp_code: string
  isPickup?: boolean
}

interface InvoiceResponse {
  failCount?: number
  sales_invoice_erp_code?: string
  singlePdf?: string
  success?: boolean
  successCount?: number
  totalCount?: number
  zipFile?: string
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
  
  const query = `
    query FetchMultipleInvoicesPdf($object: FetchMultipleInvoiceInput!) {
      fetchMultipleInvoicesPdf(object: $object) {
        code
        data {
          failCount
          sales_invoice_erp_code
          singlePdf
          success
          successCount
          totalCount
          zipFile
        }
        error
        message
      }
    }
  `
  
  const response = await client.request<GraphQLResponse>(query, { object: { invoices } })
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

const downloadZip = (base64Data: string, filename: string): void => {
  const byteCharacters = atob(base64Data)
  const byteArray = new Uint8Array(byteCharacters.length)
  for (let i = 0; i < byteCharacters.length; i++) {
    byteArray[i] = byteCharacters.charCodeAt(i)
  }
  
  const blob = new Blob([byteArray], { type: 'application/zip' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

const handleDownload = (data: InvoiceResponse, invoiceCount: number): void => {
  if (invoiceCount === 1) {
    if (data.singlePdf) {
      downloadPdf(data.singlePdf, `Invoice_${data.sales_invoice_erp_code}.pdf`)
    } else {
      throw new Error('No PDF data found for single invoice')
    }
  } else {
    if (data.zipFile) {
      downloadZip(data.zipFile, `Invoices_${new Date().toISOString().split('T')[0]}.zip`)
    } else {
      throw new Error('No ZIP data found for multiple invoices')
    }
  }
}

export const downloadInvoices = async (invoices: InvoiceInput[]): Promise<void> => {
  try {
    if (invoices.length === 0) {
      throw new Error('No invoices selected for download')
    }
    
    const response = await fetchInvoicesPdf(invoices)
    console.log('Full response:', response)
    
    if (response.code !== 200) {
      throw new Error(response.message || 'Failed to fetch invoices')
    }
    
    const responseData = response.data
    console.log('Response data:', responseData)
    console.log('Is array:', Array.isArray(responseData))
    
    // Check if data is an array (current response) or object (expected)
    if (Array.isArray(responseData)) {
      console.log('Processing array response, length:', responseData.length)
      
      // Log each item to see what's available
      responseData.forEach((item, index) => {
        console.log(`Item ${index}:`, item)
        console.log(`Item ${index} has zipFile:`, !!item.zipFile)
        console.log(`Item ${index} has singlePdf:`, !!item.singlePdf)
      })
      
      // Current array response - find the first item with actual data
      const validItem = responseData.find(item => 
        item.zipFile || item.singlePdf
      )
      
      console.log('Valid item found:', validItem)
      
      if (!validItem) {
        throw new Error('No valid download data found in response')
      }
      
      handleDownload(validItem, invoices.length)
    } else {
      // Expected object response
      console.log('Processing object response')
      handleDownload(responseData, invoices.length)
    }
    
  } catch (error) {
    console.error('Error downloading invoices:', error)
    
    const errorMessage = error.message || error.toString()
    
    if (errorMessage.includes('timeout') || errorMessage.includes('Response timeout')) {
      throw new Error('Download is taking longer than expected. Please try again later.')
    }
    
    if (errorMessage.includes('http exception') || errorMessage.includes('webhook')) {
      throw new Error('Service temporarily unavailable. Please try again in a few minutes.')
    }
    
    if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      throw new Error('Network connection issue. Please check your internet and try again.')
    }
    
    throw new Error('Unable to download invoices at the moment. Please try again later.')
  }
}