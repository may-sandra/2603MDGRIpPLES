import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

interface ExcelData {
  [sheetName: string]: {
    values: {
      [cellRef: string]: any
    }
  }
}

function parseExcelData(excelData: ExcelData): any[] {
  const records: any[] = []
  const sheet = excelData['MDG Data']
  if (!sheet || !sheet.values) return records

  const values = sheet.values

  // Extract headers (row 1: A1, B1, C1, etc.)
  const headers: { [key: string]: string } = {}
  Object.entries(values).forEach(([cell, value]) => {
    if (cell.endsWith('1')) {
      const col = cell.slice(0, -1)
      headers[col] = value
    }
  })

  console.log('[MDG] Extracted headers:', headers)

  // Group data by row
  const rowMap: { [row: number]: { [col: string]: any } } = {}

  Object.entries(values).forEach(([cell, value]) => {
    if (cell === 'A1' || !cell.endsWith('1')) {
      const match = cell.match(/^([A-Z]+)(\d+)$/)
      if (match) {
        const col = match[1]
        const row = parseInt(match[2])

        if (row > 1) {
          if (!rowMap[row]) {
            rowMap[row] = {}
          }
          rowMap[row][col] = value
        }
      }
    }
  })

  // Convert rows to records
  Object.entries(rowMap).forEach(([, rowData]) => {
    const record: any = {}

    // Map columns to headers
    const columnMap: { [col: string]: string } = {}
    Object.entries(headers).forEach(([col, header]) => {
      columnMap[col] = header
    })

    // Build record with proper field names
    Object.entries(rowData).forEach(([col, value]) => {
      const fieldName = columnMap[col]
      if (fieldName) {
        record[fieldName] = value
      }
    })

    // Only add records that have an Administration field
    if (record['Administration']) {
      records.push(record)
    }
  })

  console.log('[MDG] Parsed', records.length, 'records from Excel data')
  return records
}

export async function POST(request: NextRequest) {
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Missing Supabase credentials' }, { status: 500 })
  }

  try {
    const excelData: ExcelData = await request.json()

    // Parse Excel data
    const records = parseExcelData(excelData)

    if (records.length === 0) {
      return NextResponse.json({ error: 'No records found in Excel data' }, { status: 400 })
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Clear existing data
    const { error: deleteError } = await supabase.from('MDG').delete().neq('id', '')
    if (deleteError) {
      console.warn('[MDG] Warning clearing existing records:', deleteError)
    }

    console.log('[MDG] Cleared existing MDG records')

    // Insert records in batches
    let successCount = 0
    const batchSize = 50

    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize)
      const { error, data } = await supabase.from('MDG').insert(batch)

      if (error) {
        console.error(`[MDG] Error inserting batch ${Math.floor(i / batchSize) + 1}:`, error)
      } else {
        successCount += batch.length
        console.log(`[MDG] Inserted batch ${Math.floor(i / batchSize) + 1}: ${batch.length} records`)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully populated ${successCount} records`,
      total: records.length,
      inserted: successCount,
    })
  } catch (error) {
    console.error('[MDG] Error populating Excel data:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
