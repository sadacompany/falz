# Technical Analysis Report: Feature Modules F1 – F14
**Project:** Falz Multi-Tenant Real Estate SaaS Platform  
**Explorer:** Explorer 2  
**Date:** 2026-08-06  

---

## Overview

This document presents the technical analysis of Feature Modules F1 through F14 in the Falz codebase (`d:\falz`). The findings provide exact file paths, line numbers, function signatures, database schema structures, and business logic validations needed to guide test implementation (unit, integration, and E2E Playwright tests).

---

## Detailed Technical Findings by Feature Module

### F1: Sale/Rent `dealType` Query Isolation and Default Tab Behavior
- **Primary Source Files:**
  - `prisma/schema.prisma` (lines 387–390)
  - `src/lib/actions/properties.ts` (lines 12, 103–186)
  - `src/app/(office)/[slug]/properties/page.tsx` (lines 45, 73–75)
  - `src/app/(office)/[slug]/properties/PropertiesPageClient.tsx` (lines 105–113)
  - `src/app/(office)/[slug]/page.tsx` (lines 127–131)
- **Data Model & Types:**
  - `DealType` Enum: `SALE` | `RENT`
  - Property model has `dealType DealType @default(SALE)`.
- **Query Isolation Logic:**
  - `getProperties(filters: PropertyFilters)` filters by `dealType` in Prisma:
    `...(dealType && { dealType })`
  - Public route handler (`/properties/page.tsx`):
    ```ts
    if (dealType && ['SALE', 'RENT'].includes(dealType)) {
      where.dealType = dealType as 'SALE' | 'RENT'
    }
    ```
  - Aggregate statistics (`getOfficeData` / `HomePage`): counts `totalForSale` (`dealType: 'SALE'`) and `totalForRent` (`dealType: 'RENT'`) independently.
- **Default Tab Behavior:**
  - `PropertiesPageClient.tsx` dropdown defaults `currentFilters.dealType` to `""` (all deal types). Selecting `"SALE"` or `"RENT"` updates URL query parameter `?dealType=SALE` or `?dealType=RENT`.

---

### F2: REGA Compliance Validation — `nationalId` & `dob` Required Enforcement
- **Primary Source Files:**
  - `prisma/schema.prisma` (lines 806–823)
  - `src/lib/actions/owners.ts` (lines 114–168)
  - `src/app/(dashboard)/dashboard/properties/new/page.tsx` (lines 356–360)
- **Data Model:**
  - `PropertyOwner` model includes `dob DateTime?`, `nationalId String?`.
  - Constraint: `@@unique([officeId, nationalId])` and `@@unique([officeId, phone])`.
- **Validation Enforcement:**
  - `createOwner(input)` in `src/lib/actions/owners.ts` (lines 120–122):
    ```ts
    if (!input.name?.trim() || !input.phone?.trim() || !input.nationalId?.trim() || !input.dob) {
      throw new Error('رقم الهوية وتاريخ الميلاد إجباريان لبلاغات الهيئة العامة للعقار (REGA)')
    }
    ```
  - Client-side validation in `new/page.tsx` (lines 358–359) prevents form submission and displays the exact Arabic error string if `nationalId` or `dob` is missing.

---

### F3: Bidding Engine — `bidAutoHideDuration` Timer, `showBidDate` Toggle, `"يوجد سوم"`, Backdated Bid Acceptance
- **Primary Source Files:**
  - `prisma/schema.prisma` (lines 314–316, 422–429, 916–928)
  - `src/lib/actions/properties.ts` (lines 70, 80–89, 292–293, 309–319, 428–429, 468–479)
  - `src/lib/whatsapp.ts` (lines 27–31)
- **Data Model & Enums:**
  - `PricingModel`: `LIMIT` | `BID`
  - `BidAutoHideDuration`: `ONE_MONTH`, `TWO_MONTHS`, `THREE_MONTHS`, `SIX_MONTHS`, `ONE_YEAR`, `NONE`
  - `showBidDate`: `Boolean @default(false)`
  - `PropertyBid`: `amount BigInt`, `bidderName String`, `bidderPhone String`, `bidDate DateTime @default(now())`
