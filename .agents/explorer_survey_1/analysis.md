# Comprehensive Technical Analysis: Server-Side Architecture of Falz

## 1. Executive Summary & Overview
This survey provides a complete, granular architectural map of the server-side components in the Falz multi-tenant real estate SaaS platform (Next.js 16 + Prisma + PostgreSQL).
The codebase leverages Prisma ORM for database access with multi-tenant isolation via `officeId`, Next.js Server Actions for internal dashboard operations, and standard App Router Route Handlers (`route.ts`) for file uploads, location queries, public forms, and administrative endpoints.

---

## 2. Prisma Database Schema & Models (`prisma/schema.prisma`)

### Core Models & Purpose
1. **Plan & Subscription & Invoice**: Multi-tenant billing engine. `Plan` holds tier definitions and feature flags; `Subscription` maps an `Office` to a `Plan` (`ACTIVE`, `PAST_DUE`, `CANCELLED`, `GRACE_PERIOD`, `EXPIRED`, `TRIALING`); `Invoice` tracks payments (`PENDING`, `PAID`, `FAILED`, `REFUNDED`).
2. **Office (Tenant)**: Core tenant model. Contains branding (`name`, `nameAr`, `logo`), contact info (`phone`, `email`, `whatsapp`), location (`city`, `district`, `lat`, `lng`), FAL license (`falLicenseNo`), domains (`customDomain`, `subdomain`), and JSON configurations (`pageSections`, `pageVisibility`, `socialLinks`).
3. **ThemeSettings**: Custom styling per office (`preset`, `primaryColor`, `accentColor`, `fontFamily`, `borderRadius`, `cardStyle`).
4. **User & Membership**: User identity model (`phone`, `email`, `passwordHash`, `isSuperAdmin`). `Membership` links `User` to `Office` with RBAC `Role` (`OWNER`, `MANAGER`, `AGENT`). `Invitation` manages email invites token-based.
5. **AgentProfile**: Public real estate agent bio, specialties, contact info, and custom slug.
6. **Property**: Core listing entity (`title`, `titleAr`, `slug`, `price` BigInt, `dealType` `SALE`/`RENT`, `propertyType` `APARTMENT`/`VILLA`/`LAND`..., `category` `RESIDENTIAL`/`COMMERCIAL`/`AGRICULTURAL`, `availability` `AVAILABLE`/`SOLD`/`RENTED`/`RESERVED`, `status` `DRAFT`/`PUBLISHED`/`ARCHIVED`, `pricingModel` `LIMIT`/`BID`, `paymentMethod` `CASH`/`BANK_AND_CASH`, `showBidDate`, `bidAutoHideDuration`, `masterBedrooms`, `entryType`, `autoArchiveOnExpiry`, `contractExpiryDate`).
7. **PropertyBid**: Individual bids linked to a property (`amount` BigInt, `bidderName`, `bidderPhone`, `bidDate`).
8. **SaudiCity & SaudiDistrict**: Pre-populated Saudi geography. Custom districts link to `officeId` with composite unique constraint `@@unique([cityId, nameAr, officeId])`.
9. **PropertyMedia**: Media assets for listings (`url`, `type` `IMAGE`/`VIDEO`, `sortOrder`). Max 100 media items per listing (checked in business logic/plan).
10. **PropertyOwner**: REGA compliance owner record (`name`, `phone`, `dob`, `nationalId`, `type` `OWNER`/`AGENT`/`HEIRS_REPRESENTATIVE`). Unique constraint on `@@unique([officeId, phone])` and `@@unique([officeId, nationalId])`.
11. **BlogPost & BlogCategory & BlogTag**: Tenant blog engine. Multi-category and multi-tag relations.
12. **Lead & LeadActivity**: CRM lead engine (`status` `NEW`/`CONTACTED`/`QUALIFIED`/`CLOSED`, `source` `CONTACT_FORM`/`PROPERTY_INQUIRY`/`WHATSAPP_CLICK`/`PHONE_CLICK`/`MANUAL`, `category`, `dealOutcome`, `team`, `isReceived`, `reqBudget`, `reqRooms`, `reqArea`).
13. **AnalyticsEvent**: Event tracking (`page_view`, `property_view`, `lead_submit`, `whatsapp_click`, `phone_click`).
14. **Notification**: In-app notifications for office users.
15. **Visitor & Favorite & PropertyRequest**: Public buyer portal user entity (`phone`, `email`), saved properties (`Favorite`), and formal inquiries (`PropertyRequest`: `INTEREST`/`VIEWING`/`INFO`, `status` `PENDING`/`RESPONDED`/`CLOSED`).
16. **ContactMessage**: General platform contact messages.
17. **AuditLog**: Audit logging for all sensitive tenant operations (`officeId`, `userId`, `action`, `entity`, `entityId`, `details`, `ip`).
18. **Signboard**: Physical sign board tracking (`title`, `phone`, `status` `AVAILABLE`/`INSTALLED`/`MAINTENANCE`/`REMOVED`).
19. **MissedCall**: Call logging (`phone`, `userId`, `status` `PENDING`/`RESOLVED`).
20. **Reminder**: Follow-up task reminders (`leadName`, `leadPhone`, `dueDate`, `priority`, `completed`).
21. **PropertySubtype**: Custom property sub-categorization per office (`name`, `category`).

