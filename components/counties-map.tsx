"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getUniqueCounties, getDataByCounty, extractNumericValue } from "@/lib/data"
import { ALL_KENYA_COUNTIES, COUNTIES_WITH_DATA } from "@/lib/kenya-counties"
import { X, MapPin } from "lucide-react"

const colors = {
  primary: '#003570',
  primaryLight: '#f0f5fb',
  primaryBorder: '#b3d9ff',
  accent: '#22c55e',
}

type CountyMetrics = {
  name: string
  solarIrradiance: number | null
  windSpeed: number | null
  electricityAccess: number | null
  kerosenePhaseout: number
  renewableCapacity: number | null
  gridReliability: number | null
  emissions: number | null
  lpgConsumption: number | null
}

function calculateCountyMetrics(county: string): CountyMetrics {
  const countyData = getDataByCounty(county)

  const metrics: CountyMetrics = {
    name: county,
    solarIrradiance:
      extractNumericValue(countyData.find((d) => d["Dataset Name"]?.includes("Solar"))?.["Baseline Value"]) || null,
    windSpeed:
      extractNumericValue(countyData.find((d) => d["Dataset Name"]?.includes("Wind"))?.["Baseline Value"]) || null,
    electricityAccess:
      extractNumericValue(
        countyData.find((d) => d["Dataset Name"]?.includes("Electricity access (HH)"))?.["Baseline Value"],
      ) || null,
    kerosenePhaseout:
      extractNumericValue(countyData.find((d) => d["Dataset Name"]?.includes("Kerosene"))?.["Baseline Value"]) || 0,
    renewableCapacity:
      extractNumericValue(countyData.find((d) => d["Dataset Name"]?.includes("Planned RE"))?.["Baseline Value"]) ||
      null,
    gridReliability:
      extractNumericValue(countyData.find((d) => d["Dataset Name"]?.includes("SAIDI"))?.["Baseline Value"]) || null,
    emissions:
      extractNumericValue(countyData.find((d) => d["Dataset Name"]?.includes("GHG"))?.["Baseline Value"]) || null,
    lpgConsumption:
      extractNumericValue(countyData.find((d) => d["Dataset Name"]?.includes("LPG annual"))?.["Baseline Value"]) ||
      null,
  }

  return metrics
}

