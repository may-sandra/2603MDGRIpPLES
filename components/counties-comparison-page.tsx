'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import KenyaSVGInteractiveMap from '@/components/kenya-svg-interactive-map'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { energyData } from '@/lib/data'
import { ALL_KENYA_COUNTIES } from '@/lib/kenya-counties'
import { formatNumberWithCommas } from '@/lib/format-utils'
import { MapPin, X, Info } from 'lucide-react'

const YEARS = ['2019', '2020', '2021', '2022', '2023', '2024', '2025', '2026', '2027', '2028', '2029', '2030']

const colors = {
  primary: '#0f172a',
  primaryLight: '#f0f5fb',
  primaryBorder: '#1e293b',
  accent: '#10b981',
}

// Professional color palette - Dark blue, teal, and emerald theme
const chartColorPalette: { [key: string]: string } = {
  'Solar radiation by area': '#1e3a8a',
  'Wind potential by area': '#1e40af',
  'Wood fuel': '#2563eb',
  'Agricultural residues': '#3b82f6',
  'Animal waste': '#10b981',
  'Solid': '#14b8a6',
  'Liquid': '#06b6d4',
  'Total connectivity of households (%)': '#1e3a8a',
  'Total connectivity of MSMEs (%)': '#1e40af',
  'Total connectivity of industries (%)': '#2563eb',
  'Households connected to solar home systems (%)': '#10b981',
  'Households connected to mini-grids (%)': '#14b8a6',
  'Firewood %': '#1e3a8a',
  'Charcoal %': '#1e40af',
  'LPG %': '#2563eb',
  'Electricity %': '#10b981',
  'Households (kWh)': '#1e3a8a',
  'Commercial and Industrial Customers (kWh)': '#1e40af',
  'Potential for different sites': '#14b8a6',
  'Briquettes %': '#06b6d4',
  'Pellets %': '#3b82f6',
  'Kerosene %': '#2563eb',
  'Bioethanol %': '#1e40af',
  'Others e.g. agricultural waste %': '#1e3a8a',
}

interface CountiesComparisonPageProps {
  preSelectedCounty?: string
  onCountyChange?: (county: string | null) => void
  showMap?: boolean
}

