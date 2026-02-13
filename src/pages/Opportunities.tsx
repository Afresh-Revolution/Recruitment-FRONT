import { useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import JobCard, { Job } from '../components/JobCard'
import JobDetailModal, { type RoleDetail } from '../components/JobDetailModal'
import ApplyJobModal from '../components/ApplyJobModal'
import { ArrowRight } from 'lucide-react'

const OPPORTUNITY_ROLE_DETAILS: RoleDetail[] = [
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
]

const Opportunities = () => {
  const [selectedRole, setSelectedRole] = useState<RoleDetail | null>(null)
  const [applyModalRole, setApplyModalRole] = useState<RoleDetail | null>(null)

  const jobs: Job[] = [
    {
      id: '1',
      company: 'Cbrilliance',
      location: 'Remote',
      jobType: 'Full-time',
      title: 'Senior Frontend Engineer',
      department: 'Engineering',
      deadline: 'Oct 25',
      isFeatured: true,
    },
    {
      id: '2',
      company: 'Cbrilliance',
      location: 'Hybrid',
      jobType: 'Full-time',
      title: 'Product Designer',
      department: 'Design',
      deadline: 'Oct 30',
    },
    {
      id: '3',
      company: 'Cbrilliance',
      location: 'Remote',
      jobType: 'Contract',
      title: 'DevOps Specialist',
      department: 'Engineering',
      deadline: 'Nov 05',
    },
  ]

  const handleApplyClick = (job: Job) => {
    const role = OPPORTUNITY_ROLE_DETAILS.find((r) => r.id === job.id)
    if (role) setSelectedRole(role)
  }

  return (
    <div className="opportunities-page">
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
          companyId="cbrilliance"
          roleId={applyModalRole.id}
          jobTitle={applyModalRole.title}
          onClose={() => setApplyModalRole(null)}
          submissionDisabled={!applyModalRole.id.match(/^[a-f0-9]{24}$/i) ? 'Connect the backend and use roles from Cbrilliance or Afresh to submit an application.' : undefined}
        />
      )}
      <main id="main" className="opportunities-main" tabIndex={-1}>
        <div className="trending-badge">Trending Opportunities</div>
        <h1 className="page-title">Available Roles</h1>
        
        <div className="jobs-grid">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} onApplyClick={handleApplyClick} />
          ))}
        </div>
        
        <Link to="/browse-jobs" className="view-more-button">
          View More Roles <ArrowRight className="arrow-icon" size={20} />
        </Link>
      </main>
      <Footer />
    </div>
  )
}

export default Opportunities
