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
    return new NextResponse('Not found', { status: 404 })
  }

  const baseUrl = `${request.nextUrl.protocol}//${request.nextUrl.host}/${slug}`

  // Fetch all published properties
  const properties = await prisma.property.findMany({
    where: { officeId: office.id, status: 'PUBLISHED', isPrivate: false },
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: 'desc' },
  })

  const staticPages = [
    { loc: baseUrl, priority: '1.0', changefreq: 'daily' },
    { loc: `${baseUrl}/properties`, priority: '0.9', changefreq: 'daily' },
    { loc: `${baseUrl}/about`, priority: '0.7', changefreq: 'monthly' },
    { loc: `${baseUrl}/contact`, priority: '0.7', changefreq: 'monthly' },
  ]

  const propertyPages = properties.map((p) => ({
    loc: `${baseUrl}/properties/${p.slug}`,
    lastmod: p.updatedAt.toISOString(),
    priority: '0.8',
    changefreq: 'weekly',
  }))

  const allPages = [...staticPages, ...propertyPages]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages
  .map(
    (page) => `  <url>
    <loc>${escapeXml(page.loc)}</loc>
    ${('lastmod' in page && page.lastmod) ? `<lastmod>${page.lastmod}</lastmod>` : ''}
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
