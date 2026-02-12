import { hasBackend, apiRequest } from './client'
import { MOCK_AFRESH_ROLES, MOCK_CBRILLIANCE_ROLES } from './mockData'
import type { RoleDetail } from './types'
import type { BackendRole } from './types'

const MOCK_BY_PARTNER: Record<string, RoleDetail[]> = {
  afresh: MOCK_AFRESH_ROLES,
  cbrilliance: MOCK_CBRILLIANCE_ROLES,
}

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
  try {
    const data = await apiRequest<RoleSectionResponse>(`/api/role?companyId=${encodeURIComponent(companyId)}`)
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
  return apiRequest<RoleSectionResponse>(`/api/role?companyId=${encodeURIComponent(companyId)}`)
}
