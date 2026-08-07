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

test.describe('Flow 3: REGA Owner Creation & Mandatory Compliance Validation', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
  })

  test('Create REGA owner with valid nationalId and dob', async ({ page }) => {
    await page.goto('/dashboard/properties/new')

    // Open owner creation modal
    const openModalBtn = page.locator('button:has-text("+ إضافة مالك جديد")')
    await openModalBtn.click()

    await expect(page.locator('text=إضافة مالك جديد وعضو CRM')).toBeVisible()

    // Fill valid owner details
    await page.locator('input[placeholder="الاسم الكامل"]').fill('سليمان عبدالمحسن')
    await page.locator('input[placeholder="05xxxxxxxx"]').fill('0501119988')
    await page.locator('input[placeholder="1xxxxxxxx"]').fill('1098765432')
    await page.locator('input[type="date"]').fill('1985-06-15')

    // Submit modal form
    const saveOwnerBtn = page.locator('button[type="submit"]:has-text("إضافة وحفظ")')
    await saveOwnerBtn.click()

    // Modal should close
    await expect(page.locator('text=إضافة مالك جديد وعضو CRM')).toBeHidden({ timeout: 5000 })
  })

  test('REGA owner creation validation error when missing nationalId or dob', async ({ page }) => {
    await page.goto('/dashboard/properties/new')

    const openModalBtn = page.locator('button:has-text("+ إضافة مالك جديد")')
    await openModalBtn.click()

    await expect(page.locator('text=إضافة مالك جديد وعضو CRM')).toBeVisible()

    // Fill only name and phone, leave nationalId and dob empty
    await page.locator('input[placeholder="الاسم الكامل"]').fill('مالك بدون هوية')
    await page.locator('input[placeholder="05xxxxxxxx"]').fill('0509990000')

    // Bypass HTML5 native browser validation if present so backend/react-state validation handles it
    await page.evaluate(() => {
      const form = document.querySelector('form')
      if (form) form.noValidate = true
    })

    const saveOwnerBtn = page.locator('button[type="submit"]:has-text("إضافة وحفظ")')
    await saveOwnerBtn.click()

    // Assert exact REGA compliance error message is displayed
    const errorAlert = page.locator('div:has-text("رقم الهوية وتاريخ الميلاد إجباريان لبلاغات الهيئة العامة للعقار (REGA)")')
    await expect(errorAlert.first()).toBeVisible()
  })
})
