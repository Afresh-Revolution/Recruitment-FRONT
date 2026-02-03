import { Link, useLocation } from 'react-router-dom'
import { Sparkles } from 'lucide-react'

const Header = () => {
  const location = useLocation()

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <Sparkles className="logo-icon" />
          <span className="logo-text">C.A.G.E</span>
        </div>
        <nav className="nav">
          <Link
            to="/"
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            Home
          </Link>
          <Link
            to="/browse-jobs"
            className={`nav-link ${location.pathname === '/browse-jobs' ? 'active' : ''}`}
          >
            Browse Jobs
          </Link>
        </nav>
      </div>
    </header>
  )
}

export default Header

