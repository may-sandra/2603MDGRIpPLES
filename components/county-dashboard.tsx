'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts'
import { formatNumber } from '@/lib/utils'

const colors = {
  primary: '#0f172a',
  accent: '#10b981',
  secondary: '#1e3a8a',
  urban: '#1e40af',
  rural: '#2563eb',
}

interface CountyDashboardProps {
  county: string
}

export default function CountyDashboard({ county }: CountyDashboardProps) {
  const [allRecords, setAllRecords] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState<number>(2024)
  const [availableYears, setAvailableYears] = useState<number[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/mdg-data')
        if (!response.ok) throw new Error('Failed to fetch MDG data')
        
        const json = await response.json()
        const records = json.data || []
        
        // Filter to ONLY the selected county
        const countyRecords = records.filter((r: any) => r.administration === county)
        
        console.log('[v0] County Dashboard: Fetching data for', county)
        console.log('[v0] County Dashboard: Found', countyRecords.length, 'records')
        if (countyRecords.length > 0) {
          console.log('[v0] Sample records:', countyRecords.slice(0, 3).map((r: any) => ({
            description: r.description,
            area: r.area,
            hasYearData: r.isYearData,
            theme: r.theme
          })))
        }
        
        setAllRecords(countyRecords)
        
        // Extract available years
        const yearsSet = new Set<number>()
        countyRecords.forEach((r: any) => {
          if (r.data && typeof r.data === 'object') {
            Object.keys(r.data).forEach(year => {
              const yearNum = parseInt(year)
              if (!isNaN(yearNum)) yearsSet.add(yearNum)
            })
          }
        })
        const years = Array.from(yearsSet).sort((a, b) => a - b)
        setAvailableYears(years)
        setSelectedYear(years.find(y => y === 2024) || (years.length > 0 ? years[years.length - 1] : 2024))
      } catch (error) {
        console.error('[v0] County Dashboard Error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [county])

  // Helper to find a metric
  const findMetric = (description: string, areaFilter?: string) => {
    const searchTerm = description.toLowerCase().trim()
    return allRecords.find((r: any) => {
      if (!r.description) return false
      const desc = r.description.toLowerCase()
      const match = desc === searchTerm || desc.includes(searchTerm)
      
      if (areaFilter && match) {
        // Check if Area column matches (for urban/rural split)
        return r.area && r.area.toLowerCase().includes(areaFilter.toLowerCase())
      }
      return match
    })
  }

  // Helper to get metric value
  const getMetricValue = (record: any, year?: number) => {
    if (!record) return null
    
    const targetYear = year || selectedYear
    
    if (record.isYearData && record.data && record.data[targetYear.toString()]) {
      const val = record.data[targetYear.toString()]
      return typeof val === 'string' ? parseFloat(val) : val
    } else if (!record.isYearData && record.capacity !== undefined && record.capacity !== null && record.capacity !== '') {
      const val = record.capacity
      return typeof val === 'string' ? parseFloat(val) : val
    }
    
    return null
  }

  // Get trend data for a metric
  const getTrendData = (description: string) => {
    const record = findMetric(description)
    if (!record || !record.data) return []
    
    return Object.entries(record.data)
      .filter(([_, v]) => v !== null && v !== undefined && v !== '')
      .sort(([yearA], [yearB]) => parseInt(yearA) - parseInt(yearB))
      .map(([year, value]) => ({
        year,
        value: typeof value === 'string' ? parseFloat(value) : value,
      }))
  }

  if (isLoading) {
    return <div className="p-6 text-slate-600">Loading {county} data...</div>
  }

  if (allRecords.length === 0) {
    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800 font-medium">No data available for {county}</p>
        <p className="text-yellow-700 text-sm mt-2">Please select: National, Nyandarua, Kiambu, or Kilifi</p>
      </div>
    )
  }

  // ====== DEMOGRAPHICS ======
  const populationMetric = findMetric('Total population')
  const householdsMetric = findMetric('Number of Households')
  const avgHouseholdMetric = findMetric('Average Household size')

  const population = getMetricValue(populationMetric)
  const households = getMetricValue(householdsMetric)
  const avgHouseholdSize = getMetricValue(avgHouseholdMetric)

  // ====== ENERGY RESOURCES ======
  const woodFuelMetric = findMetric('Wood fuel')
  const agResiduesMetric = findMetric('Agricultural residues')
  const animalWasteMetric = findMetric('Animal waste')
  const solidWasteMetric = findMetric('Solid')
  const solarRadiationMetric = findMetric('Solar radiation')
  const windPotentialMetric = findMetric('Wind potential')
  const hydroMetric = findMetric('Potential for different sites') // Hydro

  // ====== INFRASTRUCTURE & CONNECTIVITY ======
  const householdConnectivityMetric = findMetric('Total connectivity of households')
  const msmeConnectivityMetric = findMetric('Total connectivity of MSMEs')
  const industriesConnectivityMetric = findMetric('Total connectivity of industries')
  const institutionsConnectivityMetric = findMetric('Total connectivity of institutions')
  const solarHomeMetric = findMetric('Households connected to solar home systems')
  const miniGridMetric = findMetric('Households connected to mini-grids')

  // ====== COOKING TECHNOLOGIES (URBAN/RURAL) ======
  const cookingTechUrban = allRecords.filter((r: any) => 
    r.description && r.description.toLowerCase().includes('cooking technolog') && 
    r.area && r.area.toLowerCase().includes('urban')
  )
  const cookingTechRural = allRecords.filter((r: any) => 
    r.description && r.description.toLowerCase().includes('cooking technolog') && 
    r.area && r.area.toLowerCase().includes('rural')
  )

  // Prepare cooking tech trend data for urban/rural comparison
  const cookingTechComparisonData = cookingTechUrban.length > 0 && cookingTechRural.length > 0 
    ? [
        {
          tech: 'Three Stone',
          urban: getMetricValue(cookingTechUrban.find(r => r.description.includes('Three stone'))) || 0,
          rural: getMetricValue(cookingTechRural.find(r => r.description.includes('Three stone'))) || 0,
        },
        {
          tech: 'Improved Charcoal',
          urban: getMetricValue(cookingTechUrban.find(r => r.description.includes('Improved charcoal'))) || 0,
          rural: getMetricValue(cookingTechRural.find(r => r.description.includes('Improved charcoal'))) || 0,
        },
        {
          tech: 'Parafin Stoves',
          urban: getMetricValue(cookingTechUrban.find(r => r.description.includes('Parafin'))) || 0,
          rural: getMetricValue(cookingTechRural.find(r => r.description.includes('Parafin'))) || 0,
        },
        {
          tech: 'Electric',
          urban: getMetricValue(cookingTechUrban.find(r => r.description.includes('Electric'))) || 0,
          rural: getMetricValue(cookingTechRural.find(r => r.description.includes('Electric'))) || 0,
        },
      ]
    : []

  return (
    <div className="space-y-8">
      {/* Year Selector */}
      {availableYears.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Select Year</CardTitle>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Available data: {availableYears.join(', ')}</p>
              </div>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="px-3 py-2 border border-slate-300 rounded-md text-sm"
              >
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* ====== DEMOGRAPHICS ====== */}
      {(population || households || avgHouseholdSize) && (
        <div>
          <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Demographics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-50 border border-blue-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-blue-900">Total Population</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-900">{population ? formatNumber(population) : 'N/A'}</div>
                <p className="text-xs text-blue-700 mt-1">{populationMetric?.unit || 'Persons'}</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-50 to-green-50 border border-green-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-green-900">Total Households</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-900">{households ? formatNumber(households) : 'N/A'}</div>
                <p className="text-xs text-green-700 mt-1">{householdsMetric?.unit || 'Households'}</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-50 to-purple-50 border border-purple-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-purple-900">Avg Household Size</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-900">{avgHouseholdSize || 'N/A'}</div>
                <p className="text-xs text-purple-700 mt-1">{avgHouseholdMetric?.unit || 'Persons/HH'}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ====== ENERGY RESOURCES ====== */}
      {(woodFuelMetric || solarRadiationMetric || windPotentialMetric) && (
        <div>
          <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Energy Resources Potential</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Resource Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {woodFuelMetric && (
                    <div className="flex justify-between pb-2 border-b">
                      <span className="text-sm text-slate-600">Wood Fuel</span>
                      <span className="font-bold">{formatNumber(getMetricValue(woodFuelMetric))} {woodFuelMetric.unit || ''}</span>
                    </div>
                  )}
                  {agResiduesMetric && (
                    <div className="flex justify-between pb-2 border-b">
                      <span className="text-sm text-slate-600">Agricultural Residues</span>
                      <span className="font-bold">{formatNumber(getMetricValue(agResiduesMetric))} {agResiduesMetric.unit || ''}</span>
                    </div>
                  )}
                  {solarRadiationMetric && (
                    <div className="flex justify-between pb-2 border-b">
                      <span className="text-sm text-slate-600">Solar Radiation</span>
                      <span className="font-bold">{formatNumber(getMetricValue(solarRadiationMetric))} {solarRadiationMetric.unit || ''}</span>
                    </div>
                  )}
                  {windPotentialMetric && (
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Wind Potential</span>
                      <span className="font-bold">{formatNumber(getMetricValue(windPotentialMetric))} {windPotentialMetric.unit || ''}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ====== INFRASTRUCTURE & CONNECTIVITY ====== */}
      {(householdConnectivityMetric || msmeConnectivityMetric) && (
        <div>
          <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Infrastructure & Access - Electricity Connectivity</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Connectivity Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {householdConnectivityMetric && (
                    <div className="flex justify-between pb-2 border-b">
                      <span className="text-sm text-slate-600">Households</span>
                      <span className="font-bold">{formatNumber(getMetricValue(householdConnectivityMetric))} {householdConnectivityMetric.unit || ''}</span>
                    </div>
                  )}
                  {msmeConnectivityMetric && (
                    <div className="flex justify-between pb-2 border-b">
                      <span className="text-sm text-slate-600">MSMEs</span>
                      <span className="font-bold">{formatNumber(getMetricValue(msmeConnectivityMetric))} {msmeConnectivityMetric.unit || ''}</span>
                    </div>
                  )}
                  {industriesConnectivityMetric && (
                    <div className="flex justify-between pb-2 border-b">
                      <span className="text-sm text-slate-600">Industries</span>
                      <span className="font-bold">{formatNumber(getMetricValue(industriesConnectivityMetric))} {industriesConnectivityMetric.unit || ''}</span>
                    </div>
                  )}
                  {institutionsConnectivityMetric && (
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Institutions</span>
                      <span className="font-bold">{formatNumber(getMetricValue(institutionsConnectivityMetric))} {institutionsConnectivityMetric.unit || ''}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {solarHomeMetric || miniGridMetric ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Alternative Energy Access</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {solarHomeMetric && (
                      <div className="flex justify-between pb-2 border-b">
                        <span className="text-sm text-slate-600">Solar Home Systems</span>
                        <span className="font-bold">{formatNumber(getMetricValue(solarHomeMetric))} {solarHomeMetric.unit || ''}</span>
                      </div>
                    )}
                    {miniGridMetric && (
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Mini-Grids</span>
                        <span className="font-bold">{formatNumber(getMetricValue(miniGridMetric))} {miniGridMetric.unit || ''}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : null}
          </div>
        </div>
      )}

      {/* ====== COOKING TECHNOLOGIES - URBAN/RURAL ====== */}
      {cookingTechComparisonData.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Cooking Technologies - Urban vs Rural</h2>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Technology Adoption by Area</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={cookingTechComparisonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="tech" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="urban" fill={colors.urban} name="Urban %" />
                  <Bar dataKey="rural" fill={colors.rural} name="Rural %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ====== TRENDS ====== */}
      {getTrendData('Total connectivity of households').length > 1 && (
        <div>
          <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Connectivity Trends</h2>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Household Connectivity Progression</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={getTrendData('Total connectivity of households')}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke={colors.secondary} strokeWidth={2} name="Connectivity" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
