import { Link } from 'react-router-dom'
import Header from '../components/Header'

const NotFound = () => {
  return (
    <div className="not-found-page">
      <Header />
      <main id="main" className="not-found-main" tabIndex={-1}>
        <h1 className="not-found-title">404</h1>
        <p className="not-found-text">Page not found.</p>
        <Link to="/" className="not-found-link">
          Go to Home
        </Link>
      </main>
    </div>
  )
}

export default NotFound
