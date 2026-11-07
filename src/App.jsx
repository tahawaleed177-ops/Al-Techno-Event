import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Register from './pages/Register'
import Hunt from './pages/Hunt'
import Admin from './pages/Admin'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-emerald-300">
        <Toaster position="top-center" /> 
        
        <Routes>
          <Route path="/" element={<Register />} />
          <Route path="/hunt" element={<Hunt />} />
          <Route path="/AL_TECHNO_TYS" element={<Admin />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App