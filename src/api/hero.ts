import { hasBackend, apiRequest } from './client'
import type { HeroData } from './types'

export async function getHero(companyId?: string): Promise<HeroData | null> {
  if (!hasBackend()) {
    return null
  }
  const query = companyId ? `?companyId=${encodeURIComponent(companyId)}` : ''
  try {
    return await apiRequest<HeroData>(`/api/hero${query}`)
  } catch {
    return null
  }
}
