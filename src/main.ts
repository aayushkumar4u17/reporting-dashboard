import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './firebase' // Import Firebase configuration to ensure proper initialization
import components from './components'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(components)

app.mount('#app')