'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { modelData } from '@/data/excel-data'

export default function LoadExcelDataPage() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleLoadData = async () => {
    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/load-excel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ excelData: modelData })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to load data')
      }

      setMessage({
        type: 'success',
        text: `✓ ${result.message}`
      })
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: `✗ Error: ${error.message}`
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Load Excel Data to Database</CardTitle>
            <CardDescription>
              Click the button below to load the energy data from Excel into your Supabase database
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {message && (
              <div className={`flex items-start gap-3 p-4 rounded-lg ${
                message.type === 'success'
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
              }`}>
                {message.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                )}
                <p className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                  {message.text}
                </p>
              </div>
            )}

            <div className="space-y-3">
              <h3 className="font-semibold">What will be loaded:</h3>
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li>• Demographics data (population, households)</li>
                <li>• Energy resource potentials (biomass, solar, wind, hydro, geothermal)</li>
                <li>• Electricity connectivity and access data</li>
                <li>• Energy demand and consumption data</li>
                <li>• County-specific and national-level data</li>
                <li>• Historical data from 2019 to 2033</li>
              </ul>
            </div>

            <Button
              onClick={handleLoadData}
              disabled={loading}
              className="w-full h-10 text-base"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                'Load Data to Database'
              )}
            </Button>

            <p className="text-xs text-muted-foreground mt-4">
              After loading, check the <a href="/data-search" className="underline hover:text-foreground">
                Data Search page
              </a> to view all loaded data
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
