import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="footer-section">
      <div className="footer-container">
        <p className="footer-text">
          <Link to="/admin" className="footer-admin-link" aria-label="Admin">
            ⓒ
          </Link>
          {' 2026 Cage All rights reserved.'}
        </p>
      </div>
    </footer>
  )
}

export default Footer









