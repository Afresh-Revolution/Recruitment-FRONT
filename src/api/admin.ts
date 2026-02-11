import { hasBackend, apiRequest } from './client'
import type { AdminLoginResponse, AdminApplication } from './types'

const ADMIN_TOKEN_KEY = 'cage_admin_token'

export function getStoredAdminToken(): string | null {
  try {
    return localStorage.getItem(ADMIN_TOKEN_KEY)
  } catch {
    return null
  }
}

export function clearAdminToken(): void {
  try {
    localStorage.removeItem(ADMIN_TOKEN_KEY)
  } catch {
    // ignore
  }
}

export async function adminLogin(email: string, password: string): Promise<AdminLoginResponse> {
  const body = await apiRequest<{ admin: AdminLoginResponse['admin']; token: string }>('/api/admin/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  const token = (body as { token?: string }).token
  if (token) {
    try {
      localStorage.setItem(ADMIN_TOKEN_KEY, token)
    } catch {
      // ignore
    }
  }
  return body as AdminLoginResponse
}

export async function getAdminApplications(companyId?: string): Promise<AdminApplication[]> {
  const token = getStoredAdminToken()
  if (!token || !hasBackend()) return []
  const query = companyId ? `?companyId=${encodeURIComponent(companyId)}` : ''
  try {
    const data = await apiRequest<AdminApplication[]>(`/api/admin/applications${query}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

export async function updateApplicationStatus(
  applicationId: string,
  status: 'approved' | 'rejected',
  message?: string
): Promise<{ ok: boolean; error?: string }> {
  const token = getStoredAdminToken()
  if (!token || !hasBackend()) return { ok: false, error: 'Not connected' }
  try {
    await apiRequest<unknown>(`/api/admin/applications/${applicationId}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status, ...(message && { message }) }),
    })
    return { ok: true }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Request failed' }
  }
}
