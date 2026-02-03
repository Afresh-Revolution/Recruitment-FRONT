import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import whitelady from '../image/whitelady.jpg'
import group from '../image/group.jpg'
import selfie from '../image/selfie.jpg'
import blacknative from '../image/blacknative.jpg'
import scaladev from '../image/scaladev.jpg'
import filmconvert from '../image/filmconvert.jpg'

const LifeAtCage = () => {
  const [currentIndex, setCurrentIndex] = useState(0)
  
  const images = [
    { id: 1, src: whitelady, alt: 'Woman at desk with laptop' },
    { id: 2, src: group, alt: 'Group collaboration' },
    { id: 3, src: selfie, alt: 'Team member taking selfie' },
    { id: 4, src: blacknative, alt: 'Team member' },
    { id: 5, src: scaladev, alt: 'Developer with laptop' },
    { id: 6, src: filmconvert, alt: 'Team working' },
  ]

  const imagesPerView = 3
  const maxIndex = Math.max(0, images.length - imagesPerView)

  const nextSlide = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex))
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0))
  }

  const visibleImages = images.slice(currentIndex, currentIndex + imagesPerView)

  return (
    <section className="lifeatcage-section">
      <div className="lifeatcage-container">
        <div className="lifeatcage-badge">Life at Cage</div>
        <h2 className="lifeatcage-title">Our Gallery</h2>
        <p className="lifeatcage-subtitle">A glimpse into our community and culture.</p>
        
        <div className="gallery-wrapper">
          <button 
            className="gallery-nav-btn prev-btn" 
            onClick={prevSlide}
            disabled={currentIndex === 0}
          >
            <ChevronLeft size={24} />
          </button>
          
          <div className="gallery-carousel">
            <div className="gallery-grid">
              {visibleImages.map((image) => (
                <div key={image.id} className="gallery-slide">
                  <img 
                    src={image.src} 
                    alt={image.alt}
                    className="gallery-image"
                  />
                </div>
              ))}
            </div>
          </div>
          
          <button 
            className="gallery-nav-btn next-btn" 
            onClick={nextSlide}
            disabled={currentIndex >= maxIndex}
          >
            <ChevronRight size={24} />
          </button>
        </div>
        
        <div className="gallery-dots">
          {Array.from({ length: 6 }).map((_, index) => {
            const dotIndex = index
            const isActive = Math.floor(currentIndex / imagesPerView) === dotIndex
            return (
              <button
                key={index}
                className={`gallery-dot ${isActive ? 'active' : ''}`}
                onClick={() => {
                  const targetIndex = Math.min(dotIndex * imagesPerView, maxIndex)
                  setCurrentIndex(targetIndex)
                }}
              />
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default LifeAtCage




