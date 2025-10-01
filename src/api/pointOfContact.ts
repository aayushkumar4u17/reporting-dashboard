import client from './APIClient'

export interface POCFilters {
  organization_id: string
  state?: string
  city?: string
}

export interface POCContact {
  full_name: string
  email: string
  phone_number: string
  address: string
  city: string
  state: string
}

export interface POCResponse {
  summary: {
    total_count: number
    unique_contacts: number
    states_covered: string[]
    cities_covered: string[]
  }
  contacts: POCContact[]
}

interface RawContact {
  first_name?: string | null
  last_name?: string | null
  email?: string | null
  phone_number?: string | null
  address_line1?: string | null
  city_name?: string | null
  state_name?: string | null
}

export const fetchPointOfContactReport = async (filters: POCFilters): Promise<POCResponse> => {
  const graphqlClient = await client()
  
  const response = await graphqlClient.PointOfContactPageQuery({
    organization_id: filters.organization_id,
    city: filters.city || '',
    state: filters.state || ''
  })
  
  const rawContacts: RawContact[] = response.pointOfContactPageReport?.data || []
  
  // Process all contacts without removing duplicates
  const sortedContacts = sortContacts(rawContacts)
  const processedContacts = processContacts(sortedContacts)
  
  return {
    summary: {
      total_count: rawContacts.length,
      unique_contacts: processedContacts.length,
      states_covered: [...new Set(processedContacts.map(c => c.state))],
      cities_covered: [...new Set(processedContacts.map(c => c.city))]
    },
    contacts: processedContacts
  }
}

// Removed unused function
/*
const removeDuplicates = (contacts: RawContact[]): RawContact[] => {
  const seen = new Set<string>()
  return contacts.filter(contact => {
    const key = `${contact.email || ''}-${contact.phone_number || ''}-${contact.first_name || ''}-${contact.last_name || ''}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}
*/

const sortContacts = (contacts: RawContact[]): RawContact[] => {
  return contacts.sort((a, b) => {
    if (a.state_name !== b.state_name) return (a.state_name || '').localeCompare(b.state_name || '')
    if (a.city_name !== b.city_name) return (a.city_name || '').localeCompare(b.city_name || '')
    return (a.first_name || '').localeCompare(b.first_name || '')
  })
}

const processContacts = (contacts: RawContact[]): POCContact[] => {
  return contacts.map(contact => ({
    full_name: `${contact.first_name || '—'} ${contact.last_name || '—'}`.trim(),
    email: contact.email || '—',
    phone_number: contact.phone_number || '—',
    address: contact.address_line1 || '—',
    city: contact.city_name || '—',
    state: contact.state_name || '—'
  }))
}