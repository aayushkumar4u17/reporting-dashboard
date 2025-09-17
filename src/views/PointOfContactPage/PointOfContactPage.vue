<template>
  <div class="point-of-contact-page">
    <div class="poc-container">
      <!-- Filter Bar -->
      <div class="filter-bar" :class="{ 'animate-slide-down': isLoaded }">
        <div class="filter-group">
          <label class="filter-label">State</label>
          <select v-model="selectedState" class="filter-select">
            <option value="">Select State</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label class="filter-label">City</label>
          <select v-model="selectedCity" class="filter-select">
            <option value="">Select City</option>
          </select>
        </div>
        
        <div class="filter-actions">
          <AnimatedButton @click="applyFilters" variant="primary" size="small">
            Apply Filter
          </AnimatedButton>
          <AnimatedButton @click="clearAllFilters" variant="clear" size="small">
            Clear All Filters
          </AnimatedButton>
        </div>
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
            <!-- Skeleton loading rows -->
            <tr v-if="loading" v-for="i in 5" :key="i" class="skeleton-row">
              <td class="table-cell location-cell">
                <SkeletonLoader width="80%" height="16px" />
              </td>
              <td class="table-cell">
                <SkeletonLoader width="60%" height="16px" />
              </td>
              <td class="table-cell">
                <SkeletonLoader width="70%" height="16px" />
              </td>
              <td class="table-cell">
                <SkeletonLoader width="70%" height="16px" />
              </td>
            </tr>
            
            <!-- Actual data rows -->
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
import AnimatedButton from '@/components/layout/AnimatedButton.vue'
import SkeletonLoader from '@/components/layout/SkeletonLoader.vue'
import { useFilters } from '@/composables/useFilters'

// Animation state
const isLoaded = ref(false)
const loading = ref(true)

// Filter states using composable
const { filters, clearFilters, buildFilterPayload } = useFilters()
const selectedState = ref('')
const selectedCity = ref('')

// Locations data
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
  clearFilters()
  loadData()
}

const applyFilters = () => {
  // Update filters object with current values
  filters.value.selectedState = selectedState.value
  filters.value.selectedCity = selectedCity.value
  loadData()
}

const loadData = () => {
  // TODO: Implement API call to fetch point of contact data
  loading.value = false
}

// Initialize animations on component mount
onMounted(() => {
  setTimeout(() => {
    isLoaded.value = true
  }, 100)
  
  // Simulate data loading
  loadData()
})
</script>

<style scoped>
@import './PointOfContactPage.css';
</style>