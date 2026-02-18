import { useState, useMemo, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Briefcase, MapPin, Clock } from 'lucide-react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import JobDetailModal from '../components/JobDetailModal'
import ApplyJobModal from '../components/ApplyJobModal'
import { getRoles } from '../api/roles'
import { getCompanyObjectId } from '../api/destination'
import type { RoleDetail } from '../api/types'

const DEFAULT_COMPANY_ID = 'cbrilliance'
const OBJECT_ID_REGEX = /^[a-f0-9]{24}$/i
const APPLIED_STORAGE_KEY = 'recruitment_applied_role_ids'

function getAppliedRoleIds(): Set<string> {
  try {
    const raw = sessionStorage.getItem(APPLIED_STORAGE_KEY)
    const arr = raw ? (JSON.parse(raw) as string[]) : []
    return new Set(Array.isArray(arr) ? arr : [])
  } catch {
    return new Set()
  }
}

function addAppliedRoleId(roleId: string) {
  const set = getAppliedRoleIds()
  set.add(roleId)
  sessionStorage.setItem(APPLIED_STORAGE_KEY, JSON.stringify([...set]))
}

const CbrillianceRoles = () => {
  const location = useLocation()
  const companyId = (location.state as { companyId?: string } | null)?.companyId ?? DEFAULT_COMPANY_ID
  const [resolvedCompanyId, setResolvedCompanyId] = useState<string | null>(null)
  const [roles, setRoles] = useState<RoleDetail[]>([])
  const [appliedRoleIds, setAppliedRoleIds] = useState<Set<string>>(getAppliedRoleIds)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRole, setSelectedRole] = useState<RoleDetail | null>(null)
  const [applyModalRole, setApplyModalRole] = useState<RoleDetail | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    getRoles(companyId)
      .then((data) => {
        if (!cancelled) setRoles(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load roles')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [companyId])

  useEffect(() => {
    let cancelled = false
    getCompanyObjectId(companyId).then((id) => {
      if (!cancelled && id) setResolvedCompanyId(id)
    })
    return () => { cancelled = true }
  }, [companyId])

  useEffect(() => {
    if (!resolvedCompanyId) return
    let cancelled = false
    getRoles(resolvedCompanyId)
      .then((data) => {
        if (!cancelled) setRoles(data)
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [resolvedCompanyId])

  const filters = useMemo(() => {
    const departments = Array.from(new Set(roles.map((r) => r.department))).sort()
    return ['All', ...departments]
  }, [roles])

  const filteredRoles = useMemo(() => {
    let list = activeFilter === 'All' ? roles : roles.filter((role) => role.department === activeFilter)
    const q = searchQuery.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (role) =>
          role.title.toLowerCase().includes(q) ||
          (role.department ?? '').toLowerCase().includes(q)
      )
    }
    return list
  }, [roles, activeFilter, searchQuery])

  const companyIdForApply = resolvedCompanyId ?? (OBJECT_ID_REGEX.test(companyId) ? companyId : null)

  const openApplyModal = (role: RoleDetail) => {
    if (appliedRoleIds.has(role.id)) return
    setApplyModalRole(role)
  }

  const isApplied = (roleId: string) => appliedRoleIds.has(roleId)

  return (
    <div className="roles-page">
      <Header />
      {selectedRole && (
        <JobDetailModal
          role={selectedRole}
          onClose={() => setSelectedRole(null)}
          onNext={(role) => {
            setSelectedRole(null)
            openApplyModal(role)
          }}
          applied={isApplied(selectedRole.id)}
        />
      )}
      {applyModalRole && (
        <ApplyJobModal
          companyId={companyIdForApply ?? companyId}
          roleId={applyModalRole.id}
          jobTitle={applyModalRole.title}
          onClose={() => {
            setApplyModalRole(null)
            setSelectedRole(null)
          }}
          onSuccess={() => {
            addAppliedRoleId(applyModalRole.id)
            setAppliedRoleIds(getAppliedRoleIds())
          }}
        />
      )}
      <main id="main" className="roles-main" tabIndex={-1}>
        <Link to="/browse-jobs" className="roles-back-link">
          ← Back to Companies
        </Link>
        <h1 className="roles-title">Cbrilliance Roles</h1>
        <p className="roles-subtitle">Find your next challenge and apply today.</p>

        {error && (
          <div className="roles-error-wrap" role="alert">
            <p className="roles-error">{error}</p>
            <button type="button" className="roles-retry-btn" onClick={() => window.location.reload()}>
              Try again
            </button>
          </div>
        )}

        {loading ? (
          <p className="roles-loading">Loading…</p>
        ) : filteredRoles.length === 0 ? (
          <p className="roles-empty">
            {searchQuery.trim() ? 'No roles match your search or filters.' : 'No roles match your filters.'}
          </p>
        ) : (
          <>
            <div className="roles-search-row">
              <input
                type="search"
                className="roles-search"
                placeholder="Search for roles..."
                aria-label="Search for roles"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="roles-filters">
                {filters.map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    className={`roles-filter-btn ${activeFilter === filter ? 'roles-filter-btn--active' : ''}`}
                    onClick={() => setActiveFilter(filter)}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            <ul className="roles-list">
              {filteredRoles.map((role) => (
                <li
                  key={role.id}
                  className="roles-card"
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedRole(role)}
                  onKeyDown={(e) => e.key === 'Enter' && setSelectedRole(role)}
                >
                  <div className="roles-card-left">
                    <div className="roles-card-title-row">
                      <h2 className="roles-card-title">{role.title}</h2>
                      <span className="roles-card-department">{role.department}</span>
                    </div>
                    <div className="roles-card-meta">
                      <span className="roles-card-meta-item">
                        <Briefcase size={14} aria-hidden />
                        {role.jobType}
                      </span>
                      <span className="roles-card-meta-item">
                        <MapPin size={14} aria-hidden />
                        {role.location}
                      </span>
                      <span className="roles-card-meta-item roles-card-deadline">
                        <Clock size={14} aria-hidden />
                        {role.deadline?.startsWith('Apply by') ? role.deadline : role.deadline ? `Apply by ${role.deadline}` : ''}
                      </span>
                    </div>
                  </div>
                  {isApplied(role.id) ? (
                    <span className="roles-apply-btn roles-apply-btn--applied" aria-label="Already applied">
                      Applied
                    </span>
                  ) : (
                    <button
                      type="button"
                      className="roles-apply-btn"
                      onClick={(e) => {
                        e.stopPropagation()
                        openApplyModal(role)
                      }}
                    >
                      Apply Now
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}
      </main>
      <Footer />
    </div>
  )
}

export default CbrillianceRoles
