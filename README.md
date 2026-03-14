# FALZ - Real Estate Digital Infrastructure for Saudi Arabia

FALZ is a multi-tenant SaaS platform that provides Saudi real estate offices with modern digital infrastructure: branded websites, property listings, lead management, analytics, billing, and more. Each office gets its own branded microsite under `/o/{slug}` with full bilingual (Arabic/English) support and RTL layout.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 |
| Database | PostgreSQL |
| ORM | Prisma 6 |
| Authentication | NextAuth.js v5 (beta) |
| UI Components | Radix UI + custom components |
| Forms | React Hook Form + Zod validation |
| Charts | Recharts |
| PDF Export | jsPDF + jspdf-autotable |
| CSV Export | csv-stringify |
| i18n | next-intl (Arabic/English) |
| File Upload | Local filesystem / S3-compatible |
| Billing | Mock / Moyasar / Stripe |

## Prerequisites

- **Node.js** 20+ (LTS recommended)
- **PostgreSQL** 14+ (local or remote)
- **npm** 9+ (comes with Node.js)

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd falz-platform
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and set your database connection string:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/falz_dev?schema=public"
```

### 4. Set up the database

For development (quick setup without migration history):

```bash
npx prisma db push
```

Or with migration tracking (recommended for team workflows):

```bash
npx prisma migrate dev
```

### 5. Seed the database

```bash
npx prisma db seed
```

This creates plans, a sample office, users, properties, blog posts, leads, analytics events, and more.

### 6. Start the development server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the platform.

## Default Login Credentials

After seeding, the following accounts are available:

| Role | Email | Password | Access |
|------|-------|----------|--------|
| Super Admin | `admin@falz.sa` | `Admin123!` | `/admin` - Platform administration |
| Office Owner | `ahmed@dar-al-aseel.sa` | `Owner123!` | `/dashboard` - Full office management |
| Office Manager | `sara@dar-al-aseel.sa` | `Manager123!` | `/dashboard` - Office management (no billing) |
| Office Agent | `khalid@dar-al-aseel.sa` | `Agent123!` | `/dashboard` - Properties & leads |

The sample office public site is available at: [http://localhost:3000/o/dar-al-aseel](http://localhost:3000/o/dar-al-aseel)

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | (required) | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | (required) | Random secret for JWT signing (min 32 chars) |
| `NEXTAUTH_URL` | `http://localhost:3000` | Canonical URL of the app |
| `APP_URL` | `http://localhost:3000` | Public-facing URL of the app |
| `APP_NAME` | `FALZ` | Application name shown in UI |
| `STORAGE_PROVIDER` | `local` | File storage provider: `local` or `s3` |
| `S3_BUCKET` | - | S3 bucket name (when using S3 storage) |
| `S3_REGION` | - | S3 region |
| `S3_ACCESS_KEY` | - | S3 access key ID |
| `S3_SECRET_KEY` | - | S3 secret access key |
| `S3_ENDPOINT` | - | Custom S3 endpoint (for MinIO, DigitalOcean Spaces, etc.) |
| `EMAIL_PROVIDER` | `console` | Email provider: `console` (logs to terminal) or `smtp` |
| `SMTP_HOST` | - | SMTP server hostname |
| `SMTP_PORT` | `587` | SMTP server port |
| `SMTP_USER` | - | SMTP username |
| `SMTP_PASS` | - | SMTP password |
| `EMAIL_FROM` | `noreply@falz.sa` | Sender email address |
| `BILLING_PROVIDER` | `mock` | Billing provider: `mock`, `moyasar`, or `stripe` |
| `MOYASAR_API_KEY` | - | Moyasar secret API key |
| `MOYASAR_PUBLISHABLE_KEY` | - | Moyasar publishable key |
| `STRIPE_SECRET_KEY` | - | Stripe secret key |
| `STRIPE_PUBLISHABLE_KEY` | - | Stripe publishable key |
| `STRIPE_WEBHOOK_SECRET` | - | Stripe webhook signing secret |
| `UPLOADS_DIR` | `./public/uploads` | Local uploads directory path |

