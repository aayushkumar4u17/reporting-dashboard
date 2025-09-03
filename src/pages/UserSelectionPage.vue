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
.user-selection-page {
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  position: relative;
  overflow: hidden;
  color: #333;
}

.user-selection-page::before {
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

.selection-container {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  position: relative;
  z-index: 1;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
}

.header {
  position: absolute;
  top: 2rem;
  left: 2rem;
  right: 2rem;
  max-width: calc(1400px - 4rem);
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 10;
}

.logo {
  height: 40px;
}



.title {
  font-size: 2.5rem;
  font-weight: 400;
  margin-bottom: 3rem;
  margin-top: 2rem;
  color: #333;
}

.users-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  max-width: 800px;
  margin: 0 auto;
  justify-items: center;
}

.user-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 1rem;
  border-radius: 12px;
}

.user-card:hover {
  transform: translateY(-5px);
}

.user-card.edit-mode:hover {
  background: rgba(0, 200, 81, 0.1);
}

.user-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  position: relative;
  transition: all 0.3s ease;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.user-avatar:hover {
  transform: scale(1.05);
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.4);
}

.user-initial {
  font-size: 2.5rem;
  font-weight: 600;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.add-avatar {
  background: rgba(0, 200, 81, 0.1) !important;
  border: 3px dashed rgba(0, 200, 81, 0.3);
}

.add-icon {
  font-size: 3rem;
  color: rgba(0, 200, 81, 0.7);
  font-weight: 300;
}

.user-name {
  font-size: 1.2rem;
  font-weight: 500;
  color: #666;
  margin: 0;
}

.edit-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.user-card.edit-mode .edit-overlay {
  opacity: 1;
}

.edit-icon {
  font-size: 1.5rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .selection-container {
    padding: 1rem;
  }
  
  .header {
    top: 1rem;
    left: 1rem;
    right: 1rem;
    max-width: calc(1400px - 2rem);
  }
  
  .title {
    font-size: 2rem;
    margin-bottom: 2rem;
    margin-top: 4rem;
  }
  
  .users-grid {
    gap: 1.5rem;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  }
  
  .user-avatar {
    width: 100px;
    height: 100px;
  }
  
  .user-initial {
    font-size: 2rem;
  }
  
  .add-icon {
    font-size: 2.5rem;
  }
}

@media (max-width: 480px) {
  .selection-container {
    padding: 0.5rem;
  }
  
  .header {
    top: 1rem;
    left: 0.5rem;
    right: 0.5rem;
    max-width: calc(1400px - 1rem);
  }
  
  .logo {
    height: 32px;
  }
  
  .edit-btn {
    padding: 0.4rem 1rem;
    font-size: 0.8rem;
  }
  
  .title {
    font-size: 1.5rem;
    margin-top: 3rem;
    margin-bottom: 2rem;
  }
  
  .users-grid {
    gap: 1rem;
    grid-template-columns: repeat(2, 1fr);
    max-width: 320px;
  }
  
  .user-avatar {
    width: 80px;
    height: 80px;
  }
  
  .user-initial {
    font-size: 1.5rem;
  }
  
  .user-name {
    font-size: 0.9rem;
  }
  
  .add-icon {
    font-size: 2rem;
  }
}

@media (max-width: 320px) {
  .title {
    font-size: 1.2rem;
  }
  
  .users-grid {
    max-width: 280px;
    grid-template-columns: repeat(2, 1fr);
  }
  
  .user-avatar {
    width: 70px;
    height: 70px;
  }
  
  .user-initial {
    font-size: 1.2rem;
  }
  
  .user-name {
    font-size: 0.8rem;
  }
}
</style>