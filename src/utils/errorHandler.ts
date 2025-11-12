interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  timestamp?: number;
}

interface SafeError {
  message: string;
  code?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  userMessage: string;
  shouldRetry: boolean;
  suggestions: string[];
  category: 'network' | 'auth' | 'data' | 'permission' | 'server' | 'client' | 'unknown';
}

// Global error state to prevent cross-page contamination
const errorRegistry = new Map<string, Set<string>>()

class ErrorHandler {
  private static sanitizeMessage(message: string): string {
    // Remove potential sensitive information
    return message
      .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]')
      .replace(/\b\d{10,}\b/g, '[PHONE]')
      .replace(/\b[A-Za-z0-9]{20,}\b/g, '[TOKEN]')
      .replace(/password|secret|key|token/gi, '[REDACTED]');
  }

  static registerError(component: string, errorId: string): void {
    if (!errorRegistry.has(component)) {
      errorRegistry.set(component, new Set())
    }
    errorRegistry.get(component)!.add(errorId)
  }

  static clearComponentErrors(component: string): void {
    errorRegistry.delete(component)
  }

  static isErrorIsolated(component: string, errorId: string): boolean {
    return errorRegistry.get(component)?.has(errorId) ?? false
  }

  static handleError(error: any, context?: ErrorContext): SafeError {
    const timestamp = Date.now();
    const sanitizedMessage = this.sanitizeMessage(error?.message || 'Unknown error');
    const errorId = `${context?.component || 'unknown'}-${timestamp}`
    
    // Register error for isolation
    if (context?.component) {
      this.registerError(context.component, errorId)
    }
    
    // Log safely without exposing sensitive data
    console.error('Application error:', {
      message: sanitizedMessage,
      code: error?.code,
      component: context?.component,
      action: context?.action,
      timestamp,
      errorId,
      stack: import.meta.env.MODE === 'development' ? error?.stack : undefined
    });

    // Map common errors to user-friendly messages
    const errorMap: Record<string, SafeError> = {
      'auth/network-request-failed': {
        message: sanitizedMessage,
        code: error?.code,
        severity: 'medium',
        userMessage: 'Network connection failed. Please check your internet connection.',
        shouldRetry: true,
        suggestions: ['Check your internet connection', 'Try refreshing the page', 'Contact support if the issue persists'],
        category: 'network'
      },
      'auth/too-many-requests': {
        message: sanitizedMessage,
        code: error?.code,
        severity: 'medium',
        userMessage: 'Too many attempts. Please wait before trying again.',
        shouldRetry: false,
        suggestions: ['Wait a few minutes before trying again', 'Clear your browser cache', 'Try using a different device'],
        category: 'auth'
      },
      'auth/invalid-phone-number': {
        message: sanitizedMessage,
        code: error?.code,
        severity: 'low',
        userMessage: 'Please enter a valid phone number.',
        shouldRetry: true,
        suggestions: ['Enter a 10-digit phone number', 'Make sure the number is correct', 'Try without country code'],
        category: 'auth'
      },
      'auth/invalid-verification-code': {
        message: sanitizedMessage,
        code: error?.code,
        severity: 'low',
        userMessage: 'Invalid verification code. Please try again.',
        shouldRetry: true,
        suggestions: ['Check the OTP in your SMS', 'Make sure you entered all 6 digits', 'Request a new OTP if expired'],
        category: 'auth'
      },
      'GRAPHQL_ERROR': {
        message: sanitizedMessage,
        code: error?.code,
        severity: 'medium',
        userMessage: 'Data loading failed. Please try again.',
        shouldRetry: true,
        suggestions: ['Refresh the page', 'Check your internet connection', 'Try again in a few moments'],
        category: 'data'
      },
      'NETWORK_ERROR': {
        message: sanitizedMessage,
        code: 'NETWORK_ERROR',
        severity: 'high',
        userMessage: 'Connection failed. Please check your internet connection.',
        shouldRetry: true,
        suggestions: ['Check your internet connection', 'Try refreshing the page', 'Switch to a different network if available'],
        category: 'network'
      },
      'PERMISSION_DENIED': {
        message: sanitizedMessage,
        code: 'PERMISSION_DENIED',
        severity: 'high',
        userMessage: 'You don\'t have permission to access this resource.',
        shouldRetry: false,
        suggestions: ['Contact your administrator', 'Make sure you\'re logged in with the correct account', 'Try logging out and back in'],
        category: 'permission'
      },
      'SERVER_ERROR': {
        message: sanitizedMessage,
        code: 'SERVER_ERROR',
        severity: 'high',
        userMessage: 'Server is temporarily unavailable. Please try again later.',
        shouldRetry: true,
        suggestions: ['Try again in a few minutes', 'Refresh the page', 'Contact support if the issue persists'],
        category: 'server'
      },
      'DATA_NOT_FOUND': {
        message: sanitizedMessage,
        code: 'DATA_NOT_FOUND',
        severity: 'low',
        userMessage: 'The requested data could not be found.',
        shouldRetry: true,
        suggestions: ['Try adjusting your filters', 'Check if the data exists', 'Refresh the page'],
        category: 'data'
      }
    };

    const mappedError = errorMap[error?.code];
    if (mappedError) {
      return mappedError;
    }

    // Default error handling with severity based on error type
    let severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
    let category: 'network' | 'auth' | 'data' | 'permission' | 'server' | 'client' | 'unknown' = 'unknown'
    let suggestions: string[] = ['Try refreshing the page', 'Check your internet connection', 'Contact support if the issue persists']
    let userMessage = 'An unexpected error occurred. Please try again.'
    
    if (error?.name === 'TypeError' || error?.name === 'ReferenceError') {
      severity = 'high'
      category = 'client'
      userMessage = 'A technical error occurred. Please refresh the page.'
      suggestions = ['Refresh the page', 'Clear your browser cache', 'Try using a different browser']
    } else if (error?.message?.includes('fetch') || error?.message?.includes('network')) {
      severity = 'medium'
      category = 'network'
      userMessage = 'Network connection failed. Please check your internet connection.'
      suggestions = ['Check your internet connection', 'Try refreshing the page', 'Switch to a different network if available']
    } else if (error?.message?.includes('403') || error?.message?.includes('Forbidden')) {
      severity = 'high'
      category = 'permission'
      userMessage = 'Access denied. You don\'t have permission to perform this action.'
      suggestions = ['Contact your administrator', 'Make sure you\'re logged in correctly', 'Try logging out and back in']
    } else if (error?.message?.includes('500') || error?.message?.includes('502') || error?.message?.includes('503')) {
      severity = 'high'
      category = 'server'
      userMessage = 'Server error. Please try again later.'
      suggestions = ['Try again in a few minutes', 'Refresh the page', 'Contact support if the issue persists']
    } else if (error?.message?.includes('401') || error?.message?.includes('Unauthorized')) {
      severity = 'medium'
      category = 'auth'
      userMessage = 'Your session has expired. Please log in again.'
      suggestions = ['Log out and log back in', 'Clear your browser cache', 'Try using a different browser']
    }

    return {
      message: sanitizedMessage,
      code: error?.code,
      severity,
      userMessage,
      shouldRetry: true,
      suggestions,
      category
    };
  }

  static handleApiError(error: any, context?: ErrorContext): SafeError {
    const graphqlError = error?.response?.errors?.[0];
    const networkError = error?.networkError;

    if (graphqlError) {
      return this.handleError({
        message: graphqlError.message,
        code: 'GRAPHQL_ERROR'
      }, context);
    }

    if (networkError) {
      return this.handleError({
        message: 'Network error occurred',
        code: 'NETWORK_ERROR'
      }, context);
    }

    return this.handleError(error, context);
  }

  static createSafeAsyncWrapper<T>(
    asyncFn: () => Promise<T>,
    component: string,
    fallbackValue?: T
  ): () => Promise<T | undefined> {
    return async () => {
      try {
        return await asyncFn()
      } catch (error) {
        this.handleError(error, { component })
        return fallbackValue
      }
    }
  }
}

export default ErrorHandler;