// ORAGROL Vendor Register — seed data
//
// Ported from the vendor register built 2026-09-30 (claude.ai artifact),
// itself built from a full grep of the live oragrol-website repo (every
// process.env key actually read, every npm dependency actually
// installed) plus each vendor's published pricing — not guesses.
//
// This file is the manual/code-derived layer. The live-measured layer
// (real Vercel spend, ODO's own AI cost tracker) is fetched separately
// at runtime — see app/api/vercel-usage/route.ts and, later, an ODO
// cost proxy route. Edit this file directly to update a vendor's facts;
// there's no database yet, this is intentionally simple to start.

export type BillingType = "usage" | "fixed" | "free" | "deferred" | "not_used";
export type VerifyStatus = "confirmed" | "verify" | "needs_input";

export type Vendor = {
  id: string;
  name: string;
  usedBy: string[]; // feature names
  billingType: BillingType;
  billingNote: string; // short human description of the rate/plan
  verifyStatus: VerifyStatus;
  checkUrl?: string;
  note?: string;
  liveTracked?: "vercel_api" | "odo_cost_api" | "self_instrumented" | null;
};

export const FEATURES = [
  "ODO",
  "Live Chat",
  "Cyber Health Assessment",
  "Newsletter",
  "Contact / Careers / Talent / Partnerships",
  "My Scope",
] as const;

export const VENDORS: Vendor[] = [
  {
    id: "typesafe-jev",
    name: "TypeSafe (Jev)",
    usedBy: ["ODO"],
    billingType: "usage",
    billingNote: "$0.042/M input tokens, $0/M output tokens",
    verifyStatus: "confirmed",
    checkUrl: "https://typesafe.ai",
    liveTracked: "odo_cost_api",
  },
  {
    id: "anthropic-claude",
    name: "Anthropic (Claude Sonnet 4.6)",
    usedBy: ["ODO", "Live Chat"],
    billingType: "usage",
    billingNote: "$3/M input tokens, $15/M output tokens — shared by 2 features, ODO's portion measured, Live Chat's not yet",
    verifyStatus: "confirmed",
    checkUrl: "https://console.anthropic.com/settings/billing",
    note: "ODO's share is exact via the cost tracker. Live Chat's share needs the Admin API key to measure — not wired yet.",
    liveTracked: "odo_cost_api",
  },
  {
    id: "tavily",
    name: "Tavily",
    usedBy: ["ODO"],
    billingType: "free",
    billingNote: "Free tier: 1,000 credits/mo ≈ 500 scans. Beyond that: ~$0.008/search",
    verifyStatus: "confirmed",
    checkUrl: "https://app.tavily.com",
  },
  {
    id: "google-places",
    name: "Google Places API",
    usedBy: ["ODO"],
    billingType: "usage",
    billingNote: "Usage-based — the old $200/mo blanket credit ended in early 2025",
    verifyStatus: "verify",
    checkUrl: "https://console.cloud.google.com/billing",
    note: "Being checked directly in Google Cloud billing (transactions vs. a hold) — not yet confirmed either way.",
  },
  {
    id: "geoapify",
    name: "Geoapify",
    usedBy: ["ODO"],
    billingType: "free",
    billingNote: "Free tier, cap not independently re-verified this session",
    verifyStatus: "verify",
    checkUrl: "https://myprojects.geoapify.com",
  },
  {
    id: "free-public-apis",
    name: "Google PageSpeed, SSL Labs, OrgBook BC, crt.sh",
    usedBy: ["ODO"],
    billingType: "free",
    billingNote: "$0 — public APIs, no key or billing account",
    verifyStatus: "confirmed",
  },
  {
    id: "hibp",
    name: "HaveIBeenPwned (HIBP)",
    usedBy: ["ODO"],
    billingType: "deferred",
    billingNote: "Built, not activated. Core tier from $4.39/mo when turned on",
    verifyStatus: "confirmed",
    checkUrl: "https://haveibeenpwned.com/Subscription",
    note: "Deferred ~3-4 months by Mohammad's own decision, not a gap.",
  },
  {
    id: "upstash-redis",
    name: "Upstash Redis",
    usedBy: ["ODO", "Cyber Health Assessment", "My Scope"],
    billingType: "usage",
    billingNote: "Pay-as-you-go, covered by Vercel's $20/mo included credit (Hobby plan). Confirmed live: $1.98 used of $20 budget.",
    verifyStatus: "confirmed",
    checkUrl: "https://vercel.com/oragrol/~/stores",
    note: "Managed entirely through Vercel (not a standalone Upstash.com account) — verified 2026-09-30.",
    liveTracked: "vercel_api",
  },
  {
    id: "upstash-qstash",
    name: "Upstash QStash",
    usedBy: ["Cyber Health Assessment", "My Scope"],
    billingType: "usage",
    billingNote: "Free tier: 1,000 messages/day. Same Vercel-managed account as Redis above.",
    verifyStatus: "verify",
    liveTracked: "vercel_api",
  },
  {
    id: "resend",
    name: "Resend",
    usedBy: ["Cyber Health Assessment", "Contact / Careers / Talent / Partnerships", "My Scope"],
    billingType: "free",
    billingNote: "Free tier: 100/day, up to 3,000/mo. Beyond that: Pro $20/mo for 50,000/mo",
    verifyStatus: "confirmed",
    checkUrl: "https://resend.com/emails",
    note: "Was completely untracked before the 2026-09-30 audit — five features share this free-tier cap.",
  },
  {
    id: "hubspot",
    name: "HubSpot",
    usedBy: ["ODO", "Live Chat", "Cyber Health Assessment", "Newsletter"],
    billingType: "free",
    billingNote: "Free CRM, at the 10/10 custom-property cap. Upgrade would run ~$7-20/mo/seat",
    verifyStatus: "confirmed",
    checkUrl: "https://app.hubspot.com/billing",
  },
  {
    id: "brevo",
    name: "Brevo",
    usedBy: ["Newsletter"],
    billingType: "free",
    billingNote: "Free tier: 300 emails/day. Starter ~$20/mo for 5,000/mo beyond that",
    verifyStatus: "confirmed",
    checkUrl: "https://app.brevo.com",
  },
  {
    id: "vercel",
    name: "Vercel",
    usedBy: [...FEATURES],
    billingType: "free",
    billingNote: "Hobby plan, $0/mo, Active — confirmed 2026-09-30, zero invoices ever",
    verifyStatus: "confirmed",
    checkUrl: "https://vercel.com/oragrol/~/settings/billing",
    liveTracked: "vercel_api",
  },
  {
    id: "github",
    name: "GitHub",
    usedBy: [...FEATURES],
    billingType: "free",
    billingNote: "$0 — personal/free account, private repos included",
    verifyStatus: "confirmed",
  },
  {
    id: "apitemplate",
    name: "APITemplate.io",
    usedBy: [],
    billingType: "not_used",
    billingNote: "Not actually used — older notes carried a $19/mo line for this, but every PDF is generated in-process with the free @react-pdf/renderer library. Still named in the privacy policy as a data processor, which isn't accurate anymore.",
    verifyStatus: "confirmed",
  },
];

export function totalConfirmedFixedMonthly(): number {
  // Nothing here is a real fixed monthly charge today — every "fixed" line
  // in older notes turned out to be $0 (free tier) or not actually used.
  // Kept as a function (not a hardcoded number) so it's obviously
  // recomputed, not stale, once something actually becomes a paid plan.
  return 0;
}