## Project Structure

```
falz-platform/
├── prisma/
│   ├── schema.prisma          # Database schema (all models)
│   └── seed.ts                # Seed data script
├── public/
│   └── uploads/               # Local file uploads
├── src/
│   ├── app/
│   │   ├── (admin)/           # Super admin pages
│   │   │   └── admin/
│   │   │       ├── audit/     # Audit log viewer
│   │   │       ├── offices/   # Office management
│   │   │       ├── plans/     # Plan management
│   │   │       └── users/     # User management
│   │   ├── (auth)/            # Authentication pages
│   │   │   └── auth/
│   │   │       ├── signin/    # Sign in page
│   │   │       └── signup/    # Sign up / register office
│   │   ├── (dashboard)/       # Office dashboard (tenant)
│   │   │   └── dashboard/
│   │   │       ├── analytics/ # Analytics & reports
│   │   │       ├── billing/   # Subscription & invoices
│   │   │       ├── blog/      # Blog CMS
│   │   │       ├── leads/     # Lead CRM
│   │   │       ├── properties/# Property CRUD
│   │   │       ├── settings/  # Office settings & theme
│   │   │       └── team/      # Team members & roles management
│   │   ├── (public)/          # Marketing / landing pages
│   │   ├── api/               # API routes
│   │   │   ├── admin/         # Admin API endpoints
│   │   │   ├── auth/          # Auth API (NextAuth + register)
│   │   │   ├── billing/       # Billing checkout & webhooks
│   │   │   ├── dashboard/     # Dashboard API (analytics export)
│   │   │   ├── public/        # Public API (leads, analytics tracking)
│   │   │   └── upload/        # File upload endpoint
│   │   └── o/                 # Public office microsites
│   │       └── [slug]/
│   │           ├── about/     # Office about page
│   │           ├── agents/    # Agent directory
│   │           ├── blog/      # Office blog
│   │           ├── contact/   # Contact form
│   │           ├── properties/# Property listings & detail
│   │           ├── robots.txt/# Dynamic robots.txt
│   │           └── sitemap.xml/ # Dynamic XML sitemap
│   ├── components/
│   │   ├── admin/             # Admin-specific components
│   │   ├── dashboard/         # Dashboard components
│   │   ├── public/            # Public site components
│   │   ├── shared/            # Shared components
│   │   └── ui/                # Base UI primitives (Radix wrappers)
│   ├── hooks/                 # Custom React hooks
│   ├── i18n/                  # Internationalization
│   │   └── dictionaries/      # ar.json, en.json
│   ├── lib/                   # Shared utilities
│   │   ├── actions/           # Server actions
│   │   ├── services/          # Business logic services
│   │   └── validators/        # Zod validation schemas
│   ├── middleware/             # Tenant isolation middleware
│   └── types/                 # TypeScript type definitions
├── .env.example               # Environment template
├── package.json
├── tsconfig.json
└── README.md
```

## Key Routes

### Public Office Sites (`/o/{slug}`)

| Route | Description |
|-------|-------------|
| `/o/{slug}` | Office homepage with featured properties |
| `/o/{slug}/properties` | Property listings with filters |
| `/o/{slug}/properties/{propertySlug}` | Property detail page |
| `/o/{slug}/agents` | Agent directory |
| `/o/{slug}/agents/{agentSlug}` | Agent profile page |
| `/o/{slug}/blog` | Blog listing |
| `/o/{slug}/blog/{postSlug}` | Blog post detail |
| `/o/{slug}/about` | Office about page |
| `/o/{slug}/contact` | Contact form |

### Dashboard (`/dashboard`)

| Route | Description |
|-------|-------------|
| `/dashboard` | Overview with key metrics |
| `/dashboard/properties` | Property management (CRUD) |
| `/dashboard/properties/new` | Create new property |
| `/dashboard/leads` | Lead CRM pipeline |
| `/dashboard/analytics` | Analytics & reports |
| `/dashboard/blog` | Blog CMS |
| `/dashboard/team` | Team members & roles |
| `/dashboard/settings` | Office settings, theme, branding |
| `/dashboard/billing` | Subscription & invoices |