---

## 3. Comprehensive Server Actions Inventory (`src/lib/actions/*`)

### 3.1 Properties Actions (`src/lib/actions/properties.ts`)
- **`getProperties(filters: PropertyFilters)`**
  - *Params*: `{ status?, dealType?, propertyType?, category?, subtypeId?, paymentMethod?, search?, page?, pageSize?, sortBy?, sortOrder? }`
  - *Return*: `{ properties: Array<Property & { price: string, bids: Array<{ amount: string }> }>, pagination }`
  - *Validation & Edge Cases*: Validates `sortBy` against `ALLOWED_SORT_FIELDS` (`createdAt`, `updatedAt`, `price`, `status`, `title`) to prevent Prisma query injection. Triggers contract auto-archiving check for office before returning. Converts `BigInt` `price` and `amount` to string.
- **`getProperty(id: string)`**
  - *Params*: `id: string`
  - *Return*: `Property & relations` with stringified BigInts, or `null`.
  - *Validation*: Enforces multi-tenant `tenantWhere(officeId)`.
- **`createProperty(input: CreatePropertyInput)`**
  - *Params*: `CreatePropertyInput` object (title, price, dealType, propertyType, etc.)
  - *Return*: Created property object with stringified price.
  - *Validation & Edge Cases*: Generates unique slug via `slugify`. Disambiguates duplicate slugs with timestamp suffix. Preserves lat/lng zero values (`lat !== undefined ? input.lat : null`). Supports initial bid creation if `pricingModel === 'BID'`. Logs audit log.
- **`updateProperty(id: string, input: Partial<CreatePropertyInput>)`**
  - *Params*: `id: string`, update payload
  - *Return*: Updated property object.
  - *Validation & Edge Cases*: Ensures `officeId` in mutation clause (`where: { id, officeId }`) to prevent TOCTOU race conditions. Manages `soldAt` and `reservedAt` timestamps based on `availability` state transitions. Creates `PropertyBid` if `newBid` is provided.
- **`deleteProperty(id: string)`**
  - *Params*: `id: string`
  - *Return*: `{ success: true }`
  - *Validation*: Enforces role check (`OWNER`, `MANAGER` only). Tenant isolation check.
- **`bulkDeleteProperties(ids: string[])`**
  - *Params*: `ids: string[]`
  - *Return*: `{ success: true }`
  - *Validation*: Role check (`OWNER`, `MANAGER` only). Deletes only within tenant.
- **`bulkPublishProperties(ids: string[])`**
  - *Params*: `ids: string[]`
  - *Return*: `{ success: true }`
  - *Validation*: Role check (`OWNER`, `MANAGER` only). Sets `status = 'PUBLISHED'` and `publishedAt = new Date()`.
- **`getPropertyStats()`**
  - *Params*: None
  - *Return*: `{ total, published, draft, archived }`
- **`getAgents()`**
  - *Params*: None
  - *Return*: List of active office agents for assignment.
