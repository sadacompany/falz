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

test.describe('Flow 2: Creating Property Listings with All Field Types', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
  })

  test('Create SALE Villa property listing with full basic & technical specifications', async ({ page }) => {
    await page.goto('/dashboard/properties/new')
    await expect(page.locator('h1')).toContainText('إضافة عقار جديد')

    // Property Title
    await page.locator('input[placeholder*="فيلا فاخرة"]').fill('فيلا فاخرة للبيع بحي الياسمين بالرياض')

    // Category Select (RESIDENTIAL)
    const categorySelect = page.locator('select').nth(1)
    await categorySelect.selectOption('RESIDENTIAL')

    // Pricing & Deal Type (SALE)
    const saleBtn = page.locator('button:has-text("بيع")')
    await saleBtn.click()

    const priceInput = page.locator('input[placeholder="1200000"]')
    await priceInput.fill('2500000')

    // Specs
    await page.locator('input[placeholder="350"]').fill('450') // Area
    await page.locator('input[placeholder="5"]').fill('5') // Bedrooms
    await page.locator('input[placeholder="2"]').fill('2') // Master Bedrooms
    await page.locator('input[placeholder="6"]').fill('4') // Bathrooms (>= masterBedrooms)

    // Deed Number
    await page.locator('input[placeholder="أدخل رقم الصك"]').fill('9988776655')

    // Save as Draft button
    const saveDraftBtn = page.locator('button:has-text("حفظ كمسودة")')
    await expect(saveDraftBtn).toBeVisible()
  })

  test('Create RENT Apartment listing with entry type and floor number', async ({ page }) => {
    await page.goto('/dashboard/properties/new')

    await page.locator('input[placeholder*="فيلا فاخرة"]').fill('شقة متميزة للإيجار بحي الملقا')

    // Deal Type RENT
    const rentBtn = page.locator('button:has-text("إيجار")')
    await rentBtn.click()

    // Select Subtype Apartment if options exist
    const subtypeSelect = page.locator('select').nth(2)
    const options = await subtypeSelect.locator('option').allInnerTexts()
    const apartmentOpt = options.find(opt => opt.includes('شقة'))
    if (apartmentOpt) {
      await subtypeSelect.selectOption({ label: apartmentOpt })
      // Check entry type selector visibility
      const entryTypeSelect = page.locator('select:has(option[value="PRIVATE"])')
      if (await entryTypeSelect.isVisible()) {
        await entryTypeSelect.selectOption('PRIVATE')
      }
    }

    await page.locator('input[placeholder="1200000"]').fill('45000')
    await page.locator('input[placeholder="350"]').fill('180')
  })

  test('Create LAND property listing (building specs dynamically hidden)', async ({ page }) => {
    await page.goto('/dashboard/properties/new')

    await page.locator('input[placeholder*="فيلا فاخرة"]').fill('أرض سكنية تجارية ممتازة')

    // Select AGRICULTURAL or Land subtype
    const categorySelect = page.locator('select').nth(1)
    await categorySelect.selectOption('AGRICULTURAL')

    // Building specs (bedrooms, builtArea) should be hidden for Land/Agricultural
    const bedroomsInput = page.locator('input[placeholder="5"]')
    await expect(bedroomsInput).toBeHidden()

    await page.locator('input[placeholder="1200000"]').fill('1200000')
    await page.locator('input[placeholder="350"]').fill('1000')
  })

  test('Reject listing creation when bathrooms < masterBedrooms', async ({ page }) => {
    await page.goto('/dashboard/properties/new')

    await page.locator('input[placeholder*="فيلا فاخرة"]').fill('عقار جديد للاختبار')
    await page.locator('input[placeholder="1200000"]').fill('1500000')

    // Fill masterBedrooms = 3, bathrooms = 1 (violates bathrooms >= masterBedrooms)
    await page.locator('input[placeholder="2"]').fill('3')
    await page.locator('input[placeholder="6"]').fill('1')

    // Click Save Draft
    const saveDraftBtn = page.locator('button:has-text("حفظ كمسودة")')
    await saveDraftBtn.click()

    // Assert validation error message appears
    const errorContainer = page.locator('div:has-text("عدد دورات المياه يجب أن يكون مساويًا أو أكبر من عدد غرف النوم الماستر")')
    await expect(errorContainer.first()).toBeVisible()
  })
})
