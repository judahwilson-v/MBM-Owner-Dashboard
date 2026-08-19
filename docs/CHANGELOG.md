# MBM Quarry Owner Dashboard — Changelog

## v0.1.0 — Production Hardening & UI Overhaul (2026-08-18)
- **Table Layout Refactoring**: Reverted switch card feeds back to premium mobile tables for optimal dense data viewing on mobile devices.
- **Build Hardening**: Resolved TypeScript type mismatches in layout and middleware syntax errors blocking Vercel deployments. Renamed middleware and exported functions to ensure Next.js 16.3 compatibility.
- **Premium UI Overhaul**: Overhauled the login page to feature a premium SaaS split-screen aesthetic with animated elements and glassmorphism cards.
- **Mobile-First Layout**: Completed extensive mobile-first layout refactoring across the app shell, ensuring responsiveness across small screens (<375px) without element squishing.
- **Dashboard Enhancements**: Completed the premium rework of the main dashboard, adding fully integrated sales and boulder logs alongside real-time KPIs (Today's Sales, Monthly P/L, Cash Position).

## v0.1.0-alpha — Phase 9 Implementation (2026-08-04)
- **Phase 9.3 (Live Data Integration)**: Connected the Next.js server components to the centralized Supabase PostgreSQL database via `@supabase/ssr`. Added real-time aggregations for sales revenue, dispatch volumes, expenses, and liquidity.
- **Phase 9.2 (Supabase Authentication)**: Implemented secure session-based authentication using `@supabase/ssr`, restricting access to authorized owners only.
- **Phase 9 (Owner Dashboard Setup)**: Initialized the standalone read-only mobile dashboard architecture using Next.js, React 19, and Tailwind CSS v4.
