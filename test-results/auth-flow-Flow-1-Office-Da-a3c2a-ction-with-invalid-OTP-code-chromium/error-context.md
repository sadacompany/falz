# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth-flow.spec.ts >> Flow 1: Office Dashboard Authentication & Navigation >> Dashboard signin rejection with invalid OTP code
- Location: tests\e2e\auth-flow.spec.ts:31:7

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('#signin-error, div[role="alert"]')
Expected substring: "رمز التحقق غير صحيح أو منتهي الصلاحية"
Error: strict mode violation: locator('#signin-error, div[role="alert"]') resolved to 2 elements:
    1) <div role="alert" id="signin-error" aria-live="polite" class="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-600">رمز التحقق غير صحيح أو منتهي الصلاحية</div> aka getByText('رمز التحقق غير صحيح أو منتهي الصلاحية')
    2) <div role="alert" aria-live="assertive" id="__next-route-announcer__"></div> aka locator('[id="__next-route-announcer__"]')

Call log:
  - Expect "toContainText" with timeout 15000ms
  - waiting for locator('#signin-error, div[role="alert"]')
    3 × locator resolved to <div role="alert" aria-live="assertive" id="__next-route-announcer__"></div>
      - unexpected value ""

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e2]:
    - button "تفعيل الوضع الفاتح" [ref=e4] [cursor=pointer]
    - generic [ref=e9]:
      - generic [ref=e12]:
        - generic [ref=e13]:
          - img "FALZ" [ref=e14]
          - heading "مرحباً بعودتك" [level=1] [ref=e20]
          - paragraph [ref=e21]: قم بتسجيل الدخول للوصول إلى لوحة التحكم
        - alert [ref=e22]: رمز التحقق غير صحيح أو منتهي الصلاحية
        - generic [ref=e23]:
          - generic [ref=e24]:
            - generic [ref=e25]: تم إرسال الرمز إلى
            - generic [ref=e30]: "+966501111111"
          - generic [ref=e31]:
            - generic [ref=e32]: رمز التحقق
            - generic [ref=e33]:
              - textbox "الرقم 1 من 6" [ref=e34]:
                - /placeholder: ·
                - text: "9"
              - textbox "الرقم 2 من 6" [ref=e35]:
                - /placeholder: ·
                - text: "9"
              - textbox "الرقم 3 من 6" [ref=e36]:
                - /placeholder: ·
                - text: "9"
              - textbox "الرقم 4 من 6" [ref=e37]:
                - /placeholder: ·
                - text: "9"
              - textbox "الرقم 5 من 6" [ref=e38]:
                - /placeholder: ·
                - text: "9"
              - textbox "الرقم 6 من 6" [active] [ref=e39]:
                - /placeholder: ·
                - text: "9"
          - button "تحقق وسجل الدخول" [ref=e40]
          - generic [ref=e41]:
            - button "تغيير الرقم" [ref=e42]
            - generic [ref=e45]: إعادة الإرسال بعد 60ث
        - paragraph [ref=e47]:
          - text: ليس لديك حساب؟
          - link "إنشاء حساب" [ref=e48] [cursor=pointer]:
            - /url: /auth/signup
      - paragraph [ref=e49]: FALZ Platform © 2026
  - button "Open Next.js Dev Tools" [ref=e55] [cursor=pointer]
  - alert [ref=e59]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | 
  3  | test.describe('Flow 1: Office Dashboard Authentication & Navigation', () => {
  4  |   test('Dashboard signin happy path with seeded phone +966501111111 and OTP 123456', async ({ page }) => {
  5  |     await page.goto('/auth/signin')
  6  |     await expect(page.locator('h1')).toContainText('مرحباً بعودتك')
  7  | 
  8  |     // Enter seeded office owner phone number
  9  |     const phoneInput = page.locator('input#phone')
  10 |     await phoneInput.fill('501111111')
  11 | 
  12 |     // Click Send OTP
  13 |     const sendOtpBtn = page.locator('button:has-text("إرسال رمز التحقق")')
  14 |     await sendOtpBtn.click()
  15 | 
  16 |     // Expect OTP step to be displayed
  17 |     await expect(page.locator('text=تم إرسال الرمز إلى')).toBeVisible()
  18 | 
  19 |     // Fill 6-digit OTP fields
  20 |     const otpInputs = page.locator('div[dir="ltr"] > input')
  21 |     const digits = ['1', '2', '3', '4', '5', '6']
  22 |     for (let i = 0; i < 6; i++) {
  23 |       await otpInputs.nth(i).fill(digits[i])
  24 |     }
  25 | 
  26 |     // Verify successful login redirect to dashboard
  27 |     await page.waitForURL('**/dashboard**', { timeout: 15000 })
  28 |     await expect(page).toHaveURL(/\/dashboard/)
  29 |   })
  30 | 
  31 |   test('Dashboard signin rejection with invalid OTP code', async ({ page }) => {
  32 |     await page.goto('/auth/signin')
  33 | 
  34 |     const phoneInput = page.locator('input#phone')
  35 |     await phoneInput.fill('501111111')
  36 | 
  37 |     const sendOtpBtn = page.locator('button:has-text("إرسال رمز التحقق")')
  38 |     await sendOtpBtn.click()
  39 | 
  40 |     await expect(page.locator('text=تم إرسال الرمز إلى')).toBeVisible()
  41 | 
  42 |     // Fill invalid 6-digit OTP fields
  43 |     const otpInputs = page.locator('div[dir="ltr"] > input')
  44 |     const invalidDigits = ['9', '9', '9', '9', '9', '9']
  45 |     for (let i = 0; i < 6; i++) {
  46 |       await otpInputs.nth(i).fill(invalidDigits[i])
  47 |     }
  48 | 
  49 |     // Verify error message is rendered
  50 |     const errorAlert = page.locator('#signin-error, div[role="alert"]')
  51 |     await expect(errorAlert).toBeVisible({ timeout: 10000 })
> 52 |     await expect(errorAlert).toContainText('رمز التحقق غير صحيح أو منتهي الصلاحية')
     |                              ^ Error: expect(locator).toContainText(expected) failed
  53 |   })
  54 | 
  55 |   test('Office dashboard navigation sidebar links', async ({ page }) => {
  56 |     // Perform authentication
  57 |     await page.goto('/auth/signin')
  58 |     await page.locator('input#phone').fill('501111111')
  59 |     await page.locator('button:has-text("إرسال رمز التحقق")').click()
  60 | 
  61 |     await expect(page.locator('text=تم إرسال الرمز إلى')).toBeVisible()
  62 |     const otpInputs = page.locator('div[dir="ltr"] > input')
  63 |     for (let i = 0; i < 6; i++) {
  64 |       await otpInputs.nth(i).fill(String(i + 1))
  65 |     }
  66 | 
  67 |     await page.waitForURL('**/dashboard**', { timeout: 15000 })
  68 | 
  69 |     // Verify navigation sidebar elements exist
  70 |     const nav = page.locator('nav, aside, div:has-text("العقارات")')
  71 |     await expect(nav.first()).toBeVisible()
  72 |   })
  73 | })
  74 | 
```