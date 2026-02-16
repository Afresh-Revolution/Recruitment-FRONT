import { MapPin, Briefcase, Clock } from 'lucide-react'
import { getImagePath } from '../lib/assets'

const cbrillianceLogo = getImagePath('image/cbrilliance.png')

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
}

const JobCard = ({ job, onApplyClick }: JobCardProps) => {
  const logo = job.companyLogo ?? cbrillianceLogo
  return (
    <div className="job-card">
      <div className="job-card-header">
        <div className="job-company">
          <div className="company-logo-wrapper">
            <img src={logo} alt={job.company} className="company-logo" />
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
      
      <h3 className="job-title">
        {job.title}
      </h3>
      
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
          className="apply-button"
          onClick={(e) => {
            e.stopPropagation()
            onApplyClick?.(job)
          }}
        >
          Apply Now
        </button>
      </div>
    </div>
  )
}

export default JobCard









