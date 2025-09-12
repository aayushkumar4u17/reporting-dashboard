import type { App } from 'vue'
import SkeletonLoader from './common/SkeletonLoader.vue'

export default {
  install(app: App) {
    app.component('SkeletonLoader', SkeletonLoader)
  }
}