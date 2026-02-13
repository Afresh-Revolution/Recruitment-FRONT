import { hasBackend, apiRequest } from './client'
import type { TraineeSectionData } from './types'

export async function getTrainee(companyId?: string): Promise<TraineeSectionData | null> {
  if (!hasBackend()) return null
  const query = companyId ? `?companyId=${encodeURIComponent(companyId)}` : ''
  try {
    return await apiRequest<TraineeSectionData>(`/api/trainee${query}`)
  } catch {
    return null
  }
}
