import { NextRequest, NextResponse } from 'next/server'
import { getAuditLogs } from '@/lib/actions/admin'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const result = await getAuditLogs({
      page: parseInt(searchParams.get('page') || '1'),
      pageSize: parseInt(searchParams.get('pageSize') || '30'),
      search: searchParams.get('search') || undefined,
      action: searchParams.get('action') || undefined,
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
    })

    return NextResponse.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred'

    if (message === 'Super admin access required' || message === 'Authentication required') {
      return NextResponse.json(
        { success: false, error: message },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
