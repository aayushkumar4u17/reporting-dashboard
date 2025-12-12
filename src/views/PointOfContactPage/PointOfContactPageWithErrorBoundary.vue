<template>
  <ErrorBoundaryWrapper 
    component-name="PointOfContactPage"
    :on-retry="retryPageData"
  >
    <PointOfContactPage />
  </ErrorBoundaryWrapper>
</template>

<script setup lang="ts">
import ErrorBoundaryWrapper from '@/components/ErrorBoundaryWrapper.vue'
import PointOfContactPage from './PointOfContactPage.vue'

const retryPageData = () => {
  // Force component re-render
  window.location.reload()
}
</script>