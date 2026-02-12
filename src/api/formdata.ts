import { hasBackend, getBaseUrl, apiRequest } from './client'
import type { ApplicationPayload } from './types'

export interface SubmitResult {
  ok: boolean
  message?: string
}

/**
 * Submit job application.
 * - With resume file: POST /api/formdata/apply (multipart) – backend stores file (multer) and creates application in one request.
 * - Without file: POST /api/formdata (JSON) – application only.
 */
export async function submitApplication(payload: ApplicationPayload): Promise<SubmitResult> {
  if (!hasBackend()) {
    return Promise.resolve({ ok: true })
  }

  const hasFile = payload.resume && payload.resume instanceof File

  if (hasFile && payload.resume) {
    const base = getBaseUrl()
    if (!base) return { ok: false, message: 'No API base URL configured' }
    const formData = new FormData()
    formData.append('companyId', payload.companyId)
    formData.append('roleId', payload.roleId)
    formData.append('fullName', payload.fullName)
    formData.append('email', payload.email)
    formData.append('phone', payload.phone)
    formData.append('address', payload.address)
    formData.append('educationStatus', payload.education.length ? payload.education.join(', ') : '')
    formData.append('role', payload.role)
    formData.append('workingDaysTime', payload.workingDaysTime)
    formData.append('motivation', payload.motivation)
    formData.append('workRemotely', String(payload.workRemotely))
    formData.append('resume', payload.resume, payload.resume.name || 'resume.pdf')

    const res = await fetch(`${base}/api/formdata/apply`, {
      method: 'POST',
      body: formData,
    })

    const contentType = res.headers.get('content-type')
    const isJson = contentType?.includes('application/json')
    const body = isJson ? await res.json() : await res.text()

    if (!res.ok) {
      const msg =
        isJson && typeof body === 'object' && body && 'error' in body
          ? (body as { error?: { message?: string } }).error?.message
          : typeof body === 'string'
            ? body
            : `HTTP ${res.status}`
      return { ok: false, message: msg || `Upload failed (${res.status})` }
    }
    return { ok: true }
  }

  const body = {
    companyId: payload.companyId,
    roleId: payload.roleId,
    applicantId: null as string | null,
    data: {
      fullName: payload.fullName,
      email: payload.email,
      phone: payload.phone,
      address: payload.address,
      educationStatus: payload.education.length ? payload.education.join(', ') : '',
      role: payload.role,
      workingDaysTime: payload.workingDaysTime,
      motivation: payload.motivation,
      attachmentUrl: '' as string,
      workRemotely: payload.workRemotely,
    },
  }
  await apiRequest<unknown>('/api/formdata', {
    method: 'POST',
    body: JSON.stringify(body),
  })
  return { ok: true }
}
