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
  margin-left: 250px;
  margin-top: 70px;
  min-height: calc(100vh - 70px);
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  position: relative;
  z-index: 1;
  padding: 0;
  width: calc(100vw - 250px);
  box-sizing: border-box;
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
    width: 100vw;
  }
}
</style>