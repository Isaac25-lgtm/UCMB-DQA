import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import NewDqaSessionPage from './pages/NewDqaSessionPage'
import SessionDetailPage from './pages/SessionDetailPage'
import ManagerDashboardPage from './pages/ManagerDashboardPage'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<ManagerDashboardPage />} />
            <Route path="/new-session" element={<NewDqaSessionPage />} />
            <Route path="/session/:id" element={<SessionDetailPage />} />
            <Route path="/dashboard" element={<ManagerDashboardPage />} />
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
            <Link to="/" className="text-xl font-bold">
              DQA Tool - MNH
            </Link>
            <Link to="/new-session" className="hover:text-blue-200 transition">
              New DQA Session
            </Link>
            <Link to="/dashboard" className="hover:text-blue-200 transition">
              Manager Dashboard
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default App