- **`checkAndArchiveExpiredContracts(officeId: string)`**
  - *Params*: `officeId: string`
  - *Return*: `number` (count of archived properties)
  - *Validation & Edge Cases*: Query properties where `status === 'PUBLISHED'`, `autoArchiveOnExpiry === true`, and `contractExpiryDate <= now`. Batch updates status to `ARCHIVED` and generates notifications for all active office members.

---

### 3.2 Owners Actions (`src/lib/actions/owners.ts`)
- **`getOwners(filters: OwnerFilters)`**
  - *Params*: `{ search?, page?, pageSize? }`
  - *Return*: `{ owners, pagination }`
- **`getOwner(id: string)`**
  - *Params*: `id: string`
  - *Return*: Owner profile with linked properties (prices stringified) or `null`.
- **`createOwner(input: CreateOwnerInput)`**
  - *Params*: `{ name, phone, dob?, nationalId?, type?, notes?, propertyIds? }`
  - *Return*: Created owner object.
  - *Validation & Edge Cases*: **REGA Compliance Enforcement**: Throws error if `name`, `phone`, `nationalId`, or `dob` is missing (`"رقم الهوية وتاريخ الميلاد إجباريان لبلاغات الهيئة العامة للعقار (REGA)"`). Checks duplicate phone in same office via `officeId_phone` index. Links initial properties if `propertyIds` provided. Logs audit.
- **`updateOwner(id: string, input: Partial<CreateOwnerInput>)`**
  - *Params*: `id: string`, update payload
  - *Return*: Updated owner object.
  - *Validation*: Checks phone uniqueness if updated. Enforces `officeId` in mutation clause. Handles property unlinking and relinking.
- **`deleteOwner(id: string)`**
  - *Params*: `id: string`
  - *Return*: `{ success: true }`
  - *Validation*: Tenant isolation check. Mutation includes `officeId`.

---

### 3.3 Leads & CRM Actions (`src/lib/actions/leads.ts`)
- **`getLeads(filters: LeadFilters)`**
  - *Params*: `{ status?, source?, category?, team?, search?, agentId?, page?, pageSize? }`
  - *Return*: `{ leads, pagination }`
- **`getLead(id: string)`**
  - *Params*: `id: string`
  - *Return*: Lead record with property, agent, and activities.
- **`createLead(input: CreateLeadInput)`**
  - *Params*: `CreateLeadInput` object
  - *Return*: Created or merged Lead record.
  - *Validation & Edge Cases*: **Duplicate Phone Handling**: Searches existing lead by `phone` within `officeId`. If exists, updates existing lead with new request details, creates a note activity ("تم تحديث بيانات العميل..."), logs audit, and returns existing lead without throwing error. If new phone, creates new lead with `status = 'NEW'` and `createdById = user.id`.
- **`updateLead(id: string, input: Partial<CreateLeadInput>)`**
  - *Params*: `id: string`, input
  - *Return*: Updated Lead.
- **`updateLeadStatus(id: string, status: LeadStatus, dealOutcome?: string | null)`**
  - *Params*: `id: string`, `status`, optional `dealOutcome`
  - *Return*: Updated Lead.
  - *Validation & Edge Cases*: If `status === 'CLOSED'`, saves `dealOutcome`. Otherwise clears `dealOutcome`. Records `status_change` lead activity with metadata.
- **`assignLeadAgent(id: string, agentId: string | null)`**
  - *Params*: `id: string`, `agentId` (or null)
  - *Return*: Updated Lead.
  - *Validation*: Sets `isReceived = true` if assigned, `false` if unassigned. Records `assignment` lead activity.
- **`routeLead(id: string, input: { team?, agentId?, isReceived? })`**
  - *Params*: `id: string`, routing configuration
  - *Return*: Updated Lead.
  - *Validation & Edge Cases*: Queue routing logic: If `team` is provided, disconnects `agentId` and sets `isReceived = false`. If `agentId` is provided, sets `isReceived = true` and clears `team`. Records activity.
- **`addLeadNote(id: string, content: string)`**
  - *Params*: `id: string`, `content: string`
  - *Return*: Created `LeadActivity`.
