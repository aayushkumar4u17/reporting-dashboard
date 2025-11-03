<template>
  <div class="layout">
    <Navbar />
    <main class="main-content" :class="{ 'sidebar-collapsed': isSidebarCollapsed }">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import Navbar from '@/components/layout/Navbar.vue'
import { useSidebar } from '@/composables/useSidebar'

// Use sidebar composable
const { isSidebarCollapsed } = useSidebar()
</script>

<style scoped>
.layout {
  min-height: 100vh;
}

.main-content {
  margin-left: 200px;
  margin-top: 70px;
  min-height: calc(100vh - 70px);
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  position: relative;
  z-index: 1;
  padding: 0;
  width: calc(100vw - 200px);
  box-sizing: border-box;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.main-content.sidebar-collapsed {
  margin-left: 60px;
  width: calc(100vw - 60px);
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
    width: 100vw;
  }
  
  .main-content.sidebar-collapsed {
    margin-left: 0;
    width: 100vw;
  }
}
</style>