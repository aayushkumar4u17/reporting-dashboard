// Test utility to verify dashboard analytics API
import { fetchDashboardAnalytics } from '@/api/dashboardAnalytics'

export const testDashboardAnalytics = async (organizationId: string) => {
  try {
    console.log('Testing dashboard analytics API...')
    const result = await fetchDashboardAnalytics(organizationId)
    console.log('Dashboard analytics result:', result)
    
    // Verify structure
    if (result.months && result.weeks && result.year) {
      console.log('✅ Dashboard analytics API working correctly')
      console.log(`- Months data: ${result.months.length} items`)
      console.log(`- Weeks data: ${result.weeks.length} items`)
      console.log(`- Year data: ${result.year.length} items`)
      return true
    } else {
      console.log('❌ Dashboard analytics API returned invalid structure')
      return false
    }
  } catch (error) {
    console.log('❌ Dashboard analytics API failed:', error)
    return false
  }
}

// Export for console testing
if (typeof window !== 'undefined') {
  (window as any).testDashboardAnalytics = testDashboardAnalytics
}