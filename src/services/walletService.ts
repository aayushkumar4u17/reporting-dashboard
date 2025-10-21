import getClient from '../api/APIClient'
import { PAYMENT_ERROR_CODES, createPaymentError, validateRedirectUrl, isVerificationSuccessful } from '../utils/paymentSecurity'

// Service functions
export const getWalletDetails = async (org_id: string) => {
  try {
    const client = await getClient()
    const result = await client.GetWalletDetails({ org_id })

    // Check if result has wallet array directly (as shown in your example)
    if (result?.wallet) {
      return result
    }
    
    // Transform the wallet response to match expected wallet array structure
    if (result?.wallet?.[0]) {
      const walletBalance = result.wallet[0]
      return {
        wallet: [{
          id: walletBalance.id,
          amount: walletBalance.amount,
          available_balance: walletBalance.amount,
          blocked_amount: walletBalance.blocked_amount,
          allowed_credit_limit: 0,
          total_overdue_amount: 0,
          is_amount_available: true,
          is_credit_available: false,
          currency_id: 1,
          organization_id: org_id,
          overdue_invoices: [],
          van_code: walletBalance.van_code,
          van_number: walletBalance.van_number,
          account_number: walletBalance.van_code && walletBalance.van_number ? 
            `${walletBalance.van_code}${walletBalance.van_number}` : 'XXXX1234',
          ifsc_code: walletBalance.ifsc_code || 'FUEL0001',
          beneficiary_name: walletBalance.beneficiary_name || 'FuelBuddy Customer',
          bank_name: walletBalance.bank_name || 'FuelBuddy Bank'
        }]
      }
    }
    
    return result
  } catch (error) {
    return {
      wallet: []
    }
  }
}

export const topupWalletEasebuzz = async ({ amount, wallet_id }: { amount: number; wallet_id: string }) => {
  try {
    if (!wallet_id) {
      throw createPaymentError(PAYMENT_ERROR_CODES.WALLET_NOT_FOUND, 'Wallet ID is required')
    }
    
    const client = await getClient()
    
    const result = await client.WalletEasebuzzTopup({
      object: {
        wallet_id: wallet_id,
        amount: parseFloat(amount.toString()),
        request_flow: null
      }
    })
    
    return result
  } catch (error: any) {
    if (error.code) throw error
    if (error.response?.status === 403 || error.message?.includes('403') || error.message?.includes('Forbidden')) {
      throw createPaymentError(PAYMENT_ERROR_CODES.AUTHENTICATION_FAILED, 'Authentication failed')
    }
    if (error.message?.includes('Wallet ID not found') || error.message?.includes('wallet not found')) {
      throw createPaymentError(PAYMENT_ERROR_CODES.WALLET_NOT_FOUND, 'Wallet not found')
    }
    throw createPaymentError(PAYMENT_ERROR_CODES.PAYMENT_GATEWAY_ERROR, error.message || 'Payment failed')
  }
}

export const verifyWalletTopupEasebuzz = async ({ 
  amount, 
  walletTransactionId, 
  cardType, 
  mode, 
  paymentSource, 
  pgType, 
  salesInvoice 
}: {
  amount: number;
  walletTransactionId: string;
  cardType: string;
  mode: string;
  paymentSource: string;
  pgType: string;
  salesInvoice: any[];
}) => {
  try {
    const client = await getClient()
    
    const result = await client.WalletEasebuzzTopupVerify({
      object: {
        amount: Number(amount),
        wallet_transaction_id: walletTransactionId,
        card_type: cardType,
        mode: mode,
        payment_source: paymentSource,
        pg_type: pgType,
        sales_invoice: salesInvoice || []
      }
    })
    
    return result
  } catch (error: any) {
    console.error('Verification API error:', error)
    
    return {
      error: true,
      errorCode: error.code || PAYMENT_ERROR_CODES.VERIFICATION_FAILED,
      errorMessage: error.message || 'Verification API failed',
      walletTransactionId: walletTransactionId
    }
  }
}

export const getCreditTransactions = async (org_id: string, options: { limit?: number } = {}) => {
  try {
    const client = await getClient()
    const result = await client.GetWalletLedger({
      org_id,
      payment_type: 'CREDIT' as any,
      limit: options.limit || 50
    })
    return result
  } catch (error) {
    console.error('Error fetching credit transactions:', error)
    return { user_ledger: [], user_ledger_aggregate: { aggregate: { count: 0, sum: { amount: 0 } } } }
  }
}

