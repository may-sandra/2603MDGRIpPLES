'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface MDGRecord {
  administration: string
  category: string
  theme: string
  sector: string
  description: string
  capacity?: string | number
  unit?: string
  data: Record<string, any>
  isYearData: boolean
}

interface CountyDataCardsProps {
  selectedCounty: string
  selectedYear?: number
}

const colors = {
  primary: '#003570',
  accent: '#22c55e',
}

// Data explanations and metadata
const DATA_EXPLANATIONS: Record<string, { explanation: string; unit: string; source: string }> = {
  'Solar radiation by area': {
    explanation: 'Global Horizontal Irradiance (GHI) - average daily solar energy available per unit area',
    unit: 'kWh/m²/day',
    source: 'Global Solar Atlas',
  },
  'Wind potential by area': {
    explanation: 'Wind speed potential at 100m hub height - key indicator for utility-scale wind energy potential',
    unit: 'm/s',
    source: 'Global Wind Atlas',
  },
  'Wood fuel': {
    explanation: 'Biomass resources available from forest and agricultural residues',
    unit: 'm³/yr',
    source: 'MDG Energy Data',
  },
  'Hydroelectric potential': {
    explanation: 'Potential for hydropower generation based on water resources and topography',
    unit: 'MW',
    source: 'National Energy Database',
  },
  'Total connectivity of households': {
    explanation: 'Percentage of households with access to electricity from any source',
    unit: '%',
    source: 'Kenya National Bureau of Statistics',
  },
  'Total connectivity of industries': {
    explanation: 'Percentage of industrial facilities with reliable electricity access',
    unit: '%',
    source: 'Industrial Survey Data',
  },
  'Households connected to solar home systems': {
    explanation: 'Households with standalone solar photovoltaic systems for basic electricity needs',
    unit: '%',
    source: 'KOSAP Database',
  },
  'Households connected to mini-grids': {
    explanation: 'Households connected to small-scale distribution networks serving multiple households',
    unit: '%',
    source: 'Mini-grid Registry',
  },
  'Households (kWh)': {
    explanation: 'Annual electricity consumption by residential households',
    unit: 'kWh',
    source: 'Kenya Power & Lighting Company',
  },
  'Public Institutions / Facilities (kWh)': {
    explanation: 'Annual electricity consumed by schools, hospitals, government offices, and other public facilities',
    unit: 'kWh',
    source: 'KPLC & Ministry of Energy',
  },
  'Commercial and Industrial Customers (kWh)': {
    explanation: 'Annual electricity consumption by businesses, factories, and commercial enterprises',
    unit: 'kWh',
    source: 'KPLC Commercial Database',
  },
  'Total units sold (kWh)': {
    explanation: 'Total electrical energy delivered to all customer categories',
    unit: 'kWh',
    source: 'Kenya Power Annual Report',
  },
}

function formatNumber(num: any) {
  if (num === null || num === undefined || num === 'N/A') return 'N/A'
  const n = typeof num === 'string' ? parseFloat(num) : num
  if (isNaN(n)) return 'N/A'
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
  return n.toFixed(0)
}

export default function CountyDataCards({ selectedCounty, selectedYear = 2024 }: CountyDataCardsProps) {
  const [allRecords, setAllRecords] = useState<MDGRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/mdg-data')
        if (!response.ok) throw new Error('Failed to fetch data')
        const json = await response.json()
        setAllRecords(json.data || [])
      } catch (error) {
        console.error('[MDG] Error fetching data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const getCountyData = (metricDescription: string) => {
    const searchTerm = metricDescription.toLowerCase().trim()
    const searchTerms = searchTerm.split(/[\s\-\/]+/).filter(t => t.length > 2)

    const isMetricMatch = (record: any) => {
      if (!record.description) return false
      const desc = record.description.toLowerCase()
      if (desc === searchTerm) return true
      if (desc.includes(searchTerm)) return true
      return searchTerms.length > 0 && searchTerms.every(term => desc.includes(term))
    }

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

    const record = allRecords.find((r: any) => r.administration === selectedCounty && isMetricMatch(r))
    return {
      value: record ? getValue(record) : null,
      unit: record?.unit || '',
      record: record,
    }
  }

  if (isLoading) {
    return <div className="text-center py-8 text-slate-600">Loading data...</div>
  }

  const metricsGroups = [
    {
      title: 'Energy Resources',
      metrics: ['Solar radiation by area', 'Wind potential by area', 'Wood fuel', 'Hydroelectric potential'],
    },
    {
      title: 'Infrastructure & Access',
      metrics: ['Total connectivity of households', 'Total connectivity of industries', 'Households connected to solar home systems', 'Households connected to mini-grids'],
    },
    {
      title: 'Energy Demand & Consumption',
      metrics: ['Households (kWh)', 'Public Institutions / Facilities (kWh)', 'Commercial and Industrial Customers (kWh)', 'Total units sold (kWh)'],
    },
  ]

  return (
    <div className="space-y-8">
      {metricsGroups.map((group) => (
        <div key={group.title}>
          <div className="border-b-2" style={{ borderColor: colors.primary }}>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white py-3" style={{ color: colors.primary }}>
              {group.title}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
            {group.metrics.map((metric) => {
              const data = getCountyData(metric)
              return (
                <Card key={metric} className="border border-slate-200/60 dark:border-slate-800/60 shadow-sm hover:shadow-md transition-all">
                  <CardHeader style={{ backgroundColor: colors.primary + '05' }} className="border-b border-slate-200/60 dark:border-slate-800/60 py-2 px-3">
                    <CardTitle className="text-slate-900 dark:text-white text-xs font-semibold line-clamp-2" style={{ color: colors.primary }}>
                      {metric}
                    </CardTitle>
                    {DATA_EXPLANATIONS[metric] && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-normal">
                        {DATA_EXPLANATIONS[metric].explanation}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent className="pt-3 pb-3">
                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">{selectedCounty.toUpperCase()}</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">{data.value !== null ? formatNumber(data.value) : 'N/A'}</p>
                      <p className="text-xs text-slate-500">{data.unit || DATA_EXPLANATIONS[metric]?.unit || ''}</p>
                      {DATA_EXPLANATIONS[metric] && (
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                          Source: {DATA_EXPLANATIONS[metric].source}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
