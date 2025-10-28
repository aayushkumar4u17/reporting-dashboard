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
        shouldRetry: true
      },
      'auth/too-many-requests': {
        message: sanitizedMessage,
        code: error?.code,
        severity: 'medium',
        userMessage: 'Too many attempts. Please wait before trying again.',
        shouldRetry: false
      },
      'auth/invalid-phone-number': {
        message: sanitizedMessage,
        code: error?.code,
        severity: 'low',
        userMessage: 'Please enter a valid phone number.',
        shouldRetry: true
      },
      'auth/invalid-verification-code': {
        message: sanitizedMessage,
        code: error?.code,
        severity: 'low',
        userMessage: 'Invalid verification code. Please try again.',
        shouldRetry: true
      },
      'GRAPHQL_ERROR': {
        message: sanitizedMessage,
        code: error?.code,
        severity: 'medium',
        userMessage: 'Data loading failed. Please try again.',
        shouldRetry: true
      },
      'NETWORK_ERROR': {
        message: sanitizedMessage,
        code: 'NETWORK_ERROR',
        severity: 'high',
        userMessage: 'Connection failed. Please check your internet connection.',
        shouldRetry: true
      }
    };

    const mappedError = errorMap[error?.code];
    if (mappedError) {
      return mappedError;
    }

    // Default error handling with severity based on error type
    let severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
    if (error?.name === 'TypeError' || error?.name === 'ReferenceError') {
      severity = 'high'
    } else if (error?.message?.includes('fetch') || error?.message?.includes('network')) {
      severity = 'medium'
    }

    return {
      message: sanitizedMessage,
      code: error?.code,
      severity,
      userMessage: 'An unexpected error occurred. Please try again.',
      shouldRetry: true
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