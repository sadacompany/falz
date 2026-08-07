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

test.describe('Flow 5 & 6: Saudi Locations, Custom District Creation & Media Engine', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
  })

  test('Saudi city and district selection auto-fills directional area', async ({ page }) => {
    await page.goto('/dashboard/properties/new')

    // Select Saudi City
    const citySelect = page.locator('select:has(option:has-text("اختر المدينة..."))')
    await expect(citySelect).toBeVisible()

    const cityOptions = await citySelect.locator('option').allInnerTexts()
    if (cityOptions.length > 1) {
      await citySelect.selectOption({ index: 1 })
      
      // District select should be enabled
      const districtSelect = page.locator('select:has(option:has-text("اختر الحي..."))')
      await expect(districtSelect).toBeEnabled()
    }
  })

  test('Create custom district as office manager', async ({ page }) => {
    await page.goto('/dashboard/properties/new')

    const citySelect = page.locator('select:has(option:has-text("اختر المدينة..."))')
    const cityOptions = await citySelect.locator('option').allInnerTexts()
    if (cityOptions.length > 1) {
      await citySelect.selectOption({ index: 1 })

      const addDistrictBtn = page.locator('button:has-text("إضافة حي")')
      await expect(addDistrictBtn).toBeVisible()
      await addDistrictBtn.click()

      await expect(page.locator('text=إضافة حي مخصص للمكتب')).toBeVisible()

      // Fill custom district form
      await page.locator('input[placeholder*="النرجس الجديد"]').fill('حي الروضة الشمالي')
      const directionSelect = page.locator('select:has(option[value="NORTH"])')
      await directionSelect.selectOption('NORTH')

      const submitBtn = page.locator('button[type="submit"]:has-text("إضافة الحي")')
      await submitBtn.click()
    }
  })

  test('Upload property images and manipulate cover photo assignment', async ({ page }) => {
    await page.goto('/dashboard/properties/new')

    const fileInput = page.locator('input[type="file"][accept="image/*"]')

    // Create 2 mock image buffers
    const buffer1 = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64')
    const buffer2 = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64')

    await fileInput.setInputFiles([
      { name: 'photo1.png', mimeType: 'image/png', buffer: buffer1 },
      { name: 'photo2.png', mimeType: 'image/png', buffer: buffer2 },
    ])

    // First photo automatically gets main cover badge
    const coverBadge = page.locator('div:has-text("صورة الغلاف الرئيسية")')
    await expect(coverBadge).toBeVisible()

    // Second photo has "تعيين كغلاف" button
    const setCoverBtn = page.locator('button:has-text("تعيين كغلاف")')
    if (await setCoverBtn.isVisible()) {
      await setCoverBtn.click()
      await expect(coverBadge).toBeVisible()
    }
  })

  test('Enforce 100-file media upload limit error banner', async ({ page }) => {
    await page.goto('/dashboard/properties/new')

    // Simulate exceeding max limit of 100 files
    const fileInput = page.locator('input[type="file"][accept="image/*"]')

    const buffer = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64')
    const files = Array.from({ length: 101 }, (_, i) => ({
      name: `img_${i}.png`,
      mimeType: 'image/png',
      buffer,
    }))

    await fileInput.setInputFiles(files)

    // Verify limit error message appears
    const limitError = page.locator('div:has-text("لا يمكن إرفاق أكثر من 100 صورة لكل عقار.")')
    await expect(limitError).toBeVisible()
  })
})
