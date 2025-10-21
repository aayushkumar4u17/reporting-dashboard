import { fetchPointOfContactDashboard } from '@/api/pointOfContactDashboard'
import { fetchPointOfContactDashboardReschedule } from '@/api/pointOfContactDashboardReschedule'
import { fetchPointOfContactReport } from '@/api/pointOfContact'
import { fetchDashboardAnalytics } from '@/api/dashboardAnalytics'

export const testAllQueries = async (organizationId: string) => {
  console.log('🧪 Testing all GraphQL queries with organization ID:', organizationId)
  
  const results = {
    pointOfContactDashboard: { success: false, error: null as any, data: null as any },
    pointOfContactDashboardReschedule: { success: false, error: null as any, data: null as any },
    pointOfContactPageQuery: { success: false, error: null as any, data: null as any },
    dashboardAnalytics: { success: false, error: null as any, data: null as any }
  }

  // Test 1: PointOfContactDashboard
  try {
    console.log('🔍 Testing PointOfContactDashboard...')
    const dashboardData = await fetchPointOfContactDashboard(organizationId, {})
    results.pointOfContactDashboard.success = true
    results.pointOfContactDashboard.data = dashboardData
    console.log('✅ PointOfContactDashboard: SUCCESS', dashboardData)
  } catch (error) {
    results.pointOfContactDashboard.error = error
    console.error('❌ PointOfContactDashboard: FAILED', error)
  }

  // Test 2: PointOfContactDashboardReschedule
  try {
    console.log('🔍 Testing PointOfContactDashboardReschedule...')
    const rescheduleData = await fetchPointOfContactDashboardReschedule(organizationId, {})
    results.pointOfContactDashboardReschedule.success = true
    results.pointOfContactDashboardReschedule.data = rescheduleData
    console.log('✅ PointOfContactDashboardReschedule: SUCCESS', rescheduleData)
  } catch (error) {
    results.pointOfContactDashboardReschedule.error = error
    console.error('❌ PointOfContactDashboardReschedule: FAILED', error)
  }

  // Test 3: PointOfContactPageQuery
  try {
    console.log('🔍 Testing PointOfContactPageQuery...')
    const pocData = await fetchPointOfContactReport({ organization_id: organizationId })
    results.pointOfContactPageQuery.success = true
    results.pointOfContactPageQuery.data = pocData
    console.log('✅ PointOfContactPageQuery: SUCCESS', pocData)
  } catch (error) {
    results.pointOfContactPageQuery.error = error
    console.error('❌ PointOfContactPageQuery: FAILED', error)
  }

  // Test 4: DashboardAnalytics
  try {
    console.log('🔍 Testing DashboardAnalytics...')
    const analyticsData = await fetchDashboardAnalytics(organizationId)
    results.dashboardAnalytics.success = true
    results.dashboardAnalytics.data = analyticsData
    console.log('✅ DashboardAnalytics: SUCCESS', analyticsData)
  } catch (error) {
    results.dashboardAnalytics.error = error
    console.error('❌ DashboardAnalytics: FAILED', error)
  }

  // Summary
  const successCount = Object.values(results).filter(r => r.success).length
  const totalCount = Object.keys(results).length
  
  console.log(`📊 Query Test Summary: ${successCount}/${totalCount} queries successful`)
  
  if (successCount === totalCount) {
    console.log('🎉 All queries are working!')
  } else {
    console.log('⚠️ Some queries are failing. Check the errors above.')
  }

  return results
}