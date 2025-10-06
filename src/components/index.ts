import type { App } from 'vue'

// Import components for registration
import Navbar from './layout/Navbar.vue'
import AnimatedButton from './layout/AnimatedButton.vue'
import ErrorPopup from './layout/ErrorPopup.vue'
import SkeletonLoader from './layout/SkeletonLoader.vue'
import ModernLoader from './ui/ModernLoader.vue'
import BreathingLoader from './ui/BreathingLoader.vue'
import LiquidLoader from './ui/LiquidLoader.vue'
import TermsPopup from './layout/TermsPopup.vue'
import DatePicker from './layout/DatePicker.vue'
import AuthGuard from './AuthGuard.vue'
import ErrorNotification from './ErrorNotification.vue'

// Export components
export { default as Navbar } from './layout/Navbar.vue'
export { default as AnimatedButton } from './layout/AnimatedButton.vue'
export { default as ErrorPopup } from './layout/ErrorPopup.vue'
export { default as SkeletonLoader } from './layout/SkeletonLoader.vue'
export { default as ModernLoader } from './ui/ModernLoader.vue'
export { default as BreathingLoader } from './ui/BreathingLoader.vue'
export { default as LiquidLoader } from './ui/LiquidLoader.vue'
export { default as TermsPopup } from './layout/TermsPopup.vue'
export { default as DatePicker } from './layout/DatePicker.vue'
export { default as AuthGuard } from './AuthGuard.vue'
export { default as ErrorNotification } from './ErrorNotification.vue'

export default {
  install(app: App) {
    app.component('Navbar', Navbar)
    app.component('AnimatedButton', AnimatedButton)
    app.component('ErrorPopup', ErrorPopup)
    app.component('SkeletonLoader', SkeletonLoader)
    app.component('ModernLoader', ModernLoader)
    app.component('BreathingLoader', BreathingLoader)
    app.component('LiquidLoader', LiquidLoader)
    app.component('TermsPopup', TermsPopup)
    app.component('DatePicker', DatePicker)
    app.component('AuthGuard', AuthGuard)
    app.component('ErrorNotification', ErrorNotification)
  }
}