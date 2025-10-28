import { fetchPointOfContactDashboard } from '@/api/pointOfContactDashboard'
import { fetchPointOfContactDashboardReschedule } from '@/api/pointOfContactDashboardReschedule'

export const testDashboardQueries = async (organizationId: string) => {

  
  const testFilters = {
    // Use last month as default
    order_date_from: '2024-01-01',
    order_date_to: '2024-01-31'
  }
  

  
  // Test 1: Dashboard Query
  try {
    await fetchPointOfContactDashboard(organizationId, testFilters)
  } catch (error) {
    console.error('Dashboard query failed:', error)
  }
  
  // Test 2: Reschedule Query
  try {
    await fetchPointOfContactDashboardReschedule(organizationId, testFilters)
  } catch (error) {
    console.error('Reschedule query failed:', error)
  }
  
  // Test 3: Both queries in parallel (like in dashboard)

  try {
    const [dashboardResult, rescheduleResult] = await Promise.allSettled([
      fetchPointOfContactDashboard(organizationId, testFilters),
      fetchPointOfContactDashboardReschedule(organizationId, testFilters)
    ])
    


    
    if (dashboardResult.status === 'fulfilled' && rescheduleResult.status === 'fulfilled') {

      
      // Simulate dashboard data processing
      console.log('Both queries successful:', {
        orders: dashboardResult.value?.order_count || 0,
        rescheduled: rescheduleResult.value?.rescheduled_count || 0
      })
      

    } else {
      console.error('One or both queries failed')
    }
  } catch (error) {
    console.error('Parallel query test failed:', error)
  }
  

}