- **Engine Mechanics:**
  - **Backdated Bid Acceptance:** `createProperty` and `updateProperty` accept `newBid.bidDate`. If provided, it converts `new Date(input.newBid.bidDate)`, allowing historical or backdated bid timestamps.
  - **`showBidDate` Toggle:** Stores boolean on property. Sanitizes bid date visibility on public UI.
  - **"يوجد سوم" Display Logic:** In `generatePropertyWhatsAppShareText`:
    ```ts
    if (property.pricingModel === 'BID') {
      priceStr = property.isBidExpired ? 'السوم الحالي: يوجد سوم' : `أعلى سومة: ${property.price} ر.س`
    }
    ```
  - **`bidAutoHideDuration` Calculation:** Dictates time window after which public bid amounts are masked with `"يوجد سوم"` rather than showing explicit top bid figure.

---

### F4: Payment Method Filter Logic — Cash vs Bank
- **Primary Source Files:**
  - `prisma/schema.prisma` (lines 897–900)
  - `src/lib/actions/properties.ts` (lines 18, 127)
  - `src/app/(office)/[slug]/properties/page.tsx` (lines 93–95)
- **Data Model & Enum:**
  - `PaymentMethod`: `CASH` | `BANK_AND_CASH`
- **Filtering Logic:**
  - In `getProperties` (`src/lib/actions/properties.ts` line 127):
    `...(paymentMethod === 'BANK_AND_CASH' && { paymentMethod: 'BANK_AND_CASH' })`
  - In public query handler (`page.tsx` lines 93–95):
    ```ts
    if (paymentMethod === 'BANK_AND_CASH' || paymentMethod === 'BANK') {
      where.paymentMethod = 'BANK_AND_CASH'
    }
    ```
  - **Behavior:**
    - `CASH` or unselected: No filter is applied to `where`, returning all listings (both Cash-only and Bank-supported).
    - `BANK_AND_CASH` / `BANK`: Filter restricts results strictly to `paymentMethod: 'BANK_AND_CASH'`, excluding Cash-only listings.

---

### F5: Saudi Locations — City/District APIs, Custom District Role-Gating, Sector Direction Auto-Fill
- **Primary Source Files:**
  - `src/lib/actions/locations.ts` (lines 6–68)
  - `src/app/api/locations/cities/route.ts` (lines 4–16)
  - `src/app/api/locations/districts/route.ts` (lines 5–85)
  - `src/app/(dashboard)/dashboard/properties/new/page.tsx` (lines 203–219)
- **API & Role-Gating:**
  - `GET /api/locations/cities`: Returns all `SaudiCity` records ordered by `nameAr asc`.
  - `GET /api/locations/districts?cityId=...`: Returns system districts (`officeId: null`) plus tenant custom districts (`officeId: sessionOfficeId`).
  - `POST /api/locations/districts` / `createCustomDistrict`: Protected by `await requireRole(officeId, ['OWNER', 'MANAGER'])`. Rejects `AGENT` or unauthenticated requests with `400/403`.
- **Sector Direction Auto-Fill:**
  - In `handleSelectDistrict(districtId)` (`new/page.tsx` lines 203–219):
    Maps district `direction` (`NORTH`, `SOUTH`, `EAST`, `WEST`, `CENTER`) to Arabic sector strings (`'شمال'`, `'جنوب'`, `'شرق'`, `'غرب'`, `'وسط'`) and automatically populates the `directionalArea` state.

---

### F6: Listing Specs — Bedrooms/Bathrooms Constraint, Conditional Visibility, `normalizeDecimal`
- **Primary Source Files:**
  - `src/app/(dashboard)/dashboard/properties/new/page.tsx` (lines 332–355)
  - `src/lib/actions/properties.ts` (lines 41–42, 77)
