'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowLeft, Map, Database, Users, Download } from 'lucide-react'
import { Sidebar, SidebarContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import DashboardHeader from '@/components/dashboard-header'
import React, { useEffect, useState } from 'react'

interface MDGRecord {
  administration: string
  category: string
  theme: string
  sector: string
  description: string
  capacity?: string
  unit?: string
  data?: Record<string, any>
  reference?: string
  statusOfExploitation?: string
  location?: string
  area?: string
  scenario?: string
  inep?: string
  source?: string
}

export default function DataPage() {
  const pathname = usePathname()
  const [records, setRecords] = useState<MDGRecord[]>([])
  const [filteredRecords, setFilteredRecords] = useState<MDGRecord[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterAdministration, setFilterAdministration] = useState('all')
  const [filterYearStart, setFilterYearStart] = useState('all')
  const [filterYearEnd, setFilterYearEnd] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [categories, setCategories] = useState<string[]>([])
  const [administrations, setAdministrations] = useState<string[]>([])
  const [availableYears, setAvailableYears] = useState<string[]>([])
  const [fileMetadata, setFileMetadata] = useState<{
    totalRecords: number
    sheets: string[]
    columns: string[]
    administrations: string[]
    categories: string[]
    themes: string[]
    sectors: string[]
  } | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/mdg-data')
        if (!response.ok) throw new Error('Failed to fetch data')

        const json = await response.json()
        const data = json.data || []

        if (data && Array.isArray(data)) {
          setRecords(data)
          setFilteredRecords(data)

          const uniqueCategories = [...new Set(data.map((r: any) => r.category).filter(Boolean))] as string[]
          const uniqueAdmins = [...new Set(data.map((r: any) => r.administration).filter(Boolean))] as string[]
          const uniqueThemes = [...new Set(data.map((r: any) => r.theme).filter(Boolean))] as string[]
          const uniqueSectors = [...new Set(data.map((r: any) => r.sector).filter(Boolean))] as string[]

          // Extract available years
          const yearsSet = new Set<string>()
          data.forEach((record: MDGRecord) => {
            if (record.data) {
              Object.keys(record.data).forEach(year => yearsSet.add(year))
            }
          })
          const years = Array.from(yearsSet).sort((a, b) => {
            const aNum = a === '2033' ? 2033 : parseInt(a)
            const bNum = b === '2033' ? 2033 : parseInt(b)
            return aNum - bNum
          })
          setAvailableYears(years)

          setCategories(uniqueCategories.sort())
          setAdministrations(uniqueAdmins.sort())

          // Extract all possible column names from records
          const allColumns = new Set<string>()
          data.forEach((record: MDGRecord) => {
            Object.keys(record).forEach(key => allColumns.add(key))
          })

          // Set metadata about the Excel file
          setFileMetadata({
            totalRecords: data.length,
            sheets: ['Minimum Data Guidelines (MDG)'], // In real scenario, this would come from API
            columns: Array.from(allColumns).sort(),
            administrations: uniqueAdmins.sort(),
            categories: uniqueCategories.sort(),
            themes: uniqueThemes.sort(),
            sectors: uniqueSectors.sort(),
          })
        }
      } catch (error) {
        console.error('[MDG] Error fetching data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    let filtered = records

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase()
      filtered = filtered.filter(r =>
        (r.description?.toLowerCase() || '').includes(lowerSearch) ||
        (r.sector?.toLowerCase() || '').includes(lowerSearch) ||
        (r.administration?.toLowerCase() || '').includes(lowerSearch) ||
        (r.theme?.toLowerCase() || '').includes(lowerSearch)
      )
    }

    if (filterCategory !== 'all') {
      filtered = filtered.filter(r => r.category === filterCategory)
    }

    if (filterAdministration !== 'all') {
      filtered = filtered.filter(r => r.administration === filterAdministration)
    }

    // Filter by year range
    if (filterYearStart !== 'all' || filterYearEnd !== 'all') {
      const startYear = filterYearStart === 'all' ? null : parseInt(filterYearStart)
      const endYear = filterYearEnd === 'all' ? null : parseInt(filterYearEnd)

      filtered = filtered.filter(r => {
        if (!r.data) return false
        const recordYears = Object.keys(r.data).map(y => parseInt(y))
        return recordYears.some(year => {
          const withinStart = startYear === null || year >= startYear
          const withinEnd = endYear === null || year <= endYear
          return withinStart && withinEnd
        })
      })
    }

    setFilteredRecords(filtered)
  }, [records, searchTerm, filterCategory, filterAdministration, filterYearStart, filterYearEnd])

  const handleDownloadCSV = () => {
    if (!filteredRecords.length) return

    // Get filtered years based on year range selection
    let yearsToExport = availableYears
    if (filterYearStart !== 'all' || filterYearEnd !== 'all') {
      const startYear = filterYearStart === 'all' ? null : parseInt(filterYearStart)
      const endYear = filterYearEnd === 'all' ? null : parseInt(filterYearEnd)

      yearsToExport = availableYears.filter(year => {
        const y = parseInt(year)
        const withinStart = startYear === null || y >= startYear
        const withinEnd = endYear === null || y <= endYear
        return withinStart && withinEnd
      })
    }

    const headers = [
      'Administration',
      'Category',
      'Theme',
      'Sector',
      'General Description',
      'Potential Energy Capacity',
      'Unit of Measure',
      'Status of Exploitation',
      'Location',
      'Area',
      ...yearsToExport,
      'Reference',
      'Source'
    ]

    const rows = filteredRecords.map(r => [
      r.administration,
      r.category,
      r.theme,
      r.sector,
      r.description || '',
      (r as any).capacity || '',
      (r as any).unit || '',
      (r as any).statusOfExploitation || '',
      (r as any).location || '',
      (r as any).area || '',
      ...yearsToExport.map(year => (r.data?.[year] !== undefined && r.data[year] !== null ? r.data[year] : '')),
      (r as any).reference || '',
      (r as any).source || ''
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `MDG-Data-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-white">
      <DashboardHeader />
      <div className="w-full bg-gradient-to-r from-[#22c55e] to-[#16a34a] h-1 flex-shrink-0"></div>

      <SidebarProvider>
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <Sidebar className="border-r border-slate-200 w-48 flex-shrink-0">
            <SidebarContent className="pt-6">
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild className="text-base font-bold text-white hover:opacity-90">
                    <Link href="/" className="flex items-center gap-2">
                      <ArrowLeft size={20} />
                      Back to Home
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>

              <div className="mt-8 border-t border-slate-200 pt-4">
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild className={`text-sm flex items-center gap-2 font-bold ${pathname === '/info/navigate' ? 'bg-green-50 text-green-700' : 'text-white hover:opacity-90'}`}>
                      <Link href="/info/navigate" className="w-full">
                        <Map size={18} />
                        Navigate
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild className={`text-sm flex items-center gap-2 font-bold ${pathname === '/info/data' ? 'bg-green-50 text-green-700' : 'text-white hover:opacity-90'}`}>
                      <Link href="/info/data" className="w-full">
                        <Database size={18} />
                        Data
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild className={`text-sm flex items-center gap-2 font-bold ${pathname === '/info/about' ? 'bg-green-50 text-green-700' : 'text-white hover:opacity-90'}`}>
                      <Link href="/info/about" className="w-full">
                        <Users size={18} />
                        About
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </div>
            </SidebarContent>
          </Sidebar>

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            <div className="p-8 space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Excel Data Explorer</h1>
                <p className="text-slate-600">Browse and search all records from the database</p>
              </div>
              <Button
                onClick={handleDownloadCSV}
                disabled={!filteredRecords.length}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                <Download size={18} />
                Download Filtered Data as CSV
              </Button>

              {/* Filters Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Search & Filter</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 p-6">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div>
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Search</label>
                      <Input
                        placeholder="Search description, sector, administration..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Category</label>
                      <Select value={filterCategory} onValueChange={setFilterCategory}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          {categories.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Administration</label>
                      <Select value={filterAdministration} onValueChange={setFilterAdministration}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Administrations</SelectItem>
                          {administrations.map(admin => (
                            <SelectItem key={admin} value={admin}>{admin}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Year Start</label>
                      <Select value={filterYearStart} onValueChange={setFilterYearStart}>
                        <SelectTrigger>
                          <SelectValue placeholder="From" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">From Year</SelectItem>
                          {availableYears.map(year => (
                            <SelectItem key={year} value={year}>{year}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Year End</label>
                      <Select value={filterYearEnd} onValueChange={setFilterYearEnd}>
                        <SelectTrigger>
                          <SelectValue placeholder="To" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">To Year</SelectItem>
                          {availableYears.map(year => (
                            <SelectItem key={year} value={year}>{year}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-5 flex items-end">
                      <div className="flex-1">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Available Years</label>
                        <div className="px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-sm font-medium text-slate-700 dark:text-slate-300">
                          {availableYears.length > 0 ? `${availableYears[0]} - ${availableYears[availableYears.length - 1]}` : 'No years available'}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Data Table Card */}
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <p className="text-slate-600">Loading Excel data...</p>
                </div>
              ) : (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Excel Records ({filteredRecords.length} of {records.length})</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 sticky top-0">
                          <tr>
                            <th className="text-left py-3 px-3 font-medium text-slate-700 dark:text-slate-300 min-w-24">Administration</th>
                            <th className="text-left py-3 px-3 font-medium text-slate-700 dark:text-slate-300 min-w-20">Category</th>
                            <th className="text-left py-3 px-3 font-medium text-slate-700 dark:text-slate-300 min-w-20">Theme</th>
                            <th className="text-left py-3 px-3 font-medium text-slate-700 dark:text-slate-300 min-w-20">Sector</th>
                            <th className="text-left py-3 px-3 font-medium text-slate-700 dark:text-slate-300 min-w-48">General Description</th>
                            <th className="text-left py-3 px-3 font-medium text-slate-700 dark:text-slate-300 min-w-24">Capacity</th>
                            <th className="text-left py-3 px-3 font-medium text-slate-700 dark:text-slate-300 min-w-16">Unit</th>
                            <th className="text-left py-3 px-3 font-medium text-slate-700 dark:text-slate-300 min-w-24">Status</th>
                            <th className="text-left py-3 px-3 font-medium text-slate-700 dark:text-slate-300 min-w-20">Location</th>
                            <th className="text-left py-3 px-3 font-medium text-slate-700 dark:text-slate-300 min-w-16">Area</th>
                            {(() => {
                              let yearsToDisplay = availableYears
                              if (filterYearStart !== 'all' || filterYearEnd !== 'all') {
                                const startYear = filterYearStart === 'all' ? null : parseInt(filterYearStart)
                                const endYear = filterYearEnd === 'all' ? null : parseInt(filterYearEnd)
                                yearsToDisplay = availableYears.filter(year => {
                                  const y = parseInt(year)
                                  const withinStart = startYear === null || y >= startYear
                                  const withinEnd = endYear === null || y <= endYear
                                  return withinStart && withinEnd
                                })
                              }
                              return yearsToDisplay.map(year => (
                                <th key={year} className="text-left py-3 px-3 font-medium text-slate-700 dark:text-slate-300 min-w-16 text-center bg-blue-50 dark:bg-blue-900/20">{year}</th>
                              ))
                            })()}
                            <th className="text-left py-3 px-3 font-medium text-slate-700 dark:text-slate-300 min-w-20">Reference</th>
                            <th className="text-left py-3 px-3 font-medium text-slate-700 dark:text-slate-300 min-w-20">Source</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                          {filteredRecords.length > 0 ? (
                            filteredRecords.map((record, idx) => {
                              let yearsToDisplay = availableYears
                              if (filterYearStart !== 'all' || filterYearEnd !== 'all') {
                                const startYear = filterYearStart === 'all' ? null : parseInt(filterYearStart)
                                const endYear = filterYearEnd === 'all' ? null : parseInt(filterYearEnd)
                                yearsToDisplay = availableYears.filter(year => {
                                  const y = parseInt(year)
                                  const withinStart = startYear === null || y >= startYear
                                  const withinEnd = endYear === null || y <= endYear
                                  return withinStart && withinEnd
                                })
                              }
                              return (
                                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                  <td className="py-3 px-3 text-slate-900 dark:text-slate-100 font-medium text-xs">{record.administration}</td>
                                  <td className="py-3 px-3 text-slate-700 dark:text-slate-400 text-xs">{record.category}</td>
                                  <td className="py-3 px-3 text-slate-700 dark:text-slate-400 text-xs">{record.theme}</td>
                                  <td className="py-3 px-3 text-slate-700 dark:text-slate-400 text-xs">{record.sector}</td>
                                  <td className="py-3 px-3 text-slate-600 dark:text-slate-500 text-xs max-w-xs">{record.description || '-'}</td>
                                  <td className="py-3 px-3 text-slate-700 dark:text-slate-400 text-xs font-medium">{(record as any).capacity || '-'}</td>
                                  <td className="py-3 px-3 text-slate-700 dark:text-slate-400 text-xs">{(record as any).unit || '-'}</td>
                                  <td className="py-3 px-3 text-slate-700 dark:text-slate-400 text-xs">{(record as any).statusOfExploitation || '-'}</td>
                                  <td className="py-3 px-3 text-slate-700 dark:text-slate-400 text-xs">{(record as any).location || '-'}</td>
                                  <td className="py-3 px-3 text-slate-700 dark:text-slate-400 text-xs">{(record as any).area || '-'}</td>
                                  {yearsToDisplay.map(year => (
                                    <td key={year} className="py-3 px-3 text-slate-700 dark:text-slate-400 text-xs font-medium text-center bg-blue-50/30 dark:bg-blue-900/10">
                                      {record.data?.[year] !== undefined && record.data[year] !== null ? record.data[year] : '-'}
                                    </td>
                                  ))}
                                  <td className="py-3 px-3 text-slate-700 dark:text-slate-400 text-xs">{(record as any).reference || '-'}</td>
                                  <td className="py-3 px-3 text-slate-700 dark:text-slate-400 text-xs">{(record as any).source || '-'}</td>
                                </tr>
                              )
                            })
                          ) : (
                            <tr>
                              <td colSpan={12 + availableYears.length} className="py-8 px-3 text-center text-slate-500">
                                No records found matching your filters
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </main>
        </div>
      </SidebarProvider>
    </div>
  )
}
