# Summary of Changes for Milestone 2 (Unit & Integration Test Suite)

## Files Created & Updated

### Test Infrastructure & Mocks (`tests/fixtures/`)
- `tests/fixtures/setup.ts`: Updated to globally mock `@/lib/auth-utils` and `@/lib/auth` to route through `auth-mock.ts` and prevent Node module resolution issues in Next.js Server environment.
- `tests/fixtures/test-data.ts`: Added `bids: []` to all property mock entities (`mockSaleProperty`, `mockRentProperty`, `mockBidProperty`, `mockLandProperty`, `mockApartmentProperty`, `mockReservedProperty`, `mockExpiredContractProperty`) and `properties: []` to `mockRegaOwner` for proper relation mapping during unit test execution.
- `package.json`: Fixed double closing brace formatting error on line 78 and updated `"test:unit"` script to `"npx vitest run"`.

### Unit & Integration Test Suite (`tests/unit/`)
1. `f1-deal-type.test.ts` (5 tests):
   - Tests `dealType` query isolation for `SALE` and `RENT` in `getProperties`.
   - Tests default tab behavior when `dealType` filter is omitted or empty.
   - Tests public URL query parameter parsing.

2. `f2-rega-validation.test.ts` (6 tests):
   - Tests REGA compliance validation (`nationalId` and `dob` mandatory enforcement).
   - Verifies exact error message `'رقم الهوية وتاريخ الميلاد إجباريان لبلاغات الهيئة العامة للعقار (REGA)'`.
   - Tests duplicate phone rejection with message `'رقم الهاتف مسجل بالفعل لمالك آخر في هذا المكتب'`.
   - Tests multi-tenant update and delete isolation.

3. `f3-bidding-engine.test.ts` (11 tests):
   - Tests `bidAutoHideDuration` timer calculations for ALL 6 enum values (`NONE`, `ONE_MONTH`, `TWO_MONTHS`, `THREE_MONTHS`, `SIX_MONTHS`, `ONE_YEAR`).
   - Tests `showBidDate` toggle sanitization.
   - Tests `"يوجد سوم"` display logic for active vs expired bids in WhatsApp share generator.
   - Tests backdated bid acceptance with explicit `bidDate` timestamps in `createProperty` and `updateProperty`.

4. `f4-payment-filter.test.ts` (4 tests):
   - Tests payment method filter logic (`BANK_AND_CASH` returns bank-supported only, `CASH` or empty returns all properties).
   - Tests public URL query parameter mapping for payment method.
   - Tests property creation with `CASH` vs `BANK_AND_CASH`.

5. `f5-locations-rbac.test.ts` (6 tests):
   - Tests `getSaudiCities` and `getSaudiDistricts` API responses.
   - Tests custom district creation role-gating (`OWNER` and `MANAGER` allowed, `AGENT` rejected with `'Insufficient permissions'`).
   - Tests sector direction auto-fill mapping (`NORTH` -> `'شمال'`, `SOUTH` -> `'جنوب'`, `EAST` -> `'شرق'`, `WEST` -> `'غرب'`, `CENTER` -> `'وسط'`).

6. `f6-specs-decimal.test.ts` (10 tests):
   - Tests `normalizeDecimal` with 5 input variants including Arabic decimal separator `٫` (`"123.45"`, `"123,45"`, `"123٫45"`, `"1000٫5"`, `"0٫75"`).
   - Tests specification constraints (`masterBedrooms` counter and `bathrooms >= masterBedrooms` constraint).
   - Tests conditional visibility by property type (land hides room counters/built area, residential apartments show floor number).

7. `f7-media-engine.test.ts` (6 tests):
   - Tests 100-file upload limit enforcement (`MAX_MEDIA_LIMIT = 100`) returning error `'لا يمكن إرفاق أكثر من 100 صورة لكل عقار.'`.
   - Tests cover photo selection (`setAsCoverPhoto` moves item to index 0).
   - Tests position re-ordering (`moveMedia`).
   - Tests size & MIME type validations (image <= 5MB, video <= 50MB).

8. `f8-requests-api.test.ts` (6 tests):
   - Tests visitor auto-creation and linking by phone number.
   - Tests linking to existing visitor records.
   - Tests staff notification generation (`type: 'new_request'`).
   - Tests request rejection for `RESERVED`, `SOLD`, or `RENTED` properties with exact error `'عذرًا، العقار غير متوفر حاليًا لتلقي الطلبات.'`.
   - Tests `getPropertyRequests`, `updateRequestStatus`, and `respondToRequest`.

9. `f9-status-engine.test.ts` (5 tests):
   - Tests setting availability to `RESERVED` with `reservedAt` timestamp.
   - Tests resetting `reservedAt` timestamp to `null` when availability changes away from `RESERVED`.
   - Tests public request button gating.
   - Tests `checkAndArchiveExpiredContracts` auto-archiving logic for expired vs non-expired contract scenarios.

10. `f10-analytics.test.ts` (2 tests):
    - Tests `getDashboardStats` KPI calculations (active listings, views, conversion rate, leads, bids, sales sums).
    - Tests zero views edge case handling to prevent divide-by-zero NaN.

11. `f11-masterplan.test.ts` (4 tests):
    - Tests masterplan plot status filtering (`AVAILABLE`, `RESERVED`, `SOLD`).
    - Tests count aggregations (`availableCount`, `reservedCount`, `soldCount`).
    - Tests price-per-meter calculation `Math.round(price / area)`.

12. `f12-whatsapp-pdf.test.ts` (6 tests):
    - Tests `generatePropertyWhatsAppShareText` for `SALE`, `RENT`, and `BID` listing variants.
    - Tests `getWhatsAppShareLink` URL encoding.
    - Tests PDF flyer modal data rendering.

13. `f13-rtl-locale.test.ts` (7 tests):
    - Tests RTL direction metadata (`dir="rtl"`, `lang="ar-SA"`).
    - Tests Arabic locale formatting (`Intl.NumberFormat('ar-SA-u-nu-latn')`).
    - Tests `formatPrice` and `formatDate` utilities.
    - Tests `slugify` and `cn` helpers.

14. `f14-subtypes-api.test.ts` (6 tests):
    - Tests custom subtypes CRUD operations.
    - Tests lazy seeding of default categories on initial access when count is 0.
    - Tests role-based access control (`OWNER`/`MANAGER` allowed, `AGENT` rejected).

15. `server-actions.test.ts` (17 tests):
    - Exhaustive coverage of all server action functions in `src/lib/actions/` (`properties.ts`, `owners.ts`, `leads.ts`, `admin.ts`, `team.ts`, `office.ts`, `blog.ts`, `reminders.ts`, `missed-calls.ts`, `signboards.ts`, `visitors.ts`).

16. `api-routes.test.ts` (13 tests):
    - Exhaustive coverage of API route handlers in `src/app/api/` (`/api/locations/cities`, `/api/locations/districts`, `/api/subtypes`, `/api/requests`, `/api/upload`).
