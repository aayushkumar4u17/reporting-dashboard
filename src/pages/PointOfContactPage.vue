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
        
        <AnimatedButton @click="clearAllFilters" variant="clear" size="medium">
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
.point-of-contact-page {
  width: 100%;
  min-height: calc(100vh - 56px);
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  position: relative;
  overflow-x: hidden;
  overflow-y: auto;
  scroll-behavior: smooth;
}

.point-of-contact-page::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 20% 80%, rgba(0, 200, 81, 0.05) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(0, 200, 81, 0.03) 0%, transparent 50%);
  pointer-events: none;
}

.poc-container {
  width: 100%;
  padding: 1.5rem;
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
}

/* Filter Bar Styles */
.filter-bar {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 1rem;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.2);
  margin-bottom: 1.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: flex-end;
  border: 1px solid rgba(0, 200, 81, 0.1);
  opacity: 0;
  transform: translateY(-20px);
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.filter-bar.animate-slide-down {
  opacity: 1;
  transform: translateY(0);
}

.filter-group {
  display: flex;
  flex-direction: column;
  min-width: 130px;
}

.filter-label {
  font-size: 0.9rem;
  color: #333;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.filter-select {
  padding: 0.6rem;
  border: 2px solid rgba(0, 200, 81, 0.3);
  border-radius: 10px;
  font-size: 0.85rem;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(5px);
  color: #333;
  min-width: 120px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.filter-select:hover {
  border-color: rgba(0, 200, 81, 0.6);
  background: rgba(255, 255, 255, 0.95);
  transform: translateY(-1px);
}

.filter-select:focus {
  outline: none;
  border-color: #00C851;
  box-shadow: 0 0 0 3px rgba(0, 200, 81, 0.2);
  transform: translateY(-2px);
}



/* Table Styles */
.table-container {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(0, 200, 81, 0.15);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.2);
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0;
  transform: translateY(20px);
}

.table-container.animate-fade-in-up {
  opacity: 1;
  transform: translateY(0);
}

.table-container:hover {
  box-shadow: 0 12px 40px rgba(0, 200, 81, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.3);
}

.poc-table {
  width: 100%;
  border-collapse: collapse;
}

.table-header {
  background-color: #f8f9fa;
}

.header-cell {
  padding: 0.75rem;
  text-align: left;
  font-weight: 600;
  color: #333;
  border-bottom: 2px solid #e9ecef;
  font-size: 0.8rem;
}

.location-header {
  background-color: #00C851;
  color: white;
  width: 25%;
}

.table-row {
  border-bottom: 1px solid #e9ecef;
}

.table-row:hover {
  background-color: #f8f9fa;
}

.table-cell {
  padding: 0.75rem;
  color: #333;
  font-size: 0.8rem;
  vertical-align: middle;
}

.location-cell {
  background-color: #e8f5e8;
  font-weight: 500;
}

.email-link {
  color: #00C851;
  text-decoration: none;
}

.email-link:hover {
  text-decoration: underline;
}

.add-link {
  color: #666;
  font-style: italic;
}

/* Responsive Design */
@media (max-width: 768px) {
  .point-of-contact-page {
    /* No margin-left change needed - handled by App.vue */
  }
  
  .poc-container {
    padding: 1rem;
  }
  
  .filter-bar {
    padding: 1rem;
    gap: 1rem;
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-group {
    min-width: auto;
  }
  
  .clear-filters-btn {
    align-self: center;
    margin-top: 0.5rem;
  }
  
  .table-container {
    overflow-x: auto;
  }
  
  .poc-table {
    min-width: 600px;
  }
  
  .header-cell,
  .table-cell {
    padding: 0.75rem 0.5rem;
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .poc-container {
    padding: 0.5rem;
  }
  
  .filter-bar {
    padding: 0.75rem;
    gap: 0.75rem;
  }
  
  .poc-table {
    min-width: 500px;
  }
  
  .header-cell,
  .table-cell {
    padding: 0.5rem 0.25rem;
    font-size: 0.75rem;
  }
}
</style>