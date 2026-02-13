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
  '/': 'Home | C.A.G.E',
  '/chooseus': 'Choose Us | C.A.G.E',
  '/browse-jobs': 'Browse Jobs | C.A.G.E',
  '/afresh-roles': 'AfrESH Roles | C.A.G.E',
  '/cbrilliance-roles': 'Cbrilliance Roles | C.A.G.E',
  '/opportunities': 'Opportunities | C.A.G.E',
  '/admin': 'Admin | C.A.G.E',
}

function DocumentTitle() {
  const { pathname } = useLocation()
  useEffect(() => {
    document.title = PAGE_TITLES[pathname] ?? 'C.A.G.E'
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

function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AppRoutes />
      </ErrorBoundary>
    </BrowserRouter>
  )
}

export default App

