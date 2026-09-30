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
//
// $ fields (monthlyFixedAmount, usageAmountThisMonth) are explicit 0 —
// never omitted/defaulted — everywhere nothing is actually being charged,
// per the standing rule: show a real zero, never hide it, never guess a
// non-zero. A vendor tagged vercelServiceMatch gets its usage number
// OVERRIDDEN at render time by the real live Vercel API figure — the 0
// here is only the fallback shown before that live data loads/if it errors.

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

  /** Real recurring monthly charge, in USD. 0 where nothing is actually
   *  billed today (free tier, deferred, not used) — not an estimate. */
  monthlyFixedAmount: number;
  /** Day-of-month the fixed charge bills, e.g. "1st". Undefined when
   *  monthlyFixedAmount is 0 (nothing to date). */
  paymentDate?: string;
  /** Manually-tracked usage spend for the current month, in USD. 0 where
   *  not measured yet — for vendors with vercelServiceMatch, the real
   *  Vercel API figure overrides this at render time. */
  usageAmountThisMonth: number;
  /** Lowercase substrings to match against Vercel's live ServiceName, so
   *  this vendor's row shows the real billed figure instead of the 0
   *  fallback above. Only set for vendors actually billed through Vercel. */
  vercelServiceMatch?: string[];
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
    monthlyFixedAmount: 0,
    usageAmountThisMonth: 0,
    note: "ODO's own cost tracker has the exact figure but isn't wired into this dashboard yet — showing 0 until that API is connected, not a confirmed zero spend.",
  },
  {
    id: "anthropic-claude",
    name: "Anthropic (Claude Sonnet 4.6)",
    usedBy: ["ODO", "Live Chat"],
    billingType: "usage",
    billingNote: "$3/M input tokens, $15/M output tokens — shared by 2 features, ODO's portion measured, Live Chat's not yet",
    verifyStatus: "confirmed",
    checkUrl: "https://console.anthropic.com/settings/billing",
    note: "ODO's share is exact via the cost tracker (not wired into this dashboard yet — showing 0, not a confirmed zero). Live Chat's share needs the Admin API key to measure at all.",
    liveTracked: "odo_cost_api",
    monthlyFixedAmount: 0,
    usageAmountThisMonth: 0,
  },
  {
    id: "tavily",
    name: "Tavily",
    usedBy: ["ODO"],
    billingType: "free",
    billingNote: "Free tier: 1,000 credits/mo ≈ 500 scans. Beyond that: ~$0.008/search",
    verifyStatus: "confirmed",
    checkUrl: "https://app.tavily.com",
    monthlyFixedAmount: 0,
    usageAmountThisMonth: 0,
    note: "Inside free tier — real overage $ not tracked here yet.",
  },
  {
    id: "google-places",
    name: "Google Places API",
    usedBy: ["ODO"],
    billingType: "usage",
    billingNote: "Usage-based — the old $200/mo blanket credit ended in early 2025",
    verifyStatus: "verify",
    checkUrl: "https://console.cloud.google.com/billing",
    note: "Being checked directly in Google Cloud billing (transactions vs. a hold) — not yet confirmed either way. 0 shown means unmeasured, not confirmed free.",
    monthlyFixedAmount: 0,
    usageAmountThisMonth: 0,
  },
  {
    id: "geoapify",
    name: "Geoapify",
    usedBy: ["ODO"],
    billingType: "free",
    billingNote: "Free tier, cap not independently re-verified this session",
    verifyStatus: "verify",
    checkUrl: "https://myprojects.geoapify.com",
    monthlyFixedAmount: 0,
    usageAmountThisMonth: 0,
  },
  {
    id: "free-public-apis",
    name: "Google PageSpeed, SSL Labs, OrgBook BC, crt.sh",
    usedBy: ["ODO"],
    billingType: "free",
    billingNote: "$0 — public APIs, no key or billing account",
    verifyStatus: "confirmed",
    monthlyFixedAmount: 0,
    usageAmountThisMonth: 0,
  },
  {
    id: "hibp",
    name: "HaveIBeenPwned (HIBP)",
    usedBy: ["ODO"],
    billingType: "deferred",
    billingNote: "Built, not activated. Core tier from $4.39/mo when turned on",
    verifyStatus: "confirmed",
    checkUrl: "https://haveibeenpwned.com/Subscription",
    note: "Deferred ~3-4 months by Mohammad's own decision, not a gap. Will need a real payment date entered here once activated.",
    monthlyFixedAmount: 0,
    usageAmountThisMonth: 0,
  },
  {
    id: "upstash-redis",
    name: "Upstash Redis",
    usedBy: ["ODO", "Cyber Health Assessment", "My Scope"],
    billingType: "usage",
    billingNote: "Pay-as-you-go, covered by Vercel's $20/mo included credit (Hobby plan).",
    verifyStatus: "confirmed",
    checkUrl: "https://vercel.com/oragrol/~/stores",
    note: "Managed entirely through Vercel (not a standalone Upstash.com account) — verified 2026-09-30.",
    liveTracked: "vercel_api",
    monthlyFixedAmount: 0,
    usageAmountThisMonth: 0,
    vercelServiceMatch: ["redis", "kv"],
  },
  {
    id: "upstash-qstash",
    name: "Upstash QStash",
    usedBy: ["Cyber Health Assessment", "My Scope"],
    billingType: "usage",
    billingNote: "Free tier: 1,000 messages/day. Same Vercel-managed account as Redis above.",
    verifyStatus: "verify",
    liveTracked: "vercel_api",
    monthlyFixedAmount: 0,
    usageAmountThisMonth: 0,
    vercelServiceMatch: ["qstash"],
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
    monthlyFixedAmount: 0,
    usageAmountThisMonth: 0,
  },
  {
    id: "hubspot",
    name: "HubSpot",
    usedBy: ["ODO", "Live Chat", "Cyber Health Assessment", "Newsletter"],
    billingType: "free",
    billingNote: "Free CRM, at the 10/10 custom-property cap. Upgrade would run ~$7-20/mo/seat",
    verifyStatus: "confirmed",
    checkUrl: "https://app.hubspot.com/billing",
    monthlyFixedAmount: 0,
    usageAmountThisMonth: 0,
  },
  {
    id: "brevo",
    name: "Brevo",
    usedBy: ["Newsletter"],
    billingType: "free",
    billingNote: "Free tier: 300 emails/day. Starter ~$20/mo for 5,000/mo beyond that",
    verifyStatus: "confirmed",
    checkUrl: "https://app.brevo.com",
    monthlyFixedAmount: 0,
    usageAmountThisMonth: 0,
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
    monthlyFixedAmount: 0,
    usageAmountThisMonth: 0,
    vercelServiceMatch: ["vercel", "hosting", "compute", "function", "bandwidth"],
  },
  {
    id: "github",
    name: "GitHub",
    usedBy: [...FEATURES],
    billingType: "free",
    billingNote: "$0 — personal/free account, private repos included",
    verifyStatus: "confirmed",
    monthlyFixedAmount: 0,
    usageAmountThisMonth: 0,
  },
  {
    id: "apitemplate",
    name: "APITemplate.io",
    usedBy: [],
    billingType: "not_used",
    billingNote: "Not actually used — older notes carried a $19/mo line for this, but every PDF is generated in-process with the free @react-pdf/renderer library. Still named in the privacy policy as a data processor, which isn't accurate anymore.",
    verifyStatus: "confirmed",
    monthlyFixedAmount: 0,
    usageAmountThisMonth: 0,
  },
];

