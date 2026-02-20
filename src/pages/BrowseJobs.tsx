import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Briefcase, ArrowRight } from 'lucide-react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { getPartners } from '../api/partners'
import { getRoles } from '../api/roles'
import { getCompanyObjectId } from '../api/destination'
import type { PartnerCompany } from '../api/types'
import { getImagePath } from '../lib/assets'

const cbrillianceLogo = getImagePath('image/cbrilliance.png')
const afrLogo = getImagePath('image/Afr-Logo.jpg')

const BrowseJobs = () => {
  const [partners, setPartners] = useState<PartnerCompany[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  /** Actual role count per partner id (from roles API); used so "X Open Roles" matches backend. */
  const [openRoleCounts, setOpenRoleCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    getPartners()
      .then((data) => {
        if (!cancelled) setPartners(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load partners')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  // Fetch actual role count per partner so "X Open Roles" matches what the roles page shows
  useEffect(() => {
    if (partners.length === 0) return
    let cancelled = false
    partners.forEach((partner) => {
      getCompanyObjectId(partner.id)
        .then((companyId) => getRoles(companyId ?? partner.id))
        .then((roles) => {
          if (!cancelled) {
            setOpenRoleCounts((prev) => ({ ...prev, [partner.id]: roles.length }))
          }
        })
        .catch(() => {})
    })
    return () => { cancelled = true }
  }, [partners])

  const getLogoUrl = (partner: PartnerCompany) => {
    if (partner.id === 'cbrilliance') return cbrillianceLogo
    if (partner.id === 'afresh') return afrLogo
    return partner.logo
  }

  return (
    <div className="browse-jobs-page">
      <Header />
      <main id="main" className="browse-jobs-main" tabIndex={-1}>
        <div className="browse-jobs-bg-glow browse-jobs-bg-glow-1" aria-hidden />
        <div className="browse-jobs-bg-glow browse-jobs-bg-glow-2" aria-hidden />
        <div className="browse-jobs-bg-glow browse-jobs-bg-glow-3" aria-hidden />

        <h1 className="browse-jobs-title">Choose Your Destination</h1>
        <p className="browse-jobs-subtitle">
          Select a partner company to view their open positions. Each offers unique challenges and world-class environments.
        </p>

        {error && (
          <p className="browse-jobs-error" role="alert">
            {error}
          </p>
        )}

        {loading ? (
          <p className="browse-jobs-loading">Loading…</p>
        ) : partners.length === 0 ? (
          <p className="browse-jobs-empty">No partner companies available right now.</p>
        ) : (
          <div className="browse-jobs-cards">
            {partners.map((partner) => {
              const logoUrl = getLogoUrl(partner)
              return (
                <div key={partner.id} className="browse-jobs-card">
                  <span className="browse-jobs-partner-badge">
                    <Briefcase size={12} />
                    Partner
                  </span>
                  <div className={`browse-jobs-card-top-half ${partner.id === 'cbrilliance' ? 'browse-jobs-card-top-half--cbrilliance' : 'browse-jobs-card-top-half--afresh'}`}>
                    {logoUrl ? (
                      <>
                        <div className="browse-jobs-card-big-image browse-jobs-card-big-image--img">
                          <img src={logoUrl} alt="" className="browse-jobs-card-logo browse-jobs-card-big-image-logo" aria-hidden />
                        </div>
                        <div className="browse-jobs-card-small-image">
                          <img src={logoUrl} alt={partner.name} className="browse-jobs-card-logo" />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="browse-jobs-card-big-image browse-jobs-card-big-image--afr">
                          <div className="browse-jobs-afr-large-wrap">
                            <span className="browse-jobs-logo-afr">afr®</span>
                          </div>
                        </div>
                        <div className="browse-jobs-card-small-image browse-jobs-card-small-image--white">
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
                      <span className="browse-jobs-positions-label">Available Position</span>
                      <span className="browse-jobs-positions-count">
                        <span className="browse-jobs-dot" /> {openRoleCounts[partner.id] ?? partner.openRoles} Open Roles
                      </span>
                    </div>
                    <Link
                      to={partner.selectLink ?? (partner.id === 'afresh' ? '/afresh-roles' : partner.id === 'cbrilliance' ? '/cbrilliance-roles' : '/opportunities')}
                      className="browse-jobs-select-btn"
                      state={{ companyId: partner.id }}
                    >
                      Select <ArrowRight size={18} />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}

export default BrowseJobs
