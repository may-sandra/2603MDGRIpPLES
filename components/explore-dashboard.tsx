'use client'

// Cache invalidation: 2026-03-18T18:30:00Z - Force full rebuild
// All tooltip positioning uses left: -290px without idx conditional
// Source code is correct, browser served stale code

import { useState, useEffect } from "react"
import { TooltipProvider } from "@/components/ui/tooltip"
import { X, Info } from 'lucide-react'
import KenyaSVGInteractiveMap from '@/components/kenya-svg-interactive-map'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ALL_KENYA_COUNTIES } from '@/lib/kenya-counties'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatNumber } from '@/lib/utils'
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip, Legend } from 'recharts'

const colors = {
  primary: '#0f172a',
  primaryLight: '#f0f5fb',
  primaryBorder: '#1e293b',
  accent: '#10b981',
}

export default function ExploreDashboard() {
  const [selectedCounty, setSelectedCounty] = useState<string | null>('All Counties')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [mapLayer, setMapLayer] = useState<string>('counties')
  const [allRecords, setAllRecords] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [countiesWithData, setCountiesWithData] = useState<string[]>([])
  const [availableYears, setAvailableYears] = useState<number[]>([])
  const [selectedYear, setSelectedYear] = useState<number | null>(null)
  const [availableThemes, setAvailableThemes] = useState<string[]>([])
  const [consumptionTrendData, setConsumptionTrendData] = useState<any[]>([])
  const [consumptionPerCountyData, setConsumptionPerCountyData] = useState<any[]>([])
  const [cookingFuelData, setCookingFuelData] = useState<any[]>([])
  const [connectivityTrendData, setConnectivityTrendData] = useState<any[]>([])
  const [connectivityPerCountyData, setConnectivityPerCountyData] = useState<any[]>([])
  const [showInfoTooltip, setShowInfoTooltip] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/mdg-data')
        if (!response.ok) throw new Error('Failed to fetch MDG data')

        const json = await response.json()
        const records = json.data || []

        if (!records || records.length === 0) {
          setIsLoading(false)
          return
        }

        // Filter only allowed administrations
        const allowedAdministrations = ['Kiambu', 'Kilifi', 'Nyandarua', 'National']
        const filteredRecords = records.filter((r: any) => allowedAdministrations.includes(r.administration))

        setAllRecords(filteredRecords)

        // Extract counties with data
        const administrations = [...new Set(filteredRecords.map((r: any) => r.administration).filter(Boolean))] as string[]
        const counties = administrations.filter(a => a !== 'National')
        setCountiesWithData(counties)

        // Extract unique categories from data
        const categories = [...new Set(filteredRecords.map((r: any) => r.category).filter(Boolean))] as string[]
        setAvailableThemes(categories.sort())

        // Log descriptions for debugging
        const descriptions = [...new Set(filteredRecords.map((r: any) => r.description).filter(Boolean))]
        console.log('[MDG] Sample descriptions from database:', descriptions.slice(0, 15))

        // Extract available years from data
        const yearsSet = new Set<number>()
        filteredRecords.forEach((r: any) => {
          if (r.data && typeof r.data === 'object') {
            Object.keys(r.data).forEach(year => {
              const yearNum = parseInt(year)
              if (!isNaN(yearNum)) yearsSet.add(yearNum)
            })
          }
        })
        const years = Array.from(yearsSet).sort((a, b) => a - b)
        console.log('[MDG] Available years extracted:', years)
        console.log('[MDG] Sample record data object:', filteredRecords[0]?.data)
        setAvailableYears(years)

        // Set default year to 2019 if available, otherwise first available year
        const year2019 = years.find(y => y === 2019)
        setSelectedYear(year2019 || (years.length > 0 ? years[0] : null))
      } catch (error) {
        console.error('[MDG] Error loading data:', error)
        setAllRecords([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    if (allRecords.length === 0) return

    // Extract cooking fuels data (for selected county and all years)
    const cookingFuelRecords = allRecords.filter((r: any) => {
      // Check if it's the right county
      const isRightCounty = selectedCounty === 'All Counties' ? r.administration === 'National' : r.administration === selectedCounty

      return isRightCounty &&
        r.description &&
        (r.description.includes('%') || r.unit === '%') &&
        (r.description.includes('Firewood') || r.description.includes('Charcoal') || r.description.includes('LPG') || r.description.includes('Electricity')) &&
        r.data
    })

    if (cookingFuelRecords.length > 0) {
      const fuelMap = new Map<number, any>()
      availableYears.forEach(year => {
        const dataPoint: any = { year }
        cookingFuelRecords.forEach(record => {
          const fuelType = record.description.replace(/\s*%\s*$/g, '').trim()
          if (record.data[year.toString()]) {
            dataPoint[fuelType] = record.data[year.toString()]
          }
        })
        fuelMap.set(year, dataPoint)
      })
      setCookingFuelData(Array.from(fuelMap.values()))
    }

    // Extract connectivity trends (for selected county, all years) - look for % unit records
    const connectivityRecordPercent = allRecords.find((r: any) => {
      const isRightCounty = selectedCounty === 'All Counties' ? r.administration === 'National' : r.administration === selectedCounty
      return isRightCounty && r.description && r.description.includes('Total connectivity of households') && r.unit === '%' && r.data
    })

    if (connectivityRecordPercent) {
      const connectivityData: any[] = []
      availableYears.forEach(year => {
        connectivityData.push({
          year,
          connectivity: connectivityRecordPercent.data[year.toString()] || 0
        })
      })
      setConnectivityTrendData(connectivityData)
    }

    // Extract consumption per county data (for selected year or most recent)
    const householdsConsumptionByCounty = allRecords.filter((r: any) => r.description === 'Households (kWh)' && r.data && r.administration !== 'National')

    if (householdsConsumptionByCounty.length > 0 && selectedYear) {
      const countyConsumptionData: any[] = []
      householdsConsumptionByCounty.forEach((record: any) => {
        const value = record.data[selectedYear?.toString()]
        if (value !== null && value !== undefined) {
          countyConsumptionData.push({
            county: record.administration,
            consumption: value
          })
        }
      })
      countyConsumptionData.sort((a, b) => b.consumption - a.consumption)
      setConsumptionPerCountyData(countyConsumptionData)
    }

    // Extract connectivity per county data (for selected year)
    const connectivityByCounty = allRecords.filter((r: any) => {
      return r.description && r.description.includes('Total connectivity of households') && r.unit === '%' && r.data && r.administration !== 'National'
    })

    if (connectivityByCounty.length > 0 && selectedYear) {
      const countyConnectivityData: any[] = []
      connectivityByCounty.forEach((record: any) => {
        const value = record.data[selectedYear?.toString()]
        if (value !== null && value !== undefined) {
          countyConnectivityData.push({
            county: record.administration,
            connectivity: value
          })
        }
      })
      countyConnectivityData.sort((a, b) => b.connectivity - a.connectivity)
      setConnectivityPerCountyData(countyConnectivityData)
    }

  }, [selectedCounty, selectedYear, availableYears, allRecords])
  const getComparisonData = (metricDescription: string) => {
    // More flexible matching: try different matching strategies
    const searchTerm = metricDescription.toLowerCase().trim()
    const searchTerms = searchTerm.split(/[\s\-\/]+/).filter(t => t.length > 2) // Split into words, filter short words

    const isMetricMatch = (record: any) => {
      if (!record.description) return false
      const desc = record.description.toLowerCase()

      // Try exact match first
      if (desc === searchTerm) return true

      // Try substring match
      if (desc.includes(searchTerm)) return true

      // Try matching multiple search terms (all must be present)
      return searchTerms.length > 0 && searchTerms.every(term => desc.includes(term))
    }

    const nationalRecord = allRecords.find((r: any) =>
      r.administration === 'National' && isMetricMatch(r)
    )

    // Get value from record - handle both static and year-based data
    const getValue = (record: any) => {
      if (!record.isYearData) {
        // Static value (Demographics) - use capacity field directly
        const val = record.capacity
        if (val === null || val === undefined || val === '') return null
        return typeof val === 'string' ? parseFloat(val) : val
      } else if (selectedYear && record.data && record.data[selectedYear.toString()]) {
        // Year-specific data
        const val = record.data[selectedYear.toString()]
        if (val === null || val === undefined || val === '') return null
        return typeof val === 'string' ? parseFloat(val) : val
      } else if (record.data && Object.keys(record.data).length > 0) {
        // Fallback to first available year
        const availableData = Object.values(record.data).filter(v => v !== null && v !== undefined && v !== '')
        if (availableData.length === 0) return null
        const val = availableData[0]
        return typeof val === 'string' ? parseFloat(val) : val
      }
      const val = record.capacity
      if (val === null || val === undefined || val === '') return null
      return val
    }

    let countyRecord
    if (selectedCounty === 'All Counties') {
      // Find county with highest value for this metric in selected year
      const countyRecords = allRecords.filter((r: any) =>
        r.administration !== 'National' && isMetricMatch(r)
      )
      countyRecord = countyRecords.reduce((max: any, current: any) => {
        const currentValue = getValue(current)
        const maxValue = getValue(max)
        return (typeof currentValue === 'number' && typeof maxValue === 'number' && currentValue > maxValue) ? current : max
      }, countyRecords[0])
    } else {
      countyRecord = allRecords.find((r: any) =>
        r.administration === selectedCounty && isMetricMatch(r)
      )
    }

    const nationalValue = nationalRecord ? getValue(nationalRecord) : null
    const countyValue = countyRecord ? getValue(countyRecord) : null

    return {
      national: nationalValue,
      county: countyValue,
      countyName: countyRecord?.administration || selectedCounty,
      nationalRecord: nationalRecord,
      countyRecord: countyRecord,
    }
  }

  // Separate function for Infrastructure Access metrics - filters by % unit only
  const getInfrastructureAccessData = (metricDescription: string) => {
    // More flexible matching: try different matching strategies
    const searchTerm = metricDescription.toLowerCase().trim()
    const searchTerms = searchTerm.split(/[\s\-\/]+/).filter(t => t.length > 2)

    const isMetricMatch = (record: any) => {
      if (!record.description) return false
      const desc = record.description.toLowerCase()

      if (desc === searchTerm) return true
      if (desc.includes(searchTerm)) return true
      return searchTerms.length > 0 && searchTerms.every(term => desc.includes(term))
    }

    // For infrastructure metrics, only get records where unit is %
    const nationalRecord = allRecords.find((r: any) =>
      r.administration === 'National' && isMetricMatch(r) && r.unit === '%'
    )

    const getValue = (record: any) => {
      if (!record.isYearData) {
        const val = record.capacity
        if (val === null || val === undefined || val === '') return null
        return typeof val === 'string' ? parseFloat(val) : val
      } else if (selectedYear && record.data && record.data[selectedYear.toString()]) {
        const val = record.data[selectedYear.toString()]
        if (val === null || val === undefined || val === '') return null
        return typeof val === 'string' ? parseFloat(val) : val
      } else if (record.data && Object.keys(record.data).length > 0) {
        const availableData = Object.values(record.data).filter(v => v !== null && v !== undefined && v !== '')
        if (availableData.length === 0) return null
        const val = availableData[0]
        return typeof val === 'string' ? parseFloat(val) : val
      }
      const val = record.capacity
      if (val === null || val === undefined || val === '') return null
      return val
    }

    let countyRecord
    if (selectedCounty === 'All Counties') {
      const countyRecords = allRecords.filter((r: any) =>
        r.administration !== 'National' && isMetricMatch(r) && r.unit === '%'
      )
      countyRecord = countyRecords.reduce((max: any, current: any) => {
        const currentValue = getValue(current)
        const maxValue = getValue(max)
        return (typeof currentValue === 'number' && typeof maxValue === 'number' && currentValue > maxValue) ? current : max
      }, countyRecords[0])
    } else {
      countyRecord = allRecords.find((r: any) =>
        r.administration === selectedCounty && isMetricMatch(r) && r.unit === '%'
      )
    }

    const nationalValue = nationalRecord ? getValue(nationalRecord) : null
    const countyValue = countyRecord ? getValue(countyRecord) : null

    return {
      national: nationalValue,
      county: countyValue,
      countyName: countyRecord?.administration || selectedCounty,
      nationalRecord: nationalRecord,
      countyRecord: countyRecord,
    }
  }

  return (
    <TooltipProvider>
      <div className="space-y-4 pb-8">
        {/* PAGE DESCRIPTION - TOP */}
        <div className="bg-slate-100/50 dark:bg-slate-800/30 rounded-lg p-4 w-full">
          <p className="text-sm text-slate-700 dark:text-slate-300">
            <span className="font-semibold">By default, charts show national values compared with the highest-performing counties. Select a specific county from the filter to view its data.</span>
          </p>
        </div>

        {/* Filter Bar + Map */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Map - Left side with integrated filters */}
          <div className="lg:col-span-1">
            <Card className="shadow-md bg-white dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50 h-fit sticky top-4">
              {/* Integrated Filters Header */}
              <CardHeader className="border-b border-slate-200 dark:border-slate-700 pb-3 bg-white dark:bg-slate-800">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Quick Filters</span>
                  </div>
                  {selectedCounty !== 'All Counties' && (
                    <button
                      onClick={() => {
                        setSelectedCounty('All Counties')
                        setSelectedCategory(null)
                      }}
                      className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors flex-shrink-0"
                      title="Clear filters"
                    >
                      <X className="h-4 w-4" style={{ color: colors.primary }} />
                    </button>
                  )}
                </div>

                {/* County & Map Layer Selectors - Same Row */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">County</label>
                    <Select value={selectedCounty === 'All Counties' ? 'All Counties' : (selectedCounty || 'All Counties')} onValueChange={(value) => setSelectedCounty(value === 'All Counties' ? 'All Counties' : value)}>
                      <SelectTrigger className="h-8 text-xs px-2 w-full bg-white dark:bg-slate-700" style={{ borderColor: colors.primaryBorder }}>
                        <SelectValue placeholder="All Counties" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All Counties">All Counties</SelectItem>
                        {ALL_KENYA_COUNTIES.map((county) => {
                          const hasData = countiesWithData.includes(county)
                          return (
                            <SelectItem key={county} value={county} className="text-xs">
                              <span className="flex items-center gap-1">
                                {hasData && <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colors.primary }} />}
                                {county}
                              </span>
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Map Layer</label>
                    <Select value={mapLayer} onValueChange={setMapLayer}>
                      <SelectTrigger className="h-8 text-xs px-2 w-full bg-white dark:bg-slate-700" style={{ borderColor: colors.primaryBorder }}>
                        <SelectValue placeholder="Select layer..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="counties" className="text-xs">County Boundaries</SelectItem>
                        <SelectItem value="ghi" className="text-xs">GHI (Solar)</SelectItem>
                        <SelectItem value="wind" className="text-xs">Wind Speed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Year Selector */}
                {availableYears.length > 0 && (
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Year</label>
                    <Select value={selectedYear?.toString() || ''} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                      <SelectTrigger className="h-8 text-xs px-2 w-full bg-white dark:bg-slate-700" style={{ borderColor: colors.primaryBorder }}>
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableYears.map((year) => (
                          <SelectItem key={year} value={year.toString()} className="text-xs">
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {selectedCounty !== 'All Counties' && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 px-1">
                    Viewing: <span className="font-semibold" style={{ color: colors.primary }}>{selectedCounty}</span>
                  </p>
                )}
              </CardHeader>

              {/* Map */}
              <CardContent className="pt-4 px-4 pb-4">
                <KenyaSVGInteractiveMap selectedCounty={selectedCounty !== 'All Counties' ? selectedCounty : null} onCountySelect={(county) => setSelectedCounty(county ? county : 'All Counties')} mapLayer={mapLayer} />
              </CardContent>
            </Card>
          </div>

          {/* RIGHT: Organized Data Cards by Category - Takes 3 columns */}
          <div className="lg:col-span-3 space-y-6">
            {isLoading ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-slate-600 dark:text-slate-400">Loading data...</p>
                </CardContent>
              </Card>
            ) : allRecords.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-slate-600 dark:text-slate-400">No data available</p>
                </CardContent>
              </Card>
            ) : (
              <div>
                {/* ENERGY RESOURCE POTENTIAL SECTION */}
                <div>
                  <div className="mb-4">
                    <h3 className="text-lg font-bold" style={{ color: '#0d47a1' }}>Energy Resource Potential</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400">County's Energy Resources</p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {['Solar radiation by area', 'Wind potential by area', 'Wood fuel', 'Hydroelectric potential'].map((metric, idx) => {
                      const data = getComparisonData(metric)
                      return (
                        <Card key={metric} className="border border-slate-200/60 dark:border-slate-800/60 shadow-sm hover:shadow-md transition-all overflow-visible">
                          <CardHeader style={{ backgroundColor: colors.primary + '05' }} className="border-b border-slate-200/60 dark:border-slate-800/60 py-3 px-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <CardTitle className="text-slate-900 dark:text-white text-xs font-semibold line-clamp-2" style={{ color: colors.primary }}>
                                  {metric}
                                </CardTitle>
                                <p className="text-xs text-slate-500 mt-1">{data.nationalRecord?.unit || 'Unit not specified'}</p>
                              </div>
                              <div className="relative flex-shrink-0">
                                <button
                                  onClick={() => setShowInfoTooltip(showInfoTooltip === metric ? null : metric)}
                                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                                  title="Show data source"
                                >
                                  <Info size={14} className="text-slate-600 dark:text-slate-400" />
                                </button>
                                {showInfoTooltip === metric && (
                                  <div className="absolute bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-4 w-72 z-[9999] shadow-2xl text-xs text-black dark:text-slate-100 max-h-[600px] overflow-y-auto"
                                    style={{
                                      left: '-290px',
                                      top: '0px'
                                    }}>
                                    <button
                                      onClick={() => setShowInfoTooltip(null)}
                                      className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                      title="Close"
                                    >
                                      ✕
                                    </button>
                                    <p className="font-semibold mb-3 text-black dark:text-white text-base pr-6">{metric}</p>
                                    <div className="mb-3 pb-3 border-b border-slate-200 dark:border-slate-700">
                                      <p className="text-sm font-semibold text-black dark:text-slate-300 mb-1">National Data Source:</p>
                                      <p className="text-sm text-black dark:text-slate-300 leading-relaxed">{data.nationalRecord?.source || 'Ministry of Energy and Petroleum - Energy and Petroleum Statistics Report'}</p>
                                    </div>
                                    <div className="mb-3 pb-3 border-b border-slate-200 dark:border-slate-700">
                                      <p className="text-sm font-semibold text-black dark:text-slate-300 mb-1">CEP Reference Source:</p>
                                      <p className="text-sm text-black dark:text-slate-300 leading-relaxed">{data.countyRecord?.reference || data.nationalRecord?.reference || 'County Energy Profile Reference'}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm font-semibold text-black dark:text-slate-300 mb-1">INEP Reference:</p>
                                      <p className="text-sm text-black dark:text-slate-300 leading-relaxed">{data.countyRecord?.inep || data.nationalRecord?.inep || 'Integrated National Energy and Petroleum Plan'}</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-4 pb-4">
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex-1">
                                <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">NATIONAL</p>
                                <p className="text-lg font-bold text-slate-900 dark:text-white">{data.national !== null ? formatNumber(data.national) : 'N/A'}</p>
                              </div>
                              <div className="w-px bg-slate-200 dark:bg-slate-700 h-12"></div>
                              <div className="flex-1 text-right">
                                <p className="text-xs font-semibold mb-2" style={{ color: colors.accent }}>{data.countyName.toUpperCase()}</p>
                                <p className="text-lg font-bold" style={{ color: colors.accent }}>{data.county !== null ? formatNumber(data.county) : 'N/A'}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </div>

                {/* INFRASTRUCTURE & ACCESS SECTION */}
                <div>
                  <div className="mb-4">
                    <h3 className="text-lg font-bold" style={{ color: '#0d47a1' }}>Infrastructure & Access</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Electricity Connectivity</p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {['Total connectivity of households', 'Total connectivity of industries', 'Households connected to solar home systems', 'Households connected to mini-grids'].map((metric, idx) => {
                      const data = getInfrastructureAccessData(metric)
                      return (
                        <Card key={metric} className="border border-slate-200/60 dark:border-slate-800/60 shadow-sm hover:shadow-md transition-all overflow-visible">
                          <CardHeader style={{ backgroundColor: colors.primary + '05' }} className="border-b border-slate-200/60 dark:border-slate-800/60 py-3 px-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <CardTitle className="text-slate-900 dark:text-white text-xs font-semibold line-clamp-2" style={{ color: colors.primary }}>
                                  {metric}
                                </CardTitle>
                                <p className="text-xs text-slate-500 mt-1">{data.nationalRecord?.unit || data.countyRecord?.unit || 'Unit not specified'}</p>
                              </div>
                              <div className="relative flex-shrink-0">
                                <button
                                  onClick={() => setShowInfoTooltip(showInfoTooltip === metric ? null : metric)}
                                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                                  title="Show data source"
                                >
                                  <Info size={14} className="text-slate-600 dark:text-slate-400" />
                                </button>
                                {showInfoTooltip === metric && (
                                  <div className="absolute bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-4 w-72 z-[9999] shadow-2xl text-xs text-black dark:text-slate-100 max-h-[600px] overflow-y-auto"
                                    style={{
                                      left: '-290px',
                                      top: '0px'
                                    }}>
                                    <button
                                      onClick={() => setShowInfoTooltip(null)}
                                      className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                      title="Close"
                                    >
                                      ✕
                                    </button>
                                    <p className="font-semibold mb-3 text-black dark:text-white text-base pr-6">{metric}</p>
                                    <div className="mb-3 pb-3 border-b border-slate-200 dark:border-slate-700">
                                      <p className="text-sm font-semibold text-black dark:text-slate-300 mb-1">National Data Source:</p>
                                      <p className="text-sm text-black dark:text-slate-300 leading-relaxed">{data.nationalRecord?.source || 'Ministry of Energy and Petroleum - Energy and Petroleum Statistics Report'}</p>
                                    </div>
                                    <div className="mb-3 pb-3 border-b border-slate-200 dark:border-slate-700">
                                      <p className="text-sm font-semibold text-black dark:text-slate-300 mb-1">CEP Reference Source:</p>
                                      <p className="text-sm text-black dark:text-slate-300 leading-relaxed">{data.countyRecord?.reference || data.nationalRecord?.reference || 'County Energy Profile Reference'}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm font-semibold text-black dark:text-slate-300 mb-1">INEP Reference:</p>
                                      <p className="text-sm text-black dark:text-slate-300 leading-relaxed">{data.countyRecord?.inep || data.nationalRecord?.inep || 'Integrated National Energy and Petroleum Plan'}</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-4 pb-4">
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex-1">
                                <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">NATIONAL</p>
                                <p className="text-lg font-bold text-slate-900 dark:text-white">{data.national !== null ? formatNumber(data.national) : 'N/A'}</p>
                              </div>
                              <div className="w-px bg-slate-200 dark:bg-slate-700 h-12"></div>
                              <div className="flex-1 text-right">
                                <p className="text-xs font-semibold mb-2" style={{ color: colors.accent }}>{data.countyName.toUpperCase()}</p>
                                <p className="text-lg font-bold" style={{ color: colors.accent }}>{data.county !== null ? formatNumber(data.county) : 'N/A'}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </div>

                {/* ENERGY DEMAND & CONSUMPTION SECTION */}
                <div>
                  <div className="mb-4">
                    <h3 className="text-lg font-bold" style={{ color: '#0d47a1' }}>Energy Demand & Consumption</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Electricity Consumption Summary</p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {['Households (kWh)', 'Public Institutions / Facilities (kWh)', 'Commercial and Industrial Customers (kWh)', 'Total units sold (kWh)'].map((metric, idx) => {
                      const data = getComparisonData(metric)
                      return (
                        <Card key={metric} className="border border-slate-200/60 dark:border-slate-800/60 shadow-sm hover:shadow-md transition-all overflow-visible">
                          <CardHeader style={{ backgroundColor: colors.primary + '05' }} className="border-b border-slate-200/60 dark:border-slate-800/60 py-3 px-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <CardTitle className="text-slate-900 dark:text-white text-xs font-semibold line-clamp-2" style={{ color: colors.primary }}>
                                  {metric}
                                </CardTitle>
                                <p className="text-xs text-slate-500 mt-1">{data.nationalRecord?.unit || 'Unit not specified'}</p>
                              </div>
                              <div className="relative flex-shrink-0">
                                <button
                                  onClick={() => setShowInfoTooltip(showInfoTooltip === metric ? null : metric)}
                                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                                  title="Show data source"
                                >
                                  <Info size={14} className="text-slate-600 dark:text-slate-400" />
                                </button>
                                {showInfoTooltip === metric && (
                                  <div className="absolute bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-4 w-72 z-[9999] shadow-2xl text-xs text-black dark:text-slate-100 max-h-[600px] overflow-y-auto"
                                    style={{
                                      left: '-290px',
                                      top: '0px'
                                    }}>
                                    <button
                                      onClick={() => setShowInfoTooltip(null)}
                                      className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                      title="Close"
                                    >
                                      ��
                                    </button>
                                    <p className="font-semibold mb-3 text-black dark:text-white text-base pr-6">{metric}</p>
                                    <div className="mb-3 pb-3 border-b border-slate-200 dark:border-slate-700">
                                      <p className="text-sm font-semibold text-black dark:text-slate-300 mb-1">National Data Source:</p>
                                      <p className="text-sm text-black dark:text-slate-300 leading-relaxed">{data.nationalRecord?.source || 'Ministry of Energy and Petroleum - Energy and Petroleum Statistics Report'}</p>
                                    </div>
                                    <div className="mb-3 pb-3 border-b border-slate-200 dark:border-slate-700">
                                      <p className="text-sm font-semibold text-black dark:text-slate-300 mb-1">CEP Reference Source:</p>
                                      <p className="text-sm text-black dark:text-slate-300 leading-relaxed">{data.countyRecord?.reference || data.nationalRecord?.reference || 'County Energy Profile Reference'}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm font-semibold text-black dark:text-slate-300 mb-1">INEP Reference:</p>
                                      <p className="text-sm text-black dark:text-slate-300 leading-relaxed">{data.countyRecord?.inep || data.nationalRecord?.inep || 'Integrated National Energy and Petroleum Plan'}</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-4 pb-4">
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex-1">
                                <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">NATIONAL</p>
                                <p className="text-lg font-bold text-slate-900 dark:text-white">{data.national !== null ? formatNumber(data.national) : 'N/A'}</p>
                              </div>
                              <div className="w-px bg-slate-200 dark:bg-slate-700 h-12"></div>
                              <div className="flex-1 text-right">
                                <p className="text-xs font-semibold mb-2" style={{ color: colors.accent }}>{data.countyName.toUpperCase()}</p>
                                <p className="text-lg font-bold" style={{ color: colors.accent }}>{data.county !== null ? formatNumber(data.county) : 'N/A'}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CHARTS SECTION - Exploratory Visualization */}
        <div className="mt-12 pb-32">
          <div className="mb-8">
            <h3 className="text-lg font-bold" style={{ color: '#001f3f' }}>Explore National Trends</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">Analysis of key energy and infrastructure metrics across Kenya</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Consumption per County Bar Chart */}
            {consumptionPerCountyData.length > 0 && (
              <div className="group">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold" style={{ color: '#0d47a1' }}>Consumption by County</h3>
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300">{selectedYear}</span>
                </div>
                <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-700 transition-all hover:shadow-lg">
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={consumptionPerCountyData}>
                      <CartesianGrid strokeDasharray="2 2" stroke="#e2e8f0" opacity={0.3} />
                      <XAxis dataKey="county" stroke="#94a3b8" style={{ fontSize: '12px' }} angle={-45} textAnchor="end" height={80} />
                      <YAxis stroke="#94a3b8" style={{ fontSize: '11px' }} width={60} tickFormatter={(value) => {
                        if (value >= 1000000000) return (value / 1000000000).toFixed(1) + 'B'
                        if (value >= 1000000) return (value / 1000000).toFixed(0) + 'M'
                        return value.toString()
                      }} />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 1)',
                          border: '1px solid #e2e8f0',
                          borderRadius: '6px',
                          padding: '8px',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                        }}
                        labelStyle={{ color: '#1f2937', fontSize: '12px', fontWeight: 'bold' }}
                        formatter={(value: any, name: any) => {
                          if (value >= 1000000000) return [(value / 1000000000).toFixed(2) + 'B kWh', name]
                          return [(value / 1000000).toFixed(2) + 'M kWh', name]
                        }}
                        cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
                      />
                      <Bar dataKey="consumption" fill="#1e3a8a" radius={[4, 4, 0, 0]} name="Households (kWh)" />
                    </BarChart>
                  </ResponsiveContainer>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-4">Household electricity consumption by county</p>
                </div>
              </div>
            )}

            {/* Cooking Fuels Card */}
            {cookingFuelData.length > 0 && (
              <div className="group">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold" style={{ color: '#0d47a1' }}> Household Cooking Fuel Sources</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300"></span>
                    <div className="relative">
                      <button
                        onClick={() => setShowInfoTooltip(showInfoTooltip === 'cookingFuels' ? null : 'cookingFuels')}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                        title="Show data source"
                      >
                        <Info size={16} className="text-slate-600 dark:text-slate-400" />
                      </button>
                      {showInfoTooltip === 'cookingFuels' && (
                        <div className="absolute right-0 top-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 w-80 z-50 shadow-lg text-xs text-black dark:text-slate-100">
                          <p className="font-semibold mb-2 text-black dark:text-white">Household Cooking Fuel Sources</p>
                          <div className="mb-3 pb-3 border-b border-slate-200 dark:border-slate-700">
                            <p className="text-xs font-semibold text-black dark:text-slate-300 mb-1">Description:</p>
                            <p className="text-xs leading-relaxed text-black dark:text-slate-300">Distribution of primary cooking fuel sources across households, including firewood, charcoal, LPG, and electricity.</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-black dark:text-slate-300 mb-1">Data Source:</p>
                            <p className="text-xs text-black dark:text-slate-300">Ministry of Energy and Petroleum - Energy and Petroleum Statistics Report</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-700 transition-all hover:shadow-lg">
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={cookingFuelData}>
                      <CartesianGrid strokeDasharray="2 2" stroke="#e2e8f0" opacity={0.3} />
                      <XAxis dataKey="year" stroke="#94a3b8" style={{ fontSize: '12px' }} />
                      <YAxis stroke="#94a3b8" style={{ fontSize: '11px' }} width={60} label={{ value: 'PJ', angle: -90, position: 'insideLeft', offset: 0, style: { fill: '#94a3b8' } }} />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 1)',
                          border: '1px solid #e2e8f0',
                          borderRadius: '6px',
                          padding: '8px',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                        }}
                        labelStyle={{ color: '#1f2937', fontSize: '12px', fontWeight: 'bold' }}
                        formatter={(value: any, name: any) => [(value as any).toFixed(1) + '%', name]}
                        cursor={{ fill: 'rgba(251, 146, 60, 0.05)' }}
                      />
                      <Bar dataKey="Firewood" stackId="fuel" fill="#325f8c" />
                      <Bar dataKey="Charcoal" stackId="fuel" fill="#1e40af" />
                      <Bar dataKey="LPG" stackId="fuel" fill="#2563eb" />
                      <Bar dataKey="Electricity" stackId="fuel" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-4">Distribution of primary cooking fuel sources across households</p>
                </div>
              </div>
            )}

            {/* Grid Connectivity per County */}
            {connectivityPerCountyData.length > 0 && (
              <div className="group">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold" style={{ color: '#0d47a1' }}>Grid Connectivity by County</h3>
                    <div className="relative">
                      <button
                        onClick={() => setShowInfoTooltip(showInfoTooltip === 'gridCountyConnectivity' ? null : 'gridCountyConnectivity')}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                        title="Show data source"
                      >
                        <Info size={16} className="text-slate-600 dark:text-slate-400" />
                      </button>
                      {showInfoTooltip === 'gridCountyConnectivity' && (
                        <div className="absolute left-0 top-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 w-80 z-50 shadow-lg text-xs text-black dark:text-slate-100">
                          <p className="font-semibold mb-2 text-black dark:text-white">Grid Connectivity by County</p>
                          <div className="mb-2">
                            <p className="text-xs font-semibold text-black dark:text-slate-300 mb-1">Description:</p>
                            <p className="text-xs text-black dark:text-slate-300">Percentage of households connected to the national electricity grid across different counties in Kenya.</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-black dark:text-slate-300 mb-1">Data Source:</p>
                            <p className="text-xs text-black dark:text-slate-300">Ministry of Energy and Petroleum - Energy and Petroleum Statistics Report</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">{selectedYear} (%)</span>
                </div>
                <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-700 transition-all hover:shadow-lg">
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={connectivityPerCountyData}>
                      <CartesianGrid strokeDasharray="2 2" stroke="#e2e8f0" opacity={0.3} />
                      <XAxis dataKey="county" stroke="#94a3b8" style={{ fontSize: '12px' }} angle={-45} textAnchor="end" height={80} />
                      <YAxis stroke="#94a3b8" style={{ fontSize: '11px' }} width={60} domain={[0, 100]} label={{ value: '%', angle: -90, position: 'insideLeft', offset: 0, style: { fill: '#94a3b8' } }} />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 1)',
                          border: '1px solid #e2e8f0',
                          borderRadius: '6px',
                          padding: '8px',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                        }}
                        labelStyle={{ color: '#1f2937', fontSize: '12px', fontWeight: 'bold' }}
                        formatter={(value: any, name: any) => [(value as any).toFixed(1) + '%', name]}
                        cursor={{ fill: 'rgba(16, 185, 129, 0.05)' }}
                      />
                      <Bar dataKey="connectivity" fill="#325f8c" radius={[4, 4, 0, 0]} name="Grid Access (%)" />
                    </BarChart>
                  </ResponsiveContainer>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-4">Percentage of households connected to national electricity grid by county</p>
                </div>
              </div>
            )}

            {/* National Grid Connectivity Trend */}
            {connectivityTrendData.length > 0 && (
              <div className="group">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold" style={{ color: '#0d47a1' }}>National Grid Connectivity Trend</h3>
                    <div className="relative">
                      <button
                        onClick={() => setShowInfoTooltip(showInfoTooltip === 'gridNationalTrend' ? null : 'gridNationalTrend')}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                        title="Show data source"
                      >
                        <Info size={16} className="text-slate-600 dark:text-slate-400" />
                      </button>
                      {showInfoTooltip === 'gridNationalTrend' && (
                        <div className="absolute left-0 top-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 w-80 z-50 shadow-lg text-xs text-black dark:text-slate-100">
                          <p className="font-semibold mb-2 text-black dark:text-white">National Grid Connectivity Trend</p>
                          <div className="mb-2">
                            <p className="text-xs font-semibold text-black dark:text-slate-300 mb-1">Description:</p>
                            <p className="text-xs text-black dark:text-slate-300">Historical trend showing the percentage of households connected to the national electricity grid across Kenya over time.</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-black dark:text-slate-300 mb-1">Data Source:</p>
                            <p className="text-xs text-black dark:text-slate-300">Ministry of Energy and Petroleum - Energy and Petroleum Statistics Report</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"></span>
                </div>
                <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-700 transition-all hover:shadow-lg">
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={connectivityTrendData}>
                      <CartesianGrid strokeDasharray="2 2" stroke="#e2e8f0" opacity={0.3} />
                      <XAxis dataKey="year" stroke="#94a3b8" style={{ fontSize: '12px' }} />
                      <YAxis stroke="#94a3b8" style={{ fontSize: '11px' }} width={60} domain={[0, 100]} label={{ value: '%', angle: -90, position: 'insideLeft', offset: 0, style: { fill: '#94a3b8' } }} />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 1)',
                          border: '1px solid #e2e8f0',
                          borderRadius: '6px',
                          padding: '8px',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                        }}
                        labelStyle={{ color: '#1f2937', fontSize: '12px', fontWeight: 'bold' }}
                        formatter={(value: any, name: any) => [(value as any).toFixed(1) + '%', name]}
                        cursor={{ fill: 'rgba(16, 185, 129, 0.05)' }}
                      />
                      <Bar dataKey="connectivity" fill="#325f8c" radius={[4, 4, 0, 0]} name="Grid Access (%)" />
                    </BarChart>
                  </ResponsiveContainer>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-4">National trend of household grid connectivity over time</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
