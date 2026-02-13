import { useEffect, useState } from 'react'
import { Check } from 'lucide-react'
import { getImagePath } from '../lib/assets'
import { getWhyChooseUs } from '../api/whychooseus'

const darkproject = getImagePath('image/Darkprojrct.jpg')
const filmconvert = getImagePath('image/filmconvert.jpg')

const DEFAULT_FEATURES = [
  'Escrow system for secure payments',
  'Verified talent with proven track record',
  'Dedicated support team 24/7',
  'Smart matching algorithm',
]

const WhyChooseUs = () => {
  const [headline, setHeadline] = useState("Join World's Best Marketplace for developers")
  const [description, setDescription] = useState(
    'We help you to find the best jobs and developers for your needs. Secure payments, verified talent, and dedicated support.'
  )
  const [features, setFeatures] = useState<string[]>(DEFAULT_FEATURES)
  const [rating, setRating] = useState({ score: 4.9, label: 'User Rating' })
  const [previewImages, setPreviewImages] = useState<string[]>([])

  useEffect(() => {
    getWhyChooseUs().then((data) => {
      if (data?.headline) setHeadline(data.headline)
      if (data?.description) setDescription(data.description)
      if (data?.features?.length) setFeatures(data.features)
      if (data?.rating) setRating(data.rating)
      if (data?.previewImages?.length) setPreviewImages(data.previewImages)
    })
  }, [])

  const leftImage = previewImages[0] ?? darkproject
  const rightImage = previewImages[1] ?? filmconvert

  return (
    <section className="whychooseus-section">
      <div className="whychooseus-container">
        <div className="whychooseus-left">
          <div className="subtitle">Why Choose Us</div>
          <h2 className="whychooseus-title">{headline}</h2>
          <p className="whychooseus-description">{description}</p>
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
                <img src={leftImage} alt="Keyboard" className="keyboard-image" />
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
                <div className="rating-score">{rating.score}/5</div>
                <div className="rating-label">{rating.label}</div>
              </div>
              <div className="ui-image-wrapper">
                <img src={rightImage} alt="UI Dashboard" className="ui-image" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default WhyChooseUs
