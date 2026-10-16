# UniOne

UniOne is a university admissions portal for students in Pakistan. Phase 1 provides a public university catalogue, account-bound student profiles, and a reusable shortlist.

## Architecture

- **Web app:** React, Vite, TypeScript, Tailwind CSS, and Wouter routes in `artifacts/unione/`.
- **API:** shared Express 5 service in `artifacts/api-server/`. The service uses Clerk session cookies to protect student profile and shortlist routes.
- **Database:** PostgreSQL with Drizzle ORM in `lib/db/`.
- **API contract:** `lib/api-spec/openapi.yaml` is the source of truth. Generated React Query hooks and Zod validators live in `lib/api-client-react/` and `lib/api-zod/`.
- **Authentication:** Replit-managed Clerk handles email/password sign-in and email verification. Google SSO can be enabled in the Auth pane. Phone OTP is not part of Phase 1.
- **Storage and payments:** document storage and payment-provider adapters are reserved for later phases; no documents or card details are collected in this phase.

## Project structure

```text
artifacts/
  unione/                 React app, routes, pages, styles, and brand assets
  api-server/
    src/routes/           Discovery and signed-in student API routes
    src/seed-unione.ts    Repeatable demo catalogue seed
lib/
  api-spec/               OpenAPI contract
  api-client-react/       Generated client and React Query hooks
  api-zod/                Generated request/response validation
  db/src/schema/          Drizzle tables and relations
```

## Phase 1 features

- Public landing page and responsive university/programme discovery.
- Search and filters for city, degree level, field, annual fee range, deadline, and scholarships.
- University detail pages with programme details and shortlist actions.
- Clerk-branded sign-up and sign-in.
- Student profile with personal, guardian, education, and test-score sections; profile drafts save automatically after a short pause.
- Account-specific shortlist, dashboard, loading states, empty states, and retryable errors.
- Ten sample Pakistani universities and twenty sample programmes.

The sample catalogue is for demonstration only. Fees, requirements, and deadlines are illustrative and must be confirmed with each university before an application. Replace these records with approved admissions data before using UniOne for real decisions.

The Phase 1 profile covers name, date of birth, gender, nationality, contact and guardian details, education, and test scores. CNIC/passport numbers, achievements, document uploads, and application submissions are intentionally deferred to later phases.

## Setup

The Replit project provides the PostgreSQL database and the Clerk environment configuration. Do not copy database or Clerk credentials into the repository.

1. Install workspace packages with `pnpm install` if dependencies have not already been installed.
2. Apply the development database schema:

   ```bash
   pnpm --filter @workspace/db run push
   ```

3. Seed or refresh the sample catalogue:

   ```bash
   pnpm --filter @workspace/api-server run seed:unione
   ```

4. Start the configured UniOne web and API workflows in Replit.

Useful commands:

```bash
pnpm run typecheck
pnpm --filter @workspace/api-spec run codegen
pnpm --filter @workspace/unione run typecheck
pnpm --filter @workspace/api-server run typecheck
```

Enable Google sign-in for the Clerk app from the workspace Auth pane if needed. Development and production authentication environments have separate users.

## API overview

Public endpoints:

- `GET /api/discovery/highlights`
- `GET /api/universities`
- `GET /api/universities/:slug`

Clerk-authenticated student endpoints:

- `GET` and `PUT /api/student/profile`
- `GET /api/student/shortlist`
- `PUT` and `DELETE /api/student/shortlist/:programId`

Profile and shortlist records are scoped by the authenticated Clerk user ID. The public catalogue endpoints intentionally return demo seed data in this phase.

## Planned next phases

- Document vault with private object storage and document verification.
- Multi-university application forms, custom questions, application tracking, and notifications.
- Combined fee checkout through payment-provider adapters and receipts.
- University staff portal and UniOne super-admin tools.
- Production admissions catalogue, privacy/terms pages, and broader accessibility and operational review.
