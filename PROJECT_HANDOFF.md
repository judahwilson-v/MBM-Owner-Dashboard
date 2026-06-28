# MBM Owner Dashboard — Project Handoff

This file is the single context file for future AI sessions.
If you switch assistants, point them here first.

## Project Summary

MBM Owner Dashboard is a separate, read-only Next.js web dashboard for MBM Quarry.
It is not the Electron ERP app.

The Electron ERP remains the source of truth for operational data.
This website reads mirrored data from Supabase only.

## Current Architecture

Electron ERP
→ local SQLite
→ sync engine
→ Supabase
→ Next.js owner dashboard
→ Vercel

## What Has Been Done

- Created a standalone Git repo for the dashboard
- Pushed the repo to GitHub
- Added Supabase environment values locally in `.env.local`
- Created a basic Next.js app scaffold
- Added a Supabase browser client helper

## Current GitHub Repo

- `https://github.com/judahwilson-v/MBM-Owner-Dashboard`

## Current Deployment Status

- GitHub push: done
- Vercel deployment: pending / needs access or manual connection
- Supabase values: configured locally

## Important Rules

- Do not modify the Electron app unless explicitly instructed
- Keep the website and Electron app separate
- Do not invent database schema
- Do not write to Supabase from the dashboard
- Do not create or change production data from the dashboard
- Use TypeScript
- Prefer server components where possible
- Use Tailwind + shadcn/ui for the dashboard UI

## Current Known Issue

The Electron dashboard appears to be showing the website/dashboard in the wrong place.
This needs separate investigation in the Electron app only.

## What Still Needs To Be Done

- Finish the Next.js dashboard UI
- Add authentication and protected routes
- Add read-only Supabase data fetching
- Build dashboard pages:
  - Home
  - Sales
  - Purchases
  - Parties
  - Party Ledger
  - Vehicles
  - Materials
  - Employees
  - Expenses
- Add loading, empty, and error states
- Connect Vercel deployment
- Verify live production behavior

## Future Features

- Real-time updates from Supabase
- Charts and KPI cards
- Filters and search
- Export to PDF / Excel where needed
- Mobile-friendly navigation
- Dark mode
- Audit-friendly activity tracking
- Better dashboard performance and caching

## Phase Plan

### Phase 1 — Foundation

- Stand up the separate website repo
- Preserve project context in docs
- Confirm environment variables
- Confirm no overlap with Electron app

### Phase 2 — Authentication

- Supabase Auth login
- Disable public signup
- Protect all dashboard routes

### Phase 3 — Dashboard Core

- Build home screen
- Add sales and purchases views
- Add parties and ledger views
- Add vehicles, materials, employees, expenses pages

### Phase 4 — Data Quality

- Add filters
- Add summary metrics
- Add loading and empty states
- Add error handling

### Phase 5 — Deployment

- Connect GitHub to Vercel
- Configure env vars in Vercel
- Verify production deployment

### Phase 6 — Enhancement

- Charts
- Reports
- Export options
- Realtime updates
- UX polish

## Notes for Future AI

Start by reading:

- `README.md`
- `PRODUCT_REQUIREMENTS.md`
- `DATABASE_SCHEMA.md`
- `DEVELOPMENT_RULES.md`
- `QUESTIONS.md`
- `PROJECT_STATE.md`
- this file: `PROJECT_HANDOFF.md`

If something is unclear, ask before guessing.

