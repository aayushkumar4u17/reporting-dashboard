import { ref } from 'vue'

interface ErrorState {
  show: boolean;
  title: string;
  message: string;
  details: string;
  showRetry: boolean;
  retryCallback: (() => void) | null;
}

interface ShowErrorOptions {
  title?: string;
  message: string;
  details?: string;
  showRetry?: boolean;
  retryCallback?: (() => void) | null;
}

// Global error state
const errorState = ref<ErrorState>({
  show: false,
  title: 'Error',
  message: '',
  details: '',
  showRetry: false,
  retryCallback: null
})

export const useErrorHandler = () => {
  const showError = ({
    title = 'Access Denied',
    message,
    details = '',
    showRetry = false,
    retryCallback = null
  }: ShowErrorOptions): void => {
    errorState.value = {
      show: true,
      title,
      message,
      details,
      showRetry,
      retryCallback
    }
  }

  const hideError = () => {
    errorState.value.show = false
    errorState.value.retryCallback = null
  }

  const handleRetry = () => {
    if (errorState.value.retryCallback) {
      errorState.value.retryCallback()
    }
    hideError()
  }

  // Predefined error messages for common scenarios
  const showOwnerAccessError = () => {
    showError({
      title: 'Access Restricted - Owner Only',
      message: 'This reporting dashboard is only accessible to organization owners.',
      details: 'You need to be marked as an owner in the organization_user table with is_owner=true. Please contact your system administrator if you believe you should have access to this dashboard.',
      showRetry: true,
      retryCallback: () => {
        // Clear authentication and redirect to login
        localStorage.clear()
        sessionStorage.clear()
        window.location.href = '/login'
      }
    })
  }

  const showAuthenticationError = () => {
    showError({
      title: 'Authentication Failed',
      message: 'Unable to verify your identity.',
      details: 'Please try logging in again. If the problem persists, contact support.',
      showRetry: true,
      retryCallback: () => {
        // Clear authentication and redirect to login page
        localStorage.clear()
        sessionStorage.clear()
        window.location.href = '/login'
      }
    })
  }

  const showNetworkError = () => {
    showError({
      title: 'Connection Error',
      message: 'Unable to connect to the server.',
      details: 'Please check your internet connection and try again.',
      showRetry: true,
      retryCallback: () => {
        // Reload the page
        window.location.reload()
      }
    })
  }

  const showServerError = () => {
    showError({
      title: 'Server Error',
      message: 'Something went wrong on our end.',
      details: 'Our team has been notified. Please try again in a few minutes.',
      showRetry: true,
      retryCallback: () => {
        // Reload the page
        window.location.reload()
      }
    })
  }

  const showTokenError = () => {
    showError({
      title: 'Session Expired',
      message: 'Your session has expired or is invalid.',
      details: 'Please log in again to continue using the dashboard.',
      showRetry: true,
      retryCallback: () => {
        // Clear storage and redirect to login
        localStorage.clear()
        sessionStorage.clear()
        window.location.href = '/login'
      }
    })
  }

  return {
    errorState,
    showError,
    hideError,
    handleRetry,
    showOwnerAccessError,
    showAuthenticationError,
    showNetworkError,
    showServerError,
    showTokenError
  }
}