export default function CountiesComparisonPage({
  preSelectedCounty,
  onCountyChange,
  showMap = true
}: CountiesComparisonPageProps) {
  const [selectedCounty, setSelectedCounty] = useState<string | null>(preSelectedCounty || null)
  const [showInfoTooltip, setShowInfoTooltip] = useState<string | null>(null)

  const handleCountyChange = (county: string | null) => {
    setSelectedCounty(county)
    onCountyChange?.(county)
  }
  const [selectedYear, setSelectedYear] = useState('2024')

  // Use all Kenya counties for the dropdown
  const countyList = ALL_KENYA_COUNTIES

  const getChartData = (theme: string) => {
    if (selectedCounty) {
      // Show yearly progression for selected county, filtered by theme
      const countyData = energyData.filter(d => d.Administration === selectedCounty && d.Theme === theme)
      const yearData: { [key: string]: any } = {}

      YEARS.forEach(year => {
        yearData[year] = { year }
      })

      countyData.forEach(item => {
        YEARS.forEach(year => {
          if (item[year as keyof typeof item]) {
            const key = `${item['General Description']}`
            if (!yearData[year][key]) {
              yearData[year][key] = item[year as keyof typeof item]
            }
          }
        })
      })

      return Object.values(yearData)
    } else {
      // Show all counties for selected year, filtered by theme
      // First, get only counties that have data for this theme
      const countiesWithData = new Set<string>()
      energyData.forEach(item => {
        if (item.Theme === theme && item.Administration && item.Administration !== 'NATIONAL') {
          countiesWithData.add(item.Administration)
        }
      })

      const countyComparison: { [key: string]: any } = {}

      Array.from(countiesWithData).forEach(county => {
        countyComparison[county] = { county }
      })

      energyData.forEach(item => {
        if (item[selectedYear as keyof typeof item] && item.Theme === theme) {
          Array.from(countiesWithData).forEach(county => {
            if (item.Administration === county) {
              const key = `${item['General Description']}`
              if (!countyComparison[county][key]) {
                countyComparison[county][key] = item[selectedYear as keyof typeof item]
              }
            }
          })
        }
      })

      return Object.values(countyComparison)
    }
  }

  const getThemesForDisplay = () => {
    const themes = new Set<string>()

    if (selectedCounty) {
      energyData
        .filter(d => d.Administration === selectedCounty)
        .forEach(item => {
          if (item.Theme) {
            themes.add(item.Theme)
          }
        })
    } else {
      energyData.forEach(item => {
        if (item.Theme) {
          themes.add(item.Theme)
        }
      })
    }

    return Array.from(themes).filter(t => t && t.trim() !== '')
  }

  const getComparisonCard = (theme: string) => {
    const nationalData = energyData.find(d => d.Administration === 'NATIONAL' && d.Theme === theme)
    const selectedData = selectedCounty
      ? energyData.find(d => d.Administration === selectedCounty && d.Theme === theme)
      : null

    const nationalRawValue = nationalData ? nationalData[selectedYear as keyof typeof nationalData] : 'N/A'
    const selectedRawValue = selectedData ? selectedData[selectedYear as keyof typeof selectedData] : 'N/A'

    // Format values with commas
    const nationalValue = nationalRawValue !== 'N/A' ? formatNumberWithCommas(nationalRawValue) : 'N/A'
    const selectedValue = selectedRawValue !== 'N/A' ? formatNumberWithCommas(selectedRawValue) : 'N/A'

    return { nationalValue, selectedValue, description: theme }
  }

  const themes = getThemesForDisplay()
  const topThemes = themes.slice(0, 3) // Show top 3 themes in comparison cards

  return (
    <div className="min-h-screen bg-white">
      {/* Header Banner */}
      <div
        className="rounded-lg p-4 border text-white mx-6 mt-6 mb-6"
        style={{
          backgroundColor: colors.primary,
          borderColor: colors.primaryBorder,
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1">Counties Energy Comparison</h1>
            <p className="opacity-90 text-sm">
              Compare energy metrics across Kenyan counties with year-over-year progression (2019-2033)
            </p>
          </div>
          {selectedCounty && (
            <Link href={`/counties/maps/${selectedCounty.toLowerCase()}`}>
              <button className="inline-flex items-center gap-2 px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-sm font-medium rounded-lg transition-colors text-gray-800">
                <MapPin size={16} />
                View Maps
              </button>
            </Link>
          )}
        </div>
      </div>

      <div className="p-6">
        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left Sidebar - Map and Filters */}
          <div className="lg:col-span-1">
            <Card className="border-slate-200 sticky top-6">
              <CardHeader className="pb-3 border-b border-slate-200">
                <CardTitle className="text-lg font-bold text-slate-900">Quick Filters</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                {/* Filter Dropdowns - Same Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 mb-1 block">County</label>
                    <Select value={selectedCounty || 'All'} onValueChange={(value) => handleCountyChange(value === 'All' ? null : value)}>
                      <SelectTrigger className="bg-white border-slate-300 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All">All Counties</SelectItem>
                        {countyList.map(county => (
                          <SelectItem key={county} value={county}>{county}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 mb-1 block">Year</label>
                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                      <SelectTrigger className="bg-white border-slate-300 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {YEARS.map(year => (
                          <SelectItem key={year} value={year}>{year}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Clear Selected County Button */}
                {selectedCounty && (
                  <button
                    onClick={() => handleCountyChange(null)}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded border border-red-200 text-sm font-medium transition-colors"
                  >
                    <X size={16} />
                    Clear Selected County
                  </button>
                )}

                {/* Kenya SVG Interactive Map */}
                <div className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden" style={{ height: selectedCounty ? '280px' : '320px' }}>
                  <KenyaSVGInteractiveMap
                    onCountySelect={(county) => {
                      if (!county) {
                        handleCountyChange(null)
                        return
                      }
                      const normalizedCounty = county.charAt(0).toUpperCase() + county.slice(1).toLowerCase()
                      handleCountyChange(countyList.includes(normalizedCounty) ? normalizedCounty : null)
                    }}
                    selectedCounties={selectedCounty ? [selectedCounty.toLowerCase()] : []}
                    showLegend={false}
                    showClearButton={false}
                  />
                </div>

                {/* Map Legend and Selection Status */}
                <div className="text-xs text-slate-600 pt-3 border-t border-slate-200">
                  <p className="font-semibold text-slate-700 mb-2">Map Legend:</p>
                  <div className="flex gap-4 items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-900"></div>
                      <span>Has Data</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                      <span>Selected</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                      <span>No Data</span>
                    </div>
                  </div>
                  {selectedCounty && (
                    <div className="pt-2 mt-2 border-t border-slate-200 text-slate-700 font-semibold bg-blue-50 p-2 rounded">
                      ✓ Selected: {selectedCounty}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Content - Comparison Cards and Charts */}
          <div className="lg:col-span-4 space-y-6">
            {/* Comparison Cards */}
            {selectedCounty && topThemes.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {topThemes.map((theme, idx) => {
                  const { nationalValue, selectedValue } = getComparisonCard(theme)
                  return (
                    <Card key={idx} className="border-slate-200">
                      <CardContent className="pt-4">
                        <p className="text-xs font-semibold text-slate-500 mb-2">{theme}</p>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-slate-50 rounded p-2">
                            <p className="text-xs text-slate-600 font-medium mb-1">National</p>
                            <p className="text-lg font-bold text-slate-900">{nationalValue}</p>
                          </div>
                          <div className="bg-emerald-50 rounded p-2">
                            <p className="text-xs text-emerald-600 font-medium mb-1">{selectedCounty}</p>
                            <p className="text-lg font-bold text-emerald-700">{selectedValue}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}

            {/* Charts Grid - 2 Columns Layout */}
            <div className="grid grid-cols-2 gap-6">
              {themes.map((theme, idx) => {
                const themeChartData = getChartData(theme)

                // Get all unique descriptions for this theme
                const descriptions = new Set<string>()
                const relevantData = selectedCounty
                  ? energyData.filter(d => d.Administration === selectedCounty && d.Theme === theme)
                  : energyData.filter(d => countyList.includes(d.Administration as string) && d.Theme === theme)

                relevantData.forEach(item => {
                  if (item['General Description']) {
                    descriptions.add(item['General Description'])
                  }
                })

                // Format data for grouped bars by description
                const chartDataFormatted = themeChartData.map((item: any) => {
                  const row: any = {
                    name: selectedCounty ? item.year : item.county,
                  }
                  descriptions.forEach(desc => {
                    row[desc] = item[desc] || 0
                  })
                  return row
                })

                const colorMap: { [key: string]: string } = {
                  'Solar radiation by area': '#1e3a8a',
                  'Wind potential by area': '#1e40af',
                  'Wood fuel': '#2563eb',
                  'Agricultural residues': '#3b82f6',
                  'Animal waste': '#10b981',
                  'Solid': '#14b8a6',
                  'Liquid': '#06b6d4',
                  'Total connectivity of households (%)': '#1e3a8a',
                  'Total connectivity of MSMEs (%)': '#1e40af',
                  'Total connectivity of industries (%)': '#2563eb',
                  'Households connected to solar home systems (%)': '#10b981',
                  'Households connected to mini-grids (%)': '#14b8a6',
                  'Firewood %': '#1e3a8a',
                  'Charcoal %': '#1e40af',
                  'LPG %': '#2563eb',
                  'LPG': '#2563eb',
                  'Electricity %': '#10b981',
                  'Households (kWh)': '#1e3a8a',
                  'Commercial and Industrial Customers (kWh)': '#1e40af',
                  'Potential for different sites': '#14b8a6',
                  'Public Institutions / Facilities (kWh)': '#06b6d4',
                  'Street lighting (kWh)': '#3b82f6',
                  'Total units sold (kWh)': '#14b8a6',
                  'Briquettes %': '#06b6d4',
                  'Pellets %': '#3b82f6',
                  'Kerosene %': '#2563eb',
                  'Bioethanol %': '#1e40af',
                  'Others e.g. agricultural waste %': '#1e3a8a',
                }

                // Get unit label for this theme
                const getUnitLabel = (theme: string) => {
                  if (theme.includes('connectivity') || theme.includes('Percentage') || theme.includes('%')) return '%'
                  if (theme.includes('Consumption') || theme.includes('kWh')) return 'kWh'
                  if (theme.includes('radiation') || theme.includes('wind')) return 'kWh/m²/day'
                  return ''
                }

                const unitLabel = getUnitLabel(theme)

                // Format numbers with commas
                const formatNumberWithCommas = (value: any) => {
                  if (typeof value === 'number') {
                    return value.toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 0 })
                  }
                  return value
                }

                return (
                  <Card key={idx} className="border-slate-200">
                    <CardHeader className="pb-2 border-b border-slate-100 bg-slate-50">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-semibold text-slate-900">{theme}</CardTitle>
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
                                <p className="text-xs font-semibold text-black dark:text-slate-300 mb-1">Description:</p>
                                <p className="text-xs leading-relaxed text-black dark:text-slate-300">Energy data for {theme} across Kenya counties. This visualization shows the comparison of energy metrics and consumption patterns by county.</p>
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
                    <CardContent>
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={chartDataFormatted} margin={{ top: 5, right: 20, left: 40, bottom: 50 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#475569" vertical={false} opacity={0.3} />
                          <XAxis
                            dataKey="name"
                            tick={{ fontSize: 11, fill: '#cbd5e1' }}
                            stroke="#475569"
                            angle={-45}
                            textAnchor="end"
                            height={80}
                          />
                          <YAxis
                            tick={{ fontSize: 11, fill: '#cbd5e1' }}
                            stroke="#475569"
                            tickFormatter={formatNumberWithCommas}
                            label={{ value: unitLabel, angle: -90, position: 'insideLeft', offset: 10, style: { fontSize: 11, fill: '#cbd5e1' } }}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'rgba(255, 255, 255, 0.95)',
                              border: '1px solid #e2e8f0',
                              borderRadius: '6px',
                              padding: '8px',
                              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                            }}
                            labelStyle={{ color: '#1f2937', fontSize: '12px' }}
                            formatter={(value: any, name: any) => [formatNumberWithCommas(value), name]}
                            cursor={{ fill: 'rgba(16, 185, 129, 0.05)' }}
                          />
                          {Array.from(descriptions).map((desc, i) => (
                            <Bar
                              key={i}
                              dataKey={desc}
                              stackId="stack"
                              fill={colorMap[desc] || chartColorPalette[desc] || '#94a3b8'}
                            />
                          ))}
                        </BarChart>
                      </ResponsiveContainer>

                      {/* Custom Legend - Directly Below Chart */}
                      <div className="flex flex-wrap gap-2 -mt-3 pt-2">
                        {Array.from(descriptions).map((desc, i) => (
                          <div key={i} className="flex items-center gap-1.5">
                            <div
                              className="w-2.5 h-2.5 rounded-sm"
                              style={{ backgroundColor: colorMap[desc] || chartColorPalette[desc] || '#94a3b8' }}
                            ></div>
                            <span className="text-xs text-slate-600">{desc}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
