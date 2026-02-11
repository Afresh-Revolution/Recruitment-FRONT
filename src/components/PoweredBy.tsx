import { useEffect, useState } from 'react'
import afreshLogo from '../image/AfrESH-LOGO.png'
import geniuswavLogo from '../image/GeniusWav-LOGO.png'
import cbrillianceLogo from '../image/cbrilliance-LOGO.png'
import { getPowered } from '../api/powered'

const DEFAULT_LOGOS = [
  { src: cbrillianceLogo, alt: 'CBrilliance', link: undefined as string | undefined },
  { src: afreshLogo, alt: 'AfrESH', link: undefined },
  { src: geniuswavLogo, alt: 'Geniuswav Studioz', link: undefined },
]

const PoweredBy = () => {
  const [partners, setPartners] = useState<Array<{ src: string; alt: string; link?: string }>>(DEFAULT_LOGOS)
  const [title, setTitle] = useState('POWERED BY:')

  useEffect(() => {
    getPowered().then((data) => {
      if (data?.partners?.length) {
        const mapped = data.partners
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
          .map((p) => ({
            src: p.logoUrl || '',
            alt: p.name,
            link: p.link,
          }))
          .filter((p) => p.src)
        if (mapped.length > 0) setPartners(mapped)
      }
      if (data?.title) setTitle(data.title)
    })
  }, [])

  const carouselLogos = [...partners, ...partners, ...partners]

  return (
    <section className="poweredby-section">
      <div className="poweredby-container">
        <p className="poweredby-label">{title}</p>
        <div className="poweredby-carousel-wrap">
          <div className="poweredby-carousel-track" aria-hidden>
            {carouselLogos.map((item, index) =>
              item.link ? (
                <a key={index} href={item.link} target="_blank" rel="noopener noreferrer" className="poweredby-logo-item">
                  <img src={item.src} alt={item.alt} className="poweredby-logo-img" />
                </a>
              ) : (
                <div key={index} className="poweredby-logo-item">
                  <img src={item.src} alt={item.alt} className="poweredby-logo-img" />
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default PoweredBy
