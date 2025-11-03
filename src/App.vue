<script setup>
import { onMounted, onErrorCaptured } from 'vue'
import { useRouter } from "vue-router"
import { useErrorHandler } from "@/composables/useErrorHandler"
import { useThemeStore } from "@/stores/theme"
import { useSidebar } from "@/composables/useSidebar"
import Navbar from "@/components/layout/Navbar.vue"
import ErrorNotification from "@/components/ErrorNotification.vue"
import AuthGuard from "@/components/AuthGuard.vue"
import ErrorHandler from "@/utils/errorHandler"

const router = useRouter()
const { errorState, hideError, handleRetry } = useErrorHandler()
const themeStore = useThemeStore()
const { isSidebarCollapsed } = useSidebar()

const routesWithoutXPadding = ["/dashboard", "/point-of-contact", "/my-orders", "/my-invoices", "/payments"]

// Global error capture to prevent cross-page contamination
onErrorCaptured((error, instance, info) => {
  const safeError = ErrorHandler.handleError(error, {
    component: 'App',
    action: `Vue Error: ${info}`
  })
  
  console.error('Global Vue Error Captured:', {
    message: safeError.message,
    component: instance?.type?.name || 'Unknown',
    info,
    timestamp: new Date().toISOString()
  })
  
  // Prevent error from propagating further
  return false
})

// Initialize theme on app mount
onMounted(() => {
  try {
    themeStore.initializeTheme()
  } catch (error) {
    ErrorHandler.handleError(error, {
      component: 'App',
      action: 'initializeTheme'
    })
  }
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
        :class="[
          routesWithoutXPadding.includes(router.currentRoute.value.fullPath)
            ? 'with-sidebar'
            : 'without-sidebar',
          { 'sidebar-collapsed': isSidebarCollapsed }
        ]">
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
  min-height: 100vh;
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  transition: background-color 0.3s ease, color 0.3s ease;
  /* Mobile scrolling fixes */
  -webkit-overflow-scrolling: touch;
  touch-action: manipulation;
  position: relative;
}


.content-wrapper.with-sidebar {
  margin-left: 200px;
  padding-top: 64px;
  padding-left: 0;
  padding-right: 0;
  width: calc(100vw - 200px);
  max-width: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.content-wrapper.with-sidebar.sidebar-collapsed {
  margin-left: 60px;
  width: calc(100vw - 60px);
}

.content-wrapper.without-sidebar {
  padding-top: 80px;
  padding-left: 3rem;
  padding-right: 3rem;
  margin-left: auto;
  margin-right: auto;
  width: 100%;
  max-width: none;
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
    width: 100vw;
    max-width: none;
    /* Mobile scrolling fixes */
    -webkit-overflow-scrolling: touch;
    touch-action: pan-y;
    overscroll-behavior-y: contain;
  }
  
  .content-wrapper.without-sidebar {
    padding-left: 1rem;
    padding-right: 1rem;
    width: 100vw;
    max-width: none;
    /* Mobile scrolling fixes */
    -webkit-overflow-scrolling: touch;
    touch-action: pan-y;
    overscroll-behavior-y: contain;
  }
  
  /* Fix for mobile viewport height issues */
  main {
    min-height: 100dvh; /* Use dynamic viewport height on supported browsers */
  }
  
  .content-wrapper {
    min-height: 100dvh;
  }
}
</style>
