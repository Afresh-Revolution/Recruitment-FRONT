import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { getImagePath } from '../lib/assets'
import { getGallery } from '../api/gallery'

const whitelady = getImagePath('image/whitelady.jpg')
const group = getImagePath('image/group.jpg')
const selfie = getImagePath('image/selfie.jpg')
const blacknative = getImagePath('image/blacknative.jpg')
const scaladev = getImagePath('image/scaladev.jpg')
const filmconvert = getImagePath('image/filmconvert.jpg')

const DEFAULT_IMAGES = [
  { id: 1, src: whitelady, alt: 'Woman at desk with laptop' },
  { id: 2, src: group, alt: 'Group collaboration' },
  { id: 3, src: selfie, alt: 'Team member taking selfie' },
  { id: 4, src: blacknative, alt: 'Team member' },
  { id: 5, src: scaladev, alt: 'Developer with laptop' },
  { id: 6, src: filmconvert, alt: 'Team working' },
]

const GAP_REM = 1.25

function getImagesPerView(): number {
  if (typeof window === 'undefined') return 3
  const w = window.innerWidth
  if (w <= 480) return 1
  if (w <= 768) return 2
  return 3
}

function getSlideWidthPercent(perView: number): number {
  return 100 / perView
}

const LifeAtCage = () => {
  const [categoryTag, setCategoryTag] = useState('Life at Cage')
  const [title, setTitle] = useState('Our Gallery')
  const [subtitle, setSubtitle] = useState('A glimpse into our community and culture.')
  const [images, setImages] = useState<Array<{ id: number; src: string; alt: string }>>(DEFAULT_IMAGES)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [transitionEnabled, setTransitionEnabled] = useState(true)
  const [imagesPerView, setImagesPerView] = useState(getImagesPerView)

  useEffect(() => {
    const onResize = () => setImagesPerView(getImagesPerView())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    getGallery().then((data) => {
      if (data?.categoryTag) setCategoryTag(data.categoryTag)
      if (data?.title) setTitle(data.title)
      if (data?.subtitle) setSubtitle(data.subtitle)
      if (data?.images?.length) {
        setImages(
          data.images
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
            .map((img, i) => ({
              id: i + 1,
              src: img.url,
              alt: img.alt ?? '',
            }))
        )
      }
    })
  }, [])

  const slides = useMemo(() => {
    if (images.length < imagesPerView) return images
    const cloneCount = imagesPerView
    return [...images, ...images.slice(0, cloneCount)]
  }, [images, imagesPerView])
  const maxIndex = Math.max(0, images.length - imagesPerView)
  const dotCount = Math.min(6, images.length) || 6
  const slideWidthPercent = getSlideWidthPercent(imagesPerView)
  const transformValue = `translateX(calc(-${currentIndex} * (${slideWidthPercent}% + ${GAP_REM}rem)))`

  const advance = useCallback(() => {
    setCurrentIndex((prev) => {
      if (prev >= maxIndex) {
        setTransitionEnabled(false)
        return 0
      }
      return prev + 1
    })
  }, [maxIndex])

  useEffect(() => {
    if (!transitionEnabled) {
      const raf = requestAnimationFrame(() => setTransitionEnabled(true))
      return () => cancelAnimationFrame(raf)
    }
  }, [currentIndex, transitionEnabled])

  useEffect(() => {
    if (isPaused) return
    const interval = setInterval(advance, 3000)
    return () => clearInterval(interval)
  }, [isPaused, advance])

  const nextSlide = () => {
    if (currentIndex >= maxIndex) {
      setTransitionEnabled(false)
      setCurrentIndex(0)
    } else {
      setCurrentIndex((prev) => prev + 1)
    }
  }

  const prevSlide = () => {
    if (currentIndex === 0) {
      setTransitionEnabled(false)
      setCurrentIndex(maxIndex)
    } else {
      setCurrentIndex((prev) => prev - 1)
    }
  }

  const displayIndex = currentIndex === maxIndex ? 0 : currentIndex

  return (
    <section className="lifeatcage-section">
      <div className="lifeatcage-container">
        <div className="lifeatcage-badge">{categoryTag}</div>
        <h2 className="lifeatcage-title">{title}</h2>
        <p className="lifeatcage-subtitle">{subtitle}</p>

        <div className="gallery-wrapper">
          <button
            type="button"
            className="gallery-nav-btn prev-btn"
            onClick={prevSlide}
            aria-label="Previous slide"
          >
            <ChevronLeft size={24} />
          </button>

          <div
            className="gallery-carousel"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div
              className="gallery-track"
              style={{
                transform: transformValue,
                transition: transitionEnabled ? 'transform 0.6s ease' : 'none',
              }}
            >
              {slides.map((image, i) => (
                <div key={i < images.length ? image.id : `clone-${i}`} className="gallery-slide">
                  <img src={image.src} alt={image.alt} className="gallery-image" />
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            className="gallery-nav-btn next-btn"
            onClick={nextSlide}
            aria-label="Next slide"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        <div className="gallery-dots">
          {Array.from({ length: dotCount }).map((_, index) => (
            <button
              key={index}
              type="button"
              className={`gallery-dot ${displayIndex === index ? 'active' : ''}`}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default LifeAtCage
