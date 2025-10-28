// Test utility to verify dashboard analytics API
import { fetchDashboardAnalytics } from '@/api/dashboardAnalytics'

export const testDashboardAnalytics = async (organizationId: string) => {
  try {

    const result = await fetchDashboardAnalytics(organizationId)

    
    // Verify structure
    if (result.months && result.weeks && result.year) {




      return true
    } else {

      return false
    }
  } catch (error) {

    return false
  }
}

// Export for console testing
if (typeof window !== 'undefined') {
  (window as any).testDashboardAnalytics = testDashboardAnalytics
}