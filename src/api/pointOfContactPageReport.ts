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
  const graphqlClient = await client()
  
  const response = await graphqlClient.PointOfContactPageQuery({
    organization_id: organizationId,
    city: filters?.city || '',
    state: filters?.state || ''
  })

  return response.pointOfContactPageReport?.data || []
}