import client from './APIClient'
import type { FilterPayload } from '@/composables/useFilters'

export interface PointOfContactPaymentReportData {
  allowed_credit_breach?: string | null
  credit_limit?: string | null
  customer_id?: string | null
  customer_name?: string | null
  first_name?: string | null
  last_name?: string | null
  outstanding_amount?: string | null
  overdue_amount?: string | null
  payment_terms?: number | null
  phone_number?: string | null
}

export interface PaymentSummary {
  creditLimit: string
  availableBalance: string
  totalOutstanding: string
  totalOverdue: string
}

export interface MappedPaymentData {
  id: string
  customerName: string
  customerId: string
  creditLimit: string
  outstandingAmount: string
  overdueAmount: string
  phoneNumber: string
  allowedCreditBreach: string
  paymentTerms: number
  selected?: boolean
}

export const fetchPointOfContactPaymentReport = async (organizationId: string, filters?: Partial<FilterPayload>): Promise<PointOfContactPaymentReportData[]> => {
  try {
    const graphqlClient = await client()
    
    const response = await graphqlClient.PaymentsQuery({
      org_id: organizationId,
      city: filters?.city || '',
      delivered_date: filters?.delivered_date || '',
      ordered_date: filters?.ordered_date || '',
      point_of_contact: ''
    })

    return response.pointOfContactPaymentReport?.data || []
  } catch (error) {
    console.error('Error fetching point of contact payment report:', error)
    throw error
  }
}

export const mapPaymentData = (data: PointOfContactPaymentReportData[]): MappedPaymentData[] => {
  return data.map((item, index) => ({
    id: item.customer_id || `payment-${index}`,
    customerName: item.customer_name || 'N/A',
    customerId: item.customer_id || 'N/A',
    creditLimit: item.credit_limit || '0',
    outstandingAmount: item.outstanding_amount || '0',
    overdueAmount: item.overdue_amount || '0',
    phoneNumber: 'N/A',
    allowedCreditBreach: item.allowed_credit_breach || 'N',
    paymentTerms: 0,
    selected: false
  }))
}

export const calculateSummary = (data: PointOfContactPaymentReportData[]): PaymentSummary => {
  const totalCreditLimit = data.reduce((sum, item) => sum + parseFloat(item.credit_limit || '0'), 0)
  const totalOutstanding = data.reduce((sum, item) => sum + parseFloat(item.outstanding_amount || '0'), 0)
  const totalOverdue = data.reduce((sum, item) => sum + parseFloat(item.overdue_amount || '0'), 0)
  const availableBalance = totalCreditLimit - totalOutstanding

  return {
    creditLimit: `₹ ${totalCreditLimit.toLocaleString('en-IN')}`,
    availableBalance: `₹ ${availableBalance.toLocaleString('en-IN')}`,
    totalOutstanding: `₹ ${totalOutstanding.toLocaleString('en-IN')}`,
    totalOverdue: `₹ ${totalOverdue.toLocaleString('en-IN')}`
  }
}