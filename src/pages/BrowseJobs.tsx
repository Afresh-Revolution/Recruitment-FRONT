import { Link } from 'react-router-dom'
import { Briefcase, ArrowRight } from 'lucide-react'
import Header from '../components/Header'
import cbrillianceLogo from '../image/cbrilliance.png'

export interface PartnerCompany {
  id: string
  name: string
  logo: string
  tagline: string
  description: string
  openRoles: number
}

const PARTNERS: PartnerCompany[] = [
  {
    id: 'cbrilliance',
    name: 'Cbrilliance',
    logo: cbrillianceLogo,
    tagline: 'Building the infrastructure for the next generation of cloud',
    description:
      'Building the infrastructure for the next generation of cloud computing. Join us to solve complex distributed systems problems.',
    openRoles: 12,
  },
  {
    id: 'afresh',
    name: 'AfrESH',
    logo: '',
    tagline: 'A digital product studio crafting award-winning experiences',
    description:
      'A digital product studio crafting award-winning experiences for global brands. We value creativity, speed, and precision.',
    openRoles: 8,
  },
]

const BrowseJobs = () => {
  return (
    <div className="browse-jobs-page">
      <Header />
      <main className="browse-jobs-main">
        <div className="browse-jobs-bg-glow browse-jobs-bg-glow-1" aria-hidden />
        <div className="browse-jobs-bg-glow browse-jobs-bg-glow-2" aria-hidden />
        <div className="browse-jobs-bg-glow browse-jobs-bg-glow-3" aria-hidden />

        <h1 className="browse-jobs-title">Choose Your Destination</h1>
        <p className="browse-jobs-subtitle">
          Select a partner company to view their open positions. Each offers unique challenges and world-class environments.
        </p>

        <div className="browse-jobs-cards">
          {PARTNERS.map((partner) => (
            <div key={partner.id} className="browse-jobs-card">
              <span className="browse-jobs-partner-badge">
                <Briefcase size={12} />
                Partner
              </span>
              {/* Top half of container: big image + same image small at bottom-left of this half */}
              <div className={`browse-jobs-card-top-half ${partner.id === 'cbrilliance' ? 'browse-jobs-card-top-half--cbrilliance' : 'browse-jobs-card-top-half--afresh'}`}>
                {partner.logo ? (
                  <>
                    <div className="browse-jobs-card-big-image browse-jobs-card-big-image--img">
                      <img src={partner.logo} alt="" className="browse-jobs-card-logo" aria-hidden />
                    </div>
                    <div className="browse-jobs-card-small-image">
                      <img src={partner.logo} alt={partner.name} className="browse-jobs-card-logo" />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="browse-jobs-card-big-image browse-jobs-card-big-image--afr">
                      <span className="browse-jobs-logo-afr">afr®</span>
                    </div>
                    <div className="browse-jobs-card-small-image">
                      <div className="browse-jobs-card-logo-placeholder browse-jobs-card-logo-placeholder--small">
                        <span className="browse-jobs-logo-afr">afr</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div className="browse-jobs-card-content">
                <h2 className="browse-jobs-card-name">{partner.name}</h2>
                <p className="browse-jobs-card-tagline">{partner.tagline}</p>
                <p className="browse-jobs-card-description">{partner.description}</p>
                <div className="browse-jobs-card-positions">
                  <span className="browse-jobs-positions-label">Available Positions</span>
                  <span className="browse-jobs-positions-count">
                    <span className="browse-jobs-dot" /> {partner.openRoles} Open Roles
                  </span>
                </div>
<Link
                  to={partner.id === 'afresh' ? '/afresh-roles' : partner.id === 'cbrilliance' ? '/cbrilliance-roles' : '/opportunities'}
                  className="browse-jobs-select-btn"
                  state={{ partnerId: partner.id }}
                >
                  Select <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

export default BrowseJobs
