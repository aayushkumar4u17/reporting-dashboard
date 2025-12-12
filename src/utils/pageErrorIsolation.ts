import { App } from 'vue'
import ErrorHandler from './errorHandler'

// Page-specific error isolation utility
export class PageErrorIsolation {
  private static pageErrors = new Map<string, Set<string>>()
  
  static registerPageError(pageName: string, errorId: string): void {
    if (!this.pageErrors.has(pageName)) {
      this.pageErrors.set(pageName, new Set())
    }
    this.pageErrors.get(pageName)!.add(errorId)
  }
  
  static clearPageErrors(pageName: string): void {
    this.pageErrors.delete(pageName)
    ErrorHandler.clearComponentErrors(pageName)
  }
  
  static getPageErrorCount(pageName: string): number {
    return this.pageErrors.get(pageName)?.size || 0
  }
  
  static hasPageErrors(pageName: string): boolean {
    return this.getPageErrorCount(pageName) > 0
  }
  
  static clearAllPageErrors(): void {
    this.pageErrors.clear()
  }
  
  // Install as Vue plugin
  static install(app: App): void {
    app.config.globalProperties.$pageErrorIsolation = this
    
    // Global error handler
    app.config.errorHandler = (error: any, instance: any, info: string) => {
      const componentName = instance?.type?.name || 'Unknown'
      const errorId = `${componentName}-${Date.now()}`
      
      this.registerPageError(componentName, errorId)
      
      ErrorHandler.handleError(error, {
        component: componentName,
        action: `Vue Error: ${info}`
      })
      
      console.error('Vue Global Error:', {
        component: componentName,
        error: error.message,
        info,
        errorId,
        timestamp: new Date().toISOString()
      })
    }
  }
}

// Navigation guard to clear errors between pages
export const createPageErrorGuard = () => {
  return (to: any, from: any, next: any) => {
    // Clear errors from the previous page
    if (from.name) {
      PageErrorIsolation.clearPageErrors(String(from.name))
    }
    next()
  }
}

export default PageErrorIsolation