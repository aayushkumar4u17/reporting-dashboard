import { ref } from 'vue'
import { useRouter } from 'vue-router'
import ErrorHandler from '@/utils/errorHandler'

interface GlobalErrorState {
  show: boolean
  title: string
  message: string
  details: string
  showRetry: boolean
  retryCallback: (() => void) | null
  severity: 'low' | 'medium' | 'high' | 'critical'
}

const globalErrorState = ref<GlobalErrorState>({
  show: false,
  title: '',
  message: '',
  details: '',
  showRetry: false,
  retryCallback: null,
  severity: 'medium'
})

export const useGlobalErrorHandler = () => {
  const router = useRouter()

  const showError = (error: any, context?: { component?: string; action?: string; retryCallback?: () => void }) => {
    const safeError = ErrorHandler.handleError(error, {
      component: context?.component || 'Unknown',
      action: context?.action || 'Unknown action'
    })

    globalErrorState.value = {
      show: true,
      title: getErrorTitle(safeError.severity),
      message: safeError.userMessage,
      details: import.meta.env.MODE === 'development' ? safeError.message : '',
      showRetry: safeError.shouldRetry,
      retryCallback: context?.retryCallback || null,
      severity: safeError.severity
    }
  }

  const hideError = () => {
    globalErrorState.value.show = false
    globalErrorState.value.retryCallback = null
  }

  const handleRetry = () => {
    if (globalErrorState.value.retryCallback) {
      globalErrorState.value.retryCallback()
    }
    hideError()
  }

  const handleRefresh = () => {
    window.location.reload()
  }

  const handleGoHome = () => {
    hideError()
    router.push('/dashboard')
  }

  // Predefined error handlers for common scenarios
  const showNetworkError = (retryCallback?: () => void) => {
    showError(
      { code: 'NETWORK_ERROR', message: 'Network connection failed' },
      { 
        component: 'Network', 
        action: 'Connection failed',
        retryCallback 
      }
    )
  }

  const showAuthError = () => {
    showError(
      { code: 'AUTH_ERROR', message: 'Authentication failed' },
      { 
        component: 'Auth', 
        action: 'Authentication failed',
        retryCallback: () => {
          localStorage.clear()
          sessionStorage.clear()
          router.push('/login')
        }
      }
    )
  }

  const showDataLoadError = (retryCallback?: () => void) => {
    showError(
      { code: 'DATA_LOAD_ERROR', message: 'Failed to load data' },
      { 
        component: 'Data', 
        action: 'Load failed',
        retryCallback 
      }
    )
  }

  const showPermissionError = () => {
    showError(
      { code: 'PERMISSION_ERROR', message: 'Access denied' },
      { 
        component: 'Permission', 
        action: 'Access denied',
        retryCallback: () => router.push('/dashboard')
      }
    )
  }

  const showServerError = (retryCallback?: () => void) => {
    showError(
      { code: 'SERVER_ERROR', message: 'Server error occurred' },
      { 
        component: 'Server', 
        action: 'Server error',
        retryCallback 
      }
    )
  }

  return {
    globalErrorState,
    showError,
    hideError,
    handleRetry,
    handleRefresh,
    handleGoHome,
    showNetworkError,
    showAuthError,
    showDataLoadError,
    showPermissionError,
    showServerError
  }
}

const getErrorTitle = (severity: string): string => {
  switch (severity) {
    case 'critical':
      return 'Critical Error'
    case 'high':
      return 'Application Error'
    case 'medium':
      return 'Something went wrong'
    case 'low':
      return 'Minor Issue'
    default:
      return 'Error'
  }
}