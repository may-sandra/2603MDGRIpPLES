import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

export async function loadExcelDataToSupabase(excelData: any) {
  const supabase = createClient(supabaseUrl, supabaseKey)

  // Extract headers and rows from Excel cell format
  const cells = excelData['MDG Data']?.values || {}
  
  // Get headers from row 1
  const headers: { [key: string]: string } = {}
  const columnMap: { [key: string]: string } = {}
  
  for (let i = 65; i <= 90; i++) { // A-Z
    const col = String.fromCharCode(i)
    const headerKey = `${col}1`
    if (cells[headerKey]) {
      headers[col] = cells[headerKey]
      columnMap[col] = cells[headerKey]
    }
  }

  // Parse rows starting from row 2
  const records: any[] = []
  let rowNum = 2
  
  while (true) {
    // Check if there's data in column A for this row
    const cellA = cells[`A${rowNum}`]
    if (!cellA) break

    const record: any = {}
    
    // Extract all column data for this row
    for (let i = 65; i <= 90; i++) { // A-Z
      const col = String.fromCharCode(i)
      const cellKey = `${col}${rowNum}`
      const header = columnMap[col]
      
      if (header && cells[cellKey] !== undefined) {
        // Store with proper column name
        record[header] = cells[cellKey]
      }
    }
    
    // Ensure all required columns exist (even if empty)
    record['Administration'] = record['Administration'] || ''
    record['Category'] = record['Category'] || ''
    record['Theme'] = record['Theme'] || ''
    record['Sector'] = record['Sector'] || ''
    record['General Description'] = record['General Description'] || ''
    record['Potential Energy Capacity'] = record['Potential Energy Capacity'] || ''
    record['Unit of Measure'] = record['Unit of Measure'] || ''
    record['Status of Exploitation'] = record['Status of Exploitation'] || ''
    record['Location'] = record['Location'] || ''
    
    // Add year columns
    for (let year = 2019; year <= 2030; year++) {
      record[year.toString()] = record[year.toString()] || ''
    }
    record['2033'] = record['2033'] || ''
    record['Area'] = record['Area'] || ''
    record['Scenario'] = record['Scenario'] || ''
    record['INEP Source'] = record['INEP Source'] || ''
    record['CEP Reference'] = record['CEP Reference'] || ''
    
    records.push(record)
    rowNum++
  }

  console.log(`[MDG] Parsed ${records.length} records from Excel data`)

  // Insert records in batches
  const batchSize = 100
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize)
    
    const { error } = await supabase
      .from('MDG')
      .insert(batch)
    
    if (error) {
      console.error(`[MDG] Error inserting batch ${Math.floor(i / batchSize)}:`, error)
      throw error
    }
    console.log(`[MDG] Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(records.length / batchSize)}`)
  }

  return { success: true, recordsLoaded: records.length }
}
