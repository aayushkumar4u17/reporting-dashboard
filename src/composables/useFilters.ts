import { ref, computed } from 'vue'

const getUTCToday = (): string => {
  return new Date().toISOString().split('T')[0]
}

const convertToYYYYMMDD = (dateStr: string): string => {
  if (!dateStr) return getUTCToday()
  
  // Handle DD/MM/YYYY format from DatePicker
  if (dateStr.includes('/')) {
    const [day, month, year] = dateStr.split('/')
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  }
  
  const date = new Date(dateStr)
  return date.toISOString().split('T')[0]
}

export interface FilterOptions {
  orderedDateFrom?: string
  orderedDateTo?: string
  deliveredDateFrom?: string
  deliveredDateTo?: string
  selectedCity?: string
  selectedPOC?: string
  selectedState?: string
  paymentDueDate?: string
}

export interface FilterPayload {
  org_user_id?: string[]
  order_date_from?: string
  order_date_to?: string
  delivery_date_from?: string
  delivery_date_to?: string
  cities?: string[]
  city?: string
  point_of_contact?: string
  state?: string
  payment_due_date?: string
}

export const useFilters = () => {
  const filters = ref<FilterOptions>({
    orderedDateFrom: '',
    orderedDateTo: '',
    deliveredDateFrom: '',
    deliveredDateTo: '',
    selectedCity: '',
    selectedPOC: '',
    selectedState: '',
    paymentDueDate: ''
  })

  const clearFilters = () => {
    filters.value = {
      orderedDateFrom: '',
      orderedDateTo: '',
      deliveredDateFrom: '',
      deliveredDateTo: '',
      selectedCity: '',
      selectedPOC: '',
      selectedState: '',
      paymentDueDate: ''
    }
  }

  const buildFilterPayload = (orgUserId?: string): FilterPayload => {
    const payload: FilterPayload = {}
    
    if (orgUserId) {
      payload.org_user_id = [orgUserId]
    }

    if (filters.value.orderedDateFrom) {
      payload.order_date_from = convertToYYYYMMDD(filters.value.orderedDateFrom)
    }
    if (filters.value.orderedDateTo) {
      payload.order_date_to = convertToYYYYMMDD(filters.value.orderedDateTo)
    }
    if (filters.value.deliveredDateFrom) {
      payload.delivery_date_from = convertToYYYYMMDD(filters.value.deliveredDateFrom)
    }
    if (filters.value.deliveredDateTo) {
      payload.delivery_date_to = convertToYYYYMMDD(filters.value.deliveredDateTo)
    }
    if (filters.value.selectedCity) {
      payload.cities = [filters.value.selectedCity]
      payload.city = filters.value.selectedCity
    }
    if (filters.value.selectedPOC) {
      payload.point_of_contact = filters.value.selectedPOC
    }
    if (filters.value.selectedState) {
      payload.state = filters.value.selectedState
    }
    if (filters.value.paymentDueDate) {
      payload.payment_due_date = filters.value.paymentDueDate
    }

    return payload
  }

  const hasActiveFilters = computed(() => {
    return Object.values(filters.value).some(value => value !== '')
  })

  return {
    filters,
    clearFilters,
    buildFilterPayload,
    hasActiveFilters
  }
}