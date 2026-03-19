"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Download, Filter, FileText, Database } from "lucide-react"

interface DataDetailsProps {
  data: any[]
  selectedCounty: string | null
  selectedThematic: string | null
}

export default function DataDetails({ data, selectedCounty, selectedThematic }: DataDetailsProps) {
  const [searchTerm, setSearchTerm] = useState("")

  let filteredData = data || []
  if (selectedCounty && filteredData.length > 0) {
    filteredData = filteredData.filter((d) => d?.County === selectedCounty)
  }
  if (selectedThematic && filteredData.length > 0) {
    filteredData = filteredData.filter((d) => d?.["Thematic Area"] === selectedThematic)
  }
  if (searchTerm && filteredData.length > 0) {
    filteredData = filteredData.filter((d) =>
      Object.values(d || {}).some((v) => String(v || "").toLowerCase().includes(searchTerm.toLowerCase())),
    )
  }

  const getStatusColor = (baseline: any, target: any) => {
    const baselineNum = Number.parseFloat(String(baseline).replace(/[^0-9.-]/g, ""))
    const targetNum = Number.parseFloat(String(target).replace(/[^0-9.-]/g, ""))

    if (isNaN(baselineNum) || isNaN(targetNum)) return "secondary"
    if (targetNum > baselineNum) return "default"
    return "outline"
  }

  const thematicColors: Record<string, { bg: string; badge: string }> = {
    "Energy Resource Potential": {
      bg: "bg-blue-50 dark:bg-blue-950/30",
      badge: "bg-blue-200 dark:bg-blue-900/40 text-[#002248] dark:text-blue-200",
    },
    "Energy Demand & Consumption": {
      bg: "bg-slate-50 dark:bg-slate-900/30",
      badge: "bg-slate-200 dark:bg-slate-800/60 text-slate-900 dark:text-slate-200",
    },
    "Infrastructure & Access": {
      bg: "bg-emerald-50 dark:bg-emerald-950/30",
      badge: "bg-emerald-200 dark:bg-emerald-900/40 text-emerald-900 dark:text-emerald-200",
    },
    "Socio-Economic & Geospatial": {
      bg: "bg-gray-50 dark:bg-gray-900/30",
      badge: "bg-gray-200 dark:bg-gray-800/40 text-gray-900 dark:text-gray-200",
    },
  }

  const exportToCSV = () => {
    const csvHeaders = [
      "County",
      "Dataset ID",
      "Thematic Area",
      "Dataset Name",
      "Baseline Value",
      "Unit",
      "Baseline Year",
      "Target Value",
      "Target Year",
    ]

    const csvRows = filteredData.map((row) => [
      row.County,
      row["Dataset_ID"],
      row["Thematic Area"],
      row["Dataset Name"],
      row["Baseline Value"],
      row.Unit,
      row["Baseline Year"],
      row["Target Value"],
      row["Target Year"],
    ])

    const csvContent = [csvHeaders, ...csvRows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `mdg_dashboard_data_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="w-full space-y-6">
      <Card className="border border-slate-300 dark:border-slate-600 shadow-sm overflow-hidden rounded-lg">
        <CardHeader className="bg-slate-100 dark:bg-slate-800 pb-4 pt-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="bg-[#002248] p-2 rounded-lg">
                <Database className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">Data Search & Filter</CardTitle>
                <CardDescription className="mt-2 flex items-center gap-2 flex-wrap">
                  {selectedCounty && (
                    <span className="inline-flex items-center gap-1 bg-blue-100 dark:bg-blue-900/40 px-2 py-1 rounded text-xs">
                      <Filter className="h-3 w-3" />
                      County: <strong>{selectedCounty}</strong>
                    </span>
                  )}
                  {selectedThematic && (
                    <span className="inline-flex items-center gap-1 bg-emerald-100 dark:bg-emerald-900/40 px-2 py-1 rounded text-xs">
                      <Filter className="h-3 w-3" />
                      Thematic: <strong>{selectedThematic}</strong>
                    </span>
                  )}
                  {!selectedCounty && !selectedThematic && (
                    <span className="inline-flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      All datasets
                    </span>
                  )}
                </CardDescription>
              </div>
            </div>
            <Button onClick={exportToCSV} variant="default" className="bg-[#002248] hover:bg-blue-900 gap-2">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500 dark:text-slate-400" />
            <Input
              placeholder="Search by county, dataset name, or value..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border border-slate-300 dark:border-slate-600 shadow-sm overflow-hidden rounded-lg">
        <CardHeader className="bg-slate-100 dark:bg-slate-800 pb-4 pt-3">
          <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">Dataset Details</CardTitle>
          <CardDescription>
            {filteredData.length} {filteredData.length === 1 ? "dataset" : "datasets"} found
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto pt-4">
          <Table>
            <TableHeader className="bg-slate-100 dark:bg-slate-800">
              <TableRow className="hover:bg-slate-100 dark:hover:bg-slate-800">
                <TableHead className="font-bold text-slate-900 dark:text-white">County</TableHead>
                <TableHead className="font-bold text-slate-900 dark:text-white">Thematic Area</TableHead>
                <TableHead className="font-bold text-slate-900 dark:text-white">Dataset</TableHead>
                <TableHead className="font-bold text-slate-900 dark:text-white">ID</TableHead>
                <TableHead className="text-right font-bold text-slate-900 dark:text-white">Baseline (2023)</TableHead>
                <TableHead className="text-right font-bold text-slate-900 dark:text-white">Target</TableHead>
                <TableHead className="text-right font-bold text-slate-900 dark:text-white">Target Year</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length > 0 ? (
                filteredData.map((row, idx) => {
                  const colors = thematicColors[row["Thematic Area"]] || { bg: "bg-slate-50", badge: "bg-slate-200" }
                  return (
                    <TableRow key={idx} className={`hover:${colors.bg} transition-colors`}>
                      <TableCell className="font-semibold text-slate-900 dark:text-white">{row.County || "—"}</TableCell>
                      <TableCell>
                        <Badge className={colors.badge}>
                          {row["Thematic Area"] ? row["Thematic Area"].split(" ").slice(0, 2).join(" ") : "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs text-sm text-slate-700 dark:text-slate-300">
                        {row["Dataset Name"] || "—"}
                      </TableCell>
                      <TableCell className="font-mono text-sm font-semibold text-[#002248] dark:text-blue-400">
                        {row["Dataset_ID"] || "—"}
                      </TableCell>
                      <TableCell className="text-right text-sm font-semibold text-slate-900 dark:text-white">
                        {row["Baseline Value"] || "—"} <span className="text-xs opacity-75">{row.Unit || ""}</span>
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        <Badge
                          variant={getStatusColor(row["Baseline Value"], row["Target Value"])}
                          className="font-semibold"
                        >
                          {row["Target Value"] || "—"} {row.Unit || ""}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-sm font-semibold text-slate-700 dark:text-slate-300">
                        {row["Target Year"] || "—"}
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                    <p className="text-lg font-semibold">No data found</p>
                    <p className="text-sm">Try adjusting your search or filters</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
