import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import Header from '../components/Header'
import ApplicationDetailModal from '../components/ApplicationDetailModal'
import { Search, Filter, Download, Eye, LogOut, RefreshCw } from 'lucide-react'
import { hasBackend, getBaseUrl } from '../api/client'
import {
  getStoredAdminToken,
  clearAdminToken,
  adminLogin,
  getAdminApplications,
  getAdminApplication,
  getAdminApplicationsSummary,
  exportAdminApplicationsCsv,
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
  motivation?: string
  attachmentUrl?: string
  attachmentName?: string
  phone?: string
  address?: string
  educationStatus?: string
}

const MOCK_APPLICATIONS: Application[] = [
  { id: '1', applicantName: 'Sarah Jenkins', email: 'sarah.j@example.com', role: 'Senior Frontend Engineer', company: 'Cbrilliance', dateApplied: 'Oct 12', status: 'Interviewing', motivation: 'I have 5 years of experience with React and Tailwind CSS. I am excited about the opportunity to contribute to Cbrilliance\'s frontend architecture.', attachmentName: 'Resume.pdf' },
  { id: '2', applicantName: 'Marcus Chen', email: 'marcus.c@design.io', role: 'Product Designer', company: 'Cbrilliance', dateApplied: 'Oct 14', status: 'Reviewed' },
  { id: '3', applicantName: 'Priya Patel', email: 'priya.p@marketing.net', role: 'Head of Marketing', company: 'AfrESH', dateApplied: 'Oct 15', status: 'Pending' },
  { id: '4', applicantName: 'David Kim', email: 'd.kim@motion.art', role: '3D Motion Designer', company: 'AfrESH', dateApplied: 'Oct 10', status: 'Rejected' },
  { id: '5', applicantName: 'Elena Rodriguez', email: 'elena.r@pm.io', role: 'Product Manager', company: 'AfrESH', dateApplied: 'Oct 01', status: 'Accepted' },
]

const STATUS_OPTIONS: ApplicationStatus[] = ['Pending', 'Reviewed', 'Interviewing', 'Accepted', 'Rejected']

function mapStatus(s?: string): ApplicationStatus {
  if (!s) return 'Pending'
  const lower = s.toLowerCase()
  if (lower === 'approved' || lower === 'hired') return 'Accepted'
  if (lower === 'rejected') return 'Rejected'
  if (lower === 'pending') return 'Pending'
  return (s as ApplicationStatus) || 'Pending'
}

function getCompanyName(a: AdminApplication): string {
  if (a.company?.name) return a.company.name
  const cid = a.companyId
  if (typeof cid === 'object' && cid !== null && 'name' in cid && cid.name) return cid.name
  return '—'
}

function getRoleTitle(a: AdminApplication): string {
  if (a.role?.title) return a.role.title
  const rid = a.roleId
  if (typeof rid === 'object' && rid !== null && 'title' in rid && rid.title) return rid.title
  return a.data?.role ?? '—'
}

function toAbsoluteAttachmentUrl(url: string | undefined): string | undefined {
  if (!url || typeof url !== 'string') return undefined
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  const base = getBaseUrl()
  if (!base) return url
  return base + (url.startsWith('/') ? url : '/' + url)
}

/** Get resume/attachment URL from application (backend may use root resumeUrl, data.resumeUrl, data.attachmentUrl, or nested data) */
function getAttachmentUrl(a: AdminApplication): string | undefined {
  const tryStr = (v: unknown): string | undefined =>
    typeof v === 'string' && v.trim() !== '' ? v.trim() : undefined
  const root = tryStr(a.resumeUrl) ?? tryStr(a.attachmentUrl)
  if (root) return root
  const fromData =
    tryStr(a.data?.resumeUrl) ?? tryStr(a.data?.attachmentUrl) ?? tryStr(a.data?.attachment)
  if (fromData) return fromData
  const d = a.data as Record<string, unknown> | undefined
  const nested =
    d && typeof d === 'object' && d.data && typeof d.data === 'object' && d.data !== null
      ? (d.data as Record<string, unknown>)
      : null
  const fromNested = nested
    ? tryStr(nested.resumeUrl ?? nested.attachmentUrl ?? nested.attachment)
    : undefined
  if (fromNested) return fromNested
  const anyApp = a as unknown as Record<string, unknown>
  return tryStr(anyApp.resume) ?? tryStr(anyApp.fileUrl) ?? tryStr(anyApp.documentUrl)
}

