import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import JobCard, { Job } from '../components/JobCard'
import JobDetailModal from '../components/JobDetailModal'
import ApplyJobModal from '../components/ApplyJobModal'
import ApplicationDetailModal from '../components/ApplicationDetailModal'
import { ArrowRight } from 'lucide-react'
import { hasBackend } from '../api/client'
import { getOpportunities } from '../api/opportunities'
import type { RoleDetail, OpportunityRole, OpportunitiesData } from '../api/types'
import type { ApplicationDetail } from '../components/ApplicationDetailModal'

// ── fallback data when backend is not connected ─────────────────────────────
const DEFAULT_JOBS: Job[] = [
  { id: '1', company: 'Cbrilliance', location: 'Remote', jobType: 'Full-time', title: 'Senior Frontend Engineer', department: 'Engineering', deadline: 'Oct 25', isFeatured: true },
  { id: '2', company: 'Cbrilliance', location: 'Hybrid', jobType: 'Full-time', title: 'Product Designer', department: 'Design', deadline: 'Oct 30' },
  { id: '3', company: 'Cbrilliance', location: 'Remote', jobType: 'Contract', title: 'DevOps Specialist', department: 'Engineering', deadline: 'Nov 05' },
]

const DEFAULT_ROLES: RoleDetail[] = [
  { id: '1', title: 'Senior Frontend Engineer', department: 'Engineering', jobType: 'Full-time', location: 'Remote', deadline: 'Oct 25' },
  { id: '2', title: 'Product Designer', department: 'Design', jobType: 'Full-time', location: 'Hybrid', deadline: 'Oct 30' },
  { id: '3', title: 'DevOps Specialist', department: 'Engineering', jobType: 'Contract', location: 'Remote', deadline: 'Nov 05' },
]

