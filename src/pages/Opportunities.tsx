import Header from '../components/Header'
import JobCard, { Job } from '../components/JobCard'
import { ArrowRight } from 'lucide-react'

const Opportunities = () => {
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

  return (
    <div className="opportunities-page">
      <Header />
      <main className="opportunities-main">
        <div className="trending-badge">Trending Opportunities</div>
        <h1 className="page-title">Available Roles</h1>
        
        <div className="jobs-grid">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
        
        <button className="view-more-button">
          View More Roles <ArrowRight className="arrow-icon" size={20} />
        </button>
      </main>
    </div>
  )
}

export default Opportunities
