import type { App } from 'vue'

// Layout Components
export { default as Navbar } from './layout/Navbar.vue'
export { default as AnimatedButton } from './layout/AnimatedButton.vue'
export { default as ErrorPopup } from './layout/ErrorPopup.vue'
export { default as SkeletonLoader } from './layout/SkeletonLoader.vue'
export { default as TermsPopup } from './layout/TermsPopup.vue'

// Other Components
export { default as AuthGuard } from './AuthGuard.vue'
export { default as ErrorNotification } from './ErrorNotification.vue'

// Import components for registration
import Navbar from './layout/Navbar.vue'
import AnimatedButton from './layout/AnimatedButton.vue'
import ErrorPopup from './layout/ErrorPopup.vue'
import SkeletonLoader from './layout/SkeletonLoader.vue'
import TermsPopup from './layout/TermsPopup.vue'
import AuthGuard from './AuthGuard.vue'
import ErrorNotification from './ErrorNotification.vue'

export default {
  install(app: App) {
    app.component('Navbar', Navbar)
    app.component('AnimatedButton', AnimatedButton)
    app.component('ErrorPopup', ErrorPopup)
    app.component('SkeletonLoader', SkeletonLoader)
    app.component('TermsPopup', TermsPopup)
    app.component('AuthGuard', AuthGuard)
    app.component('ErrorNotification', ErrorNotification)
  }
}