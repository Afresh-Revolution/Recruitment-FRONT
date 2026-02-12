import { hasBackend } from './client'
import { getPartnersFromDestination } from './destination'
import { MOCK_PARTNERS } from './mockData'
import type { PartnerCompany } from './types'

export async function getPartners(): Promise<PartnerCompany[]> {
  if (!hasBackend()) {
    return MOCK_PARTNERS
  }
  try {
    const list = await getPartnersFromDestination()
    if (list.length === 0) return MOCK_PARTNERS
    return list
  } catch {
    return MOCK_PARTNERS
  }
}
