# Comprehensive E2E Survey & Technical Analysis Report

**Project**: Falz Automated Test Suite  
**Agent**: Explorer 3  
**Target Area**: E2E Browser Testing Infrastructure, Frontend Pages & UI Flows (R2 Requirements)  
**Date**: 2026-08-06  

---

## 1. Executive Summary

This report presents an exhaustive technical survey of the Falz platform (`d:\falz`) to establish a production-grade Playwright E2E browser testing framework. The codebase is a Next.js 16 (App Router) + Prisma + PostgreSQL application using React 19, Tailwind CSS v4, and Radix UI components with Arabic/RTL locale priority.

Currently, **no test files or test configuration files exist** in the workspace. All test infrastructure (`tests/`, `playwright.config.ts`, `vitest.config.ts`) must be established from scratch.

This analysis details the exact route URLs, component paths, DOM selectors, form field names, state transitions, validation rules, mock strategies, and recommended Playwright test scenarios for all 11 E2E user flows specified in Requirement R2.

---

## 2. Codebase & Infrastructure Inspection

### 2.1 Package & Tooling Status
- **Framework**: Next.js `16.1.6`, React `19.2.3`
- **ORM / Database**: Prisma `6.19.3` with PostgreSQL
- **Authentication**: NextAuth `5.0.0-beta.30` (Credentials Provider using phone + OTP)
- **Forms & Validation**: `react-hook-form` `7.71.2`, `zod` `4.3.6`
- **UI Components**: `@radix-ui/*`, `framer-motion` `12.35.0`, `lucide-react` `0.575.0`
- **Existing Test Dependencies**: None in `package.json` (Playwright and Vitest need to be installed or added to `package.json`).
- **Existing Config Files**: `next.config.ts`, `tsconfig.json`, `postcss.config.mjs`, `eslint.config.mjs`, `netlify.toml`.
- **Existing Test Directories**: `tests/` directory does not exist yet.

### 2.2 TypeScript Configuration (`tsconfig.json`)
- Path Aliases: `@/*` mapped to `./src/*`.
- Excludes: `node_modules`.
- Note for test runner: Playwright and Vitest config files will be located in root or `tests/` and will import `@/*` modules directly.

---

## 3. Deep-Dive Analysis of the 11 R2 E2E Flows

---

### Flow 1: Office Dashboard Login and Navigation

#### 1. Page Routes & Components
- **SignIn Page**: `/auth/signin` (`src/app/(auth)/auth/signin/page.tsx`)
- **Dashboard Layout**: `/dashboard` (`src/app/(dashboard)/dashboard/layout.tsx`)
- **Dashboard Shell**: `src/components/dashboard/DashboardShell.tsx`

#### 2. Authentication Mechanism & Static Test Credentials
- **Backend Flow**: NextAuth Credentials provider (`src/lib/auth.ts`).
- **OTP Verification**: `src/lib/twilio-verify.ts` contains a hardcoded `TEST_PHONES` list.
- **Bypass OTP Code**: `123456` for all test phone numbers (e.g., `+966500000001`, `+966501234567`).
- **Seeded Super Admin**: Phone `+966500000001` (User: `admin@falz.sa`)
- **Seeded Office 1 Owner**: Phone `+966501111111` (User: `ahmed@dar-al-aseel.sa`)
- **Seeded Office 1 Agent**: Phone `+966503333333` (User: `khalid@dar-al-aseel.sa`)