export const getDebitTransactions = async (org_id: string, options: { limit?: number } = {}) => {
  try {
    const client = await getClient()
    const result = await client.GetWalletLedger({
      org_id,
      payment_type: 'DEBIT' as any,
      limit: options.limit || 50
    })
    return result
  } catch (error) {
    console.error('Error fetching debit transactions:', error)
    return { user_ledger: [], user_ledger_aggregate: { aggregate: { count: 0, sum: { amount: 0 } } } }
  }
}

export const transformLedgerData = (ledgerData: any) => {
  if (!ledgerData?.user_ledger) return []
  
  return ledgerData.user_ledger.map((transaction: any) => ({
    transactionId: transaction.transaction_details || transaction.id,
    date: transaction.created_at,
    amount: transaction.amount,
    paymentType: transaction.payment_type,
    status: 'Completed',
    description: transaction.payment_type === 'CREDIT' ? 'Wallet Topup' : 
                 transaction.invoice ? `Invoice Payment - ${transaction.invoice.sales_invoice_erp_code}` : 'Payment'
  }))
}

// Utility functions
export const formatAmountInternational = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0
  }).format(amount || 0)
}

export const iciciCoBrandedCardsPaymentInput = async ({ amount, wallet_id, successCallbackUrl, failureCallbackUrl }: {
  amount: number;
  wallet_id: string;
  successCallbackUrl: string;
  failureCallbackUrl: string;
}) => {
  try {
    if (!validateRedirectUrl(successCallbackUrl) || !validateRedirectUrl(failureCallbackUrl)) {
      throw createPaymentError(PAYMENT_ERROR_CODES.INVALID_REDIRECT, 'Invalid redirect URL')
    }
    
    const client = await getClient()
    const result = await client.WalletEasebuzzTopup({
      object: {
        wallet_id: wallet_id,
        amount: Number(amount),
        request_flow: 'INDUS_DASHBOARD'
      }
    })
    
    return result
  } catch (error: any) {
    if (error.code) throw error
    throw createPaymentError(PAYMENT_ERROR_CODES.PAYMENT_GATEWAY_ERROR, error.message || 'ICICI payment failed')
  }
}

export const axisBankPaymentInput = async ({ amount, wallet_id, successCallbackUrl, failureCallbackUrl }: {
  amount: number;
  wallet_id: string;
  successCallbackUrl: string;
  failureCallbackUrl: string;
}) => {
  try {
    if (!validateRedirectUrl(successCallbackUrl) || !validateRedirectUrl(failureCallbackUrl)) {
      throw createPaymentError(PAYMENT_ERROR_CODES.INVALID_REDIRECT, 'Invalid redirect URL')
    }
    
    const client = await getClient()
    const result = await client.WalletEasebuzzTopup({
      object: {
        wallet_id: wallet_id,
        amount: Number(amount),
        request_flow: 'INDUS_DASHBOARD'
      }
    })
    
    return result
  } catch (error: any) {
    if (error.code) throw error
    throw createPaymentError(PAYMENT_ERROR_CODES.PAYMENT_GATEWAY_ERROR, error.message || 'Axis payment failed')
  }
}

export const initializeAxisPayment = async (options: any) => {
  // Placeholder for Axis payment initialization
  console.log('Axis payment options:', options)
  return Promise.resolve()
}

export const initializeEasebuzzPayment = async (accessKey: string, onResponse: (response: any) => void) => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://ebz-static.s3.ap-south-1.amazonaws.com/easecheckout/easebuzz-checkout.js'
    script.onload = () => {
      try {
        const easebuzzCheckout = new (window as any).EasebuzzCheckout(
          import.meta.env.VITE_EASEBUZZ_KEY,
          import.meta.env.VITE_EASEBUZZ_ENV
        )
        
        const options = {
          access_key: accessKey,
          onResponse: onResponse,
          theme: '#0E2F34'
        }
        
        easebuzzCheckout.initiatePayment(options)
        resolve(true)
      } catch (error) {
        reject(error)
      }
    }
    script.onerror = reject
    document.head.appendChild(script)
  })
}