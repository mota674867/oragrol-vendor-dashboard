# ORAGROL Vendor & Cost Dashboard

Separate app from the main site, on purpose — see the 2026-09-30 decision in
project memory. Shows every vendor/API/subscription used across ORAGROL's
whole stack: billing type, which feature uses it, and live pulled spend
where a vendor's API supports it (starting with Vercel).

## What's live vs. manual right now

- **Live (pulled automatically):** Vercel account spend, broken down by
  service — this also covers the Upstash Redis/QStash instance, since it's
  billed through Vercel's marketplace integration, not a separate account.
- **Manual (edited in `lib/vendors.ts`):** everything else — Jev, Claude,
  Tavily, Google Places, Geoapify, HubSpot, Resend, Brevo. ODO's own exact
  AI cost tracker (`/api/odo/admin/cost` on the main site) is the next one
  to wire in here as a live source.

## Setup

1. `npm install`
2. Copy `.env.local.example` to `.env.local`, fill in `DASHBOARD_PASSWORD`
   and `VERCEL_API_TOKEN`.
3. `npm run dev` — open http://localhost:3000, browser will prompt for the
   password.

## Deploying

Import this repo as a **new** Vercel project (not a folder inside the main
site — keeps it fully separate, per the original requirement). Set the same
two environment variables in that project's Vercel settings. Nothing else
to configure.

## Updating vendor facts

Edit `lib/vendors.ts` directly — one array, one object per vendor. No
database yet; this is intentionally simple until there's a real reason for
one (e.g. wanting history/trends over time, not just current state).
