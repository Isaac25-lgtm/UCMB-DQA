import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchSessions, downloadExport, uploadCsv, fetchDashboardStats, fetchTeams } from '../api'
import type { DqaSessionSummary, DashboardStats } from '../api'
import type { TeamsResponse } from '../types'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function ManagerDashboardPage() {
  const navigate = useNavigate()
  const [sessions, setSessions] = useState<DqaSessionSummary[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [teams, setTeams] = useState<TeamsResponse>({})
  const [selectedUploadTeam, setSelectedUploadTeam] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadSessions()
    loadStats()
    loadTeams()
  }, [])

  async function loadTeams() {
    try {
      const data = await fetchTeams()
      setTeams(data)
    } catch (err) {
      console.error('Failed to load teams:', err)
    }
  }

  async function loadStats() {
    try {
      const data = await fetchDashboardStats()
      setStats(data)
    } catch (err) {
      console.error('Failed to load stats:', err)
      // Don't show error to user, just log it - graphs will show when data is available
    }
  }

  async function loadSessions() {
    try {
      setLoading(true)
      const data = await fetchSessions()
      setSessions(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sessions')
    } finally {
      setLoading(false)
    }
  }

  async function handleDownload() {
    try {
      await downloadExport()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download CSV')
    }
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!selectedUploadTeam) {
      setError('Please select a team before uploading')
      return
    }

    try {
      setUploading(true)
      setError(null)
      await uploadCsv(file, selectedUploadTeam)
      await loadSessions()
      await loadStats()
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload CSV')
    } finally {
      setUploading(false)
    }
  }


  if (loading && sessions.length === 0) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-8">Loading...</div>
      </div>
    )
  }

  // Prepare data for charts
  const progressData = stats ? [
    { name: 'Assessed', value: stats.assessed_facilities, color: '#10B981' },
    { name: 'Remaining', value: stats.total_facilities - stats.assessed_facilities, color: '#E5E7EB' }
  ] : []

  const teamData = stats?.team_progress || []

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Manager Dashboard</h1>

      {/* Statistics Cards */}
      {stats ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Total Facilities</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.total_facilities}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Assessed Facilities</h3>
            <p className="text-3xl font-bold text-green-600">{stats.assessed_facilities}</p>
            <p className="text-sm text-gray-500 mt-1">
              {stats.total_facilities > 0 
                ? `${Math.round((stats.assessed_facilities / stats.total_facilities) * 100)}% complete`
                : '0% complete'}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Total Sessions</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.total_sessions}</p>
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="text-center text-gray-500">Loading statistics...</div>
        </div>
      )}

      {/* Charts */}
      {stats && stats.total_facilities > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Overall Progress Pie Chart */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Overall Progress</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={progressData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {progressData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 text-center text-sm text-gray-600">
              <p>{stats.assessed_facilities} of {stats.total_facilities} facilities assessed</p>
            </div>
          </div>

          {/* Team Progress Bar Chart */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Progress by Team</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={teamData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="team" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="facilities_assessed" fill="#3B82F6" name="Facilities Assessed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Download all data as Excel
            </button>
          </div>
          
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-3">Upload CSV (Offline Data)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Team for Upload
                </label>
                <select
                  value={selectedUploadTeam}
                  onChange={(e) => setSelectedUploadTeam(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select team (required)</option>
                  {Object.keys(teams).map(teamName => (
                    <option key={teamName} value={teamName}>{teamName}</option>
                  ))}
                </select>
                {selectedUploadTeam && teams[selectedUploadTeam] && (
                  <p className="mt-1 text-xs text-gray-500">
                    Team members: {teams[selectedUploadTeam].join(', ')}
                  </p>
                )}
              </div>
              <div className="flex items-end">
                <div className="w-full">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="csv-upload"
                    disabled={!selectedUploadTeam}
                  />
                  <label
                    htmlFor="csv-upload"
                    className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer inline-block w-full text-center ${
                      uploading || !selectedUploadTeam ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {uploading ? 'Uploading...' : selectedUploadTeam ? 'Upload CSV File' : 'Select team first'}
                  </label>
                </div>
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              The uploaded data will be assigned to the selected team and counted in their statistics.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  District
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Facility
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Period
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Team
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created At
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  # Indicators
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  # Red
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  # Amber
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sessions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    No sessions found. Create a new session to get started.
                  </td>
                </tr>
              ) : (
                sessions.map((session) => {
                  const createdDate = new Date(session.created_at).toLocaleString()
                  return (
                    <tr
                      key={session.id}
                      onClick={() => navigate(`/session/${session.id}`)}
                      className="hover:bg-gray-50 cursor-pointer"
                    >
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {session.district}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {session.facility_name}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {session.period}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {session.team || '-'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {createdDate}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-900">
                        {session.line_count}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-red-600 font-medium">
                        {session.red_count}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-yellow-600 font-medium">
                        {session.amber_count}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

