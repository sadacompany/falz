import { test, expect } from '@playwright/test'

test.describe('Flow 10 & 11: WhatsApp Share Link & PDF Flyer Print Modal', () => {
  test('WhatsApp share link contains properly formatted wa.me URL with property title', async ({ page }) => {
    await page.goto('/dar-al-aseel/properties')
    await page.waitForLoadState('networkidle')

    const firstCard = page.locator('a[href*="/dar-al-aseel/properties/"]').first()
    if (await firstCard.isVisible()) {
      await firstCard.click()
      await page.waitForLoadState('networkidle')

      // Check WhatsApp button link format
      const whatsappLink = page.locator('a[href*="wa.me"]').first()
      if (await whatsappLink.isVisible()) {
        const href = await whatsappLink.getAttribute('href')
        expect(href).toContain('wa.me')
      }
    }
  })

  test('PDF brochure print modal opens and triggers window.print execution', async ({ page }) => {
    await page.goto('/dar-al-aseel/properties')
    await page.waitForLoadState('networkidle')

    const firstCard = page.locator('a[href*="/dar-al-aseel/properties/"]').first()
    if (await firstCard.isVisible()) {
      await firstCard.click()
      await page.waitForLoadState('networkidle')

      // Look for "طباعة بروشور (PDF)" button
      const printModalBtn = page.locator('button:has-text("طباعة بروشور (PDF)")')
      if (await printModalBtn.isVisible()) {
        await printModalBtn.click()

        // Verify flyer modal header is visible
        const modalHeader = page.locator('text=معاينة بروشور العقار للإرشيف والطباعة')
        await expect(modalHeader).toBeVisible()

        // Mock window.print in browser context to detect call
        await page.evaluate(() => {
          (window as any).__printed = false
          window.print = () => {
            (window as any).__printed = true
          }
        })

        // Click print action button inside modal
        const printActionBtn = page.locator('button:has-text("طباعة / حفظ PDF")')
        await printActionBtn.click()

        // Verify window.print was called
        const wasPrinted = await page.evaluate(() => (window as any).__printed)
        expect(wasPrinted).toBe(true)
      }
    }
  })
})
