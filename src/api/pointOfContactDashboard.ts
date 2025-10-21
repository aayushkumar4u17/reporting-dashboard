import client from './APIClient'
import type { FilterPayload } from '@/composables/useFilters'

export interface PointOfContactData {
  cancelled_count?: number | null
  cancelled_qty?: number | null
  delivered_orders?: number | null
  delivered_qty?: number | null
  order_count?: number | null
  ordered_qty?: number | null
  planned_orders?: number | null
  planned_qty?: number | null
}

export const fetchPointOfContactDashboard = async (organizationId: string, filters?: Partial<FilterPayload>): Promise<PointOfContactData | null> => {
  try {
    const graphqlClient = await client()
    
    const queryParams: any = {
      org_id: organizationId
    }
    
    // Only add optional parameters if they have values
    const city = filters?.cities?.[0] || filters?.selectedCity
    if (city) queryParams.city = city
    
    const deliveryDateTo = filters?.delivery_date_to || filters?.deliveredDateTo
    if (deliveryDateTo) queryParams.delivery_date_to = deliveryDateTo
    
    const deliveryDateFrom = filters?.delivery_date_from || filters?.deliveredDateFrom
    if (deliveryDateFrom) queryParams.delivery_date_from = deliveryDateFrom
    
    const orderDateFrom = filters?.order_date_from || filters?.orderedDateFrom
    if (orderDateFrom) queryParams.order_date_from = orderDateFrom
    
    const orderDateTo = filters?.order_date_to || filters?.orderedDateTo
    if (orderDateTo) queryParams.order_date_to = orderDateTo
    
    const pointOfContact = filters?.point_of_contact || filters?.selectedPOC
    if (pointOfContact) queryParams.point_of_contact = pointOfContact
    
    // Execute the pointOfContactDashboard query
    const response = await graphqlClient.PointOfContactDashboard(queryParams)
    
    const dashboardData = response.pointOfContactDashboard?.data?.[0]

    const result = {
      cancelled_count: dashboardData?.cancelled_count || 0,
      cancelled_qty: dashboardData?.cancelled_qty || 0,
      delivered_orders: dashboardData?.delivered_orders || 0,
      delivered_qty: dashboardData?.delivered_qty || 0,
      order_count: dashboardData?.order_count || 0,
      ordered_qty: dashboardData?.ordered_qty || 0,
      planned_orders: dashboardData?.planned_orders || 0,
      planned_qty: dashboardData?.planned_qty || 0
    }
    
    return result
  } catch (error) {
    throw error
  }
}