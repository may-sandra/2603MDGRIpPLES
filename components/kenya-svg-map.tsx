"use client"

import { useState, useRef, useEffect } from "react"
import {
  ACTIVE_COUNTY_IDS,
  ACTIVE_COUNTY_COLOR_SVG,
  INACTIVE_COLOR_SVG,
  SELECTED_COLOR_GREEN_SVG,
  kenyaSvgCounties,
} from "@/lib/kenya-svg-counties"

interface KenyaSvgMapProps {
  selectedCounty: string | null
  onCountySelect: (county: string) => void
}

export default function KenyaSvgMap({ selectedCounty, onCountySelect }: KenyaSvgMapProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [hoveredCounty, setHoveredCounty] = useState<string | null>(null)
  const [selectedCounties, setSelectedCounties] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!svgRef.current) return

    const paths = svgRef.current.querySelectorAll("path")

    paths.forEach((path, index) => {
      const countyId = index + 1
      const countyData = kenyaSvgCounties.find((c) => c.objectId === countyId)
      const countyName = countyData?.name || `County ${countyId}`
      const hasData = ACTIVE_COUNTY_IDS.includes(countyId)

      // Color based on data availability
      const fill = hasData ? ACTIVE_COUNTY_COLOR_SVG : INACTIVE_COLOR_SVG
      path.setAttribute("fill", fill)
      path.setAttribute("stroke", "#94a3b8")
      path.setAttribute("stroke-width", "0.5")
      path.style.cursor = "pointer"
      path.style.transition = "all 0.2s ease"

      path.addEventListener("click", () => {
        handleCountyClick(countyName, countyId)
      })

      path.addEventListener("mouseenter", () => {
        setHoveredCounty(countyName)
        path.style.filter = "brightness(0.9)"
        path.style.opacity = "0.9"
      })

      path.addEventListener("mouseleave", () => {
        setHoveredCounty(null)
        path.style.filter = "brightness(1)"
        path.style.opacity = "1"
      })
    })
  }, [])

  const handleCountyClick = (countyName: string, countyId: number) => {
    const newSelected = new Set(selectedCounties)
    if (newSelected.has(countyName)) {
      newSelected.delete(countyName)
    } else {
      newSelected.add(countyName)
    }
    setSelectedCounties(newSelected)
    onCountySelect(countyName)
  }

  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-lg p-4 flex flex-col items-center justify-center border border-slate-200 dark:border-slate-700">
      <svg
        ref={svgRef}
        viewBox="0 0 800 1009"
        className="w-full max-w-4xl h-auto"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid meet"
      />

      {/* Legend */}
      <div className="mt-4 text-sm text-muted-foreground flex flex-col gap-2 w-full max-w-4xl">
        <p className="font-semibold text-slate-900 dark:text-white text-xs">Map Legend:</p>

        <div className="grid grid-cols-3 gap-3">
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded border border-slate-300"
              style={{ backgroundColor: ACTIVE_COUNTY_COLOR_SVG }}
            />
            <span className="text-xs">Has Data (4)</span>
          </div>

          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded border border-slate-300"
              style={{ backgroundColor: SELECTED_COLOR_GREEN_SVG }}
            />
            <span className="text-xs">Selected</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border border-slate-300" style={{ backgroundColor: INACTIVE_COLOR_SVG }} />
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
