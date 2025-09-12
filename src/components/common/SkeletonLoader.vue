<template>
  <div class="skeleton-loader" :class="{ 'animate-pulse': animate }">
    <slot>
      <div class="skeleton-content" :style="{ height: height, width: width }"></div>
    </slot>
  </div>
</template>

<script setup>
defineProps({
  width: {
    type: String,
    default: '100%'
  },
  height: {
    type: String,
    default: '1rem'
  },
  animate: {
    type: Boolean,
    default: true
  }
})
</script>

<style scoped>
.skeleton-loader {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  border-radius: 8px;
  overflow: hidden;
}

.skeleton-content {
  width: 100%;
  height: 1rem;
  background-color: transparent;
}

.animate-pulse {
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>