#### 3. Selectors & DOM Mapping
| Element | Selector / Identifier | Action / Details |
|---|---|---|
| Phone Input | `input#phone` or `input[type="tel"]` | Fill local 9-digit number (e.g. `501234567` or `500000001`) |
| Country Code Button | `button[aria-label="اختر رمز الدولة"]` | Defaults to Saudi Arabia (`+966`) |
| Send OTP Button | `button:has-text("إرسال رمز التحقق")` | Triggers `/api/auth/otp/send` |
| OTP 6-Digit Inputs | `div[dir="ltr"] > input` (6 inputs) | Type `123456` into inputs |
| Verify & Sign In Button | `button:has-text("تحقق وسجل الدخول")` | Calls `/api/auth/otp/verify` + NextAuth `signIn` |
| Sidebar Nav Links | `nav a[href="/dashboard"]`<br>`nav a[href="/dashboard/properties"]`<br>`nav a[href="/dashboard/properties/owners"]`<br>`nav a[href="/dashboard/leads"]`<br>`nav a[href="/dashboard/signboards"]`<br>`nav a[href="/dashboard/team"]`<br>`nav a[href="/dashboard/billing"]`<br>`nav a[href="/dashboard/settings"]` | Sidebar items filter by role (`OWNER`, `MANAGER`, `AGENT`) |
| User Profile Menu | `button[aria-label="قائمة المستخدم"]` | Displays user name and role badge |
| Sign Out Button | `button:has-text("تسجيل الخروج")` | Calls NextAuth `signOut` and redirects to `/auth/signin` |

---

### Flow 2: Creating Property Listing with All Field Types

#### 1. Page Routes & Components
- **Create Page**: `/dashboard/properties/new` (`src/app/(dashboard)/dashboard/properties/new/page.tsx`)
- **Server Action**: `createProperty` in `src/lib/actions/properties.ts`

#### 2. Field Types & Conditional Logic
- **Deal Types**:
  - `SALE` (بيع) vs `RENT` (إيجار) — Toggle buttons.
- **Categories & Subtypes**:
  - Categories: `RESIDENTIAL`, `COMMERCIAL`, `AGRICULTURAL`.
  - Subtype select dropdown (`subtypeId`).
  - **Apartment Detection**: Selecting an Apartment subtype ("شقة") dynamically reveals Apartment-specific fields: `entryType` ("نوع المدخل": `PRIVATE` / `SHARED`), `floorNumber` ("رقم الطابق").
  - **Land Detection**: Selecting Land ("أرض سكنية", "أرض تجارية", or `AGRICULTURAL`) dynamically hides building specs (`bedrooms`, `bathrooms`, `builtArea`, `floorNumber`).
- **Specification Validation Constraint**:
  - If Master Bedrooms (`masterBedrooms`) > 0, total Bathrooms (`bathrooms`) MUST be `>= masterBedrooms`.
  - Validation error message: `"عدد دورات المياه يجب أن يكون مساويًا أو أكبر من عدد غرف النوم الماستر"`.
- **Legal Requirements**:
  - Deed Number (`deedNumber`): Input field.
  - Deed File (`deedFile`): Required if `deedNumber` is filled (`"يجب تحميل ملف صك الملكية عند إدخال رقم الصك"`).
  - Marketing Contract Number (`marketingContractNumber`) & Expiry Date (`contractExpiryDate`).
  - Border Dimensions (`borderNorth`, `borderSouth`, `borderEast`, `borderWest`): Accepts Arabic and Latin decimal separators (`.`, `,`, `٫`) via `normalizeDecimal`.

#### 3. Selectors & DOM Mapping
| Field | Selector | Expected Input / Behavior |
|---|---|---|
| Owner Selection | `select` (first card) | Select owner ID from CRM dropdown |
| Property Title | `input[placeholder*="فيلا فاخرة"]` | Text input |
| Category Select | `select:has(option[value="RESIDENTIAL"])` | Choose category |
| Subtype Select | `select:has(option[value=""])` | Choose subtype (e.g. apartment, land) |
| Deal Type Buttons | `button:has-text("بيع")`, `button:has-text("إيجار")` | Toggle active button |
| Price Input | `input[placeholder="1200000"]` | Price in SAR |
| Total Area | `input[placeholder="350"]` | Area in sqm |
| Bedrooms Input | `input[placeholder="5"]` | Triggers auto-fill `bathrooms = bedrooms + 1` |
| Master Bedrooms | `input[placeholder="2"]` | Number of master beds |
| Bathrooms Input | `input[placeholder="6"]` | Must be >= master bedrooms |
| Entry Type (Apartment) | `select:has(option[value="PRIVATE"])` | `PRIVATE` or `SHARED` |
| Deed Number | `input[placeholder="أدخل رقم الصك"]` | Text input |
| Deed File Upload | `input[type="file"][accept*=".pdf"]` | File attachment |
| Save Draft Button | `button:has-text("حفظ كمسودة")` | Sets status = `DRAFT` |
| Publish Button | `button:has-text("نشر العقار")` | Sets status = `PUBLISHED` |

