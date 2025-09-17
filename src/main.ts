import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import components from './components'
import { initializeAuthState } from './utils/auth'

// Initialize Firebase first
import '@/config'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(components)

// Initialize auth state before mounting for better page refresh handling
initializeAuthState().catch(console.error).finally(() => {
  // Mount app after auth state is initialized
  app.mount('#app')
})