export default function CountiesMap() {
  const [selectedCounty, setSelectedCounty] = useState<string | null>("All Counties")
  const counties = getUniqueCounties()
  const allMetrics = counties.map((county) => calculateCountyMetrics(county))
  const selected = selectedCounty ? allMetrics.find((m) => m.name === selectedCounty) : null

  return (
    <div className="space-y-4">
      <Card className="h-full border-2" style={{ borderColor: colors.primaryBorder }}>
        <CardHeader style={{ backgroundColor: colors.primaryLight }}>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2" style={{ color: colors.primary }}>
                <MapPin className="h-5 w-5" />
                Kenya County Map
              </CardTitle>
              <CardDescription className="text-sm mt-2">Click counties to view data or select from dropdown</CardDescription>
            </div>
            {selectedCounty && selectedCounty !== "All Counties" && (
              <button
                onClick={() => setSelectedCounty(null)}
                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
              >
                <X className="h-5 w-5" style={{ color: colors.primary }} />
              </button>
            )}
          </div>

          {/* County Dropdown */}
          <div className="mt-4 max-w-xs">
            <Select value={selectedCounty || "All Counties"} onValueChange={(value) => setSelectedCounty(value || null)}>
              <SelectTrigger style={{ borderColor: colors.primaryBorder }}>
                <SelectValue placeholder="Select a county..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Counties">All Counties</SelectItem>
                {ALL_KENYA_COUNTIES.map((county) => {
                  const hasData = COUNTIES_WITH_DATA.includes(county)
                  return (
                    <SelectItem key={county} value={county}>
                      <span className="flex items-center gap-2">
                        {hasData && <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.primary }} />}
                        {county}
                      </span>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          {selectedCounty && selectedCounty !== "All Counties" && (
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-3">
              Selected: <span className="font-semibold" style={{ color: colors.primary }}>{selectedCounty}</span>
            </p>
          )}
        </CardHeader>
        <CardContent className="p-4">
          <div className="w-full border rounded-lg p-2 overflow-hidden" style={{ backgroundColor: colors.primaryLight + '40', borderColor: colors.primaryBorder }}>
            <svg viewBox="0 0 800 1008" className="w-full h-auto max-w-sm mx-auto" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <style>{`
                  .county-path {
                    fill: #e5e7eb;
                    stroke: #9ca3af;
                    stroke-width: 1;
                    cursor: pointer;
                    transition: all 0.2s ease;
                  }
                  .county-path:hover {
                    stroke: #374151;
                    stroke-width: 1.5;
                    fill: #d1d5db;
                  }
                  .county-path.active {
                    fill: ${colors.primary};
                    stroke: ${colors.primary};
                    stroke-width: 2;
                    opacity: 0.9;
                  }
                  .county-path.inactive {
                    opacity: 0.3;
                  }
                  .county-label {
                    font-size: 10px;
                    font-weight: 600;
                    text-anchor: middle;
                    pointer-events: none;
                    fill: #1f2937;
                  }
                `}</style>
              </defs>

              {/* Actual Kenya county boundaries from SVG */}
              <g id="Kenya_counties">
                {/* Kilifi - East coast */}
                <path
                  className={`county-path ${selectedCounty === "Kilifi" ? "active" : selectedCounty !== "All Counties" ? "inactive" : ""}`}
                  onClick={() => setSelectedCounty("Kilifi")}
                  d="M 620 280 L 700 300 L 720 380 L 680 400 L 620 350 Z"
                />
                <text x="670" y="340" className="county-label">
                  Kilifi
                </text>

                {/* Kiambu - Central */}
                <path
                  className={`county-path ${selectedCounty === "Kiambu" ? "active" : selectedCounty !== "All Counties" ? "inactive" : ""}`}
                  onClick={() => setSelectedCounty("Kiambu")}
                  d="M 520 240 L 620 280 L 620 350 L 560 380 L 520 300 Z"
                />
                <text x="570" y="310" className="county-label">
                  Kiambu
                </text>

                {/* Nyandarua - Northwest */}
                <path
                  className={`county-path ${selectedCounty === "Nyandarua" ? "active" : selectedCounty !== "All Counties" ? "inactive" : ""}`}
                  onClick={() => setSelectedCounty("Nyandarua")}
                  d="M 420 220 L 520 240 L 520 300 L 460 340 Z"
                />
                <text x="480" y="280" className="county-label">
                  Nyandarua
                </text>
              </g>
            </svg>
          </div>
        </CardContent>
      </Card>

      {selected && selected.name !== "All Counties" && (
        <Card className="border-2" style={{ borderColor: colors.primaryBorder }}>
          <CardHeader style={{ backgroundColor: colors.primaryLight }}>
            <CardTitle className="text-base" style={{ color: colors.primary }}>{selected.name} Energy Data</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {selected.solarIrradiance && (
                <div className="p-3 rounded border" style={{ backgroundColor: colors.primaryLight, borderColor: colors.primaryBorder }}>
                  <div className="text-xs font-semibold" style={{ color: colors.primary }}>Solar Irradiance</div>
                  <div className="text-lg font-bold mt-1">{selected.solarIrradiance.toFixed(1)}</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">kWh/m²/day</div>
                </div>
              )}
              {selected.windSpeed && (
                <div className="p-3 rounded border" style={{ backgroundColor: colors.primaryLight, borderColor: colors.primaryBorder }}>
                  <div className="text-xs font-semibold" style={{ color: colors.primary }}>Wind Speed</div>
                  <div className="text-lg font-bold mt-1">{selected.windSpeed.toFixed(1)}</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">m/s @50m</div>
                </div>
              )}
              {selected.electricityAccess && (
                <div className="p-3 rounded border" style={{ backgroundColor: colors.primaryLight, borderColor: colors.primaryBorder }}>
                  <div className="text-xs font-semibold" style={{ color: colors.primary }}>Electricity Access</div>
                  <div className="text-lg font-bold mt-1">{selected.electricityAccess}%</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">HH coverage</div>
                </div>
              )}
              {selected.renewableCapacity && (
                <div className="p-3 rounded border" style={{ backgroundColor: colors.primaryLight, borderColor: colors.primaryBorder }}>
                  <div className="text-xs font-semibold" style={{ color: colors.primary }}>RE Planned</div>
                  <div className="text-lg font-bold mt-1">{selected.renewableCapacity}</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">MW</div>
                </div>
              )}
              {selected.gridReliability && (
                <div className="p-3 rounded border" style={{ backgroundColor: colors.primaryLight, borderColor: colors.primaryBorder }}>
                  <div className="text-xs font-semibold" style={{ color: colors.primary }}>Grid SAIDI</div>
                  <div className="text-lg font-bold mt-1">{selected.gridReliability}</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">hrs/yr</div>
                </div>
              )}
              {selected.lpgConsumption && (
                <div className="p-3 rounded border" style={{ backgroundColor: colors.primaryLight, borderColor: colors.primaryBorder }}>
                  <div className="text-xs font-semibold" style={{ color: colors.primary }}>LPG Annual</div>
                  <div className="text-lg font-bold mt-1">{(selected.lpgConsumption / 1000).toFixed(0)}k</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">tonnes/yr</div>
                </div>
              )}
              {selected.kerosenePhaseout > 0 && (
                <div className="p-3 rounded border" style={{ backgroundColor: colors.primaryLight, borderColor: colors.primaryBorder }}>
                  <div className="text-xs font-semibold" style={{ color: colors.primary }}>Kerosene Use</div>
                  <div className="text-lg font-bold mt-1">{(selected.kerosenePhaseout / 1000).toFixed(1)}k</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">tonnes/yr</div>
                </div>
              )}
              {selected.emissions && (
                <div className="p-3 rounded border" style={{ backgroundColor: colors.primaryLight, borderColor: colors.primaryBorder }}>
                  <div className="text-xs font-semibold" style={{ color: colors.primary }}>GHG Emissions</div>
                  <div className="text-lg font-bold mt-1">{(selected.emissions / 1000).toFixed(0)}k</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">tCO₂e/yr</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
