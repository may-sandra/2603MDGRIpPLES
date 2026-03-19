import type { Database } from '@supabase/supabase-js'

export interface EnergyRecord {
  id?: string
  county: string
  year: number
  category: string
  metric: string
  value: number
  unit: string
  created_at?: string
}

// Transform Supabase data to chart format
export function transformToChartData(
  data: EnergyRecord[],
  groupBy: 'county' | 'year' = 'county'
): Record<string, unknown>[] {
  if (groupBy === 'county') {
    const grouped = data.reduce(
      (acc, item) => {
        const key = item.county
        if (!acc[key]) {
          acc[key] = { county: key }
        }
        acc[key][item.metric] = item.value
        return acc
      },
      {} as Record<string, any>
    )
    return Object.values(grouped)
  } else {
    const grouped = data.reduce(
      (acc, item) => {
        const key = item.year
        if (!acc[key]) {
          acc[key] = { year: key }
        }
        acc[key][item.metric] = item.value
        return acc
      },
      {} as Record<number, any>
    )
    return Object.values(grouped).sort((a, b) => a.year - b.year)
  }
}

// Get top counties by metric
export function getTopCounties(data: EnergyRecord[], metric: string, limit = 5) {
  return data
    .filter((item) => item.metric === metric && item.county !== 'National')
    .sort((a, b) => b.value - a.value)
    .slice(0, limit)
    .map((item) => ({
      county: item.county,
      value: item.value,
      unit: item.unit,
    }))
}

// Get national average for metric
export function getNationalValue(data: EnergyRecord[], metric: string, year?: number) {
  const filtered = data.filter((item) => item.county === 'National' && item.metric === metric)
  if (year) {
    return filtered.find((item) => item.year === year)?.value
  }
  return filtered[filtered.length - 1]?.value
}

// Get time series data for metric
export function getTimeSeriesData(data: EnergyRecord[], metric: string, county?: string) {
  return data
    .filter((item) => item.metric === metric && (county ? item.county === county : item.county === 'National'))
    .sort((a, b) => a.year - b.year)
    .map((item) => ({
      year: item.year,
      [metric]: item.value,
    }))
}
