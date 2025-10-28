import { fetchPointOfContactDashboard } from '@/api/pointOfContactDashboard'
import { fetchPointOfContactDashboardReschedule } from '@/api/pointOfContactDashboardReschedule'
import { fetchPointOfContactReport } from '@/api/pointOfContact'
import { fetchDashboardAnalytics } from '@/api/dashboardAnalytics'
import ErrorHandler from '@/utils/errorHandler'

interface QueryResult {
  success: boolean
  error: any
  data: any
  isolated: boolean
}

interface TestResults {
  pointOfContactDashboard: QueryResult
  pointOfContactDashboardReschedule: QueryResult
  pointOfContactPageQuery: QueryResult
  dashboardAnalytics: QueryResult
}

export const testAllQueries = async (organizationId: string): Promise<TestResults> => {
  const results: TestResults = {
    pointOfContactDashboard: { success: false, error: null, data: null, isolated: true },
    pointOfContactDashboardReschedule: { success: false, error: null, data: null, isolated: true },
    pointOfContactPageQuery: { success: false, error: null, data: null, isolated: true },
    dashboardAnalytics: { success: false, error: null, data: null, isolated: true }
  }

  // Test queries in parallel with proper error isolation
  const queryPromises = [
    // Test 1: PointOfContactDashboard
    ErrorHandler.createSafeAsyncWrapper(
      () => fetchPointOfContactDashboard(organizationId, {}),
      'testQueries-dashboard'
    )().then(data => {
      if (data !== undefined) {
        results.pointOfContactDashboard.success = true
        results.pointOfContactDashboard.data = data
      }
    }).catch(error => {
      results.pointOfContactDashboard.error = ErrorHandler.handleError(error, {
        component: 'testQueries-dashboard',
        action: 'fetchPointOfContactDashboard'
      })
    }),

    // Test 2: PointOfContactDashboardReschedule
    ErrorHandler.createSafeAsyncWrapper(
      () => fetchPointOfContactDashboardReschedule(organizationId, {}),
      'testQueries-reschedule'
    )().then(data => {
      if (data !== undefined) {
        results.pointOfContactDashboardReschedule.success = true
        results.pointOfContactDashboardReschedule.data = data
      }
    }).catch(error => {
      results.pointOfContactDashboardReschedule.error = ErrorHandler.handleError(error, {
        component: 'testQueries-reschedule',
        action: 'fetchPointOfContactDashboardReschedule'
      })
    }),

    // Test 3: PointOfContactPageQuery
    ErrorHandler.createSafeAsyncWrapper(
      () => fetchPointOfContactReport({ organization_id: organizationId }),
      'testQueries-poc'
    )().then(data => {
      if (data !== undefined) {
        results.pointOfContactPageQuery.success = true
        results.pointOfContactPageQuery.data = data
      }
    }).catch(error => {
      results.pointOfContactPageQuery.error = ErrorHandler.handleError(error, {
        component: 'testQueries-poc',
        action: 'fetchPointOfContactReport'
      })
    }),

    // Test 4: DashboardAnalytics
    ErrorHandler.createSafeAsyncWrapper(
      () => fetchDashboardAnalytics(organizationId),
      'testQueries-analytics'
    )().then(data => {
      if (data !== undefined) {
        results.dashboardAnalytics.success = true
        results.dashboardAnalytics.data = data
      }
    }).catch(error => {
      results.dashboardAnalytics.error = ErrorHandler.handleError(error, {
        component: 'testQueries-analytics',
        action: 'fetchDashboardAnalytics'
      })
    })
  ]

  // Wait for all queries to complete (with error isolation)
  await Promise.allSettled(queryPromises)

  // Summary with proper logging
  const successCount = Object.values(results).filter(r => r.success).length
  const totalCount = Object.keys(results).length
  
  console.log('Query Test Summary:', {
    successful: successCount,
    total: totalCount,
    successRate: `${Math.round((successCount / totalCount) * 100)}%`,
    timestamp: new Date().toISOString()
  })
  
  // Clear component errors after testing
  ErrorHandler.clearComponentErrors('testQueries-dashboard')
  ErrorHandler.clearComponentErrors('testQueries-reschedule')
  ErrorHandler.clearComponentErrors('testQueries-poc')
  ErrorHandler.clearComponentErrors('testQueries-analytics')

  return results
}