import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { fetchSession } from '../api'
import type { DqaSessionResponse } from '../types'

function getDeviationColor(dev: number | null): string {
  if (dev == null) return 'bg-gray-100'
  const absDev = Math.abs(dev)
  if (absDev <= 0.05) return 'bg-green-100 text-green-800'
  if (absDev <= 0.10) return 'bg-yellow-100 text-yellow-800'
  return 'bg-red-100 text-red-800'
}

function formatDeviation(dev: number | null): string {
  if (dev == null) return '-'
  return `${(dev * 100).toFixed(1)}%`
}

export default function SessionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [session, setSession] = useState<DqaSessionResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadSession() {
      if (!id) return
      try {
        const data = await fetchSession(parseInt(id))
        setSession(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load session')
      } finally {
        setLoading(false)
      }
    }
    loadSession()
  }, [id])

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="text-center py-8">Loading...</div>
      </div>
    )
  }

  if (error || !session) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error || 'Session not found'}
        </div>
        <Link to="/dashboard" className="text-blue-600 hover:underline mt-4 inline-block">
          ← Back to Dashboard
        </Link>
      </div>
    )
  }

  const createdDate = new Date(session.created_at).toLocaleString()

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-4">
        <Link to="/dashboard" className="text-blue-600 hover:underline">
          ← Back to Dashboard
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6">DQA Session Details</h1>

      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-sm font-medium text-gray-500">District:</span>
            <p className="text-lg font-semibold">{session.facility.district}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500">Facility:</span>
            <p className="text-lg font-semibold">{session.facility.name} ({session.facility.level})</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500">Period:</span>
            <p className="text-lg font-semibold">{session.period}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500">Created:</span>
            <p className="text-lg font-semibold">{createdDate}</p>
          </div>
          {session.team && (
            <div>
              <span className="text-sm font-medium text-gray-500">Team:</span>
              <p className="text-lg font-semibold">{session.team}</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Code
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Indicator Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data Source
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Recount Register
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Figure 105
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Figure DHIS2
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dev DHIS2 vs Reg
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dev 105 vs Reg
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dev 105 vs DHIS2
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {session.lines.map((line) => (
                <tr key={line.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    {line.indicator.code}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {line.indicator.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {line.indicator.data_source}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-900">
                    {line.recount_register ?? '-'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-900">
                    {line.figure_105 ?? '-'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-900">
                    {line.figure_dhis2 ?? '-'}
                  </td>
                  <td className={`px-4 py-3 whitespace-nowrap text-sm text-center font-medium ${getDeviationColor(line.dev_dhis2_vs_reg ?? null)}`}>
                    {formatDeviation(line.dev_dhis2_vs_reg ?? null)}
                  </td>
                  <td className={`px-4 py-3 whitespace-nowrap text-sm text-center font-medium ${getDeviationColor(line.dev_105_vs_reg ?? null)}`}>
                    {formatDeviation(line.dev_105_vs_reg ?? null)}
                  </td>
                  <td className={`px-4 py-3 whitespace-nowrap text-sm text-center font-medium ${getDeviationColor(line.dev_105_vs_dhis2 ?? null)}`}>
                    {formatDeviation(line.dev_105_vs_dhis2 ?? null)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

