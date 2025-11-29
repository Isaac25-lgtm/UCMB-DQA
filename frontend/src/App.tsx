import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import NewDqaSessionPage from './pages/NewDqaSessionPage'
import SessionDetailPage from './pages/SessionDetailPage'
import ManagerDashboardPage from './pages/ManagerDashboardPage'
import LoginPage from './pages/LoginPage'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<NewDqaSessionPage />} />
            <Route path="/new-session" element={<NewDqaSessionPage />} />
            <Route path="/session/:id" element={<SessionDetailPage />} />
            <Route path="/dashboard" element={<ManagerDashboardPage />} />
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}

function Navbar() {
  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/new-session" className="text-xl font-bold">
              DQA Tool - MNH
            </Link>
            <div className="flex items-center space-x-3">
              <Link
                to="/new-session"
                className="px-4 py-1.5 rounded-full bg-white text-blue-700 text-sm font-semibold shadow hover:bg-blue-50 hover:text-blue-800 transition"
              >
                New DQA Session
              </Link>
              <Link
                to="/dashboard"
                className="px-4 py-1.5 rounded-full border border-white/80 text-sm font-semibold hover:bg-white hover:text-blue-700 transition"
              >
                UCMB Dashboard
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/login" className="text-sm hover:text-blue-200 transition">
              UCMB Login
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default App