- **`getLeadStats()`**
  - *Params*: None
  - *Return*: `{ total, new, contacted, qualified, closed }`
- **`getCRMStats()`**
  - *Params*: None
  - *Return*: `{ counts: { total, new, negotiating, done }, charts: { byStage, byCategory, closingReasons, agentRankings } }`
- **`getLinkedVisitorData(leadId: string)`**
  - *Params*: `leadId: string`
  - *Return*: Visitor record matching lead's phone number with their favorites and property requests.
- **`deleteLead(id: string)`**
  - *Params*: `id: string`
  - *Return*: `{ success: true }`
- **`claimLead(id: string)`**
  - *Params*: `id: string`
  - *Return*: Assigns current user to lead.
- **`getLeadsReportsData()`**
  - *Params*: None
  - *Return*: Array of up to 500 leads with activities and property info. Memory safety capped (`take: 500`).

---

### 3.4 Locations Actions (`src/lib/actions/locations.ts`)
- **`getSaudiCities()`**
  - *Params*: None
  - *Return*: All Saudi cities sorted by `nameAr`. Public read.
- **`getSaudiDistricts(cityId: string)`**
  - *Params*: `cityId: string`
  - *Return*: System districts (`officeId: null`) plus office custom districts (`officeId: currentOffice`).
- **`createCustomDistrict(input: { cityId: string, nameAr: string, name?: string, direction?: string })`**
  - *Params*: District input object
  - *Return*: Created `SaudiDistrict` record.
  - *Validation & Edge Cases*: **Role Gate**: `OWNER` or `MANAGER` only (`requireRole(officeId, ['OWNER', 'MANAGER'])`). Trims `nameAr`. Throws error if `cityId` or `nameAr` is missing. Checks duplicate district within office (`cityId`, `nameAr`, `officeId`).

---

### 3.5 Subtypes Actions (`src/lib/actions/subtypes.ts`)
- **`getSubtypes(category?: PropertyCategory)`**
  - *Params*: Optional `category`
  - *Return*: List of custom property subtypes for office.
  - *Validation & Edge Cases*: **Lazy Seeding**: If count for office is 0, auto-seeds default set (`DEFAULT_SUBTYPES` for Residential, Commercial, Agricultural) into `PropertySubtype` table for this office.
- **`createSubtype(name: string, category: PropertyCategory)`**
  - *Params*: `name: string`, `category: PropertyCategory`
  - *Return*: Created `PropertySubtype`.
  - *Validation*: Role gate (`OWNER`, `MANAGER` only). Checks composite unique constraint (`officeId`, `name`, `category`).
- **`deleteSubtype(id: string)`**
  - *Params*: `id: string`
  - *Return*: `{ success: true }`
  - *Validation*: Role gate (`OWNER`, `MANAGER` only). Tenant isolation check.

---

### 3.6 Property Requests Actions (`src/lib/actions/requests.ts`)
- **`getPropertyRequests(params?)`**
  - *Params*: `{ page?, limit?, status?, type?, search? }`
  - *Return*: Paginated property requests for office.
- **`updateRequestStatus(requestId: string, status: 'PENDING' | 'RESPONDED' | 'CLOSED')`**
  - *Params*: `requestId`, `status`
  - *Return*: Updated request.
- **`respondToRequest(requestId: string, response: string)`**
  - *Params*: `requestId`, `response: string`
  - *Return*: Updated request with `respondedAt` date.
- **`getRequestStats()`**
  - *Params*: None
  - *Return*: `{ total, pending, responded, closed }`
- **`createPublicPropertyRequest(input: { propertyId, name, phone, email?, type?, message? })`**
  - *Params*: Visitor request payload
  - *Return*: Created `PropertyRequest`.
  - *Validation & Edge Cases*: Public action. Validates property presence and availability (`RESERVED`, `SOLD`, `RENTED` rejected with error). Finds or auto-creates `Visitor` record by phone for office. Creates request and generates in-app notifications for all office members.

---

### 3.7 Analytics Actions (`src/lib/actions/analytics.ts`)
- **`getDashboardStats()`**
  - *Params*: None
  - *Return*: Object containing KPIs: `totalProperties`, `totalLeads`, `leadsChange`, `totalViews`, `viewsChange`, `conversionRate`, `monthlySales`, `quarterlySales`, `recentLeads`, `topProperties`, `totalBids`, `totalOwners`, `recentListings`, `recentBids`.
