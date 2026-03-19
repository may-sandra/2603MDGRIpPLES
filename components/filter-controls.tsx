"use client"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getUniqueThematicAreas } from "@/lib/data"
import { ALL_KENYA_COUNTIES, COUNTIES_WITH_DATA } from "@/lib/kenya-counties"
import { X, Filter } from "lucide-react"

interface FilterControlsProps {
  selectedCounty?: string | null
  onCountyChange: (county: string | null) => void
  selectedTheme?: string | null
  onThemeChange: (theme: string | null) => void
}

export default function FilterControls({
  selectedCounty,
  onCountyChange,
  selectedTheme,
  onThemeChange,
}: FilterControlsProps) {
  const counties = ALL_KENYA_COUNTIES
  const themes = getUniqueThematicAreas()

  return (
    <div className="w-full bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-lg border-2 border-slate-200 dark:border-slate-700 p-3 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <Filter className="h-4 w-4 text-[#002248] dark:text-blue-400" />
        <h3 className="font-semibold text-sm text-slate-900 dark:text-white">Quick Filters</h3>
      </div>

      <div className="space-y-2">
        <div className="w-full">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">County</label>
          <Select
            value={selectedCounty || "all"}
            onValueChange={(value) => onCountyChange(value === "all" ? null : value)}
          >
            <SelectTrigger className="w-full h-9 text-sm border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700">
              <SelectValue placeholder="Select County" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              <SelectItem value="all">All Counties</SelectItem>
              {counties.map((county) => {
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
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Thematic Area</label>
          <Select
            value={selectedTheme || "all"}
            onValueChange={(value) => onThemeChange(value === "all" ? null : value)}
          >
            <SelectTrigger className="w-full h-9 text-sm border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700">
              <SelectValue placeholder="Select Theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Themes</SelectItem>
              {themes.map((theme) => (
                <SelectItem key={theme} value={theme}>
                  {theme}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {(selectedCounty || selectedTheme) && (
          <Button
            onClick={() => {
              onCountyChange(null)
              onThemeChange(null)
            }}
            size="sm"
            className="w-full bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500 text-slate-900 dark:text-white font-semibold"
          >
            <X className="h-3 w-3 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      {(selectedCounty || selectedTheme) && (
        <div className="mt-3 pt-3 border-t border-slate-300 dark:border-slate-600 flex flex-wrap gap-1.5">
          {selectedCounty && (
            <div className="inline-flex items-center gap-1 bg-[#002248]/20 dark:bg-[#002248]/60 text-[#002248] dark:text-blue-200 px-2 py-1 rounded-full text-xs font-medium border border-[#002248]/40 dark:border-[#002248]">
              <span>📍 {selectedCounty}</span>
              <button onClick={() => onCountyChange(null)} className="hover:opacity-70 transition-opacity">
                <X size={12} />
              </button>
            </div>
          )}
          {selectedTheme && (
            <div className="inline-flex items-center gap-1 bg-emerald-200 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 px-2 py-1 rounded-full text-xs font-medium border border-emerald-300 dark:border-emerald-700">
              <span>🎯 {selectedTheme}</span>
              <button onClick={() => onThemeChange(null)} className="hover:opacity-70 transition-opacity">
                <X size={12} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
