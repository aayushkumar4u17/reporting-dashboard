import { ref, computed } from 'vue'

export interface FilterOptions {
  orderedDate?: string
  deliveredDate?: string
  deliveryDate?: string
  selectedCity?: string
  selectedPOC?: string
  selectedState?: string
  paymentDueDate?: string
}

export interface FilterPayload {
  org_user_id: string[]
  ordered_date?: string
  delivered_date?: string
  delivery_date?: string
  city?: string
  poc?: string
  state?: string
  payment_due_date?: string
}

export const useFilters = () => {
  const filters = ref<FilterOptions>({
    orderedDate: '',
    deliveredDate: '',
    deliveryDate: '',
    selectedCity: '',
    selectedPOC: '',
    selectedState: '',
    paymentDueDate: ''
  })

  const clearFilters = () => {
    filters.value = {
      orderedDate: '',
      deliveredDate: '',
      deliveryDate: '',
      selectedCity: '',
      selectedPOC: '',
      selectedState: '',
      paymentDueDate: ''
    }
  }

  const buildFilterPayload = (orgUserId: string): FilterPayload => {
    const payload: FilterPayload = {
      org_user_id: [orgUserId]
    }

    if (filters.value.orderedDate) {
      payload.ordered_date = filters.value.orderedDate
    }
    if (filters.value.deliveredDate) {
      payload.delivered_date = filters.value.deliveredDate
    }
    if (filters.value.deliveryDate) {
      payload.delivery_date = filters.value.deliveryDate
    }
    if (filters.value.selectedCity) {
      payload.city = filters.value.selectedCity
    }
    if (filters.value.selectedPOC) {
      payload.poc = filters.value.selectedPOC
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