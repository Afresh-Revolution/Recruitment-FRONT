import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import JobCard, { Job } from '../components/JobCard'
import JobDetailModal from '../components/JobDetailModal'
import ApplyJobModal from '../components/ApplyJobModal'
import ApplicationDetailModal from '../components/ApplicationDetailModal'
import { ArrowRight } from 'lucide-react'
import { getRoles, AFRESH_COMPANY_OBJECT_ID } from '../api/roles'
import type { RoleDetail } from '../api/types'
import type { ApplicationDetail } from '../components/ApplicationDetailModal'
import { getImagePath } from '../lib/assets'

const afrLogo = getImagePath('image/Afr-Logo.jpg')


// ── mapping helpers ──────────────────────────────────────────────────────────
function mapRoleToJob(r: RoleDetail): Job {
  return {
    id: r.id,
    company: 'AfrESH',
    companyLogo: afrLogo,
    location: r.location ?? 'Remote',
    jobType: (r.jobType as Job['jobType']) ?? 'Full-time',
    title: r.title,
    department: r.department ?? '',
    deadline: r.deadline ?? '',
    isFeatured: false,
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
  const [roles, setRoles] = useState<RoleDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRole, setSelectedRole] = useState<RoleDetail | null>(null)
  const [applyModalRole, setApplyModalRole] = useState<RoleDetail | null>(null)
  const [applyMeta, setApplyMeta] = useState<{ companyId: string; companyName: string; roleId: string } | null>(null)
  const [viewingApplication, setViewingApplication] = useState<ApplicationDetail | null>(null)

  useEffect(() => {
    getRoles(AFRESH_COMPANY_OBJECT_ID)
      .then((data) => setRoles((data ?? []).filter((r) => r.isActive !== false)))
      .finally(() => setLoading(false))
  }, [])

  const jobs = useMemo(() => roles.map(mapRoleToJob), [roles])

  const handleApplyClick = (job: Job) => {
    const existing = getApplication(job.id)
    if (existing) {
      setViewingApplication(existing)
      return
    }
    const role = roles.find((r) => r.id === job.id) ?? null
    if (role) {
      setSelectedRole(role)
      setApplyMeta({ roleId: role.id, companyId: AFRESH_COMPANY_OBJECT_ID, companyName: 'AfrESH' })
    }
  }

  const handleOpenApply = (role: RoleDetail) => {
    setSelectedRole(null)
    setApplyModalRole(role)
    setApplyMeta({ roleId: role.id, companyId: AFRESH_COMPANY_OBJECT_ID, companyName: 'AfrESH' })
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

        {loading ? (
          <p className="opportunities-loading">Loading roles…</p>
        ) : (
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
