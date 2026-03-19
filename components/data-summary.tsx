"use client"

import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  getDataByCountyAndThematic,
  getDataByCounty,
  getDataByThematicArea,
  energyData,
  getUniqueThematicAreas,
  extractNumericValue,
} from "@/lib/data"
import {
  Sun,
  Wind,
  Leaf,
  Zap,
  Home,
  Users,
  ArrowUp,
  TrendingUp,
  Factory,
  Flame,
  DollarSign,
  Activity,
  MapPin,
  Globe,
} from "lucide-react"
import ThematicVisualization from "@/components/thematic-visualization" // Import ThematicVisualization

interface DataSummaryProps {
  selectedCounty?: string | null
  selectedTheme?: string | null
}

// National aggregates (based on your provided data)
const nationalData: Record<string, { baseline: number; target: number; unit: string }> = {
  "Solar Potential": { baseline: 5.8, target: 6.1, unit: "kWh/m²/day" },
  "Wind Potential": { baseline: 6.5, target: 7.2, unit: "m/s" },
  "Biomass Availability": { baseline: 240000, target: 300000, unit: "tonnes/yr" },
  "Firewood Use Share": { baseline: 45, target: 15, unit: "% of population" },
  "Electricity Consumption": { baseline: 185, target: 250, unit: "kWh/capita/yr" },
  "Electricity Access": { baseline: 70, target: 95, unit: "%" },
  "Grid Reliability": { baseline: 7850, target: 8600, unit: "hours/yr" },
  "Energy Affordability": { baseline: 4.2, target: 3.5, unit: "% of income" },
}

function groupByDataset(data: typeof energyData) {
  const grouped: Record<string, typeof energyData> = {}

  data.forEach((item) => {
    const key = item.Dataset_ID
    if (!grouped[key]) {
      grouped[key] = []
    }
    grouped[key].push(item)
  })

  return grouped
}

