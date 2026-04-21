import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import Header from '../components/Header'
import ApplicationDetailModal from '../components/ApplicationDetailModal'
import { Search, Filter, Download, Eye, LogOut, RefreshCw, Briefcase, Plus, Pencil, Trash2, X, Check, ImagePlus } from 'lucide-react'
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
  getAdminJobRoles,
  createAdminJobRole,
  updateAdminJobRole,
  deleteAdminJobRole,
  getCompanies,
  getAdminCompanies,
  createAdminCompany,
  updateAdminCompany,
  deleteAdminCompany,
} from '../api/admin'
import type { AdminApplication, AdminJobRole } from '../api/types'
import type { JobRolePayload, AdminCompany, CompanyPayload } from '../api/admin'

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

// ─── Job Role helpers ────────────────────────────────────────────────────────

function getJobRoleCompanyName(role: AdminJobRole): string {
  const cid = role.companyId
  if (!cid) return '—'
  if (typeof cid === 'object' && 'name' in cid && cid.name) return cid.name
  return '—'
}

const EMPTY_ROLE_FORM: JobRolePayload = {
  companyId: '',
  title: '',
  description: '',
  department: '',
  type: '',
  location: '',
  requirements: [],
  qualifications: [],
  deadline: '',
  isActive: true,
  image: null,
}

// ─── Component ───────────────────────────────────────────────────────────────

