import { useState, useMemo, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Briefcase, MapPin, Clock } from 'lucide-react'
import Header from '../components/Header'
import JobDetailModal from '../components/JobDetailModal'
import ApplyJobModal from '../components/ApplyJobModal'
import { getRoles } from '../api/roles'
import type { RoleDetail } from '../api/types'

const DEFAULT_COMPANY_ID = 'cbrilliance'

const CbrillianceRoles = () => {
  const location = useLocation()
  const companyId = (location.state as { companyId?: string } | null)?.companyId ?? DEFAULT_COMPANY_ID
  const [roles, setRoles] = useState<RoleDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<string>('All')
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

  const filters = useMemo(() => {
    const departments = Array.from(new Set(roles.map((r) => r.department))).sort()
    return ['All', ...departments]
  }, [roles])

  const filteredRoles = useMemo(() => {
    if (activeFilter === 'All') return roles
    return roles.filter((role) => role.department === activeFilter)
  }, [roles, activeFilter])

  return (
    <div className="roles-page">
      <Header />
      {selectedRole && (
        <JobDetailModal
          role={selectedRole}
          onClose={() => setSelectedRole(null)}
          onNext={(role) => {
            setSelectedRole(null)
            setApplyModalRole(role)
          }}
        />
      )}
      {applyModalRole && (
        <ApplyJobModal
          companyId={companyId}
          roleId={applyModalRole.id}
          jobTitle={applyModalRole.title}
          onClose={() => setApplyModalRole(null)}
        />
      )}
      <main id="main" className="roles-main" tabIndex={-1}>
        <Link to="/browse-jobs" className="roles-back-link">
          ← Back to Companies
        </Link>
        <h1 className="roles-title">Cbrilliance Roles</h1>
        <p className="roles-subtitle">Find your next challenge and apply today.</p>

        {error && <p className="roles-error" role="alert">{error}</p>}

        {loading ? (
          <p className="roles-loading">Loading…</p>
        ) : filteredRoles.length === 0 ? (
          <p className="roles-empty">No roles match your filters.</p>
        ) : (
          <>
            <div className="roles-search-row">
              <input
                type="search"
                className="roles-search"
                placeholder="Search for roles..."
                aria-label="Search for roles"
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
                        Apply by {role.deadline}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="roles-apply-btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedRole(role)
                    }}
                  >
                    Apply Now
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </main>
    </div>
  )
}

export default CbrillianceRoles
