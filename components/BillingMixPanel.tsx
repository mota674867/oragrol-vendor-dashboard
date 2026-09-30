import { BILLING_TYPES, type VendorStats } from "@/lib/vendors";

const BILLING_LABEL: Record<(typeof BILLING_TYPES)[number], string> = {
  usage: "Usage-based",
  fixed: "Fixed",
  free: "Free tier",
  deferred: "Deferred",
  not_used: "Not used",
};

// Fixed categorical order — never reassigned per render, per the dataviz
// skill's non-negotiable ("assign categorical hues in fixed order").
const BILLING_COLOR: Record<(typeof BILLING_TYPES)[number], string> = {
  usage: "var(--cat-1)",
  fixed: "var(--cat-2)",
  free: "var(--cat-3)",
  deferred: "var(--cat-4)",
  not_used: "var(--cat-5)",
};

export default function BillingMixPanel({ stats }: { stats: VendorStats }) {
  const max = Math.max(...stats.byBillingType.map((b) => b.count), 1);

  return (
    <div className="rounded-xl p-5" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
      <p className="text-[11px] uppercase tracking-wide mb-1" style={{ color: "var(--text-muted)" }}>
        Vendor mix / by billing type
      </p>
      <h2 className="text-lg font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
        How the {stats.total} vendors bill.
      </h2>
      <p className="text-xs mb-5" style={{ color: "var(--text-secondary)" }}>
        Counts, not dollars — most vendors here don&apos;t have a real recurring charge yet.
      </p>

      <div className="flex flex-col gap-3">
        {stats.byBillingType
          .filter((b) => b.count > 0)
          .map((b) => (
            <div key={b.type} className="flex items-center gap-3">
              <span className="text-xs w-28 shrink-0" style={{ color: "var(--text-secondary)" }}>
                {BILLING_LABEL[b.type]}
              </span>
              <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "var(--surface-2)" }}>
                <div
                  className="h-full rounded-full"
                  style={{ width: `${(b.count / max) * 100}%`, background: BILLING_COLOR[b.type] }}
                />
              </div>
              <span className="text-xs w-5 text-right tabular-nums" style={{ color: "var(--text-primary)" }}>
                {b.count}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}
