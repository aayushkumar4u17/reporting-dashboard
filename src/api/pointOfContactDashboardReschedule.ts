import client from './APIClient'
import type { FilterPayload } from '@/composables/useFilters'

export interface PointOfContactRescheduleData {
  rescheduled_count?: number | null
  rescheduled_qty?: number | null
}

export const fetchPointOfContactDashboardReschedule = async (organizationId: string, filters?: Partial<FilterPayload>): Promise<PointOfContactRescheduleData | null> => {
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
    
    // Execute the pointOfContactDashboardReschedule query
    const response = await graphqlClient.PointOfContactDashboardReschedule(queryParams)
    
    const rescheduleData = response.pointOfContactDashboardReschedule?.data?.[0]

    const result = {
      rescheduled_count: rescheduleData?.rescheduled_count || 0,
      rescheduled_qty: rescheduleData?.rescheduled_qty || 0
    }
    
    return result
  } catch (error) {
    throw error
  }
}