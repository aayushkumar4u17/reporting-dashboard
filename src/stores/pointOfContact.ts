import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { PointOfContactData } from '@/api/pointOfContactDashboard'

export const usePointOfContactStore = defineStore('pointOfContact', () => {
  const selectedUserId = ref<string>('')
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
    clearData
  }
})