- **Specification Constraints & Rules:**
  - `masterBedrooms` counter and `bathrooms >= masterBedrooms` constraint: On changing `bedrooms`, `handleBedroomsChange` automatically defaults `bathrooms` to `bedrooms + 1`.
  - **`normalizeDecimal` Utility Function:**
    `const normalizeDecimal = (val: string): string => val.replace(/٫/g, '.').replace(/,/g, '.')`
    Normalizes Arabic decimal separator `٫` (U+066B) and comma `,` into standard dot `.`.
  - **Conditional Visibility by Property Type:**
    `isLandSelected()` checks if property category is `AGRICULTURAL` or subtype name contains `"أرض"`. When true, hides room counters and built area fields. `isApartmentSelected()` shows floor number and master bedrooms counter.

---

### F7: Media Engine — 100-File Limit, Cover Photo Selection, Position Re-Ordering
- **Primary Source Files:**
  - `src/app/(dashboard)/dashboard/properties/new/page.tsx` (lines 257–305)
  - `src/app/api/upload/route.ts` (lines 6–70)
  - `src/lib/storage.ts`
- **Engine Rules:**
  - **100-File Limit Enforcement:** `MAX_MEDIA_LIMIT = 100`. Upload handler calculates `prev.length + newFiles.length`. If > 100, sets error message `"لا يمكن إرفاق أكثر من 100 صورة لكل عقار."` and truncates excess files.
  - **Cover Photo Selection:** `setAsCoverPhoto(index)` splices media at `index` and unshifts to `index 0` (assigned `sortOrder = 0` on submission).
  - **Position Re-ordering:** `moveMedia(fromIndex, toIndex)` splices and inserts item at target index to update display and `sortOrder`.
  - **Upload API Validation:** Image max 5MB (`jpeg`, `png`, `webp`, `gif`), Video max 50MB (`mp4`, `webm`).

---

### F8: Client Requests API — Auth/Guest Creation, Visitor Linking, Staff Notifications
- **Primary Source Files:**
  - `src/lib/actions/requests.ts` (lines 123–200)
  - `src/app/api/public/visitors/requests/route.ts` (lines 41–67)
  - `src/app/api/requests/route.ts`
- **Request Creation & Linking:**
  - `createPublicPropertyRequest(input)` accepts request from guest or authenticated visitor.
  - Checks if `Visitor` exists for `phone` and `officeId`. If not found, creates a new `Visitor` record and links request via `visitorId`.
- **Staff Notification Generation:**
  - Fetches active office memberships (`prisma.membership.findMany({ where: { officeId, isActive: true } })`).
  - Creates a `Notification` record for each staff user with `type: 'new_request'`, linking to `/dashboard/requests`.

---

### F9: Status Engine — `RESERVED` Status, Public Gating, Auto-Archiving Contracts
- **Primary Source Files:**
  - `prisma/schema.prisma` (lines 410–415, 321–322)
  - `src/lib/actions/properties.ts` (lines 410–414, 613–660)
  - `src/lib/actions/requests.ts` (lines 148–150)
- **Status & Timestamp Logic:**
  - Transitioning `availability` to `RESERVED` sets `reservedAt = new Date()`. Transitioning away resets `reservedAt = null`.
- **Public Button Gating:**
  - `createPublicPropertyRequest` throws error if property is `RESERVED`, `SOLD`, or `RENTED`:
    `"عذرًا، العقار غير متوفر حاليًا لتلقي الطلبات."`
  - Public UI badges display `"محجوز"` / `"مباع"` and disable request buttons.
- **Auto-Archiving Expired Contracts (`checkAndArchiveExpiredContracts`):**
  - Queries published properties where `autoArchiveOnExpiry: true` and `contractExpiryDate <= new Date()`.
  - Updates `status` to `ARCHIVED` and emits `Notification` (`type: 'property_archived'`) to office staff. Called inside `getProperties`.

---

### F10: Analytics — `getDashboardStats` KPI Calculations
- **Primary Source Files:**
  - `src/lib/actions/analytics.ts` (lines 18–267)
