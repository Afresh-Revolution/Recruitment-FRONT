import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { getImagePath } from '../lib/assets'
import { getGallery } from '../api/gallery'

const afrphoto1 = getImagePath('image/Afrphoto_2026-04-21_12-03-37.jpg')
const afrphoto2 = getImagePath('image/Afrphoto_2026-04-21_12-03-41.jpg')
const afrphoto3 = getImagePath('image/Afrphoto_2026-04-21_12-03-44.jpg')
const afrphoto4 = getImagePath('image/Afrphoto_2026-04-21_12-03-58.jpg')
const afrphoto5 = getImagePath('image/Afrphoto_2026-04-21_12-04-01.jpg')

const DEFAULT_IMAGES = [
  { id: 1, src: afrphoto1, alt: 'Life at Cage 1' },
  { id: 2, src: afrphoto2, alt: 'Life at Cage 2' },
  { id: 3, src: afrphoto3, alt: 'Life at Cage 3' },
  { id: 4, src: afrphoto4, alt: 'Life at Cage 4' },
  { id: 5, src: afrphoto5, alt: 'Life at Cage 5' },
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
  const sectionRef = useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [categoryTag, setCategoryTag] = useState('Life at Jobfinix')
  const [title, setTitle] = useState('Our Gallery')
  const [subtitle, setSubtitle] = useState('A glimpse into our community and culture.')
  const [images, setImages] = useState<Array<{ id: number; src: string; alt: string }>>(DEFAULT_IMAGES)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [transitionEnabled, setTransitionEnabled] = useState(true)
  const [isBouncing, setIsBouncing] = useState(false)
  const [imagesPerView, setImagesPerView] = useState(getImagesPerView)

  // Section reveal via IntersectionObserver
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true) },
      { threshold: 0.12 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

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
    setIsBouncing(true)
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

  useEffect(() => {
    if (!isBouncing) return
    const timeout = window.setTimeout(() => setIsBouncing(false), 520)
    return () => window.clearTimeout(timeout)
  }, [isBouncing])

  const nextSlide = () => {
    setIsBouncing(true)
    if (currentIndex >= maxIndex) {
      setTransitionEnabled(false)
      setCurrentIndex(0)
    } else {
      setCurrentIndex((prev) => prev + 1)
    }
  }

  const prevSlide = () => {
    setIsBouncing(true)
    if (currentIndex === 0) {
      setTransitionEnabled(false)
      setCurrentIndex(maxIndex)
    } else {
      setCurrentIndex((prev) => prev - 1)
    }
  }

  const displayIndex = currentIndex === maxIndex ? 0 : currentIndex

  return (
    <section
      ref={sectionRef}
      className={`lifeatcage-section${isVisible ? ' lifeatcage-section--visible' : ''}`}
    >
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
            className={`gallery-carousel ${isBouncing ? 'gallery-carousel--bounce' : ''}`}
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
                <div
                  key={i < images.length ? image.id : `clone-${i}`}
                  className={`gallery-slide ${i === currentIndex ? 'gallery-slide--focus' : ''}`}
                >
                  <img src={image.src} alt={image.alt} className="gallery-image" />
                </div>
              ))}
            </div>

            {/* Auto-play progress bar — key prop restarts CSS animation on every slide change */}
            {!isPaused && (
              <div className="gallery-progress-wrap">
                <div key={currentIndex} className="gallery-progress-bar" />
              </div>
            )}
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
              onClick={() => {
                setIsBouncing(true)
                setCurrentIndex(index)
              }}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default LifeAtCage
