import prisma from '@/lib/db'
import type { SubscriptionStatus } from '@prisma/client'

// ─── Plan Feature Definitions ─────────────────────────────────

export interface PlanFeatures {
  customDomain: boolean
  advancedAnalytics: boolean
  basicAnalytics: boolean
  pdfReports: boolean
  csvExport: boolean
  blogEnabled: boolean
  prioritySupport: boolean
  apiAccess: boolean
}

export type FeatureKey = keyof PlanFeatures

export interface PlanDefinition {
  slug: string
  name: string
  maxListings: number
  maxAgents: number
  maxMediaPerListing: number
  priceMonthly: number // in halalas (SAR smallest unit)
  priceYearly: number
  features: PlanFeatures
}

/** Default plan definitions used for seeding and reference */
export const PLAN_DEFINITIONS: Record<string, PlanDefinition> = {
  basic: {
    slug: 'basic',
    name: 'Basic',
    maxListings: 10,
    maxAgents: 2,
    maxMediaPerListing: 5,
    priceMonthly: 0,
    priceYearly: 0,
    features: {
      customDomain: false,
      advancedAnalytics: false,
      basicAnalytics: true,
      pdfReports: false,
      csvExport: false,
      blogEnabled: true,
      prioritySupport: false,
      apiAccess: false,
    },
  },
  pro: {
    slug: 'pro',
    name: 'Pro',
    maxListings: 50,
    maxAgents: 10,
    maxMediaPerListing: 20,
    priceMonthly: 29900, // 299 SAR
    priceYearly: 299900, // 2999 SAR
    features: {
      customDomain: true,
      advancedAnalytics: true,
      basicAnalytics: true,
      pdfReports: true,
      csvExport: true,
      blogEnabled: true,
      prioritySupport: false,
      apiAccess: false,
    },
  },
  enterprise: {
    slug: 'enterprise',
    name: 'Enterprise',
    maxListings: -1, // unlimited
    maxAgents: -1, // unlimited
    maxMediaPerListing: 50,
    priceMonthly: 79900, // 799 SAR
    priceYearly: 799900, // 7999 SAR
    features: {
      customDomain: true,
      advancedAnalytics: true,
      basicAnalytics: true,
      pdfReports: true,
      csvExport: true,
      blogEnabled: true,
      prioritySupport: true,
      apiAccess: true,
    },
  },
}

// ─── Feature Gate Helpers ─────────────────────────────────────

export interface ActivePlan {
  planId: string
  planSlug: string
  planName: string
  subscriptionId: string
  subscriptionStatus: SubscriptionStatus
  maxListings: number
  maxAgents: number
  maxMediaPerListing: number
  features: PlanFeatures
  currentPeriodEnd: Date
}

/**
 * Get the current active plan for an office.
 * Returns the Basic plan defaults if no active subscription exists.
 */
