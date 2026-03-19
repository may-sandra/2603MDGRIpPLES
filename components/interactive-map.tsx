"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getKenyaCountiesGeoJson, getCountyBounds } from "@/lib/geo-data"
import { getUniqueCounties } from "@/lib/data"

interface InteractiveMapProps {
  selectedCounty: string | null
  onCountySelect: (county: string | null) => void
  selectedThematic: string | null
}

export default function InteractiveMap({ selectedCounty, onCountySelect, selectedThematic }: InteractiveMapProps) {
  const counties = getUniqueCounties()
  const [geoJsonData, setGeoJsonData] = useState<Record<string, any>>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getKenyaCountiesGeoJson().then((data) => {
      setGeoJsonData(data)
      setIsLoading(false)
    })
  }, [])

  const globalBounds = useMemo(() => {
    let minX = Number.POSITIVE_INFINITY,
      maxX = Number.NEGATIVE_INFINITY,
      minY = Number.POSITIVE_INFINITY,
      maxY = Number.NEGATIVE_INFINITY

    Object.values(geoJsonData).forEach((geometry: any) => {
      if (geometry.type === "Polygon") {
        const bounds = getCountyBounds(geometry.coordinates)
        minX = Math.min(minX, bounds.minX)
        maxX = Math.max(maxX, bounds.maxX)
        minY = Math.min(minY, bounds.minY)
        maxY = Math.max(maxY, bounds.maxY)
      }
    })

    const padding = 10000
    return {
      minX: minX - padding,
      maxX: maxX + padding,
      minY: minY - padding,
      maxY: maxY + padding,
    }
  }, [geoJsonData])

  const svgBounds = useMemo(() => {
    const { minX, maxX, minY, maxY } = globalBounds
    const width = maxX - minX
    const height = maxY - minY
    const aspectRatio = width / height
    const svgHeight = 600
    const svgWidth = svgHeight * aspectRatio

    const scaleX = svgWidth / width
    const scaleY = svgHeight / height
    const scale = Math.min(scaleX, scaleY)

    return { minX, minY, width, height, scale, svgWidth, svgHeight }
  }, [globalBounds])

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Kenya Counties Map</CardTitle>
        <CardDescription>Click counties to filter data by location</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="w-full h-96 flex items-center justify-center bg-muted/20 rounded-lg border border-border">
            <p className="text-muted-foreground">Loading map...</p>
          </div>
        ) : (
          <div className="w-full overflow-auto bg-muted/20 rounded-lg border border-border p-4">
            <svg
              viewBox={`0 0 ${svgBounds.svgWidth} ${svgBounds.svgHeight}`}
              className="w-full h-auto max-w-full"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <style>{`
                  .county-polygon {
                    fill: hsl(var(--muted));
                    stroke: hsl(var(--border));
                    stroke-width: 1;
                    cursor: pointer;
                    transition: all 0.2s ease;
                  }
                  .county-polygon:hover {
                    fill: hsl(var(--accent) / 0.4);
                    stroke: hsl(var(--accent));
                    stroke-width: 1.5;
                  }
                  .county-polygon.selected {
                    fill: hsl(var(--chart-1));
                    stroke: hsl(var(--foreground));
                    stroke-width: 2;
                  }
                  .county-polygon.inactive {
                    opacity: 0.3;
                  }
                  .county-label {
                    font-size: 11px;
                    font-weight: 600;
                    text-anchor: middle;
                    pointer-events: none;
                    fill: hsl(var(--foreground));
                    text-shadow: 0 1px 2px rgba(0,0,0,0.2);
                  }
                `}</style>
              </defs>

              {counties.map((county) => {
                const geometry = geoJsonData[county] as any
                if (!geometry || geometry.type !== "Polygon") return null

                const coordinates = geometry.coordinates[0]
                const points = coordinates
                  .map(
                    ([x, y]: number[]) =>
                      `${((x - svgBounds.minX) * svgBounds.scale).toFixed(1)},${((y - svgBounds.minY) * svgBounds.scale).toFixed(1)}`,
                  )
                  .join(" ")

                const bounds = getCountyBounds(geometry.coordinates)
                const centerX = ((bounds.minX + bounds.maxX) / 2 - svgBounds.minX) * svgBounds.scale
                const centerY = ((bounds.minY + bounds.maxY) / 2 - svgBounds.minY) * svgBounds.scale

                const isSelected = selectedCounty === county
                const isInactive = selectedCounty && !isSelected

                return (
                  <g key={county}>
                    <polygon
                      points={points}
                      className={`county-polygon ${isSelected ? "selected" : isInactive ? "inactive" : ""}`}
                      onClick={() => onCountySelect(isSelected ? null : county)}
                    />
                    <text x={centerX} y={centerY} className="county-label">
                      {county}
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
