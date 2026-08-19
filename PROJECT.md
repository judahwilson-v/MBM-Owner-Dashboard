# Project: MBM Quarry Owner Dashboard (mbm-dashboard)

## Architecture
- **Framework**: Next.js 16.3.0 (App Router) + React 19.2.8
- **Styling**: Tailwind CSS v4 (Mobile-first, Premium SaaS Glassmorphism UI)
- **Data & Auth**: `@supabase/ssr` + `@supabase/supabase-js` (PostgreSQL)
- **Paradigm**: Pure React Server Components (RSC), Read-Only Mode (Zero client mutations)
- **Deployment**: Vercel-ready (Serverless edge deployment)

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|:---:|---|---|:---:|---|
| 1 | Owner Authorization Portal | Premium SaaS split-screen aesthetic login page with Supabase Auth integration | Phase 9.2 | `login/page.tsx` |
| 2 | Executive Dashboard | Live KPIs for Today's Sales (Revenue & Qty), Monthly P&L, and Cash Position | Phase 9.3 | `page.tsx` |
| 3 | Sales Log (Dispatches) | Premium scrollable mobile tables for outgoing sales with search/filter | Refactor | `sales/page.tsx` |
| 4 | Incoming Boulder Log | Detailed table views for tracking raw material purchases and vendor supply | Refactor | `boulder/page.tsx` |
| 5 | Customer Directory | Searchable directory for tracking buyers, ledger parties, and balances | Refactor | `customer/page.tsx` |
| 6 | Read-Only Sync Engine | Server-side direct PostgREST queries connected to Central Cloud Database | Architecture | `utils/supabase/server.ts` |

## Milestones
| # | Name | Scope | Dependencies | Status |
|:---:|---|---|---|:---:|
| 1 | Dashboard Base Setup | Initial Next.js 16.3 + Tailwind 4 scaffolding | none | DONE |
| 2 | Supabase Authentication | Secure owner login and session management via `@supabase/ssr` | M1 | DONE |
| 3 | Live Data Integration | SSR fetches for sales, expenses, and cash positions from PostgreSQL | M2 | DONE |
| 4 | Premium UI Overhaul | Mobile-first refactoring, Glassmorphism elements, animated KPI cards | M3 | DONE |
| 5 | Table Layout Refactoring | Scrollable mobile-friendly table feeds for Sales and Boulder logs | M4 | DONE |
| 6 | Production Build Hardening | Vercel build compatibility, TypeScript strict fixes, Proxy handling | M5 | DONE |

## Interface Contracts
### Mobile Owner Dashboard <-> Cloud Supabase (`PostgreSQL`)
- **Protocol**: Server-Side PostgREST via `@supabase/ssr` / `@supabase/supabase-js`
- **Mode**: Strict Read-Only (`SELECT` operations only). The dashboard functions as a secure viewer for quarry owners without write-access risks.
- **Authentication**: JWT-based session cookies managed by Next.js server actions.
- **Data Freshness**: Render-time fetching leveraging Next.js server cache and real-time database state pushed by `MBM1` desktop CDC engine.
