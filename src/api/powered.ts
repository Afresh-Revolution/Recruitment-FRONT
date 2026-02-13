import { hasBackend, apiRequest } from './client'
import type { PoweredData } from './types'

export async function getPowered(companyId?: string): Promise<PoweredData | null> {
  if (!hasBackend()) return null
  const query = companyId ? `?companyId=${encodeURIComponent(companyId)}` : ''
  try {
    return await apiRequest<PoweredData>(`/api/powered${query}`)
  } catch {
    return null
  }
}