---

### Flow 3: REGA Owner Creation with Validation Errors

#### 1. Components & Trigger Locations
- **Modal Trigger**: "+ إضافة مالك جديد" button in `/dashboard/properties/new` or `/dashboard/properties/owners`.
- **Modal Component**: `isOwnerModalOpen` dialog inside `NewPropertyPage` (`src/app/(dashboard)/dashboard/properties/new/page.tsx`).
- **Server Action**: `createOwner` in `src/lib/actions/owners.ts`.

#### 2. Form Fields & REGA Mandatory Constraints
REGA (General Authority for Real Estate in Saudi Arabia) compliance mandates full owner identity details:
1. `name` (الاسم الكامل)
2. `phone` (رقم الجوال)
3. `nationalId` (رقم الهوية الوطنية) — **Mandatory**
4. `dob` (تاريخ الميلاد) — **Mandatory**

#### 3. Selectors & Validation Error Behavior
| Field / Component | Selector | Details |
|---|---|---|
| Modal Open Button | `button:has-text("+ إضافة مالك جديد")` | Opens modal |
| Owner Name Input | `input[placeholder="الاسم الكامل"]` | Required |
| Owner Phone Input | `input[placeholder="05xxxxxxxx"]` | Required |
| National ID Input | `input[placeholder="1xxxxxxxx"]` | Required for REGA |
| Date of Birth Input | `input[type="date"]` | Required for REGA |
| Submit Button | `button[type="submit"]:has-text("إضافة وحفظ")` | Triggers creation |
| Error Alert Div | `div.text-red-400:has-text("رقم الهوية وتاريخ الميلاد إجباريان")` | Appears when submitting without nationalId or dob |

---

### Flow 4: Bid Configuration and Public Bid Display Behavior

#### 1. Page Routes & Components
- **Config Page**: `/dashboard/properties/new` (or edit page)
- **Public View**: `/[officeSlug]/properties/[propertySlug]` (`src/app/(office)/[slug]/properties/[propertySlug]/PropertyDetailClient.tsx`)

#### 2. Bidding Engine Parameters (`src/app/(dashboard)/dashboard/properties/new/page.tsx` & `src/lib/actions/properties.ts`)
- **Pricing Strategy**: Toggle between `LIMIT` (Fixed Price) and `BID` (Auction / سوم).
- **Bid Inputs**:
  - Initial Bid Amount (`newBidAmount`)
  - Bidder Name (`newBidderName`)
  - Bidder Phone (`newBidderPhone`)
  - Bid Date (`newBidDate`)
- **Auto-Hide Timer (`bidAutoHideDuration`)**:
  - Enum values: `NONE`, `ONE_MONTH`, `TWO_MONTHS`, `THREE_MONTHS`, `SIX_MONTHS`, `ONE_YEAR`.
- **Show Bid Date Toggle (`showBidDate`)**:
  - Boolean toggle controlling whether the bid date is visible on the public detail page.
- **Privacy Sanitization**:
  - Bidder name & phone are saved in internal database records for office staff ONLY.
  - Public detail page sanitizes bidder identities to `"مساومة معتمدة"` (Verified Bid).
  - If bid is expired based on `bidAutoHideDuration`, display text returns `"يوجد سوم"` ("Bid Exists") without numeric value.

#### 3. Selectors & DOM Mapping
| Context | Element | Selector / Details |
|---|---|---|
| Dashboard Config | Strategy Toggle | `button:has-text("سوم (مزاد)")` |
| Dashboard Config | Bid Amount Input | `input[placeholder="1100000"]` |
| Dashboard Config | Auto-Hide Select | `select:has(option[value="ONE_MONTH"])` |
| Dashboard Config | Show Date Toggle | `button:has(span.rounded-full)` (showBidDate toggle) |
| Public Page View | Live Bidding Section | `div:has-text("مزاد السوم المباشر")` |
| Public Page View | Highest Bid Display | `span.font-mono:has-text("أعلى سومة حالية")` or `"يوجد سوم"` |

