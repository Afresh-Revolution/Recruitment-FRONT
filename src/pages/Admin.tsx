import { useState, useMemo, useEffect } from 'react'
import Header from '../components/Header'
import { Search, Filter, Download, Eye, LogOut, Check, X } from 'lucide-react'
import { hasBackend } from '../api/client'
import {
  getStoredAdminToken,
  clearAdminToken,
  adminLogin,
  getAdminApplications,
  updateApplicationStatus,
} from '../api/admin'
import type { AdminApplication } from '../api/types'

export type ApplicationStatus = 'Pending' | 'Reviewed' | 'Interviewing' | 'Accepted' | 'Rejected'

export interface Application {
  id: string
  applicantName: string
  email: string
  role: string
  company: string
  dateApplied: string
  status: ApplicationStatus
}

const MOCK_APPLICATIONS: Application[] = [
  { id: '1', applicantName: 'Sarah Jenkins', email: 'sarah.j@example.com', role: 'Senior Frontend Engineer', company: 'Cbrilliance', dateApplied: 'Oct 12', status: 'Interviewing' },
  { id: '2', applicantName: 'Marcus Chen', email: 'marcus.c@design.io', role: 'Product Designer', company: 'Cbrilliance', dateApplied: 'Oct 14', status: 'Reviewed' },
  { id: '3', applicantName: 'Priya Patel', email: 'priya.p@marketing.net', role: 'Head of Marketing', company: 'AfrESH', dateApplied: 'Oct 15', status: 'Pending' },
  { id: '4', applicantName: 'David Kim', email: 'd.kim@motion.art', role: '3D Motion Designer', company: 'AfrESH', dateApplied: 'Oct 10', status: 'Rejected' },
  { id: '5', applicantName: 'Elena Rodriguez', email: 'elena.r@pm.io', role: 'Product Manager', company: 'AfrESH', dateApplied: 'Oct 01', status: 'Accepted' },
]

const STATUS_OPTIONS: ApplicationStatus[] = ['Pending', 'Reviewed', 'Interviewing', 'Accepted', 'Rejected']

function mapStatus(s?: string): ApplicationStatus {
  if (!s) return 'Pending'
  const lower = s.toLowerCase()
  if (lower === 'approved') return 'Accepted'
  if (lower === 'rejected') return 'Rejected'
  if (lower === 'pending') return 'Pending'
  return (s as ApplicationStatus) || 'Pending'
}

function adminAppToApplication(a: AdminApplication): Application {
  const created = a.createdAt ? new Date(a.createdAt) : null
  return {
    id: a._id,
    applicantName: a.data?.fullName ?? '—',
    email: a.data?.email ?? '—',
    role: a.role?.title ?? a.data?.role ?? '—',
    company: a.company?.name ?? '—',
    dateApplied: created ? created.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—',
    status: mapStatus(a.status),
  }
}

