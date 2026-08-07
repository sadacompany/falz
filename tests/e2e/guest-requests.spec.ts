import { test, expect } from '@playwright/test'

test.describe('Flow 8: Guest Property Request Submission Flow', () => {
  test('Submit guest viewing request successfully and verify confirmation message', async ({ page }) => {
    await page.goto('/dar-al-aseel/properties')
    await page.waitForLoadState('networkidle')

    const firstCard = page.locator('a[href*="/dar-al-aseel/properties/"]').first()
    await firstCard.click()
    await page.waitForLoadState('networkidle')

    // Find Request button ("حجز معاينة" or "أبدي اهتمامي")
    const viewingBtn = page.locator('button:has-text("حجز معاينة"), button:has-text("أبدي اهتمامي")').first()
    if (await viewingBtn.isVisible()) {
      await viewingBtn.click()

      // Modal opens
      await expect(page.locator('h3:has-text("حجز معاينة"), h3:has-text("إبداء اهتمام")')).toBeVisible()

      // Fill Guest Details
      const nameInput = page.locator('input[placeholder="أدخل اسمك الكريم"]')
      const phoneInput = page.locator('input[placeholder="05xxxxxxxx"]')
      const msgInput = page.locator('textarea[placeholder="اكتب رسالتك هنا..."]')

      await nameInput.fill('فهد العتيبي')
      await phoneInput.fill('0551122334')
      await msgInput.fill('يرجى التنسيق لمعاينة العقار نهاية الأسبوع')

      // Submit Request
      const submitBtn = page.locator('button[type="submit"]:has-text("إرسال الطلب")')
      await submitBtn.click()

      // Assert exact success message
      const successMsg = page.locator('p:has-text("تم إرسال طلبك بنجاح وسيتواصل معك الفريق قريبًا!")')
      await expect(successMsg).toBeVisible({ timeout: 10000 })
    }
  })

  test('Reject guest request submission when missing mandatory name or phone', async ({ page }) => {
    await page.goto('/dar-al-aseel/properties')
    await page.waitForLoadState('networkidle')

    const firstCard = page.locator('a[href*="/dar-al-aseel/properties/"]').first()
    await firstCard.click()
    await page.waitForLoadState('networkidle')

    const interestBtn = page.locator('button:has-text("أبدي اهتمامي")').first()
    if (await interestBtn.isVisible()) {
      await interestBtn.click()

      await expect(page.locator('h3:has-text("إبداء اهتمام")')).toBeVisible()

      // Bypass HTML5 native browser validation if present so backend/react-state validation handles it
      await page.evaluate(() => {
        const form = document.querySelector('form')
        if (form) form.noValidate = true
      })

      // Submit empty form
      const submitBtn = page.locator('button[type="submit"]:has-text("إرسال الطلب")')
      await submitBtn.click()

      // Assert error message displayed
      const errorMsg = page.locator('p:has-text("الاسم ورقم الجوال مطلوبان لإرسال الطلب")')
      await expect(errorMsg).toBeVisible()
    }
  })
})