---

### Flow 5: Saudi City/District Selection and Custom District Creation

#### 1. API Endpoints & Components
- **Cities API**: `/api/locations/cities`
- **Districts API**: `/api/locations/districts` (GET & POST)
- **Component**: Location section in `NewPropertyPage`.

#### 2. Behavior & Role Gating
- **City Selection**: Select city dropdown -> fetches districts for selected `cityId`.
- **District Selection**: Select district -> auto-populates `directionalArea` (e.g. `NORTH` -> "شمال").
- **Custom District Creation**:
  - Trigger: "+ إضافة حي" button (only active after selecting a city).
  - Modal Form: `newDistrictNameAr` (Input), `newDistrictDirection` (`NORTH`, `SOUTH`, `EAST`, `WEST`, `CENTER`).
  - **Role-Gating**: POST `/api/locations/districts` checks membership role. Only users with `OWNER` or `MANAGER` role are permitted to create custom districts! `AGENT` users are rejected with HTTP 403.

#### 3. Selectors & DOM Mapping
| Element | Selector | Details |
|---|---|---|
| City Dropdown | `select:has(option:has-text("اختر المدينة..."))` | Select city (e.g. Riyadh) |
| District Dropdown | `select:has(option:has-text("اختر الحي..."))` | Disabled until city selected |
| Add Custom District Button | `button:has-text("إضافة حي")` | Opens district modal |
| Custom District Name Input | `input[placeholder*="النرجس الجديد"]` | Arabic district name |
| Direction Select | `select:has(option[value="NORTH"])` | Select direction |
| Modal Submit Button | `button[type="submit"]:has-text("إضافة الحي")` | POST to `/api/locations/districts` |

---

### Flow 6: Media Upload with Limit Enforcement

#### 1. Component & Configuration
- **Component**: Drag & Drop upload container in `NewPropertyPage`.
- **Media Limit Constant**: `MAX_MEDIA_LIMIT = 100` images.

#### 2. Media Management Features
- **File Selection**: Input `type="file"` with `multiple` and `accept="image/*"`.
- **Limit Enforcement Test**: Uploading > 100 images triggers error banner: `"لا يمكن إرفاق أكثر من 100 صورة لكل عقار."`.
- **Cover Photo Assignment**: Clicking "تعيين كغلاف" moves target image to index 0 with badge `"صورة الغلاف الرئيسية"`.
- **Image Re-ordering**: ▶ and ◀ buttons swap image indices in array (`moveMedia`).

#### 3. Selectors & DOM Mapping
| Element | Selector | Details |
|---|---|---|
| Dropzone Box | `div:has-text("اسحب الصور هنا أو اضغط للرفع")` | Click or drag-drop |
| Hidden File Input | `input[type="file"][accept="image/*"]` | Intercepted via Playwright `setInputFiles` |
| Cover Photo Badge | `div:has-text("صورة الغلاف الرئيسية")` | First image preview |
| Set as Cover Button | `button:has-text("تعيين كغلاف")` | Appears on hover over non-cover images |
| Error Alert | `div.text-red-400:has-text("100 صورة")` | Triggered when limit exceeded |

---

### Flow 7: Public Property Detail Page Viewing

#### 1. Page Route & Component
- **URL Pattern**: `/[officeSlug]/properties/[propertySlug]` (e.g. `/dar-al-aseel/properties/luxury-villa-al-malqa`)
- **Client Component**: `PropertyDetailClient.tsx` (`src/app/(office)/[slug]/properties/[propertySlug]/PropertyDetailClient.tsx`)

#### 2. Page Elements & Visibility Controls
- **Header Badges**:
  - Deal Type Badge: `SALE` ("للبيع") / `RENT` ("للإيجار")
  - Property Type Badge: Subtype name or general type
  - Featured Badge: "مميز"
