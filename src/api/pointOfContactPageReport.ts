import client from './APIClient'
import { sanitizeLogData } from '../utils/paymentSecurity'

export interface PointOfContactPageData {
  address_line1?: string | null
  city_name?: string | null
  email?: string | null
  first_name?: string | null
  last_name?: string | null
  phone_number?: string | null
  state_name?: string | null
}

interface FilterParams {
  city?: string
  state?: string
}



export const fetchPointOfContactPageReport = async (organizationId: string, filters?: FilterParams): Promise<PointOfContactPageData[]> => {
  try {
    console.log('Fetching POC page report with params:', sanitizeLogData({ organizationId, filters }))
    
    const graphqlClient = await client()
    console.log('GraphQL client obtained for POC page report')
    
    const queryParams = {
      organization_id: organizationId,
      ...(filters?.city && { city: filters.city }),
      ...(filters?.state && { state: filters.state })
    }
    
    console.log('Executing PointOfContactPageQuery with params:', sanitizeLogData(queryParams))
    
    const response = await graphqlClient.PointOfContactPageQuery(queryParams)
    
    console.log('PointOfContactPageQuery response:', sanitizeLogData(response))
    
    return response.pointOfContactPageReport?.data || []
  } catch (error) {
    console.error('Error fetching point of contact page report:', sanitizeLogData({
      error: error instanceof Error ? error.message : String(error),
      organizationId,
      filters
    }))
    throw error
  }
}