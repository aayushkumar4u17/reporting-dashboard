import './assets/main.css'
import '@/config'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import App from './App.vue'
import router from './router'
import components from './components'
import { initializeAuthState } from './utils/auth'
import { validateEnvironment } from './utils/envValidator'
import ErrorBoundary from './components/ErrorBoundary.vue'
import PageErrorIsolation, { createPageErrorGuard } from './utils/pageErrorIsolation'
import ErrorHandler from './utils/errorHandler'

// Validate environment before starting app
try {
  validateEnvironment()
} catch (error) {
  console.error('Environment validation failed:', error)
  document.body.innerHTML = `
    <div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: Arial, sans-serif;">
      <div style="text-align: center; padding: 20px; border: 1px solid #dc3545; border-radius: 8px; background: #f8d7da; color: #721c24;">
        <h2>Configuration Error</h2>
        <p>The application is not properly configured. Please contact support.</p>
      </div>
    </div>
  `
  throw error
}

const app = createApp(App)
const pinia = createPinia()

// Enhanced global error handler with isolation
app.config.errorHandler = (err, instance, info) => {
  const componentName = instance?.$?.type?.name || 'Unknown'
  
  // Use our error handler for consistent error processing
  const safeError = ErrorHandler.handleError(err, {
    component: componentName,
    action: `Vue Error: ${info}`
  })
  
  console.error('Global error handled:', {
    component: componentName,
    message: safeError.message,
    severity: safeError.severity,
    info,
    timestamp: new Date().toISOString()
  })
  
  // Don't let errors break the app completely
  if (info === 'mounted hook' || info === 'updated hook') {
    console.warn('Lifecycle hook error caught and handled')
  }
}

// Install error isolation plugin
app.use(PageErrorIsolation)

// Register global components
app.component('ErrorBoundary', ErrorBoundary)

app.use(pinia)
app.use(router)
app.use(components)
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: '.dark-mode'
    }
  }
})

// Add page error guard to router
router.beforeEach(createPageErrorGuard())

// Initialize auth state before mounting
initializeAuthState().catch(error => {
  ErrorHandler.handleError(error, {
    component: 'App',
    action: 'initializeAuthState'
  })
}).finally(() => {
  app.mount('#app')
})