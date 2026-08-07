# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: locations-media.spec.ts >> Flow 5 & 6: Saudi Locations, Custom District Creation & Media Engine >> Saudi city and district selection auto-fills directional area
- Location: tests\e2e\locations-media.spec.ts:24:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('select:has(option:has-text("اختر المدينة..."))')
Expected: visible
Timeout: 15000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 15000ms
  - waiting for locator('select:has(option:has-text("اختر المدينة..."))')

```

```yaml
- complementary:
  - img "FALZ"
  - text: FALZ مشرف
  - paragraph: FALZ Admin
  - paragraph: المشرف العام
  - navigation:
    - list:
      - listitem:
        - link "لوحة التحكم":
          - /url: /admin
      - listitem:
        - link "المكاتب":
          - /url: /admin/offices
      - listitem:
        - link "المستخدمين":
          - /url: /admin/users
      - listitem:
        - link "الخطط":
          - /url: /admin/plans
      - listitem:
        - link "الرسائل":
          - /url: /admin/messages
      - listitem:
        - link "سجل المراجعة":
          - /url: /admin/audit
  - link "العودة للوحة التحكم":
    - /url: /dashboard
  - button "طي القائمة": طي
- banner:
  - heading "إدارة المنصة" [level=2]
  - button "تفعيل الوضع الفاتح":
    - img
  - paragraph: FALZ Admin
  - paragraph: admin@falz.sa
  - button "تسجيل الخروج"
- main:
  - heading "لوحة تحكم المنصة" [level=1]
  - paragraph: نظرة عامة على المنصة والإحصائيات.
  - paragraph: إجمالي المكاتب
  - paragraph: "2"
  - paragraph: إجمالي المستخدمين
  - paragraph: "10"
  - paragraph: إجمالي العقارات
  - paragraph: "9"
  - paragraph: إجمالي العملاء
  - paragraph: "10"
  - text: توزيع الاشتراكات أساسي 1 50.0% احترافي 1 50.0% مؤسسي 0 0.0% إحصائيات الإيرادات
  - paragraph: إجمالي الإيرادات
  - paragraph: 0.00 ر.س
  - paragraph: هذا الشهر
  - paragraph: 0.00 ر.س
  - paragraph: الفواتير المدفوعة
  - paragraph: "0"
  - paragraph: الفواتير المعلقة
  - paragraph: "0"
  - text: التسجيلات الأخيرة
  - table:
    - rowgroup:
      - row "المكتب المالك الحالة التاريخ":
        - columnheader "المكتب"
        - columnheader "المالك"
        - columnheader "الحالة"
        - columnheader "التاريخ"
    - rowgroup:
      - row "Al Fares Properties al-fares-properties mohammed@al-fares.sa معتمد 1 يوليو 2026":
        - cell "Al Fares Properties al-fares-properties":
          - paragraph: Al Fares Properties
          - paragraph: al-fares-properties
        - cell "mohammed@al-fares.sa"
        - cell "معتمد"
        - cell "1 يوليو 2026"
      - row "Dar Al-Aseel Real Estate dar-al-aseel ahmed@dar-al-aseel.sa معتمد 1 يوليو 2026":
        - cell "Dar Al-Aseel Real Estate dar-al-aseel":
          - paragraph: Dar Al-Aseel Real Estate
          - paragraph: dar-al-aseel
        - cell "ahmed@dar-al-aseel.sa"
        - cell "معتمد"
        - cell "1 يوليو 2026"