- **Price Display**: Large formatted SAR price (`formatPrice`).
- **Specs Bar**: Bedrooms (`BedDouble`), Bathrooms (`Bath`), Area (`Maximize`), Published Date (`Calendar`).
- **Detailed Specifications Grid**: Subtype, built area, facing, street width, property age, floor number, payment method, directional area.
- **Borders & Dimensions**: North, South, East, West lengths in meters.
- **Interactive Gallery & Media**: `PropertyGallery` carousel, YouTube video iframe, 360 virtual tour iframe.
- **Location Map**: `GoogleMapEmbed` or Google Maps direct link.

#### 3. Selectors & DOM Mapping
| Element | Selector | Details |
|---|---|---|
| Property Title | `h1.font-bold` | Verifies localized title |
| Formatted Price | `p.text-3xl.font-bold` | Verifies SAR price string |
| Deal Type Badge | `span:has-text("للبيع")` / `span:has-text("للإيجار")` | Status badge |
| Specs Bar Items | `div.grid-cols-4 > div` | Verifies specs text |
| Gallery Main Image | `div.aspect-\[16\/9\] img` | Gallery container |
| YouTube Video Iframe | `iframe[title]` | Video embed |

---

### Flow 8: Guest Property Request Submission Flow

#### 1. Component & API Endpoint
- **Component**: `RequestButtons.tsx` (`src/components/public/RequestButtons.tsx`)
- **API Handler**: POST `/api/requests` (`src/app/api/requests/route.ts`)

#### 2. Request Types & Guest Modal Flow
- **Request Buttons**:
  - "أبدي اهتمامي" (`INTEREST`)
  - "حجز معاينة" (`VIEWING`)
  - "طلب معلومات" (`INFO`)
- **Guest Visitor Input**:
  - Guest Name (`guestName`): `input[type="text"]` (placeholder="أدخل اسمك الكريم")
  - Guest Phone (`guestPhone`): `input[type="tel"]` (placeholder="05xxxxxxxx")
  - Notes / Message (`message`): `textarea` (placeholder="اكتب رسالتك هنا...")
- **Validation**:
  - Name and Phone are required.
  - Submitting empty inputs shows: `"الاسم ورقم الجوال مطلوبان لإرسال الطلب"`.
- **Successful Submission**:
  - Displays success message: `"تم إرسال طلبك بنجاح وسيتواصل معك الفريق قريبًا!"`.
  - Creates Lead & Activity records linked to the office CRM!

#### 3. Selectors & DOM Mapping
| Action / Element | Selector | Details |
|---|---|---|
| Interest Button | `button:has-text("أبدي اهتمامي")` | Opens request modal |
| Viewing Button | `button:has-text("حجز معاينة")` | Opens request modal |
| Info Button | `button:has-text("طلب معلومات")` | Opens request modal |
| Guest Name Input | `input[placeholder="أدخل اسمك الكريم"]` | Text input |
| Guest Phone Input | `input[placeholder="05xxxxxxxx"]` | Tel input |
| Notes Textarea | `textarea[placeholder="اكتب رسالتك هنا..."]` | Optional message |
| Submit Request Button | `button[type="submit"]:has-text("إرسال الطلب")` | Triggers `/api/requests` |
| Success Message | `p:has-text("تم إرسال طلبك بنجاح")` | Appears after HTTP 200 |

---

### Flow 9: Reserved Status Visual Indicators on Public Pages

#### 1. Page Routes & Components
- **Property Detail Page**: `PropertyDetailClient.tsx`
- **Property Card / Grid**: `PropertyCard.tsx` (`src/components/public/PropertyCard.tsx`)

#### 2. Visual Indicators & Gating Rules
- **Status Enum**: `availability = 'RESERVED'` (or `SOLD` / `RENTED`).
- **Detail Page Banner**:
  - Reserved properties render a prominent top alert banner:
  - Selector / Class: `div.bg-amber-50.border-amber-200.text-amber-700` containing text `"محجوز"`.
- **Public Action Button Gating**:
  - When `isNotAvailable` is true (`RESERVED`, `SOLD`, `RENTED`), the `RequestButtons` section is **completely hidden from the DOM** (`!isNotAvailable` condition).
  - Users cannot submit interest or viewing requests on reserved properties.
