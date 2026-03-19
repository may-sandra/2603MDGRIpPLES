'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function PopulateDataPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handlePopulate = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/populate-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to populate data')
      } else {
        setResult(data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            Populate MDG Data
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Load all 440 MDG records from the CSV file into the Supabase database
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Load Data from CSV</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              This will:
            </p>
            <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-400 space-y-1">
              <li>Read the MDG data CSV file</li>
              <li>Clear any existing data in mdg_records table</li>
              <li>Insert all 440 records into the database</li>
            </ul>

            <Button
              onClick={handlePopulate}
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? 'Populating Data...' : 'Populate Data from CSV'}
            </Button>
          </CardContent>
        </Card>

        {error && (
          <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
            <CardHeader>
              <CardTitle className="text-red-900 dark:text-red-100">Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
            </CardContent>
          </Card>
        )}

        {result && (
          <Card className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
            <CardHeader>
              <CardTitle className="text-green-900 dark:text-green-100">Success</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-green-800 dark:text-green-200 text-sm">{result.message}</p>
              <div className="bg-white dark:bg-slate-900 p-3 rounded text-sm font-mono space-y-1">
                <p>Total Records: <span className="font-bold">{result.total}</span></p>
                <p>Successfully Inserted: <span className="font-bold text-green-600 dark:text-green-400">{result.success ? result.total : 0}</span></p>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-4">
                Data has been loaded. Visit <a href="/data-search" className="underline">Data Explorer</a> to view the records.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  )
}