/** Extract filename from resume URL for auth download (e.g. /uploads/1738123456790-xyz789.pdf → 1738123456790-xyz789.pdf) */
function getFilenameFromResumeUrl(url: string): string {
  if (!url || typeof url !== 'string') return 'resume.pdf'
  try {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      const pathname = new URL(url).pathname
      return pathname.split('/').filter(Boolean).pop() || 'resume.pdf'
    }
    return url.split('/').filter(Boolean).pop() || 'resume.pdf'
  } catch {
    return url.split('/').filter(Boolean).pop() || 'resume.pdf'
  }
}

/** Stored filenames (e.g. multer) often look like 1738123456790-abc123.pdf; avoid showing that as the document name. */
function getResumeDisplayName(backendName: string | undefined, url: string | undefined): string | undefined {
  if (backendName && backendName.trim() !== '') return backendName.trim()
  if (!url) return undefined
  const basename = url.split('/').filter(Boolean).pop() || ''
  if (!basename) return undefined
  const looksGenerated = /^\d{10,}[-_]/.test(basename) || /^[a-f0-9-]{20,}\.(pdf|docx?)$/i.test(basename)
  return looksGenerated ? 'Resume.pdf' : basename
}

function adminAppToApplication(a: AdminApplication): Application {
  const id = a?._id ?? ''
  const created = a?.createdAt ? new Date(a.createdAt) : null
  const rawUrl = getAttachmentUrl(a)
  return {
    id,
    applicantName: a.data?.fullName ?? '—',
    email: a.data?.email ?? '—',
    role: getRoleTitle(a),
    company: getCompanyName(a),
    dateApplied: created ? created.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—',
    status: mapStatus(a.status),
    motivation: a.data?.motivation,
    attachmentUrl: toAbsoluteAttachmentUrl(rawUrl),
    attachmentName: rawUrl ? getResumeDisplayName(a.data?.attachmentName, rawUrl) ?? 'Resume.pdf' : undefined,
    phone: a.data?.phone,
    address: a.data?.address,
    educationStatus: a.data?.educationStatus,
  }
}

