import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/db'
import { logAudit } from '@/lib/audit'
import { uploadFile } from '@/lib/storage'
import { normalizePhone } from '@/lib/twilio-verify'

const registerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  phone: z.string().min(1, 'Phone is required').max(20),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  officeNameAr: z.string().min(1, 'Arabic office name is required').max(200),
  officeNameEn: z.string().max(200).optional().default(''),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(100)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Slug must contain only lowercase letters, numbers, and hyphens'
    ),
  falLicenseNo: z.string().max(50).optional().default(''),
  officePhone: z.string().max(20).optional().default(''),
  whatsapp: z.string().max(20).optional().default(''),
  officeEmail: z.string().max(200).optional().default(''),
  themePreset: z
    .enum(['navy-gold', 'deep-green-gold', 'charcoal-sand'])
    .optional()
    .default('navy-gold'),
})

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    const rawData: Record<string, string> = {}
    formData.forEach((value, key) => {
      if (typeof value === 'string') {
        rawData[key] = value
      }
    })

    const parseResult = registerSchema.safeParse(rawData)
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Invalid input',
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const data = parseResult.data
    const normalizedPhone = normalizePhone(data.phone)

    // Check if phone already exists
    const existingUser = await prisma.user.findUnique({
      where: { phone: normalizedPhone },
      select: { id: true },
    })

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'PHONE_EXISTS',
          message: 'This phone number is already registered',
        },
        { status: 409 }
      )
    }

    // Check if slug already exists
    const existingOffice = await prisma.office.findUnique({
      where: { slug: data.slug },
      select: { id: true },
    })

    if (existingOffice) {
      return NextResponse.json(
        {
          success: false,
          error: 'SLUG_EXISTS',
          message: 'This slug is already in use',
        },
        { status: 409 }
      )
    }

    // Handle logo upload if provided
    let logoUrl: string | null = null
    const logoFile = formData.get('logo')
    if (logoFile && logoFile instanceof File && logoFile.size > 0) {
      try {
        const result = await uploadFile(logoFile, 'offices/logos')
        logoUrl = result.url
      } catch (err) {
        console.error('[Register] Logo upload failed:', err)
      }
    }

    // Create user + office + membership + theme settings + subscription in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          phone: normalizedPhone,
          email: data.email?.toLowerCase().trim() || null,
          name: data.name,
        },
      })

      const office = await tx.office.create({
        data: {
          name: data.officeNameEn || data.officeNameAr,
          nameAr: data.officeNameAr,
          slug: data.slug,
          logo: logoUrl,
          falLicenseNo: data.falLicenseNo || null,
          phone: data.officePhone || null,
          whatsapp: data.whatsapp || null,
          email: data.officeEmail || null,
          defaultLanguage: 'ar',
          isApproved: true,
        },
      })

      await tx.membership.create({
        data: {
          userId: user.id,
          officeId: office.id,
          role: 'OWNER',
          isActive: true,
        },
      })

      await tx.themeSettings.create({
        data: {
          officeId: office.id,
          preset: data.themePreset,
        },
      })

      let basicPlan = await tx.plan.findUnique({
        where: { slug: 'basic' },
      })

      if (!basicPlan) {
        basicPlan = await tx.plan.create({
          data: {
            name: 'Basic',
            slug: 'basic',
            priceMonthly: 0,
            priceYearly: 0,
            currency: 'SAR',
            maxListings: 10,
            maxAgents: 2,
            maxMediaPerListing: 5,
            features: {},
            isActive: true,
            sortOrder: 0,
          },
        })
      }

      const now = new Date()
      const trialEnd = new Date(now)
      trialEnd.setDate(trialEnd.getDate() + 14)

      await tx.subscription.create({
        data: {
          officeId: office.id,
          planId: basicPlan.id,
          status: 'TRIALING',
          currentPeriodStart: now,
          currentPeriodEnd: trialEnd,
        },
      })

      return { user, office }
    })

    logAudit({
      officeId: result.office.id,
      userId: result.user.id,
      action: 'user_registered',
      entity: 'User',
      entityId: result.user.id,
      details: {
        phone: result.user.phone,
        officeName: result.office.name,
        officeSlug: result.office.slug,
      },
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
    }).catch(() => {})

    return NextResponse.json(
      {
        success: true,
        message: 'Registration successful',
        data: {
          userId: result.user.id,
          officeId: result.office.id,
          officeSlug: result.office.slug,
          redirectUrl: '/auth/signin?registered=true',
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[Register] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred. Please try again.',
      },
      { status: 500 }
    )
  }
}
