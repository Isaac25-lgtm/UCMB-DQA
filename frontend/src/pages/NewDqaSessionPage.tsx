import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchFacilities, fetchIndicators, createSession, fetchTeams } from '../api'
import type { Facility, Indicator, DqaLineCreate, TeamsResponse } from '../types'

function calculateDeviation(value1: number | null | undefined, value2: number | null | undefined): number | null {
  if (value1 == null || value2 == null) return null
  if (value1 === 0) return null
  return (value2 - value1) / value1
}

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

export default function NewDqaSessionPage() {
  const navigate = useNavigate()
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [indicators, setIndicators] = useState<Indicator[]>([])
  const [teams, setTeams] = useState<TeamsResponse>({})
  const [selectedDistrict, setSelectedDistrict] = useState<string>('')
  const [selectedFacilityId, setSelectedFacilityId] = useState<number | null>(null)
  const [period] = useState(() => {
    const now = new Date()
    return now.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
  })
  const [selectedTeam, setSelectedTeam] = useState<string>('')
  const [lines, setLines] = useState<Record<number, {
    recount_register?: number | null
    figure_105?: number | null
    figure_dhis2?: number | null
  }>>({})
  const [loading, setLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        setDataLoading(true)
        setError(null)
        const [facilitiesData, indicatorsData, teamsData] = await Promise.all([
          fetchFacilities(),
          fetchIndicators(),
          fetchTeams(),
        ])
        setFacilities(facilitiesData)
        setIndicators(indicatorsData)
        setTeams(teamsData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data')
        console.error('Error loading data:', err)
      } finally {
        setDataLoading(false)
      }
    }
    loadData()
  }, [])

  const districts = Array.from(new Set(facilities.map(f => f.district))).sort()
  const filteredFacilities = facilities.filter(f => 
    !selectedDistrict || f.district === selectedDistrict
  )

  const handleLineChange = (
    indicatorId: number,
    field: 'recount_register' | 'figure_105' | 'figure_dhis2',
    value: string
  ) => {
    setLines(prev => ({
      ...prev,
      [indicatorId]: {
        ...prev[indicatorId],
        [field]: value === '' ? null : parseFloat(value),
      },
    }))
  }

  const handleDownload = () => {
    if (!selectedFacilityId) {
      setError('Please select a facility before downloading')
      return
    }

    const selectedFacility = facilities.find(f => f.id === selectedFacilityId)
    if (!selectedFacility) return

    // Prepare CSV data - empty template for offline filling
    const csvRows: string[] = []
    
    // Header - correct order: facility, district, period, indicator_code, recount_register, figure_105, figure_dhis2, team
    csvRows.push('facility,district,period,indicator_code,recount_register,figure_105,figure_dhis2,team')
    
    // Data rows - all data columns empty, team column empty
    indicators.forEach(indicator => {
      csvRows.push([
        selectedFacility.name,
        selectedFacility.district,
        period,
        indicator.code,
        '', // recount_register - empty
        '', // figure_105 - empty
        '', // figure_dhis2 - empty
        ''  // team - empty (manager will assign when uploading)
      ].join(','))
    })
    
    // Create and download
    const csvContent = csvRows.join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `dqa_session_${selectedFacility.name.replace(/\s+/g, '_')}_${period.replace(/\s+/g, '_')}.csv`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFacilityId) {
      setError('Please select a facility')
      return
    }
    if (!selectedTeam) {
      setError('Please select a team')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const linesData: DqaLineCreate[] = indicators.map(ind => ({
        indicator_id: ind.id,
        recount_register: lines[ind.id]?.recount_register ?? null,
        figure_105: lines[ind.id]?.figure_105 ?? null,
        figure_dhis2: lines[ind.id]?.figure_dhis2 ?? null,
      }))

      const session = await createSession({
        facility_id: selectedFacilityId,
        period: period.trim(),
        team: selectedTeam,
        lines: linesData,
      })

      navigate(`/session/${session.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create session')
    } finally {
      setLoading(false)
    }
  }

  if (error && !facilities.length) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">New DQA Session</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                District
              </label>
              <select
                value={selectedDistrict}
                onChange={(e) => {
                  setSelectedDistrict(e.target.value)
                  setSelectedFacilityId(null)
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select district</option>
                {districts.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Facility
              </label>
              <select
                value={selectedFacilityId || ''}
                onChange={(e) => setSelectedFacilityId(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={!selectedDistrict}
              >
                <option value="">Select facility</option>
                {filteredFacilities.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.level})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Period
              </label>
              <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-700">
                {period}
              </div>
              <p className="mt-1 text-xs text-gray-500">Current date (automatically set)</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Team
              </label>
              <select
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select team</option>
                {Object.keys(teams).map(teamName => (
                  <option key={teamName} value={teamName}>{teamName}</option>
                ))}
              </select>
              {selectedTeam && teams[selectedTeam] && (
                <div className="mt-2 p-3 bg-blue-50 rounded-md">
                  <p className="text-sm font-medium text-gray-700 mb-1">Team Members:</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {teams[selectedTeam].map((member, idx) => (
                      <li key={idx}>• {member}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
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
                {indicators.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                      No indicators found. Please check your connection and refresh the page.
                    </td>
                  </tr>
                ) : (
                  indicators.map((indicator) => {
                  const line = lines[indicator.id] || {}
                  const dev_dhis2_vs_reg = calculateDeviation(line.recount_register, line.figure_dhis2)
                  const dev_105_vs_reg = calculateDeviation(line.recount_register, line.figure_105)
                  const dev_105_vs_dhis2 = calculateDeviation(line.figure_dhis2, line.figure_105)

                  return (
                    <tr key={indicator.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {indicator.code}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {indicator.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {indicator.data_source}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <input
                          type="number"
                          step="0.01"
                          value={line.recount_register ?? ''}
                          onChange={(e) => handleLineChange(indicator.id, 'recount_register', e.target.value)}
                          className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <input
                          type="number"
                          step="0.01"
                          value={line.figure_105 ?? ''}
                          onChange={(e) => handleLineChange(indicator.id, 'figure_105', e.target.value)}
                          className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <input
                          type="number"
                          step="0.01"
                          value={line.figure_dhis2 ?? ''}
                          onChange={(e) => handleLineChange(indicator.id, 'figure_dhis2', e.target.value)}
                          className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </td>
                      <td className={`px-4 py-3 whitespace-nowrap text-sm text-center font-medium ${getDeviationColor(dev_dhis2_vs_reg)}`}>
                        {formatDeviation(dev_dhis2_vs_reg)}
                      </td>
                      <td className={`px-4 py-3 whitespace-nowrap text-sm text-center font-medium ${getDeviationColor(dev_105_vs_reg)}`}>
                        {formatDeviation(dev_105_vs_reg)}
                      </td>
                      <td className={`px-4 py-3 whitespace-nowrap text-sm text-center font-medium ${getDeviationColor(dev_105_vs_dhis2)}`}>
                        {formatDeviation(dev_105_vs_dhis2)}
                      </td>
                    </tr>
                  )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={handleDownload}
            disabled={loading || !selectedFacilityId}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
          >
            Download Template CSV
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Submit Session'}
          </button>
        </div>
      </form>
    </div>
  )
}

