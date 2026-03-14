import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, phone, company, message, officeId } = body

    // Office-specific contact form → create a Lead
    if (officeId) {
      if (!name || !phone || !message) {
        return NextResponse.json(
          { error: 'الاسم ورقم الهاتف والرسالة مطلوبة' },
          { status: 400 }
        )
      }

      const office = await prisma.office.findUnique({
        where: { id: officeId },
        select: { id: true, isActive: true },
      })

      if (!office || !office.isActive) {
        return NextResponse.json(
          { error: 'Office not found' },
          { status: 404 }
        )
      }

      await prisma.lead.create({
        data: {
          officeId,
          name: name.trim(),
          phone: phone.trim(),
          email: email?.trim() || null,
          message: message.trim(),
          source: 'CONTACT_FORM',
          status: 'NEW',
        },
      })

      return NextResponse.json({ success: true })
    }

    // Platform-level contact form → create ContactMessage
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'الاسم والبريد الإلكتروني والرسالة مطلوبة' },
        { status: 400 }
      )
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني غير صالح' },
        { status: 400 }
      )
    }

    // Rate limiting: max 5 messages per email per hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    const recentCount = await prisma.contactMessage.count({
      where: {
        email,
        createdAt: { gte: oneHourAgo },
      },
    })

    if (recentCount >= 5) {
      return NextResponse.json(
        { error: 'لقد أرسلت عدة رسائل مؤخراً. يرجى المحاولة لاحقاً' },
        { status: 429 }
      )
    }

    const contactMessage = await prisma.contactMessage.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone?.trim() || null,
        company: company?.trim() || null,
        message: message.trim(),
      },
    })

    return NextResponse.json({ success: true, id: contactMessage.id })
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
}
