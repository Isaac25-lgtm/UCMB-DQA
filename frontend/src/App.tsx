import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom'
import NewDqaSessionPage from './pages/NewDqaSessionPage'
import SessionDetailPage from './pages/SessionDetailPage'
import ManagerDashboardPage from './pages/ManagerDashboardPage'
import LoginPage from './pages/LoginPage'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={
            <>
              <Navbar />
              <div className="container mx-auto px-4 py-8">
                <Routes>
                  <Route index element={<Navigate to="/new-session" replace />} />
                  <Route path="new-session" element={<NewDqaSessionPage />} />
                  <Route path="session/:id" element={<SessionDetailPage />} />
                  <Route 
                    path="dashboard" 
                    element={
                      <ProtectedRoute>
                        <ManagerDashboardPage />
                      </ProtectedRoute>
                    } 
                  />
                </Routes>
              </div>
            </>
          } />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

function Navbar() {
  const isAuthenticated = !!localStorage.getItem('auth_token')

  const handleLogout = () => {
    localStorage.removeItem('auth_token')
    window.location.href = '/login'
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
            {isAuthenticated && (
              <>
                <Link to="/dashboard" className="hover:text-blue-200 transition">
                  Manager Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="hover:text-blue-200 transition"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

function ProtectedRoute({ children }: { children: React.ReactElement }) {
  const isAuthenticated = !!localStorage.getItem('auth_token')
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

export default App

