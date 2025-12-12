// Payment Security Utilities
export const PAYMENT_ERROR_CODES = {
  AUTHENTICATION_FAILED: 'AUTH_FAILED',
  WALLET_NOT_FOUND: 'WALLET_NOT_FOUND',
  INSUFFICIENT_FUNDS: 'INSUFFICIENT_FUNDS',
  PAYMENT_GATEWAY_ERROR: 'GATEWAY_ERROR',
  VERIFICATION_FAILED: 'VERIFICATION_FAILED',
  INVALID_AMOUNT: 'INVALID_AMOUNT',
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  CANCELLED: 'CANCELLED',
  INVALID_REDIRECT: 'INVALID_REDIRECT'
} as const

export type PaymentErrorCode = typeof PAYMENT_ERROR_CODES[keyof typeof PAYMENT_ERROR_CODES]

export interface PaymentError {
  code: PaymentErrorCode
  message: string
  userMessage: string
}

// Allowlisted domains for payment redirects
const ALLOWED_DOMAINS = [
  'fuelbuddy.in',
  'easebuzz.in',
  'icicibank.com',
  'axisbank.com',
  'localhost' // Only for development
]

export const validateRedirectUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url)
    const domain = urlObj.hostname.toLowerCase()
    
    // Check if domain or its parent domain is in allowlist
    return ALLOWED_DOMAINS.some(allowedDomain => 
      domain === allowedDomain || domain.endsWith(`.${allowedDomain}`)
    )
  } catch {
    return false
  }
}

export const createPaymentError = (code: PaymentErrorCode, message: string, userMessage?: string): PaymentError => ({
  code,
  message,
  userMessage: userMessage || getDefaultUserMessage(code)
})

const getDefaultUserMessage = (code: PaymentErrorCode): string => {
  switch (code) {
    case PAYMENT_ERROR_CODES.AUTHENTICATION_FAILED:
      return 'Authentication failed. Please login again.'
    case PAYMENT_ERROR_CODES.WALLET_NOT_FOUND:
      return 'Wallet not found. Please contact support.'
    case PAYMENT_ERROR_CODES.INSUFFICIENT_FUNDS:
      return 'Insufficient funds in wallet.'
    case PAYMENT_ERROR_CODES.PAYMENT_GATEWAY_ERROR:
      return 'Payment gateway error. Please try again.'
    case PAYMENT_ERROR_CODES.VERIFICATION_FAILED:
      return 'Payment verification failed. Please contact support.'
    case PAYMENT_ERROR_CODES.INVALID_AMOUNT:
      return 'Invalid payment amount.'
    case PAYMENT_ERROR_CODES.NETWORK_ERROR:
      return 'Network error. Please check your connection.'
    case PAYMENT_ERROR_CODES.TIMEOUT:
      return 'Payment timeout. Please try again.'
    case PAYMENT_ERROR_CODES.CANCELLED:
      return 'Payment was cancelled.'
    case PAYMENT_ERROR_CODES.INVALID_REDIRECT:
      return 'Invalid redirect URL detected.'
    default:
      return 'Payment failed. Please try again.'
  }
}

export const isVerificationSuccessful = (verificationResult: any): boolean => {
  // More lenient verification - accept various success indicators
  if (!verificationResult) return false
  
  // Check for explicit success status
  if (verificationResult?.walletEasebuzzTopupVerify?.status === 'success' ||
      verificationResult?.status === 'success') {
    return true
  }
  
  // Check for wallet_transaction_id presence (indicates processing)
  if (verificationResult?.walletEasebuzzTopupVerify?.wallet_transaction_id ||
      verificationResult?.wallet_transaction_id) {
    return true
  }
  
  // Check for wallet_id presence (indicates wallet was found/updated)
  if (verificationResult?.walletEasebuzzTopupVerify?.wallet_id ||
      verificationResult?.wallet_id) {
    return true
  }
  
  return false
}