import { Link, useLocation } from 'react-router-dom'

const isBrowseJobsSection =
  (path: string) =>
    path === '/browse-jobs' || path === '/afresh-roles' || path === '/cbrilliance-roles'

const Header = () => {
  const location = useLocation()

  return (
    <header className="header">
      <a href="#main" className="skip-link">
        Skip to main content
      </a>
      <div className="header-container">
        <Link to="/" className="logo" aria-label="C.A.G.E Home">
          <span className="logo-text">C.A.G.E</span>
        </Link>
        <nav className="nav" aria-label="Main">
          <Link
            to="/"
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            Home
          </Link>
          <Link
            to="/browse-jobs"
            className={`nav-link ${isBrowseJobsSection(location.pathname) ? 'active' : ''}`}
          >
            Browse Jobs
          </Link>
        </nav>
      </div>
    </header>
  )
}

export default Header

