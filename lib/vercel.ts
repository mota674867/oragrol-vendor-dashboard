// ORAGROL Vendor Dashboard — Vercel API integration
//
// Uses Vercel's documented FOCUS billing-charges endpoint (GET
// /v1/billing/charges), verified against vercel.com/docs/rest-api on
// 2026-09-30 — not a guessed endpoint. This is the one source that can
// show REAL spend across everything billed through Vercel, including
// marketplace integrations (the Upstash Redis/QStash instance is
// provisioned through Vercel, so its charges — if any — show up here
// under ServiceProviderName/ServiceName, not through a separate Upstash
// bill).
//
// Docs: https://vercel.com/docs/rest-api/billing/list-focus-billing-charges

const VERCEL_API_BASE = "https://api.vercel.com";

export type FocusCharge = {
  BilledCost: number;
  BillingCurrency: string;
  ChargeCategory: "Adjustment" | "Credit" | "Purchase" | "Tax" | "Usage";
  ChargePeriodStart: string;
  ChargePeriodEnd: string;
  ConsumedQuantity: number | null;
  ConsumedUnit: string | null;
  EffectiveCost: number;
  ServiceCategory?: string;
  ServiceName: string;
  ServiceProviderName: string;
  SkuId: string;
  Tags?: Record<string, string>;
};

export type VercelUsageSummary = {
  ok: true;
  teamSlug: string;
  rangeFrom: string;
  rangeTo: string;
  totalBilledCost: number;
  currency: string;
  byService: { serviceName: string; providerName: string; totalCost: number; charges: number }[];
  byDay: { date: string; totalCost: number }[]; // real daily buckets from ChargePeriodStart — for day-by-day cost control, not simulated
  charges: FocusCharge[];
} | {
  ok: false;
  error: string;
  detail?: string;
};

function env(name: string): string | undefined {
  const v = process.env[name];
  return v && v.trim().length > 0 ? v.trim() : undefined;
}

/** Resolves which team to query: explicit VC_TEAM_SLUG/VC_TEAM_ID env var,
 *  or — if neither is set — the first team the token can see. Never silently
 *  guesses when there's more than one team and nothing was specified. */
async function resolveTeam(token: string): Promise<{ id: string; slug: string } | { error: string }> {
  const explicitId = env("VC_TEAM_ID");
  const explicitSlug = env("VC_TEAM_SLUG");
  if (explicitId || explicitSlug) {
    // We still need the id for the API call and slug for display; look it up either way.
  }

  const res = await fetch(`${VERCEL_API_BASE}/v2/teams`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) {
    return { error: `Vercel /v2/teams returned ${res.status} ${res.statusText}` };
  }
  const data = (await res.json()) as { teams?: { id: string; slug: string }[] };
  const teams = data.teams ?? [];
  if (teams.length === 0) return { error: "Token can't see any teams." };

  if (explicitId) {
    const match = teams.find((t) => t.id === explicitId);
    if (match) return match;
    return { error: `VC_TEAM_ID=${explicitId} not found among teams this token can see.` };
  }
  if (explicitSlug) {
    const match = teams.find((t) => t.slug === explicitSlug);
    if (match) return match;
    return { error: `VC_TEAM_SLUG=${explicitSlug} not found among teams this token can see.` };
  }
  if (teams.length > 1) {
    return { error: `Token can see ${teams.length} teams and none was specified — set VC_TEAM_SLUG to pick one.` };
  }
  return teams[0];
}

/** Fetches real billing charges for the last `days` days and aggregates them
 *  by service. Returns a structured error (never throws, never fakes a
 *  zero-cost result) if anything about the call fails — an empty/failed
 *  fetch must never be displayed as "confirmed $0". */