export async function getPlanForOffice(officeId: string): Promise<ActivePlan> {
  const subscription = await prisma.subscription.findFirst({
    where: {
      officeId,
      status: { in: ['ACTIVE', 'TRIALING', 'GRACE_PERIOD'] },
    },
    include: {
      plan: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  if (!subscription) {
    // Return Basic plan defaults when no subscription
    const basicPlan = await prisma.plan.findUnique({
      where: { slug: 'basic' },
    })

    return {
      planId: basicPlan?.id ?? '',
      planSlug: 'basic',
      planName: 'Basic',
      subscriptionId: '',
      subscriptionStatus: 'ACTIVE',
      maxListings: basicPlan?.maxListings ?? PLAN_DEFINITIONS.basic.maxListings,
      maxAgents: basicPlan?.maxAgents ?? PLAN_DEFINITIONS.basic.maxAgents,
      maxMediaPerListing: basicPlan?.maxMediaPerListing ?? PLAN_DEFINITIONS.basic.maxMediaPerListing,
      features: (basicPlan?.features as unknown as PlanFeatures) ?? PLAN_DEFINITIONS.basic.features,
      currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    }
  }

  const plan = subscription.plan
  const features = (plan.features as unknown as PlanFeatures) ?? PLAN_DEFINITIONS[plan.slug]?.features ?? PLAN_DEFINITIONS.basic.features

  return {
    planId: plan.id,
    planSlug: plan.slug,
    planName: plan.name,
    subscriptionId: subscription.id,
    subscriptionStatus: subscription.status,
    maxListings: plan.maxListings,
    maxAgents: plan.maxAgents,
    maxMediaPerListing: plan.maxMediaPerListing,
    features,
    currentPeriodEnd: subscription.currentPeriodEnd,
  }
}

/**
 * Check if an office has access to a specific feature.
 */
export async function checkFeatureAccess(
  officeId: string,
  feature: FeatureKey
): Promise<{ allowed: boolean; planName: string; upgradeRequired: boolean }> {
  const plan = await getPlanForOffice(officeId)
  const allowed = plan.features[feature] === true

  return {
    allowed,
    planName: plan.planName,
    upgradeRequired: !allowed,
  }
}

/**
 * Check if an office can create more listings.
 */
export async function checkListingLimit(
  officeId: string
): Promise<{ allowed: boolean; current: number; max: number; isUnlimited: boolean }> {
  const plan = await getPlanForOffice(officeId)

  // -1 means unlimited
  if (plan.maxListings === -1) {
    const current = await prisma.property.count({
      where: { officeId, status: { not: 'ARCHIVED' } },
    })
    return { allowed: true, current, max: -1, isUnlimited: true }
  }

  const currentListings = await prisma.property.count({
    where: { officeId, status: { not: 'ARCHIVED' } },
  })

  return {
    allowed: currentListings < plan.maxListings,
    current: currentListings,
    max: plan.maxListings,
    isUnlimited: false,
  }
}

/**
 * Check if an office can add more agents.
 */
export async function checkAgentLimit(
  officeId: string
): Promise<{ allowed: boolean; current: number; max: number; isUnlimited: boolean }> {
  const plan = await getPlanForOffice(officeId)

  // -1 means unlimited
  if (plan.maxAgents === -1) {
    const current = await prisma.membership.count({
      where: { officeId, isActive: true },
    })
    return { allowed: true, current, max: -1, isUnlimited: true }
  }

  const currentAgents = await prisma.membership.count({
    where: { officeId, isActive: true },
  })

  return {
    allowed: currentAgents < plan.maxAgents,
    current: currentAgents,
    max: plan.maxAgents,
    isUnlimited: false,
  }
}

// ─── Billing Provider Interface ──────────────────────────────

export interface CheckoutParams {
  officeId: string
  planSlug: string
  billingCycle: 'monthly' | 'yearly'
  userId: string
}

export interface CheckoutResult {
  subscriptionId: string
  invoiceId: string
  paymentUrl?: string // for redirect-based providers
  status: 'active' | 'pending_payment'
}

export interface WebhookPayload {
  provider: string
  eventType: string
  externalId: string
  metadata: Record<string, unknown>
  rawBody: string
}

export interface WebhookResult {
  handled: boolean
  subscriptionId?: string
  action?: string
}

export interface BillingProvider {
  name: string
  createCheckout(params: CheckoutParams): Promise<CheckoutResult>
  handleWebhook(payload: WebhookPayload): Promise<WebhookResult>
  cancelSubscription(subscriptionId: string): Promise<void>
}

// ─── Mock Payment Provider ───────────────────────────────────

class MockBillingProvider implements BillingProvider {
  name = 'mock'

  async createCheckout(params: CheckoutParams): Promise<CheckoutResult> {
    const plan = await prisma.plan.findUnique({
      where: { slug: params.planSlug },
    })

    if (!plan) {
      throw new Error(`Plan not found: ${params.planSlug}`)
    }

    const amount = params.billingCycle === 'yearly' ? plan.priceYearly : plan.priceMonthly

    const now = new Date()
    const periodEnd = new Date(now)
    if (params.billingCycle === 'yearly') {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1)
    } else {
      periodEnd.setMonth(periodEnd.getMonth() + 1)
    }

    // Deactivate any existing active subscriptions
    await prisma.subscription.updateMany({
      where: {
        officeId: params.officeId,
        status: { in: ['ACTIVE', 'TRIALING', 'GRACE_PERIOD'] },
      },
      data: {
        status: 'CANCELLED',
        cancelledAt: now,
      },
    })

    // Create subscription
    const subscription = await prisma.subscription.create({
      data: {
        officeId: params.officeId,
        planId: plan.id,
        status: 'ACTIVE',
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        paymentProvider: 'mock',
        externalId: `mock_sub_${Date.now()}`,
        metadata: {
          billingCycle: params.billingCycle,
          userId: params.userId,
        },
      },
    })

    // Create invoice
    const invoice = await prisma.invoice.create({
      data: {
        subscriptionId: subscription.id,
        officeId: params.officeId,
        amount,
        currency: plan.currency,
        status: 'PAID',
        paidAt: now,
        externalId: `mock_inv_${Date.now()}`,
        metadata: {
          planName: plan.name,
          billingCycle: params.billingCycle,
        },
      },
    })

    return {
      subscriptionId: subscription.id,
      invoiceId: invoice.id,
      status: 'active',
    }
  }

  async handleWebhook(payload: WebhookPayload): Promise<WebhookResult> {
    // Mock webhook: just acknowledge receipt
    const { eventType, externalId } = payload

    if (eventType === 'payment.success') {
      const subscription = await prisma.subscription.findFirst({
        where: { externalId },
      })

      if (subscription) {
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: { status: 'ACTIVE' },
        })

        return {
          handled: true,
          subscriptionId: subscription.id,
          action: 'subscription_activated',
        }
      }
    }

    if (eventType === 'payment.failed') {
      const subscription = await prisma.subscription.findFirst({
        where: { externalId },
      })

      if (subscription) {
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: { status: 'PAST_DUE' },
        })

        return {
          handled: true,
          subscriptionId: subscription.id,
          action: 'subscription_past_due',
        }
      }
    }

    return { handled: false }
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
    })

    if (!subscription) {
      throw new Error('Subscription not found')
    }

    // Set grace period (7 days after cancellation)
    const gracePeriodEnd = new Date()
    gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 7)

    await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: 'GRACE_PERIOD',
        cancelledAt: new Date(),
        gracePeriodEnd: gracePeriodEnd > subscription.currentPeriodEnd
          ? subscription.currentPeriodEnd
          : gracePeriodEnd,
      },
    })
  }
}

