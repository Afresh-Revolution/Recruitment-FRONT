import { hasBackend, apiRequest } from './client'
import { MOCK_AFRESH_ROLES, MOCK_CBRILLIANCE_ROLES } from './mockData'
import type { RoleDetail } from './types'
import type { BackendRole } from './types'

const MOCK_BY_PARTNER: Record<string, RoleDetail[]> = {
  afresh: MOCK_AFRESH_ROLES,
  cbrilliance: MOCK_CBRILLIANCE_ROLES,
}

/** Backend company ObjectId for Afresh (roles API and apply use this). Cbrilliance uses its own from destination. */
export const AFRESH_COMPANY_OBJECT_ID = '69808570b01ffe332df8e117'

interface RoleSectionResponse {
  companyName?: string
  companyLogo?: string
  sectionTagline?: string
  filterCategories?: string[]
  roles: BackendRole[]
}

function mapBackendRoleToDetail(r: BackendRole): RoleDetail {
  const deadline = r.applyByLabel ?? (r.deadline ? new Date(r.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '')
  return {
    id: r._id,
    title: r.title,
    department: r.department,
    jobType: r.type,
    location: r.location,
    deadline,
    applicationDeadline: r.applyByLabel,
    description: r.description,
    requirements: r.requirements,
    qualifications: r.qualifications,
  }
}

export async function getRoles(companyId: string): Promise<RoleDetail[]> {
  if (!hasBackend()) {
    return MOCK_BY_PARTNER[companyId] ?? []
  }
  const queryId = companyId.toLowerCase() === 'afresh' ? AFRESH_COMPANY_OBJECT_ID : companyId
  try {
    const data = await apiRequest<RoleSectionResponse>(`/api/role?companyId=${encodeURIComponent(queryId)}`)
    return (data.roles ?? []).map(mapBackendRoleToDetail)
  } catch {
    // When backend is configured, don't return mock roles (they have non-ObjectId ids and submit will fail)
    return []
  }
}

/** Optional: get section metadata (title, filter categories) for the roles page */
export async function getRolesSection(companyId: string): Promise<RoleSectionResponse> {
  if (!hasBackend()) {
    return { roles: [], filterCategories: ['All', 'Engineering', 'Design', 'Product', 'Marketing'] }
  }
  const queryId = companyId.toLowerCase() === 'afresh' ? AFRESH_COMPANY_OBJECT_ID : companyId
  return apiRequest<RoleSectionResponse>(`/api/role?companyId=${encodeURIComponent(queryId)}`)
}