- **Listing Card Badge**:
  - Property cards display an amber status badge `"محجوز"`.

#### 3. Selectors & DOM Mapping
| Element | Selector | Expected State |
|---|---|---|
| Reserved Top Banner | `div.bg-amber-50:has-text("محجوز")` | Visible on property detail page |
| Request Buttons Container | `div:has-text("طلبات")` | Hidden / NOT present in DOM |
| Card Availability Badge | `span:has-text("محجوز")` | Visible on property cards |

---

### Flow 10: WhatsApp Share Link Generation

#### 1. Utility Functions & Components
- **Share Text Generator**: `generatePropertyWhatsAppShareText` in `src/lib/whatsapp.ts`.
- **Link Builder**: `getWhatsAppShareLink` in `src/lib/whatsapp.ts`.
- **UI Component**: Agent WhatsApp Button on detail page & sticky mobile bar.

#### 2. Share Text Specification
The generated text includes:
1. Title & Deal Type: `🏡 *عقار مميز للبيع | فيلا*`
2. Location: `📍 *الموقع:* الملقا - الرياض`
3. Price / Bid: `💰 *السعر المطلـوب: 4500000 ر.س*`
4. Specs: `📌 المساحة: 550 م² | غرف النوم: 5 | دورات المياه: 6`
5. Public URL: `🔗 *رابط التفاصيل الكاملة والصور:* https://falz.sa/...`

#### 3. Selectors & DOM Mapping
| Element | Selector | Details |
|---|---|---|
| Desktop WhatsApp Button | `a:has-text("واتساب")` | `href` contains `wa.me` with encoded text |
| Sticky Mobile WhatsApp Bar | `div.fixed.bottom-0 a:has-text("واتساب")` | Mobile CTA bar |

---

### Flow 11: PDF Brochure Print Modal Opening

#### 1. Component Path & Functionality
- **Component**: `PropertyFlyerModal` in `src/components/public/PropertyFlyerModal.tsx`.
- **Trigger**: "طباعة بروشور (PDF)" button.

#### 2. Flyer Sheet Contents & Print Action
- **Branding Header**: Office Name, Office Logo, Office Phone/Email.
- **Property Brief**: Title, deal type, property type, price, location.
- **Main Media**: High-res cover image.
- **Specifications Table**: Area, bedrooms, bathrooms, facing.
- **Detailed Description**: Full description text.
- **Action Button**: "طباعة / حفظ PDF" button which triggers `window.print()`.

#### 3. Selectors & DOM Mapping
| Element | Selector | Details |
|---|---|---|
| Open Flyer Modal Button | `button:has-text("طباعة بروشور (PDF)")` | Opens modal |
| Modal Container | `div.fixed:has-text("معاينة بروشور العقار")` | Printable modal overlay |
| Print Action Button | `button:has-text("طباعة / حفظ PDF")` | Triggers `window.print()` |
| Close Modal Button | `button:has(svg.lucide-x)` | Closes flyer modal |

---

## 4. Playwright E2E Test Suite Recommendations & Architecture (R2 & R3)

### 4.1 Recommended Test Framework: Playwright
- **Package**: `@playwright/test`
- **Configuration File**: `playwright.config.ts` (to be created at project root `d:\falz\playwright.config.ts`).
- **Test Directory**: `d:\falz\tests\e2e\`

### 4.2 Playwright Configuration Spec (`playwright.config.ts`)
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  expect: { timeout: 5000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html', { outputFolder: 'playwright-report' }], ['list']],
  use: {
    baseURL: process.env.TEST_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    locale: 'ar-SA',
    extraHTTPHeaders: {
      'Accept-Language': 'ar-SA,ar;q=0.9,en;q=0.8',
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
```

### 4.3 Proposed E2E Test Files Mapping (15 Scenarios Minimum)

