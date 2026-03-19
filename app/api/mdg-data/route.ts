import { fetchMDGExcelFromStorageBucket } from '@/lib/mdg-supabase-loader'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('[v0] API: Fetching MDG data from Storage bucket...')
    console.log('[v0] Storage URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
    
    const records = await fetchMDGExcelFromStorageBucket()

    if (!records || records.length === 0) {
      console.warn('[v0] API: No records found in storage bucket')
      return NextResponse.json({
        success: true,
        total: 0,
        data: [],
        message: 'No records found. Please upload an Excel file (.xlsx or .xls) to Supabase Storage in the MDG bucket.',
      })
    }

    console.log('[v0] API: Successfully fetched', records.length, 'records')
    console.log('[v0] API: Sample record:', records[0])
    
    return NextResponse.json({
      success: true,
      total: records.length,
      data: records,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[v0] API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch MDG data',
        message: 'Could not fetch MDG Excel data. Ensure:\n1. Supabase Storage bucket named "MDG" exists\n2. An Excel file (.xlsx or .xls) is uploaded to that bucket\n3. Service role key is set (SUPABASE_SERVICE_ROLE_KEY)',
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    )
  }
}
