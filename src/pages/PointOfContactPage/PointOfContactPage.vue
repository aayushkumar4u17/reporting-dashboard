<template>
  <div class="point-of-contact-page">
    <div class="poc-container">
      <!-- Filter Bar -->
      <div class="filter-bar" :class="{ 'animate-slide-down': isLoaded }">
        <div class="filter-group">
          <label class="filter-label">State</label>
          <select v-model="selectedState" class="filter-select">
            <option value="">Select State</option>
            <option value="karnataka">Karnataka</option>
            <option value="maharashtra">Maharashtra</option>
            <option value="delhi">Delhi</option>
            <option value="tamil-nadu">Tamil Nadu</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label class="filter-label">City</label>
          <select v-model="selectedCity" class="filter-select">
            <option value="">Select City</option>
            <option value="bangalore">Bangalore</option>
            <option value="mumbai">Mumbai</option>
            <option value="delhi">Delhi</option>
            <option value="chennai">Chennai</option>
          </select>
        </div>
        
        <AnimatedButton @click="clearAllFilters" variant="clear" size="small">
          Clear All Filters
        </AnimatedButton>
      </div>

      <!-- Data Table -->
      <div class="table-container" :class="{ 'animate-fade-in-up': isLoaded }">
        <table class="poc-table">
          <thead>
            <tr class="table-header">
              <th class="header-cell location-header">My Locations</th>
              <th class="header-cell">POC Name</th>
              <th class="header-cell">Contact Number</th>
              <th class="header-cell">Email ID</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="location in filteredLocations" :key="location.id" class="table-row">
              <td class="table-cell location-cell">{{ location.name }}</td>
              <td class="table-cell">{{ location.pocName }}</td>
              <td class="table-cell">{{ location.contactNumber }}</td>
              <td class="table-cell">
                <a v-if="location.email !== 'Add +'" :href="`mailto:${location.email}`" class="email-link">
                  {{ location.email }}
                </a>
                <span v-else class="add-link">{{ location.email }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AnimatedButton from '@/components/common/AnimatedButton.vue'

// Animation state
const isLoaded = ref(false)

// Filter states
const selectedState = ref('')
const selectedCity = ref('')

// Mock data for locations
const locations = ref([])

// Computed property for filtered locations
const filteredLocations = computed(() => {
  return locations.value.filter(location => {
    const stateMatch = !selectedState.value || location.state === selectedState.value
    const cityMatch = !selectedCity.value || location.city === selectedCity.value
    return stateMatch && cityMatch
  })
})

const clearAllFilters = () => {
  selectedState.value = ''
  selectedCity.value = ''
}

// Initialize animations on component mount
onMounted(() => {
  setTimeout(() => {
    isLoaded.value = true
  }, 100)
})
</script>

<style scoped>
  /* All CSS has been moved to PointOfContactPage.css */
  @import './PointOfContactPage.css';
</style>