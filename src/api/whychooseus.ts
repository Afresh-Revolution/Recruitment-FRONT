import { hasBackend, apiRequest } from './client'
import type { WhyChooseUsData } from './types'

export async function getWhyChooseUs(companyId?: string): Promise<WhyChooseUsData | null> {
  if (!hasBackend()) return null
  const query = companyId ? `?companyId=${encodeURIComponent(companyId)}` : ''
  try {
    return await apiRequest<WhyChooseUsData>(`/api/whychooseus${query}`)
  } catch {
    return null
  }
}
