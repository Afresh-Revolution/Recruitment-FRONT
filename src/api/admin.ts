import { hasBackend, getBaseUrl, apiRequest } from './client'
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

/** Backend: POST /api/admin/login — Response { ok, data: { admin, token } } */
export async function adminLogin(email: string, password: string): Promise<AdminLoginResponse> {
  const data = await apiRequest<{ admin: AdminLoginResponse['admin']; token: string }>('/api/admin/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  if (data.token) {
    try {
      localStorage.setItem(ADMIN_TOKEN_KEY, data.token)
    } catch {
      // ignore
    }
  }
  return { admin: data.admin, token: data.token }
}

/** Query params for GET /api/admin/applications */
export interface GetAdminApplicationsParams {
  companyId?: string
  status?: string
  search?: string
}

/** Backend: GET /api/admin/applications — Response { ok, data: [...] } */
export async function getAdminApplications(params?: GetAdminApplicationsParams): Promise<AdminApplication[]> {
  const token = getStoredAdminToken()
  if (!token || !hasBackend()) return []
  const searchParams = new URLSearchParams()
  if (params?.companyId) searchParams.set('companyId', params.companyId)
  if (params?.status) searchParams.set('status', params.status)
  if (params?.search) searchParams.set('search', params.search)
  const query = searchParams.toString() ? `?${searchParams.toString()}` : ''
  try {
    const data = await apiRequest<AdminApplication[]>(`/api/admin/applications${query}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

/** Backend: GET /api/admin/applications/:id — Response { ok, data: { ...application } } or { ok, data: { application } } */
export async function getAdminApplication(applicationId: string): Promise<AdminApplication | null> {
  const token = getStoredAdminToken()
  if (!token || !hasBackend()) return null
  try {
    const raw = await apiRequest<AdminApplication | { application: AdminApplication }>(
      `/api/admin/applications/${applicationId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    if (raw && typeof raw === 'object' && 'application' in raw && raw.application)
      return raw.application as AdminApplication
    return raw as AdminApplication
  } catch {
    return null
  }
}

/** Backend: GET /api/admin/applications/summary — Response { ok, data: { total, pending, interviewing, hired } } */
export interface AdminApplicationsSummary {
  total: number
  pending: number
  interviewing: number
  hired: number
}

export async function getAdminApplicationsSummary(companyId?: string): Promise<AdminApplicationsSummary | null> {
  const token = getStoredAdminToken()
  if (!token || !hasBackend()) return null
  const query = companyId ? `?companyId=${encodeURIComponent(companyId)}` : ''
  try {
    return await apiRequest<AdminApplicationsSummary>(`/api/admin/applications/summary${query}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
  } catch {
    return null
  }
}

/** Backend: GET /api/admin/applications/export-csv — Returns CSV file; triggers download. */
export async function exportAdminApplicationsCsv(companyId?: string): Promise<{ ok: boolean; error?: string }> {
  const token = getStoredAdminToken()
  const base = getBaseUrl()
  if (!token || !base) return { ok: false, error: 'Not connected' }
  const url = companyId
    ? `${base}/api/admin/applications/export-csv?companyId=${encodeURIComponent(companyId)}`
    : `${base}/api/admin/applications/export-csv`
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) throw new Error(res.statusText || 'Export failed')
    const blob = await res.blob()
    const disposition = res.headers.get('Content-Disposition')
    const filename =
      disposition?.match(/filename="?([^";]+)"?/)?.[1]?.trim() || 'admin-dashboard-applications.csv'
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = filename
    a.click()
    URL.revokeObjectURL(a.href)
    return { ok: true }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Export failed' }
  }
}

/** Response from PATCH /api/admin/applications/:id/status when status is hired/approved/rejected */
export interface StatusUpdateResponse {
  application?: { _id: string; status: string; reviewedAt?: string; emailSent?: boolean; emailError?: string | null }
  emailSent?: boolean
  emailError?: string | null
}

/** Backend: PATCH /api/admin/applications/:id/status — Request { status, message? }. When status is hired/approved/rejected, backend sends applicant email; response includes emailSent, emailError. */
export async function updateApplicationStatus(
  applicationId: string,
  status: 'pending' | 'reviewed' | 'interviewing' | 'hired' | 'approved' | 'rejected',
  message?: string
): Promise<{ ok: boolean; error?: string; emailSent?: boolean; emailError?: string | null }> {
  const token = getStoredAdminToken()
  if (!token || !hasBackend()) return { ok: false, error: 'Not connected' }
  try {
    const data = await apiRequest<StatusUpdateResponse>(`/api/admin/applications/${applicationId}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status, ...(message && { message }) }),
    })
    const emailSent = data?.emailSent ?? data?.application?.emailSent
    const emailError = data?.emailError ?? data?.application?.emailError ?? null
    return {
      ok: true,
      emailSent,
      emailError,
    }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Request failed' }
  }
}
