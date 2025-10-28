import { ref, Ref } from 'vue'
import ErrorHandler from '@/utils/errorHandler'

interface AsyncOperationState<T> {
  loading: Ref<boolean>
  error: Ref<string | null>
  data: Ref<T | null>
  execute: (operation: () => Promise<T>) => Promise<T | null>
  reset: () => void
}

export const useSafeAsyncOperation = <T>(
  componentName: string,
  initialData: T | null = null
): AsyncOperationState<T> => {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const data = ref<T | null>(initialData)

  const execute = async (operation: () => Promise<T>): Promise<T | null> => {
    try {
      loading.value = true
      error.value = null
      
      const result = await operation()
      data.value = result
      return result
    } catch (err) {
      const safeError = ErrorHandler.handleError(err, {
        component: componentName,
        action: 'async operation'
      })
      
      error.value = safeError.userMessage
      return null
    } finally {
      loading.value = false
    }
  }

  const reset = () => {
    loading.value = false
    error.value = null
    data.value = initialData
    ErrorHandler.clearComponentErrors(componentName)
  }

  return {
    loading,
    error,
    data,
    execute,
    reset
  }
}