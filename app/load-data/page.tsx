'use client'

import React from "react"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'

export default function LoadDataPage() {
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setMessage(null)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setMessage({ type: 'error', text: 'Please select a file' })
      return
    }

    setIsLoading(true)
    setMessage(null)

    try {
      const text = await file.text()
      
      // Try to parse as JSON first
      let data
      try {
        data = JSON.parse(text)
      } catch {
        // If not JSON, try to interpret as Excel export
        setMessage({ type: 'error', text: 'File must be in JSON format with Excel cell references (A1, B1, etc.)' })
        setIsLoading(false)
        return
      }

      // Send to API
      const response = await fetch('/api/populate-excel-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        setMessage({ type: 'error', text: `Error: ${result.error}` })
      } else {
        setMessage({
          type: 'success',
          text: `Successfully loaded ${result.inserted} of ${result.total} records into database`,
        })
        setFile(null)
      }
    } catch (error) {
      setMessage({ type: 'error', text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">Load Data to Database</h1>
          <p className="text-slate-600 dark:text-slate-400">Upload your Excel data (as JSON) to populate the Supabase database</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Upload Excel Data File</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-6">
              <Input
                type="file"
                accept=".json,.js"
                onChange={handleFileChange}
                disabled={isLoading}
                className="cursor-pointer"
              />
              {file && (
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                  Selected: <span className="font-medium">{file.name}</span>
                </p>
              )}
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <span className="font-medium">Format:</span> JSON file with structure like:
              </p>
              <pre className="text-xs bg-white dark:bg-slate-900 mt-2 p-2 rounded overflow-auto max-h-32 border border-blue-100 dark:border-slate-700">
{`{
  "MDG Data": {
    "values": {
      "A1": "Administration",
      "B1": "Category",
      ...
      "A2": "National",
      "B2": "Category Value",
      ...
    }
  }
}`}
              </pre>
            </div>

            <Button
              onClick={handleUpload}
              disabled={!file || isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Loading data...' : 'Load Data to Database'}
            </Button>
          </CardContent>
        </Card>

        {message && (
          <Alert variant={message.type === 'success' ? 'default' : 'destructive'}>
            {message.type === 'success' ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
            <div>
              <p className="font-medium text-slate-900 dark:text-slate-100">1. Export your data</p>
              <p>Export your Excel file data as JSON with cell references (A1, B1, etc.)</p>
            </div>
            <div>
              <p className="font-medium text-slate-900 dark:text-slate-100">2. Upload the file</p>
              <p>Use the form above to upload your JSON file</p>
            </div>
            <div>
              <p className="font-medium text-slate-900 dark:text-slate-100">3. View your data</p>
              <p>
                Go to{' '}
                <a href="/data" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                  Data page
                </a>
                {' '}to see your loaded data in the table
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
