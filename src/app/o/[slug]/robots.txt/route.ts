import { NextResponse, type NextRequest } from 'next/server'
import prisma from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  const office = await prisma.office.findUnique({
    where: { slug },
    select: { id: true, isActive: true, isApproved: true },
  })

  if (!office || !office.isActive || !office.isApproved) {
    const robotsTxt = `User-agent: *
Disallow: /`

    return new NextResponse(robotsTxt, {
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    })
  }

  const baseUrl = `${request.nextUrl.protocol}//${request.nextUrl.host}/o/${slug}`

  const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml

# Block access to dashboard and API routes
Disallow: /dashboard/
Disallow: /api/
Disallow: /auth/
`

  return new NextResponse(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
