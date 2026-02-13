import { apiRequest } from './client'
import { getCompanies } from './company'
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

/** MongoDB ObjectId is 24 hex chars. */
const OBJECT_ID_REGEX = /^[a-f0-9]{24}$/i

/** Resolve slug (e.g. "cbrilliance", "afresh") to company ObjectId. Tries destination first, then GET /api/company. */
export async function getCompanyObjectId(slugOrId: string): Promise<string | null> {
  if (OBJECT_ID_REGEX.test(slugOrId)) return slugOrId
  const slug = slugOrId.toLowerCase()
  const match = (c: { _id: string; name?: string; slug?: string }) =>
    c._id === slugOrId ||
    c.name?.toLowerCase() === slug ||
    c.name?.toLowerCase().replace(/\s/g, '') === slug ||
    c.slug?.toLowerCase() === slug ||
    (slug.length >= 3 && c.name?.toLowerCase().includes(slug))

  try {
    const dest = await getDestination()
    const fromDest = (dest.companies ?? []).find(match)
    if (fromDest) return fromDest._id
  } catch {
    // ignore
  }
  try {
    const list = await getCompanies()
    const fromList = list.find(match)
    return fromList?._id ?? null
  } catch {
    return null
  }
}
