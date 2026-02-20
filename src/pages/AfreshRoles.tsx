import { useState, useMemo, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Briefcase, MapPin, Clock } from 'lucide-react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import JobDetailModal from '../components/JobDetailModal'
import ApplyJobModal from '../components/ApplyJobModal'
import ApplicationDetailModal, { ApplicationDetail } from '../components/ApplicationDetailModal'
import { hasBackend } from '../api/client'
import { getRoles, AFRESH_COMPANY_OBJECT_ID } from '../api/roles'
import { getCompanyObjectId } from '../api/destination'
import { MOCK_AFRESH_ROLES } from '../api/mockData'
import type { RoleDetail } from '../api/types'

const DEFAULT_COMPANY_ID = 'afresh'
const OBJECT_ID_REGEX = /^[a-f0-9]{24}$/i
const APPLIED_STORAGE_KEY = 'recruitment_applied_role_ids'
const APPLICATIONS_STORAGE_KEY = 'recruitment_applications'

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

const AfreshRoles = () => {
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
  const [viewingApplication, setViewingApplication] = useState<ApplicationDetail | null>(null)

  // When backend is used, resolve company first then fetch roles by ObjectId so role ids are valid for apply.
  // If company doesn't resolve (e.g. "afresh" not in destination), try getRoles(slug) in case backend accepts it.
  useEffect(() => {
    let cancelled = false
    setError(null)
    if (hasBackend()) {
      setLoading(true)
      getCompanyObjectId(companyId)
        .then((id) => {
          if (cancelled) return
          setResolvedCompanyId(id)
          if (id) return getRoles(id)
          // Fallback: try fetching by slug in case backend accepts companyId=afresh
          return getRoles(companyId)
        })
        .then((data) => {
          if (cancelled) return
          const list = data ?? []
          if (list.length > 0) {
            setRoles(list)
          } else if (companyId.toLowerCase() === 'afresh') {
            setRoles(MOCK_AFRESH_ROLES)
          } else {
            setRoles([])
          }
        })
        .catch((err) => {
          if (!cancelled) {
            if (companyId.toLowerCase() === 'afresh') {
              setRoles(MOCK_AFRESH_ROLES)
              setError(null)
            } else {
              setError(err instanceof Error ? err.message : 'Failed to load roles')
            }
          }
        })
        .finally(() => {
          if (!cancelled) setLoading(false)
        })
    } else {
      setLoading(true)
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
    }
    return () => { cancelled = true }
  }, [companyId])

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

  const companyIdForApply = resolvedCompanyId ?? (OBJECT_ID_REGEX.test(companyId) ? companyId : (companyId.toLowerCase() === 'afresh' ? AFRESH_COMPANY_OBJECT_ID : null))

  const openApplyModal = (role: RoleDetail) => {
    if (appliedRoleIds.has(role.id)) return
    setApplyModalRole(role)
  }

  const isApplied = (roleId: string) => appliedRoleIds.has(roleId)

  // Helper to get application from local storage
  const getApplication = (roleId: string): ApplicationDetail | null => {
    try {
      const raw = localStorage.getItem(APPLICATIONS_STORAGE_KEY)
      if (!raw) return null
      const apps = JSON.parse(raw)
      return apps[roleId] || null
    } catch {
      return null
    }
  }

  return (
    <div className="roles-page">
      <Header />
      {selectedRole && (
        <JobDetailModal
          role={selectedRole}
          application={getApplication(selectedRole.id)}
          onClose={() => setSelectedRole(null)}
          onNext={(role) => {
            setSelectedRole(null)
            openApplyModal(role)
          }}
          // applied={isApplied(selectedRole.id)} - redundant if passing application, but keeping for safety if application is null but ID is in set
          applied={isApplied(selectedRole.id)}
          onViewApplication={(app) => {
            setSelectedRole(null)
            setViewingApplication(app)
          }}
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
          onSuccess={(roleId, formData) => {
            addAppliedRoleId(applyModalRole.id)
            setAppliedRoleIds(getAppliedRoleIds())

            // Store full application details
            if (formData) {
              try {
                const rawApps = localStorage.getItem(APPLICATIONS_STORAGE_KEY)
                const apps = rawApps ? JSON.parse(rawApps) : {}
                apps[roleId] = {
                  id: Math.random().toString(36).substring(7),
                  status: 'Pending',
                  dateApplied: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                  company: 'Afresh',
                  role: formData.role,
                  ...formData
                }
                localStorage.setItem(APPLICATIONS_STORAGE_KEY, JSON.stringify(apps))
              } catch {
                // ignore
              }
            }
          }}
          submissionDisabled={!OBJECT_ID_REGEX.test(applyModalRole.id) ? 'You’re viewing sample roles. Connect your API and load roles from the server to submit an application.' : undefined}
        />
      )}
      {viewingApplication && (
        <ApplicationDetailModal
          application={viewingApplication}
          onClose={() => setViewingApplication(null)}
          readonly={true}
        />
      )}
      <main id="main" className="roles-main" tabIndex={-1}>
        <Link to="/browse-jobs" className="roles-back-link">
          ← Back to Companies
        </Link>
        <h1 className="roles-title">AfrESH Roles</h1>
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
                  {getApplication(role.id) ? (
                    <button
                      type="button"
                      className="roles-apply-btn roles-apply-btn--view"
                      onClick={(e) => {
                        e.stopPropagation()
                        const app = getApplication(role.id)
                        if (app) setViewingApplication(app)
                      }}
                    >
                      View Application
                    </button>
                  ) : isApplied(role.id) ? (
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

export default AfreshRoles
