'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Sun, Wind, Leaf, Zap, Home, Factory } from 'lucide-react'
import { energyData } from '@/lib/data'
import { formatNumberWithCommas } from '@/lib/format-utils'

interface ComparisonValue {
  label: string
  value: number | string
  unit: string
  isHighest?: boolean
}

interface DataComparisonProps {
  selectedTheme?: string | null
  selectedCategory?: string | null
  selectedCounty?: string | null
}

// Helper function to format large numbers
const formatNumber = (value: number): string => {
  if (value >= 1000000000) return (value / 1000000000).toFixed(1) + 'B'
  if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M'
  if (value >= 1000) return (value / 1000).toFixed(1) + 'K'
  return value.toFixed(1)
}

const getNationalValue = (theme: string, sector: string): ComparisonValue | null => {
  const nationalEntry = energyData.find(
    (entry) =>
      entry.Administration === 'NATIONAL' &&
      entry.Theme === theme &&
      entry.Sector === sector
  )

  if (nationalEntry) {
    const value2024 = nationalEntry['2024']
    if (value2024 !== undefined) {
      const numValue = typeof value2024 === 'number' ? value2024 : parseFloat(value2024 as string)
      return {
        label: 'NATIONAL',
        value: formatNumber(numValue),
        unit: nationalEntry['Unit of Measure'],
      }
    }
  }

  return null
}

const getComparisonValue = (theme: string, sector: string, selectedCounty?: string | null): ComparisonValue | null => {
  if (selectedCounty && selectedCounty !== 'All Counties') {
    return getSelectedCountyValue(theme, sector, selectedCounty)
  }
  return getHighestCountyValue(theme, sector)
}

const getHighestCountyValue = (theme: string, sector: string): ComparisonValue | null => {
  const entries = energyData.filter(
    (entry) =>
      entry.Administration !== 'NATIONAL' &&
      entry.Theme === theme &&
      entry.Sector === sector &&
      entry['2024'] !== undefined
  )

  if (entries.length === 0) return null

  let highest = entries[0]
  let maxValue = highest['2024'] as number

  for (const entry of entries) {
    const value = entry['2024'] as number
    if (value > maxValue) {
      maxValue = value
      highest = entry
    }
  }

  return {
    label: highest.Administration,
    value: formatNumber(maxValue),
    unit: highest['Unit of Measure'],
    isHighest: true,
  }
}

const getSelectedCountyValue = (theme: string, sector: string, selectedCounty: string): ComparisonValue | null => {
  if (!selectedCounty || selectedCounty === 'All Counties') return null

  const entry = energyData.find(
    (e) =>
      e.Administration === selectedCounty &&
      e.Theme === theme &&
      e.Sector === sector &&
      e['2024'] !== undefined
  )

  if (!entry) return null

  const numValue = typeof entry['2024'] === 'number' ? entry['2024'] : parseFloat(entry['2024'] as string)
  return {
    label: selectedCounty,
    value: formatNumber(numValue),
    unit: entry['Unit of Measure'],
  }
}

const getIconForTheme = (theme: string) => {
  if (theme.includes('Solar')) return <Sun className="h-4 w-4" style={{ color: '#FFA500' }} />
  if (theme.includes('Wind')) return <Wind className="h-4 w-4" style={{ color: '#0066CC' }} />
  if (theme.includes('Biomass')) return <Leaf className="h-4 w-4" style={{ color: '#22C55E' }} />
  if (theme.includes('Electricity')) return <Zap className="h-4 w-4" style={{ color: '#FFD700' }} />
  if (theme.includes('Household')) return <Home className="h-4 w-4" style={{ color: '#8B7355' }} />
  if (theme.includes('Industrial')) return <Factory className="h-4 w-4" style={{ color: '#696969' }} />
  return <Zap className="h-4 w-4" style={{ color: '#003570' }} />
}

// Get unique themes and their indicators
const getThemeIndicators = () => {
  const themes = new Map<string, Set<string>>()

  energyData.forEach((entry) => {
    if (!themes.has(entry.Theme)) {
      themes.set(entry.Theme, new Set())
    }
    themes.get(entry.Theme)?.add(entry.Sector)
  })

  return themes
}

