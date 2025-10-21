<script setup>
import { onMounted } from 'vue'
import { useRouter } from "vue-router"
import { useErrorHandler } from "@/composables/useErrorHandler"
import { useThemeStore } from "@/stores/theme"
import Navbar from "@/components/layout/Navbar.vue"
import ErrorNotification from "@/components/ErrorNotification.vue"
import AuthGuard from "@/components/AuthGuard.vue"

const router = useRouter()
const { errorState, hideError, handleRetry } = useErrorHandler()
const themeStore = useThemeStore()

const routesWithoutXPadding = ["/dashboard", "/point-of-contact", "/my-orders", "/my-invoices", "/payments"]

// Initialize theme on app mount
onMounted(() => {
  themeStore.initializeTheme()
})
</script>

<template>
  <main>
    <template v-if="router.currentRoute.value.fullPath === '/login'">
      <router-view />
    </template>
    <AuthGuard v-else>
      <Navbar
        v-if="
          router.currentRoute.value.fullPath !== '/login' &&
          router.currentRoute.value.fullPath !== '/' &&
          router.currentRoute.value.fullPath !== '/select-user'
        " />
      <div
        v-if="router.currentRoute.value.fullPath === '/select-user'"
        class="fullscreen-content">
        <router-view />
      </div>
      <div
        v-else
        class="content-wrapper"
        :class="
          routesWithoutXPadding.includes(router.currentRoute.value.fullPath)
            ? 'with-sidebar'
            : 'without-sidebar'
        ">
        <router-view />
      </div>
    </AuthGuard>
    
    <ErrorNotification
      :show="errorState.show"
      :title="errorState.title"
      :message="errorState.message"
      :details="errorState.details"
      :show-retry="errorState.showRetry"
      @close="hideError"
      @retry="handleRetry"
    />
  </main>
</template>

<style scoped>
main {
  height: 100vh;
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  overflow: hidden;
  transition: background-color 0.3s ease, color 0.3s ease;
}
.content-wrapper {
  height: 100vh;
  overflow-y: auto;
  scroll-behavior: smooth;
  scrollbar-width: thin;
  scrollbar-color: #00C851 #f1f1f1;
}

.content-wrapper.with-sidebar {
  margin-left: 200px;
  padding-top: 64px;
  padding-left: 0;
  padding-right: 0;
}

.content-wrapper.without-sidebar {
  padding-top: 80px;
  padding-left: 3rem;
  padding-right: 3rem;
  margin-left: auto;
  margin-right: auto;
}

.fullscreen-content {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
}

@media (max-width: 768px) {
  .content-wrapper.with-sidebar {
    margin-left: 0;
    padding-top: 64px;
  }
  
  .content-wrapper.without-sidebar {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}
</style>
