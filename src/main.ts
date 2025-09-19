import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import components from './components'
import { initializeAuthState } from './utils/auth'
import { validateEnvironment } from './utils/envValidator'
import ErrorBoundary from './components/ErrorBoundary.vue'

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

// Initialize Firebase first
import '@/config'

const app = createApp(App)
const pinia = createPinia()

// Global error handler
app.config.errorHandler = (err, instance, info) => {
  console.error('Global error:', { message: 'Application error occurred', info })
}

// Register global components
app.component('ErrorBoundary', ErrorBoundary)

app.use(pinia)
app.use(router)
app.use(components)

// Initialize auth state before mounting for better page refresh handling
initializeAuthState().catch(console.error).finally(() => {
  // Mount app after auth state is initialized
  app.mount('#app')
})