- **`getLeadsOverTime(days?: number)`**
  - *Params*: `days` (default 30)
  - *Return*: Date-grouped lead counts array.
- **`getViewsByPropertyType()`**
  - *Params*: None
  - *Return*: View count grouped by localized Arabic property type labels.
- **`getAnalyticsData(days?: number)`**
  - *Params*: `days` (default 30)
  - *Return*: Full analytics stats including traffic sources, city distribution, and property view breakdown.
- **`getUnreadNotificationsCount()`**
  - *Params*: None
  - *Return*: Count of unread notifications for authenticated user.
- **`getVisitorMetrics()`**
  - *Params*: None
  - *Return*: Visitor activity KPIs, top favorited properties, and request type counts.

---

### 3.8 Admin Actions (`src/lib/actions/admin.ts`)
- **`getAdminStats()`**, **`getOffices()`**, **`approveOffice()`**, **`disableOffice()`**, **`getOfficeDetail()`**, **`getUsers()`**, **`toggleUserActive()`**, **`getPlans()`**, **`updatePlan()`**, **`getAuditLogs()`**, **`impersonateOffice()`**
  - *Access*: Restricted via `requireSuperAdmin()`.
  - *Impersonation*: `impersonateOffice` sets HTTP-only cookie `falz-impersonate-office` with 1-hour maxAge.

---

### 3.9 Team, Office, Blog, Reminders, Missed Calls, Visitors Actions
- **`team.ts`**: `getTeamMembers`, `changeMemberRole` (`OWNER` only), `removeMember` (`OWNER` only), `inviteMember` (`OWNER`/`MANAGER`), `getPendingInvitations`, `cancelInvitation`.
- **`office.ts`**: `getOfficeDetails`, `updateOfficeGeneral`, `updateOfficeTheme`, `updateOfficeSeo`, `updateOfficeSocial`, `updateOfficeDomain` (`OWNER` only), `updateOfficePageSections`, `updateOfficePageVisibility`, `updateOfficeLanguage`.
- **`blog.ts`**: CRUD for blog posts, categories, and tags.
- **`reminders.ts`**: `getReminders`, `createReminder`, `toggleReminderCompleted`, `deleteReminder`.
- **`missed-calls.ts`**: `getMissedCalls`, `createMissedCall` (SEC-2: `userId` always derived from session), `resolveMissedCall`.
- **`signboards.ts`**: CRUD for physical signboards with enum status (`AVAILABLE`, `INSTALLED`, `MAINTENANCE`, `REMOVED`).
- **`visitors.ts`**: `getVisitors`, `getVisitor`, `getVisitorStats`.

---

## 4. API Route Handlers Inventory (`src/app/api/*`)

