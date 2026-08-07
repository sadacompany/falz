# Project: Falz Automated Test Suite

## Architecture
- **Framework**: Vitest (Unit & Integration) + Playwright (End-to-End Browser Testing) against Next.js 16 + Prisma + PostgreSQL real estate SaaS platform.
- **Directory Layout**: All tests located in `d:\falz\tests\`.
  - `tests/fixtures/`: Database fixtures, Prisma mock context, Auth mocks, upload mocks.
  - `tests/unit/`: Vitest unit and integration test files (F1-F14 modules, server actions, API routes, utilities).
  - `tests/e2e/`: Playwright E2E browser test files (R2 user flows).
- **Configuration Files**: Root `vitest.config.ts` and `playwright.config.ts`.
- **Scripts in `package.json`**: `test:unit`, `test:e2e`, `test:all`.

## Feature Inventory
| # | Feature | Description | Target Component / File | Milestone | Source |
|---|---------|-------------|-------------------------|-----------|--------|
| 1 | F1: Deal Type Query Isolation | Sale/Rent query isolation & tab default behavior | `src/lib/actions/properties.ts`, `src/app/(office)/[slug]/properties/` | M2, M3 | R1, R2 |
| 2 | F2: REGA Compliance Validation | Enforcement of required nationalId & dob | `src/lib/actions/owners.ts`, `src/app/(dashboard)/dashboard/properties/new/` | M2, M3 | R1, R2 |
| 3 | F3: Bidding Engine Logic | bidAutoHideDuration (6 enums), showBidDate toggle, "يوجد سوم", backdated bids | `src/lib/actions/properties.ts`, `src/lib/whatsapp.ts`, `PropertyDetailClient.tsx` | M2, M3 | R1, R2 |
| 4 | F4: Payment Method Filter | Cash returns all, Bank returns bank-supported properties only | `src/lib/actions/properties.ts` | M2 | R1 |
| 5 | F5: Saudi Locations & Role Gating | City/district APIs, custom district creation role-gating (OWNER/MANAGER), sector auto-fill | `src/lib/actions/locations.ts`, `src/app/api/locations/`, `new/page.tsx` | M2, M3 | R1, R2 |
| 6 | F6: Listing Specs & Decimal Normalization | masterBedrooms counter, bathrooms >= masterBedrooms constraint, conditional visibility, normalizeDecimal (5 input variants) | `src/app/(dashboard)/dashboard/properties/new/page.tsx`, `src/lib/utils.ts` | M2, M3 | R1, R2 |
| 7 | F7: Media Engine | 100-file upload limit, cover photo selection, position reordering, mime/size checks | `src/app/(dashboard)/dashboard/properties/new/page.tsx`, `src/app/api/upload/route.ts` | M2, M3 | R1, R2 |
| 8 | F8: Client Requests API | Authenticated/guest request creation, visitor record linking, staff notifications | `src/lib/actions/requests.ts`, `src/app/api/requests/route.ts`, `RequestButtons.tsx` | M2, M3 | R1, R2 |
| 9 | F9: Status Engine | RESERVED status, reservedAt timestamp, public button gating, checkAndArchiveExpiredContracts | `src/lib/actions/properties.ts`, `PropertyDetailClient.tsx` | M2, M3 | R1, R2 |
| 10 | F10: Analytics KPIs | getDashboardStats calculation (listings, views, conversion rate, leads, bids) | `src/lib/actions/analytics.ts` | M2 | R1 |
| 11 | F11: Masterplan Picker | Plot status filtering, count aggregations, price-per-meter calculation | `src/components/public/MasterplanPicker.tsx` | M2 | R1 |
| 12 | F12: WhatsApp Text & PDF Flyer | Formatted share text for Sale/Rent/Bid, PDF flyer modal window.print | `src/lib/whatsapp.ts`, `src/components/public/PropertyFlyerModal.tsx` | M2, M3 | R1, R2 |
| 13 | F13: UI/UX RTL & Locale | RTL direction, Arabic locale formatting (`ar-SA-u-nu-latn`) | `DirectionProvider.tsx`, `src/lib/utils.ts` | M2, M3 | R1, R2 |
| 14 | F14: Custom Subtypes API | Subtypes CRUD with role-based access control (OWNER/MANAGER) | `src/lib/actions/subtypes.ts`, `src/app/api/subtypes/route.ts` | M2 | R1 |
| 15 | Server Actions Suite | >= 3 test cases per action in `src/lib/actions/` (happy path, validation error, edge case) | `src/lib/actions/*.ts` | M2 | R1 |
| 16 | API Routes Suite | >= 2 test cases per route in `src/app/api/` (success, error) | `src/app/api/**/*.ts` | M2 | R1 |
| 17 | E2E User Flows (R2) | 15+ Playwright browser test scenarios covering login, property creation, REGA, bidding, media, detail viewing, guest request, reserved status, WhatsApp, PDF flyer | `tests/e2e/*.spec.ts` | M3 | R2 |
| 18 | Infrastructure Setup | vitest.config.ts, playwright.config.ts, package.json scripts (test:unit, test:e2e, test:all), fixtures | Root config files & `tests/fixtures/` | M1 | R3 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Test Infrastructure & Fixtures Setup | vitest.config.ts, playwright.config.ts, package.json scripts, mock contexts (Prisma, Auth, Uploads), fixtures | None | DONE |
| M2 | Unit & Integration Test Suite | 118 Vitest test cases covering modules F1-F14, server actions (>=3 per action), API routes (>=2 per route), normalizeDecimal (5 variants), bidAutoHideDuration (6 enums), contract auto-archive, WhatsApp share text | M1 | DONE |
| M3 | End-to-End Browser Test Suite | 23 Playwright E2E test scenarios covering all R2 user flows (positive and negative cases) | M1 | DONE |
| M4 | Final Integration, Verification & Audit | Execute `npm run test:all`, verify exit code 0, complete Reviewer & Forensic Auditor gate checks | M2, M3 | IN_PROGRESS |

## Code Layout
```
d:\falz\
├── vitest.config.ts
├── playwright.config.ts
├── package.json (with test:unit, test:e2e, test:all)
└── tests/
    ├── fixtures/
    │   ├── prisma-mock.ts
    │   ├── auth-mock.ts
    │   ├── test-data.ts
    │   └── setup.ts
    ├── unit/
    │   ├── infra-sanity.test.ts
    │   ├── f1-deal-type.test.ts
    │   ├── f2-rega-validation.test.ts
    │   ├── f3-bidding-engine.test.ts
    │   ├── f4-payment-filter.test.ts
    │   ├── f5-locations-rbac.test.ts
    │   ├── f6-specs-decimal.test.ts
    │   ├── f7-media-engine.test.ts
    │   ├── f8-requests-api.test.ts
    │   ├── f9-status-engine.test.ts
    │   ├── f10-analytics.test.ts
    │   ├── f11-masterplan.test.ts
    │   ├── f12-whatsapp-pdf.test.ts
    │   ├── f13-rtl-locale.test.ts
    │   ├── f14-subtypes-api.test.ts
    │   ├── server-actions.test.ts
    │   └── api-routes.test.ts
    └── e2e/
        ├── auth-flow.spec.ts
        ├── property-creation.spec.ts
        ├── rega-owner.spec.ts
        ├── bidding-flow.spec.ts
        ├── locations-media.spec.ts
        ├── public-property-detail.spec.ts
        ├── guest-requests.spec.ts
        ├── status-indicators.spec.ts
        └── whatsapp-pdf.spec.ts
```

## Interface Contracts
- **`npm run test:all`**: Runs `test:unit` followed by `test:e2e` sequentially. Exits code 0 on success.
