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

function mapBackendRoleToDetail(r: BackendRole, sectionLogo?: string | null, sectionName?: string | null): RoleDetail {
  // Backend now provides companyName/companyLogo flat on the role object.
  // Fall back to populated companyId object or section-level values for older responses.
  const companyObj = typeof r.companyId === 'object' ? r.companyId : null
  const MONTH_MAP: Record<string, string> = {
    Jan: 'January', Feb: 'February', Mar: 'March', Apr: 'April',
    May: 'May', Jun: 'June', Jul: 'July', Aug: 'August',
    Sep: 'September', Oct: 'October', Nov: 'November', Dec: 'December',
  }
  const expandMonths = (s: string) => s.replace(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/g, (m) => MONTH_MAP[m] ?? m)
  const rawLabel = r.applyByLabel
    ? `Apply before ${expandMonths(r.applyByLabel.replace(/^Apply by\s+/i, ''))}`
    : undefined
  const deadline = rawLabel ?? (r.deadline ? `Apply before ${expandMonths(new Date(r.deadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric' }))}` : '')
  return {
    id: r._id,
    title: r.title,
    department: r.department,
    jobType: r.type,
    location: r.location,
    deadline,
    isActive: r.isActive,
    // Prefer flat fields (new backend), fall back to nested or section-level
    companyName: r.companyName ?? sectionName ?? companyObj?.name ?? undefined,
    companyLogo: r.companyLogo ?? sectionLogo ?? companyObj?.logo ?? undefined,
    applicationDeadline: rawLabel,
    description: r.description,
    requirements: r.requirements,
    qualifications: r.qualifications,
    image: r.image ?? undefined,
  }
}

export async function getRoles(companyId: string): Promise<RoleDetail[]> {
  if (!hasBackend()) {
    return MOCK_BY_PARTNER[companyId] ?? []
  }
  const queryId = companyId.toLowerCase() === 'afresh' ? AFRESH_COMPANY_OBJECT_ID : companyId
  try {
    const data = await apiRequest<RoleSectionResponse>(`/api/role?companyId=${encodeURIComponent(queryId)}`)
    return (data.roles ?? []).map(r => mapBackendRoleToDetail(r, data.companyLogo, data.companyName))
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

/**
 * Enrich a RoleDetail with description/requirements/qualifications from the admin endpoint.
 * The public /api/role listing omits these fields; the admin endpoint returns them.
 * Falls back to the original role if the call fails or no token is available.
 */
export async function getRoleDetail(role: RoleDetail): Promise<RoleDetail> {
  if (!hasBackend()) return role
  try {
    const { getStoredAdminToken } = await import('./admin')
    const token = getStoredAdminToken()
    if (!token) return role
    const list = await apiRequest<BackendAdminRole[]>('/api/admin/job-roles', {
      headers: { Authorization: `Bearer ${token}` },
    })
    const found = Array.isArray(list) ? list.find((r) => r._id === role.id) : null
    if (!found) return role
    return {
      ...role,
      description: found.description ?? role.description,
      requirements: found.requirements ?? role.requirements,
      qualifications: found.qualifications ?? role.qualifications,
      // Forward the image URL from the admin endpoint
      image: found.image ?? role.image,
    }
  } catch {
    return role
  }
}

interface BackendAdminRole {
  _id: string
  description?: string
  requirements?: string[]
  qualifications?: string[]
  image?: string
}
