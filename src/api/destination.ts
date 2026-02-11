import { apiRequest } from './client'
import type { PartnerCompany } from './types'
import type { DestinationCompany } from './types'

interface DestinationResponse {
  _id: string
  sectionTitle: string
  sectionDescription: string
  selectButtonText: string
  companies: DestinationCompany[]
}

export async function getDestination(companyId?: string): Promise<DestinationResponse> {
  const query = companyId ? `?companyId=${encodeURIComponent(companyId)}` : ''
  return apiRequest<DestinationResponse>(`/api/destination${query}`)
}

function mapCompanyToPartner(c: DestinationCompany): PartnerCompany {
  return {
    id: c._id,
    name: c.name,
    logo: c.logo,
    tagline: '',
    description: c.description,
    openRoles: c.openRolesCount,
    selectLink: c.selectLink,
  }
}

export async function getPartnersFromDestination(companyId?: string): Promise<PartnerCompany[]> {
  const data = await getDestination(companyId)
  return (data.companies ?? []).map(mapCompanyToPartner)
}
