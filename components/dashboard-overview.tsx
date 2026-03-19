'use client'

import { TabsContent } from "@/components/ui/tabs"
import { TabsTrigger } from "@/components/ui/tabs"
import { TabsList } from "@/components/ui/tabs"
import { Tabs } from "@/components/ui/tabs"
import React, { useEffect } from "react"
import { TooltipProvider, Tooltip } from "@/components/ui/tooltip"
import { Select, SelectItem, SelectContent, SelectValue, SelectTrigger } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MapPin, X } from 'lucide-react'
import KenyaSVGInteractiveMap from '@/components/kenya-svg-interactive-map'
import { ColorizedGHIMap, ColorizedWindMap } from '@/components/colorized-maps'
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Bar, Line, Tooltip as RechartsTooltip, Legend, ComposedChart } from 'recharts'
import { Navigation, Database, Sun, Info } from 'lucide-react' // Import Database and Sun icons

const colors = {
  primary: '#0f172a',
  primaryLight: '#f0f5fb',
  primaryBorder: '#1e293b',
  accent: '#10b981',
}

const ALL_KENYA_COUNTIES = ['Baringo', 'Bomet', 'Bungoma', 'Busia', 'Elgeyo-Marakwet', 'Embu', 'Garissa', 'Homa Bay', 'Isiolo', 'Kajiado', 'Kakamega', 'Kericho', 'Kiambu', 'Kilifi', 'Kirinyaga', 'Kisii', 'Kisumu', 'Kitui', 'Kwale', 'Laikipia', 'Lamu', 'Machakos', 'Makueni', 'Mandera', 'Mara', 'Marsabit', 'Meru', 'Migori', 'Mombasa', 'Murang\'a', 'Nairobi', 'Nakuru', 'Nandi', 'Narok', 'Nyamira', 'Nyandarua', 'Nyeri', 'Samburu', 'Siaya', 'Taita-Taveta', 'Tana River', 'Tharaka-Nithi', 'Trans Nzoia', 'Turkana', 'Uasin Gishu', 'Vihiga', 'Wajir']

const COUNTIES_WITH_DATA = ['Kiambu', 'Kilifi', 'Nyandarua']

