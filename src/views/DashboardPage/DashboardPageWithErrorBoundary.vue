<template>
  <ErrorBoundaryWrapper 
    component-name="DashboardPage"
    :on-retry="retryDashboardData"
  >
    <DashboardPage />
  </ErrorBoundaryWrapper>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ErrorBoundaryWrapper from '@/components/ErrorBoundaryWrapper.vue'
import DashboardPage from './DashboardPage.vue'

const retryDashboardData = () => {
  // Force component re-render by changing key
  window.location.reload()
}
</script>