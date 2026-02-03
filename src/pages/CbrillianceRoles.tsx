import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Briefcase, MapPin, Clock } from 'lucide-react'
import Header from '../components/Header'
import JobDetailModal, { type RoleDetail } from '../components/JobDetailModal'
import ApplyJobModal from '../components/ApplyJobModal'

const CBRILLIANCE_ROLES: RoleDetail[] = [
  {
    id: '1',
    title: 'Senior Frontend Engineer',
    department: 'Engineering',
    jobType: 'Full-time',
    location: 'Remote',
    deadline: 'Oct 25',
    description: 'Build and maintain high-performance web applications for cloud infrastructure. You will work with modern frameworks, design systems, and collaborate with backend and design teams to deliver exceptional user experiences.',
    requirements: [
      '5+ years of experience with React, TypeScript, or similar',
      'Strong understanding of responsive design and accessibility',
      'Experience with cloud platforms and distributed systems',
      'Excellent problem-solving and code review skills',
    ],
    qualificationsIntro: 'Ideal for engineers passionate about cloud-scale frontend.',
    qualifications: [
      'BS/MS in Computer Science or equivalent experience',
      'Portfolio of production React applications',
      'Experience with testing and CI/CD',
    ],
    applicationDeadline: 'Oct 25, 2026',
  },
  { id: '2', title: 'Product Designer', department: 'Design', jobType: 'Full-time', location: 'Hybrid', deadline: 'Oct 30' },
  { id: '3', title: 'DevOps Specialist', department: 'Engineering', jobType: 'Contract', location: 'Remote', deadline: 'Nov 05' },
  { id: '4', title: 'UX Researcher', department: 'Design', jobType: 'Full-time', location: 'Remote', deadline: 'Nov 10' },
  { id: '5', title: 'Product Manager', department: 'Product', jobType: 'Full-time', location: 'Hybrid', deadline: 'Nov 12' },
  { id: '6', title: 'Backend Engineer', department: 'Engineering', jobType: 'Full-time', location: 'Remote', deadline: 'Nov 15' },
  { id: '7', title: 'Brand Designer', department: 'Design', jobType: 'Contract', location: 'Remote', deadline: 'Nov 18' },
  { id: '8', title: 'Technical Marketing Lead', department: 'Marketing', jobType: 'Full-time', location: 'Remote', deadline: 'Nov 22' },
]

const FILTERS = ['All', 'Engineering', 'Design', 'Product', 'Marketing']

const CbrillianceRoles = () => {
  const [activeFilter, setActiveFilter] = useState<string>('All')
  const [selectedRole, setSelectedRole] = useState<RoleDetail | null>(null)
  const [applyModalRole, setApplyModalRole] = useState<RoleDetail | null>(null)

  const filteredRoles = useMemo(() => {
    if (activeFilter === 'All') return CBRILLIANCE_ROLES
    return CBRILLIANCE_ROLES.filter((role) => role.department === activeFilter)
  }, [activeFilter])

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
          jobTitle={applyModalRole.title}
          onClose={() => setApplyModalRole(null)}
        />
      )}
      <main className="roles-main">
        <Link to="/browse-jobs" className="roles-back-link">
          ← Back to Companies
        </Link>
        <h1 className="roles-title">Cbrilliance Roles</h1>
        <p className="roles-subtitle">Find your next challenge and apply today.</p>

        <div className="roles-search-row">
          <input
            type="search"
            className="roles-search"
            placeholder="Search for roles..."
            aria-label="Search for roles"
          />
          <div className="roles-filters">
            {FILTERS.map((filter) => (
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
      </main>
    </div>
  )
}

export default CbrillianceRoles
