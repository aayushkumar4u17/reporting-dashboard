import client from './APIClient'

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

    
    const graphqlClient = await client()

    
    const queryParams = {
      organization_id: organizationId,
      ...(filters?.city && { city: filters.city }),
      ...(filters?.state && { state: filters.state })
    }
    

    
    const response = await graphqlClient.PointOfContactPageQuery(queryParams)
    

    
    return response.pointOfContactPageReport?.data || []
  } catch (error) {
    console.error('Error fetching point of contact page report:', {
      error: error instanceof Error ? error.message : String(error),
      organizationId,
      filters
    })
    throw error
  }
}