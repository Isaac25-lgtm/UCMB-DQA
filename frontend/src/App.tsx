import { BrowserRouter, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom'
import NewDqaSessionPage from './pages/NewDqaSessionPage'
import SessionDetailPage from './pages/SessionDetailPage'
import ManagerDashboardPage from './pages/ManagerDashboardPage'
import LoginPage from './pages/LoginPage'

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

function AppContent() {
  const location = useLocation()
  const showNavbar = location.pathname !== '/login'

  return (
    <div className="min-h-screen bg-gray-50">
      {showNavbar && <Navbar />}
      <div className={showNavbar ? "container mx-auto px-4 py-8" : ""}>
        <Routes>
          <Route path="/" element={<ManagerDashboardPage />} />
          <Route path="/new-session" element={<NewDqaSessionPage />} />
          <Route path="/session/:id" element={<SessionDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <ManagerDashboardPage />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
    </div>
  )
}

function ProtectedRoute({ children }: { children: React.ReactElement }) {
  const isAuthenticated = localStorage.getItem('manager_authenticated') === 'true'
  
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: { pathname: '/dashboard' } }} replace />
  }
  
  return children
}

function Navbar() {
  const isAuthenticated = localStorage.getItem('manager_authenticated') === 'true'

  const handleLogout = () => {
    localStorage.removeItem('manager_authenticated')
    window.location.href = '/new-session'
  }

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/new-session" className="text-xl font-bold">
              DQA Tool - MNH
            </Link>
            <Link to="/new-session" className="hover:text-blue-200 transition">
              New DQA Session
            </Link>
            <Link to="/dashboard" className="hover:text-blue-200 transition">
              Manager Dashboard
            </Link>
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="hover:text-blue-200 transition"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default App

