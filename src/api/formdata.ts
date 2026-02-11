import { hasBackend, apiRequest } from './client'
import type { ApplicationPayload } from './types'

export interface SubmitResult {
  ok: boolean
  message?: string
}

/** POST /api/formdata – submit application. Backend expects companyId, roleId, applicantId, data. */
export async function submitApplication(payload: ApplicationPayload): Promise<SubmitResult> {
  if (!hasBackend()) {
    return Promise.resolve({ ok: true })
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