- alert
```

# Test source

```ts
  1   | import { test, expect, Page } from '@playwright/test'
  2   | 
  3   | async function loginAsAdmin(page: Page) {
  4   |   await page.goto('/auth/signin')
  5   |   await page.locator('input#phone').fill('501111111')
  6   |   await page.locator('button:has-text("إرسال رمز التحقق")').click()
  7   |   await expect(page.locator('text=تم إرسال الرمز إلى')).toBeVisible()
  8   |   const otpInputs = page.locator('div[dir="ltr"] > input')
  9   |   for (let i = 0; i < 6; i++) {
  10  |     await otpInputs.nth(i).fill(String(i + 1))
  11  |   }
  12  |   await page.waitForURL('**/dashboard**', { timeout: 15000 })
  13  | }
  14  | 
  15  | test.describe('Flow 5 & 6: Saudi Locations, Custom District Creation & Media Engine', () => {
  16  |   test.beforeEach(async ({ page }) => {
  17  |     await loginAsAdmin(page)
  18  |   })
  19  | 
  20  |   test('Saudi city and district selection auto-fills directional area', async ({ page }) => {
  21  |     await page.goto('/dashboard/properties/new')
  22  | 
  23  |     // Select Saudi City
  24  |     const citySelect = page.locator('select:has(option:has-text("اختر المدينة..."))')
  25  |     await expect(citySelect).toBeVisible()
  26  | 
  27  |     const cityOptions = await citySelect.locator('option').allInnerTexts()
  28  |     if (cityOptions.length > 1) {
> 29  |       await citySelect.selectOption({ index: 1 })
      |                              ^ Error: expect(locator).toBeVisible() failed
  30  |       
  31  |       // District select should be enabled
  32  |       const districtSelect = page.locator('select:has(option:has-text("اختر الحي..."))')
  33  |       await expect(districtSelect).toBeEnabled()
  34  |     }
  35  |   })
  36  | 
  37  |   test('Create custom district as office manager', async ({ page }) => {
  38  |     await page.goto('/dashboard/properties/new')
  39  | 
  40  |     const citySelect = page.locator('select:has(option:has-text("اختر المدينة..."))')
  41  |     const cityOptions = await citySelect.locator('option').allInnerTexts()
  42  |     if (cityOptions.length > 1) {
  43  |       await citySelect.selectOption({ index: 1 })
  44  | 
  45  |       const addDistrictBtn = page.locator('button:has-text("إضافة حي")')
  46  |       await expect(addDistrictBtn).toBeVisible()
  47  |       await addDistrictBtn.click()
  48  | 
  49  |       await expect(page.locator('text=إضافة حي مخصص للمكتب')).toBeVisible()
  50  | 
  51  |       // Fill custom district form
  52  |       await page.locator('input[placeholder*="النرجس الجديد"]').fill('حي الروضة الشمالي')
  53  |       const directionSelect = page.locator('select:has(option[value="NORTH"])')
  54  |       await directionSelect.selectOption('NORTH')
  55  | 
  56  |       const submitBtn = page.locator('button[type="submit"]:has-text("إضافة الحي")')
  57  |       await submitBtn.click()
  58  |     }
  59  |   })
  60  | 
  61  |   test('Upload property images and manipulate cover photo assignment', async ({ page }) => {
  62  |     await page.goto('/dashboard/properties/new')
  63  | 
  64  |     const fileInput = page.locator('input[type="file"][accept="image/*"]')
  65  | 
  66  |     // Create 2 mock image buffers
  67  |     const buffer1 = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64')
  68  |     const buffer2 = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64')
  69  | 
  70  |     await fileInput.setInputFiles([
  71  |       { name: 'photo1.png', mimeType: 'image/png', buffer: buffer1 },
  72  |       { name: 'photo2.png', mimeType: 'image/png', buffer: buffer2 },
  73  |     ])
  74  | 
  75  |     // First photo automatically gets main cover badge
  76  |     const coverBadge = page.locator('div:has-text("صورة الغلاف الرئيسية")')
  77  |     await expect(coverBadge).toBeVisible()
  78  | 
  79  |     // Second photo has "تعيين كغلاف" button
  80  |     const setCoverBtn = page.locator('button:has-text("تعيين كغلاف")')
  81  |     if (await setCoverBtn.isVisible()) {
  82  |       await setCoverBtn.click()
  83  |       await expect(coverBadge).toBeVisible()
  84  |     }
  85  |   })
  86  | 
  87  |   test('Enforce 100-file media upload limit error banner', async ({ page }) => {
  88  |     await page.goto('/dashboard/properties/new')
  89  | 
  90  |     // Simulate exceeding max limit of 100 files
  91  |     const fileInput = page.locator('input[type="file"][accept="image/*"]')
  92  | 
  93  |     const buffer = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64')
  94  |     const files = Array.from({ length: 101 }, (_, i) => ({
  95  |       name: `img_${i}.png`,
  96  |       mimeType: 'image/png',
  97  |       buffer,
  98  |     }))
  99  | 
  100 |     await fileInput.setInputFiles(files)
  101 | 
  102 |     // Verify limit error message appears
  103 |     const limitError = page.locator('div:has-text("لا يمكن إرفاق أكثر من 100 صورة لكل عقار.")')
  104 |     await expect(limitError).toBeVisible()
  105 |   })
  106 | })
  107 | 
```