import { hasBackend, apiRequest } from './client'

/** Company from GET /api/company (minimal for lookup) */
export interface CompanyItem {
  _id: string
  name: string
  slug?: string
}

/** GET /api/company — list active companies. Used as fallback when destination has no companies. */
export async function getCompanies(): Promise<CompanyItem[]> {
  if (!hasBackend()) return []
  try {
    const data = await apiRequest<CompanyItem[] | { companies?: CompanyItem[] }>('/api/company')
    if (Array.isArray(data)) return data
    return (data as { companies?: CompanyItem[] }).companies ?? []
  } catch {
    return []
  }
}
