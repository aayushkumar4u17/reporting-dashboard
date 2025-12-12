import { ref, reactive, readonly } from 'vue'

export interface PaymentState {
  isProcessing: boolean
  currentTransactionId: string | null
  lastRefreshTime: number
  pendingRefresh: boolean
}

const paymentState = reactive<PaymentState>({
  isProcessing: false,
  currentTransactionId: null,
  lastRefreshTime: 0,
  pendingRefresh: false
})

export const usePaymentState = () => {
  const setProcessing = (processing: boolean) => {
    paymentState.isProcessing = processing
  }

  const setTransactionId = (id: string | null) => {
    paymentState.currentTransactionId = id
  }

  const markRefreshNeeded = () => {
    paymentState.pendingRefresh = true
  }

  const markRefreshComplete = () => {
    paymentState.lastRefreshTime = Date.now()
    paymentState.pendingRefresh = false
  }

  const shouldRefresh = (): boolean => {
    const now = Date.now()
    const timeSinceLastRefresh = now - paymentState.lastRefreshTime
    return paymentState.pendingRefresh || timeSinceLastRefresh > 30000 // 30 seconds
  }

  const reset = () => {
    paymentState.isProcessing = false
    paymentState.currentTransactionId = null
    paymentState.pendingRefresh = false
  }

  return {
    paymentState: readonly(paymentState),
    setProcessing,
    setTransactionId,
    markRefreshNeeded,
    markRefreshComplete,
    shouldRefresh,
    reset
  }
}