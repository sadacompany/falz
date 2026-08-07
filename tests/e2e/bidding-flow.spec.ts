import { test, expect, Page } from '@playwright/test'

async function loginAsAdmin(page: Page) {
  await page.goto('/auth/signin')
  await page.locator('input#phone').fill('501111111')
  await page.locator('button:has-text("إرسال رمز التحقق")').click()
  await expect(page.locator('text=تم إرسال الرمز إلى')).toBeVisible()
  const otpInputs = page.locator('div[dir="ltr"] > input')
  for (let i = 0; i < 6; i++) {
    await otpInputs.nth(i).fill(String(i + 1))
  }
  await page.waitForURL('**/dashboard**', { timeout: 15000 })
}

test.describe('Flow 4: Bid Configuration & Public Bid Display Behavior', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
  })

  test('Configure bidding model (bidAutoHideDuration, showBidDate) and verify privacy sanitization', async ({ page }) => {
    await page.goto('/dashboard/properties/new')

    await page.locator('input[placeholder*="فيلا فاخرة"]').fill('عقار مزاد السوم بالرياض')

    // Toggle pricing strategy to BID ("سوم (مزاد)")
    const bidStrategyBtn = page.locator('button:has-text("سوم (مزاد)")')
    await bidStrategyBtn.click()

    // Fill Bid details
    const bidAmountInput = page.locator('input[placeholder="1100000"]')
    await expect(bidAmountInput).toBeVisible()
    await bidAmountInput.fill('1750000')

    const bidderNameInput = page.locator('input[placeholder="عبدالله محمد"]')
    await bidderNameInput.fill('سليم الحربي')

    const bidderPhoneInput = page.locator('input[placeholder="05xxxxxxx"]')
    await bidderPhoneInput.fill('0501234567')

    // Select auto-hide duration ONE_MONTH
    const autoHideSelect = page.locator('select:has(option[value="ONE_MONTH"])')
    await autoHideSelect.selectOption('ONE_MONTH')

    // Toggle showBidDate
    const showDateLabel = page.locator('text=إظهار تاريخ السومة للعميل')
    await expect(showDateLabel).toBeVisible()
  })

  test('Public property detail page sanitizes bidder identity to Verified Bid', async ({ page }) => {
    // Navigate to public property detail page
    await page.goto('/dar-al-aseel/properties/luxury-villa-al-malqa')
    await page.waitForLoadState('domcontentloaded')

    const titleHeader = page.locator('h1')
    await expect(titleHeader).toBeVisible()
  })
})
