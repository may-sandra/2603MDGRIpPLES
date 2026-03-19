"use client"

import { useState, useRef } from "react"
import { getUniqueCounties } from "@/lib/data"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, ZoomIn, ZoomOut } from "lucide-react"

interface GeoJSONMapProps {
  selectedCounty: string | null
  onCountySelect: (county: string | null) => void
}

export default function GeoJSONMap({ selectedCounty, onCountySelect }: GeoJSONMapProps) {
  const counties = getUniqueCounties()
  const [hoveredCounty, setHoveredCounty] = useState<string | null>(null)
  const [zoom, setZoom] = useState(1)
  const svgRef = useRef<SVGSVGElement>(null)

  const getCountyColor = (county: string) => {
    if (selectedCounty === county) return "#16a34a" // green-600
    if (hoveredCounty === county) return "#22c55e" // green-500

    const colors: Record<string, string> = {
      Kilifi: "#3b82f6", // blue-500
      Kitui: "#f97316", // orange-500
      Kiambu: "#8b5cf6", // violet-500
      Nyandarua: "#06b6d4", // cyan-500
    }
    return colors[county] || "#94a3b8"
  }

  // County positions for labels (approximate center points based on SVG viewBox 0 0 800 1008)
  const countyLabelPositions: Record<string, { x: number; y: number }> = {
    Kilifi: { x: 620, y: 680 },
    Kitui: { x: 540, y: 620 },
    Kiambu: { x: 470, y: 530 },
    Nyandarua: { x: 420, y: 480 },
  }

  // Simplified county boundary paths (approximate)
  const countyPaths: Record<string, string> = {
    // These are simplified representations based on actual Kenya county boundaries
    Kilifi: "M 580 600 L 620 580 L 660 600 L 680 650 L 670 720 L 640 760 L 600 780 L 560 750 L 550 700 L 560 650 Z",
    Kitui: "M 480 520 L 540 500 L 580 530 L 600 580 L 590 640 L 560 700 L 520 720 L 470 700 L 450 640 L 460 580 Z",
    Kiambu: "M 440 480 L 480 470 L 510 490 L 520 530 L 500 570 L 460 580 L 430 560 L 420 520 L 430 490 Z",
    Nyandarua: "M 380 420 L 420 410 L 450 430 L 460 470 L 440 510 L 400 520 L 370 500 L 360 460 L 370 430 Z",
  }

  return (
    <div className="w-full h-full bg-card rounded-lg border shadow-sm overflow-hidden flex flex-col">
      <div className="p-4 border-b bg-gradient-to-r from-primary/10 to-primary/5 flex-shrink-0">
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm text-foreground">Kenya Counties Map</h3>
        </div>
        <Select
          value={selectedCounty || "All Counties"}
          onValueChange={(value) => onCountySelect(value === "All Counties" ? null : value)}
        >
          <SelectTrigger className="w-full bg-background">
            <SelectValue placeholder="Select a county..." />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            <SelectItem value="All Counties">All Counties</SelectItem>
            {counties.map((county) => (
              <SelectItem key={county} value={county}>
                {county}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 overflow-hidden bg-gradient-to-b from-emerald-50/50 to-sky-50/50 dark:from-emerald-950/20 dark:to-sky-950/20 relative p-4">
        <svg
          ref={svgRef}
          viewBox="300 350 450 500"
          className="w-full h-full cursor-grab active:cursor-grabbing"
          preserveAspectRatio="xMidYMid meet"
          style={{ transform: `scale(${zoom})`, transformOrigin: "center" }}
        >
          {/* Kenya outline background */}
          <path
            d="M 300 350 L 400 320 L 550 340 L 700 400 L 750 500 L 740 650 L 700 780 L 600 850 L 450 840 L 350 750 L 320 600 L 310 450 Z"
            fill="hsl(var(--muted) / 0.2)"
            stroke="hsl(var(--border))"
            strokeWidth="1"
          />

          {/* County shapes */}
          {counties.map((county) => {
            const path = countyPaths[county]
            if (!path) return null

            const isSelected = selectedCounty === county
            const isHovered = hoveredCounty === county

            return (
              <g key={county}>
                <path
                  d={path}
                  fill={getCountyColor(county)}
                  stroke={isSelected ? "#16a34a" : "#fff"}
                  strokeWidth={isSelected ? 3 : 1.5}
                  className="cursor-pointer transition-all duration-200 hover:brightness-110"
                  style={{
                    filter: isSelected || isHovered ? "drop-shadow(0 4px 6px rgba(0,0,0,0.3))" : "none",
                    opacity: selectedCounty && !isSelected ? 0.5 : 1,
                  }}
                  onClick={() => onCountySelect(isSelected ? null : county)}
                  onMouseEnter={() => setHoveredCounty(county)}
                  onMouseLeave={() => setHoveredCounty(null)}
                />
                {/* County label */}
                <text
                  x={countyLabelPositions[county]?.x || 500}
                  y={countyLabelPositions[county]?.y || 500}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="pointer-events-none select-none font-semibold"
                  style={{
                    fontSize: isSelected ? "14px" : "11px",
                    fill: "#fff",
                    textShadow: "1px 1px 2px rgba(0,0,0,0.8)",
                  }}
                >
                  {county}
                </text>
              </g>
            )
          })}
        </svg>

        {/* Zoom controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 bg-background/90 backdrop-blur-sm rounded-lg shadow-sm border">
          <button
            onClick={() => setZoom((z) => Math.min(z + 0.2, 2))}
            className="p-2 hover:bg-muted rounded-t-md transition-colors"
            title="Zoom in"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(z - 0.2, 1))}
            className="p-2 hover:bg-muted rounded-b-md transition-colors"
            title="Zoom out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Selected county info */}
      {selectedCounty && (
        <div className="p-3 border-t bg-primary/5 flex-shrink-0 max-h-20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Selected</p>
              <p className="font-semibold text-sm text-primary">{selectedCounty} County</p>
            </div>
            <button
              onClick={() => onCountySelect(null)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded hover:bg-muted"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
