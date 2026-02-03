const PoweredBy = () => {
  const partners = [
    { name: 'Brilliance', logo: 'Brilliance' },
    { name: 'AfrESH', logo: 'AfrESH' },
    { name: 'Genius STUDIOZ', logo: 'Genius STUDIOZ' },
  ]

  return (
    <section className="poweredby-section">
      <div className="poweredby-container">
        <p className="poweredby-label">POWERED BY:</p>
        <div className="partners-grid">
          {partners.map((partner, index) => (
            <div key={index} className="partner-logo">
              <div className="logo-placeholder">{partner.logo}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default PoweredBy