| File Path | Test Scenario Name | Flow Covered | Type |
|---|---|---|---|
| `tests/e2e/01-auth.spec.ts` | `Dashboard signin happy path with test OTP` | Flow 1 | Positive |
| `tests/e2e/01-auth.spec.ts` | `Dashboard signin rejection with invalid OTP` | Flow 1 | Negative |
| `tests/e2e/02-property-create.spec.ts` | `Create sale villa property with full details` | Flow 2 | Positive |
| `tests/e2e/02-property-create.spec.ts` | `Create rent apartment with entry type and floor` | Flow 2 | Positive |
| `tests/e2e/02-property-create.spec.ts` | `Create land property (hides building specs)` | Flow 2 | Positive |
| `tests/e2e/02-property-create.spec.ts` | `Reject listing creation when bathrooms < masterBedrooms` | Flow 2 | Negative |
| `tests/e2e/03-rega-owner.spec.ts` | `Create REGA owner with full national ID and DOB` | Flow 3 | Positive |
| `tests/e2e/03-rega-owner.spec.ts` | `Show validation error when national ID or DOB missing` | Flow 3 | Negative |
| `tests/e2e/04-bidding.spec.ts` | `Configure bidding property and verify public display` | Flow 4 | Positive |
| `tests/e2e/05-locations.spec.ts` | `Select Saudi city/district and verify direction auto-fill` | Flow 5 | Positive |
| `tests/e2e/05-locations.spec.ts` | `Create custom district as Manager and verify availability` | Flow 5 | Positive |
| `tests/e2e/06-media-upload.spec.ts` | `Upload property images and reorder cover photo` | Flow 6 | Positive |
| `tests/e2e/06-media-upload.spec.ts` | `Enforce 100-file media upload limit error` | Flow 6 | Negative |
| `tests/e2e/07-public-view.spec.ts` | `View public property detail page specs, map & badges` | Flow 7 | Positive |
| `tests/e2e/08-guest-request.spec.ts` | `Submit guest viewing request successfully` | Flow 8 | Positive |
| `tests/e2e/08-guest-request.spec.ts` | `Reject guest request submission without name/phone` | Flow 8 | Negative |
| `tests/e2e/09-reserved-status.spec.ts` | `Verify reserved status banner and button gating` | Flow 9 | Positive |
| `tests/e2e/10-whatsapp-pdf.spec.ts` | `Verify WhatsApp share link format and PDF print modal` | Flows 10, 11 | Positive |

---

## 5. Mocking Strategy Proposals (R3 Compliance)

To ensure unit, integration, and E2E tests run reliably in CI/CD without side-effects or external dependencies:

1. **Twilio OTP Mocking**:
   - Built into `src/lib/twilio-verify.ts`.
   - Any phone starting with `+9665` listed in `TEST_PHONES` automatically uses static code `123456`.
2. **Database Seeding & Test Isolation**:
   - Seed script `prisma/seed.ts` populates `Dar Al-Aseel` office (`dar-al-aseel`), plans, super admin users, and initial test properties.
   - Run `npx prisma db seed` prior to running Playwright tests.
3. **Google Maps Mocking**:
   - `GoogleMapEmbed.tsx` and `MockMapPicker.tsx` gracefully fallback to mock map UI when `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is not present.
4. **File Upload Mocking**:
   - In Playwright, use `page.setInputFiles()` with synthetic image buffers (e.g. 1x1 PNG data URIs or local buffer fixtures).
5. **Print Dialog Interception**:
   - Override `window.print()` in Playwright test context before clicking the PDF print button:
     ```typescript
     await page.evaluate(() => { window.print = () => { (window as any).__printed = true; }; });
     ```

---

## 6. Actionable Package.json Script Recommendations

In `package.json`, add the following scripts:
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "test:unit": "vitest run",
    "test:e2e": "playwright test",
    "test:all": "npm run test:unit && npm run test:e2e"
  }
}
```

---

## 7. Conclusion & Next Steps for Implementer

All 11 R2 E2E flows have been thoroughly surveyed, analyzed, and mapped to concrete DOM selectors, routes, and validation behaviors. The codebase is well-structured for end-to-end testing with clean component boundaries, accessible labels, and robust form validation rules.

The Implementer agent can now directly proceed with creating `playwright.config.ts`, setting up `tests/e2e/` test files, and configuring `package.json` scripts.
