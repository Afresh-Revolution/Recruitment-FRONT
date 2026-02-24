import { MapPin, Briefcase, Clock } from 'lucide-react'

export interface Job {
  id: string
  company: string
  companyLogo?: string
  location: string
  jobType: 'Full-time' | 'Part-time' | 'Contract' | 'Internship'
  title: string
  department: string
  deadline: string
  isFeatured?: boolean
}

interface JobCardProps {
  job: Job
  onApplyClick?: (job: Job) => void
  isApplied?: boolean
}

/** Returns up to 2 uppercase initials from a company name */
function getInitials(name: string): string {
  const words = name.trim().split(/\s+/)
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[1][0]).toUpperCase()
}

/** Pick a consistent hue from the company name */
function getAvatarHue(name: string): number {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return Math.abs(hash) % 360
}

const JobCard = ({ job, onApplyClick, isApplied }: JobCardProps) => {
  const hue = getAvatarHue(job.company)

  return (
    <div className="job-card">
      {job.isFeatured && <span className="job-featured-badge">Featured</span>}
      <div className="job-card-header">
        <div className="job-company">
          <div className="company-logo-wrapper">
            {job.companyLogo ? (
              <img src={job.companyLogo} alt={job.company} className="company-logo" />
            ) : (
              <div
                className="company-logo-initials"
                style={{ background: `hsl(${hue},55%,38%)` }}
                aria-label={job.company}
              >
                {getInitials(job.company)}
              </div>
            )}
          </div>
          <div className="company-info">
            <span className="company-name">{job.company}</span>
            <div className="job-location">
              <MapPin className="location-icon" size={14} />
              <span>{job.location}</span>
            </div>
          </div>
        </div>
        <span className="job-type-badge">{job.jobType}</span>
      </div>

      <h3 className="job-title">{job.title}</h3>

      <div className="job-category">
        <Briefcase className="category-icon" size={16} />
        <span>{job.department}</span>
      </div>

      <div className="job-divider"></div>

      <div className="job-card-footer">
        <div className="job-deadline">
          <Clock className="deadline-icon" size={16} />
          <span>Deadline: {job.deadline}</span>
        </div>
        <button
          type="button"
          className={`apply-button ${isApplied ? 'apply-button--view' : ''}`}
          onClick={(e) => {
            e.stopPropagation()
            onApplyClick?.(job)
          }}
        >
          {isApplied ? 'View Application' : 'Apply Now'}
        </button>
      </div>
    </div>
  )
}

export default JobCard
