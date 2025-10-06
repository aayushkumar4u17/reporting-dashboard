<template>
  <div class="custom-dropdown" ref="dropdownRef">
    <div 
      class="dropdown-trigger" 
      @click="toggleDropdown"
      :class="{ 'active': isOpen }"
    >
      <span class="selected-text">{{ selectedText }}</span>
      <svg class="dropdown-arrow" :class="{ 'rotated': isOpen }" viewBox="0 0 24 24" fill="none">
        <path d="M7 10L12 15L17 10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
    </div>
    
    <div v-if="isOpen" class="dropdown-menu">
      <div v-if="!options || options.length === 0" class="dropdown-no-data">
        No data
      </div>
      <div 
        v-else
        v-for="option in options" 
        :key="option"
        class="dropdown-option"
        :class="{ 'selected': option === modelValue }"
        @click="selectOption(option)"
      >
        {{ option || 'Select option' }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  modelValue: String,
  options: Array,
  placeholder: String
})

const emit = defineEmits(['update:modelValue'])

const dropdownRef = ref(null)
const isOpen = ref(false)

const selectedText = computed(() => props.modelValue || props.placeholder)

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const selectOption = (option) => {
  emit('update:modelValue', option)
  isOpen.value = false
}

const closeDropdown = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', closeDropdown)
})

onUnmounted(() => {
  document.removeEventListener('click', closeDropdown)
})
</script>

<style scoped>
.custom-dropdown {
  position: relative;
  min-width: 130px;
  width: auto;
}

.dropdown-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem;
  border: 2px solid rgba(0, 0, 0, 0.3);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.95);
  cursor: pointer;
  transition: all 0.3s ease;
  height: 40px;
  box-sizing: border-box;
}

.dropdown-trigger:hover {
  border-color: rgba(0, 0, 0, 0.6);
  transform: translateY(-1px);
}

.dropdown-trigger.active {
  border-color: #00C851;
  box-shadow: 0 0 0 3px rgba(0, 200, 81, 0.2);
}

.selected-text {
  font-size: 0.85rem;
  color: #333;
  flex: 1;
  text-align: left;
  white-space: nowrap;
  min-width: 0;
}

.dropdown-arrow {
  width: 16px;
  height: 16px;
  color: #666;
  transition: transform 0.3s ease;
}

.dropdown-arrow.rotated {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  max-height: 200px;
  overflow-y: auto;
  margin-top: 4px;
}

.dropdown-option {
  padding: 0.75rem;
  font-size: 0.85rem;
  color: #333;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.dropdown-option:hover {
  background-color: rgba(0, 200, 81, 0.1);
}

.dropdown-option.selected {
  background-color: rgba(0, 200, 81, 0.2);
  color: #00C851;
}

.dropdown-no-data {
  padding: 0.75rem;
  font-size: 0.85rem;
  color: #999;
  text-align: center;
  font-style: italic;
}
</style>