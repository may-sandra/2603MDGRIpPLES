'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Sidebar, SidebarContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider } from '@/components/ui/sidebar'
import DashboardHeader from '@/components/dashboard-header'
import KenyaMapSVG from '@/components/kenya-map-svg'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { BarChart3, Map, Compass, Database } from 'lucide-react'

interface MDGRecord {
  administration: string
  theme: string
  description: string
  unit: string
  area?: string
  data: { [year: string]: number }
}

const PLATFORM_COLORS: Record<string, string> = {
  'National': '#3b82f6',
  'Kiambu': '#0ea5e9',
  'Kilifi': '#06b6d4',
  'Nyandarua': '#10b981',
  'Urban': '#f59e0b',
  'Rural': '#8b5cf6',
}

export default function ThemesChartsPage() {
  const [records, setRecords] = useState<MDGRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [groupedByTheme, setGroupedByTheme] = useState<Record<string, MDGRecord[]>>({})
  const [activeSection, setActiveSection] = useState('themes-charts')
  const [selectedYear, setSelectedYear] = useState<string>('2019')
  const [selectedAdmin, setSelectedAdmin] = useState<string>('All')
  const [availableYears, setAvailableYears] = useState<string[]>([])
  const [availableAdmins, setAvailableAdmins] = useState<string[]>(['All', 'National', 'Kiambu', 'Kilifi', 'Nyandarua'])
  
  // Counties for quick filter
  const AVAILABLE_COUNTIES = ['National', 'Nyandarua', 'Kiambu', 'Kilifi'].sort()
  const [selectedCounty, setSelectedCounty] = useState<string>('National')

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

  const sections = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'explore', label: 'Explore', icon: Compass },
    { id: 'counties', label: 'Counties', icon: Map },
    { id: 'search', label: 'Data Search', icon: Database },
  ]

  const renderThemeCharts = (theme: string, themeRecords: MDGRecord[]) => {
    const isShowingAll = selectedAdmin === 'All'

    // Normalize descriptions - extract base name (remove Urban/Rural/% variants)
    const normalizeDescription = (desc: string) => {
      // Remove "(Urban)" or "(Rural)" and "%" suffix variations
      return desc.replace(/\s*\(Urban\)|\s*\(Rural\)|\s*%\s*$/g, '').trim()
    }
    
    // Get all unique normalized descriptions for consistent color mapping
    const allDescriptions = Array.from(
      new Set(themeRecords.map(r => normalizeDescription(r.description)))
    ).sort()
    
    // Color progression from blue (#035790) to green
    const chartColors = ['#035790', '#0975A0', '#0F90B0', '#1AAAC0', '#25C4D0', '#30D8E0', '#3BDCE8', '#47E0F0', '#10b981']
    
    // Create a color map for each normalized description
    const descriptionColorMap: Record<string, string> = {}
    allDescriptions.forEach((desc, idx) => {
      descriptionColorMap[desc] = chartColors[idx % chartColors.length]
    })

    // Separate records with urban/rural from those without
    const withUrbanRural = themeRecords.filter(r => r.area === 'Urban' || r.area === 'Rural')
    const withoutUrbanRural = themeRecords.filter(r => !r.area || (r.area !== 'Urban' && r.area !== 'Rural'))

    // Combine both types into one chart
    const hasUrbanRural = withUrbanRural.length > 0
    const hasOtherMetrics = withoutUrbanRural.length > 0

    if (isShowingAll) {
      // Show all administrations on same axis with Urban/Rural pairs
      return (
        <div className="space-y-6">
          <Card className="border border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-slate-900 dark:text-white">
                {theme} - {selectedYear}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              {(() => {
                const chartData: any[] = []
                const adminOrder = ['National', 'Kiambu', 'Kilifi', 'Nyandarua']
                const adminSet = new Set(themeRecords.map(r => r.administration))

                if (hasUrbanRural) {
                  // Build Urban/Rural pairs for each admin - clean description names
                  Array.from(adminSet)
                    .sort((a, b) => adminOrder.indexOf(a) - adminOrder.indexOf(b))
                    .forEach(admin => {
                      // Urban bar for this admin
                      const urbanData: any = { 
                        name: `${admin} Urban`,
                        admin: admin,
                        area: 'Urban'
                      }
                      withUrbanRural.forEach(rec => {
                        if (rec.administration === admin && rec.area === 'Urban') {
                          const normalizedDesc = normalizeDescription(rec.description)
                          urbanData[normalizedDesc] = (urbanData[normalizedDesc] || 0) + (rec.data[selectedYear] || 0)
                        }
                      })
                      chartData.push(urbanData)

                      // Rural bar for this admin
                      const ruralData: any = { 
                        name: `${admin} Rural`,
                        admin: admin,
                        area: 'Rural'
                      }
                      withUrbanRural.forEach(rec => {
                        if (rec.administration === admin && rec.area === 'Rural') {
                          const normalizedDesc = normalizeDescription(rec.description)
                          ruralData[normalizedDesc] = (ruralData[normalizedDesc] || 0) + (rec.data[selectedYear] || 0)
                        }
                      })
                      chartData.push(ruralData)
                    })
                } else {
                  // Simple admin bars
                  Array.from(adminSet)
                    .sort((a, b) => adminOrder.indexOf(a) - adminOrder.indexOf(b))
                    .forEach(admin => {
                      const dataPoint: any = { name: admin }
                      withoutUrbanRural.forEach(rec => {
                        if (rec.administration === admin && selectedYear in rec.data) {
                          const normalizedDesc = normalizeDescription(rec.description)
                          dataPoint[normalizedDesc] = (dataPoint[normalizedDesc] || 0) + (rec.data[selectedYear] || 0)
                        }
                      })
                      chartData.push(dataPoint)
                    })
                }

                return (
                  <ResponsiveContainer width="100%" height={380}>
                    <BarChart data={chartData} margin={{ top: 40, right: 10, left: 0, bottom: 80 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                      {hasUrbanRural ? (
                        // Custom hierarchical axis with admin grouping
                        <XAxis 
                          dataKey="name"
                          tick={(props: any) => {
                            const { x, y, payload } = props
                            const data = chartData[payload.value]
                            if (!data) return null
                            
                            // Show area type above
                            return (
                              <g>
                                <text 
                                  x={x} 
                                  y={y - 20} 
                                  textAnchor="middle" 
                                  fontSize={8}
                                  fill="#64748b"
                                >
                                  {data.area}
                                </text>
                              </g>
                            )
                          }}
                          height={50}
                        />
                      ) : (
                        <XAxis 
                          dataKey="name" 
                          tick={{ fontSize: 9 }} 
                          angle={-30} 
                          textAnchor="end" 
                          height={60} 
                        />
                      )}
                      <YAxis tick={{ fontSize: 10 }} width={50} />
                      <Tooltip 
                        contentStyle={{ 
                          fontSize: '10px',
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid #e2e8f0',
                          borderRadius: '6px',
                          padding: '6px',
                          color: '#1f2937'
                        }}
                        labelStyle={{ color: '#1f2937', fontWeight: 600 }}
                        formatter={(value: any, name: any) => [value?.toLocaleString(), name]}
                      />
                      <Legend wrapperStyle={{ fontSize: '9px', paddingTop: '4px' }} height={30} />
                      {allDescriptions.map((desc, idx) => (
                        <Bar
                          key={desc}
                          dataKey={desc}
                          stackId="stack"
                          fill={descriptionColorMap[desc]}
                          radius={idx === 0 ? [4, 4, 0, 0] : 0}
                          name={desc.length > 30 ? desc.substring(0, 27) + '...' : desc}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                )
              })()}
            </CardContent>
          </Card>
        </div>
      )
    } else {
      // Show yearly trends for single administration with Urban/Rural pairs
      return (
        <div className="space-y-6">
          <Card className="border border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-slate-900 dark:text-white">
                {theme} - {selectedAdmin} Yearly Trends
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              {(() => {
                const adminRecs = themeRecords.filter(r => r.administration === selectedAdmin)
                const chartData: any[] = []
                const years = Object.keys(adminRecs[0]?.data || {}).sort((a, b) => {
                  const aNum = a === '2033' ? 2033 : parseInt(a)
                  const bNum = b === '2033' ? 2033 : parseInt(b)
                  return aNum - bNum
                })

                if (hasUrbanRural) {
                  // Build Urban/Rural pairs for each year - one entry per year group
                  const adminUrbanRural = adminRecs.filter(r => r.area === 'Urban' || r.area === 'Rural')
                  
                  years.forEach(year => {
                    // Urban bar for this year
                    const urbanData: any = { year: `${year} (U)`, yearLabel: year, area: 'Urban' }
                    adminUrbanRural.forEach(rec => {
                      if (rec.area === 'Urban') {
                        const normalizedDesc = normalizeDescription(rec.description)
                        urbanData[normalizedDesc] = (urbanData[normalizedDesc] || 0) + (rec.data[year] || 0)
                      }
                    })
                    chartData.push(urbanData)

                    // Rural bar for this year
                    const ruralData: any = { year: `${year} (R)`, yearLabel: year, area: 'Rural' }
                    adminUrbanRural.forEach(rec => {
                      if (rec.area === 'Rural') {
                        const normalizedDesc = normalizeDescription(rec.description)
                        ruralData[normalizedDesc] = (ruralData[normalizedDesc] || 0) + (rec.data[year] || 0)
                      }
                    })
                    chartData.push(ruralData)
                  })
                } else {
                  // Simple year bars
                  const adminOther = adminRecs.filter(r => !r.area || (r.area !== 'Urban' && r.area !== 'Rural'))
                  
                  years.forEach(year => {
                    const dataPoint: any = { year }
                    adminOther.forEach(rec => {
                      const normalizedDesc = normalizeDescription(rec.description)
                      dataPoint[normalizedDesc] = (dataPoint[normalizedDesc] || 0) + (rec.data[year] || 0)
                    })
                    chartData.push(dataPoint)
                  })
                }

                return (
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={chartData} margin={{ top: 20, right: 10, left: 0, bottom: 30 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                      {hasUrbanRural ? (
                        // Custom axis for year pairs
                        <XAxis 
                          dataKey="year"
                          tick={(props: any) => {
                            const { x, y, payload } = props
                            const data = chartData[payload.value]
                            if (!data) return null
                            
                            return (
                              <g>
                                <text 
                                  x={x} 
                                  y={y - 10} 
                                  textAnchor="middle" 
                                  fontSize={8}
                                  fill="#64748b"
                                >
                                  {data.area}
                                </text>
                              </g>
                            )
                          }}
                          height={30}
                        />
                      ) : (
                        <XAxis dataKey="year" tick={{ fontSize: 10 }} />
                      )}
                      <YAxis tick={{ fontSize: 10 }} width={50} />
                      <Tooltip 
                        contentStyle={{ 
                          fontSize: '10px',
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid #e2e8f0',
                          borderRadius: '6px',
                          padding: '6px',
                          color: '#1f2937'
                        }}
                        labelStyle={{ color: '#1f2937', fontWeight: 600 }}
                        formatter={(value: any, name: any) => [value?.toLocaleString(), name]}
                      />
                      <Legend wrapperStyle={{ fontSize: '9px', paddingTop: '4px' }} height={30} />
                      {allDescriptions.map((desc, idx) => (
                        <Bar
                          key={desc}
                          dataKey={desc}
                          stackId="stack"
                          fill={descriptionColorMap[desc]}
                          radius={idx === 0 ? [4, 4, 0, 0] : 0}
                          name={desc.length > 30 ? desc.substring(0, 27) + '...' : desc}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                )
              })()}
            </CardContent>
          </Card>
        </div>
      )
    }
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-white dark:bg-slate-950">
      {/* Header */}
      <DashboardHeader />

      {/* Green Accent Line */}
      <div className="w-full bg-gradient-to-r from-[#22c55e] to-[#16a34a] h-1 flex-shrink-0"></div>

      {/* Main Content with Sidebar */}
      <SidebarProvider>
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <Sidebar className="w-48 flex-shrink-0 bg-slate-900 dark:bg-slate-900 border-r border-slate-800">
            <SidebarContent className="pt-6">
              <SidebarMenu>
                {sections.map((section) => {
                  const Icon = section.icon
                  return (
                    <SidebarMenuItem key={section.id}>
                      <Link href="/">
                        <SidebarMenuButton
                          className={`text-sm font-medium transition-all ${
                            activeSection === section.id
                          ? 'bg-green-600 text-white'
                          : 'text-slate-300 dark:text-slate-400 hover:text-white dark:hover:text-slate-200'
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                          <span>{section.label}</span>
                        </SidebarMenuButton>
                      </Link>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>

              {/* Separator */}
              <div className="my-6 border-t border-slate-700"></div>

              {/* Themed Charts Link */}
              <div className="px-3 mb-6">
                <SidebarMenuButton
                  isActive={true}
                  className="w-full text-sm bg-green-600 text-white rounded"
                >
                  <span>📈 Themed Charts</span>
                </SidebarMenuButton>
              </div>

              {/* Separator */}
              <div className="my-6 border-t border-slate-700"></div>

              {/* Map Link */}
              <div className="px-3 mb-6">
                <Link href="/map" className="w-full">
                  <SidebarMenuButton className="w-full text-sm transition-all text-slate-300 dark:text-slate-400 hover:text-white dark:hover:text-slate-200 hover:bg-slate-800 dark:hover:bg-slate-800 rounded">
                    <span>🗺️ Interactive Map</span>
                  </SidebarMenuButton>
                </Link>
              </div>
            </SidebarContent>
          </Sidebar>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">
            {/* Dark Blue Header */}
            <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white px-8 py-6 border-b border-blue-700">
              <h1 className="text-3xl font-bold mb-1">Counties Energy Comparison</h1>
              <p className="text-blue-100">Compare energy metrics across Kenyan counties with year-over-year progression (2019-2033)</p>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto">
              <div className="p-8">
                {/* Two Column Layout: Left (Map + Filters), Right (Charts) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                  {/* Left Column: Quick Filters & Map */}
                  <div className="lg:col-span-1">
                    {/* Quick Filters Card */}
                    <Card className="border border-slate-200 dark:border-slate-800 mb-6 shadow-sm">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold">Quick Filters</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* County Selector */}
                        <div>
                          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                            County
                          </label>
                          <select
                            value={selectedCounty}
                            onChange={(e) => setSelectedCounty(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg dark:bg-slate-800 dark:border-slate-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                          >
                            {AVAILABLE_COUNTIES.map(county => (
                              <option key={county} value={county}>{county}</option>
                            ))}
                          </select>
                        </div>

                        {/* Year Selector */}
                        <div>
                          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Year
                          </label>
                          <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg dark:bg-slate-800 dark:border-slate-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                          >
                            {availableYears.map(year => (
                              <option key={year} value={year}>{year}</option>
                            ))}
                          </select>
                        </div>

                        {/* Administration Selector */}
                        <div>
                          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Select Administration
                          </label>
                          <select
                            value={selectedAdmin}
                            onChange={(e) => setSelectedAdmin(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg dark:bg-slate-800 dark:border-slate-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {availableAdmins.map(admin => (
                              <option key={admin} value={admin}>{admin}</option>
                            ))}
                          </select>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Map Card */}
                    <Card className="border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold">County's Energy Resources</CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700" style={{ minHeight: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
                            <KenyaMapSVG
                              selectedCounty={selectedCounty}
                              onCountySelect={(county) => {
                                if (county) setSelectedCounty(county)
                              }}
                            />
                          </div>
                        </div>
                        {/* Map Legend */}
                        <div className="p-4 border-t border-slate-200 dark:border-slate-700 space-y-2 bg-slate-50 dark:bg-slate-800">
                          <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-3">Map Legend</div>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-blue-600 rounded"></div>
                            <span className="text-xs text-slate-700 dark:text-slate-300">Has Data</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-green-500 rounded"></div>
                            <span className="text-xs text-slate-700 dark:text-slate-300">Selected</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-slate-300 dark:bg-slate-600 rounded"></div>
                            <span className="text-xs text-slate-700 dark:text-slate-300">No Data</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Right Column: Charts */}
                  <div className="lg:col-span-2">
                    {loading ? (
                      <div className="flex items-center justify-center h-96">
                        <p className="text-slate-600 dark:text-slate-400">Loading data...</p>
                      </div>
                    ) : Object.keys(groupedByTheme).length > 0 ? (
                      <div className="space-y-6">
                        {Object.entries(groupedByTheme).map(([theme, records]) => (
                          <div key={theme}>
                            {renderThemeCharts(theme, records)}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-slate-600 dark:text-slate-400">No data available</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarProvider>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900 dark:bg-slate-900 border-t border-slate-700 py-3 w-full z-40">
        <div className="flex justify-center items-center px-4">
          <p className="text-sm text-slate-100 dark:text-slate-300 font-medium text-center">
            Developed by{" "}
            <a href="https://eedadvisory.com/en/research-institute" target="_blank" rel="noopener noreferrer" className="text-green-300 hover:text-green-200 underline">
              EED Research Institute (ERI)
            </a>
            {" "}in collaboration with{" "}
            <a href="https://www.ucl.ac.uk/" target="_blank" rel="noopener noreferrer" className="text-green-300 hover:text-green-200 underline">
              UCL
            </a>
            {" "}and funded by{" "}
            <a href="https://climatecompatiblegrowth.com/" target="_blank" rel="noopener noreferrer" className="text-green-300 hover:text-green-200 underline">
              CCG
            </a>
            /FCDO
          </p>
        </div>
      </div>
    </div>
  )
}
