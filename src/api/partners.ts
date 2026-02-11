import { hasBackend } from './client'
import { getPartnersFromDestination } from './destination'
import { MOCK_PARTNERS } from './mockData'
import type { PartnerCompany } from './types'

export async function getPartners(): Promise<PartnerCompany[]> {
  if (!hasBackend()) {
    return MOCK_PARTNERS
  }
  try {
    return await getPartnersFromDestination()
  } catch {
    return MOCK_PARTNERS
  }
}
