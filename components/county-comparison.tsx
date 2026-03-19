"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts"

interface CountyComparisonProps {
  data: any[]
  selectedThematic: string | null
  onCountySelect: (county: string) => void
}

export default function CountyComparison({ data, selectedThematic, onCountySelect }: CountyComparisonProps) {
  const counties = [...new Set(data.map((d) => d.County))]

  let filteredData = data
  if (selectedThematic) {
    filteredData = data.filter((d) => d["Thematic Area"] === selectedThematic)
  }

  const electricityAccessData = data
    .filter((d) => d["Dataset Name"]?.includes("Electricity Access Rate"))
    .map((d) => {
      const baseline = d["Baseline Value"]
      const target = d["Future Target"]

      return {
        county: d.County,
        baseline: baseline ? Number.parseFloat(baseline.toString().replace("%", "")) : 0,
        target: target ? Number.parseFloat(target.toString().replace("%", "")) : 0,
      }
    })
    .filter((d) => d.baseline > 0 || d.target > 0) // Filter out invalid entries

  const countyMetrics = counties.map((county) => {
    const countyData = filteredData.filter((d) => d.County === county)
    return {
      county,
      datasets: countyData.length,
      themes: [...new Set(countyData.map((d) => d["Thematic Area"]))].length,
    }
  })

  return (
    <div className="w-full space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {countyMetrics.map((metric) => (
          <Card
            key={metric.county}
            onClick={() => onCountySelect(metric.county)}
            className="hover:shadow-lg hover:border-[#002248] dark:hover:border-[#002248] cursor-pointer transition-all border-2 border-slate-200 dark:border-slate-700 overflow-hidden rounded-lg"
          >
            <CardHeader className="bg-[#002248] text-white pb-3 pt-3">
              <CardTitle className="text-lg font-bold">{metric.county}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              <div className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">Datasets</span>
                <Badge className="bg-[#002248]/20 dark:bg-[#002248]/40 text-[#002248] dark:text-blue-200 font-bold">
                  {metric.datasets}
                </Badge>
              </div>
              <div className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">Themes</span>
                <Badge className="bg-emerald-200 dark:bg-emerald-900/40 text-emerald-900 dark:text-emerald-200 font-bold">
                  {metric.themes}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {electricityAccessData.length > 0 && (
        <Card className="border-2 border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden rounded-lg">
          <CardHeader className="bg-slate-100 dark:bg-slate-800 pb-4 pt-3">
            <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
              Electricity Access Progress
            </CardTitle>
            <CardDescription>Household access baseline (2023) vs target (2030) by county</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="w-full h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={electricityAccessData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="county" stroke="var(--color-muted-foreground)" />
                  <YAxis stroke="var(--color-muted-foreground)" domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--color-card)",
                      border: "2px solid var(--color-border)",
                      borderRadius: "var(--radius)",
                    }}
                    formatter={(value) => `${value}%`}
                  />
                  <Legend />
                  <Bar dataKey="baseline" fill="#d73027" name="Baseline 2023" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="target" fill="#313695" name="Target 2030" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
