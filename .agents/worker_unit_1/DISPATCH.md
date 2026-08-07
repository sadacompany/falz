## 2026-08-06T11:37:07Z

You are Worker Unit for the Falz Automated Test Suite project.
Your assigned working directory for metadata: d:\falz\.agents\worker_unit_1

MANDATORY INSTRUCTION: Read the original user request at d:\falz\.agents\ORIGINAL_REQUEST.md, project plan at d:\falz\PROJECT.md, and survey analyses at d:\falz\.agents\explorer_survey_1\analysis.md and d:\falz\.agents\explorer_survey_2\analysis.md first.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your Objective (Milestone 2: Unit & Integration Test Suite):
Implement a comprehensive unit and integration test suite using Vitest in `d:\falz\tests\unit\` covering all 14 feature modules F1-F14, all server actions in `src/lib/actions/`, and all API routes in `src/app/api/`.

Acceptance Criteria to satisfy:
1. **Total Test Count**: At least 80 unit/integration test cases across the suite.
2. **Server Actions Coverage**: Every server action function in `src/lib/actions/` must have at least 3 test cases (happy path, validation error, edge case).
3. **API Routes Coverage**: Every API route in `src/app/api/` must have at least 2 test cases (success, error).
4. **F1 (Deal Type Isolation)**: Test `dealType` query isolation for SALE/RENT and default tab behavior (`src/lib/actions/properties.ts`).
5. **F2 (REGA Validation)**: Test REGA compliance validation — `nationalId` and `dob` required enforcement, rejection of missing fields with exact message `'رقم الهوية وتاريخ الميلاد إجباريان لبلاغات الهيئة العامة للعقار (REGA)'` (`src/lib/actions/owners.ts`).
6. **F3 (Bidding Engine)**: Test `bidAutoHideDuration` timer calculation for ALL 6 enum values (`NONE`, `ONE_MONTH`, `TWO_MONTHS`, `THREE_MONTHS`, `SIX_MONTHS`, `ONE_YEAR`), `showBidDate` toggle sanitization, `"يوجد سوم"` display logic for expired bids, and backdated bid acceptance.
7. **F4 (Payment Method Filter)**: Test payment method filter logic — Cash returns all listings, Bank (`BANK_AND_CASH`) returns bank-supported only.
8. **F5 (Saudi Locations & Role Gating)**: Test city/district API responses, custom district creation role-gating (`OWNER`/`MANAGER` allowed, non-OWNER/MANAGER e.g. `AGENT` rejected), sector direction auto-fill (`NORTH` -> `'شمال'`).
9. **F6 (Listing Specs & normalizeDecimal)**: Test `masterBedrooms` counter, `bathrooms >= masterBedrooms` constraint error, conditional visibility by property type, and `normalizeDecimal` with AT LEAST 5 input variants including Arabic decimal separator `٫` (e.g. `"123.45"`, `"123,45"`, `"123٫45"`, `"1000٫5"`, `"0٫75"`).
10. **F7 (Media Engine)**: Test 100-file upload limit enforcement (`MAX_MEDIA_LIMIT = 100`), cover photo selection, position re-ordering, image/video size & MIME validations.
11. **F8 (Client Requests API)**: Test authenticated and guest request creation, visitor record linking, staff notification generation.
12. **F9 (Status Engine)**: Test `RESERVED` status with `reservedAt` timestamp, public button gating, `checkAndArchiveExpiredContracts` auto-archiving logic with expired and non-expired contract scenarios.
13. **F10 (Analytics KPIs)**: Test `getDashboardStats` KPI calculations (active listings, views, conversion rates, leads, bids).
14. **F11 (Masterplan Picker)**: Test plot status filtering, count aggregations (`availableCount`, `reservedCount`, `soldCount`), price-per-meter calculations (`Math.round(price / area)`).
15. **F12 (WhatsApp Text & PDF Flyer)**: Test `generatePropertyWhatsAppShareText` for Sale, Rent, and Bid listing variants; test PDF flyer modal data rendering.
16. **F13 (UI/UX RTL & Locale)**: Test RTL direction metadata, Arabic locale formatting (`Intl.NumberFormat('ar-SA-u-nu-latn')`).
17. **F14 (Custom Subtypes API)**: Test custom subtypes CRUD operations with role-based access control (OWNER/MANAGER vs AGENT rejection).

File structure to create in `d:\falz\tests\unit\`:
- `f1-deal-type.test.ts`
- `f2-rega-validation.test.ts`
- `f3-bidding-engine.test.ts`
- `f4-payment-filter.test.ts`
- `f5-locations-rbac.test.ts`
- `f6-specs-decimal.test.ts`
- `f7-media-engine.test.ts`
- `f8-requests-api.test.ts`
- `f9-status-engine.test.ts`
- `f10-analytics.test.ts`
- `f11-masterplan.test.ts`
- `f12-whatsapp-pdf.test.ts`
- `f13-rtl-locale.test.ts`
- `f14-subtypes-api.test.ts`
- `server-actions.test.ts`
- `api-routes.test.ts`

Verification Commands:
- Run `npm run test:unit` from `d:\falz` and verify ALL tests pass with exit code 0.
- Run `npx tsc --noEmit` from `d:\falz` and verify zero TypeScript errors.

Write `d:\falz\.agents\worker_unit_1\changes.md` and structured `d:\falz\.agents\worker_unit_1\handoff.md` including exact test execution count and output logs. Update `d:\falz\.agents\worker_unit_1\progress.md` as you complete each file.
