import { hasBackend, apiRequest } from './client'
import type { GalleryData } from './types'

export async function getGallery(companyId?: string): Promise<GalleryData | null> {
  if (!hasBackend()) return null
  const query = companyId ? `?companyId=${encodeURIComponent(companyId)}` : ''
  try {
    return await apiRequest<GalleryData>(`/api/gallery${query}`)
  } catch {
    return null
  }
}