const Admin = () => {
  // ── auth ──────────────────────────────────────────────────────────────────
  const [token, setToken] = useState<string | null>(() => {
    try { return getStoredAdminToken() } catch { return null }
  })
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState<string | null>(null)
  const [loginLoading, setLoginLoading] = useState(false)

  // ── tab ───────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<'applications' | 'job-roles' | 'companies'>('applications')

  // ── applications state ────────────────────────────────────────────────────
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

  // ── job roles state ───────────────────────────────────────────────────────
  const [jobRoles, setJobRoles] = useState<AdminJobRole[]>([])
  const [jobRolesLoading, setJobRolesLoading] = useState(false)
  const [jobRolesError, setJobRolesError] = useState<string | null>(null)
  const [jobRolesSuccess, setJobRolesSuccess] = useState<string | null>(null)
  // form modal
  const [roleFormOpen, setRoleFormOpen] = useState(false)
  const [roleFormData, setRoleFormData] = useState<JobRolePayload>(EMPTY_ROLE_FORM)
  const [roleFormError, setRoleFormError] = useState<string | null>(null)
  const [roleFormLoading, setRoleFormLoading] = useState(false)
  // form mode: 'create' | 'edit'
  const [roleFormMode, setRoleFormMode] = useState<'create' | 'edit'>('create')
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null)
  // company list for dropdown
  const [companies, setCompanies] = useState<AdminCompany[]>([])
  const [companiesLoading, setCompaniesLoading] = useState(false)
  // delete confirm
  const [deletingRoleId, setDeletingRoleId] = useState<string | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  // image upload
  const [roleImageUploading, setRoleImageUploading] = useState(false)
  const [roleImageError, setRoleImageError] = useState<string | null>(null)
  const roleImageInputRef = useRef<HTMLInputElement>(null)

  // ── companies tab state ───────────────────────────────────────────────────
  const EMPTY_COMPANY_FORM: CompanyPayload = { name: '', slug: '', logo: '', description: '', active: true }
  const [adminCompaniesList, setAdminCompaniesList] = useState<AdminCompany[]>([])
  const [companiesTabLoading, setCompaniesTabLoading] = useState(false)
  const [companiesTabError, setCompaniesTabError] = useState<string | null>(null)
  const [companiesTabSuccess, setCompaniesTabSuccess] = useState<string | null>(null)
  const [companyFormOpen, setCompanyFormOpen] = useState(false)
  const [companyFormMode, setCompanyFormMode] = useState<'create' | 'edit'>('create')
  const [editingCompanyId, setEditingCompanyId] = useState<string | null>(null)
  const [companyFormData, setCompanyFormData] = useState<CompanyPayload>(EMPTY_COMPANY_FORM)
  const [companyFormError, setCompanyFormError] = useState<string | null>(null)
  const [companyFormLoading, setCompanyFormLoading] = useState(false)
  const [deleteCompanyConfirmId, setDeleteCompanyConfirmId] = useState<string | null>(null)

  const useBackend = hasBackend()
  const useBackendForMutations = useBackend && !!token

  // ── applications data loading ─────────────────────────────────────────────
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

  // ── job roles data loading ────────────────────────────────────────────────
  const loadJobRoles = useCallback(() => {
    if (!useBackend || !token) { setJobRoles([]); return }
    setJobRolesLoading(true)
    getAdminJobRoles()
      .then((list) => setJobRoles(Array.isArray(list) ? list : []))
      .catch(() => setJobRoles([]))
      .finally(() => setJobRolesLoading(false))
  }, [useBackend, token])

  useEffect(() => {
    if (activeTab === 'job-roles' && useBackend && token) {
      loadJobRoles()
    }
  }, [activeTab, useBackend, token, loadJobRoles])

  // ── application detail modal ───────────────────────────────────────────────
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

  // ── filters / pagination ───────────────────────────────────────────────────
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

  const appCompanyFilter = useMemo(() => {
    const set = new Set(applications.map((a) => a.company).filter(Boolean))
    return Array.from(set).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
  }, [applications])

  const pageSize = 5
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const start = (page - 1) * pageSize
  const paginated = sorted.slice(start, start + pageSize)

  useEffect(() => { setPage(1) }, [search, statusFilter, companyFilter, sortBy, sortOrder])

  const stats = useMemo(() => {
    if (summary) return summary
    const total = applications.length
    const pending = applications.filter((a) => a.status === 'Pending').length
    const interviewing = applications.filter((a) => a.status === 'Interviewing').length
    const hired = applications.filter((a) => a.status === 'Accepted').length
    return { total, pending, interviewing, hired }
  }, [summary, applications])

  // ── auth handlers ─────────────────────────────────────────────────────────
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

  // ── application status handlers ───────────────────────────────────────────
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
        setApplications((prev) => prev.map((a) => (a.id === appId ? { ...a, status: 'Reviewed' } : a)))
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

  const handleStatusChange = async (appId: string, newStatus: ApplicationStatus, message?: string) => {
    setUpdatingStatusId(appId)
    setStatusError(null)
    try {
      const apiStatus = applicationStatusToApi(newStatus)
      if (useBackendForMutations) {
        const result = await updateApplicationStatus(appId, apiStatus, message)
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
        setApplications((prev) => prev.map((a) => (a.id === appId ? { ...a, status: newStatus } : a)))
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

  // ── job roles handlers ────────────────────────────────────────────────────
  const fetchCompaniesForForm = () => {
    if (companies.length > 0) return // already loaded
    setCompaniesLoading(true)
    getCompanies()
      .then((list) => setCompanies(list))
      .catch(() => { })
      .finally(() => setCompaniesLoading(false))
  }

  const openCreateRoleForm = () => {
    setRoleFormMode('create')
    setEditingRoleId(null)
    setRoleFormData(EMPTY_ROLE_FORM)
    setRoleFormError(null)
    setRoleImageError(null)
    setRoleFormOpen(true)
    fetchCompaniesForForm()
  }

  const openEditRoleForm = (role: AdminJobRole) => {
    setRoleFormMode('edit')
    setEditingRoleId(role._id)
    setRoleFormData({
      companyId: typeof role.companyId === 'object' && role.companyId !== null ? role.companyId._id : (role.companyId as string | undefined) ?? '',
      title: role.title ?? '',
      description: role.description ?? '',
      department: role.department ?? '',
      type: role.type ?? '',
      location: role.location ?? '',
      requirements: role.requirements ?? [],
      qualifications: role.qualifications ?? [],
      deadline: role.deadline ?? '',
      isActive: role.isActive !== false,
      image: role.image ?? null,
    })
    setRoleFormError(null)
    setRoleImageError(null)
    setRoleFormOpen(true)
    fetchCompaniesForForm()
  }

  const closeRoleForm = () => {
    setRoleFormOpen(false)
    setRoleFormError(null)
    setRoleImageError(null)
    setEditingRoleId(null)
  }

  // ── role image upload ────────────────────────────────────────────────────
  const handleRoleImageUpload = async (file: File) => {
    const base = getBaseUrl()
    if (!base || !token) { setRoleImageError('Not connected'); return }
    setRoleImageUploading(true)
    setRoleImageError(null)
    try {
      const fd = new FormData()
      fd.append('image', file)
      const res = await fetch(`${base}/api/upload`, {
        method: 'POST',
        body: fd,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Upload failed')
      const url: string = data.secure_url || data.url || ''
      if (!url) throw new Error('No URL returned from upload')
      setRoleFormData((d) => ({ ...d, image: url }))
    } catch (err) {
      setRoleImageError(err instanceof Error ? err.message : 'Image upload failed')
    } finally {
      setRoleImageUploading(false)
      if (roleImageInputRef.current) roleImageInputRef.current.value = ''
    }
  }

  const handleRoleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!roleFormData.title.trim()) { setRoleFormError('Title is required'); return }
    if (!roleFormData.description.trim()) { setRoleFormError('Description is required'); return }
    setRoleFormLoading(true)
    setRoleFormError(null)
    try {
      const payload: JobRolePayload = {
        ...roleFormData,
        title: roleFormData.title.trim(),
        description: roleFormData.description.trim(),
        deadline: roleFormData.deadline || null,
      }
      if (roleFormMode === 'edit' && editingRoleId) {
        const res = await updateAdminJobRole(editingRoleId, payload)
        if (!res.ok) { setRoleFormError(res.error ?? 'Failed to update role'); return }
        setJobRolesSuccess('Job role updated successfully.')
      } else {
        const res = await createAdminJobRole(payload)
        if (!res.ok) { setRoleFormError(res.error ?? 'Failed to create role'); return }
        setJobRolesSuccess('Job role created successfully.')
      }
      setTimeout(() => setJobRolesSuccess(null), 4000)
      closeRoleForm()
      loadJobRoles()
    } finally {
      setRoleFormLoading(false)
    }
  }

  const handleDeleteRole = async (id: string) => {
    setDeletingRoleId(id)
    setJobRolesError(null)
    try {
      const res = await deleteAdminJobRole(id)
      if (!res.ok) { setJobRolesError(res.error ?? 'Failed to delete role'); return }
      setJobRolesSuccess('Job role deleted.')
      setTimeout(() => setJobRolesSuccess(null), 3000)
      setDeleteConfirmId(null)
      loadJobRoles()
    } finally {
      setDeletingRoleId(null)
    }
  }

  // Helper for array fields (requirements / qualifications)
  const parseLines = (text: string): string[] =>
    text.split('\n').map((s) => s.trim()).filter(Boolean)
  const joinLines = (arr: string[] | undefined): string =>
    (arr ?? []).join('\n')

  // ─── Login screen ──────────────────────────────────────────────────────────
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

  // ─── Main dashboard ────────────────────────────────────────────────────────
  return (
    <div className="admin-page">
      <Header />
      <main id="main" className="admin-main" tabIndex={-1}>

        {/* ── Header row ── */}
        <div className="admin-header-row">
          <div>
            <h1 className="admin-title">Admin Dashboard</h1>
            <p className="admin-subtitle">Manage applications and job roles.</p>
          </div>
          <div className="admin-header-actions">
            {useBackend && (
              <button type="button" className="admin-logout-btn" onClick={handleLogout} aria-label="Log out">
                <LogOut size={18} aria-hidden />
                Log out
              </button>
            )}
            {useBackend && token && activeTab === 'applications' && (
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
            {useBackend && token && activeTab === 'job-roles' && (
              <button
                type="button"
                className="admin-refresh-btn"
                onClick={loadJobRoles}
                disabled={jobRolesLoading}
                aria-label="Refresh job roles"
              >
                <RefreshCw size={18} className={jobRolesLoading ? 'admin-refresh-icon-spin' : ''} aria-hidden />
                Refresh
              </button>
            )}
            {activeTab === 'applications' && (
              <button type="button" className="admin-export-btn" onClick={handleExportCsv}>
                <Download size={18} aria-hidden />
                Export CSV
              </button>
            )}
          </div>
        </div>

        {/* ── Global toast ── */}
        {successMessage && (
          <p className="admin-success-toast" role="status" aria-live="polite">{successMessage}</p>
        )}

        {/* ── Stats cards ── */}
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
          <div className="admin-card admin-card--roles">
            <span className="admin-card-label">Job Roles</span>
            <span className="admin-card-value">{jobRoles.length}</span>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="admin-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'applications'}
            className={`admin-tab-btn${activeTab === 'applications' ? ' admin-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('applications')}
          >
            <Filter size={16} aria-hidden />
            Applications
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'job-roles'}
            className={`admin-tab-btn${activeTab === 'job-roles' ? ' admin-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('job-roles')}
          >
            <Briefcase size={16} aria-hidden />
            Job Roles
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'companies'}
            className={`admin-tab-btn${activeTab === 'companies' ? ' admin-tab-btn--active' : ''}`}
            onClick={() => {
              setActiveTab('companies')
              if (adminCompaniesList.length === 0) {
                setCompaniesTabLoading(true)
                getAdminCompanies().then((list) => { setAdminCompaniesList(list) }).finally(() => setCompaniesTabLoading(false))
              }
            }}
          >
            🏢 Companies
          </button>
        </div>

        {/* ══════════════════════ APPLICATIONS TAB ══════════════════════════ */}
        {activeTab === 'applications' && (
          <>
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
                    <option key={s} value={s}>{s}</option>
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
                  {appCompanyFilter.map((c) => (
                    <option key={c} value={c}>{c}</option>
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
          </>
        )}

        {/* ══════════════════════ JOB ROLES TAB ═════════════════════════════ */}
        {activeTab === 'job-roles' && (
          <div className="admin-jr-panel">
            {/* toolbar */}
            <div className="admin-jr-toolbar">
              <p className="admin-jr-hint">
                {useBackend ? 'Manage job postings visible to applicants.' : 'Connect a backend to enable job role management.'}
              </p>
              {useBackendForMutations && (
                <button
                  type="button"
                  className="admin-jr-add-btn"
                  onClick={openCreateRoleForm}
                  id="admin-add-role-btn"
                >
                  <Plus size={16} aria-hidden />
                  Add Role
                </button>
              )}
            </div>

            {/* toasts */}
            {jobRolesSuccess && (
              <p className="admin-success-toast" role="status" aria-live="polite">{jobRolesSuccess}</p>
            )}
            {jobRolesError && (
              <p className="admin-jr-error" role="alert">{jobRolesError}</p>
            )}

            {/* table */}
            {jobRolesLoading ? (
              <p className="admin-loading">Loading job roles…</p>
            ) : !useBackend ? (
              <p className="admin-empty">No backend configured. Set VITE_API_BASE_URL to manage job roles.</p>
            ) : jobRoles.length === 0 ? (
              <p className="admin-empty">No job roles found. Click <strong>Add Role</strong> to create one.</p>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table admin-jr-table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Title</th>
                      <th>Company</th>
                      <th>Department</th>
                      <th>Type</th>
                      <th>Location</th>
                      <th>Deadline</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobRoles.map((role) => (
                      <tr key={role._id}>
                        <td>
                          {role.image ? (
                            <img
                              src={role.image}
                              alt={role.title}
                              className="admin-jr-table-img"
                            />
                          ) : (
                            <div className="admin-jr-table-img admin-jr-table-img--empty" aria-label="No image">
                              <ImagePlus size={14} aria-hidden />
                            </div>
                          )}
                        </td>
                        <td className="admin-jr-title-cell">{role.title}</td>
                        <td>{getJobRoleCompanyName(role)}</td>
                        <td>{role.department || '—'}</td>
                        <td>{role.type || '—'}</td>
                        <td>{role.location || '—'}</td>
                        <td>
                          {role.deadline
                            ? new Date(role.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                            : '—'}
                        </td>
                        <td>
                          <span className={`admin-jr-status-pill ${role.isActive !== false ? 'admin-jr-status-pill--active' : 'admin-jr-status-pill--inactive'}`}>
                            {role.isActive !== false ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <div className="admin-action-btns">
                            <button
                              type="button"
                              className="admin-action-btn admin-action-btn--edit"
                              onClick={() => openEditRoleForm(role)}
                              aria-label={`Edit ${role.title}`}
                              title="Edit"
                            >
                              <Pencil size={15} aria-hidden />
                            </button>
                            {deleteConfirmId === role._id ? (
                              <span className="admin-jr-delete-confirm">
                                <button
                                  type="button"
                                  className="admin-action-btn admin-action-btn--confirm-yes"
                                  onClick={() => handleDeleteRole(role._id)}
                                  disabled={deletingRoleId === role._id}
                                  aria-label="Confirm delete"
                                  title="Confirm delete"
                                >
                                  <Check size={15} aria-hidden />
                                </button>
                                <button
                                  type="button"
                                  className="admin-action-btn admin-action-btn--confirm-no"
                                  onClick={() => setDeleteConfirmId(null)}
                                  aria-label="Cancel delete"
                                  title="Cancel"
                                >
                                  <X size={15} aria-hidden />
                                </button>
                              </span>
                            ) : (
                              <button
                                type="button"
                                className="admin-action-btn admin-action-btn--delete"
                                onClick={() => setDeleteConfirmId(role._id)}
                                aria-label={`Delete ${role.title}`}
                                title="Delete"
                              >
                                <Trash2 size={15} aria-hidden />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ══════════════════════ COMPANIES TAB ════════════════════════════════ */}
      {activeTab === 'companies' && (
        <main className="admin-main" style={{ paddingTop: 0 }}>
          <div className="admin-jr-header">
            <div>
              <h2 className="admin-jr-heading">Companies</h2>
              <p className="admin-jr-subheading">Manage partner companies. Only super admins can create or delete.</p>
            </div>
            <button
              type="button"
              className="admin-jr-add-btn"
              onClick={() => {
                setCompanyFormMode('create')
                setEditingCompanyId(null)
                setCompanyFormData({ name: '', slug: '', logo: '', description: '', active: true })
                setCompanyFormError(null)
                setCompanyFormOpen(true)
              }}
            >
              <Plus size={16} aria-hidden /> Add Company
            </button>
          </div>

          {companiesTabSuccess && <p className="admin-jr-success">{companiesTabSuccess}</p>}
          {companiesTabError && <p className="admin-jr-error-text">{companiesTabError}</p>}

          {companiesTabLoading ? (
            <p className="admin-jr-loading">Loading companies…</p>
          ) : adminCompaniesList.length === 0 ? (
            <p className="admin-jr-empty">No companies found. Click "Add Company" to create one.</p>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table admin-jr-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Slug</th>
                    <th>Logo URL</th>
                    <th>Active</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {adminCompaniesList.map((co) => (
                    <tr key={co._id}>
                      <td className="admin-jr-title-cell">{co.name}</td>
                      <td><code style={{ fontSize: '0.8rem', opacity: 0.7 }}>{co.slug ?? '—'}</code></td>
                      <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {co.logo ? <a href={co.logo} target="_blank" rel="noreferrer" style={{ color: '#60a5fa', fontSize: '0.8rem' }}>View logo</a> : '—'}
                      </td>
                      <td>
                        <span className={`admin-jr-status-badge ${co.active !== false ? 'admin-jr-status-badge--active' : 'admin-jr-status-badge--inactive'}`}>
                          {co.active !== false ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="admin-action-btns">
                          <button
                            type="button"
                            className="admin-action-btn admin-action-btn--edit"
                            title="Edit"
                            onClick={() => {
                              setCompanyFormMode('edit')
                              setEditingCompanyId(co._id)
                              setCompanyFormData({ name: co.name, slug: co.slug ?? '', logo: co.logo ?? '', description: co.description ?? '', active: co.active !== false })
                              setCompanyFormError(null)
                              setCompanyFormOpen(true)
                            }}
                          >
                            <Pencil size={15} aria-hidden />
                          </button>
                          {deleteCompanyConfirmId === co._id ? (
                            <span className="admin-delete-confirm">
                              <button
                                type="button"
                                className="admin-action-btn admin-action-btn--confirm-delete"
                                title="Confirm delete"
                                onClick={async () => {
                                  const res = await deleteAdminCompany(co._id)
                                  setDeleteCompanyConfirmId(null)
                                  if (res.ok) {
                                    setAdminCompaniesList((prev) => prev.filter((c) => c._id !== co._id))
                                    setCompaniesTabSuccess('Company deleted.')
                                    setTimeout(() => setCompaniesTabSuccess(null), 3000)
                                  } else {
                                    setCompaniesTabError(res.error ?? 'Failed to delete')
                                    setTimeout(() => setCompaniesTabError(null), 4000)
                                  }
                                }}
                              >
                                <Check size={15} aria-hidden />
                              </button>
                              <button type="button" className="admin-action-btn" title="Cancel" onClick={() => setDeleteCompanyConfirmId(null)}>
                                <X size={15} aria-hidden />
                              </button>
                            </span>
                          ) : (
                            <button
                              type="button"
                              className="admin-action-btn admin-action-btn--delete"
                              title="Delete"
                              onClick={() => setDeleteCompanyConfirmId(co._id)}
                            >
                              <Trash2 size={15} aria-hidden />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── Company Form Modal ── */}
          {companyFormOpen && (
            <div className="admin-jr-modal-overlay" onClick={(e) => e.target === e.currentTarget && setCompanyFormOpen(false)}>
              <div className="admin-jr-modal">
                <div className="admin-jr-modal-header">
                  <h3 className="admin-jr-modal-title">{companyFormMode === 'edit' ? 'Edit Company' : 'Add Company'}</h3>
                  <button type="button" className="admin-jr-modal-close" onClick={() => setCompanyFormOpen(false)} aria-label="Close"><X size={20} /></button>
                </div>
                {companyFormError && <p className="admin-jr-form-error">{companyFormError}</p>}
                <form onSubmit={async (e) => {
                  e.preventDefault()
                  if (!companyFormData.name.trim()) { setCompanyFormError('Name is required'); return }
                  setCompanyFormLoading(true); setCompanyFormError(null)
                  try {
                    const payload = { ...companyFormData, name: companyFormData.name.trim() }
                    const res = companyFormMode === 'edit' && editingCompanyId
                      ? await updateAdminCompany(editingCompanyId, payload)
                      : await createAdminCompany(payload)
                    if (!res.ok) { setCompanyFormError(res.error ?? 'Failed'); return }
                    setCompaniesTabSuccess(companyFormMode === 'edit' ? 'Company updated.' : 'Company created.')
                    setTimeout(() => setCompaniesTabSuccess(null), 4000)
                    setCompanyFormOpen(false)
                    // Refresh list
                    setCompaniesTabLoading(true)
                    getAdminCompanies().then(setAdminCompaniesList).finally(() => setCompaniesTabLoading(false))
                  } finally {
                    setCompanyFormLoading(false)
                  }
                }}>
                  <div className="admin-jr-field">
                    <label className="admin-jr-label" htmlFor="co-name">Name <span className="admin-jr-required">*</span></label>
                    <input id="co-name" type="text" className="admin-jr-input" value={companyFormData.name} onChange={(e) => setCompanyFormData((d) => ({ ...d, name: e.target.value }))} />
                  </div>
                  <div className="admin-jr-row">
                    <div className="admin-jr-field">
                      <label className="admin-jr-label" htmlFor="co-slug">Slug</label>
                      <input id="co-slug" type="text" className="admin-jr-input" placeholder="e.g. afresh" value={companyFormData.slug ?? ''} onChange={(e) => setCompanyFormData((d) => ({ ...d, slug: e.target.value }))} />
                    </div>
                    <div className="admin-jr-field">
                      <label className="admin-jr-label" htmlFor="co-logo">Logo URL</label>
                      <input id="co-logo" type="url" className="admin-jr-input" placeholder="https://..." value={companyFormData.logo ?? ''} onChange={(e) => setCompanyFormData((d) => ({ ...d, logo: e.target.value }))} />
                    </div>
                  </div>
                  <div className="admin-jr-field">
                    <label className="admin-jr-label" htmlFor="co-description">Description</label>
                    <textarea id="co-description" className="admin-jr-textarea" rows={2} value={companyFormData.description ?? ''} onChange={(e) => setCompanyFormData((d) => ({ ...d, description: e.target.value }))} />
                  </div>
                  <div className="admin-jr-field admin-jr-field--inline">
                    <label className="admin-jr-label" htmlFor="co-active">Active</label>
                    <input id="co-active" type="checkbox" className="admin-jr-checkbox" checked={companyFormData.active !== false} onChange={(e) => setCompanyFormData((d) => ({ ...d, active: e.target.checked }))} />
                    <span className="admin-jr-hint-text">Inactive companies won't appear in public dropdowns.</span>
                  </div>
                  <div className="admin-jr-form-actions">
                    <button type="button" className="admin-jr-cancel-btn" onClick={() => setCompanyFormOpen(false)} disabled={companyFormLoading}>Cancel</button>
                    <button type="submit" className="admin-jr-submit-btn" disabled={companyFormLoading}>
                      {companyFormLoading ? 'Saving…' : companyFormMode === 'edit' ? 'Save Changes' : 'Create Company'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      )}

      {/* ══════════════════════ APPLICATION DETAIL MODAL ══════════════════ */}
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

      {/* ══════════════════════ JOB ROLE FORM MODAL ═══════════════════════ */}
      {roleFormOpen && (
        <div
          className="app-detail-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="role-form-title"
          onClick={(e) => e.target === e.currentTarget && !roleFormLoading && closeRoleForm()}
        >
          <div className="admin-jr-form-modal">
            <div className="admin-jr-form-header">
              <h2 id="role-form-title" className="admin-jr-form-title">{roleFormMode === 'edit' ? 'Edit Job Role' : 'Add Job Role'}</h2>
              <button type="button" className="admin-jr-form-close" onClick={closeRoleForm} disabled={roleFormLoading} aria-label="Close form">
                <X size={20} aria-hidden />
              </button>
            </div>

            {roleFormError && (
              <p className="admin-jr-error" role="alert">{roleFormError}</p>
            )}

            <form className="admin-jr-form" onSubmit={handleRoleFormSubmit} id="admin-role-form">
              {/* company ID only visible in create mode for super admins */}
              {roleFormMode === 'create' && (
                <div className="admin-jr-field">
                  <label className="admin-jr-label" htmlFor="jr-companyId">Company <span className="admin-jr-required">*</span></label>
                  <select
                    id="jr-companyId"
                    className="admin-jr-input"
                    value={roleFormData.companyId ?? ''}
                    onChange={(e) => setRoleFormData((d) => ({ ...d, companyId: e.target.value }))}
                  >
                    <option value="">{companiesLoading ? 'Loading companies…' : 'Select a company…'}</option>
                    {companies.map((c) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                  <span className="admin-jr-hint-text">Leave blank if you're a company admin (your company is auto-applied).</span>
                </div>
              )}

              <div className="admin-jr-field">
                <label className="admin-jr-label" htmlFor="jr-title">Title <span className="admin-jr-required">*</span></label>
                <input
                  id="jr-title"
                  type="text"
                  className="admin-jr-input"
                  placeholder="e.g. Senior Frontend Engineer"
                  value={roleFormData.title}
                  onChange={(e) => setRoleFormData((d) => ({ ...d, title: e.target.value }))}
                  required
                />
              </div>

              <div className="admin-jr-row">
                <div className="admin-jr-field">
                  <label className="admin-jr-label" htmlFor="jr-department">Department</label>
                  <input
                    id="jr-department"
                    type="text"
                    className="admin-jr-input"
                    placeholder="e.g. Engineering"
                    value={roleFormData.department ?? ''}
                    onChange={(e) => setRoleFormData((d) => ({ ...d, department: e.target.value }))}
                  />
                </div>
                <div className="admin-jr-field">
                  <label className="admin-jr-label" htmlFor="jr-type">Type</label>
                  <select
                    id="jr-type"
                    className="admin-jr-input"
                    value={roleFormData.type ?? ''}
                    onChange={(e) => setRoleFormData((d) => ({ ...d, type: e.target.value }))}
                  >
                    <option value="">Select type…</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                    <option value="Freelance">Freelance</option>
                  </select>
                </div>
              </div>

              <div className="admin-jr-row">
                <div className="admin-jr-field">
                  <label className="admin-jr-label" htmlFor="jr-location">Location</label>
                  <input
                    id="jr-location"
                    type="text"
                    className="admin-jr-input"
                    placeholder="e.g. Remote, Lagos"
                    value={roleFormData.location ?? ''}
                    onChange={(e) => setRoleFormData((d) => ({ ...d, location: e.target.value }))}
                  />
                </div>
                <div className="admin-jr-field">
                  <label className="admin-jr-label" htmlFor="jr-deadline">Deadline</label>
                  <input
                    id="jr-deadline"
                    type="date"
                    className="admin-jr-input"
                    value={roleFormData.deadline ?? ''}
                    onChange={(e) => setRoleFormData((d) => ({ ...d, deadline: e.target.value }))}
                  />
                </div>
              </div>

              <div className="admin-jr-field">
                <label className="admin-jr-label" htmlFor="jr-description">Description</label>
                <textarea
                  id="jr-description"
                  className="admin-jr-textarea"
                  placeholder="Describe the role…"
                  rows={3}
                  value={roleFormData.description ?? ''}
                  onChange={(e) => setRoleFormData((d) => ({ ...d, description: e.target.value }))}
                />
              </div>

              <div className="admin-jr-row">
                <div className="admin-jr-field">
                  <label className="admin-jr-label" htmlFor="jr-requirements">Requirements</label>
                  <textarea
                    id="jr-requirements"
                    className="admin-jr-textarea"
                    placeholder="One requirement per line"
                    rows={3}
                    value={joinLines(roleFormData.requirements)}
                    onChange={(e) => setRoleFormData((d) => ({ ...d, requirements: parseLines(e.target.value) }))}
                  />
                </div>
                <div className="admin-jr-field">
                  <label className="admin-jr-label" htmlFor="jr-qualifications">Qualifications</label>
                  <textarea
                    id="jr-qualifications"
                    className="admin-jr-textarea"
                    placeholder="One qualification per line"
                    rows={3}
                    value={joinLines(roleFormData.qualifications)}
                    onChange={(e) => setRoleFormData((d) => ({ ...d, qualifications: parseLines(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="admin-jr-field admin-jr-field--inline">
                <label className="admin-jr-label" htmlFor="jr-isActive">Active</label>
                <input
                  id="jr-isActive"
                  type="checkbox"
                  className="admin-jr-checkbox"
                  checked={roleFormData.isActive !== false}
                  onChange={(e) => setRoleFormData((d) => ({ ...d, isActive: e.target.checked }))}
                />
                <span className="admin-jr-hint-text">Inactive roles won't be shown to applicants.</span>
              </div>

              {/* ── Role Image Upload ── */}
              <div className="admin-jr-field">
                <label className="admin-jr-label">Role Image <span className="admin-jr-hint-text">(optional)</span></label>
                <input
                  ref={roleImageInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  style={{ display: 'none' }}
                  id="jr-image-input"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleRoleImageUpload(file)
                  }}
                />
                {roleFormData.image ? (
                  <div className="admin-jr-image-preview-wrap">
                    <img
                      src={roleFormData.image}
                      alt="Role preview"
                      className="admin-jr-image-preview"
                    />
                    <div className="admin-jr-image-actions">
                      <button
                        type="button"
                        className="admin-jr-image-change-btn"
                        onClick={() => roleImageInputRef.current?.click()}
                        disabled={roleImageUploading}
                      >
                        <ImagePlus size={14} aria-hidden /> Change
                      </button>
                      <button
                        type="button"
                        className="admin-jr-image-remove-btn"
                        onClick={() => setRoleFormData((d) => ({ ...d, image: null }))}
                        disabled={roleImageUploading}
                      >
                        <X size={14} aria-hidden /> Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="admin-jr-image-upload-btn"
                    onClick={() => roleImageInputRef.current?.click()}
                    disabled={roleImageUploading}
                  >
                    {roleImageUploading
                      ? <><span className="admin-jr-image-spinner" aria-hidden /> Uploading…</>
                      : <><ImagePlus size={16} aria-hidden /> Upload Image</>
                    }
                  </button>
                )}
                {roleImageError && (
                  <p className="admin-jr-image-error" role="alert">{roleImageError}</p>
                )}
                <span className="admin-jr-hint-text">Shown on the role card and detail view. Max 10 MB (JPG, PNG, WebP).</span>
              </div>

              <div className="admin-jr-form-actions">
                <button type="button" className="admin-jr-cancel-btn" onClick={closeRoleForm} disabled={roleFormLoading}>
                  Cancel
                </button>
                <button type="submit" className="admin-jr-submit-btn" disabled={roleFormLoading} id="admin-role-submit-btn">
                  {roleFormLoading
                    ? (roleFormMode === 'edit' ? 'Saving…' : 'Creating…')
                    : (roleFormMode === 'edit' ? 'Save Changes' : 'Create Role')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Admin
