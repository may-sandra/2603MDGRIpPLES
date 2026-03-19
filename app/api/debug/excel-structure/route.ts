export const dynamic = "force-dynamic"


import { fetchMDGExcelFromSupabase } from '@/lib/mdg-supabase-loader'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const records = await fetchMDGExcelFromSupabase()
    
    // Show sample records and unique values
    const categories = [...new Set(records.map(r => r.category))]
    const descriptions = [...new Set(records.map(r => r.description))]
    const sectors = [...new Set(records.map(r => r.sector))]
    const administrations = [...new Set(records.map(r => r.administration))]

    return NextResponse.json({
      totalRecords: records.length,
      categories,
      descriptions,
      sectors,
      administrations,
      sampleRecords: records.slice(0, 10),
    })
  } catch (error) {
    console.error('[MDG] Debug error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error' },
      { status: 500 }
    )
  }
}
