import Header from '../components/Header'
import { Check } from 'lucide-react'

const ChooseUs = () => {
  const features = [
    'Escrow system for secure payments',
    'Verified talent with proven track record',
    'Dedicated support team 24/7',
    'Smart matching algorithm',
  ]

  return (
    <div className="chooseus-page">
      <Header />
      <main className="chooseus-main">
        <div className="chooseus-container">
          <div className="chooseus-left">
            <div className="subtitle">Why Choose Us</div>
            <h1 className="chooseus-title">
              Join World's Best Marketplace for developers
            </h1>
            <p className="chooseus-description">
              We help you to find the best jobs and developers for your needs.
              Secure payments, verified talent, and dedicated support.
            </p>
            <ul className="features-list">
              {features.map((feature, index) => (
                <li key={index} className="feature-item">
                  <Check className="check-icon" size={20} />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="chooseus-right">
            <div className="rating-card">
              <div className="rating-score">4.9/5</div>
              <div className="rating-label">User Rating</div>
            </div>
            <div className="image-placeholder keyboard-image">
              <div className="placeholder-content">
                <p>Keyboard Image</p>
              </div>
            </div>
            <div className="developers-count">
              <div className="avatar-group">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="avatar-placeholder" />
                ))}
              </div>
              <span className="count-text">10k+ Developers</span>
            </div>
            <div className="image-placeholder ui-image">
              <div className="placeholder-content">
                <p>UI Dashboard Image</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default ChooseUs









