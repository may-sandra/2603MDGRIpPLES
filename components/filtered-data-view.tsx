"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { energyData, getDataByCountyAndThematic, getDataByCounty, getDataByThematicArea } from "@/lib/data"
import { getThematicIcon } from "@/lib/thematic-utils"

interface FilteredDataViewProps {
  selectedCounty: string | null
  selectedThematic: string | null
}

export default function FilteredDataView({ selectedCounty, selectedThematic }: FilteredDataViewProps) {
  const filteredData = useMemo(() => {
    if (selectedCounty && selectedThematic) {
      return getDataByCountyAndThematic(selectedCounty, selectedThematic)
    } else if (selectedCounty) {
      return getDataByCounty(selectedCounty)
    } else if (selectedThematic) {
      return getDataByThematicArea(selectedThematic)
    }
    return energyData
  }, [selectedCounty, selectedThematic])

  const dataByTheme = useMemo(() => {
    const grouped: Record<string, typeof energyData> = {}
    filteredData.forEach((item) => {
      const theme = item["Thematic Area"]
      if (!grouped[theme]) {
        grouped[theme] = []
      }
      grouped[theme].push(item)
    })
    return grouped
  }, [filteredData])

  return (
    <Card className="w-full border border-slate-300 dark:border-slate-600 overflow-hidden">
      <CardHeader className="bg-slate-100 dark:bg-slate-800 pt-4 pb-4 rounded-t-lg">
        <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
          Energy Data
          <Badge variant="secondary">{filteredData.length} datasets</Badge>
        </CardTitle>
        <CardDescription>
          {selectedCounty && selectedThematic
            ? `${selectedCounty} - ${selectedThematic}`
            : selectedCounty
              ? `${selectedCounty} - All Themes`
              : selectedThematic
                ? `All Counties - ${selectedThematic}`
                : "All Counties - All Themes"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Object.entries(dataByTheme)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([thematic, data]) => (
              <div key={thematic} className="space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-border">
                  <span className="text-lg">{getThematicIcon(thematic)}</span>
                  <h3 className="font-semibold text-sm text-foreground">{thematic}</h3>
                  <Badge variant="outline" className="ml-auto">
                    {data.length} items
                  </Badge>
                </div>

                <div className="grid gap-3">
                  {data.map((item, idx) => (
                    <div
                      key={`${item.County}-${item.Dataset_ID}-${idx}`}
                      className="p-3 rounded-lg border border-border bg-card hover:bg-accent/5 transition-colors"
                    >
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item["Dataset Name"]}</p>
                          <p className="text-xs text-muted-foreground">{item.County}</p>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {item.Dataset_ID}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-2 bg-muted/50 rounded">
                          <p className="text-xs text-muted-foreground">Baseline</p>
                          <p className="font-semibold text-sm">
                            {typeof item["Baseline Value"] === "string" && item["Baseline Value"].length > 20
                              ? item["Baseline Value"].substring(0, 17) + "..."
                              : item["Baseline Value"]}
                          </p>
                          <p className="text-xs text-muted-foreground">{item["Baseline Year"]}</p>
                        </div>

                        {item["Target Value"] && (
                          <div className="p-2 bg-muted/50 rounded">
                            <p className="text-xs text-muted-foreground">Target</p>
                            <p className="font-semibold text-sm">{item["Target Value"]}</p>
                            <p className="text-xs text-muted-foreground">
                              {item["Target Year"] ? `by ${item["Target Year"]}` : "TBD"}
                            </p>
                          </div>
                        )}
                      </div>

                      <p className="text-xs text-muted-foreground mt-2">Unit: {item.Unit}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  )
}