// ─── Moyasar Payment Provider Stub ───────────────────────────

class MoyasarBillingProvider implements BillingProvider {
  name = 'moyasar'

  private get apiKey(): string {
    const key = process.env.MOYASAR_SECRET_KEY
    if (!key) throw new Error('MOYASAR_SECRET_KEY environment variable is not set')
    return key
  }

  private get publishableKey(): string {
    const key = process.env.MOYASAR_PUBLISHABLE_KEY
    if (!key) throw new Error('MOYASAR_PUBLISHABLE_KEY environment variable is not set')
    return key
  }

  async createCheckout(params: CheckoutParams): Promise<CheckoutResult> {
    // Validate environment
    this.apiKey
    this.publishableKey

    const plan = await prisma.plan.findUnique({
      where: { slug: params.planSlug },
    })

    if (!plan) {
      throw new Error(`Plan not found: ${params.planSlug}`)
    }

    const amount = params.billingCycle === 'yearly' ? plan.priceYearly : plan.priceMonthly
    const now = new Date()
    const periodEnd = new Date(now)
    if (params.billingCycle === 'yearly') {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1)
    } else {
      periodEnd.setMonth(periodEnd.getMonth() + 1)
    }

    // Create pending subscription
    const subscription = await prisma.subscription.create({
      data: {
        officeId: params.officeId,
        planId: plan.id,
        status: 'TRIALING',
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        paymentProvider: 'moyasar',
        metadata: {
          billingCycle: params.billingCycle,
          userId: params.userId,
        },
      },
    })

    // Create pending invoice
    const invoice = await prisma.invoice.create({
      data: {
        subscriptionId: subscription.id,
        officeId: params.officeId,
        amount,
        currency: plan.currency,
        status: 'PENDING',
        metadata: {
          planName: plan.name,
          billingCycle: params.billingCycle,
        },
      },
    })

    // TODO: Integrate with Moyasar Payment API
    // const moyasarPayment = await fetch('https://api.moyasar.com/v1/payments', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Basic ${Buffer.from(this.apiKey + ':').toString('base64')}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     amount,
    //     currency: plan.currency,
    //     description: `FALZ ${plan.name} Plan - ${params.billingCycle}`,
    //     callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/billing/webhook`,
    //     metadata: {
    //       subscriptionId: subscription.id,
    //       invoiceId: invoice.id,
    //       officeId: params.officeId,
    //     },
    //   }),
    // })