export default function DashboardOverview() {
  const [mapLayer, setMapLayer] = React.useState('counties')
  const [countyCapacityData, setCountyCapacityData] = React.useState<any[]>([])
  const [nationalTrendData, setNationalTrendData] = React.useState<any[]>([])
  const [countiesWithData, setCountiesWithData] = React.useState<string[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [insightYear, setInsightYear] = React.useState('2019')

  // National Key Insights values
  const [gridAccess, setGridAccess] = React.useState('60%')
  const [solarHouseholds, setSolarHouseholds] = React.useState('6%')
  const [totalHouseholds, setTotalHouseholds] = React.useState('13.7M')
  const [energyData, setEnergyData] = React.useState<any[]>([])
  const [cookingFuelsData, setCookingFuelsData] = React.useState<any[]>([])
  const [showInfoTooltip, setShowInfoTooltip] = React.useState<string | null>(null)

  useEffect(() => {
    // Fetch raw MDG data from API route
    const fetchData = async () => {
      try {
        const response = await fetch('/api/mdg-data')
        if (!response.ok) throw new Error('Failed to fetch MDG data')

        const json = await response.json()
        console.log('[MDG] Full API response total:', json.total)
        const records = json.data || []

        if (!records || records.length === 0) {
          console.log('[MDG] No records in response')
          setIsLoading(false)
          return
        }

        console.log('[MDG] Dashboard received records:', records.length)

        // Filter only to specific counties and National
        const allowedAdministrations = ['Kiambu', 'Kilifi', 'Nyandarua', 'National']
        const filteredRecords = records.filter((r: any) => allowedAdministrations.includes(r.administration))
        console.log('[MDG] Filtered records:', filteredRecords.length)

        // Extract unique administrations (National + counties)
        const administrations = [...new Set(filteredRecords.map((r: any) => r.administration).filter(Boolean))] as string[]
        const counties = administrations.filter(a => a !== 'National')
        setCountiesWithData(counties)

        // Extract National Key Insights values
        const nationalRecords = filteredRecords.filter((r: any) => r.administration === 'National')

        console.log('[MDG] National records count:', nationalRecords.length)
        console.log('[MDG] Sample national descriptions:', nationalRecords.slice(0, 5).map((r: any) => ({ desc: r.description, data: r.data })))

        // Total Households - Number of Households (use insightYear data from data object)
        const householdsRecord = nationalRecords.find((r: any) =>
          r.description?.toLowerCase().includes('number of households')
        )
        console.log('[MDG] Households record found:', !!householdsRecord, 'Description:', householdsRecord?.description, 'Value:', householdsRecord?.data?.[insightYear])
        if (householdsRecord?.data?.[insightYear]) {
          const value = householdsRecord.data[insightYear]
          if (value > 1000000) {
            setTotalHouseholds((value / 1000000).toFixed(1) + 'M')
          } else if (value > 1000) {
            setTotalHouseholds((value / 1000).toFixed(1) + 'K')
          } else {
            setTotalHouseholds(value.toString())
          }
        }

        // Grid Access - Electricity connectivity percentage (for insightYear)
        const gridAccessRecord = nationalRecords.find((r: any) =>
          r.description?.toLowerCase().includes('total connectivity') &&
          r.unit === '%' &&
          r.data?.[insightYear] !== undefined &&
          r.data?.[insightYear] !== null
        )
        console.log('[MDG] Grid Access record found:', !!gridAccessRecord, 'Description:', gridAccessRecord?.description, 'Value:', gridAccessRecord?.data?.[insightYear])
        if (gridAccessRecord?.data?.[insightYear]) {
          const value = gridAccessRecord.data[insightYear]
          setGridAccess((typeof value === 'number' ? value.toFixed(1) : value) + '%')
        }

        // Solar Home Systems - Households connected to solar home systems (%)
        const solarRecord = nationalRecords.find((r: any) =>
          r.description?.toLowerCase().includes('households connected to solar') &&
          r.unit === '%' &&
          r.data?.[insightYear] !== undefined &&
          r.data?.[insightYear] !== null
        )
        console.log('[MDG] Solar record found:', !!solarRecord, 'Description:', solarRecord?.description, 'Value:', solarRecord?.data?.[insightYear])
        if (solarRecord?.data?.[insightYear]) {
          const value = solarRecord.data[insightYear]
          setSolarHouseholds((typeof value === 'number' ? value.toFixed(1) : value) + '%')
        }

        // Find all consumption categories for combo chart
        const consumptionRecords = nationalRecords.filter((r: any) =>
          r.theme?.toLowerCase().includes('summary of electricity consumption') &&
          r.category?.toLowerCase().includes('consumption') &&
          r.administration?.toLowerCase() === 'national' &&
          r.data && Object.keys(r.data).length > 0
        )

        if (consumptionRecords.length > 0) {
          console.log('[MDG] Found consumption records:', consumptionRecords.length, consumptionRecords.map((r: any) => r.description))

          const consumptionMap = new Map<string, any>()
          const years = new Set<string>()

          // Collect all years
          consumptionRecords.forEach(record => {
            if (record.data && typeof record.data === 'object') {
              Object.keys(record.data).forEach(year => {
                if (/^\d{4}$/.test(year)) years.add(year)
              })
            }
          })

          const sortedYears = Array.from(years).sort((a, b) => parseInt(a) - parseInt(b))

          // Build chart data with all consumption categories
          sortedYears.forEach(year => {
            const dataPoint: any = { year }
            consumptionRecords.forEach(record => {
              if (record.data?.[year] !== undefined && record.data?.[year] !== null) {
                // Keep the full description name including (kWh)
                const categoryName = record.description?.trim() || 'Unknown'
                const value = parseFloat(record.data[year])
                if (!isNaN(value)) {
                  dataPoint[categoryName] = value
                }
              }
            })
            if (Object.keys(dataPoint).length > 1) { // More than just 'year'
              consumptionMap.set(year, dataPoint)
            }
          })

          const consumptionData = Array.from(consumptionMap.values())
          console.log('[MDG] Consumption data extracted:', consumptionData.length, 'records', consumptionData[0])
          if (consumptionData.length > 0) {
            setEnergyData(consumptionData as any)
          }
        } else {
          console.log('[MDG] No consumption records found. Check filter criteria.')
        }

        // Find cooking fuels trends data
        const cookingFuelsRecords = nationalRecords.filter((r: any) =>
          r.theme?.toLowerCase().includes('cooking fuels') &&
          r.administration?.toLowerCase() === 'national' &&
          r.data && Object.keys(r.data).length > 0
        )

        if (cookingFuelsRecords.length > 0) {
          console.log('[MDG] Found cooking fuels records:', cookingFuelsRecords.length, cookingFuelsRecords.map((r: any) => r.description))
          const fuelsMap = new Map<string, any>()
          const years = new Set<string>()

          cookingFuelsRecords.forEach(record => {
            if (record.data && typeof record.data === 'object') {
              Object.keys(record.data).forEach(year => {
                if (/^\d{4}$/.test(year)) years.add(year)
              })
            }
          })

          const sortedYears = Array.from(years).sort((a, b) => parseInt(a) - parseInt(b))

          sortedYears.forEach(year => {
            const dataPoint: any = { year }
            cookingFuelsRecords.forEach(record => {
              if (record.data?.[year] !== undefined && record.data?.[year] !== null) {
                // Remove % from the end if present
                const fuelType = record.description?.replace(/\s*%\s*$/g, '').trim() || 'Unknown'
                const value = parseFloat(record.data[year])
                if (!isNaN(value)) {
                  dataPoint[fuelType] = value
                }
              }
            })
            if (Object.keys(dataPoint).length > 1) { // More than just 'year'
              fuelsMap.set(year, dataPoint)
            }
          })

          const fuelsData = Array.from(fuelsMap.values())
          console.log('[MDG] Cooking fuels data extracted:', fuelsData.length, 'records', fuelsData[0])
          if (fuelsData.length > 0) {
            setCookingFuelsData(fuelsData as any)
          }
        } else {
          console.log('[MDG] No cooking fuels records found. Available themes:', Array.from(new Set(nationalRecords.map((r: any) => r.theme))).slice(0, 5))
        }

        // Build county data - show all county records with their values, filtered to allowed counties
        const allowedCounties = ['Kiambu', 'Kilifi', 'Nyandarua']
        const countyDataMap = new Map<string, any>()
        filteredRecords.forEach((record: any) => {
          if (record.administration && allowedCounties.includes(record.administration)) {
            const key = `${record.administration}_${record.theme}_${record.sector}`
            const capacity = record.capacity ? parseInt(record.capacity) : 0

            countyDataMap.set(key, {
              county: record.administration,
              theme: record.theme,
              sector: record.sector,
              description: record.description,
              value: capacity,
              unit: record.unit || '',
              category: record.category,
            })
          }
        })

        const capacityData = Array.from(countyDataMap.values()).slice(0, 10) // Limit to 10 for chart readability
        console.log('[MDG] County data extracted:', capacityData.length, 'records')
        if (capacityData.length > 0) {
          setCountyCapacityData(capacityData as any)
        }
      } catch (error) {
        console.error('[MDG] Error loading MDG data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [insightYear])

  return (
    <TooltipProvider>
      <div className="space-y-8">
        {/* Title and Description */}
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">Overview</h2>
          <div className="bg-slate-50 dark:bg-slate-900/40 p-6 rounded-lg shadow-md border border-slate-200/40 dark:border-slate-800/40">
            <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed text-justify">
              This dashboard presents <span className="font-bold">Minimum Data Guidelines (MDG)</span> for <span className="font-bold">INEP</span> and <span className="font-bold">Kenya</span> counties energy planning. This phase aggregates data across three Kenyan counties: <span className="font-bold">Kiambu, Kilifi, and Nyandarua</span>, under the <span className="font-bold">Robust and Integrated PLanning of Energy Systems (RIPPLES)</span> program. It provides baseline energy data, 2030 targets, and key indicators across resource potential, electricity access, demand, infrastructure, and socio-economic factors.
            </p>
          </div>
        </div>

        {/* Main Layout: Map on Left, Content on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
          {/* LEFT: Map - Takes 1 column */}
          <div className="lg:col-span-1">
            <Card className="shadow-md bg-slate-50/50 dark:bg-slate-900/30 border border-slate-200/40 dark:border-slate-800/40 sticky top-6">
              <CardHeader style={{ backgroundColor: colors.primary + '05' }} className="border-b border-slate-200/30 dark:border-slate-800/30">
                <div className="flex items-center justify-between">
                  <CardTitle style={{ color: colors.primary }} className="flex items-center gap-2 text-base">
                    <MapPin className="h-4 w-4" />
                    Kenya Map
                  </CardTitle>
                </div>

                {/* Map Layer Selector */}
                <div className="mt-3 space-y-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Map Layer</label>
                  <Select value={mapLayer} onValueChange={setMapLayer}>
                    <SelectTrigger className="text-xs" style={{ borderColor: colors.primaryBorder }}>
                      <SelectValue placeholder="Select map layer..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="counties">County Boundaries</SelectItem>
                      <SelectItem value="ghi">GHI (Solar)</SelectItem>
                      <SelectItem value="wind">Wind Speed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                {/* Render different map based on layer selection */}
                {mapLayer === 'counties' && (
                  <KenyaSVGInteractiveMap selectedCounty={null} onCountySelect={undefined} />
                )}

                {(mapLayer === 'ghi' || mapLayer === 'wind') && (
                  <div className="space-y-3">
                    <KenyaSVGInteractiveMap 
                      mapLayer={mapLayer} 
                      showCountySelector={false}
                      showFilters={false}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* RIGHT: Stats and Info - Takes 3 columns */}
          <div className="lg:col-span-3 space-y-3">
            {/* Section Title with Year Filter */}
            <div className="border-b-2" style={{ borderColor: colors.primary }}>
              <div className="py-3 flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white" style={{ color: '#0d47a1' }}>
                  National Key Insights
                </h3>
                <Select value={insightYear} onValueChange={setInsightYear}>
                  <SelectTrigger className="w-32 text-xs" style={{ borderColor: colors.primaryBorder }}>
                    <SelectValue placeholder="Select year..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2019">2019</SelectItem>
                    <SelectItem value="2020">2020</SelectItem>
                    <SelectItem value="2021">2021</SelectItem>
                    <SelectItem value="2022">2022</SelectItem>
                    <SelectItem value="2023">2023</SelectItem>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
                    <SelectItem value="2026">2026</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Quick Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Card className="shadow-md bg-slate-50/50 dark:bg-slate-900/30 border border-slate-200/40 dark:border-slate-800/40 hover:shadow-lg transition-all">
                <CardContent className="pt-5 px-5 pb-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div style={{ color: colors.primary }} className="text-2xl font-bold mb-3">
                        {gridAccess}
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 text-xs font-medium">Grid Access</p>
                      <p className="text-xs text-slate-500 mt-3">Electricity connectivity ({insightYear})</p>
                    </div>
                    <div className="relative flex-shrink-0">
                      <button
                        onClick={() => setShowInfoTooltip(showInfoTooltip === 'gridAccess' ? null : 'gridAccess')}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                        title="Show data source"
                      >
                        <Info size={16} className="text-slate-600 dark:text-slate-400" />
                      </button>
                      {showInfoTooltip === 'gridAccess' && (
                        <div className="absolute right-0 top-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 w-72 z-50 shadow-lg text-xs text-black dark:text-slate-100">
                          <p className="font-semibold mb-2 text-black dark:text-white">Grid Access</p>
                          <p className="text-xs text-black dark:text-slate-300">Data source: Ministry of Energy and Petroleum - Total Connectivity Statistics</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-md bg-slate-50/50 dark:bg-slate-900/30 border border-slate-200/40 dark:border-slate-800/40 hover:shadow-lg transition-all">
                <CardContent className="pt-5 px-5 pb-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div style={{ color: colors.primary }} className="text-2xl font-bold mb-3">
                        {solarHouseholds}
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 text-xs font-medium">Solar Home Systems</p>
                      <p className="text-xs text-slate-500 mt-3">Households connected ({insightYear})</p>
                    </div>
                    <div className="relative flex-shrink-0">
                      <button
                        onClick={() => setShowInfoTooltip(showInfoTooltip === 'solarSystems' ? null : 'solarSystems')}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                        title="Show data source"
                      >
                        <Info size={16} className="text-slate-600 dark:text-slate-400" />
                      </button>
                      {showInfoTooltip === 'solarSystems' && (
                        <div className="absolute right-0 top-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 w-72 z-50 shadow-lg text-xs text-black dark:text-slate-100">
                          <p className="font-semibold mb-2 text-black dark:text-white">Solar Home Systems</p>
                          <p className="text-xs text-black dark:text-slate-300">Data source: Ministry of Energy and Petroleum - Households Connected to Solar SHS</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-md bg-slate-50/50 dark:bg-slate-900/30 border border-slate-200/40 dark:border-slate-800/40 hover:shadow-lg transition-all">
                <CardContent className="pt-5 px-5 pb-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div style={{ color: colors.primary }} className="text-2xl font-bold mb-3">
                        {totalHouseholds}
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 text-xs font-medium">Total Households</p>
                      <p className="text-xs text-slate-500 mt-3">Number of households ({insightYear})</p>
                    </div>
                    <div className="relative flex-shrink-0">
                      <button
                        onClick={() => setShowInfoTooltip(showInfoTooltip === 'totalHouseholds' ? null : 'totalHouseholds')}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                        title="Show data source"
                      >
                        <Info size={16} className="text-slate-600 dark:text-slate-400" />
                      </button>
                      {showInfoTooltip === 'totalHouseholds' && (
                        <div className="absolute right-0 top-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 w-72 z-50 shadow-lg text-xs text-black dark:text-slate-100">
                          <p className="font-semibold mb-2 text-black dark:text-white">Total Households</p>
                          <p className="text-xs text-black dark:text-slate-300">Data source: Ministry of Energy and Petroleum - Number of Households Statistics</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-md bg-slate-50/50 dark:bg-slate-900/30 border border-slate-200/40 dark:border-slate-800/40 hover:shadow-lg transition-all">
                <CardContent className="pt-5 px-5 pb-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div style={{ color: colors.primary }} className="text-2xl font-bold mb-3">
                        3
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 text-xs font-medium">Counties Covered</p>
                      <p className="text-xs text-slate-500 mt-3">All regions</p>
                    </div>
                    <div className="relative flex-shrink-0">
                      <button
                        onClick={() => setShowInfoTooltip(showInfoTooltip === 'countiesCovered' ? null : 'countiesCovered')}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                        title="Show data source"
                      >
                        <Info size={16} className="text-slate-600 dark:text-slate-400" />
                      </button>
                      {showInfoTooltip === 'countiesCovered' && (
                        <div className="absolute right-0 top-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 w-72 z-50 shadow-lg text-xs text-black dark:text-slate-100">
                          <p className="font-semibold mb-2 text-black dark:text-white">Counties Covered</p>
                          <p className="text-xs text-black dark:text-slate-300">Data available for Kiambu, Kilifi, and Nyandarua counties</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Section */}
            <div className="space-y-3 pt-2">
              {/* Section Header */}
              <div className="border-b-2" style={{ borderColor: colors.primary }}>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white py-3" style={{ color: '#0d47a1' }}>
                  National Energy Analysis
                </h3>
              </div>

              {/* Major Consumption Categories */}
              <Card className="shadow-md bg-slate-50/50 dark:bg-slate-900/30 border border-slate-200/40 dark:border-slate-800/40">
                <CardHeader style={{ backgroundColor: colors.primary + '05' }} className="py-3 border-b border-slate-200/30 dark:border-slate-800/30">
                  <div className="flex items-center justify-between">
                    <CardTitle style={{ color: colors.primary }} className="text-sm font-semibold">Major Consumption - Households & Commercial </CardTitle>
                    <div className="relative">
                      <button
                        onClick={() => setShowInfoTooltip(showInfoTooltip === 'majorConsumption' ? null : 'majorConsumption')}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                        title="Show data source and explanation"
                      >
                        <Info size={16} className="text-slate-600 dark:text-slate-400" />
                      </button>
                      {showInfoTooltip === 'majorConsumption' && (
                        <div className="absolute right-0 top-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 w-80 z-50 shadow-lg text-xs text-black dark:text-slate-100 max-h-96 overflow-y-auto">
                          <p className="font-semibold mb-2 text-black dark:text-white">Major Consumption - Households & Commercial</p>
                          <div className="mb-3 pb-3 border-b border-slate-200 dark:border-slate-700">
                            <p className="text-xs font-semibold text-black dark:text-slate-300 mb-1">Description:</p>
                            <p className="text-xs leading-relaxed text-black dark:text-slate-300">Shows energy consumption patterns for households and commercial customers across Kenya from 2019-2033, measured in kilowatt-hours (kWh).</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-black dark:text-slate-300 mb-1">Data Source:</p>
                            <p className="text-xs text-black dark:text-slate-300">Ministry of Energy and Petroleum - Energy and Petroleum Statistics Report</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4" style={{ backgroundColor: '#f8fbff' }}>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={energyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                      <XAxis
                        dataKey="year"
                        stroke="#64748b"
                        style={{ fontSize: '12px' }}
                      />
                      <YAxis
                        stroke="#64748b"
                        style={{ fontSize: '12px' }}
                        label={{ value: 'kWh', angle: -90, position: 'insideLeft' }}
                        tickFormatter={(value) => {
                          if (value >= 1000000000) return (value / 1000000000).toFixed(1) + 'B'
                          if (value >= 1000000) return (value / 1000000).toFixed(0) + 'M'
                          if (value >= 1000) return (value / 1000).toFixed(0) + 'K'
                          return value.toString()
                        }}
                      />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                        }}
                        labelStyle={{ color: '#1f2937' }}
                        formatter={(value: any, name: any) => {
                          const num = parseFloat(value)
                          if (num >= 1000000000) return [(num / 1000000000).toFixed(2) + 'B', name]
                          if (num >= 1000000) return [(num / 1000000).toFixed(2) + 'M', name]
                          return [num.toLocaleString(), name]
                        }}
                        cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                      <Bar dataKey="Households (kWh)" fill="#1e3a8a" name="Households" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Commercial and Industrial Customers (kWh)" fill="#1e40af" name="Commercial & Industrial" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Total units sold (kWh)" fill="#10b981" name="Total Sold" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
                {/* Data Summary */}
                {energyData.length > 0 && (
                  <div className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200/30 dark:border-slate-800/30 px-5 py-4">
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-3">Selected Year Data ({insightYear})</p>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                      {energyData.find((d: any) => d.year === insightYear)?.['Households (kWh)'] && (
                        <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                          <p className="text-xs text-slate-500 dark:text-slate-400">Households</p>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1">{(energyData.find((d: any) => d.year === insightYear)?.['Households (kWh)'] / 1000000000).toFixed(2)}B kWh</p>
                        </div>
                      )}
                      {energyData.find((d: any) => d.year === insightYear)?.['Commercial and Industrial Customers (kWh)'] && (
                        <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                          <p className="text-xs text-slate-500 dark:text-slate-400">Commercial & Industrial</p>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1">{(energyData.find((d: any) => d.year === insightYear)?.['Commercial and Industrial Customers (kWh)'] / 1000000000).toFixed(2)}B kWh</p>
                        </div>
                      )}
                      {energyData.find((d: any) => d.year === insightYear)?.['Total units sold (kWh)'] && (
                        <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                          <p className="text-xs text-slate-500 dark:text-slate-400">Total Sold</p>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1">{(energyData.find((d: any) => d.year === insightYear)?.['Total units sold (kWh)'] / 1000000000).toFixed(2)}B kWh</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Card>

              {/* Minor Consumption Categories */}
              <Card className="shadow-md bg-slate-50/50 dark:bg-slate-900/30 border border-slate-200/40 dark:border-slate-800/40">
                <CardHeader style={{ backgroundColor: colors.primary + '05' }} className="py-3 border-b border-slate-200/30 dark:border-slate-800/30">
                  <div className="flex items-center justify-between">
                    <CardTitle style={{ color: colors.primary }} className="text-sm font-semibold">Other Consumption - Public & Street Lighting (2019-2033)</CardTitle>
                    <div className="relative">
                      <button
                        onClick={() => setShowInfoTooltip(showInfoTooltip === 'otherConsumption' ? null : 'otherConsumption')}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                        title="Show data source and explanation"
                      >
                        <Info size={16} className="text-slate-600 dark:text-slate-400" />
                      </button>
                      {showInfoTooltip === 'otherConsumption' && (
                        <div className="absolute right-0 top-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 w-80 z-50 shadow-lg text-xs text-black dark:text-slate-100 max-h-96 overflow-y-auto">
                          <p className="font-semibold mb-2 text-black dark:text-white">Other Consumption - Public & Street Lighting</p>
                          <div className="mb-3 pb-3 border-b border-slate-200 dark:border-slate-700">
                            <p className="text-xs font-semibold text-black dark:text-slate-300 mb-1">Description:</p>
                            <p className="text-xs leading-relaxed text-black dark:text-slate-300">Shows energy consumption for public facilities and street lighting across Kenya from 2019-2033, measured in kilowatt-hours (kWh).</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-black dark:text-slate-300 mb-1">Data Source:</p>
                            <p className="text-xs text-black dark:text-slate-300">Ministry of Energy and Petroleum - Energy and Petroleum Statistics Report</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4" style={{ backgroundColor: '#f8fbff' }}>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={energyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#475569" opacity={0.3} />
                      <XAxis
                        dataKey="year"
                        stroke="#475569"
                        style={{ fontSize: '12px', fill: '#cbd5e1' }}
                      />
                      <YAxis
                        stroke="#475569"
                        style={{ fontSize: '12px', fill: '#cbd5e1' }}
                        label={{ value: 'kWh', angle: -90, position: 'insideLeft', style: { fill: '#cbd5e1' } }}
                        tickFormatter={(value) => {
                          if (value >= 1000000000) return (value / 1000000000).toFixed(1) + 'B'
                          if (value >= 1000000) return (value / 1000000).toFixed(0) + 'M'
                          if (value >= 1000) return (value / 1000).toFixed(0) + 'K'
                          return value.toString()
                        }}
                      />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                        }}
                        labelStyle={{ color: '#1f2937' }}
                        formatter={(value: any, name: any) => {
                          const num = parseFloat(value)
                          if (num >= 1000000000) return [(num / 1000000000).toFixed(2) + 'B', name]
                          if (num >= 1000000) return [(num / 1000000).toFixed(2) + 'M', name]
                          return [num.toLocaleString(), name]
                        }}
                        cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                      <Bar dataKey="Public Institutions / Facilities (kWh)" fill="#1e40af" name="Public Institutions" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Street lighting (kWh)" fill="#2563eb" name="Street Lighting" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
                {/* Data Summary */}
                {energyData.length > 0 && (
                  <div className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200/30 dark:border-slate-800/30 px-5 py-4">
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-3">Selected Year Data ({insightYear})</p>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                      {energyData.find((d: any) => d.year === insightYear)?.['Public Institutions / Facilities (kWh)'] && (
                        <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                          <p className="text-xs text-slate-500 dark:text-slate-400">Public Institutions</p>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1">{(energyData.find((d: any) => d.year === insightYear)?.['Public Institutions / Facilities (kWh)'] / 1000000000).toFixed(3)}B kWh</p>
                        </div>
                      )}
                      {energyData.find((d: any) => d.year === insightYear)?.['Street lighting (kWh)'] && (
                        <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                          <p className="text-xs text-slate-500 dark:text-slate-400">Street Lighting</p>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1">{(energyData.find((d: any) => d.year === insightYear)?.['Street lighting (kWh)'] / 1000000000).toFixed(3)}B kWh</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Card>

              {/* Cooking Fuels Distribution */}
              {cookingFuelsData.length > 0 && (
                <Card className="shadow-md bg-slate-50/50 dark:bg-slate-900/30 border border-slate-200/40 dark:border-slate-800/40">
                  <CardHeader style={{ backgroundColor: colors.primary + '05' }} className="py-3 border-b border-slate-200/30 dark:border-slate-800/30">
                    <div className="flex items-center justify-between">
                      <CardTitle style={{ color: colors.primary }} className="text-sm font-semibold">Cooking Fuel Mix by Household </CardTitle>
                      <div className="relative">
                        <button
                          onClick={() => setShowInfoTooltip(showInfoTooltip === 'cookingFuel' ? null : 'cookingFuel')}
                          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                          title="Show data source and explanation"
                        >
                          <Info size={16} className="text-slate-600 dark:text-slate-400" />
                        </button>
                        {showInfoTooltip === 'cookingFuel' && (
                          <div className="absolute right-0 top-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 w-80 z-50 shadow-lg text-xs text-black dark:text-slate-100 max-h-96 overflow-y-auto">
                            <p className="font-semibold mb-2 text-black dark:text-white">Cooking Fuel Mix by Household</p>
                            <div className="mb-3 pb-3 border-b border-slate-200 dark:border-slate-700">
                              <p className="text-xs font-semibold text-black dark:text-slate-300 mb-1">Description:</p>
                              <p className="text-xs leading-relaxed text-black dark:text-slate-300">Shows the distribution of cooking fuel types used by households across Kenya, including firewood, charcoal, LPG, electricity, and other biomass sources from 2019-2033.</p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-black dark:text-slate-300 mb-1">Data Source:</p>
                              <p className="text-xs text-black dark:text-slate-300">Ministry of Energy and Petroleum - Energy and Petroleum Statistics Report</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4" style={{ backgroundColor: '#f8fbff' }}>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={cookingFuelsData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#475569" opacity={0.3} />
                        <XAxis
                          dataKey="year"
                          stroke="#475569"
                          style={{ fontSize: '12px', fill: '#cbd5e1' }}
                        />
                        <YAxis
                          stroke="#475569"
                          style={{ fontSize: '12px', fill: '#cbd5e1' }}
                          label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft', style: { fill: '#cbd5e1' } }}
                          tickFormatter={(value) => value.toLocaleString()}
                        />
                        <RechartsTooltip
                          contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                          }}
                          labelStyle={{ color: '#1f2937' }}
                          formatter={(value: any, name: any) => [(value as any).toFixed(1) + '%', name]}
                          cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                        />
                        <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />
                        <Bar dataKey="Electricity" stackId="a" fill="#10b981" name="Electricity" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="LPG" stackId="a" fill="#14b8a6" name="LPG" />
                        <Bar dataKey="Charcoal" stackId="a" fill="#1e40af" name="Charcoal" />
                        <Bar dataKey="Firewood" stackId="a" fill="#1e3a8a" name="Firewood" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                  {/* Data Summary */}
                  {cookingFuelsData.length > 0 && (
                    <div className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200/30 dark:border-slate-800/30 px-5 py-4">
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-3">Selected Year Data ({insightYear})</p>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        {cookingFuelsData.find((d: any) => d.year === insightYear) && Object.entries(cookingFuelsData.find((d: any) => d.year === insightYear)!).map(([key, value]: any) => {
                          if (key === 'year') return null
                          return (
                            <div key={key} className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{key}</p>
                              <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1">{(value as any).toFixed(1)}%</p>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </Card>
              )}
            </div>
          </div>
        </div>
        {/* Bottom spacer to prevent content from hiding behind footer */}
        <div className="h-32" />
      </div>
    </TooltipProvider>
  )
}
