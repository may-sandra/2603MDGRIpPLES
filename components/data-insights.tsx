"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import KenyaSVGInteractiveMap from "@/components/kenya-svg-interactive-map"
import { useState } from "react"
import {
  Info,
  MapPin,
  TrendingUp,
  Zap,
  BarChart3,
  Sun,
  Wind,
  Leaf,
  Home,
  Factory,
  DollarSign,
  Activity,
} from "lucide-react"

export default function DataInsights() {
  const [selectedCounty, setSelectedCounty] = useState<string | null>(null)
  const [showInfoTooltip, setShowInfoTooltip] = useState<string | null>(null)

  const indicatorCategories = [
    {
      name: "Energy Resource Potential",
      icon: <Sun className="h-4 w-4" />,
      color: "text-[#002248]",
      indicators: [
        { name: "Solar Irradiance Potential", unit: "kWh/m²/day", icon: <Sun className="h-3 w-3" /> },
        { name: "Wind Speed @50m", unit: "m/s", icon: <Wind className="h-3 w-3" /> },
        { name: "Biomass Potential", unit: "tonnes/yr", icon: <Leaf className="h-3 w-3" /> },
      ],
    },
    {
      name: "Electricity Access & Demand",
      icon: <Zap className="h-4 w-4" />,
      color: "text-slate-700",
      indicators: [
        { name: "Electricity Access", unit: "%", icon: <Zap className="h-3 w-3" /> },
        { name: "New Electricity Connections", unit: "HH/yr", icon: <Home className="h-3 w-3" /> },
        { name: "Household Electricity Consumption", unit: "kWh/HH/yr", icon: <Activity className="h-3 w-3" /> },
        { name: "MSME Electricity Consumption", unit: "kWh/yr", icon: <Factory className="h-3 w-3" /> },
      ],
    },
    {
      name: "Cooking Energy",
      icon: <Factory className="h-4 w-4" />,
      color: "text-emerald-700",
      indicators: [
        { name: "Primary Cooking Fuel Mix", unit: "% share", icon: <BarChart3 className="h-3 w-3" /> },
        { name: "LPG Annual Consumption", unit: "tonnes/yr", icon: <Factory className="h-3 w-3" /> },
        { name: "Kerosene Annual Consumption", unit: "tonnes/yr", icon: <Factory className="h-3 w-3" /> },
      ],
    },
    {
      name: "Infrastructure & Projects",
      icon: <Home className="h-4 w-4" />,
      color: "text-slate-600",
      indicators: [
        { name: "Planned RE Capacity", unit: "MW", icon: <Zap className="h-3 w-3" /> },
        { name: "Mini-grid Pipeline", unit: "kW", icon: <Home className="h-3 w-3" /> },
        { name: "Grid Reliability", unit: "hours/yr", icon: <Activity className="h-3 w-3" /> },
      ],
    },
    {
      name: "Socio-Economic & Environmental",
      icon: <DollarSign className="h-4 w-4" />,
      color: "text-gray-700",
      indicators: [
        { name: "Energy-Related GHG Emissions", unit: "tCO₂e/yr", icon: <Leaf className="h-3 w-3" /> },
        { name: "County Energy Budget", unit: "Million Ksh/yr", icon: <DollarSign className="h-3 w-3" /> },
      ],
    },
  ]

  return (
    <div className="space-y-6">
      <Card className="border border-slate-200/60 dark:border-slate-700/60 shadow-lg overflow-hidden rounded-2xl">
        <CardHeader className="bg-gradient-to-br from-[#002248] to-[#1e3a5f] text-white pb-6 pt-7 m-0 rounded-t-2xl">
          <div className="flex items-start gap-4">
            <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm">
              <Info className="h-6 w-6 flex-shrink-0" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold mb-3">Welcome to the MDG Dashboard</CardTitle>
              <CardDescription className="text-slate-100 text-base leading-relaxed">
                This dashboard presents Minimum Data Guidelines (MDG) for the Integrated National Energy Planning (INEP) and Kenya counties energy planning. This phase aggregates data across four Kenyan counties: Kilifi, Kiambu, and Nyandarua, under the Robust and Integrated PLanning of Energy Systems (RIpPLES) program. It provides baseline energy data, targets, and key indicators across resource potential, electricity access, demand, infrastructure, and socio-economic factors.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border border-slate-200/60 dark:border-slate-700/60 shadow-md hover:shadow-lg transition-shadow overflow-hidden rounded-2xl">
          <CardHeader className="bg-gradient-to-br from-[#1e3a5f] to-[#2d4a6f] text-white pb-4 pt-0 rounded-t-2xl">
            <CardTitle className="text-base font-semibold flex items-center gap-2 pt-5">
              <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
                <MapPin className="h-5 w-5" />
              </div>
              County Coverage Map
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200/60 dark:border-slate-700/60 h-[500px] overflow-hidden shadow-inner">
              <KenyaSVGInteractiveMap
                selectedCounty={selectedCounty}
                onCountySelect={setSelectedCounty}
                selectedTheme={null}
                onThemeChange={() => {}}
                showFilters={false}
                onClearFilters={() => setSelectedCounty(null)}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/60 dark:border-slate-700/60 shadow-md hover:shadow-lg transition-shadow overflow-hidden rounded-2xl">
          <CardHeader className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white pb-4 pt-0 rounded-t-2xl">
            <CardTitle className="text-base font-semibold flex items-center gap-2 pt-5">
              <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
                <Zap className="h-5 w-5" />
              </div>
              How to Navigate
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <div className="space-y-2.5 text-sm text-slate-700 dark:text-slate-300">
              <div className="flex gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100/60 dark:border-slate-700/60 hover:shadow-sm transition-shadow">
                <div className="bg-blue-100 dark:bg-blue-900/40 p-2 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-[#002248] dark:text-blue-400 flex-shrink-0" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">Overview (Current Page)</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    Targeted counties and key indicators summary
                  </p>
                </div>
              </div>
              <div className="flex gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100/60 dark:border-slate-700/60 hover:shadow-sm transition-shadow">
                <div className="bg-emerald-100 dark:bg-emerald-900/40 p-2 rounded-lg">
                  <MapPin className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">Explore</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    Interactive map with county & theme filtering
                  </p>
                </div>
              </div>
              <div className="flex gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100/60 dark:border-slate-700/60 hover:shadow-sm transition-shadow">
                <div className="bg-slate-100 dark:bg-slate-700/40 p-2 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-slate-700 dark:text-slate-300 flex-shrink-0" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">Counties</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    Charts organized by thematic categories
                  </p>
                </div>
              </div>
              <div className="flex gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100/60 dark:border-slate-700/60 hover:shadow-sm transition-shadow">
                <div className="bg-slate-100 dark:bg-slate-700/40 p-2 rounded-lg">
                  <svg
                    className="h-5 w-5 text-slate-600 dark:text-slate-400 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">Data Search</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    Searchable dataset with CSV export
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/60 dark:border-slate-700/60 shadow-md hover:shadow-lg transition-shadow overflow-hidden rounded-2xl">
          <CardHeader className="bg-gradient-to-br from-slate-700 to-slate-800 text-white pb-4 pt-0 rounded-t-2xl">
            <CardTitle className="text-base font-semibold flex items-center gap-2 pt-5">
              <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
                <BarChart3 className="h-5 w-5" />
              </div>
              Key Indicators Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {indicatorCategories.map((category, catIndex) => (
                <div key={catIndex} className="space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className={`${category.color} bg-slate-100 dark:bg-slate-800 p-2 rounded-lg`}>
                      {category.icon}
                    </div>
                    <h4 className={`font-bold text-xs ${category.color} dark:text-blue-400 uppercase tracking-wide`}>
                      {category.name}
                    </h4>
                  </div>
                  <ul className="space-y-2 pl-2">
                    {category.indicators.map((indicator, index) => (
                      <li
                        key={index}
                        className="flex gap-2.5 text-xs items-start p-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors relative group"
                      >
                        <span className="text-[#002248] dark:text-blue-400 mt-0.5 flex-shrink-0 bg-blue-50 dark:bg-blue-900/20 p-1.5 rounded-md">
                          {indicator.icon}
                        </span>
                        <div className="flex-1">
                          <span className="font-semibold text-slate-900 dark:text-white block mb-0.5">
                            {indicator.name}
                          </span>
                          <div className="text-xs text-slate-600 dark:text-slate-400">
                            Unit: {indicator.unit} | Baseline & Target data
                          </div>
                        </div>
                        <div className="relative flex-shrink-0">
                          <button
                            onClick={() => setShowInfoTooltip(showInfoTooltip === indicator.name ? null : indicator.name)}
                            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors opacity-0 group-hover:opacity-100"
                            title="Show data source"
                          >
                            <Info size={14} className="text-slate-600 dark:text-slate-400" />
                          </button>
                          {showInfoTooltip === indicator.name && (
                            <div className="absolute right-0 top-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 w-64 z-50 shadow-lg text-xs text-black dark:text-slate-100">
                              <p className="font-semibold mb-1 text-black dark:text-white">{indicator.name}</p>
                              <p className="text-xs text-black dark:text-slate-300">Unit: {indicator.unit}</p>
                              <p className="text-xs text-black dark:text-slate-300 mt-1">Data source: Ministry of Energy and Petroleum - Minimum Data Guidelines (MDG)</p>
                            </div>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
