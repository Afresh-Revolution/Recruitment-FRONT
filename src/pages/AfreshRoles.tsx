import { Link } from 'react-router-dom'
import { Briefcase, MapPin, Clock } from 'lucide-react'
import Header from '../components/Header'

export interface RoleListing {
  id: string
  title: string
  department: string
  jobType: string
  location: string
  deadline: string
}

const AFRESH_ROLES: RoleListing[] = [
  { id: '1', title: 'Senior Frontend Engineer', department: 'Engineering', jobType: 'Full-time', location: 'Remote', deadline: 'Oct 25' },
  { id: '2', title: 'Product Designer', department: 'Design', jobType: 'Full-time', location: 'Hybrid', deadline: 'Oct 30' },
  { id: '3', title: 'DevOps Specialist', department: 'Engineering', jobType: 'Contract', location: 'Remote', deadline: 'Nov 05' },
]

const FILTERS = ['All', 'Engineering', 'Design', 'Product', 'Marketing']

const AfreshRoles = () => {
  return (
    <div className="roles-page">
      <Header />
      <main className="roles-main">
        <Link to="/browse-jobs" className="roles-back-link">
          ← Back to Companies
        </Link>
        <h1 className="roles-title">AfrESH Roles</h1>
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
                className={`roles-filter-btn ${filter === 'All' ? 'roles-filter-btn--active' : ''}`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <ul className="roles-list">
          {AFRESH_ROLES.map((role) => (
            <li key={role.id} className="roles-card">
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
              <button type="button" className="roles-apply-btn">
                Apply Now
              </button>
            </li>
          ))}
        </ul>
      </main>
    </div>
  )
}

export default AfreshRoles