    return {
      subscriptionId: subscription.id,
      invoiceId: invoice.id,
      // paymentUrl: moyasarPayment.source?.transaction_url,
      status: 'pending_payment',
    }
  }

  async handleWebhook(payload: WebhookPayload): Promise<WebhookResult> {
    // Validate environment
    this.apiKey

    // TODO: Verify Moyasar webhook signature
    // TODO: Process payment callback

    const { eventType, metadata } = payload
    const subscriptionId = (metadata.subscriptionId as string) || ''

    if (eventType === 'payment_paid') {
      if (subscriptionId) {
        // Deactivate old subscriptions for this office
        const subscription = await prisma.subscription.findUnique({
          where: { id: subscriptionId },
        })

        if (subscription) {
          await prisma.subscription.updateMany({
            where: {
              officeId: subscription.officeId,
              status: { in: ['ACTIVE', 'TRIALING', 'GRACE_PERIOD'] },
              id: { not: subscriptionId },
            },
            data: {
              status: 'CANCELLED',
              cancelledAt: new Date(),
            },
          })

          await prisma.subscription.update({
            where: { id: subscriptionId },
            data: { status: 'ACTIVE' },
          })

          // Update invoice
          const invoiceId = (metadata.invoiceId as string) || ''
          if (invoiceId) {
            await prisma.invoice.update({
              where: { id: invoiceId },
              data: { status: 'PAID', paidAt: new Date() },
            })
          }

          return {
            handled: true,
            subscriptionId,
            action: 'subscription_activated',
          }
        }
      }
    }

    if (eventType === 'payment_failed') {
      if (subscriptionId) {
        await prisma.subscription.update({
          where: { id: subscriptionId },
          data: { status: 'PAST_DUE' },
        })

        return {
          handled: true,
          subscriptionId,
          action: 'payment_failed',
        }
      }
    }

    return { handled: false }
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    // Validate environment
    this.apiKey

    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
    })

    if (!subscription) {
      throw new Error('Subscription not found')
    }

    // TODO: Cancel recurring payment at Moyasar

    await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
      },
    })
  }
}

// ─── Stripe Payment Provider Stub ────────────────────────────

class StripeBillingProvider implements BillingProvider {
  name = 'stripe'

  private get secretKey(): string {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) throw new Error('STRIPE_SECRET_KEY environment variable is not set')
    return key
  }

  private get webhookSecret(): string {
    const key = process.env.STRIPE_WEBHOOK_SECRET
    if (!key) throw new Error('STRIPE_WEBHOOK_SECRET environment variable is not set')
    return key
  }

  async createCheckout(params: CheckoutParams): Promise<CheckoutResult> {
    // Validate environment
    this.secretKey

    const plan = await prisma.plan.findUnique({
      where: { slug: params.planSlug },
    })

    if (!plan) {
      throw new Error(`Plan not found: ${params.planSlug}`)
    }

    const amount = params.billingCycle === 'yearly' ? plan.priceYearly : plan.priceMonthly
    const now = new Date()
    const periodEnd = new Date(now)
    if (params.billingCycle === 'yearly') {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1)
    } else {
      periodEnd.setMonth(periodEnd.getMonth() + 1)
    }

    // Create pending subscription
    const subscription = await prisma.subscription.create({
      data: {
        officeId: params.officeId,
        planId: plan.id,
        status: 'TRIALING',
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        paymentProvider: 'stripe',
        metadata: {
          billingCycle: params.billingCycle,
          userId: params.userId,
        },
      },
    })

    // Create pending invoice
    const invoice = await prisma.invoice.create({
      data: {
        subscriptionId: subscription.id,
        officeId: params.officeId,
        amount,
        currency: plan.currency,
        status: 'PENDING',
        metadata: {
          planName: plan.name,
          billingCycle: params.billingCycle,
        },
      },
    })

    // TODO: Integrate with Stripe Checkout Sessions API
    // const stripe = new Stripe(this.secretKey)
    // const session = await stripe.checkout.sessions.create({
    //   mode: 'subscription',
    //   line_items: [{
    //     price: plan.metadata?.stripePriceId,
    //     quantity: 1,
    //   }],
    //   success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?success=true`,
    //   cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?cancelled=true`,
    //   metadata: {
    //     subscriptionId: subscription.id,
    //     invoiceId: invoice.id,
    //     officeId: params.officeId,
    //   },
    // })

    return {
      subscriptionId: subscription.id,
      invoiceId: invoice.id,
      // paymentUrl: session.url,
      status: 'pending_payment',
    }
  }

  async handleWebhook(payload: WebhookPayload): Promise<WebhookResult> {
    // Validate environment
    this.secretKey
    this.webhookSecret

    // TODO: Verify Stripe webhook signature
    // const event = stripe.webhooks.constructEvent(payload.rawBody, sig, this.webhookSecret)

    const { eventType, metadata } = payload
    const subscriptionId = (metadata.subscriptionId as string) || ''

    if (eventType === 'checkout.session.completed') {
      if (subscriptionId) {
        const subscription = await prisma.subscription.findUnique({
          where: { id: subscriptionId },
        })

        if (subscription) {
          await prisma.subscription.updateMany({
            where: {
              officeId: subscription.officeId,
              status: { in: ['ACTIVE', 'TRIALING', 'GRACE_PERIOD'] },
              id: { not: subscriptionId },
            },
            data: {
              status: 'CANCELLED',
              cancelledAt: new Date(),
            },
          })

          await prisma.subscription.update({
            where: { id: subscriptionId },
            data: {
              status: 'ACTIVE',
              externalId: (metadata.stripeSubscriptionId as string) || undefined,
            },
          })

          const invoiceId = (metadata.invoiceId as string) || ''
          if (invoiceId) {
            await prisma.invoice.update({
              where: { id: invoiceId },
              data: { status: 'PAID', paidAt: new Date() },
            })
          }

          return {
            handled: true,
            subscriptionId,
            action: 'subscription_activated',
          }
        }
      }
    }

    if (eventType === 'invoice.payment_failed') {
      if (subscriptionId) {
        await prisma.subscription.update({
          where: { id: subscriptionId },
          data: { status: 'PAST_DUE' },
        })

        return {
          handled: true,
          subscriptionId,
          action: 'payment_failed',
        }
      }
    }

    if (eventType === 'customer.subscription.deleted') {
      if (subscriptionId) {
        await prisma.subscription.update({
          where: { id: subscriptionId },
          data: {
            status: 'CANCELLED',
            cancelledAt: new Date(),
          },
        })

        return {
          handled: true,
          subscriptionId,
          action: 'subscription_cancelled',
        }
      }
    }

    return { handled: false }
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    this.secretKey

    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
    })

    if (!subscription) {
      throw new Error('Subscription not found')
    }

    // TODO: Cancel at Stripe
    // const stripe = new Stripe(this.secretKey)
    // if (subscription.externalId) {
    //   await stripe.subscriptions.cancel(subscription.externalId)
    // }

    await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
      },
    })
  }
}

