import { Zap } from 'lucide-react'

const Hero = () => {
  return (
    <section className="hero-section">
      <div className="hero-container">
        <div className="hero-left">
          <h1 className="hero-title">
            Accelerate<br />
            your growth<br />
            with <span className="highlight-orange">top</span><br />
            <span className="highlight-orange">
              talent
              <Zap className="lightning-icon" size={24} />
            </span>
          </h1>
          <p className="hero-description">
            Join a network where companies, startups, and entrepreneurs support
            each other by sharing and engaging with verified talent — automatically.
          </p>
          <button className="hero-cta">Apply Now</button>
          <div className="hero-features">
            <span className="feature-tag">Smart Matching</span>
            <span className="feature-tag">Analytics</span>
            <span className="feature-tag highlight-green">Global Reach</span>
            <span className="feature-tag">Collaboration</span>
            <span className="feature-tag">Skill Verification</span>
          </div>
        </div>
        <div className="hero-right">
          <div className="hero-card purple-card">
            <div className="card-header">
              <span className="card-label">New Hires</span>
              <span className="card-value">+1424</span>
            </div>
            <div className="card-image-placeholder">
              <p>Person with laptop image</p>
            </div>
            <div className="card-footer">
              <span>Ap My Ju Jl Au Se</span>
            </div>
          </div>
          <div className="hero-card laptop-card">
            <div className="card-image-placeholder">
              <p>Laptop with code image</p>
            </div>
          </div>
          <div className="hero-card person-card">
            <div className="card-image-placeholder">
              <p>Person with laptop and stickers image</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero

