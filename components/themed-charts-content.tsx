'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MapPin, Info } from 'lucide-react'
import KenyaMapSVG from '@/components/kenya-map-svg'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface MDGRecord {
  administration: string
  theme: string
  description: string
  unit: string
  area?: string
  data: { [year: string]: number }
}

export function ThemesChartsContent() {
  const [records, setRecords] = useState<MDGRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [groupedByTheme, setGroupedByTheme] = useState<Record<string, MDGRecord[]>>({})
  const [selectedYear, setSelectedYear] = useState<string>('2024')
  const [availableYears, setAvailableYears] = useState<string[]>([])
  const [selectedCounty, setSelectedCounty] = useState<string>('All')
  const [showInfoTooltip, setShowInfoTooltip] = useState<string | null>(null)

  const AVAILABLE_COUNTIES = ['All', 'National', 'Kiambu', 'Kilifi', 'Nyandarua']

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/mdg-data')
        if (!response.ok) throw new Error('Failed to fetch data')
        const json = await response.json()
        
        const allRecords = json.data || []
        setRecords(allRecords)

        // Extract available years
        const yearsSet = new Set<string>()
        allRecords.forEach((record: MDGRecord) => {
          Object.keys(record.data || {}).forEach(year => {
            yearsSet.add(year)
          })
        })
        const years = Array.from(yearsSet).sort((a, b) => {
          const aNum = a === '2033' ? 2033 : parseInt(a)
          const bNum = b === '2033' ? 2033 : parseInt(b)
          return aNum - bNum
        })
        setAvailableYears(years)

        const grouped: Record<string, MDGRecord[]> = {}
        allRecords.forEach((record: MDGRecord) => {
          if (!grouped[record.theme]) {
            grouped[record.theme] = []
          }
          grouped[record.theme].push(record)
        })

        setGroupedByTheme(grouped)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const normalizeDescription = (desc: string) => {
    return desc.replace(/\s*\(Urban\)|\s*\(Rural\)|\s*%\s*$/g, '').trim()
  }

  const renderThemeCharts = (theme: string, themeRecords: MDGRecord[]) => {
    const chartColors = ['#1e3a8a', '#1e40af', '#2563eb', '#3b82f6', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9']

    // Get unit from records
    const unit = themeRecords[0]?.unit || ''
    const unitLabel = unit ? ` (${unit})` : ''
    
    // Determine data source - use reference/CEP for county data, source for national data
    let dataSource = 'MDG Energy Data'
    let inepRef = 'Not specified'
    
    // For county-level data, find records specific to the selected county
    if (selectedCounty !== 'All') {
      // Filter records that match this county and theme
      const countyThemeRecords = themeRecords.filter(r => r.administration === selectedCounty)
      if (countyThemeRecords.length > 0) {
        // Use the first record with a reference value
        const recordWithRef = countyThemeRecords.find(r => r.reference && r.reference.trim())
        if (recordWithRef) {
          dataSource = recordWithRef.reference
          inepRef = recordWithRef.inep || 'Not specified'
        }
      }
    } else {
      // National-level: use source field if available
      const recordWithSource = themeRecords.find(r => r.source && r.source.trim())
      if (recordWithSource) {
        dataSource = recordWithSource.source
        inepRef = recordWithSource.inep || 'Not specified'
      }
    }
    
    // Create descriptions for the legend items
    const descriptionExplanations: Record<string, string> = {
      'Advanced biomass stoves (gasifier and other Tier 3+ stoves)': 'High-efficiency stoves that meet international standards',
      'Bioethanol stoves': 'Stoves powered by bioethanol fuel',
      'Biogas': 'Digesters producing gas from organic waste',
      'Electric hot plates/coil': 'Electric cooking equipment',
      'Electric pressure cookers': 'Electric pressure cooking devices',
      'Improved charcoal stoves': 'Enhanced charcoal stoves with better efficiency',
      'LPG stoves': 'Liquified Petroleum Gas stoves',
      'Metallic Charcoal Stove': 'Traditional metal charcoal stove',
      'Paraffin Cookstoves': 'Stoves using kerosene/paraffin fuel',
      'Three stone Open fire': 'Traditional cooking method',
      'Wood ICS': 'Improved wood-burning cooking stoves',
      'Total connectivity of households': 'Percentage of households with access to electricity from any source',
      'Total connectivity of industries': 'Percentage of industrial facilities with reliable electricity access',
      'Households connected to solar home systems': 'Standalone solar photovoltaic systems serving individual households',
      'Households connected to mini-grids': 'Small-scale distribution networks serving multiple households',
    }
    
    // Get normalized descriptions for explanations
    const normalizedDescs = Array.from(
      new Set(themeRecords.map(r => normalizeDescription(r.description)))
    ).sort()
    
    // Build legend explanation text
    const legendInfo = normalizedDescs
      .map(desc => descriptionExplanations[desc] || desc)
      .join(' • ')

    // Check if data has Urban/Rural variants
    const hasUrbanRural = themeRecords.some(r => r.description.includes('(Urban)') || r.description.includes('(Rural)'))

    if (selectedCounty === 'All') {
      // Show all administrations for selected year
      const adminOrder = ['National', 'Kiambu', 'Kilifi', 'Nyandarua']
      
      // Normalize descriptions for legend (remove Urban/Rural)
      const normalizedDescs = Array.from(
        new Set(themeRecords.map(r => normalizeDescription(r.description)))
      ).sort()
      
      const descriptionColorMap: Record<string, string> = {}
      normalizedDescs.forEach((desc, idx) => {
        descriptionColorMap[desc] = chartColors[idx % chartColors.length]
      })

      const chartData: any[] = []
      adminOrder.forEach(admin => {
        const adminRecords = themeRecords.filter(r => r.administration === admin)
        if (adminRecords.length === 0) return
        
        if (hasUrbanRural) {
          // Separate Urban and Rural data
          const urbanRecords = adminRecords.filter(r => r.description.includes('(Urban)'))
          const ruralRecords = adminRecords.filter(r => r.description.includes('(Rural)'))
          
          // Add Urban bar
          if (urbanRecords.length > 0) {
            const urbanData: any = { name: `${admin} (Urban)`, area: 'Urban', admin: admin }
            urbanRecords.forEach(rec => {
              const normalized = normalizeDescription(rec.description)
              urbanData[normalized] = (urbanData[normalized] || 0) + (rec.data[selectedYear] || 0)
            })
            chartData.push(urbanData)
          }
          
          // Add Rural bar
          if (ruralRecords.length > 0) {
            const ruralData: any = { name: `${admin} (Rural)`, area: 'Rural', admin: admin }
            ruralRecords.forEach(rec => {
              const normalized = normalizeDescription(rec.description)
              ruralData[normalized] = (ruralData[normalized] || 0) + (rec.data[selectedYear] || 0)
            })
            chartData.push(ruralData)
          }
        } else {
          // No Urban/Rural, just show admin data
          const dataPoint: any = { name: admin }
          adminRecords.forEach(rec => {
            const normalized = normalizeDescription(rec.description)
            dataPoint[normalized] = (dataPoint[normalized] || 0) + (rec.data[selectedYear] || 0)
          })
          chartData.push(dataPoint)
        }
      })

      if (chartData.length === 0) return null

      return (
        <Card className="border border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-2 flex flex-row items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-sm font-semibold text-slate-900 dark:text-white">
                {theme} - All Counties ({selectedYear})
              </CardTitle>
            </div>
            <div className="relative">
              <button
                onClick={() => setShowInfoTooltip(showInfoTooltip === theme ? null : theme)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                title="Show data source and explanation"
              >
                <Info size={16} className="text-slate-600 dark:text-slate-400" />
              </button>
              {showInfoTooltip === theme && (
                <div className="absolute right-0 top-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 w-80 z-50 shadow-lg text-xs text-black dark:text-slate-100 max-h-96 overflow-y-auto">
                  <p className="font-semibold mb-2 text-black dark:text-white">{theme}</p>
                  
                  <div className="mb-3 pb-3 border-b border-slate-200 dark:border-slate-700">
                    <p className="text-xs font-semibold text-black dark:text-slate-300 mb-1">Legend & Definitions:</p>
                    <p className="text-xs leading-relaxed text-black dark:text-slate-300">{legendInfo}</p>
                  </div>
                  
                  <div className="mb-3 pb-3 border-b border-slate-200 dark:border-slate-700">
                    <p className="text-xs font-semibold text-black dark:text-slate-300 mb-1">CEP reference source:</p>
                    <p className="text-xs text-black dark:text-slate-300">{dataSource}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs font-semibold text-black dark:text-slate-300 mb-1">INEP Reference:</p>
                    <p className="text-xs text-black dark:text-slate-300">{inepRef}</p>
                  </div>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: 60, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" opacity={0.3} vertical={false} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 10, fill: '#cbd5e1' }} 
                  stroke="#475569"
                  angle={-45}
                  textAnchor="end"
                  height={70}
                />
                <YAxis tick={{ fontSize: 10, fill: '#cbd5e1' }} stroke="#475569" width={80} label={{ value: unitLabel, angle: -90, position: 'insideLeft', offset: 10, style: { fill: '#cbd5e1' } }} />
                <Tooltip 
                  contentStyle={{ 
                    fontSize: '12px', 
                    backgroundColor: '#ffffff', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '6px',
                    padding: '8px',
                    color: '#1f2937',
                    zIndex: 1000,
                    position: 'relative'
                  }}
                  labelStyle={{ color: '#1f2937', fontWeight: 600 }}
                  formatter={(value: any, name: any) => [value?.toLocaleString(), name]}
                  wrapperStyle={{ outline: 'none', zIndex: 1000 }}
                  cursor={{ fill: 'rgba(14, 165, 233, 0.1)' }}
                />
                <Legend 
                  wrapperStyle={{ fontSize: '10px', paddingTop: '8px', maxHeight: '80px', overflow: 'auto' }} 
                  height={60}
                  formatter={(value, entry) => (
                    <span title={value}>{value}</span>
                  )}
                />
                {normalizedDescs.map((desc, idx) => (
                  <Bar
                    key={desc}
                    dataKey={desc}
                    stackId="stack"
                    fill={descriptionColorMap[desc]}
                    radius={idx === 0 ? [4, 4, 0, 0] : 0}
                    name={desc}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )
    } else {
      // Show selected county data across years
      const countyRecords = themeRecords.filter(r => r.administration === selectedCounty)
      
      if (countyRecords.length === 0) return null

      // Normalize descriptions for legend
      const normalizedDescs = Array.from(
        new Set(countyRecords.map(r => normalizeDescription(r.description)))
      ).sort()
      
      const descriptionColorMap: Record<string, string> = {}
      normalizedDescs.forEach((desc, idx) => {
        descriptionColorMap[desc] = chartColors[idx % chartColors.length]
      })

      // Get all years
      const yearsSet = new Set<string>()
      countyRecords.forEach(rec => {
        Object.keys(rec.data).forEach(year => yearsSet.add(year))
      })
      const years = Array.from(yearsSet).sort((a, b) => {
        const aNum = a === '2033' ? 2033 : parseInt(a)
        const bNum = b === '2033' ? 2033 : parseInt(b)
        return aNum - bNum
      })

      // Build yearly chart data
      const chartData: any[] = []
      
      if (hasUrbanRural) {
        // Build with Urban/Rural grouping
        years.forEach(year => {
          const urbanRecords = countyRecords.filter(r => r.description.includes('(Urban)'))
          const ruralRecords = countyRecords.filter(r => r.description.includes('(Rural)'))
          
          // Add Urban bar for this year
          if (urbanRecords.length > 0) {
            const urbanData: any = { year: `${year} (Urban)`, displayYear: year, area: 'Urban' }
            urbanRecords.forEach(rec => {
              const normalized = normalizeDescription(rec.description)
              urbanData[normalized] = (urbanData[normalized] || 0) + (rec.data[year] || 0)
            })
            chartData.push(urbanData)
          }
          
          // Add Rural bar for this year
          if (ruralRecords.length > 0) {
            const ruralData: any = { year: `${year} (Rural)`, displayYear: year, area: 'Rural' }
            ruralRecords.forEach(rec => {
              const normalized = normalizeDescription(rec.description)
              ruralData[normalized] = (ruralData[normalized] || 0) + (rec.data[year] || 0)
            })
            chartData.push(ruralData)
          }
        })
      } else {
        // Build without Urban/Rural
        years.forEach(year => {
          const yearData: any = { year }
          countyRecords.forEach(rec => {
            const normalized = normalizeDescription(rec.description)
            yearData[normalized] = (yearData[normalized] || 0) + (rec.data[year] || 0)
          })
          chartData.push(yearData)
        })
      }

      return (
        <Card className="border border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-2 flex flex-row items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-sm font-semibold text-slate-900 dark:text-white">
                {theme} - {selectedCounty} Yearly Trends
              </CardTitle>
            </div>
            <div className="relative">
              <button
                onClick={() => setShowInfoTooltip(showInfoTooltip === theme ? null : theme)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                title="Show data source and explanation"
              >
                <Info size={16} className="text-slate-600 dark:text-slate-400" />
              </button>
              {showInfoTooltip === theme && (
                <div className="absolute right-0 top-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 w-80 z-50 shadow-lg text-xs text-black dark:text-slate-100 max-h-96 overflow-y-auto">
                  <p className="font-semibold mb-2 text-black dark:text-white">{theme}</p>
                  
                  <div className="mb-3 pb-3 border-b border-slate-200 dark:border-slate-700">
                    <p className="text-xs font-semibold text-black dark:text-slate-300 mb-1">Legend & Definitions:</p>
                    <p className="text-xs leading-relaxed text-black dark:text-slate-300">{legendInfo}</p>
                  </div>
                  
                  <div className="mb-3 pb-3 border-b border-slate-200 dark:border-slate-700">
                    <p className="text-xs font-semibold text-black dark:text-slate-300 mb-1">CEP reference source:</p>
                    <p className="text-xs text-black dark:text-slate-300">{dataSource}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs font-semibold text-black dark:text-slate-300 mb-1">INEP Reference:</p>
                    <p className="text-xs text-black dark:text-slate-300">{inepRef}</p>
                  </div>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: 60, bottom: 50 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" opacity={0.3} vertical={false} />
                <XAxis 
                  dataKey="year" 
                  tick={{ fontSize: 10, fill: '#cbd5e1' }}
                  stroke="#475569"
                  height={60}
                />
                <YAxis tick={{ fontSize: 10, fill: '#cbd5e1' }} stroke="#475569" width={80} label={{ value: unitLabel, angle: -90, position: 'insideLeft', offset: 10, style: { fill: '#cbd5e1' } }} />
                <Tooltip 
                  contentStyle={{ 
                    fontSize: '12px', 
                    backgroundColor: '#ffffff', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '6px',
                    padding: '8px',
                    color: '#1f2937',
                    zIndex: 1000,
                    position: 'relative'
                  }}
                  labelStyle={{ color: '#1f2937', fontWeight: 600 }}
                  formatter={(value: any, name: any) => [value?.toLocaleString(), name]}
                  wrapperStyle={{ outline: 'none', zIndex: 1000 }}
                  cursor={{ fill: 'rgba(14, 165, 233, 0.1)' }}
                />
                <Legend 
                  wrapperStyle={{ fontSize: '10px', paddingTop: '8px', maxHeight: '80px', overflow: 'auto' }} 
                  height={60}
                  formatter={(value, entry) => (
                    <span title={value}>{value}</span>
                  )}
                />
                {normalizedDescs.map((desc, idx) => (
                  <Bar
                    key={desc}
                    dataKey={desc}
                    stackId="stack"
                    fill={descriptionColorMap[desc]}
                    radius={idx === 0 ? [4, 4, 0, 0] : 0}
                    name={desc}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-slate-600 dark:text-slate-400">Loading data...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          {selectedCounty === 'All' ? 'All Counties' : `${selectedCounty} County`} Energy Data
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          {selectedCounty === 'All' 
            ? 'Compare energy metrics across all counties for the selected year'
            : 'View energy metrics trends across years for this county'
          }
        </p>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">County</label>
          <select
            value={selectedCounty}
            onChange={(e) => setSelectedCounty(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg dark:bg-slate-800 dark:border-slate-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            {AVAILABLE_COUNTIES.map(county => (
              <option key={county} value={county}>
                {county === 'All' ? 'All Counties' : county}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            {selectedCounty === 'All' ? 'Year' : 'Filter by Year (Optional)'}
          </label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg dark:bg-slate-800 dark:border-slate-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {selectedCounty === 'All' 
              ? 'Select year to compare all counties'
              : 'Shows all years - year selector only applies to "All Counties" view'
            }
          </p>
        </div>
      </div>

      {/* Breadcrumb Navigation */}
      {selectedCounty !== 'All' && (
        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 px-3 py-2 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800">
          <span className="text-slate-700 dark:text-slate-300 font-medium">{selectedCounty}</span>
          <span>•</span>
          <Link 
            href={`/counties/${encodeURIComponent(selectedCounty)}`}
            className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
          >
            <MapPin size={14} />
            View County Maps
          </Link>
        </div>
      )}

      {/* Main Content Area - Charts Only */}
      <div className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(groupedByTheme).map(([theme, records]) => (
              <div key={theme}>
                {renderThemeCharts(theme, records)}
              </div>
            ))}
          </div>
        </div>
    </div>
  )
}