function getDatasetHighlights(items: typeof energyData, datasetId: string) {
  const numericValues = items
    .map((i) => ({
      value: extractNumericValue(i["Baseline Value"]),
      target: extractNumericValue(i["Future Target"]),
      county: i.County,
      item: i,
    }))
    .filter((v) => v.value !== null) as {
    value: number
    target: number | null
    county: string
    item: (typeof energyData)[0]
  }[]

  if (numericValues.length === 0) {
    return {
      type: "text" as const,
      items: items,
    }
  }

  const highest = numericValues.reduce((a, b) => (a.value > b.value ? a : b))
  const lowest = numericValues.reduce((a, b) => (a.value < b.value ? a : b))

  const lowerIsBetter = ["ED1", "ED3"].includes(datasetId)

  return {
    type: "numeric" as const,
    highest,
    lowest,
    lowerIsBetter,
    items: numericValues,
  }
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(0)}K`
  if (num < 10 && num > 0) return num.toFixed(1)
  return Math.round(num).toLocaleString()
}

function calculateProgress(baseline: number, target: number): number {
  if (!target || target === 0) return 0
  return Math.min(Math.round((baseline / target) * 100), 100)
}

const themeIcons: Record<string, React.ReactNode> = {
  "Energy Resource Potential": <Sun className="h-5 w-5" />,
  "Energy Demand & Consumption": <Zap className="h-5 w-5" />,
  "Infrastructure & Access": <Home className="h-5 w-5" />,
  "Socio-Economic & Geospatial": <Users className="h-5 w-5" />,
}

const datasetIcons: Record<string, React.ReactNode> = {
  R1: <Sun className="h-5 w-5" />,
  R2: <Wind className="h-5 w-5" />,
  R3: <Leaf className="h-5 w-5" />,
  E1: <Zap className="h-5 w-5" />,
  E2: <Home className="h-5 w-5" />,
  D1: <Activity className="h-5 w-5" />,
  D2: <Factory className="h-5 w-5" />,
  C1: <Flame className="h-5 w-5" />,
  C2: <Flame className="h-5 w-5" />,
  P1: <Leaf className="h-5 w-5" />,
  PP1: <Zap className="h-5 w-5" />,
  PP2: <Home className="h-5 w-5" />,
  F1: <DollarSign className="h-5 w-5" />,
  G1: <Activity className="h-5 w-5" />,
  G2: <Activity className="h-5 w-5" />,
  EM1: <Leaf className="h-5 w-5" />,
}

const themeColors: Record<
  string,
  { bg: string; border: string; accent: string; badge: string; icon: string; gradient: string; progressBg: string }
> = {
  "Energy Resource Potential": {
    bg: "bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20",
    border: "border-blue-200/60 dark:border-blue-800/60",
    accent: "text-[#002248] dark:text-blue-300",
    badge: "bg-blue-100 dark:bg-blue-900/60 text-[#002248] dark:text-blue-200",
    icon: "text-[#002248] dark:text-blue-400",
    gradient:
      "bg-gradient-to-r from-blue-100 via-blue-50 to-blue-100 dark:from-blue-950/60 dark:via-blue-900/40 dark:to-blue-950/60",
    progressBg: "bg-blue-200 dark:bg-blue-900/40",
  },
  "Energy Demand & Consumption": {
    bg: "bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-950/30 dark:to-slate-900/20",
    border: "border-slate-200/60 dark:border-slate-700/60",
    accent: "text-slate-700 dark:text-slate-300",
    badge: "bg-slate-100 dark:bg-slate-800/60 text-slate-900 dark:text-slate-200",
    icon: "text-slate-600 dark:text-slate-400",
    gradient:
      "bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 dark:from-slate-900/60 dark:via-slate-800/40 dark:to-slate-900/60",
    progressBg: "bg-slate-200 dark:bg-slate-900/40",
  },
  "Infrastructure & Access": {
    bg: "bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/30 dark:to-emerald-900/20",
    border: "border-emerald-200/60 dark:border-emerald-800/60",
    accent: "text-emerald-700 dark:text-emerald-300",
    badge: "bg-emerald-100 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200",
    icon: "text-emerald-600 dark:text-emerald-400",
    gradient:
      "bg-gradient-to-r from-emerald-100 via-emerald-50 to-emerald-100 dark:from-emerald-950/60 dark:via-emerald-900/40 dark:to-emerald-950/60",
    progressBg: "bg-emerald-200 dark:bg-emerald-900/40",
  },
  "Socio-Economic & Geospatial": {
    bg: "bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-950/30 dark:to-slate-900/20",
    border: "border-slate-200/60 dark:border-slate-700/60",
    accent: "text-slate-700 dark:text-slate-300",
    badge: "bg-slate-100 dark:bg-slate-800/60 text-slate-900 dark:text-slate-200",
    icon: "text-slate-600 dark:text-slate-400",
    gradient:
      "bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 dark:from-slate-900/60 dark:via-slate-800/40 dark:to-slate-900/60",
    progressBg: "bg-slate-200 dark:bg-slate-900/40",
  },
}

export default function DataSummary({ selectedCounty, selectedTheme }: DataSummaryProps) {
  const filteredData =
    selectedCounty && selectedTheme
      ? getDataByCountyAndThematic(selectedCounty, selectedTheme)
      : selectedCounty
        ? getDataByCounty(selectedCounty)
        : selectedTheme
          ? getDataByThematicArea(selectedTheme)
          : energyData

  const thematicAreas = getUniqueThematicAreas().filter((theme) =>
    filteredData.some((item) => item["Thematic Area"] === theme),
  )

  return (
    <div className="w-full space-y-8">
      {thematicAreas.length > 0 ? (
        thematicAreas.map((theme) => {
          const themeData = filteredData.filter((item) => item["Thematic Area"] === theme)
          const groupedByDataset = groupByDataset(themeData)
          const colors = themeColors[theme] || themeColors["Energy Resource Potential"]
          const uniqueDatasets = Object.entries(groupedByDataset)

          return (
            <div key={theme} className="w-full">
              <div
                className="flex items-center gap-4 mb-6 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-md hover:shadow-lg transition-shadow"
              >
                <span className="text-blue-600 dark:text-blue-400 p-3 bg-white dark:bg-slate-800 rounded-xl shadow-md">
                  {themeIcons[theme]}
                </span>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">{theme}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {uniqueDatasets.length} {uniqueDatasets.length === 1 ? "indicator" : "indicators"}
                    {selectedCounty && ` • ${selectedCounty}`}
                  </p>
                </div>
                <Badge className="bg-blue-100 dark:bg-blue-900/60 text-blue-900 dark:text-blue-200 text-lg px-4 py-2 font-bold border-0 rounded-full shadow-sm">
                  {uniqueDatasets.length}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {uniqueDatasets.map(([datasetId, items]) => {
                  const firstItem = items[0]
                  const highlights = getDatasetHighlights(items, datasetId)

                  const baselineValue = extractNumericValue(firstItem["Baseline Value"])
                  const targetValue = extractNumericValue(firstItem["Future Target"])
                  const progress = baselineValue && targetValue ? calculateProgress(baselineValue, targetValue) : 0

                  return (
                    <Card
                      key={datasetId}
                      className="shadow-md hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-700 overflow-hidden rounded-2xl"
                    >
                      <CardHeader className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 pb-5">
                        <div className="flex items-start gap-3">
                          <span
                            className="mt-0.5 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-800 p-2.5 rounded-xl shadow-md"
                          >
                            {datasetIcons[datasetId]}
                          </span>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                              {firstItem["Dataset Name"]}
                            </CardTitle>
                            <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                              {firstItem.Description}
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-6 pb-6">
                        <div className="space-y-4">
                          {/* Always show national comparison */}
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              {/* National Data */}
                              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200/60 dark:border-slate-700/60 shadow-sm">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                                  <Globe className="h-3 w-3 flex-shrink-0" />
                                  <span>National</span>
                                </p>
                                <p className="text-2xl font-bold text-slate-700 dark:text-slate-200">
                                  {nationalData[firstItem["Dataset Name"]]
                                    ? formatNumber(nationalData[firstItem["Dataset Name"]].baseline)
                                    : "N/A"}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">{firstItem.Unit}</p>
                              </div>

                              {/* County Data - show selected county or highest by default */}
                              {selectedCounty ? (
                                <div className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
                                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1 whitespace-nowrap overflow-hidden text-ellipsis">
                                    <MapPin className="h-3 w-3 flex-shrink-0" />
                                    <span className="truncate">{selectedCounty}</span>
                                  </p>
                                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {typeof firstItem["Baseline Value"] === "number"
                                      ? formatNumber(firstItem["Baseline Value"])
                                      : firstItem["Baseline Value"]}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">{firstItem.Unit}</p>
                                </div>
                              ) : highlights.type === "numeric" ? (
                                <div className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
                                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1 whitespace-nowrap overflow-hidden text-ellipsis">
                                    <MapPin className="h-3 w-3 flex-shrink-0" />
                                    <span className="truncate">{highlights.highest.county}</span>
                                  </p>
                                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {formatNumber(highlights.highest.value)}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">Highest Value </p>
                                </div>
                              ) : null}
                            </div>
                          </div>

                          {/* Target Comparison with Progress Bars - only for actionable indicators */}
                          {firstItem["Future Target"] && theme !== "Energy Resource Potential" && (
                            <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" /> 2030 Target Progress
                              </p>
                              <div className="space-y-3">
                                {/* National Progress */}
                                {nationalData[firstItem["Dataset Name"]] && (
                                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
                                    <div className="flex items-center justify-between mb-2">
                                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">National</p>
                                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                                        {formatNumber(nationalData[firstItem["Dataset Name"]].baseline)} → {formatNumber(nationalData[firstItem["Dataset Name"]].target)}
                                      </p>
                                    </div>
                                    <div className="w-full h-2.5 bg-slate-300 dark:bg-slate-700 rounded-full overflow-hidden">
                                      <div
                                        className="h-full bg-blue-500 dark:bg-blue-400 rounded-full transition-all duration-500 shadow-sm"
                                        style={{
                                          width: `${Math.min(
                                            ((nationalData[firstItem["Dataset Name"]].baseline /
                                              nationalData[firstItem["Dataset Name"]].target) *
                                              100) | 0,
                                            100
                                          )}%`,
                                        }}
                                      />
                                    </div>
                                  </div>
                                )}

                                {/* County/Highest Progress */}
                                <div className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                                  <div className="flex items-center justify-between mb-2">
                                    <p className="text-xs font-semibold text-slate-900 dark:text-white uppercase">
                                      {selectedCounty ? selectedCounty : "Highest County"}
                                    </p>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                                      {typeof firstItem["Baseline Value"] === "number"
                                        ? formatNumber(firstItem["Baseline Value"])
                                        : firstItem["Baseline Value"]}{" "}
                                      → {typeof firstItem["Future Target"] === "number" ? formatNumber(firstItem["Future Target"]) : firstItem["Future Target"]}
                                    </p>
                                  </div>
                                  <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full transition-all duration-500 shadow-sm bg-gradient-to-r from-amber-500 to-emerald-500`}
                                      style={{
                                        width: `${progress}%`,
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Show highlights only if no county selected and no comparison showing */}
                          {!selectedCounty && highlights.type === "text" ? (
                            <div className="space-y-2">
                              {highlights.items.slice(0, 3).map((item) => (
                                <div
                                  key={item.County}
                                  className={`flex justify-between items-center text-sm p-3 rounded-xl bg-white dark:bg-slate-800 border ${colors.border} hover:shadow-sm transition-shadow`}
                                >
                                  <span className="text-muted-foreground font-medium">{item.County}</span>
                                  <span className="font-bold text-slate-900 dark:text-white">{String(item["Baseline Value"])}</span>
                                </div>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )
        })
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg">No data available for selected filters</p>
        </div>
      )}
    </div>
  )
}
