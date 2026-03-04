import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

const isBrowseJobsSection =
  (path: string) =>
    path === '/browse-jobs' || path === '/afresh-roles' || path === '/cbrilliance-roles'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

const Header = () => {
  const location = useLocation()
  const [installPromptEvent, setInstallPromptEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true
    setIsStandalone(standalone)

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      setInstallPromptEvent(event as BeforeInstallPromptEvent)
    }

    const handleAppInstalled = () => {
      setInstallPromptEvent(null)
      setIsStandalone(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!installPromptEvent) return
    await installPromptEvent.prompt()
    await installPromptEvent.userChoice
    setInstallPromptEvent(null)
  }

  return (
    <header className="header">
      <a href="#main" className="skip-link">
        Skip to main content
      </a>
      <div className="header-container">
        <Link to="/" className="logo" aria-label="Jobfinix Home">
          <span className="logo-text">JOBFINIX</span>
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
          {!isStandalone && installPromptEvent && (
            <button type="button" className="nav-install-btn" onClick={handleInstallClick}>
              Install App
            </button>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Header
