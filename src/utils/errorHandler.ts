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

class ErrorHandler {
  private static sanitizeMessage(message: string): string {
    // Remove potential sensitive information
    return message
      .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]')
      .replace(/\b\d{10,}\b/g, '[PHONE]')
      .replace(/\b[A-Za-z0-9]{20,}\b/g, '[TOKEN]')
      .replace(/password|secret|key|token/gi, '[REDACTED]');
  }

  static handleError(error: any, context?: ErrorContext): SafeError {
    const timestamp = Date.now();
    const sanitizedMessage = this.sanitizeMessage(error?.message || 'Unknown error');
    
    // Log safely without exposing sensitive data
    console.error('Application error:', {
      message: sanitizedMessage,
      code: error?.code,
      component: context?.component,
      action: context?.action,
      timestamp,
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
      }
    };

    const mappedError = errorMap[error?.code];
    if (mappedError) {
      return mappedError;
    }

    // Default error handling
    return {
      message: sanitizedMessage,
      code: error?.code,
      severity: 'medium',
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
        code: graphqlError.extensions?.code
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
}

export default ErrorHandler;