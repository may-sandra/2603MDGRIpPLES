'use server'

import { createClient } from '@supabase/supabase-js'
import * as XLSX from 'xlsx'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase configuration')
}

export interface MDGRecord {
  administration: string
  category: string
  theme: string
  sector: string
  description: string
  capacity?: string | number
  unit?: string
  data: Record<string, any>
  isYearData: boolean // true if record has year columns, false if static value only
  reference?: string
  statusOfExploitation?: string
  location?: string
  area?: string
  scenario?: string
  inep?: string
  source?: string
}

export async function fetchMDGExcelFromStorageBucket(): Promise<MDGRecord[]> {
  try {
    console.log('[MDG] Fetching MDG Excel file from Supabase Storage bucket...')

    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseServiceKey) {
      throw new Error('Service role key not found')
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    // List all files in the MDG bucket to find Excel file
    console.log('[MDG] Listing files in MDG bucket...')
    const { data: fileList, error: listError } = await supabaseAdmin
      .storage
      .from('MDG')
      .list('', { limit: 100 })

    if (listError) {
      console.error('[MDG] Error listing files in bucket:', listError)
      throw listError
    }

    // Find the first Excel file (.xlsx or .xls)
    const excelFile = fileList?.find(file => 
      file.name.toLowerCase().endsWith('.xlsx') || 
      file.name.toLowerCase().endsWith('.xls')
    )

    if (!excelFile) {
      throw new Error('No Excel file found in MDG bucket. Please upload an Excel file (.xlsx or .xls)')
    }

    console.log('[MDG] Found Excel file:', excelFile.name)

    // Download the Excel file from storage bucket
    const { data, error } = await supabaseAdmin
      .storage
      .from('MDG')
      .download(excelFile.name)

    if (error) {
      console.error('[MDG] Error downloading from storage:', error)
      throw error
    }

    if (!data) {
      throw new Error('No file data received from storage')
    }

    // Convert blob to buffer
    const arrayBuffer = await data.arrayBuffer()
    
    // Parse Excel file
    const workbook = XLSX.read(arrayBuffer, { type: 'array' })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    
    // Convert to JSON
    const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet)

    console.log('[MDG] Successfully parsed Excel from storage:', jsonData.length, 'rows')

    // Transform to MDGRecord format
    // Filter out rows that don't have valid Administration values or are header rows
    // Accept any non-empty administration (allows dynamic counties)
    
    const records = jsonData
      .filter((row: any) => {
        const admin = row['Administration'] || row['administration'] || ''
        // Only exclude empty administrations and common header/metadata rows
        return admin.trim().length > 0 && admin.toLowerCase() !== 'administration'
      })
      .map((row: any) => {
        const yearData: Record<string, any> = {}
        
        // Parse columns with "Year XXXX" format (e.g., "Year 2019", "Year 2020")
        Object.keys(row).forEach(key => {
          // Match patterns like "Year 2019" or just numeric years "2019"
          const yearMatch = key.match(/Year\s*(\d{4})|^(\d{4})$/)
          if (yearMatch) {
            const year = yearMatch[1] || yearMatch[2]
            const value = row[key]
            if (value !== undefined && value !== null && value !== '') {
              yearData[year] = value
            }
          }
        })

        const hasYearData = Object.keys(yearData).length > 0
        const capacity = row['Potential Energy Capacity'] || row['potential energy capacity']

        return {
          administration: row['Administration'] || row['administration'] || 'Unknown',
          category: row['Category'] || row['category'] || '',
          theme: row['Theme'] || row['theme'] || '',
          sector: row['Sector'] || row['sector'] || '',
          description: row['General Description'] || row['general description'] || '',
          capacity: capacity || (hasYearData && Object.values(yearData)[0]) || undefined,
          unit: row['Unit of Measure'] || row['unit of measure'] || undefined,
          data: yearData,
          isYearData: hasYearData,
          reference: row['CEP Reference'] || row['cep reference'] || undefined,
          statusOfExploitation: row['Status of Exploitation'] || row['status of exploitation'] || undefined,
          location: row['Location'] || row['location'] || undefined,
          area: row['Area'] || row['area'] || undefined,
          scenario: row['Scenario'] || row['scenario'] || undefined,
          inep: row['INEP Source'] || row['inep source'] || undefined,
          source: row['Source'] || row['source'] || undefined,
        } as MDGRecord
      })

    return records
  } catch (error) {
    console.error('[MDG] Error in fetchMDGExcelFromStorageBucket:', error)
    throw error
  }
}

export async function fetchMDGExcelFromSupabase(): Promise<MDGRecord[]> {
  try {
    console.log('[MDG] Fetching MDG data from Supabase MDG table...')

    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseServiceKey) {
      console.warn('[MDG] Service role key not found, using public key')
    }

    // Use service role key for full access
    const { createClient } = await import('@supabase/supabase-js')
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || supabaseKey)

    // Fetch all records from MDG table
    const { data, error } = await supabaseAdmin
      .from('MDG')
      .select('*')
      .order('Administration', { ascending: true })

    if (error) {
      console.error('[MDG] Error fetching from MDG table:', error)
      return getMockMDGData()
    }

    if (!data || data.length === 0) {
      console.log('[MDG] No records found in MDG table. Run POST /api/populate-data to load CSV data')
      return getMockMDGData()
    }

    // Transform database records to MDGRecord format
    // Accept any non-empty administration (allows dynamic counties)
    
    const records = data
      .filter((record: any) => {
        const admin = record['Administration'] || ''
        // Only exclude empty administrations and common header/metadata rows
        return admin.trim().length > 0 && admin.toLowerCase() !== 'administration'
      })
      .map((record: any) => {
        // Extract year data from database record
        const yearData: Record<string, any> = {}
        
        // Parse columns with "Year XXXX" format
        Object.keys(record).forEach(key => {
          const yearMatch = key.match(/Year\s*(\d{4})|^(\d{4})$/)
          if (yearMatch) {
            const year = yearMatch[1] || yearMatch[2]
            const value = record[key]
            if (value !== undefined && value !== null && value !== '') {
              yearData[year] = value
            }
          }
        })

        const hasYearData = Object.keys(yearData).length > 0
        const capacity = record['Potential Energy Capacity']

        return {
          administration: record['Administration'] || 'Unknown',
          category: record['Category'] || '',
          theme: record['Theme'] || '',
          sector: record['Sector'] || '',
          description: record['General Description'] || '',
          capacity: capacity || (hasYearData && Object.values(yearData)[0]) || undefined,
          unit: record['Unit of Measure'] || undefined,
          data: yearData,
          isYearData: hasYearData,
          reference: record['CEP Reference'] || undefined,
          statusOfExploitation: record['Status of Exploitation'] || undefined,
          location: record['Location'] || undefined,
          area: record['Area'] || undefined,
          scenario: record['Scenario'] || undefined,
          inep: record['INEP Source'] || undefined,
          source: record['Source'] || undefined,
        } as MDGRecord
      })

    console.log('[MDG] Successfully fetched', records.length, 'records from MDG table')
    return records
  } catch (error) {
    console.error('[MDG] Error in fetchMDGExcelFromSupabase:', error)
    return getMockMDGData()
  }
}

function getMockMDGData(): MDGRecord[] {
  console.log('[MDG] Using mock MDG data - please upload file to storage bucket')
  return []
}
