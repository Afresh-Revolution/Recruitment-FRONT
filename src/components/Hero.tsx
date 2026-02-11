import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Zap } from 'lucide-react'
import { getHero } from '../api/hero'
import type { HeroData } from '../api/types'

const DEFAULT_HERO: HeroData = {
  headline: {
    main: 'Accelerate your growth with ',
    highlight: 'top talent',
    highlightIcon: '⚡',
  },
  description:
    'Join a network where companies, startups, and entrepreneurs support each other by sharing and engaging with verified talent — automatically.',
  cta: { text: 'Apply Now', link: '/browse-jobs' },
  features: [
    { label: 'Smart Matching', icon: '+', highlighted: true },
    { label: 'Analytics', icon: null, highlighted: false },
    { label: 'Global Reach', icon: null, highlighted: true },
    { label: 'Collaboration', icon: null, highlighted: false },
    { label: 'Skill Verification', icon: null, highlighted: false },
  ],
}

const Hero = () => {
  const [hero, setHero] = useState<HeroData | null>(null)

  useEffect(() => {
    let cancelled = false
    getHero().then((data) => {
      if (!cancelled) setHero(data)
    })
    return () => { cancelled = true }
  }, [])

  const h = hero ?? DEFAULT_HERO
  const headline = h.headline ?? DEFAULT_HERO.headline!
  const description = h.description ?? DEFAULT_HERO.description
  const cta = h.cta ?? DEFAULT_HERO.cta!
  const features = h.features ?? DEFAULT_HERO.features!
  const panels = h.panels

  const isInternalLink = cta?.link?.startsWith('/')

  return (
    <section className="hero-section">
      <div className="hero-container">
        <div className="hero-left">
          <h1 className="hero-title">
            {headline?.main}
            <span className="highlight-orange">{headline?.highlight}</span>
            {(headline?.highlightIcon ?? '⚡') && (
              <span className="hero-title-icon" aria-hidden>
                <Zap size={22} strokeWidth={2.5} />
              </span>
            )}
          </h1>
          <p className="hero-description">{description}</p>
          {cta && (
            isInternalLink ? (
              <Link to={cta.link} className="hero-cta">
                {cta.text}
              </Link>
            ) : (
              <a href={cta.link} className="hero-cta" target="_blank" rel="noopener noreferrer">
                {cta.text}
              </a>
            )
          )}
          <div className="hero-features">
            {features?.flatMap((f, i) => [
              i > 0 ? (
                <span key={`plus-${i}`} className="feature-tag-plus" aria-hidden>
                  <Plus size={14} strokeWidth={2.5} />
                </span>
              ) : null,
              <span key={i} className={`feature-tag ${f.highlighted ? 'highlight-green' : ''}`}>
                {f.label}
              </span>,
            ].filter(Boolean))}
          </div>
        </div>
        <div className="hero-right">
          <div className="hero-grid">
            <div className="hero-grid-col-left">
              <div className="hero-card laptop-card">
                <div className="card-image-placeholder">
                  {panels?.topLeft?.imageUrl ? (
                    <img src={panels.topLeft.imageUrl} alt={panels.topLeft.alt ?? ''} />
                  ) : (
                    <p>Laptop with code image</p>
                  )}
                </div>
              </div>
              <div className="hero-card person-card">
                <div className="card-image-placeholder">
                  {panels?.bottomRight?.imageUrl ? (
                    <img src={panels.bottomRight.imageUrl} alt={panels.bottomRight.alt ?? ''} />
                  ) : (
                    <p>Person with laptop and stickers image</p>
                  )}
                </div>
              </div>
            </div>
            <div className="hero-grid-col-right">
              <div className="hero-card purple-card">
                <div className="card-header">
                  <span className="card-label">{panels?.topRight?.label ?? 'New Hires'}</span>
                  <span className="card-value">{panels?.topRight?.count ?? '+1424'}</span>
                </div>
                <div
                  className="card-image-placeholder"
                  style={panels?.topRight?.backgroundImage ? { backgroundImage: `url(${panels.topRight.backgroundImage})`, backgroundSize: 'cover' } : undefined}
                >
                  {!panels?.topRight?.backgroundImage && <p>Person with laptop image</p>}
                </div>
                <div className="card-footer">
                  <span>{(panels?.topRight?.monthLabels ?? ['Ap', 'My', 'Ju', 'Jl', 'Au', 'Se']).join(' ')}</span>
                </div>
              </div>
              <div className="hero-card hero-card-fourth">
                <div className="card-image-placeholder">
                  {panels?.bottomLeft?.backgroundImage ? (
                    <img src={panels.bottomLeft.backgroundImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <p>Team / collaboration image</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
