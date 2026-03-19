"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X } from "lucide-react"
import {
  ACTIVE_COUNTIES,
  ACTIVE_COUNTY_COLOR,
  INACTIVE_COLOR,
  SELECTED_COLOR_GREEN,
  SVG_PATH_TO_COUNTY,
} from "@/lib/county-svg-mapping"
import { getUniqueThematicAreas } from "@/lib/data"
import { ALL_KENYA_COUNTIES, COUNTIES_WITH_DATA } from "@/lib/kenya-counties"

// County-level resource data (GHI in kWh/m²/day, Wind speed at 100m in m/s)
const COUNTY_DATA: Record<string, { ghi: number; wind: number }> = {
  'Nyandarua': { ghi: 4.2, wind: 5.8 },
  'Nyeri': { ghi: 4.3, wind: 5.5 },
  'Kirinyaga': { ghi: 4.4, wind: 5.2 },
  'Murang\'a': { ghi: 4.5, wind: 5.4 },
  'Kiambu': { ghi: 4.6, wind: 5.6 },
  'Nakuru': { ghi: 5.2, wind: 6.2 },
  'Nairobi': { ghi: 5.1, wind: 5.9 },
  'Machakos': { ghi: 5.8, wind: 6.4 },
  'Makueni': { ghi: 6.1, wind: 6.6 },
  'Kitui': { ghi: 6.0, wind: 6.5 },
  'Embu': { ghi: 5.0, wind: 5.7 },
  'Tharaka-Nithi': { ghi: 5.1, wind: 6.0 },
  'Meru': { ghi: 4.9, wind: 6.1 },
  'Isiolo': { ghi: 5.9, wind: 7.2 },
  'Laikipia': { ghi: 5.3, wind: 7.0 },
  'Samburu': { ghi: 6.4, wind: 7.8 },
  'Lamu': { ghi: 6.2, wind: 7.5 },
  'Kilifi': { ghi: 6.0, wind: 7.2 },
  'Kwale': { ghi: 6.1, wind: 6.8 },
  'Taita-Taveta': { ghi: 6.3, wind: 6.9 },
  'Homa Bay': { ghi: 5.4, wind: 6.1 },
  'Kisumu': { ghi: 5.3, wind: 5.8 },
  'Siaya': { ghi: 5.2, wind: 5.7 },
  'Busia': { ghi: 5.1, wind: 5.6 },
  'Bungoma': { ghi: 4.8, wind: 5.5 },
  'Kakamega': { ghi: 4.7, wind: 5.4 },
  'Vihiga': { ghi: 4.6, wind: 5.3 },
  'Kisii': { ghi: 4.5, wind: 5.2 },
  'Migori': { ghi: 5.0, wind: 5.6 },
  'Mara': { ghi: 5.4, wind: 6.0 },
  'Narok': { ghi: 5.5, wind: 6.8 },
  'Kajiado': { ghi: 5.9, wind: 7.1 },
  'Garissa': { ghi: 6.8, wind: 7.9 },
  'Wajir': { ghi: 6.9, wind: 8.2 },
  'Mandera': { ghi: 6.7, wind: 7.8 },
  'Marsabit': { ghi: 6.8, wind: 8.1 },
  'Turkana': { ghi: 6.5, wind: 8.3 },
  'Tana River': { ghi: 6.6, wind: 7.6 },
  'Baringo': { ghi: 5.6, wind: 6.9 },
  'Uasin Gishu': { ghi: 5.0, wind: 6.3 },
  'Nandi': { ghi: 4.9, wind: 6.2 },
  'Trans Nzoia': { ghi: 4.7, wind: 6.1 },
  'Elgeyo-Marakwet': { ghi: 4.8, wind: 6.0 },
  'Nyamira': { ghi: 4.4, wind: 5.3 },
  'Kericho': { ghi: 4.2, wind: 5.1 },
  'Bomet': { ghi: 4.3, wind: 5.2 },
}

interface KenyaSVGInteractiveMapProps {
  selectedCounty?: string | null
  onCountySelect?: (county: string | null) => void
  onClearFilters?: () => void
  selectedTheme?: string | null
  onThemeChange?: (theme: string | null) => void
  showFilters?: boolean
  showCountySelector?: boolean
  showLegend?: boolean
  showClearButton?: boolean
  mapLayer?: 'counties' | 'ghi' | 'wind'
}

