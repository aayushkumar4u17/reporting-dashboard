import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { PointOfContactData } from '@/api/pointOfContactDashboard'

// Helper function to get selected organization ID from localStorage
const getStoredUserId = (): string => {
  try {
    const selectedOrg = localStorage.getItem('selectedOrganization')
    if (selectedOrg) {
      const org = JSON.parse(selectedOrg)
      return org.id || ''
    }
  } catch (error) {
    console.error('Error parsing stored organization:', error)
  }
  return ''
}

export const usePointOfContactStore = defineStore('pointOfContact', () => {
  const selectedUserId = ref<string>(getStoredUserId())
  const dashboardData = ref<PointOfContactData | null>(null)
  const isLoading = ref(false)

  const setSelectedUserId = (userId: string) => {
    selectedUserId.value = userId
  }

  const setDashboardData = (data: PointOfContactData | null) => {
    dashboardData.value = data
  }

  const setLoading = (loading: boolean) => {
    isLoading.value = loading
  }

  const refreshFromStorage = () => {
    selectedUserId.value = getStoredUserId()
  }

  const clearData = () => {
    selectedUserId.value = ''
    dashboardData.value = null
    isLoading.value = false
  }

  return {
    selectedUserId,
    dashboardData,
    isLoading,
    setSelectedUserId,
    setDashboardData,
    setLoading,
    refreshFromStorage,
    clearData
  }
})