"use client"

import * as d3 from "d3-geo"
import { useMemo, useState } from "react"
import {
  kenyaCountiesGeoJSON,
  ACTIVE_COUNTIES,
  ACTIVE_COUNTY_COLOR,
  INACTIVE_COLOR,
  SELECTED_COLOR_GREEN,
} from "@/lib/kenya-counties-geojson"

interface KenyaMapD3Props {
  selectedCounty: string | null
  onCountySelect: (county: string) => void
}

export default function KenyaMapD3({ selectedCounty, onCountySelect }: KenyaMapD3Props) {
  const [selectedCounties, setSelectedCounties] = useState<Set<string>>(new Set())
  const [hoveredCounty, setHoveredCounty] = useState<string | null>(null)

  const { projection, path } = useMemo(() => {
    const proj = d3.geoMercator().fitSize([600, 700], kenyaCountiesGeoJSON)
    const pathGen = d3.geoPath().projection(proj)
    return { projection: proj, path: pathGen }
  }, [])

  const getColor = (county: string) => {
    if (selectedCounties.has(county)) return SELECTED_COLOR_GREEN
    if (ACTIVE_COUNTIES.includes(county)) return ACTIVE_COUNTY_COLOR
    return INACTIVE_COLOR
  }

  const handleCountyClick = (county: string) => {
    const newSelected = new Set(selectedCounties)
    if (newSelected.has(county)) {
      newSelected.delete(county)
    } else {
      newSelected.add(county)
    }
    setSelectedCounties(newSelected)
    onCountySelect(county)
  }

  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-lg p-4 flex flex-col items-center justify-center border border-slate-200 dark:border-slate-700">
      <svg width={600} height={700} className="border border-slate-300 dark:border-slate-600 rounded">
        {kenyaCountiesGeoJSON.features.map((feature) => {
          const county = feature.properties.County
          const d = path(feature)

          return (
            <path
              key={county}
              d={d || ""}
              fill={getColor(county)}
              stroke="#334155"
              strokeWidth="0.5"
              onClick={() => handleCountyClick(county)}
              onMouseEnter={() => setHoveredCounty(county)}
              onMouseLeave={() => setHoveredCounty(null)}
              style={{
                cursor: "pointer",
                transition: "all 0.2s ease",
                opacity: hoveredCounty === county || hoveredCounty === null ? 1 : 0.7,
                filter: hoveredCounty === county ? "brightness(1.1)" : "brightness(1)",
              }}
            />
          )
        })}
      </svg>

      {/* Legend */}
      <div className="mt-4 text-sm text-muted-foreground flex flex-col gap-2 w-full">
        <p className="font-semibold text-slate-900 dark:text-white text-xs">Map Legend:</p>

        <div className="grid grid-cols-3 gap-3">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border border-slate-300" style={{ backgroundColor: ACTIVE_COUNTY_COLOR }} />
            <span className="text-xs">Has Data (4)</span>
          </div>

          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded border border-slate-300"
              style={{ backgroundColor: SELECTED_COLOR_GREEN }}
            />
            <span className="text-xs">Selected</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border border-slate-300" style={{ backgroundColor: INACTIVE_COLOR }} />
            <span className="text-xs">No Data</span>
          </div>
        </div>

        {hoveredCounty && (
          <p className="font-semibold text-slate-700 dark:text-slate-300 text-xs">Hovering: {hoveredCounty}</p>
        )}

        {selectedCounties.size > 0 && (
          <p className="font-semibold text-slate-700 dark:text-slate-300 text-xs">
            Selected: {Array.from(selectedCounties).join(", ")}
          </p>
        )}
      </div>
    </div>
  )
}
