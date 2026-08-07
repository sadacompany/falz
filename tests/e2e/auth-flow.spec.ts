import { test, expect } from '@playwright/test'

test.describe('Flow 1: Office Dashboard Authentication & Navigation', () => {
  test('Dashboard signin happy path with seeded phone +966501111111 and OTP 123456', async ({ page }) => {
    await page.goto('/auth/signin')
    await expect(page.locator('h1')).toContainText('مرحباً بعودتك')

    // Enter seeded office owner phone number
    const phoneInput = page.locator('input#phone')
    await phoneInput.fill('501111111')

    // Click Send OTP
    const sendOtpBtn = page.locator('button:has-text("إرسال رمز التحقق")')
    await sendOtpBtn.click()

    // Expect OTP step to be displayed
    await expect(page.locator('text=تم إرسال الرمز إلى')).toBeVisible()

    // Fill 6-digit OTP fields
    const otpInputs = page.locator('div[dir="ltr"] > input')
    const digits = ['1', '2', '3', '4', '5', '6']
    for (let i = 0; i < 6; i++) {
      await otpInputs.nth(i).fill(digits[i])
    }

    // Verify successful login redirect to dashboard
    await page.waitForURL('**/dashboard**', { timeout: 15000 })
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('Dashboard signin rejection with invalid OTP code', async ({ page }) => {
    await page.goto('/auth/signin')

    const phoneInput = page.locator('input#phone')
    await phoneInput.fill('501111111')

    const sendOtpBtn = page.locator('button:has-text("إرسال رمز التحقق")')
    await sendOtpBtn.click()

    await expect(page.locator('text=تم إرسال الرمز إلى')).toBeVisible()

    // Fill invalid 6-digit OTP fields
    const otpInputs = page.locator('div[dir="ltr"] > input')
    const invalidDigits = ['9', '9', '9', '9', '9', '9']
    for (let i = 0; i < 6; i++) {
      await otpInputs.nth(i).fill(invalidDigits[i])
    }

    // Verify error message is rendered
    const errorAlert = page.locator('#signin-error, div[role="alert"]')
    await expect(errorAlert).toBeVisible({ timeout: 10000 })
    await expect(errorAlert).toContainText('رمز التحقق غير صحيح أو منتهي الصلاحية')
  })

  test('Office dashboard navigation sidebar links', async ({ page }) => {
    // Perform authentication
    await page.goto('/auth/signin')
    await page.locator('input#phone').fill('501111111')
    await page.locator('button:has-text("إرسال رمز التحقق")').click()

    await expect(page.locator('text=تم إرسال الرمز إلى')).toBeVisible()
    const otpInputs = page.locator('div[dir="ltr"] > input')
    for (let i = 0; i < 6; i++) {
      await otpInputs.nth(i).fill(String(i + 1))
    }

    await page.waitForURL('**/dashboard**', { timeout: 15000 })

    // Verify navigation sidebar elements exist
    const nav = page.locator('nav, aside, div:has-text("العقارات")')
    await expect(nav.first()).toBeVisible()
  })
})
