"use client";

import { useMemo, useState } from "react";
import type { Vendor, BillingType, VerifyStatus } from "@/lib/vendors";

const BILLING_LABEL: Record<BillingType, string> = {
  usage: "Usage-based",
  fixed: "Fixed",
  free: "Free tier",
  deferred: "Deferred",
  not_used: "Not used",
};

// Same fixed categorical order as BillingMixPanel — identity must match
// across the panel and the table (dataviz skill: "color follows the entity").
const BILLING_COLOR: Record<BillingType, string> = {
  usage: "var(--cat-1)",
  fixed: "var(--cat-2)",
  free: "var(--cat-3)",
  deferred: "var(--cat-4)",
  not_used: "var(--cat-5)",
};

const VERIFY_LABEL: Record<VerifyStatus, string> = {
  confirmed: "Confirmed",
  verify: "Verify",
  needs_input: "Needs input",
};

const VERIFY_COLOR: Record<VerifyStatus, string> = {
  confirmed: "var(--status-good)",
  verify: "var(--status-warning)",
  needs_input: "var(--status-critical)",
};

function Badge({ color, label }: { color: string; label: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full whitespace-nowrap"
      style={{ background: "var(--surface-2)", color: "var(--text-primary)" }}
    >
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color }} />
      {label}
    </span>
  );
}

const STATUS_FILTERS: ("all" | VerifyStatus)[] = ["all", "confirmed", "verify", "needs_input"];

export default function VendorTable({
  vendors,
  liveUsageById,
}: {
  vendors: Vendor[];
  /** Real Vercel-matched $ this month, keyed by vendor id. undefined = no
   *  live match attempted for this vendor; null = live fetch failed (show
   *  the failure, not a fake number); number = the real matched figure. */
  liveUsageById: Record<string, number | null | undefined>;
}) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | VerifyStatus>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return vendors.filter((v) => {
      if (statusFilter !== "all" && v.verifyStatus !== statusFilter) return false;
      if (!q) return true;
      return (
        v.name.toLowerCase().includes(q) ||
        v.usedBy.some((f) => f.toLowerCase().includes(q)) ||
        v.billingNote.toLowerCase().includes(q)
      );
    });
  }, [vendors, query, statusFilter]);

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
      <div className="flex items-center justify-between gap-4 p-5 pb-4 flex-wrap">
        <div>
          <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
            Vendor directory.
          </h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
            {filtered.length} of {vendors.length} shown
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search vendors…"
            className="text-sm rounded-lg px-3 py-1.5 outline-none w-48"
            style={{ background: "var(--surface-2)", color: "var(--text-primary)", border: "1px solid var(--border)" }}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "all" | VerifyStatus)}
            className="text-sm rounded-lg px-3 py-1.5 outline-none"
            style={{ background: "var(--surface-2)", color: "var(--text-primary)", border: "1px solid var(--border)" }}
          >
            {STATUS_FILTERS.map((s) => (
              <option key={s} value={s}>
                {s === "all" ? "All statuses" : VERIFY_LABEL[s]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wide" style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}>
              <th className="py-2 px-5 font-medium">Vendor</th>
              <th className="py-2 px-3 font-medium">Used by</th>
              <th className="py-2 px-3 font-medium">Billing</th>
              <th className="py-2 px-3 font-medium text-right">Fixed $/mo</th>
              <th className="py-2 px-3 font-medium">Payment date</th>
              <th className="py-2 px-3 font-medium text-right">Usage $ (month)</th>
              <th className="py-2 px-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((v) => {
              const live = liveUsageById[v.id];
              const usageDisplay = v.vercelServiceMatch
                ? live === null
                  ? null // live fetch failed — render a flag, not a number
                  : live ?? 0
                : v.usageAmountThisMonth;

              return (
                <tr key={v.id} className="align-top" style={{ borderTop: "1px solid var(--border)" }}>
                  <td className="py-3 px-5 font-medium" style={{ color: "var(--text-primary)" }}>
                    {v.checkUrl ? (
                      <a href={v.checkUrl} target="_blank" rel="noopener" className="hover:underline">
                        {v.name}
                      </a>
                    ) : (
                      v.name
                    )}
                    {v.liveTracked && (
                      <span className="ml-2 text-[10px] uppercase tracking-wide whitespace-nowrap" style={{ color: "var(--cat-3)" }}>
                        ● live
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3" style={{ color: "var(--text-secondary)" }}>
                    {v.usedBy.join(", ") || "—"}
                  </td>
                  <td className="py-3 px-3">
                    <Badge color={BILLING_COLOR[v.billingType]} label={BILLING_LABEL[v.billingType]} />
                  </td>
                  <td className="py-3 px-3 text-right tabular-nums" style={{ color: "var(--text-primary)" }}>
                    ${v.monthlyFixedAmount.toFixed(2)}
                  </td>
                  <td className="py-3 px-3" style={{ color: "var(--text-secondary)" }}>
                    {v.paymentDate ?? "—"}
                  </td>
                  <td className="py-3 px-3 text-right tabular-nums" style={{ color: usageDisplay === null ? "var(--status-critical)" : "var(--text-primary)" }}>
                    {usageDisplay === null ? "live pull failed" : `$${usageDisplay.toFixed(2)}`}
                  </td>
                  <td className="py-3 px-3">
                    <Badge color={VERIFY_COLOR[v.verifyStatus]} label={VERIFY_LABEL[v.verifyStatus]} />
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-sm" style={{ color: "var(--text-muted)" }}>
                  No vendors match that search/filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs p-5 pt-4" style={{ color: "var(--text-muted)" }}>
        Data source: <code>lib/vendors.ts</code> — edit that file to update a vendor&apos;s facts. Rows marked{" "}
        <span style={{ color: "var(--cat-3)" }}>● live</span> pull their Usage $ from Vercel&apos;s billing API automatically.
      </p>
    </div>
  );
}
