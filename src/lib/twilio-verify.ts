const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN
const TWILIO_VERIFY_SERVICE_SID = process.env.TWILIO_VERIFY_SERVICE_SID

/**
 * Test accounts that bypass real Twilio OTP.
 * Specific test phone numbers always use OTP "123456".
 */
const TEST_OTP = '123456'
const TEST_PHONES = new Set([
  '+966500000001',
  '+966500000002',
  '+966501234567',
  '+966501111111',
  '+966502222222',
  '+966503333333',
  '+966504444444',
  '+966552222001',
  '+966552222002',
  '+966552222003',
  '+966552222004',
])

const hasTwilio = Boolean(
  TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_VERIFY_SERVICE_SID
)

const isTestPhone = (phone: string) => TEST_PHONES.has(phone)

/**
 * Normalize phone numbers to E.164 format.
 * Handles Saudi local formats (05X, 5X) and already-international numbers.
 */
export function normalizePhone(phone: string): string {
  // Strip all non-digit characters except leading +
  let cleaned = phone.replace(/[^\d+]/g, '')

  // Remove leading +
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.slice(1)
  }

  // Saudi local: 05XXXXXXXX → 9665XXXXXXXX
  if (cleaned.startsWith('05') && cleaned.length === 10) {
    cleaned = '966' + cleaned.slice(1)
  }
  // Saudi local: 5XXXXXXXX → 9665XXXXXXXX
  else if (cleaned.startsWith('5') && cleaned.length === 9) {
    cleaned = '966' + cleaned
  }
  // Already international (966, 971, 973, etc.) — leave as-is

  return '+' + cleaned
}

/**
 * Send OTP via Twilio Verify (or mock fallback if credentials not configured)
 */
export async function sendOTP(phone: string): Promise<{ success: boolean; error?: string }> {
  const normalized = normalizePhone(phone)

  // Skip real Twilio for test phones or when Twilio credentials are not set
  if (isTestPhone(normalized) || !hasTwilio) {
    console.log(`[OTP] Mock mode active for ${normalized}. Code is 123456`)
    return { success: true }
  }

  const url = `https://verify.twilio.com/v2/Services/${TWILIO_VERIFY_SERVICE_SID}/Verifications`
  const authHeader = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64')

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${authHeader}`,
      },
      body: new URLSearchParams({
        To: normalized,
        Channel: 'sms',
      }),
    })

    if (!res.ok) {
      const data = await res.json()
      console.error('[Twilio] Send OTP error:', data)
      return { success: false, error: data.message || 'Failed to send OTP' }
    }

    return { success: true }
  } catch (err) {
    console.error('[Twilio] Send OTP fetch error:', err)
    // Fallback to mock on network error
    return { success: true }
  }
}

/**
 * Verify OTP via Twilio Verify (or mock fallback if credentials not configured)
 */
export async function verifyOTP(
  phone: string,
  code: string
): Promise<{ success: boolean; error?: string }> {
  const normalized = normalizePhone(phone)

  // Bypass real Twilio for test phones or when credentials are not set
  if (isTestPhone(normalized) || !hasTwilio) {
    return code === TEST_OTP
      ? { success: true }
      : { success: false, error: 'Invalid or expired code' }
  }

  const url = `https://verify.twilio.com/v2/Services/${TWILIO_VERIFY_SERVICE_SID}/VerificationCheck`
  const authHeader = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64')

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${authHeader}`,
      },
      body: new URLSearchParams({
        To: normalized,
        Code: code,
      }),
    })

    const data = await res.json()

    if (!res.ok || data.status !== 'approved') {
      return { success: false, error: 'Invalid or expired code' }
    }

    return { success: true }
  } catch (err) {
    console.error('[Twilio] Verify OTP fetch error:', err)
    // Fallback to mock check on network error
    return code === TEST_OTP
      ? { success: true }
      : { success: false, error: 'Invalid or expired code' }
  }
}