// ── mapping helpers ──────────────────────────────────────────────────────────
function mapRoleToJob(r: OpportunityRole): Job {
  return {
    id: r._id,
    company: r.company?.name ?? 'Company',
    companyLogo: r.company?.logo ?? undefined,
    location: r.location ?? 'Remote',
    jobType: (r.type as Job['jobType']) ?? 'Full-time',
    title: r.title,
    department: r.department ?? '',
    deadline: r.deadline ? new Date(r.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '',
    isFeatured: false,
  }
}

function mapRoleToDetail(r: OpportunityRole): RoleDetail {
  return {
    id: r._id,
    title: r.title,
    department: r.department,
    jobType: r.type ?? 'Full-time',
    location: r.location,
    deadline: r.deadline ? new Date(r.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '',
  }
}

// ── localStorage helpers ─────────────────────────────────────────────────────
const APPLIED_KEY = 'recruitment_applications'

function getApplication(roleId: string): ApplicationDetail | null {
  try {
    const raw = localStorage.getItem(APPLIED_KEY)
    if (!raw) return null
    const apps = JSON.parse(raw)
    return apps[roleId] ?? null
  } catch {
    return null
  }
}

function saveApplication(roleId: string, companyName: string, formData: Record<string, unknown>) {
  try {
    const raw = localStorage.getItem(APPLIED_KEY)
    const apps = raw ? JSON.parse(raw) : {}
    apps[roleId] = {
      id: Math.random().toString(36).slice(2, 9),
      status: 'Pending',
      dateApplied: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      company: companyName,
      ...formData,
    }
    localStorage.setItem(APPLIED_KEY, JSON.stringify(apps))
  } catch { /* ignore */ }
}

// ── component ────────────────────────────────────────────────────────────────
const Opportunities = () => {
  const [apiData, setApiData] = useState<OpportunitiesData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedRole, setSelectedRole] = useState<RoleDetail | null>(null)
  const [applyModalRole, setApplyModalRole] = useState<RoleDetail | null>(null)
  const [applyMeta, setApplyMeta] = useState<{ companyId: string; companyName: string; roleId: string } | null>(null)
  const [viewingApplication, setViewingApplication] = useState<ApplicationDetail | null>(null)

  useEffect(() => {
    getOpportunities()
      .then(setApiData)
      .finally(() => setLoading(false))
  }, [])

  const { jobs, roles, roleByJobId } = useMemo(() => {
    const liveRoles = apiData?.roles?.filter((r) => r.isActive !== false) ?? []
    if (liveRoles.length > 0) {
      return {
        jobs: liveRoles.map(mapRoleToJob),
        roles: liveRoles.map(mapRoleToDetail),
        roleByJobId: new Map(
          liveRoles.map((r) => [r._id, {
            roleId: r._id,
            companyId: r.companyId ?? '',
            companyName: r.company?.name ?? 'Company',
          }])
        ),
      }
    }
    const useMock = !hasBackend()
    return {
      jobs: DEFAULT_JOBS,
      roles: DEFAULT_ROLES,
      roleByJobId: useMock
        ? new Map([
          ['1', { roleId: '1', companyId: 'cbrilliance', companyName: 'Cbrilliance' }],
          ['2', { roleId: '2', companyId: 'cbrilliance', companyName: 'Cbrilliance' }],
          ['3', { roleId: '3', companyId: 'cbrilliance', companyName: 'Cbrilliance' }],
        ])
        : new Map(),
    }
  }, [apiData])

  const handleApplyClick = (job: Job) => {
    const existing = getApplication(job.id)
    if (existing) {
      setViewingApplication(existing)
      return
    }
    const role = roles.find((r) => r.id === job.id) ?? null
    if (role) {
      setSelectedRole(role)
      setApplyMeta(roleByJobId.get(job.id) ?? null)
    }
  }

  const handleOpenApply = (role: RoleDetail) => {
    setSelectedRole(null)
    setApplyModalRole(role)
    setApplyMeta(roleByJobId.get(role.id) ?? { roleId: role.id, companyId: '', companyName: 'Company' })
  }

  return (
    <div className="opportunities-page">
      <Header />
      {selectedRole && (
        <JobDetailModal
          role={selectedRole}
          application={getApplication(selectedRole.id)}
          onClose={() => setSelectedRole(null)}
          onNext={handleOpenApply}
          onViewApplication={(app) => { setSelectedRole(null); setViewingApplication(app) }}
        />
      )}
      {applyModalRole && applyMeta && (
        <ApplyJobModal
          companyId={applyMeta.companyId}
          roleId={applyMeta.roleId}
          jobTitle={applyModalRole.title}
          onClose={() => { setApplyModalRole(null); setApplyMeta(null) }}
          onSuccess={(roleId, formData) => {
            if (formData) saveApplication(roleId, applyMeta.companyName, formData as Record<string, unknown>)
          }}
          submissionDisabled={!applyMeta.roleId.match(/^[a-f0-9]{24}$/i) ? 'Connect the backend to submit an application.' : undefined}
        />
      )}
      {viewingApplication && (
        <ApplicationDetailModal
          application={viewingApplication}
          onClose={() => setViewingApplication(null)}
          readonly
        />
      )}
      <main id="main" className="opportunities-main" tabIndex={-1}>
        <div className="trending-badge">Trending Opportunities</div>
        <h1 className="page-title">Available Roles</h1>

        {loading && <p className="opportunities-loading">Loading roles…</p>}

        {!loading && jobs.length === 0 && (
          <p className="opportunities-empty">No roles available at the moment.</p>
        )}

        {!loading && jobs.length > 0 && (
          <div className="jobs-grid">
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onApplyClick={handleApplyClick}
                isApplied={!!getApplication(job.id)}
              />
            ))}
          </div>
        )}

        <Link to="/browse-jobs" className="view-more-button">
          View More Roles <ArrowRight className="arrow-icon" size={20} />
        </Link>
      </main>
      <Footer />
    </div>
  )
}

export default Opportunities
