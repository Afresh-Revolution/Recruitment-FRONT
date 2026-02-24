import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Home from './pages/Home'
import ChooseUs from './pages/ChooseUs'
import Opportunities from './pages/Opportunities'
import BrowseJobs from './pages/BrowseJobs'
import AfreshRoles from './pages/AfreshRoles'
import CbrillianceRoles from './pages/CbrillianceRoles'
import Admin from './pages/Admin'
import NotFound from './pages/NotFound'
import ErrorBoundary from './components/ErrorBoundary'

const PAGE_TITLES: Record<string, string> = {
  '/': 'Home | Jobfinix',
  '/chooseus': 'Choose Us | Jobfinix',
  '/browse-jobs': 'Browse Jobs | Jobfinix',
  '/afresh-roles': 'AfrESH Roles | Jobfinix',
  '/cbrilliance-roles': 'Cbrilliance Roles | Jobfinix',
  '/opportunities': 'Opportunities | Jobfinix',
  '/admin': 'Admin | Jobfinix',
}

function DocumentTitle() {
  const { pathname } = useLocation()
  useEffect(() => {
    document.title = PAGE_TITLES[pathname] ?? 'Jobfinix'
  }, [pathname])
  return null
}

function AppRoutes() {
  return (
    <>
      <DocumentTitle />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chooseus" element={<ChooseUs />} />
        <Route path="/browse-jobs" element={<BrowseJobs />} />
        <Route path="/afresh-roles" element={<AfreshRoles />} />
        <Route path="/cbrilliance-roles" element={<CbrillianceRoles />} />
        <Route path="/opportunities" element={<Opportunities />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}

const basename = (import.meta.env.BASE_URL ?? '/').replace(/\/$/, '') || ''

function App() {
  return (
    <BrowserRouter basename={basename}>
      <ErrorBoundary>
        <AppRoutes />
      </ErrorBoundary>
    </BrowserRouter>
  )
}

export default App

