# Original User Request

## 2026-08-06T08:23:55Z

<USER_REQUEST>
Build a production-grade automated test suite for the Falz multi-tenant real estate SaaS platform (Next.js 16 + Prisma + PostgreSQL). The suite must cover all 14 feature modules with both unit/integration tests and end-to-end browser tests, achieving exhaustive coverage including happy paths, edge cases, validation errors, negative tests, boundary conditions, and role-based access controls.

Working directory: D:\falz\tests
Integrity mode: development

## Requirements

### R1. Unit & Integration Test Suite
Create a comprehensive unit and integration test suite using Vitest (or Jest) that tests all server-side logic, Prisma actions, API route handlers, and business rule validations across all 14 feature modules. Tests must cover:
- **F1:** Sale/Rent `dealType` query isolation and default tab behavior.
- **F2:** REGA compliance validation — `nationalId` and `dob` required enforcement, rejection of missing fields.
- **F3:** Bidding engine — `bidAutoHideDuration` timer calculation, `showBidDate` toggle sanitization, `"يوجد سوم"` display logic, backdated bid acceptance.
- **F4:** Payment method filter logic — Cash returns all listings, Bank returns bank-supported only.
- **F5:** Saudi locations — city/district API responses, custom district creation role-gating (`OWNER`/`MANAGER` only), sector direction auto-fill.
- **F6:** Listing specifications — `masterBedrooms` counter, `bathrooms >= masterBedrooms` constraint, conditional visibility by property type, `normalizeDecimal` for Arabic/Latin separators (`.`, `,`, `٫`).
- **F7:** Media engine — 100-file upload limit enforcement, cover photo selection, position re-ordering.
- **F8:** Client requests API — authenticated and guest request creation, visitor record linking, staff notification generation.
- **F9:** Status engine — `RESERVED` status with `reservedAt` timestamp, public button gating, `checkAndArchiveExpiredContracts` auto-archiving logic.
- **F10:** Analytics — `getDashboardStats` KPI calculations (active listings, views, conversion rates, leads, bids).
- **F11:** Masterplan picker — plot status filtering, count aggregations, price-per-meter calculations.
- **F12:** WhatsApp text generator — output format validation for Sale/Rent/Bid listings; PDF flyer modal rendering.
- **F13:** UI/UX — RTL direction, Arabic locale formatting, semantic HTML structure.
- **F14:** Custom subtypes API — CRUD operations with role-based access control.

### R2. End-to-End Browser Test Suite
Create a Playwright E2E test suite that exercises critical user flows through the actual running application. Tests must cover:
- Office dashboard login and navigation.
- Creating a property listing with all field types (sale, rent, land, apartment).
- REGA owner creation with validation errors.
- Bid configuration and public bid display behavior.
- Saudi city/district selection and custom district creation.
- Media upload with limit enforcement.
- Public property detail page viewing (price, specs, location, status badges).
- Guest property request submission flow.
- Reserved status visual indicators on public pages.
- WhatsApp share link generation.
- PDF brochure print modal opening.

### R3. Test Infrastructure & Configuration
Set up all necessary test infrastructure including:
- Test configuration files (vitest.config.ts, playwright.config.ts).
- Database test fixtures and seed data for isolated test runs.
- CI-compatible scripts in package.json (`test:unit`, `test:e2e`, `test:all`).
- Mocking strategies for Prisma client, authentication, and file uploads where needed.

## Acceptance Criteria

### Unit & Integration Tests
- [ ] At least 80 unit/integration test cases across all 14 modules.
- [ ] Every server action in `src/lib/actions/` has at least 3 test cases (happy path, validation error, edge case).
- [ ] Every API route in `src/app/api/` has at least 2 test cases (success, error).
- [ ] `normalizeDecimal` tested with at least 5 input variants including Arabic decimal separator `٫`.
- [ ] `bidAutoHideDuration` timer tested with all 6 enum values.
- [ ] `checkAndArchiveExpiredContracts` tested with expired and non-expired contract scenarios.
- [ ] `generatePropertyWhatsAppShareText` tested for Sale, Rent, and Bid listing variants.
- [ ] Role-gating tests verify that non-OWNER/MANAGER users are rejected for protected operations.
- [ ] All unit/integration tests pass with exit code 0 when run via `npm run test:unit`.

### E2E Browser Tests
- [ ] At least 15 end-to-end test scenarios covering the flows listed in R2.
- [ ] Tests include both positive flows (successful actions) and negative flows (validation rejections).
- [ ] All E2E tests pass with exit code 0 when run via `npm run test:e2e`.

### Infrastructure
- [ ] `npm run test:all` executes both suites sequentially and exits with code 0.
- [ ] Test files are organized in `D:\falz\tests\` with clear directory structure (e.g., `tests/unit/`, `tests/e2e/`).
- [ ] No modifications to production source code in `src/` are required to run tests (mocking handles dependencies).
</USER_REQUEST>
