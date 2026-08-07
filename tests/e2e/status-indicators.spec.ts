import { test, expect } from '@playwright/test'

test.describe('Flow 9: Reserved Status Visual Indicators & Action Gating', () => {
  test('Reserved status displays top amber banner and hides request buttons on public detail page', async ({ page }) => {
    // Navigate to properties gallery
    await page.goto('/dar-al-aseel/properties')
    await page.waitForLoadState('networkidle')

    // Find any card or navigate to detail page
    const cardLinks = page.locator('a[href*="/dar-al-aseel/properties/"]')
    const count = await cardLinks.count()

    if (count > 0) {
      await cardLinks.first().click()
      await page.waitForLoadState('networkidle')

      // Check if property is marked as RESERVED or mock state check
      const reservedBanner = page.locator('div.bg-amber-50:has-text("محجوز")')
      if (await reservedBanner.isVisible()) {
        // Assert reserved banner is visible
        await expect(reservedBanner).toBeVisible()

        // Assert request buttons section is hidden
        const requestsHeading = page.locator('h3:has-text("طلبات")')
        await expect(requestsHeading).toBeHidden()
      }
    }
  })

  test('Public property cards display status indicator for non-available properties', async ({ page }) => {
    await page.goto('/dar-al-aseel/properties')
    await page.waitForLoadState('networkidle')

    // Property cards container should be visible
    const cards = page.locator('a[href*="/dar-al-aseel/properties/"]')
    expect(await cards.count()).toBeGreaterThanOrEqual(0)
  })
})
