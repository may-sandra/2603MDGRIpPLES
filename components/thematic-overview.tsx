"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface ThematicOverviewProps {
  data: any[]
  onThematicSelect: (thematic: string) => void
}

export default function ThematicOverview({ data, onThematicSelect }: ThematicOverviewProps) {
  const thematicAreas = [...new Set(data.map((d) => d["Thematic Area"]))]

  // Count datasets per thematic area
  const thematicCounts = thematicAreas.map((area) => ({
    name: area,
    count: data.filter((d) => d["Thematic Area"] === area).length,
    datasets: data.filter((d) => d["Thematic Area"] === area).length,
  }))

  const solarData = data
    .filter((d) => d["Dataset Name"]?.includes("Solar irradiance"))
    .map((d) => ({
      county: d.County,
      baseline: Number.parseFloat(d["Baseline Value"]),
      target: d["Target Value"],
    }))

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {thematicAreas.map((area) => {
          const areaData = data.filter((d) => d["Thematic Area"] === area)
          const datasetCount = areaData.length
          const counties = [...new Set(areaData.map((d) => d.County))].length

          return (
            <Card
              key={area}
              className="hover:border-primary/50 cursor-pointer transition-colors"
              onClick={() => onThematicSelect(area)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{area}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Datasets</span>
                    <Badge variant="outline">{datasetCount}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Counties</span>
                    <Badge variant="outline">{counties}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {solarData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Solar Irradiance: Baseline vs Target</CardTitle>
            <CardDescription>Annual average kWh/m²/day by county</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={solarData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="county" stroke="var(--color-muted-foreground)" />
                  <YAxis stroke="var(--color-muted-foreground)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "var(--radius)",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="baseline" fill="var(--color-chart-1)" name="Baseline (2023)" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="target" fill="var(--color-chart-2)" name="Target" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
