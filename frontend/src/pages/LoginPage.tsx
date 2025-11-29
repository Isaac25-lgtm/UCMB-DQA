import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const MANAGER_EMAIL = 'jendabalo22@gmail.com'
const MANAGER_PASSWORD = 'dataqualtyassessment'

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // If already logged in, go straight to dashboard
    const isLoggedIn = localStorage.getItem('managerAuth') === 'true'
    if (isLoggedIn) {
      navigate('/dashboard', { replace: true })
    }
  }, [navigate])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (email === MANAGER_EMAIL && password === MANAGER_PASSWORD) {
      localStorage.setItem('managerAuth', 'true')
      localStorage.setItem('managerLastDashboardTs', String(Date.now()))
      navigate('/dashboard', { replace: true })
    } else {
      setError('Invalid username or password')
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">UCMB Login</h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Username (Email)
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Log In
        </button>

        <p className="mt-2 text-xs text-gray-500 text-center">
          Username: {MANAGER_EMAIL} · Password: {MANAGER_PASSWORD}
        </p>
      </form>
    </div>
  )
}


