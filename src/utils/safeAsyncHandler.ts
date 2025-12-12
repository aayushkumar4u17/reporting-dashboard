import { ref } from 'vue'
import ErrorHandler from './errorHandler'
import { useGlobalErrorHandler } from '@/composables/useGlobalErrorHandler'

interface AsyncHandlerOptions {
  component?: string
  action?: string
  showGlobalError?: boolean
  fallbackValue?: any
  retryCallback?: () => void
}

export const useSafeAsyncHandler = () => {
  const { showError, showNetworkError, showDataLoadError, showServerError } = useGlobalErrorHandler()

  const handleAsync = async <T>(
    asyncFn: () => Promise<T>,
    options: AsyncHandlerOptions = {}
  ): Promise<T | undefined> => {
    try {
      return await asyncFn()
    } catch (error) {
      console.error(`Error in ${options.component || 'Unknown'}:${options.action || 'Unknown'}:`, error)
      
      const safeError = ErrorHandler.handleError(error, {
        component: options.component || 'Unknown',
        action: options.action || 'Unknown action'
      })

      if (options.showGlobalError !== false) {
        // Show appropriate global error based on category
        switch (safeError.category) {
          case 'network':
            showNetworkError(options.retryCallback)
            break
          case 'server':
            showServerError(options.retryCallback)
            break
          case 'data':
            showDataLoadError(options.retryCallback)
            break
          default:
            showError(error, {
              component: options.component,
              action: options.action,
              retryCallback: options.retryCallback
            })
        }
      }

      return options.fallbackValue
    }
  }

  return { handleAsync }
}

// Utility function for wrapping API calls
export const safeApiCall = async <T>(
  apiCall: () => Promise<T>,
  options: AsyncHandlerOptions = {}
): Promise<T | undefined> => {
  const { handleAsync } = useSafeAsyncHandler()
  return handleAsync(apiCall, options)
}

// Utility function for data loading operations
export const safeDataLoad = async <T>(
  loadFn: () => Promise<T>,
  component: string,
  retryCallback?: () => void,
  fallbackValue?: T
): Promise<T | undefined> => {
  return safeApiCall(loadFn, {
    component,
    action: 'loadData',
    retryCallback,
    fallbackValue
  })
}

// Utility function for form submissions
export const safeFormSubmit = async <T>(
  submitFn: () => Promise<T>,
  component: string,
  retryCallback?: () => void
): Promise<T | undefined> => {
  return safeApiCall(submitFn, {
    component,
    action: 'submitForm',
    retryCallback
  })
}

// Utility function for file operations
export const safeFileOperation = async <T>(
  fileOp: () => Promise<T>,
  component: string,
  retryCallback?: () => void
): Promise<T | undefined> => {
  return safeApiCall(fileOp, {
    component,
    action: 'fileOperation',
    retryCallback
  })
}

// Higher-order function to wrap component methods with error handling
export const withErrorHandling = <T extends (...args: any[]) => Promise<any>>(
  fn: T,
  component: string,
  action?: string
): T => {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args)
    } catch (error) {
      console.error(`Error in ${component}:${action || fn.name}:`, error)
      
      const safeError = ErrorHandler.handleError(error, {
        component,
        action: action || fn.name
      })

      const { showError } = useGlobalErrorHandler()
      showError(error, {
        component,
        action: action || fn.name,
        retryCallback: () => fn(...args)
      })

      throw error // Re-throw to allow component-level handling if needed
    }
  }) as T
}