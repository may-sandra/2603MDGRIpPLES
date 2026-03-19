'use client'

import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

// Map types available for each county
const COUNTY_MAPS: Record<string, Record<string, string | null>> = {
  'Nyandarua': {
    'context': '/maps/nyandarua-context.png',
    'education': '/maps/nyandarua-education.png',
    'health': '/maps/nyandarua-health.png',
    'wind': '/maps/nyandarua-wind.png',
    'ghi': null,
    'electricity': '/maps/nyandarua-electricity.png',
  },
  'Kilifi': {
    'context': null,
    'education': null,
    'health': null,
    'wind': '/maps/kilifi-wind.png',
    'ghi': '/maps/kilifi-ghi.png',
    'electricity': null,
  },
}

const MAP_LABELS: Record<string, { title: string; description: string }> = {
  'context': {
    title: 'Context Map',
    description: 'County boundaries and administrative divisions',
  },
  'education': {
    title: 'Education Facilities',
    description: 'Schools, polytechnics, and educational institutions',
  },
  'health': {
    title: 'Health Facilities',
    description: 'Healthcare facilities and services distribution',
  },
  'wind': {
    title: 'Wind Resources',
    description: 'Wind speed and energy potential',
  },
  'ghi': {
    title: 'Solar Irradiation (GHI)',
    description: 'Global Horizontal Irradiance distribution',
  },
  'electricity': {
    title: 'Electricity Access',
    description: 'Electrification status and distribution',
  },
}

export default function CountyMapsPage() {
  const params = useParams()
  const router = useRouter()
  const county = decodeURIComponent(params.county as string)

  const countyMaps = COUNTY_MAPS[county] || {}
  const mapTypes = Object.keys(MAP_LABELS) as Array<keyof typeof MAP_LABELS>

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/?section=themed-charts">
              <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                <ArrowLeft size={16} />
                Back to Counties
              </Button>
            </Link>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">{county} County Maps</h1>
          <p className="text-slate-600 dark:text-slate-400">Thematic maps and visualizations for {county} County</p>
        </div>
      </div>

      {/* Maps Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mapTypes.map((mapType) => {
            const label = MAP_LABELS[mapType]
            const mapUrl = countyMaps[mapType] as string | null
            const hasMap = mapUrl !== null && mapUrl !== undefined

            return (
              <Card
                key={mapType}
                className="overflow-hidden hover:shadow-lg transition-shadow bg-white dark:bg-slate-800"
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-slate-900 dark:text-white">
                    {label.title}
                  </CardTitle>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    {label.description}
                  </p>
                </CardHeader>
                <CardContent>
                  {hasMap ? (
                    <div className="relative w-full bg-slate-100 dark:bg-slate-900 rounded-lg overflow-hidden aspect-square">
                      <img
                        src={mapUrl || "/placeholder.svg"}
                        alt={label.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-lg aspect-square flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700">
                      <div className="text-center">
                        <p className="text-slate-500 dark:text-slate-500 text-sm font-medium">
                          No map available
                        </p>
                        <p className="text-slate-400 dark:text-slate-600 text-xs mt-1">
                          for {county} County
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
