import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import JobCard, { Job } from './JobCard'
import JobDetailModal from './JobDetailModal'
import ApplyJobModal from './ApplyJobModal'
import { getRoles, AFRESH_COMPANY_OBJECT_ID } from '../api/roles'
import type { RoleDetail } from '../api/types'
import { ArrowRight } from 'lucide-react'
import { getImagePath } from '../lib/assets'

const afrLogo = getImagePath('image/Afr-Logo.jpg')

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

const Opportunities = () => {
  const [roles, setRoles] = useState<RoleDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRole, setSelectedRole] = useState<RoleDetail | null>(null)
  const [applyModalRole, setApplyModalRole] = useState<RoleDetail | null>(null)
  const [applyMeta, setApplyMeta] = useState<{ companyId: string; roleId: string } | null>(null)

  useEffect(() => {
    getRoles(AFRESH_COMPANY_OBJECT_ID)
      .then((data) => setRoles((data ?? []).filter((r) => r.isActive !== false)))
      .finally(() => setLoading(false))
  }, [])

  const jobs = useMemo(() => roles.map(mapRoleToJob), [roles])

  const handleApplyClick = (job: Job) => {
    const role = roles.find((r) => r.id === job.id) ?? null
    if (role) {
      setSelectedRole(role)
      setApplyMeta({ roleId: role.id, companyId: AFRESH_COMPANY_OBJECT_ID })
    }
  }

  const handleOpenApply = (role: RoleDetail) => {
    setSelectedRole(null)
    setApplyModalRole(role)
    setApplyMeta({ roleId: role.id, companyId: AFRESH_COMPANY_OBJECT_ID })
  }

  return (
    <section className="opportunities-section">
      {selectedRole && (
        <JobDetailModal
          role={selectedRole}
          onClose={() => setSelectedRole(null)}
          onNext={handleOpenApply}
        />
      )}
      {applyModalRole && applyMeta && (
        <ApplyJobModal
          companyId={applyMeta.companyId}
          roleId={applyMeta.roleId}
          jobTitle={applyModalRole.title}
          onClose={() => { setApplyModalRole(null); setApplyMeta(null) }}
        />
      )}
      <div className="trending-badge">Trending Opportunities</div>
      <h2 className="section-title">Available Roles</h2>

      {loading ? (
        <p className="opportunities-empty">Loading roles…</p>
      ) : (
        <div className="jobs-grid">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} onApplyClick={handleApplyClick} />
          ))}
        </div>
      )}

      <Link to="/browse-jobs" className="view-more-button">
        View More Roles <ArrowRight className="arrow-icon" size={20} />
      </Link>
    </section>
  )
}

export default Opportunities
