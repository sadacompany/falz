import { NextRequest, NextResponse } from 'next/server'
import { getUsers } from '@/lib/actions/admin'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const result = await getUsers({
      page: parseInt(searchParams.get('page') || '1'),
      pageSize: parseInt(searchParams.get('pageSize') || '20'),
      search: searchParams.get('search') || undefined,
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
