# Handoff Report: Server-Side Architecture Survey (Falz Project)

## 1. Observation
- **Codebase Path**: `d:\falz`
- **Prisma Schema**: `prisma/schema.prisma` (929 lines, 21 models, 13 enums).
- **Server Actions Analyzed**:
  - `src/lib/actions/properties.ts` (661 lines, 10 functions)
  - `src/lib/actions/owners.ts` (269 lines, 5 functions)
  - `src/lib/actions/leads.ts` (763 lines, 14 functions)
  - `src/lib/actions/locations.ts` (69 lines, 3 functions)
  - `src/lib/actions/subtypes.ts` (127 lines, 3 functions)
  - `src/lib/actions/requests.ts` (201 lines, 5 functions)
  - `src/lib/actions/analytics.ts` (648 lines, 6 functions)
  - `src/lib/actions/admin.ts` (686 lines, 11 functions)
  - `src/lib/actions/team.ts`, `office.ts`, `blog.ts`, `reminders.ts`, `missed-calls.ts`, `signboards.ts`, `visitors.ts`.
- **API Route Handlers Analyzed**:
  - `src/app/api/upload/route.ts` (POST file upload with MIME/size limits)
  - `src/app/api/locations/cities/route.ts` & `districts/route.ts` (GET/POST endpoints)
  - `src/app/api/subtypes/route.ts` (GET/POST custom property subtypes)
  - `src/app/api/requests/route.ts` (POST public property inquiry)
  - Additional routes in `src/app/api/auth/*`, `billing/*`, `dashboard/*`, `public/*`, `admin/*`.
- **Utilities Analyzed**:
  - `src/lib/utils.ts` (`cn`, `slugify`, `formatPrice`, `formatDate`, `generatePreviewToken`, `parseReferrer`)
  - `src/app/(dashboard)/dashboard/properties/new/page.tsx:332` (`normalizeDecimal`)
  - `src/lib/whatsapp.ts` (`generatePropertyWhatsAppShareText`, `getWhatsAppShareLink`)
  - `src/lib/auth-utils.ts` (`hashPassword`, `verifyPassword`, `getCurrentUser`, `requireAuth`, `requireRole`, `requireSuperAdmin`)

## 2. Logic Chain
- **Server Actions Design**: All server actions utilize `requireAuth()` and `tenantWhere(officeId)` for multi-tenant isolation. Sensitive mutations (e.g. `deleteProperty`, `bulkPublishProperties`, `createCustomDistrict`, `createSubtype`) enforce RBAC via `requireRole(officeId, ['OWNER', 'MANAGER'])`.
- **REGA Compliance**: `createOwner` in `owners.ts` explicitly enforces non-null `nationalId` and `dob`, throwing a specific Arabic error if omitted.
- **CRM Lead Merging**: `createLead` in `leads.ts` checks for duplicate phone numbers within the same office; if found, it updates the existing record and creates a `note` activity rather than throwing a duplicate error.
- **Media Upload Limits**: `/api/upload` enforces MIME types (`ALLOWED_IMAGE_TYPES`, `ALLOWED_VIDEO_TYPES`) and maximum file sizes (5MB for images, 50MB for videos).
- **Subtype Seeding**: `getSubtypes` in `subtypes.ts` dynamically seeds default subtypes (`RESIDENTIAL`, `COMMERCIAL`, `AGRICULTURAL`) if an office has no custom subtypes defined.
- **Contract Expiry Auto-Archiving**: `checkAndArchiveExpiredContracts` queries listings with `autoArchiveOnExpiry: true` and `contractExpiryDate <= now`, updates status to `ARCHIVED`, and notifies office members.

## 3. Caveats
- No code modification was performed (read-only investigation).
- Tests must use Vitest/Playwright with mocked Prisma/Auth or isolated test database to achieve target coverage.

## 4. Conclusion
The server architecture is complete, well-structured, and fully mapped. All 14 feature modules have clear server-side entry points, role checks, and validation paths documented in `analysis.md`. The implementer can directly reference `analysis.md` to craft the Vitest unit/integration test suite.

## 5. Verification Method
- Inspect `d:\falz\.agents\explorer_survey_1\analysis.md` for full function-by-function breakdown, validation rules, and exact test requirements.
- Run `npx vitest` or `npm run test:unit` once test suites are created to verify assertions against these documented contracts.