| Route Path | HTTP Methods | Auth / Protection | Key Query/Body Parameters | Expected Response / Errors |
|------------|--------------|-------------------|---------------------------|----------------------------|
| `/api/upload` | POST | `auth()` required | FormData: `file` (File), `directory` (default 'uploads') | 200 `{ success: true, data: { url, path, filename, size, mimeType } }`. 401 Unauthorized, 400 NO_FILE/INVALID_TYPE/FILE_TOO_LARGE (Image <= 5MB, Video <= 50MB), 500 UPLOAD_FAILED |
| `/api/locations/cities` | GET | Public | None | 200 `{ cities: SaudiCity[] }`. 500 Error |
| `/api/locations/districts` | GET | `requireAuth()` | Query: `cityId` | 200 `{ districts: SaudiDistrict[] }` (system + office). 500 Error |
| `/api/locations/districts` | POST | `requireAuth()`, `requireRole(['OWNER','MANAGER'])` | Body: `{ cityId, nameAr, name?, direction? }` | 200 `{ district }`. 400 missing cityId/nameAr, 400 duplicate district error, 400 error |
| `/api/subtypes` | GET | `requireAuth()` | Query: `category` | 200 `{ subtypes: PropertySubtype[] }`. 400 Error |
| `/api/subtypes` | POST | `requireAuth()`, `requireRole(['OWNER','MANAGER'])` | Body: `{ name, category }` | 200 `{ subtype }`. 400 missing name/category, 400 duplicate error |
| `/api/requests` | POST | Public | Body: `{ propertyId, name, phone, email?, type?, message? }` | 200 `{ success: true, request }`. 400 property missing/unavailable, 400 Error |
| `/api/auth/[...nextauth]` | GET, POST | NextAuth handler | Credentials / Auth JS endpoints | Session handling |
| `/api/auth/otp/send` | POST | Public / Rate limited | Body: `{ phone }` | 200 OTP sent via Twilio/mock |
| `/api/auth/otp/verify` | POST | Public | Body: `{ phone, code }` | 200 Token/session created |
| `/api/auth/register` | POST | Public | Body: registration data | 200 Office & user created |
| `/api/billing/checkout` | POST | Auth required | Body: `{ planId }` | 200 Checkout session URL |
| `/api/billing/webhook` | POST | Webhook signature | Payment provider payload | 200 `{ received: true }` |
| `/api/dashboard/analytics/export-csv` | GET | Auth required | Query: `range` | CSV download attachment |
| `/api/dashboard/analytics/export-pdf` | GET | Auth required | Query: `range` | PDF download attachment |
| `/api/public/analytics` | POST | Public | Body: event tracking payload | 200 `{ success: true }` |
| `/api/public/leads` | POST | Public | Body: lead form submission | 200 `{ success: true }` |
| `/api/public/contact` | POST | Public | Body: contact form | 200 `{ success: true }` |
| `/api/public/visitors/login` | POST | Public | Body: `{ phone, password }` | 200 Visitor session cookie |
| `/api/public/visitors/register` | POST | Public | Body: `{ name, phone, password }` | 200 Visitor created |
| `/api/public/visitors/me` | GET | Visitor auth cookie | None | 200 Visitor profile |
| `/api/public/visitors/logout` | POST | Visitor auth | None | 200 Cookie cleared |
| `/api/public/visitors/favorites` | GET | Visitor auth | None | 200 List of favorited properties |
| `/api/public/visitors/favorites` | POST | Visitor auth | Body: `{ propertyId }` | 200 Favorite created |
| `/api/public/visitors/favorites/[propertyId]` | DELETE | Visitor auth | Route param: `propertyId` | 200 Favorite deleted |
| `/api/public/visitors/requests` | GET | Visitor auth | None | 200 List of visitor requests |
| `/api/admin/*` | GET, POST, PATCH | Super admin required | Admin management params | 200 Admin data / operations |

---

## 5. Core Utility Functions (`src/lib/*`)

### 5.1 `src/lib/utils.ts`
- **`cn(...inputs: ClassValue[])`**: Tailwind class merger via `clsx` and `tailwind-merge`.
- **`slugify(text: string)`**: URL-safe slug generator supporting Arabic transliteration (`lower: true`, `strict: true`, `trim: true`).
- **`formatPrice(amount: number | bigint, currency: string = 'SAR')`**: Formats prices using `Intl.NumberFormat('ar-SA-u-nu-latn')`.
- **`formatDate(date: Date | string, locale: string = 'ar-SA-u-nu-latn')`**: Formats date in Arabic locale.
- **`generatePreviewToken()`**: Generates 32-byte hex crypto token for private listing previews.
- **`parseReferrer(referrer)`**: Categorizes referrer URL into `'direct' | 'social' | 'search' | 'referral'`.

### 5.2 `normalizeDecimal` (Client-side helper in `src/app/(dashboard)/dashboard/properties/new/page.tsx:332`)
```typescript
const normalizeDecimal = (val: string): string => {
  return val.replace(/٫/g, '.').replace(/,/g, '.')
}
```
Replaces Arabic decimal separator `٫` (U+066B) and comma `,` with standard Latin decimal dot `.`.

