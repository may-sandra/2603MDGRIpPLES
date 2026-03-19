'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight, ArrowLeft } from 'lucide-react'
import { countyMapsData } from '@/lib/county-maps-data'

interface CountyMapsViewProps {
  county: string
  onClose?: () => void
}

export default function CountyMapsView({ county, onClose }: CountyMapsViewProps) {
  const maps = countyMapsData[county] || []

  if (maps.length === 0) {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <Link href="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium text-sm">
              <ArrowLeft size={16} />
              Back to Home
            </Link>
          </div>

          <div className="text-center py-12">
            <p className="text-slate-600">No maps available for {county}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Top Navigation */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium text-sm">
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </div>

        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-sm mb-6">
          <Link href="/counties" className="text-blue-600 hover:text-blue-800 font-medium">
            Counties
          </Link>
          <ChevronRight size={16} className="text-slate-400" />
          <span className="text-slate-700 font-semibold">{county}</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">{county} County Context Maps</h1>
          <p className="text-slate-600">Visual representation of key energy and infrastructure resources</p>
        </div>

        {/* Maps Grid - 2 columns, 3 rows */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {maps.map((map, index) => (
            <div
              key={index}
              className="bg-white rounded-lg overflow-hidden shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
            >
              {/* Map Header */}
              <div className="bg-gradient-to-r from-blue-50 to-green-50 border-b border-slate-200 p-4">
                <h2 className="text-lg font-semibold text-slate-900">{map.title}</h2>
                <p className="text-sm text-slate-600 mt-1">{map.description}</p>
              </div>

              {/* Map Image */}
              <div className="relative w-full h-96 bg-slate-100 flex items-center justify-center overflow-hidden">
                <Image
                  src={map.imagePath || "/placeholder.svg"}
                  alt={map.title}
                  fill
                  className="object-contain"
                  priority={index < 2}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
