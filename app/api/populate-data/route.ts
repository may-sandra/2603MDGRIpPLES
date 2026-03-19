import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export async function POST(request: NextRequest) {
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Missing Supabase credentials' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    // Read CSV file
    const csvPath = path.join(process.cwd(), 'public/mdg-data.csv')
    
    if (!fs.existsSync(csvPath)) {
      return NextResponse.json({ error: 'CSV file not found' }, { status: 404 })
    }

    const fileContent = fs.readFileSync(csvPath, 'utf-8')
    const lines = fileContent.split('\n').filter(line => line.trim())
    
    // Parse header
    const header = lines[0].split(',').map(h => h.trim())
    console.log('[MDG] CSV Header:', header)

    // Clear existing data from MDG table
    await supabase.from('MDG').delete().neq('ID', '')
    console.log('[MDG] Cleared existing MDG records')

    // Parse and insert records
    const records = []
    const yearColumns = ['2019', '2020', '2021', '2022', '2023', '2024', '2025', '2026', '2027', '2028', '2029', '2030', '2033']

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]
      if (!line.trim()) continue

      // Simple CSV parsing - handle quoted fields
      const regex = /("(?:[^"]|"")*"|[^,]*)/g
      const matches = line.match(regex) || []
      const values = matches.map(v => v.replace(/^"|"$/g, '').replace(/""/g, '"').trim())

      if (values.length < header.length) continue

      // Build record object
      const record: any = {}
      header.forEach((col, idx) => {
        record[col] = values[idx] || ''
      })

      // Create record with exact MDG table column names
      const mdgRecord: any = {
        'Administration': record['Administration'] || 'Unknown',
        'Category': record['Category'] || '',
        'Theme': record['Theme'] || '',
        'Sector': record['Sector'] || '',
        'General Description': record['General Description'] || '',
        'Potential Energy Capacity': record['Potential Energy Capacity'] || '',
        'Unit of Measure': record['Unit of Measure'] || '',
        'Status of Exploitation': record['Status of Exploitation'] || '',
        'Location': record['Location'] || '',
        'Area': record['Area'] || '',
        'Scenario': record['Scenario'] || '',
        'INEP Source': record['INEP Source'] || record['INEP'] || '',
        'CEP Reference': record['CEP Reference'] || record['CEP'] || '',
      }

      // Add year columns
      yearColumns.forEach(year => {
        mdgRecord[year] = record[year] || ''
      })

      records.push(mdgRecord)
    }

    console.log(`[MDG] Parsed ${records.length} records from CSV`)

    // Insert records in batches
    let successCount = 0
    const batchSize = 50

    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize)
      const { error } = await supabase.from('MDG').insert(batch)
      
      if (error) {
        console.error(`[MDG] Error inserting batch ${i / batchSize + 1}:`, error)
      } else {
        successCount += batch.length
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully populated ${successCount} records`,
      total: records.length,
    })
  } catch (error) {
    console.error('[MDG] Error populating MDG data:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
