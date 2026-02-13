import { hasBackend, apiRequest } from './client'
import type { OpportunitiesData } from './types'

export async function getOpportunities(companyId?: string): Promise<OpportunitiesData | null> {
  if (!hasBackend()) return null
  const query = companyId ? `?companyId=${encodeURIComponent(companyId)}` : ''
  try {
    return await apiRequest<OpportunitiesData>(`/api/opportunities${query}`)
  } catch {
    return null
  }
}
