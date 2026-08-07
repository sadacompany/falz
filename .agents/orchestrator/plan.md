# Orchestration Plan — Falz Automated Test Suite

## Overview
Build a production-grade automated test suite for the Falz real estate SaaS platform (Next.js 16 + Prisma + PostgreSQL) covering all 14 feature modules (F1-F14), server actions (`src/lib/actions/`), API routes (`src/app/api/`), Playwright E2E browser flows (R2), and infrastructure setup in `d:\falz\tests\`.

## Survey Findings Summary (Phase 0 Complete)
- **Explorer 1 (Server Logic & API)**: Mapped 929-line Prisma schema (21 models, 13 enums), 15 server action modules (`properties.ts`, `owners.ts`, `leads.ts`, `locations.ts`, `subtypes.ts`, `requests.ts`, `analytics.ts`, `admin.ts`, etc.), 5 API route domains (`upload`, `locations`, `subtypes`, `requests`, `auth/billing`), and core utilities (`normalizeDecimal`, `whatsapp`, `auth-utils`).
- **Explorer 2 (Feature Modules F1-F14)**: Mapped exact business rules, line numbers, error messages, and validation constraints for all 14 modules.
- **Explorer 3 (Test Infrastructure & E2E Flows)**: Mapped all 11 R2 E2E browser flows to DOM selectors, validation error strings, authentication bypasses (`+966500000001` / `123456`), and Playwright test architecture.

## Execution Strategy (Milestone Breakdown)

### Milestone 1 (M1): Test Infrastructure & Fixtures Setup
- **Subagent**: `worker_infra_1` (`teamwork_preview_worker`)
- **Working directory**: `d:\falz\.agents\worker_infra_1`
- **Deliverables**:
  - Install devDependencies (`vitest`, `@vitest/coverage-v8`, `@playwright/test`) in `package.json`.
  - Add npm scripts (`test:unit`, `test:e2e`, `test:all`) to `package.json`.
  - Create `vitest.config.ts` (alias resolution `@/*` -> `./src/*`, node environment, setup files).
  - Create `playwright.config.ts` (baseUrl `http://localhost:3000`, browser configuration, webServer auto-start).
  - Create test fixtures in `tests/fixtures/`:
    - `prisma-mock.ts` (vitest-mock-extended or manual mock for PrismaClient)
    - `auth-mock.ts` (mock session/cookies for `getCurrentUser`, `requireAuth`, `requireRole`)
    - `test-data.ts` (seeded mock offices, users, properties, owners, bids, locations)

### Milestone 2 (M2): Unit & Integration Test Suite
- **Subagent**: `worker_unit_1` (`teamwork_preview_worker`)
- **Working directory**: `d:\falz\.agents\worker_unit_1`
- **Deliverables**:
  - 80+ unit/integration tests in `tests/unit/` covering:
    - Module F1: Sale/Rent dealType query isolation and default tab behavior.
    - Module F2: REGA compliance validation (`nationalId` & `dob` enforcement).
    - Module F3: Bidding engine (`bidAutoHideDuration` 6 enum values, `showBidDate` toggle, `"يوجد سوم"`, backdated bids).
    - Module F4: Payment method filter logic (Cash vs Bank).
    - Module F5: Saudi locations API & role-gating (`OWNER`/`MANAGER` custom district creation).
    - Module F6: Listing specs & `normalizeDecimal` (5 input variants including `٫`).
    - Module F7: Media engine (100-file limit, cover photo, re-ordering, mime/size checks).
    - Module F8: Client requests API (auth/guest request creation, visitor record linking, notifications).
    - Module F9: Status engine (`RESERVED` timestamp, button gating, `checkAndArchiveExpiredContracts`).
    - Module F10: Analytics KPI calculations (`getDashboardStats`).
    - Module F11: Masterplan picker (plot status filtering, aggregations, price-per-meter).
    - Module F12: WhatsApp text generator (Sale/Rent/Bid) & PDF flyer modal.
    - Module F13: UI/UX RTL direction & Arabic locale formatting (`ar-SA-u-nu-latn`).
    - Module F14: Custom subtypes API (CRUD & RBAC).
    - Server actions: >= 3 test cases per action across `properties.ts`, `owners.ts`, `leads.ts`, `locations.ts`, `subtypes.ts`, `requests.ts`, `analytics.ts`, `admin.ts`.
    - API routes: >= 2 test cases per route (`/api/upload`, `/api/locations/*`, `/api/subtypes`, `/api/requests`).

### Milestone 3 (M3): End-to-End Browser Test Suite (Playwright)
- **Subagent**: `worker_e2e_1` (`teamwork_preview_worker`)
- **Working directory**: `d:\falz\.agents\worker_e2e_1`
- **Deliverables**:
  - 15+ Playwright E2E browser tests in `tests/e2e/` covering:
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

### Milestone 4 (M4): Verification, Review & Forensic Audit
- **Subagents**: `reviewer_1`, `reviewer_2` (`teamwork_preview_reviewer`), `challenger_1` (`teamwork_preview_challenger`), `auditor_1` (`teamwork_preview_auditor`).
- Run `npm run test:all` and verify exit code 0.
- Verify zero hardcoded test shortcuts or dummy implementations.
