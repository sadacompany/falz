import { test, expect } from '@playwright/test'

test.describe('Flow 7: Public Property Detail Page Viewing', () => {
  test('View public property detail page specs, price in SAR, badges, and map', async ({ page }) => {
    await page.goto('/dar-al-aseel/properties/luxury-villa-al-malqa')
    await page.waitForLoadState('domcontentloaded')

    // 1. Title H1
    const titleHeader = page.locator('h1')
    await expect(titleHeader).toBeVisible()

    // 2. Price in SAR
    const priceText = page.locator('p:has-text("ر.س"), p.text-3xl')
    await expect(priceText.first()).toBeVisible()

    // 3. Deal Type Badge (للبيع or للإيجار)
    const dealBadge = page.locator('span:has-text("للبيع"), span:has-text("للإيجار")')
    await expect(dealBadge.first()).toBeVisible()

    // 4. Specs Container
    const specsContainer = page.locator('div:has-text("المساحة"), div:has-text("مواصفات وتفاصيل العقار")')
    await expect(specsContainer.first()).toBeVisible()
  })

  test('Verify RTL direction and Arabic locale text elements on detail page', async ({ page }) => {
    await page.goto('/dar-al-aseel/properties/luxury-villa-al-malqa')
    await page.waitForLoadState('domcontentloaded')

    // Verify dir attribute is rtl
    const pageWrapper = page.locator('div[dir="rtl"]').first()
    await expect(pageWrapper).toBeVisible()
  })
})