export function totalConfirmedFixedMonthly(): number {
  return VENDORS.reduce((sum, v) => sum + v.monthlyFixedAmount, 0);
}

/** Manual (non-live) usage $ this month. Vendors with vercelServiceMatch
 *  are excluded — their real number comes from the live API instead, added
 *  on top of this at render time so nothing is double-counted or stale. */
export function totalManualUsageThisMonth(): number {
  return VENDORS.filter((v) => !v.vercelServiceMatch).reduce((sum, v) => sum + v.usageAmountThisMonth, 0);
}

export const BILLING_TYPES: BillingType[] = ["usage", "fixed", "free", "deferred", "not_used"];

export type VendorStats = {
  total: number;
  liveTracked: number;
  needsAttention: number; // verify + needs_input
  confirmed: number;
  byBillingType: { type: BillingType; count: number }[];
};

/** Pure counts derived from the vendor register — no fetching, no cost math
 *  beyond what's already known. Used to drive the dashboard's stat tiles. */
export function summarizeVendors(vendors: Vendor[] = VENDORS): VendorStats {
  return {
    total: vendors.length,
    liveTracked: vendors.filter((v) => !!v.liveTracked).length,
    needsAttention: vendors.filter((v) => v.verifyStatus !== "confirmed").length,
    confirmed: vendors.filter((v) => v.verifyStatus === "confirmed").length,
    byBillingType: BILLING_TYPES.map((type) => ({
      type,
      count: vendors.filter((v) => v.billingType === type).length,
    })),
  };
}
