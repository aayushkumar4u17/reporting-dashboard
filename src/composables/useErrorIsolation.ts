import { ref, onErrorCaptured, getCurrentInstance } from 'vue'
import { useRouter } from 'vue-router'
import ErrorHandler from '@/utils/errorHandler'

interface ErrorBoundaryState {
  hasError: boolean
  errorInfo: {
    message: string
    code?: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    timestamp: number
    component?: string
  } | null
}

export const useErrorIsolation = (componentName?: string) => {
  const router = useRouter()
  const instance = getCurrentInstance()
  
  const errorState = ref<ErrorBoundaryState>({
    hasError: false,
    errorInfo: null
  })

  const resetError = () => {
    errorState.value = {
      hasError: false,
      errorInfo: null
    }
  }

  const handleError = (error: any, context?: string) => {
    const safeError = ErrorHandler.handleError(error, {
      component: componentName || instance?.type.name || 'Unknown',
      action: context,
      timestamp: Date.now()
    })

    errorState.value = {
      hasError: true,
      errorInfo: {
        message: safeError.userMessage,
        code: safeError.code,
        severity: safeError.severity,
        timestamp: Date.now(),
        component: componentName || instance?.type.name
      }
    }

    // Prevent error from bubbling up to parent components
    return false
  }

  const handleAsyncError = async <T>(
    asyncFn: () => Promise<T>,
    context?: string,
    fallbackValue?: T
  ): Promise<T | undefined> => {
    try {
      return await asyncFn()
    } catch (error) {
      handleError(error, context)
      return fallbackValue
    }
  }

  const navigateWithErrorReset = (path: string) => {
    resetError()
    router.push(path)
  }

  // Capture errors in child components
  onErrorCaptured((error: Error, instance, info) => {
    handleError(error, `Vue Error: ${info}`)
    return false // Prevent error from propagating
  })

  return {
    errorState,
    resetError,
    handleError,
    handleAsyncError,
    navigateWithErrorReset
  }
}