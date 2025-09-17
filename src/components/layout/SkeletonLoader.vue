<template>
  <div class="skeleton-loader" :class="{ 'animate-pulse': animate }">
    <slot>
      <div class="skeleton-content" :style="{ height: height, width: width }"></div>
    </slot>
  </div>
</template>

<script setup lang="ts">
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
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
}

.skeleton-content {
  width: 100%;
  height: 1rem;
  background-color: transparent;
}

.animate-pulse {
  animation: loading 1.8s ease-in-out infinite;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Add a subtle shimmer effect */
.skeleton-loader::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.4) 50%,
    transparent 100%
  );
  animation: shimmer 2s ease-in-out infinite;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}
</style>