// ─── Factory Function ────────────────────────────────────────

const providers: Record<string, BillingProvider> = {
  mock: new MockBillingProvider(),
  moyasar: new MoyasarBillingProvider(),
  stripe: new StripeBillingProvider(),
}

/**
 * Get the active billing provider based on environment configuration.
 * Falls back to mock provider if no payment provider is configured.
 */
export function getBillingProvider(): BillingProvider {
  const providerName = process.env.BILLING_PROVIDER || 'mock'

  // Check if the requested provider's environment vars are set
  if (providerName === 'moyasar') {
    if (process.env.MOYASAR_SECRET_KEY && process.env.MOYASAR_PUBLISHABLE_KEY) {
      return providers.moyasar
    }
    console.warn('Moyasar env vars not set, falling back to mock provider')
    return providers.mock
  }

  if (providerName === 'stripe') {
    if (process.env.STRIPE_SECRET_KEY) {
      return providers.stripe
    }
    console.warn('Stripe env vars not set, falling back to mock provider')
    return providers.mock
  }

  return providers.mock
}

// ─── Billing Usage Helpers ───────────────────────────────────

/**
 * Get complete billing usage data for an office (used in billing dashboard).
 */
export async function getBillingUsage(officeId: string) {
  const [plan, listingLimit, agentLimit, invoices] = await Promise.all([
    getPlanForOffice(officeId),
    checkListingLimit(officeId),
    checkAgentLimit(officeId),
    prisma.invoice.findMany({
      where: { officeId },
      include: {
        subscription: {
          include: { plan: { select: { name: true, slug: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
  ])

  return {
    plan,
    listings: listingLimit,
    agents: agentLimit,
    invoices: invoices.map((inv) => ({
      id: inv.id,
      amount: inv.amount,
      currency: inv.currency,
      status: inv.status,
      paidAt: inv.paidAt,
      createdAt: inv.createdAt,
      planName: inv.subscription.plan.name,
      planSlug: inv.subscription.plan.slug,
      invoiceUrl: inv.invoiceUrl,
    })),
  }
}