### 5.3 `src/lib/whatsapp.ts`
- **`generatePropertyWhatsAppShareText(property)`**: Generates structured Arabic WhatsApp share text. Handles `SALE` (`للبيع`) vs `RENT` (`للإيجار`), property type, location (`district - city`), pricing model logic:
  - If `pricingModel === 'BID'`: Displays `"السوم الحالي: يوجد سوم"` if expired/hidden, or `"أعلى سومة: X ر.س"` if active.
  - If fixed price: Displays `"السعر المطلـوب: X ر.س"`.
  - Appends specifications (Area, Bedrooms, Bathrooms) and `publicUrl`.
- **`getWhatsAppShareLink(property)`**: Returns `https://wa.me/?text=${encodeURIComponent(text)}`.

### 5.4 `src/lib/auth-utils.ts`
- **`hashPassword(password)` / `verifyPassword(password, hash)`**: bcrypt wrapper with 12 salt rounds.
- **`getCurrentUser()`**: Fetches session user and active office memberships.
- **`requireAuth()`**: Throws `"Authentication required"` if not signed in.
- **`requireRole(officeId, roles)`**: Verifies user membership role (`OWNER`, `MANAGER`, `AGENT`) in specific office. Super admins bypass.
- **`requireSuperAdmin()`**: Throws if `!user.isSuperAdmin`.

---

## 6. Detailed Alignment with Feature Requirements (F1-F14)

| Feature | Requirement Focus | Server Action / File Location | Validation & Logic to Test |
|---------|-------------------|-------------------------------|----------------------------|
| **F1** | Sale/Rent `dealType` query isolation | `properties.ts`: `getProperties` | Filters `where.dealType`. Test querying `SALE` returns only sale properties, `RENT` returns rent properties. |
| **F2** | REGA compliance validation | `owners.ts`: `createOwner` | Requires `nationalId` & `dob`. Reject missing fields with Arabic error message. |
| **F3** | Bidding engine & timer logic | `properties.ts`, `whatsapp.ts`, `schema.prisma` | `bidAutoHideDuration` enum values (`ONE_MONTH`, `TWO_MONTHS`, `THREE_MONTHS`, `SIX_MONTHS`, `ONE_YEAR`, `NONE`), `"يوجد سوم"` WhatsApp text, backdated bid acceptance. |
| **F4** | Payment method filter logic | `properties.ts`: `getProperties` | `paymentMethod === 'BANK_AND_CASH'` filter vs `CASH` (cash returns all). |
| **F5** | Saudi locations & custom districts | `locations.ts`, `api/locations/districts` | GET returns system+office districts. POST custom district role-gated to `OWNER`/`MANAGER` only. |
| **F6** | Listing specs & decimal normalization | `properties.ts`, `new/page.tsx` | `masterBedrooms` counter, `bathrooms >= masterBedrooms`, `normalizeDecimal` for `.`, `,`, `٫`. |
| **F7** | Media engine limits | `api/upload/route.ts` | Image <= 5MB, Video <= 50MB, MIME type checks (`image/jpeg`, `video/mp4`, etc.). |
| **F8** | Client requests API | `requests.ts`, `api/requests/route.ts` | Guest request auto-creates/links `Visitor`, generates notifications for staff. |
| **F9** | Status engine & auto-archiving | `properties.ts`: `checkAndArchiveExpiredContracts` | Sets status `ARCHIVED` when `contractExpiryDate <= now` & `autoArchiveOnExpiry: true`. |
| **F10** | Analytics KPI calculations | `analytics.ts`: `getDashboardStats` | `conversionRate`, `leadsChange`, `viewsChange`, `monthlySales`, `quarterlySales`. |
| **F11** | Masterplan picker aggregations | `properties.ts`, `analytics.ts` | Price per meter, plot status counts. |
| **F12** | WhatsApp text generator | `whatsapp.ts`: `generatePropertyWhatsAppShareText` | Sale vs Rent vs Bid output format validation. |
| **F13** | UI/UX & Locale | `utils.ts`: `formatPrice`, `formatDate` | `ar-SA-u-nu-latn` locale formatting. |
| **F14** | Custom subtypes API | `subtypes.ts`, `api/subtypes/route.ts` | Lazy defaults seeding, CRUD role-gated to `OWNER`/`MANAGER`. |

---

## 7. Concrete Unit & Integration Test Case Plan