- **Calculations & Metrics:**
  - **Active Listings:** `prisma.property.count({ where: { officeId, status: 'PUBLISHED' } })`.
  - **Total Views:** Page views count over 30 days (`eventType: 'page_view'`).
  - **Total Leads:** Leads count over 30 days.
  - **Total Bids:** Count of bids on office properties (`prisma.propertyBid.count`).
  - **Conversion Rate:** `((totalLeads / totalViews) * 100).toFixed(1)` (parsed as Float).
  - **Growth Trends:** `leadsChange` and `viewsChange` calculated against previous 30-day window (`sixtyDaysAgo` to `thirtyDaysAgo`).

---

### F11: Masterplan Picker — Plot Status Filtering, Aggregations, Price/m²
- **Primary Source Files:**
  - `src/components/public/MasterplanPicker.tsx` (lines 7–199)
- **Picker Mechanics:**
  - **Plot Statuses:** `AVAILABLE` (green), `RESERVED` (amber), `SOLD` (red/disabled).
  - **Count Aggregations:**
    - `availableCount = plots.filter(p => p.status === 'AVAILABLE').length`
    - `reservedCount = plots.filter(p => p.status === 'RESERVED').length`
    - `soldCount = plots.filter(p => p.status === 'SOLD').length`
  - **Price-per-Meter Calculation:**
    `Math.round(selectedPlot.price / selectedPlot.area).toLocaleString('ar-SA')` (e.g. `SAR/m²`).

---

### F12: WhatsApp Text Generator & PDF Flyer Modal Rendering
- **Primary Source Files:**
  - `src/lib/whatsapp.ts` (lines 4–56)
  - `src/components/public/PropertyFlyerModal.tsx` (lines 7–176)
- **WhatsApp Share Generator:**
  - `generatePropertyWhatsAppShareText(property)` handles `SALE` ("للبيع") vs `RENT` ("للإيجار").
  - `BID` pricing model output: If `isBidExpired`, prints `"السوم الحالي: يوجد سوم"`, else `"أعلى سومة: {price} ر.س"`. Non-bid listings print `"السعر المطلـوب: {price} ر.س"`.
  - Includes property specifications line (`المساحة`, `غرف النوم`, `دورات المياه`) and full URL.
- **PDF Flyer Modal:**
  - `PropertyFlyerModal` renders printable A4 sheet with office branding (name, logo, FAL license), property details, price, cover photo, specifications grid, description, and contact info.
  - Invokes `window.print()` for print/PDF export.

---

### F13: UI/UX — RTL Direction, Arabic Locale Formatting, Semantic HTML
- **Primary Source Files:**
  - `src/components/shared/DirectionProvider.tsx` (lines 77–102)
  - `src/i18n/index.ts` (lines 35–44)
  - `src/lib/utils.ts` (lines 30–60)
  - `src/components/public/PublicFooter.tsx` (lines 80–235)
- **RTL & Locale Architecture:**
  - `DirectionProvider` synchronizes `<html dir="rtl" lang="ar-SA">`.
  - `formatPrice` uses `Intl.NumberFormat('ar-SA-u-nu-latn', ...)`. `formatDate` uses `Intl.DateTimeFormat('ar-SA-u-nu-latn', ...)`.
  - **Semantic HTML:** Utilizes `<main>`, `<header>`, `<nav>`, `<footer>`, `<section>`, `<article>`, and headings (`<h1>`–`<h4>`).

---

### F14: Custom Subtypes API — CRUD Operations & RBAC
- **Primary Source Files:**
  - `prisma/schema.prisma` (lines 902–914)
  - `src/lib/actions/subtypes.ts` (lines 41–126)
  - `src/app/api/subtypes/route.ts` (lines 5–37)
- **Data Model:**
  - `PropertySubtype` with `name`, `category: PropertyCategory` (`RESIDENTIAL`, `COMMERCIAL`, `AGRICULTURAL`), `@@unique([officeId, name, category])`.
- **API & Access Control:**
  - `getSubtypes(category)`: Auto-seeds default subtypes per category if office count is 0.
  - `createSubtype(name, category)`: Gated by `await requireRole(officeId, ['OWNER', 'MANAGER'])`.
  - `deleteSubtype(id)`: Gated by `await requireRole(officeId, ['OWNER', 'MANAGER'])`.
  - `GET /api/subtypes` and `POST /api/subtypes` expose endpoints with error handling.

---