### Admin (`/admin`)

| Route | Description |
|-------|-------------|
| `/admin` | Admin dashboard |
| `/admin/offices` | All offices management |
| `/admin/users` | All users management |
| `/admin/plans` | Plan CRUD |
| `/admin/audit` | System audit log |

## Storage Setup

### Local (default)

Files are stored in `./public/uploads/`. No additional configuration needed.

```env
STORAGE_PROVIDER="local"
UPLOADS_DIR="./public/uploads"
```

### S3-Compatible Storage

Works with AWS S3, DigitalOcean Spaces, MinIO, Cloudflare R2, etc.

```env
STORAGE_PROVIDER="s3"
S3_BUCKET="your-bucket-name"
S3_REGION="us-east-1"
S3_ACCESS_KEY="your-access-key"
S3_SECRET_KEY="your-secret-key"
# For non-AWS providers:
# S3_ENDPOINT="https://sgp1.digitaloceanspaces.com"
```

## Email Setup

### Console (default - development)

Emails are logged to the terminal. No configuration needed.

```env
EMAIL_PROVIDER="console"
```

### SMTP (production)

```env
EMAIL_PROVIDER="smtp"
SMTP_HOST="smtp.resend.com"
SMTP_PORT="587"
SMTP_USER="resend"
SMTP_PASS="re_xxxxxxxxxxxx"
EMAIL_FROM="noreply@falz.sa"
```

## Billing Setup

### Mock (default - development)

Simulates billing without real payments. Subscriptions are activated immediately.

```env
BILLING_PROVIDER="mock"
```

### Moyasar (Saudi payment gateway)

```env
BILLING_PROVIDER="moyasar"
MOYASAR_API_KEY="sk_test_xxxxxxxxxxxx"
MOYASAR_PUBLISHABLE_KEY="pk_test_xxxxxxxxxxxx"
```

### Stripe

```env
BILLING_PROVIDER="stripe"
STRIPE_SECRET_KEY="sk_test_xxxxxxxxxxxx"
STRIPE_PUBLISHABLE_KEY="pk_test_xxxxxxxxxxxx"
STRIPE_WEBHOOK_SECRET="whsec_xxxxxxxxxxxx"
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npx prisma studio` | Open Prisma Studio (database GUI) |
| `npx prisma db push` | Push schema to database |
| `npx prisma migrate dev` | Run migrations (development) |
| `npx prisma migrate deploy` | Run migrations (production) |
| `npx prisma db seed` | Seed the database |
| `npx prisma generate` | Regenerate Prisma Client |

## Deployment Notes

### Database

- Use a managed PostgreSQL service (Supabase, Neon, AWS RDS, etc.)
- Run `npx prisma migrate deploy` in your CI/CD pipeline
- Set `DATABASE_URL` with connection pooling enabled for serverless

### Next.js

- Deploy to Vercel, AWS, or any Node.js host
- Set all required environment variables
- Ensure `NEXTAUTH_URL` matches your production domain
- Generate a secure `NEXTAUTH_SECRET`:

```bash
openssl rand -base64 32
```

### File Storage

- For production, use S3-compatible storage instead of local
- Configure CORS on your S3 bucket to allow uploads from your domain

### Custom Domains

- Offices on Pro/Enterprise plans can set a custom domain
- Configure a wildcard DNS record or per-office CNAME
- Add the domain to your hosting provider's domain settings

## Multi-Tenancy

FALZ uses a slug-based multi-tenancy model:

- Each office gets a unique slug (e.g., `dar-al-aseel`)
- Public sites are served at `/o/{slug}`
- Dashboard data is isolated per-office using `officeId` foreign keys
- Middleware enforces tenant isolation on all API routes
- Super admins can access all offices through the admin panel

## License

Proprietary. All rights reserved.
