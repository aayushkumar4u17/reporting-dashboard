import { fetchPointOfContactDashboard } from '@/api/pointOfContactDashboard'
import { fetchPointOfContactDashboardReschedule } from '@/api/pointOfContactDashboardReschedule'

export const testDashboardQueries = async (organizationId: string) => {
  console.log('🔍 Testing Dashboard Queries for org:', organizationId)
  
  const testFilters = {
    // Use last month as default
    order_date_from: '2024-01-01',
    order_date_to: '2024-01-31'
  }
  
  console.log('📅 Using test filters:', testFilters)
  
  // Test 1: Dashboard Query
  console.log('\n1️⃣ Testing PointOfContactDashboard...')
  try {
    const dashboardData = await fetchPointOfContactDashboard(organizationId, testFilters)
    console.log('✅ Dashboard Query SUCCESS:', dashboardData)
  } catch (error) {
    console.error('❌ Dashboard Query FAILED:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    })
  }
  
  // Test 2: Reschedule Query
  console.log('\n2️⃣ Testing PointOfContactDashboardReschedule...')
  try {
    const rescheduleData = await fetchPointOfContactDashboardReschedule(organizationId, testFilters)
    console.log('✅ Reschedule Query SUCCESS:', rescheduleData)
  } catch (error) {
    console.error('❌ Reschedule Query FAILED:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    })
  }
  
  // Test 3: Both queries in parallel (like in dashboard)
  console.log('\n3️⃣ Testing Both Queries in Parallel...')
  try {
    const [dashboardResult, rescheduleResult] = await Promise.allSettled([
      fetchPointOfContactDashboard(organizationId, testFilters),
      fetchPointOfContactDashboardReschedule(organizationId, testFilters)
    ])
    
    console.log('Dashboard Result:', dashboardResult)
    console.log('Reschedule Result:', rescheduleResult)
    
    if (dashboardResult.status === 'fulfilled' && rescheduleResult.status === 'fulfilled') {
      console.log('✅ Both queries succeeded in parallel!')
      
      // Simulate dashboard data processing
      const combinedData = {
        totalOrdersPlaced: {
          count: dashboardResult.value?.order_count || 0,
          quantity: dashboardResult.value?.ordered_qty ? Number(dashboardResult.value.ordered_qty) : 0
        },
        totalOrdersRescheduled: {
          count: rescheduleResult.value?.rescheduled_count || 0,
          quantity: rescheduleResult.value?.rescheduled_qty ? Number(rescheduleResult.value.rescheduled_qty) : 0
        }
      }
      
      console.log('📊 Combined Dashboard Data:', combinedData)
    } else {
      console.warn('⚠️ One or both queries failed in parallel execution')
    }
  } catch (error) {
    console.error('❌ Parallel execution failed:', error)
  }
  
  console.log('\n🏁 Dashboard Query Test Complete')
}