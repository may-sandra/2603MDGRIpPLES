"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { COUNTIES_WITH_DATA } from "@/lib/kenya-counties"
import { getCountyData } from "@/lib/data"

interface ThematicVisualizationProps {
  theme: string
  selectedCounty?: string | null
}

export function ThematicVisualization({ theme, selectedCounty }: ThematicVisualizationProps) {
  // Map-based visualizations for resource potential data
  const mapVisualizations: Record<string, string> = {
    "Solar Potential": "/kilifi-solar-irradiation.jpg",
    "Wind Potential": "/kilifi-wind-resources.jpg",
  }

  // Check if this theme has a map visualization
  const mapImage = mapVisualizations[theme]

  if (mapImage) {
    return (
      <Card className="shadow-md hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-700 overflow-hidden rounded-2xl">
        <CardHeader className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 pb-5">
          <CardTitle className="text-base font-bold text-slate-900 dark:text-white leading-snug flex items-center gap-2">
            <span>{theme} - Kilifi County Heatmap</span>
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-2">
            Spatial distribution of {theme.toLowerCase()} across the county
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 pb-6">
          <div className="w-full flex justify-center">
            <img 
              src={mapImage || "/placeholder.svg"} 
              alt={`${theme} heatmap for Kilifi County`}
              className="max-w-full h-auto rounded-lg shadow-sm border border-slate-200 dark:border-slate-700"
            />
          </div>
        </CardContent>
      </Card>
    )
  }

  // Bar chart for multi-county comparisons
  const counties = selectedCounty ? [selectedCounty] : COUNTIES_WITH_DATA.slice(0, 8)
  const chartData = counties.map((county) => {
    const data = getCountyData(county)
    const themeData = data.find((d) => d["Dataset Name"] === theme)
    return {
      county,
      value: themeData ? themeData["Baseline Value"] : 0,
      unit: themeData?.Unit || "",
    }
  })

  const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#14b8a6"]

  return (
    <Card className="shadow-md hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-700 overflow-hidden rounded-2xl">
      <CardHeader className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 pb-5">
        <CardTitle className="text-base font-bold text-slate-900 dark:text-white leading-snug">{theme}</CardTitle>
        <CardDescription className="text-xs text-muted-foreground mt-2">
          Comparison across counties
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 pb-6">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              dataKey="county" 
              angle={-45} 
              textAnchor="end" 
              height={100}
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              label={{ value: chartData[0]?.unit || "", angle: -90, position: "insideLeft", offset: 10 }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                color: "#1f2937",
              }}
              formatter={(value: number, name: any) => [value.toFixed(2), name]}
            />
            <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]}>
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export default ThematicVisualization
