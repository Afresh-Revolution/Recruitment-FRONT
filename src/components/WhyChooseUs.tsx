import { Check } from 'lucide-react'
import darkproject from '../image/Darkprojrct.jpg'
import filmconvert from '../image/filmconvert.jpg'

const WhyChooseUs = () => {
  const features = [
    'Escrow system for secure payments',
    'Verified talent with proven track record',
    'Dedicated support team 24/7',
    'Smart matching algorithm',
  ]

  return (
    <section className="whychooseus-section">
      <div className="whychooseus-container">
        <div className="whychooseus-left">
          <div className="subtitle">Why Choose Us</div>
          <h2 className="whychooseus-title">
            Join World's Best Marketplace for developers
          </h2>
          <p className="whychooseus-description">
            We help you to find the best jobs and developers for your needs.
            Secure payments, verified talent, and dedicated support.
          </p>
          <ul className="features-list">
            {features.map((feature, index) => (
              <li key={index} className="feature-item">
                <div className="check-icon-wrapper">
                  <Check className="check-icon" size={16} fill="#f97316" strokeWidth={3} />
                </div>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="whychooseus-right">
          <div className="whychooseus-grid">
            <div className="grid-column-left">
              <div className="keyboard-image-wrapper">
                <img src={darkproject} alt="Keyboard" className="keyboard-image" />
              </div>
              <div className="developers-count">
                <div className="avatar-group">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="avatar-placeholder" />
                  ))}
                </div>
                <span className="count-text">10k+ Developers</span>
              </div>
            </div>
            <div className="grid-column-right">
              <div className="rating-card">
                <div className="rating-score">4.9/5</div>
                <div className="rating-label">User Rating</div>
              </div>
              <div className="ui-image-wrapper">
                <img src={filmconvert} alt="UI Dashboard" className="ui-image" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default WhyChooseUs