To satisfy the Acceptance Criteria of at least 80 unit/integration test cases across all 14 modules (with at least 3 cases per Server Action file and 2 cases per API route):

### Server Actions Test Matrix (45+ cases)
1. **Properties (`properties.ts`)**:
   - Test `getProperties` filters by `dealType`, `status`, `paymentMethod`, and custom `sortBy` allowlist.
   - Test `createProperty` generates disambiguated slugs and handles lat/lng 0 correctly.
   - Test `updateProperty` handles `soldAt` and `reservedAt` timestamps on status transition.
   - Test `deleteProperty` and `bulkDeleteProperties` role gating.
   - Test `checkAndArchiveExpiredContracts` auto-archives expired listings and creates notifications.
2. **Owners (`owners.ts`)**:
   - Test `createOwner` succeeds with valid REGA inputs (`nationalId`, `dob`).
   - Test `createOwner` throws error when `nationalId` or `dob` is missing.
   - Test `createOwner` throws error on duplicate phone in same office.
   - Test `updateOwner` and `deleteOwner` multi-tenant protection.
3. **Leads (`leads.ts`)**:
   - Test `createLead` creates new lead when phone is unique.
   - Test `createLead` merges and updates existing lead when phone already exists in office.
   - Test `updateLeadStatus` sets/clears `dealOutcome` on `CLOSED` transition.
   - Test `routeLead` correctly toggles `team`, `agentId`, and `isReceived`.
4. **Locations (`locations.ts`)**:
   - Test `getSaudiDistricts` returns merged system and custom office districts.
   - Test `createCustomDistrict` allows `OWNER`/`MANAGER`.
   - Test `createCustomDistrict` rejects `AGENT` role.
5. **Subtypes (`subtypes.ts`)**:
   - Test `getSubtypes` auto-seeds default categories on first access for new office.
   - Test `createSubtype` rejects duplicate subtype name within same category.
   - Test `deleteSubtype` role gating.
6. **Requests (`requests.ts`)**:
   - Test `createPublicPropertyRequest` auto-creates/links `Visitor` by phone.
   - Test `createPublicPropertyRequest` rejects requests for `RESERVED`/`SOLD` properties.
7. **Analytics (`analytics.ts`)**:
   - Test `getDashboardStats` accurately calculates `conversionRate` and `leadsChange`.
8. **Admin, Team, Office, Blog, Reminders, Signboards, Missed Calls**:
   - Happy path, validation failure, and role-rejection test cases for each function.

### API Routes Test Matrix (35+ cases)
1. **`/api/upload`**:
   - Test valid JPEG upload succeeds (returns URL, size, mimeType).
   - Test unauthenticated request returns 401.
   - Test invalid file extension/MIME type returns 400 `INVALID_TYPE`.
   - Test file > 5MB returns 400 `FILE_TOO_LARGE`.
2. **`/api/locations/cities` & `/api/locations/districts`**:
   - Test GET `/api/locations/cities` returns city list.
   - Test POST `/api/locations/districts` creates district for `OWNER`/`MANAGER`.
   - Test POST `/api/locations/districts` returns 400 for non-OWNER/MANAGER.
3. **`/api/subtypes`**:
   - Test GET `/api/subtypes` returns list.
   - Test POST `/api/subtypes` validates required fields (`name`, `category`).
4. **`/api/requests`**:
   - Test POST `/api/requests` creates request for available property.
   - Test POST `/api/requests` returns 400 when mandatory fields (`propertyId`, `name`, `phone`) are missing.

### Utilities Test Matrix (10+ cases)
1. **`normalizeDecimal`**:
   - Test `"20٫5"` -> `"20.5"` (Arabic decimal separator `٫`).
   - Test `"20,5"` -> `"20.5"` (Comma).
   - Test `"20.5"` -> `"20.5"` (Standard dot).
   - Test `"100٫00"` -> `"100.00"`.
   - Test `"0٫5"` -> `"0.5"`.
2. **`generatePropertyWhatsAppShareText`**:
   - Test `SALE` listing output text.
   - Test `RENT` listing output text.
   - Test `BID` listing with active bid vs expired bid (`"يوجد سوم"`).
