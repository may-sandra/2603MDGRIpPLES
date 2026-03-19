import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import { parse } from 'csv-parse/sync'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials')
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function populateMDGData() {
  try {
    // Read CSV file
    const csvPath = path.join(process.cwd(), 'user_read_only_context/text_attachments/260206_MDGData_Combined-SYLh5.csv')
    const fileContent = fs.readFileSync(csvPath, 'utf-8')
    
    // Parse CSV
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    })

    console.log(`[v0] Parsed ${records.length} records from CSV`)

    // Clear existing data
    const { error: deleteError } = await supabase.from('mdg_records').delete().neq('id', '')
    if (deleteError) {
      console.error('[v0] Error clearing existing data:', deleteError)
    } else {
      console.log('[v0] Cleared existing mdg_records')
    }

    // Insert records in batches
    const batchSize = 50
    let successCount = 0
    let errorCount = 0

    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize)
      
      const formattedBatch = batch.map((record: any) => {
        // Parse year columns into data object
        const data: Record<string, any> = {}
        const yearColumns = ['2019', '2020', '2021', '2022', '2023', '2024', '2025', '2026', '2027', '2028', '2029', '2030', '2033']
        
        yearColumns.forEach(year => {
          if (record[year]) {
            data[year] = record[year]
          }
        })

        return {
          administration: record['Administration'] || 'Unknown',
          category: record['Category'] || '',
          theme: record['Theme'] || '',
          sector: record['Sector'] || '',
          description: record['General Description'] || '',
          capacity: record['Potential Energy Capacity'] || null,
          unit: record['Unit of Measure'] || null,
          status_of_exploitation: record['Status of Exploitation'] || null,
          location: record['Location'] || null,
          area: record['Area'] || null,
          scenario: record['Scenario'] || null,
          inep: record['INEP'] || null,
          source: record['Source'] || null,
          cep: record['CEP'] || null,
          reference: record['Reference'] || null,
          data: data,
        }
      })

      const { error } = await supabase.from('mdg_records').insert(formattedBatch)
      
      if (error) {
        console.error(`[v0] Error inserting batch ${i / batchSize + 1}:`, error)
        errorCount += batch.length
      } else {
        successCount += batch.length
        console.log(`[v0] Inserted batch ${i / batchSize + 1}: ${successCount}/${records.length} records`)
      }
    }

    console.log(`[v0] Population complete. Success: ${successCount}, Errors: ${errorCount}`)
  } catch (error) {
    console.error('[v0] Error populating MDG data:', error)
    throw error
  }
}

populateMDGData().then(() => {
  console.log('[v0] MDG data population finished')
  process.exit(0)
}).catch(error => {
  console.error('[v0] Fatal error:', error)
  process.exit(1)
})