export const DataComparisonCards = ({ selectedTheme, selectedCategory, selectedCounty }: DataComparisonProps) => {
  const themeIndicators = getThemeIndicators()
  
  // Featured themes that appear in the top row
  const featuredThemes = [
    'Electricity Connectivity Progression in the County',
    'Summary of Electricity Consumption in the County',
    'Percentage of households by main sources of cooking fuels in the County',
  ]

  // Filter by category if selected
  let filteredThemes = Array.from(themeIndicators.entries())
  if (selectedCategory) {
    filteredThemes = filteredThemes.filter(([theme]) => {
      const categoryEntry = energyData.find((d) => d.Theme === theme)
      return categoryEntry?.Category === selectedCategory
    })
  }
  
  // Remove featured themes from the main grid
  filteredThemes = filteredThemes.filter(([theme]) => !featuredThemes.includes(theme))

  return (
    <div className="space-y-4">
      {/* Featured Cards in One Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {['Electricity Connectivity Progression in the County', 'Summary of Electricity Consumption in the County', 'Percentage of households by main sources of cooking fuels in the County'].map((theme) => {
          const sectors = themeIndicators.get(theme)
          if (!sectors || sectors.size === 0) return null

          const isSelectedCounty = selectedCounty && selectedCounty !== 'All Counties'

          return (
            <Card key={theme} className="border border-slate-200 dark:border-slate-700 overflow-hidden">
              <CardHeader className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 pb-2 px-3 pt-2">
                <CardTitle className="text-xs font-semibold text-slate-900 dark:text-white">
                  {theme}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-3 pb-3 px-3 space-y-2">
                {Array.from(sectors).map((sector) => {
                  const national = getNationalValue(theme, sector)
                  const comparison = getComparisonValue(theme, sector, selectedCounty)

                  const description = energyData.find(
                    (d) => d.Theme === theme && d.Sector === sector
                  )?.['General Description']

                  return (
                    <div key={`${theme}-${sector}`} className="space-y-1">
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{sector}</p>
                      {description && (
                        <p className="text-xs text-slate-600 dark:text-slate-400">{description}</p>
                      )}
                      <div className="flex gap-2 mt-2">
                        {/* National Value */}
                        {national ? (
                          <div className="flex-1 bg-slate-50 dark:bg-slate-900/40 p-2 rounded-md border border-slate-200 dark:border-slate-700">
                            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-0.5">
                              NATIONAL
                            </p>
                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                              {national.value}
                            </p>
                            <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                              {national.unit}
                            </p>
                          </div>
                        ) : (
                          <div className="flex-1 bg-slate-50 dark:bg-slate-900/40 p-2 rounded-md border border-slate-200 dark:border-slate-700">
                            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-0.5">
                              NATIONAL
                            </p>
                            <p className="text-sm font-bold text-slate-400 dark:text-slate-600">
                              N/A
                            </p>
                          </div>
                        )}

                        {/* Comparison Value */}
                        {comparison ? (
                          <div className={`flex-1 p-2 rounded-md border ${isSelectedCounty ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-green-50 dark:bg-green-900/20'} ${isSelectedCounty ? 'border-blue-200 dark:border-blue-800' : 'border-green-200 dark:border-green-800'}`}>
                            <p className={`text-xs font-semibold mb-0.5 ${isSelectedCounty ? 'text-blue-700 dark:text-blue-400' : 'text-green-700 dark:text-green-400'}`}>
                              {comparison.label}
                            </p>
                            <p className={`text-sm font-bold truncate ${isSelectedCounty ? 'text-blue-900 dark:text-blue-100' : 'text-green-900 dark:text-green-100'}`}>
                              {comparison.value}
                            </p>
                            <p className={`text-xs truncate ${isSelectedCounty ? 'text-blue-700 dark:text-blue-400' : 'text-green-700 dark:text-green-400'}`}>
                              {comparison.unit}
                            </p>
                          </div>
                        ) : isSelectedCounty ? (
                          <div className="flex-1 p-2 rounded-md border bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                            <p className="text-xs font-semibold mb-0.5 text-blue-700 dark:text-blue-400">
                              {selectedCounty}
                            </p>
                            <p className="text-sm font-bold text-blue-400 dark:text-blue-600">
                              N/A
                            </p>
                          </div>
                        ) : (
                          <div className="flex-1 p-2 rounded-md border bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                            <p className="text-xs font-semibold mb-0.5 text-green-700 dark:text-green-400">
                              Highest
                            </p>
                            <p className="text-sm font-bold text-green-400 dark:text-green-600">
                              N/A
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Other Theme Cards */}
      <div className="space-y-4">
        {filteredThemes.map(([theme, sectors]) => {
          const categoryEntry = energyData.find((d) => d.Theme === theme)
          const category = categoryEntry?.Category || 'Data'
          const indicatorCount = sectors.size

          return (
            <div key={theme}>
            {/* Theme Header - Compact */}
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{theme}</h3>
              </div>
                <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                  {indicatorCount}
                </span>
              </div>

              {/* Indicators Grid - Responsive with wrapping */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 mb-4">
                {Array.from(sectors).map((sector) => {
                  const national = getNationalValue(theme, sector)
                  const comparison = getComparisonValue(theme, sector, selectedCounty)
                  const isSelectedCounty = selectedCounty && selectedCounty !== 'All Counties'

                  if (!national && !comparison) return null

                  const description = energyData.find(
                    (d) => d.Theme === theme && d.Sector === sector
                  )?.['General Description']

                  return (
                    <Card
                      key={`${theme}-${sector}`}
                      className="border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <CardHeader className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 pb-2 px-3 pt-2">
                        <CardTitle className="text-xs font-semibold text-slate-900 dark:text-white line-clamp-2">
                          {sector}
                        </CardTitle>
                        {description && (
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 line-clamp-1">
                            {description}
                          </p>
                        )}
                      </CardHeader>
                      <CardContent className="pt-2 pb-2 px-2">
                        <div className="flex gap-2">
                          {/* National Value */}
                          {national ? (
                            <div className="flex-1 bg-slate-50 dark:bg-slate-900/40 p-2 rounded-md border border-slate-200 dark:border-slate-700">
                              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-0.5 flex items-center gap-1">
                                <span className="inline-block w-1.5 h-1.5 bg-slate-400 rounded-full flex-shrink-0"></span>
                                <span className="truncate">NATIONAL</span>
                              </p>
                              <p className="text-lg font-bold text-slate-900 dark:text-white truncate">
                                {national.value}
                              </p>
                              <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                                {national.unit}
                              </p>
                            </div>
                          ) : (
                            <div className="flex-1 bg-slate-50 dark:bg-slate-900/40 p-2 rounded-md border border-slate-200 dark:border-slate-700">
                              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-0.5 flex items-center gap-1">
                                <span className="inline-block w-1.5 h-1.5 bg-slate-400 rounded-full flex-shrink-0"></span>
                                <span className="truncate">NATIONAL</span>
                              </p>
                              <p className="text-lg font-bold text-slate-400 dark:text-slate-600">
                                N/A
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-500">
                                No data
                              </p>
                            </div>
                          )}

                          {/* Comparison Value (Highest County or Selected County) */}
                          {comparison ? (
                            <div className={`flex-1 p-2 rounded-md border ${isSelectedCounty ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-green-50 dark:bg-green-900/20'} ${isSelectedCounty ? 'border-blue-200 dark:border-blue-800' : 'border-green-200 dark:border-green-800'}`}>
                              <p className={`text-xs font-semibold mb-0.5 flex items-center gap-1 ${isSelectedCounty ? 'text-blue-700 dark:text-blue-400' : 'text-green-700 dark:text-green-400'}`}>
                                <span className={`inline-block w-1.5 h-1.5 rounded-full flex-shrink-0 ${isSelectedCounty ? 'bg-blue-500' : 'bg-green-500'}`}></span>
                                <span className="truncate">{comparison.label}</span>
                              </p>
                              <p className={`text-lg font-bold truncate ${isSelectedCounty ? 'text-blue-900 dark:text-blue-100' : 'text-green-900 dark:text-green-100'}`}>
                                {comparison.value}
                              </p>
                              <p className={`text-xs truncate ${isSelectedCounty ? 'text-blue-700 dark:text-blue-400' : 'text-green-700 dark:text-green-400'}`}>
                                {comparison.unit}
                              </p>
                            </div>
                          ) : isSelectedCounty ? (
                            <div className="flex-1 p-2 rounded-md border bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                              <p className="text-xs font-semibold mb-0.5 flex items-center gap-1 text-blue-700 dark:text-blue-400">
                                <span className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0 bg-blue-500"></span>
                                <span className="truncate">{selectedCounty}</span>
                              </p>
                              <p className="text-lg font-bold text-blue-400 dark:text-blue-600">
                                N/A
                              </p>
                              <p className="text-xs text-blue-700 dark:text-blue-400">
                                No data
                              </p>
                            </div>
                          ) : (
                            <div className="flex-1 p-2 rounded-md border bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                              <p className="text-xs font-semibold mb-0.5 flex items-center gap-1 text-green-700 dark:text-green-400">
                                <span className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0 bg-green-500"></span>
                                <span className="truncate">Highest</span>
                              </p>
                              <p className="text-lg font-bold text-green-400 dark:text-green-600">
                                N/A
                              </p>
                              <p className="text-xs text-green-700 dark:text-green-400">
                                No data
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
