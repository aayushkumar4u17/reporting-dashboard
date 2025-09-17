<template>
  <div class="layout">
    <Navbar />
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import Navbar from '@/components/layout/Navbar.vue'
</script>

<style scoped>
.layout {
  min-height: 100vh;
}

.main-content {
  padding: 1rem;
}
</style>