const Admin = () => {
  const [token, setToken] = useState<string | null>(() => {
    try {
      return getStoredAdminToken()
    } catch {
      return null
    }
  })
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState<string | null>(null)
  const [loginLoading, setLoginLoading] = useState(false)
  const [applications, setApplications] = useState<Application[]>(MOCK_APPLICATIONS)
  const [applicationsLoading, setApplicationsLoading] = useState(false)
  const [summary, setSummary] = useState<{ total: number; pending: number; interviewing: number; hired: number } | null>(null)
  const [detailApplication, setDetailApplication] = useState<Application | null>(null)
  const [detailApplicationId, setDetailApplicationId] = useState<string | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)
  const listApplicationWhenOpenedRef = useRef<Application | null>(null)
  const [markingReviewedId, setMarkingReviewedId] = useState<string | null>(null)
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null)
  const [statusError, setStatusError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'All'>('All')
  const [companyFilter, setCompanyFilter] = useState<string>('All')
  const [sortBy, setSortBy] = useState<'date' | 'name'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(1)

  const useBackend = hasBackend()
  const useBackendForMutations = useBackend && !!token

  const loadApplications = useCallback(() => {
    if (!useBackend || !token) {
      setApplications(MOCK_APPLICATIONS)
      setSummary(null)
      return
    }
    setApplicationsLoading(true)
    Promise.all([getAdminApplications(), getAdminApplicationsSummary()])
      .then(([list, summaryData]) => {
        try {
          const nextList = Array.isArray(list) ? list.map(adminAppToApplication) : []
          setApplications(nextList)
          setSummary(summaryData ?? null)
        } catch {
          setApplications(MOCK_APPLICATIONS)
          setSummary(null)
        }
      })
      .catch(() => {
        setApplications(MOCK_APPLICATIONS)
        setSummary(null)
      })
      .finally(() => setApplicationsLoading(false))
  }, [useBackend, token])

  useEffect(() => {
    if (!useBackend || !token) {
      setApplications(MOCK_APPLICATIONS)
      setSummary(null)
      return
    }
    loadApplications()
  }, [useBackend, token, loadApplications])

  // Application Details modal: load one application via GET /api/admin/applications/:id when backend is used
  useEffect(() => {
    if (!detailApplicationId || !useBackend || !token) return
    setDetailError(null)
    setDetailLoading(true)
    getAdminApplication(detailApplicationId)
      .then((app) => {
        if (app) {
          try {
            const mapped = adminAppToApplication(app)
            const fromList = listApplicationWhenOpenedRef.current
            const useListResume =
              !mapped.attachmentUrl &&
              fromList?.id === app._id &&
              (fromList.attachmentUrl || fromList.attachmentName)
            setDetailApplication(
              useListResume
                ? {
                    ...mapped,
                    attachmentUrl: fromList.attachmentUrl ?? mapped.attachmentUrl,
                    attachmentName: fromList.attachmentName ?? mapped.attachmentName,
                  }
                : mapped
            )
          } catch {
            setDetailError('Application could not be loaded.')
          }
        } else setDetailError('Application could not be loaded.')
      })
      .catch(() => setDetailError('Failed to load application.'))
      .finally(() => setDetailLoading(false))
  }, [detailApplicationId, useBackend, token])

  const openDetailModal = (app: Application) => {
    listApplicationWhenOpenedRef.current = app
    setDetailApplicationId(app.id)
    setStatusError(null)
    setDetailError(null)
    if (!useBackend || !token) {
      setDetailApplication(app)
      setDetailLoading(false)
    } else {
      setDetailApplication(null)
      setDetailLoading(true)
    }
  }

  const closeDetailModal = () => {
    listApplicationWhenOpenedRef.current = null
    setDetailApplicationId(null)
    setDetailApplication(null)
    setDetailLoading(false)
    setDetailError(null)
    setStatusError(null)
  }

  const filtered = useMemo(() => {
    return applications.filter((app) => {
      const matchSearch =
        app.applicantName.toLowerCase().includes(search.toLowerCase()) ||
        app.email.toLowerCase().includes(search.toLowerCase()) ||
        app.role.toLowerCase().includes(search.toLowerCase()) ||
        app.company.toLowerCase().includes(search.toLowerCase())
      const matchStatus = statusFilter === 'All' || app.status === statusFilter
      const matchCompany = companyFilter === 'All' || app.company === companyFilter
      return matchSearch && matchStatus && matchCompany
    })
  }, [applications, search, statusFilter, companyFilter])

  const sorted = useMemo(() => {
    const arr = [...filtered]
    if (sortBy === 'name') {
      arr.sort((a, b) => {
        const cmp = a.applicantName.localeCompare(b.applicantName, undefined, { sensitivity: 'base' })
        return sortOrder === 'asc' ? cmp : -cmp
      })
    } else {
      arr.sort((a, b) => {
        const dateA = new Date(a.dateApplied).getTime()
        const dateB = new Date(b.dateApplied).getTime()
        if (Number.isNaN(dateA) || Number.isNaN(dateB)) return 0
        const cmp = dateA - dateB
        return sortOrder === 'asc' ? cmp : -cmp
      })
    }
    return arr
  }, [filtered, sortBy, sortOrder])

  const companies = useMemo(() => {
    const set = new Set(applications.map((a) => a.company).filter(Boolean))
    return Array.from(set).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
  }, [applications])

  const pageSize = 5
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const start = (page - 1) * pageSize
  const paginated = sorted.slice(start, start + pageSize)

  useEffect(() => {
    setPage(1)
  }, [search, statusFilter, companyFilter, sortBy, sortOrder])

  const stats = useMemo(() => {
    if (summary) return summary
    const total = applications.length
    const pending = applications.filter((a) => a.status === 'Pending').length
    const interviewing = applications.filter((a) => a.status === 'Interviewing').length
    const hired = applications.filter((a) => a.status === 'Accepted').length
    return { total, pending, interviewing, hired }
  }, [summary, applications])

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

  function applicationStatusToApi(status: ApplicationStatus): 'pending' | 'reviewed' | 'interviewing' | 'hired' | 'rejected' {
    const map: Record<ApplicationStatus, 'pending' | 'reviewed' | 'interviewing' | 'hired' | 'rejected'> = {
      Pending: 'pending',
      Reviewed: 'reviewed',
      Interviewing: 'interviewing',
      Accepted: 'hired',
      Rejected: 'rejected',
    }
    return map[status] ?? 'pending'
  }

  const handleMarkReviewed = async (appId: string) => {
    setMarkingReviewedId(appId)
    setStatusError(null)
    try {
      if (useBackendForMutations) {
        const result = await updateApplicationStatus(appId, 'reviewed')
        if (result.ok) {
          const list = await getAdminApplications()
          setApplications(list.map(adminAppToApplication))
          setDetailApplication((prev) => (prev?.id === appId ? { ...prev, status: 'Reviewed' } : prev))
          setSuccessMessage('Marked as reviewed')
          setTimeout(() => setSuccessMessage(null), 3000)
          closeDetailModal()
        } else {
          setStatusError(result.error ?? 'Failed to update status')
        }
      } else {
        setApplications((prev) =>
          prev.map((a) => (a.id === appId ? { ...a, status: 'Reviewed' } : a))
        )
        setDetailApplication((prev) => (prev?.id === appId ? { ...prev, status: 'Reviewed' } : prev))
        setSuccessMessage('Marked as reviewed')
        setTimeout(() => setSuccessMessage(null), 3000)
        closeDetailModal()
      }
    } catch (e) {
      setStatusError(e instanceof Error ? e.message : 'Request failed')
    } finally {
      setMarkingReviewedId(null)
    }
  }

  const handleStatusChange = async (appId: string, newStatus: ApplicationStatus) => {
    setUpdatingStatusId(appId)
    setStatusError(null)
    try {
      const apiStatus = applicationStatusToApi(newStatus)
      if (useBackendForMutations) {
        const result = await updateApplicationStatus(appId, apiStatus)
        if (result.ok) {
          const list = await getAdminApplications()
          setApplications(list.map(adminAppToApplication))
          setDetailApplication((prev) => (prev?.id === appId ? { ...prev, status: newStatus } : prev))
          let successMsg = 'Status updated.'
          if (newStatus === 'Interviewing' || newStatus === 'Accepted' || newStatus === 'Rejected') {
            if (result.emailSent) successMsg += ' Applicant notified by email.'
            else if (result.emailError) successMsg += ' Email failed: ' + result.emailError
            else successMsg += ' If applicant did not get an email, check backend SMTP and that the application has an email address.'
          }
          setSuccessMessage(successMsg)
          setTimeout(() => setSuccessMessage(null), 5000)
          closeDetailModal()
        } else {
          setStatusError(result.error ?? 'Failed to update status')
        }
      } else {
        setApplications((prev) =>
          prev.map((a) => (a.id === appId ? { ...a, status: newStatus } : a))
        )
        setDetailApplication((prev) => (prev?.id === appId ? { ...prev, status: newStatus } : prev))
        setSuccessMessage('Status updated')
        setTimeout(() => setSuccessMessage(null), 3000)
        closeDetailModal()
      }
    } catch (e) {
      setStatusError(e instanceof Error ? e.message : 'Request failed')
    } finally {
      setUpdatingStatusId(null)
    }
  }

  const handleDownloadResume = async (url: string, filename: string) => {
    const base = getBaseUrl()
    const downloadFilename = filename || getFilenameFromResumeUrl(url) || 'resume.pdf'
    try {
      const headers: HeadersInit = { Accept: 'application/pdf,*/*' }
      // Use authenticated uploads endpoint when file is behind auth (backend: GET /api/admin/uploads/:filename)
      if (token && base) {
        const fileSegment = getFilenameFromResumeUrl(url)
        const authUrl = `${base}/api/admin/uploads/${encodeURIComponent(fileSegment)}`
        headers['Authorization'] = `Bearer ${token}`
        const res = await fetch(authUrl, { headers })
        if (!res.ok) throw new Error('Download failed')
        const blob = await res.blob()
        const objectUrl = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = objectUrl
        a.download = downloadFilename
        a.click()
        URL.revokeObjectURL(objectUrl)
        return
      }
      if (token) headers['Authorization'] = `Bearer ${token}`
      const res = await fetch(url, { headers })
      if (!res.ok) throw new Error('Download failed')
      const blob = await res.blob()
      const objectUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = objectUrl
      a.download = downloadFilename
      a.click()
      URL.revokeObjectURL(objectUrl)
    } catch (e) {
      console.error('Resume download failed', e)
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }

  const handleExportCsv = async () => {
    if (useBackend && token) {
      const result = await exportAdminApplicationsCsv()
      if (result.ok) return
    }
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
            {useBackend && token && (
              <button
                type="button"
                className="admin-refresh-btn"
                onClick={loadApplications}
                disabled={applicationsLoading}
                aria-label="Refresh applications"
              >
                <RefreshCw size={18} className={applicationsLoading ? 'admin-refresh-icon-spin' : ''} aria-hidden />
                Refresh
              </button>
            )}
            <button type="button" className="admin-export-btn" onClick={handleExportCsv}>
              <Download size={18} aria-hidden />
              Export CSV
            </button>
          </div>
        </div>

        {successMessage && (
          <p className="admin-success-toast" role="status" aria-live="polite">
            {successMessage}
          </p>
        )}

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
          <div className="admin-filter-wrap">
            <select
              className="admin-filter-select"
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              aria-label="Filter by company"
            >
              <option value="All">All Companies</option>
              {companies.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="admin-filter-wrap">
            <select
              className="admin-filter-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'name')}
              aria-label="Sort by"
            >
              <option value="date">Date</option>
              <option value="name">Name</option>
            </select>
            <select
              className="admin-filter-select"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
              aria-label="Sort order"
            >
              <option value="desc">Newest / Z–A</option>
              <option value="asc">Oldest / A–Z</option>
            </select>
          </div>
        </div>

        {applicationsLoading ? (
          <p className="admin-loading">Loading applications…</p>
        ) : sorted.length === 0 ? (
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
                          <button
                            type="button"
                            className="admin-action-btn"
                            onClick={() => openDetailModal(app)}
                            aria-label={`View details for ${app.applicantName}`}
                          >
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
                Page {page} of {totalPages} · Showing {sorted.length === 0 ? 0 : start + 1}–{Math.min(start + pageSize, sorted.length)} of {sorted.length} entries
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
                <span className="admin-pagination-page" aria-live="polite">
                  {page} / {totalPages}
                </span>
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

      {detailApplicationId && detailLoading && (
        <div className="app-detail-overlay" role="dialog" aria-modal="true" aria-busy="true">
          <div className="app-detail-modal">
            <p className="app-detail-loading">Loading application…</p>
          </div>
        </div>
      )}
      {detailApplicationId && detailError && !detailLoading && (
        <div
          className="app-detail-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="app-detail-error"
          onClick={(e) => e.target === e.currentTarget && closeDetailModal()}
        >
          <div className="app-detail-modal">
            <p id="app-detail-error" className="app-detail-error-text">{detailError}</p>
            <button type="button" className="app-detail-close-btn" onClick={closeDetailModal}>Close</button>
          </div>
        </div>
      )}
      {detailApplicationId && !detailLoading && !detailError && detailApplication && (
      <ApplicationDetailModal
        application={detailApplication}
        onClose={closeDetailModal}
        onMarkReviewed={handleMarkReviewed}
        markingReviewed={markingReviewedId !== null}
        onStatusChange={handleStatusChange}
        updatingStatus={updatingStatusId !== null}
        statusError={statusError}
        onClearError={() => setStatusError(null)}
        onDownloadResume={handleDownloadResume}
      />
      )}

    </div>
  )
}

export default Admin
