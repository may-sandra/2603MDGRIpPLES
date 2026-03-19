'use client'

import React, { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import CategoryFilter from '@/components/category-filter'

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
  const [records, setRecords] = useState<MDGRecord[]>([])
  const [filteredRecords, setFilteredRecords] = useState<MDGRecord[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState<string | null>(null)
  const [filterAdministration, setFilterAdministration] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [categories, setCategories] = useState<string[]>([])
  const [administrations, setAdministrations] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        console.log('[MDG] Data Page: Fetching MDG data...')
        
        const response = await fetch('/api/mdg-data')
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const json = await response.json()
        const data = json.data || []
        
        if (data && Array.isArray(data)) {
          console.log('[MDG] Data Page: Loaded', data.length, 'records')
          setRecords(data)
          setFilteredRecords(data)
          
          // Extract unique values
          const uniqueCategories = [...new Set(data.map((r: any) => r.category).filter(Boolean))] as string[]
          const uniqueAdmins = [...new Set(data.map((r: any) => r.administration).filter(Boolean))] as string[]
          
          setCategories(uniqueCategories.sort())
          setAdministrations(uniqueAdmins.sort())
        } else {
          console.warn('[MDG] Data is not an array:', json)
          setError('Invalid data format received')
          setRecords([])
        }
      } catch (error) {
        console.error('[MDG] Error fetching data:', error)
        setError(error instanceof Error ? error.message : 'Failed to fetch data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    // Filter records
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

    if (filterCategory && filterCategory !== 'all') {
      filtered = filtered.filter(r => r.category === filterCategory)
    }

    if (filterAdministration !== 'all') {
      filtered = filtered.filter(r => r.administration === filterAdministration)
    }

    // Filter out records with blank/undefined capacity unless they have year data
    filtered = filtered.filter(r => {
      const hasCapacity = r.capacity && String(r.capacity).trim() !== ''
      const hasYearData = r.data && Object.keys(r.data).length > 0
      return hasCapacity || hasYearData
    })

    setFilteredRecords(filtered)
  }, [records, searchTerm, filterCategory, filterAdministration])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#22c55e] mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading MDG data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#021933] to-[#0d3b66] border-b-4 border-[#22c55e] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-white">Data Explorer</h1>
          <p className="text-blue-100 text-sm mt-1">Browse and search {records.length} MDG records across Kenyan counties</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
            <CardContent className="pt-6">
              <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 sticky top-20 z-10 bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900 pb-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{records.length}</div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Total Records</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">{administrations.length}</div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Administrations</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{categories.length}</div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Categories</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">{filteredRecords.length}</div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Filtered Results</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 max-h-[calc(100vh-320px)] overflow-hidden">
          {/* Filters Sidebar - Fixed Height with Scroll */}
          <div className="lg:col-span-1 space-y-4 overflow-y-auto pr-2">
            {/* Category Filter */}
            <CategoryFilter 
              selectedCategory={filterCategory}
              onCategorySelect={setFilterCategory}
              categories={categories}
            />

            {/* Administration Filter */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Administration</CardTitle>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area - Fixed Height with Scroll */}
          <div className="lg:col-span-3 space-y-4 overflow-y-auto pr-2 flex flex-col">
            {/* Search */}
            <Card className="flex-shrink-0">
              <CardHeader>
                <CardTitle className="text-lg">Search</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  placeholder="Search by description, sector, theme, administration..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </CardContent>
            </Card>

            {/* Data Table - Scrollable Container */}
            <Card className="flex-1 flex flex-col overflow-hidden">
              <CardHeader className="flex-shrink-0">
                <CardTitle className="text-lg">Excel Records ({filteredRecords.length} of {records.length})</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-auto">
                <div className="overflow-x-auto h-full">
                  <table className="w-full text-sm">
                    <thead className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 sticky top-0">
                      <tr>
                        <th className="text-left py-3 px-3 font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">Administration</th>
                        <th className="text-left py-3 px-3 font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">Category</th>
                        <th className="text-left py-3 px-3 font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">Theme</th>
                        <th className="text-left py-3 px-3 font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">Sector</th>
                        <th className="text-left py-3 px-3 font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">Description</th>
                        <th className="text-left py-3 px-3 font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">Capacity</th>
                        <th className="text-left py-3 px-3 font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">Unit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                      {filteredRecords.length > 0 ? (
                        filteredRecords.map((record, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                            <td className="py-3 px-3 text-slate-900 dark:text-slate-100 font-medium text-sm whitespace-nowrap">{record.administration}</td>
                            <td className="py-3 px-3 text-slate-700 dark:text-slate-400 text-xs whitespace-nowrap">{record.category}</td>
                            <td className="py-3 px-3 text-slate-700 dark:text-slate-400 text-xs whitespace-nowrap">{record.theme}</td>
                            <td className="py-3 px-3 text-slate-700 dark:text-slate-400 text-xs whitespace-nowrap">{record.sector}</td>
                            <td className="py-3 px-3 text-slate-600 dark:text-slate-500 text-xs max-w-xs truncate">{record.description || '-'}</td>
                            <td className="py-3 px-3 text-slate-700 dark:text-slate-400 text-xs font-medium whitespace-nowrap">{record.capacity || '-'}</td>
                            <td className="py-3 px-3 text-slate-700 dark:text-slate-400 text-xs whitespace-nowrap">{record.unit || '-'}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="py-8 px-3 text-center text-slate-500">
                            No records found matching your filters
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
