# UniOne

A centralized admissions portal for students in Pakistan to maintain a reusable profile, discover university programs, and keep a shortlist in one place.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/unione/` — React + Vite web application and student-facing UI
- `artifacts/api-server/src/routes/` — Express API routes
- `artifacts/api-server/src/seed-unione.ts` — repeatable demo university/program seed
- `lib/api-spec/openapi.yaml` — source of truth for the API contract
- `lib/api-client-react/` and `lib/api-zod/` — generated API hooks and validation schemas
- `lib/db/src/schema/unione.ts` — Drizzle database schema
- `README.md` — product architecture, Phase 1 scope, and setup steps

## Architecture decisions

- Student profile and shortlist endpoints are scoped by the signed-in Clerk user ID; do not add public access to those records.
- University discovery is public. Seeded program fees and deadlines are illustrative and must be replaced with verified data before real applications.
- OpenAPI is the contract source; regenerate client hooks and validators after changing it.
- Document storage, applications, payments, university staff, and super-admin workflows are later phases.

## Product

Phase 1 includes a public landing page and searchable university catalogue, university details, shortlist, authenticated student profile with education/test scores and automatic draft saving, and an overview dashboard.

## User preferences

- Professional, friendly, education-focused visual language; deep blue primary with a warm accent.
- Mobile-first responsive pages and clear progress indicators.

## Gotchas

- Run `pnpm --filter @workspace/api-spec run codegen` after any OpenAPI contract changes.
- Run `pnpm --filter @workspace/db run push` before seeding a fresh development database.
- Clerk development and production user stores are separate. Google SSO requires provider setup in the Auth pane; phone OTP is not part of Phase 1.
- Demo catalogue fees, requirements, and deadlines are not official admissions information.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
