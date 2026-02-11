import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import JobCard, { Job } from './JobCard'
import JobDetailModal from './JobDetailModal'
import ApplyJobModal from './ApplyJobModal'
import { getOpportunities } from '../api/opportunities'
import type { RoleDetail } from '../api/types'
import type { OpportunityRole, OpportunitiesData } from '../api/types'
import { ArrowRight } from 'lucide-react'

function mapRoleToJob(r: OpportunityRole): Job {
  return {
    id: r._id,
    company: r.company?.name ?? 'Company',
    companyLogo: r.company?.logo,
    location: r.location,
    jobType: (r.type as Job['jobType']) ?? 'Full-time',
    title: r.title,
    department: r.department,
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

const Opportunities = () => {
  const [apiData, setApiData] = useState<OpportunitiesData | null>(null)
  const [selectedRole, setSelectedRole] = useState<RoleDetail | null>(null)
  const [applyModalRole, setApplyModalRole] = useState<RoleDetail | null>(null)
  const [applyMeta, setApplyMeta] = useState<{ companyId: string; roleId: string } | null>(null)

  useEffect(() => {
    getOpportunities().then(setApiData)
  }, [])

  const { jobs, roles, roleByJobId } = useMemo(() => {
    if (apiData?.roles?.length) {
      return {
        jobs: apiData.roles.map(mapRoleToJob),
        roles: apiData.roles.map(mapRoleToDetail),
        roleByJobId: new Map(apiData.roles.map((r) => [r._id, { roleId: r._id, companyId: r.companyId ?? '' }])),
      }
    }
    return {
      jobs: DEFAULT_JOBS,
      roles: DEFAULT_ROLES,
      roleByJobId: new Map([['1', { roleId: '1', companyId: 'cbrilliance' }], ['2', { roleId: '2', companyId: 'cbrilliance' }], ['3', { roleId: '3', companyId: 'cbrilliance' }]]),
    }
  }, [apiData])

  const handleApplyClick = (job: Job) => {
    const role = roles.find((r) => r.id === job.id) ?? null
    if (role) {
      setSelectedRole(role)
      setApplyMeta(roleByJobId.get(job.id) ?? null)
    }
  }

  const handleOpenApply = (role: RoleDetail) => {
    setSelectedRole(null)
    setApplyModalRole(role)
    setApplyMeta(roleByJobId.get(role.id) ?? null)
  }

  const viewMore = apiData?.viewMoreButton ?? { text: 'View More Roles', link: '/browse-jobs' }
  const sectionTitle = apiData?.sectionTitle ?? 'Available Roles'
  const trendingLabel = apiData?.trendingLabel ?? 'Trending Opportunities'

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
      <div className="trending-badge">{trendingLabel}</div>
      <h2 className="section-title">{sectionTitle}</h2>

      {jobs.length === 0 ? (
        <p className="opportunities-empty">No roles available at the moment.</p>
      ) : (
      <div className="jobs-grid">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} onApplyClick={handleApplyClick} />
        ))}
      </div>
      )}

      <Link to={viewMore.link} className="view-more-button">
        {viewMore.text} <ArrowRight className="arrow-icon" size={20} />
      </Link>
    </section>
  )
}

export default Opportunities
