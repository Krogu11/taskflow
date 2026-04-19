# Tech Stack

## Core Technologies

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Framework | Next.js 15 (App Router) | Full-stack React, great DX, Vercel-native |
| Language | TypeScript | Type safety across the entire stack |
| Styling | Tailwind CSS | Utility-first, no CSS files to maintain |
| Database | PostgreSQL | Reliable, open source, widely hosted |
| ORM | Prisma | Type-safe queries, great migrations |
| Auth | NextAuth.js v5 | First-class Next.js integration |
| Testing (unit) | Vitest | Fast, Jest-compatible |
| Testing (e2e) | Playwright | Reliable cross-browser testing |

## Environments

| Environment | Branch | URL |
|------------|--------|-----|
| Development | local | http://localhost:3000 |
| Staging | `develop` | Vercel preview (auto-deployed) |
| Production | `main` | Vercel production (auto-deployed) |

## Infrastructure

- **Hosting**: Vercel (frontend + API routes, serverless)
- **Database**: Neon or Supabase (managed PostgreSQL, free tier to start)
- **CI/CD**: GitHub Actions (lint → typecheck → test → build → deploy)

## Git Branching

- `main` — production, protected, requires PR
- `develop` — staging integration branch
- Feature branches: `feat/description`
- Fix branches: `fix/description`

## Environment Variables

See `.env.example` for all required variables. Set the following secrets in GitHub:
- `DATABASE_URL` (per environment)
- `AUTH_SECRET`
- `AUTH_URL`
- `NEXT_PUBLIC_APP_URL`
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
