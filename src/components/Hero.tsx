import { Link } from 'react-router-dom'
import { getImagePath } from '../lib/assets'

const laptopImg = getImagePath('image/laptop.jpg')
const programmerImg = getImagePath('image/programmer.jpg')
const womenImg = getImagePath('image/women.jpg')
const scalaImg = getImagePath('image/scaladev.jpg')

const Hero = () => {
  return (
    <div className="hero-main-content">
      <div className="hero-section">
        <h1 className="hero-title">
          Accelerate<br />
          your growth<br />
          with <span className="highlight">top talent</span><br />
          <span className="hero-line-icon" aria-hidden>
            <svg className="hero-lightning-icon" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="24" cy="24" r="22" fill="#E8D5F2" />
              <path d="M26 14h-4l-2 10 6-4-2 14 10-18-6 4 2-6z" fill="#6B4C9A" stroke="#5a3d82" strokeWidth="1.2" strokeLinejoin="round" />
            </svg>
          </span>
        </h1>

        <p className="hero-description">
          Join a network where companies, startups, and entrepreneurs support each other by sharing and engaging with verified talent — automatically.
        </p>

        <div className="hero-cta-row">
          <Link to="/browse-jobs" className="cta-button">Apply Now</Link>
          <div className="feature-tags">
          <span className="tag">Smart Matching</span>
          <span className="tag">AI</span>
          <span className="tag">Analytics</span>
          <span className="tag plus-icon" aria-hidden>+</span>
          <span className="tag highlight-tag">Global Reach</span>
          <span className="tag">Collaboration</span>
          <span className="tag plus-icon" aria-hidden>+</span>
          <span className="tag">Skill Verification</span>
          <span className="tag plus-icon" aria-hidden>+</span>
          </div>
        </div>
      </div>

      <div className="cards-section">
        <div className="card card-hero-img">
          <div className="card-bg" style={{ backgroundImage: `url(${laptopImg})` }} />
        </div>

        <div className="card card-laptop card-new-hires">
          <div className="card-bg" style={{ backgroundImage: `url(${programmerImg})` }} />
          <div className="card-header">
            <span className="card-label">New Hires</span>
            <span className="card-count">+1424</span>
          </div>
          <div className="week-indicator">
            <span className="day">Mo</span>
            <span className="day">Tu</span>
            <span className="day">We</span>
            <span className="day">Th</span>
            <span className="day">Fr</span>
            <span className="day">Sa</span>
            <span className="day">Su</span>
          </div>
        </div>

        <div className="card card-shine">
          <div className="card-bg" style={{ backgroundImage: `url(${womenImg})` }} />
          <div className="profile-icons">
            <div className="profile-icon icon-1">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
                <path d="M10 11C12.2091 11 14 9.20914 14 7C14 4.79086 12.2091 3 10 3C7.79086 3 6 4.79086 6 7C6 9.20914 7.79086 11 10 11Z" fill="currentColor" />
                <path d="M10 13C6.13401 13 3 16.134 3 20H17C17 16.134 13.866 13 10 13Z" fill="currentColor" />
              </svg>
            </div>
            <div className="profile-icon icon-2">+</div>
          </div>
          <div className="connection-circles">
            <div className="circle" aria-hidden />
            <div className="circle" aria-hidden />
            <div className="circle" aria-hidden />
          </div>
          <p className="card-text">Shine together</p>
        </div>

        <div className="card card-person">
          <div className="card-bg" style={{ backgroundImage: `url(${scalaImg})` }} />
        </div>
      </div>
    </div>
  )
}

export default Hero
