import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import ChooseUs from './pages/ChooseUs'
import Opportunities from './pages/Opportunities'
import BrowseJobs from './pages/BrowseJobs'
import AfreshRoles from './pages/AfreshRoles'
import CbrillianceRoles from './pages/CbrillianceRoles'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chooseus" element={<ChooseUs />} />
        <Route path="/browse-jobs" element={<BrowseJobs />} />
        <Route path="/afresh-roles" element={<AfreshRoles />} />
        <Route path="/cbrilliance-roles" element={<CbrillianceRoles />} />
        <Route path="/opportunities" element={<Opportunities />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

