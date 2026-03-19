import { loadExcelDataToSupabase } from '@/lib/load-excel-to-db'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    if (!body.excelData) {
      return Response.json({ error: 'No excelData provided' }, { status: 400 })
    }

    const result = await loadExcelDataToSupabase(body.excelData)
    
    return Response.json({
      success: true,
      message: `Successfully loaded ${result.recordsLoaded} records to database`,
      recordsLoaded: result.recordsLoaded
    })
  } catch (error: any) {
    console.error('[v0] Error loading data:', error)
    return Response.json(
      { error: error.message || 'Failed to load data' },
      { status: 500 }
    )
  }
}