const Admin = () => {
  const [token, setToken] = useState<string | null>(() => getStoredAdminToken())
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState<string | null>(null)
  const [loginLoading, setLoginLoading] = useState(false)
  const [applications, setApplications] = useState<Application[]>(MOCK_APPLICATIONS)
  const [applicationsLoading, setApplicationsLoading] = useState(false)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'All'>('All')
  const [page, setPage] = useState(1)

  const useBackend = hasBackend()

  useEffect(() => {
    if (!useBackend || !token) {
      setApplications(MOCK_APPLICATIONS)
      return
    }
    setApplicationsLoading(true)
    getAdminApplications()
      .then((list) => setApplications(list.map(adminAppToApplication)))
      .catch(() => setApplications(MOCK_APPLICATIONS))
      .finally(() => setApplicationsLoading(false))
  }, [useBackend, token])

  const filtered = useMemo(() => {
    return applications.filter((app) => {
      const matchSearch =
        app.applicantName.toLowerCase().includes(search.toLowerCase()) ||
        app.email.toLowerCase().includes(search.toLowerCase()) ||
        app.role.toLowerCase().includes(search.toLowerCase()) ||
        app.company.toLowerCase().includes(search.toLowerCase())
      const matchStatus = statusFilter === 'All' || app.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [applications, search, statusFilter])

  const pageSize = 5
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const start = (page - 1) * pageSize
  const paginated = filtered.slice(start, start + pageSize)

  const stats = useMemo(() => {
    const total = applications.length
    const pending = applications.filter((a) => a.status === 'Pending').length
    const interviewing = applications.filter((a) => a.status === 'Interviewing').length
    const hired = applications.filter((a) => a.status === 'Accepted').length
    return { total, pending, interviewing, hired }
  }, [applications])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError(null)
    setLoginLoading(true)
    try {
      await adminLogin(loginEmail.trim(), loginPassword)
      setToken(getStoredAdminToken())
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoginLoading(false)
    }
  }

  const handleLogout = () => {
    clearAdminToken()
    setToken(null)
  }

  const handleApproveReject = async (appId: string, status: 'approved' | 'rejected') => {
    if (!useBackend) return
    setUpdatingId(appId)
    try {
      const result = await updateApplicationStatus(appId, status)
      if (result.ok) {
        const list = await getAdminApplications()
        setApplications(list.map(adminAppToApplication))
      }
    } finally {
      setUpdatingId(null)
    }
  }

  const handleExportCsv = () => {
    const headers = ['Applicant', 'Email', 'Role', 'Company', 'Date Applied', 'Status']
    const rows = filtered.map((a) => [a.applicantName, a.email, a.role, a.company, a.dateApplied, a.status])
    const csv = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'applications.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  if (useBackend && !token) {
    return (
      <div className="admin-page">
        <Header />
        <main id="main" className="admin-main" tabIndex={-1}>
          <div className="admin-login-wrap">
            <h1 className="admin-title">Admin Login</h1>
            <p className="admin-subtitle">Sign in to manage applications.</p>
            <form className="admin-login-form" onSubmit={handleLogin}>
              <label htmlFor="admin-email">Email</label>
              <input
                id="admin-email"
                type="email"
                className="admin-login-input"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                autoComplete="email"
              />
              <label htmlFor="admin-password">Password</label>
              <input
                id="admin-password"
                type="password"
                className="admin-login-input"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              {loginError && <p className="admin-login-error" role="alert">{loginError}</p>}
              <button type="submit" className="admin-login-btn" disabled={loginLoading}>
                {loginLoading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="admin-page">
      <Header />
      <main id="main" className="admin-main" tabIndex={-1}>
        <div className="admin-header-row">
          <div>
            <h1 className="admin-title">Admin Dashboard</h1>
            <p className="admin-subtitle">Manage and review job applications.</p>
          </div>
          <div className="admin-header-actions">
            {useBackend && (
              <button type="button" className="admin-logout-btn" onClick={handleLogout} aria-label="Log out">
                <LogOut size={18} aria-hidden />
                Log out
              </button>
            )}
            <button type="button" className="admin-export-btn" onClick={handleExportCsv}>
              <Download size={18} aria-hidden />
              Export CSV
            </button>
          </div>
        </div>

        <div className="admin-cards">
          <div className="admin-card">
            <span className="admin-card-label">Total Applications</span>
            <span className="admin-card-value">{stats.total}</span>
          </div>
          <div className="admin-card admin-card--pending">
            <span className="admin-card-label">Pending Review</span>
            <span className="admin-card-value">{stats.pending}</span>
          </div>
          <div className="admin-card admin-card--interviewing">
            <span className="admin-card-label">Interviewing</span>
            <span className="admin-card-value">{stats.interviewing}</span>
          </div>
          <div className="admin-card admin-card--hired">
            <span className="admin-card-label">Hired</span>
            <span className="admin-card-value">{stats.hired}</span>
          </div>
        </div>

        <div className="admin-toolbar">
          <div className="admin-search-wrap">
            <Search className="admin-search-icon" size={20} aria-hidden />
            <input
              type="search"
              className="admin-search"
              placeholder="Search by applicant, role, or company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search applications"
            />
          </div>
          <div className="admin-filter-wrap">
            <Filter className="admin-filter-icon" size={18} aria-hidden />
            <select
              className="admin-filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ApplicationStatus | 'All')}
              aria-label="Filter by status"
            >
              <option value="All">All Status</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {applicationsLoading ? (
          <p className="admin-loading">Loading applications…</p>
        ) : filtered.length === 0 ? (
          <p className="admin-empty">No applications match your filters.</p>
        ) : (
          <>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Applicant</th>
                    <th>Role</th>
                    <th>Company</th>
                    <th>Date Applied</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((app) => (
                    <tr key={app.id}>
                      <td>
                        <div className="admin-applicant-cell">
                          <span className="admin-applicant-name">{app.applicantName}</span>
                          <span className="admin-applicant-email">{app.email}</span>
                        </div>
                      </td>
                      <td>{app.role}</td>
                      <td>{app.company}</td>
                      <td>{app.dateApplied}</td>
                      <td>
                        <span className={`admin-status-pill admin-status-pill--${app.status.toLowerCase()}`}>
                          {app.status}
                        </span>
                      </td>
                      <td>
                        <div className="admin-action-btns">
                          {useBackend && (app.status === 'Pending' || app.status === 'Reviewed' || app.status === 'Interviewing') && (
                            <>
                              <button
                                type="button"
                                className="admin-action-btn admin-action-btn--approve"
                                onClick={() => handleApproveReject(app.id, 'approved')}
                                disabled={updatingId === app.id}
                                aria-label={`Approve ${app.applicantName}`}
                              >
                                <Check size={18} aria-hidden />
                              </button>
                              <button
                                type="button"
                                className="admin-action-btn admin-action-btn--reject"
                                onClick={() => handleApproveReject(app.id, 'rejected')}
                                disabled={updatingId === app.id}
                                aria-label={`Reject ${app.applicantName}`}
                              >
                                <X size={18} aria-hidden />
                              </button>
                            </>
                          )}
                          <button type="button" className="admin-action-btn" aria-label={`View details for ${app.applicantName}`}>
                            <Eye size={18} aria-hidden />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="admin-pagination">
              <span className="admin-pagination-text">
                Showing {filtered.length === 0 ? 0 : start + 1} to {Math.min(start + pageSize, filtered.length)} of {filtered.length} entries
              </span>
              <div className="admin-pagination-controls">
                <button
                  type="button"
                  className="admin-pagination-btn"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  aria-label="Previous page"
                >
                  &lt;
                </button>
                <button
                  type="button"
                  className="admin-pagination-btn"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  aria-label="Next page"
                >
                  &gt;
                </button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

export default Admin
