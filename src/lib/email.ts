import type { EmailPayload, InvitationEmailData, LeadNotificationEmailData } from '@/types'

// ─── Email Provider Interface ───────────────────────────────

export interface EmailProvider {
  /**
   * Send an email.
   */
  send(to: string, subject: string, html: string): Promise<void>
}

// ─── Console Email Provider (Development) ───────────────────

export class ConsoleEmailProvider implements EmailProvider {
  async send(to: string, subject: string, html: string): Promise<void> {
    console.log('─── Email Sent (Console Provider) ───')
    console.log(`To:      ${to}`)
    console.log(`Subject: ${subject}`)
    console.log(`HTML:    ${html.substring(0, 300)}...`)
    console.log('────────────────────────────────────────')
  }
}

// ─── SMTP Email Provider (stub) ─────────────────────────────

export class SmtpEmailProvider implements EmailProvider {
  private host: string
  private port: number
  private user: string
  private pass: string
  private from: string

  constructor() {
    this.host = process.env.SMTP_HOST || ''
    this.port = parseInt(process.env.SMTP_PORT || '587', 10)
    this.user = process.env.SMTP_USER || ''
    this.pass = process.env.SMTP_PASS || ''
    this.from = process.env.SMTP_FROM || 'noreply@falz.sa'

    if (!this.host) {
      throw new Error('SMTP_HOST environment variable is required')
    }
  }

  async send(to: string, subject: string, html: string): Promise<void> {
    // TODO: Implement actual SMTP sending using nodemailer
    // const nodemailer = await import('nodemailer')
    // const transporter = nodemailer.createTransport({
    //   host: this.host,
    //   port: this.port,
    //   secure: this.port === 465,
    //   auth: {
    //     user: this.user,
    //     pass: this.pass,
    //   },
    // })
    // await transporter.sendMail({
    //   from: this.from,
    //   to,
    //   subject,
    //   html,
    // })

    console.warn(`[SmtpEmailProvider] send() is a stub. Email not actually sent to: ${to}, subject: "${subject}", from: ${this.from}`)
    console.warn(`HTML length: ${html.length}`)
  }
}

// ─── Factory ────────────────────────────────────────────────

let emailInstance: EmailProvider | null = null

/**
 * Get the email provider based on environment configuration.
 * Returns a singleton instance.
 */
export function getEmailProvider(): EmailProvider {
  if (emailInstance) return emailInstance

  const provider = process.env.EMAIL_PROVIDER || 'console'

  switch (provider) {
    case 'smtp':
      emailInstance = new SmtpEmailProvider()
      break
    case 'console':
    default:
      emailInstance = new ConsoleEmailProvider()
      break
  }

  return emailInstance
}

// ─── Helper: Send Raw Email ─────────────────────────────────

export async function sendEmail(payload: EmailPayload): Promise<void> {
  const provider = getEmailProvider()
  await provider.send(payload.to, payload.subject, payload.html)
}

// ─── Helper: Send Invitation Email ──────────────────────────

export async function sendInvitationEmail(data: InvitationEmailData): Promise<void> {
  const { recipientEmail, officeName, inviterName, role, inviteUrl } = data

  const subject = `You've been invited to join ${officeName} on Falz`

  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #1a1a2e;">You're Invited!</h2>
      <p>Hi there,</p>
      <p>
        <strong>${inviterName}</strong> has invited you to join
        <strong>${officeName}</strong> as a <strong>${role.toLowerCase()}</strong> on the Falz platform.
      </p>
      <p>Click the button below to accept the invitation and set up your account:</p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${inviteUrl}"
           style="background-color: #1a1a2e; color: #c9a84c; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
          Accept Invitation
        </a>
      </div>
      <p style="color: #666; font-size: 14px;">
        This invitation link will expire in 7 days. If you did not expect this email, you can safely ignore it.
      </p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
      <p style="color: #999; font-size: 12px;">Falz - Real Estate Management Platform</p>
    </div>
  `

  await sendEmail({ to: recipientEmail, subject, html })
}

// ─── Helper: Send Lead Notification Email ───────────────────

export async function sendLeadNotificationEmail(data: LeadNotificationEmailData): Promise<void> {
  const {
    agentEmail,
    agentName,
    leadName,
    leadPhone,
    leadEmail,
    leadMessage,
    propertyTitle,
    officeName,
    dashboardUrl,
  } = data

  const subject = `New Lead: ${leadName}${propertyTitle ? ` - ${propertyTitle}` : ''}`

  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #1a1a2e;">New Lead Received</h2>
      <p>Hi ${agentName},</p>
      <p>A new lead has been submitted for <strong>${officeName}</strong>.</p>
      <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
        <tr>
          <td style="padding: 8px 12px; border: 1px solid #eee; font-weight: 600; width: 120px;">Name</td>
          <td style="padding: 8px 12px; border: 1px solid #eee;">${leadName}</td>
        </tr>
        ${leadPhone ? `
        <tr>
          <td style="padding: 8px 12px; border: 1px solid #eee; font-weight: 600;">Phone</td>
          <td style="padding: 8px 12px; border: 1px solid #eee;">${leadPhone}</td>
        </tr>` : ''}
        ${leadEmail ? `
        <tr>
          <td style="padding: 8px 12px; border: 1px solid #eee; font-weight: 600;">Email</td>
          <td style="padding: 8px 12px; border: 1px solid #eee;">${leadEmail}</td>
        </tr>` : ''}
        ${propertyTitle ? `
        <tr>
          <td style="padding: 8px 12px; border: 1px solid #eee; font-weight: 600;">Property</td>
          <td style="padding: 8px 12px; border: 1px solid #eee;">${propertyTitle}</td>
        </tr>` : ''}
      </table>
      ${leadMessage ? `
      <div style="background-color: #f9f9f9; border-left: 4px solid #c9a84c; padding: 12px 16px; margin: 16px 0;">
        <p style="margin: 0; color: #333;">${leadMessage}</p>
      </div>` : ''}
      <div style="text-align: center; margin: 32px 0;">
        <a href="${dashboardUrl}"
           style="background-color: #1a1a2e; color: #c9a84c; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
          View in Dashboard
        </a>
      </div>
      <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
      <p style="color: #999; font-size: 12px;">Falz - Real Estate Management Platform</p>
    </div>
  `

  await sendEmail({ to: agentEmail, subject, html })
}