export async function getVercelUsageSummary(days = 30): Promise<VercelUsageSummary> {
  const token = env("VC_API_TOKEN");
  if (!token) {
    return { ok: false, error: "VC_API_TOKEN not set." };
  }

  const team = await resolveTeam(token);
  if ("error" in team) {
    return { ok: false, error: "Could not resolve which Vercel team to query.", detail: team.error };
  }

  const to = new Date();
  const from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000);

  const url = new URL(`${VERCEL_API_BASE}/v1/billing/charges`);
  url.searchParams.set("teamId", team.id);
  url.searchParams.set("from", from.toISOString());
  url.searchParams.set("to", to.toISOString());

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!res.ok) {
    const bodyText = await res.text().catch(() => "");
    // A 404 with error.code "costs_not_found" is Vercel's real answer for
    // "no billing charges exist for this team in this range" — verified
    // live against this account on 2026-09-30 (Hobby plan, zero invoices).
    // That's a genuine $0, not a failure, so render it as one: an honest
    // empty result, same shape as a real zero-charge response. Any other
    // non-2xx (auth, 5xx, etc.) still surfaces as a real error.
    let isNoCosts = false;
    try {
      const parsed = JSON.parse(bodyText);
      isNoCosts = res.status === 404 && parsed?.error?.code === "costs_not_found";
    } catch {
      // not JSON — fall through, treat as a real error below
    }
    if (isNoCosts) {
      const days: { date: string; totalCost: number }[] = [];
      for (let d = new Date(from); d <= to; d.setUTCDate(d.getUTCDate() + 1)) {
        days.push({ date: d.toISOString().slice(0, 10), totalCost: 0 });
      }
      return {
        ok: true,
        teamSlug: team.slug,
        rangeFrom: from.toISOString(),
        rangeTo: to.toISOString(),
        totalBilledCost: 0,
        currency: "USD",
        byService: [],
        byDay: days,
        charges: [],
      };
    }
    return {
      ok: false,
      error: `Vercel billing API returned ${res.status} ${res.statusText}`,
      detail: bodyText.slice(0, 500),
    };
  }

  // Response is JSONL (newline-delimited JSON), not a single JSON array.
  const text = await res.text();
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const charges: FocusCharge[] = [];
  for (const line of lines) {
    try {
      charges.push(JSON.parse(line) as FocusCharge);
    } catch {
      // Skip a line that fails to parse rather than failing the whole
      // request — but this should never happen against a well-formed
      // response, so it's worth knowing about if it does.
      console.error("[vendor-dashboard] Failed to parse a Vercel billing JSONL line:", line.slice(0, 200));
    }
  }

  const byServiceMap = new Map<string, { serviceName: string; providerName: string; totalCost: number; charges: number }>();
  const byDayMap = new Map<string, number>();
  // Pre-seed every day in range with 0 so the daily trend shows real flat
  // zeros, not gaps — "even a $0 day should show as zero", not be absent.
  for (let d = new Date(from); d <= to; d.setUTCDate(d.getUTCDate() + 1)) {
    byDayMap.set(d.toISOString().slice(0, 10), 0);
  }
  let totalBilledCost = 0;
  let currency = "USD";
  for (const c of charges) {
    const cost = Number(c.BilledCost) || 0;
    totalBilledCost += cost;
    currency = c.BillingCurrency || currency;
    const key = `${c.ServiceProviderName}::${c.ServiceName}`;
    const existing = byServiceMap.get(key);
    if (existing) {
      existing.totalCost += cost;
      existing.charges += 1;
    } else {
      byServiceMap.set(key, {
        serviceName: c.ServiceName,
        providerName: c.ServiceProviderName,
        totalCost: cost,
        charges: 1,
      });
    }
    const day = (c.ChargePeriodStart || "").slice(0, 10);
    if (day) byDayMap.set(day, (byDayMap.get(day) ?? 0) + cost);
  }

  return {
    ok: true,
    teamSlug: team.slug,
    rangeFrom: from.toISOString(),
    rangeTo: to.toISOString(),
    totalBilledCost: Math.round(totalBilledCost * 1_000_000) / 1_000_000,
    currency,
    byService: [...byServiceMap.values()].sort((a, b) => b.totalCost - a.totalCost),
    byDay: [...byDayMap.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([date, totalCost]) => ({ date, totalCost })),
    charges,
  };
}
