"use client";

import { useEffect, useMemo, useState } from "react";
import type { VercelUsageSummary } from "@/lib/vercel";
import { totalManualUsageThisMonth, type Vendor, type VendorStats } from "@/lib/vendors";
import StatTile from "@/components/StatTile";
import VercelSpendPanel from "@/components/VercelSpendPanel";
import DailySpendTrend from "@/components/DailySpendTrend";
import BillingMixPanel from "@/components/BillingMixPanel";
import VendorTable from "@/components/VendorTable";

// Single shared fetch of the live Vercel billing data — everything that
// needs a real $ number (the usage stat tile, the spend panel, the daily
// trend, and each live-tracked vendor's table row) reads from this one
// result, so nothing computes its own stale/duplicate copy of "real".
export default function DashboardClient({ vendors, stats }: { vendors: Vendor[]; stats: VendorStats }) {
  const [data, setData] = useState<VercelUsageSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/vercel-usage")
      .then((r) => r.json())
      .then(setData)
      .catch((err) => setData({ ok: false, error: "Request failed", detail: String(err) }))
      .finally(() => setLoading(false));
  }, []);

  const liveUsageById = useMemo(() => {
    const map: Record<string, number | null | undefined> = {};
    for (const v of vendors) {
      if (!v.vercelServiceMatch) continue;
      if (!data) {
        map[v.id] = undefined; // still loading
        continue;
      }
      if (!data.ok) {
        map[v.id] = null; // live fetch failed — flag it, don't fake 0
        continue;
      }
      const matched = data.byService.filter((s) =>
        v.vercelServiceMatch!.some(
          (m) => s.serviceName.toLowerCase().includes(m) || s.providerName.toLowerCase().includes(m)
        )
      );
      map[v.id] = matched.reduce((sum, s) => sum + s.totalCost, 0);
    }
    return map;
  }, [vendors, data]);

  const manualUsageTotal = totalManualUsageThisMonth();
  const fixedTotal = vendors.reduce((sum, v) => sum + v.monthlyFixedAmount, 0);

  return (
    <>
      <div className="flex gap-4 flex-wrap mb-6">
        <StatTile label="Fixed $ / month" value={`$${fixedTotal.toFixed(2)}`} accent="real recurring charges" />
        <StatTile
          label="Usage $ this month"
          value={
            loading
              ? "…"
              : data && !data.ok
                ? `$${manualUsageTotal.toFixed(2)}+`
                : `$${(manualUsageTotal + (data?.ok ? data.totalBilledCost : 0)).toFixed(2)}`
          }
          tone={data && !data.ok ? "warning" : "default"}
          accent={data && !data.ok ? "live portion failed to pull — understated" : "manual + live Vercel spend"}
        />
        <StatTile label="Vendors tracked" value={String(stats.total)} />
        <StatTile label="Live-tracked" value={String(stats.liveTracked)} accent="pulled automatically" />
        <StatTile
          label="Needs attention"
          value={String(stats.needsAttention)}
          tone={stats.needsAttention > 0 ? "warning" : "default"}
          accent="verify / needs input"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <VercelSpendPanel data={data} loading={loading} />
        <BillingMixPanel stats={stats} />
      </div>

      <div className="mb-6">
        <DailySpendTrend data={data} />
      </div>

      <VendorTable vendors={vendors} liveUsageById={liveUsageById} />
    </>
  );
}
