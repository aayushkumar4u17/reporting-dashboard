<template>
  <div class="user-selection-page">
    <div class="selection-container">
      <div class="header">
        <img src="/fuelbuddy-logo.svg" alt="FuelBuddy Logo" class="logo" />
        <AnimatedButton @click="toggleEditMode" variant="secondary" size="small">
          {{ isEditMode ? 'Done' : 'Edit' }}
        </AnimatedButton>
      </div>
      
      <h1 class="title">Who's accessing the dashboard?</h1>
      
      <div class="users-grid">
        <div 
          v-for="user in users" 
          :key="user.id"
          class="user-card"
          :class="{ 'edit-mode': isEditMode }"
          @click="selectUser(user)"
        >
          <div class="user-avatar" :style="{ background: user.color }">
            <span class="user-initial">{{ user.name.charAt(0) }}</span>
            <div v-if="isEditMode" class="edit-overlay">
              <span class="edit-icon">✏️</span>
            </div>
          </div>
          <p class="user-name">{{ user.name }}</p>
        </div>
        
        <div 
          class="user-card add-user"
          @click="addUser"
          v-if="users.length < 5"
        >
          <div class="user-avatar add-avatar">
            <span class="add-icon">+</span>
          </div>
          <p class="user-name">Add User</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AnimatedButton from '@/components/common/AnimatedButton.vue'

const router = useRouter()
const isEditMode = ref(false)

const users = ref([
  {
    id: 1,
    name: 'Admin',
    role: 'admin',
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    id: 2,
    name: 'Manager',
    role: 'manager', 
    color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
  },
  {
    id: 3,
    name: 'Analyst',
    role: 'analyst',
    color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
  }
])

const selectUser = (user) => {
  if (isEditMode.value) {
    editUser(user)
    return
  }
  
  // Store selected user
  localStorage.setItem('selectedUser', JSON.stringify(user))
  
  // Navigate to dashboard
  router.push('/dashboard')
}

const editUser = (user) => {
  // Simple edit functionality
  const newName = prompt('Enter new name:', user.name)
  if (newName && newName.trim()) {
    user.name = newName.trim()
  }
}

const addUser = () => {
  const name = prompt('Enter user name:')
  if (name && name.trim()) {
    const colors = [
      'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
      'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
      'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
      'linear-gradient(135deg, #fad0c4 0%, #ffd1ff 100%)'
    ]
    
    users.value.push({
      id: Date.now(),
      name: name.trim(),
      role: 'user',
      color: colors[Math.floor(Math.random() * colors.length)]
    })
  }
}

const toggleEditMode = () => {
  isEditMode.value = !isEditMode.value
}

onMounted(() => {
  // Check if user is authenticated
  const isLoggedIn = localStorage.getItem('isLoggedInReportingDashboard')
  if (!isLoggedIn || isLoggedIn !== 'true') {
    router.replace('/login')
  }
})
</script>

<style scoped>
  /* All CSS has been moved to UserSelectionPage.css */
  @import './UserSelectionPage.css';
</style>