"use client"

import { useState, useMemo } from "react"
import {
  kenyaCountiesGeoJSON,
  ACTIVE_COUNTIES,
  ACTIVE_COUNTY_COLOR,
  INACTIVE_COLOR,
  SELECTED_COLOR_GREEN,
} from "@/lib/kenya-counties-geojson"

interface KenyaMapInteractiveProps {
  selectedCounty: string | null
  onCountySelect: (county: string) => void
}

export default function KenyaMapInteractive({
  selectedCounty,
  onCountySelect,
}: KenyaMapInteractiveProps) {
  const [hoveredCounty, setHoveredCounty] = useState<string | null>(null)
  const [selectedCounties, setSelectedCounties] = useState<Set<string>>(new Set())

  const getCountyColor = (county: string): string => {
    if (selectedCounties.has(county)) return SELECTED_COLOR_GREEN
    if (ACTIVE_COUNTIES.includes(county)) return ACTIVE_COUNTY_COLOR
    return INACTIVE_COLOR
  }

  const handleCountyClick = (county: string) => {
    const newSelected = new Set(selectedCounties)
    newSelected.has(county) ? newSelected.delete(county) : newSelected.add(county)
    setSelectedCounties(newSelected)
    onCountySelect(county)
  }

  const generatePathD = (coordinates: number[][][]): string => {
    return coordinates
      .map((ring) =>
        ring
          .map((coord, idx) => `${idx === 0 ? "M" : "L"} ${coord[0]} ${coord[1]}`)
          .join(" ") + " Z"
      )
      .join(" ")
  }

  /** Memoize bounds → avoids recalculating on every render */
  const bounds = useMemo(() => {
    let minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity

    kenyaCountiesGeoJSON.features.forEach((feature) => {
      const processCoord = (coord: number[]) => {
        minX = Math.min(minX, coord[0])
        maxX = Math.max(maxX, coord[0])
        minY = Math.min(minY, coord[1])
        maxY = Math.max(maxY, coord[1])
      }

      if (feature.geometry.type === "Polygon") {
        feature.geometry.coordinates.forEach((ring) => ring.forEach(processCoord))
      } else if (feature.geometry.type === "MultiPolygon") {
        feature.geometry.coordinates.forEach((poly) => poly.forEach((ring) => ring.forEach(processCoord)))
      }
    })

    return { minX, maxX, minY, maxY }
  }, [])

  const width = bounds.maxX - bounds.minX
  const height = bounds.maxY - bounds.minY
  const padding = 0.5
  const viewBox = `${bounds.minX - padding} ${bounds.minY - padding} ${width + padding * 2} ${height +
    padding * 2}`

  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-lg p-4 flex flex-col items-center justify-center border border-slate-200 dark:border-slate-700">
      <svg
        viewBox={viewBox}
        className="w-full h-full max-h-96 cursor-pointer"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid meet"
      >
        <g id="kenya-counties">
          {kenyaCountiesGeoJSON.features.map((feature) => {
            const county = feature.properties.County as string
            const fillColor = getCountyColor(county)

            let pathD = ""
            if (feature.geometry.type === "Polygon") {
              pathD = generatePathD(feature.geometry.coordinates)
            } else if (feature.geometry.type === "MultiPolygon") {
              pathD = feature.geometry.coordinates
                .map((poly) => generatePathD(poly))
                .join(" ")
            }

            return (
              <path
                key={county}
                d={pathD}
                fill={fillColor}
                stroke="#1e293b"
                strokeWidth="0.02"
                opacity={hoveredCounty && hoveredCounty !== county ? 0.6 : 1}
                onMouseEnter={() => setHoveredCounty(county)}
                onMouseLeave={() => setHoveredCounty(null)}
                onClick={() => handleCountyClick(county)}
                className="transition-all duration-200 hover:brightness-110"
              />
            )
          })}
        </g>
      </svg>

      {/* Legend */}
      <div className="mt-4 text-sm text-muted-foreground flex flex-col gap-2 w-full">
        <p className="font-semibold text-slate-900 dark:text-white">Map Legend:</p>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border border-slate-300" style={{ backgroundColor: ACTIVE_COUNTY_COLOR }} />
            <span className="text-xs">Active (4)</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border border-slate-300" style={{ backgroundColor: SELECTED_COLOR_GREEN }} />
            <span className="text-xs">Selected</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border border-slate-300" style={{ backgroundColor: INACTIVE_COLOR }} />
            <span className="text-xs">Other</span>
          </div>
        </div>

        {selectedCounties.size > 0 && (
          <p className="font-semibold text-slate-700 dark:text-slate-300 text-xs">
            Selected: {Array.from(selectedCounties).join(", ")}
          </p>
        )}
      </div>
    </div>
  )
}