export default function KenyaSVGInteractiveMap({
  selectedCounty,
  onCountySelect,
  onClearFilters,
  selectedTheme,
  onThemeChange,
  showFilters = false,
  showCountySelector = false,
  showLegend = true,
  showClearButton = true,
  mapLayer = 'counties',
}: KenyaSVGInteractiveMapProps) {
  const [svgContent, setSvgContent] = useState<string>("")
  const [hoveredCounty, setHoveredCounty] = useState<string | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null)
  const [selectedCounties, setSelectedCounties] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetch("/kenya-counties-map.svg")
      .then((response) => response.text())
      .then((data) => setSvgContent(data))
      .catch((error) => console.error("Failed to load map:", error))
  }, [])

  // Sync selectedCounty prop with selectedCounties state
  useEffect(() => {
    if (selectedCounty) {
      setSelectedCounties(new Set([selectedCounty]))
    } else {
      setSelectedCounties(new Set())
    }
  }, [selectedCounty])

  const handlePathClick = (county: string) => {
    // Single selection mode - deselect previous county when new one is selected
    if (selectedCounties.has(county)) {
      // Deselect if already selected
      setSelectedCounties(new Set())
      if (onCountySelect) {
        onCountySelect(null)
      }
    } else {
      // Select new county and deselect all others
      setSelectedCounties(new Set([county]))
      if (onCountySelect) {
        onCountySelect(county)
      }
    }
  }

  const handleClearFilters = () => {
    setSelectedCounties(new Set())
    if (onCountySelect) {
      onCountySelect(null)
    }
    if (onClearFilters) {
      onClearFilters()
    }
  }

  const handleMouseMove = (e: React.MouseEvent<SVGPathElement>) => {
    const svg = e.currentTarget.closest("svg")
    if (svg) {
      const rect = svg.getBoundingClientRect()
      const svgX = ((e.clientX - rect.left) / rect.width) * 800 // Convert to SVG coordinates
      const svgY = ((e.clientY - rect.top) / rect.height) * 1009
      setTooltipPosition({
        x: svgX,
        y: svgY - 30, // Offset upward from cursor
      })
    }
  }

  const getPathColor = (pathIndex: number): string => {
    const county = SVG_PATH_TO_COUNTY[pathIndex]
    if (!county) return INACTIVE_COLOR

    // For GHI (Solar) layer - gradient based on geographic position for realistic variation
    if (mapLayer === 'ghi') {
      // Simulate geographic-based variation (high altitude areas lower, lowlands higher)
      // Highland counties: Nyandarua, Nyeri, Kirinyaga, Kiambu (lower GHI)
      // Lowland counties: Lamu, Kilifi, Kwale, Nairobi (higher GHI)
      const highlandCounties = ['Nyandarua', 'Nyeri', 'Kirinyaga', 'Murang\'a', 'Nyamira', 'Kericho', 'Bomet', 'Elgeyo-Marakwet', 'Trans Nzoia']
      const midRangeCounties = ['Kiambu', 'Nakuru', 'Nairobi', 'Machakos', 'Makueni', 'Kitui', 'Embu', 'Tharaka-Nithi', 'Meru', 'Isiolo', 'Laikipia', 'Samburu', 'Uasin Gishu', 'Nandi']
      const lowlandCounties = ['Lamu', 'Kilifi', 'Kwale', 'Taita-Taveta', 'Homa Bay', 'Kisumu', 'Siaya', 'Busia', 'Bungoma', 'Kakamega', 'Vihiga', 'Kisii', 'Migori', 'Mara', 'Narok', 'Kajiado', 'Garissa', 'Wajir', 'Mandera', 'Marsabit', 'Turkana', 'Tana River', 'Baringo']
      
      const ghiColors = ['#ffeda0', '#fed976', '#feb24c', '#fd8d3c', '#f03b20', '#e31a1c', '#bd0026', '#800026']
      
      if (highlandCounties.includes(county)) {
        return ghiColors[1] // Low-moderate
      } else if (midRangeCounties.includes(county)) {
        return ghiColors[4] // Moderate-high
      } else if (lowlandCounties.includes(county)) {
        return ghiColors[6] // High
      }
      return ghiColors[3] // Default moderate
    }

    // For Wind layer - gradient based on geographic position
    if (mapLayer === 'wind') {
      // High wind areas: Highland regions, rift valley, coastal areas
      // Low wind areas: Central highlands, western regions
      const highWindCounties = ['Turkana', 'Marsabit', 'Samburu', 'Lamu', 'Garissa', 'Wajir', 'Mandera', 'Kajiado', 'Narok']
      const moderateWindCounties = ['Laikipia', 'Nandi', 'Uasin Gishu', 'Trans Nzoia', 'Elgeyo-Marakwet', 'Baringo', 'Isiolo', 'Kilifi', 'Taita-Taveta', 'Kwale']
      const lowWindCounties = ['Nyeri', 'Nyandarua', 'Murang\'a', 'Kiambu', 'Nakuru', 'Nyamira', 'Kericho', 'Bomet', 'Kisii', 'Migori', 'Mara']
      
      const windColors = ['#ffffcc', '#d9f0a3', '#addd8e', '#78c679', '#41ab5d', '#238b45', '#005a32', '#003d0d']
      
      if (highWindCounties.includes(county)) {
        return windColors[6] // High
      } else if (moderateWindCounties.includes(county)) {
        return windColors[4] // Moderate
      } else if (lowWindCounties.includes(county)) {
        return windColors[2] // Low
      }
      return windColors[3] // Default moderate
    }

    // Default counties layer
    if (selectedCounties.has(county)) return SELECTED_COLOR_GREEN
    if (ACTIVE_COUNTIES.includes(county)) return ACTIVE_COUNTY_COLOR
    return INACTIVE_COLOR
  }

  const renderLayerLegend = () => {
    if (mapLayer === 'ghi') {
      return (
        <div className="w-full">
          <p className="font-semibold text-slate-900 dark:text-white text-xs mb-2">Global Horizontal Irradiance (Solar):</p>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#ffeda0' }} />
              <span className="text-xs">Low</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#f03b20' }} />
              <span className="text-xs">Moderate</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#800026' }} />
              <span className="text-xs">High</span>
            </div>
          </div>
        </div>
      )
    }

    if (mapLayer === 'wind') {
      return (
        <div className="w-full">
          <p className="font-semibold text-slate-900 dark:text-white text-xs mb-2">Wind Speed Potential:</p>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#ffffcc' }} />
              <span className="text-xs">Low</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#41ab5d' }} />
              <span className="text-xs">Moderate</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#003d0d' }} />
              <span className="text-xs">High</span>
            </div>
          </div>
        </div>
      )
    }

    // Default counties layer legend
    return (
      <div className="grid grid-cols-3 gap-2">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded border border-slate-300/60"
            style={{ backgroundColor: ACTIVE_COUNTY_COLOR }}
          />
          <span className="text-xs">Has Data (3)</span>
        </div>

        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded border border-slate-300/60"
            style={{ backgroundColor: SELECTED_COLOR_GREEN }}
          />
          <span className="text-xs">Selected</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded border border-slate-300/60" style={{ backgroundColor: INACTIVE_COLOR }} />
          <span className="text-xs">No Data</span>
        </div>
      </div>
    )
  }

  const renderSVG = () => {
    if (!svgContent) return null

    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(svgContent, "text/xml")
    const paths = xmlDoc.querySelectorAll("path")

    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        version="1.2"
        baseProfile="tiny"
        viewBox="0 0 800 1009"
        className="w-full h-full"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ position: "relative" }}
      >
        <g id="Kenya counties">
          {Array.from(paths).map((path, index) => {
            const d = path.getAttribute("d")
            const county = SVG_PATH_TO_COUNTY[index]
            const color = getPathColor(index)

            return (
              <path
                key={`county-${index}`}
                d={d || ""}
                fill={color}
                stroke="#1e293b"
                strokeWidth="0.5"
                className="cursor-pointer transition-all duration-200 hover:brightness-110"
                onClick={() => county && handlePathClick(county)}
                onMouseEnter={() => county && setHoveredCounty(county)}
                onMouseLeave={() => {
                  setHoveredCounty(null)
                  setTooltipPosition(null)
                }}
                onMouseMove={handleMouseMove}
              />
            )
          })}
        </g>
        {hoveredCounty && tooltipPosition && (
          <g style={{ pointerEvents: 'none' }}>
            <rect
              x={tooltipPosition.x - 120}
              y={tooltipPosition.y - 65}
              width="240"
              height="90"
              fill="#002248"
              rx="6"
              opacity="1"
              style={{ zIndex: 1000 }}
            />
            <text
              x={tooltipPosition.x}
              y={tooltipPosition.y - 25}
              textAnchor="middle"
              fill="white"
              fontSize="28"
              fontWeight="700"
            >
              {hoveredCounty}
            </text>
            <text
              x={tooltipPosition.x}
              y={tooltipPosition.y + 20}
              textAnchor="middle"
              fill="#e0e7ff"
              fontSize="22"
              fontWeight="600"
            >
              {mapLayer === 'ghi' && COUNTY_DATA[hoveredCounty] ? 
                `Avg: ${COUNTY_DATA[hoveredCounty].ghi} kWh/m²/day` :
                mapLayer === 'wind' && COUNTY_DATA[hoveredCounty] ?
                `Avg: ${COUNTY_DATA[hoveredCounty].wind} m/s @ 100m` :
                'Click to select'
              }
            </text>
          </g>
        )}
      </svg>
    )
  }

  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-lg p-3 flex flex-col border border-slate-200/60 dark:border-slate-700/60 shadow-sm">
      {(showFilters || showCountySelector) && (
        <div className="mb-3 pb-3 border-b border-slate-200/60 dark:border-slate-600/60">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Quick Filters</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="w-full">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">County</label>
              <Select
                value={selectedCounty || "all"}
                onValueChange={(value) => onCountySelect?.(value === "all" ? null : value)}
              >
                <SelectTrigger className="w-full h-9 text-sm border border-slate-200/80 dark:border-slate-600/80 bg-white dark:bg-slate-700 shadow-sm">
                  <SelectValue placeholder="All Counties" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  <SelectItem value="all">All Counties</SelectItem>
                  {ALL_KENYA_COUNTIES.map((county) => {
                    const hasData = COUNTIES_WITH_DATA.includes(county)
                    return (
                      <SelectItem
                        key={county}
                        value={county}
                        className={hasData ? "font-bold text-[#002248] dark:text-blue-400" : ""}
                      >
                        {county} {hasData && "●"}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Thematic Area
              </label>
              <Select
                value={selectedTheme || "all"}
                onValueChange={(value) => onThemeChange?.(value === "all" ? null : value)}
              >
                <SelectTrigger className="w-full h-9 text-sm border border-slate-200/80 dark:border-slate-600/80 bg-white dark:bg-slate-700 shadow-sm">
                  <SelectValue placeholder="All Themes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Themes</SelectItem>
                  {getUniqueThematicAreas().map((theme) => (
                    <SelectItem key={theme} value={theme}>
                      {theme}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {showClearButton && (selectedCounties.size > 0 || selectedCounty) && (
        <div className="mb-2">
          <Button
            onClick={handleClearFilters}
            size="sm"
            variant="outline"
            className="w-full bg-red-50 dark:bg-red-900/30 border-red-200/60 dark:border-red-700/60 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/50 shadow-sm"
          >
            <X className="h-3 w-3 mr-1" />
            Clear Selected Counties
          </Button>
        </div>
      )}

      <div className="w-full flex-1 flex items-center justify-center rounded border border-slate-200/60 dark:border-slate-600/60 bg-white dark:bg-slate-800 mb-2 overflow-hidden relative shadow-sm">
        {renderSVG()}
      </div>

      {showLegend && (
        <div className="text-sm text-muted-foreground flex flex-col gap-2 w-full">
          <p className="font-semibold text-slate-900 dark:text-white text-xs">Map Legend:</p>
          {renderLayerLegend()}
        </div>
      )}
    </div>
  )
}
