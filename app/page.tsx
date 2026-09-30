import StatTile from "@/components/StatTile";
import BillingMixPanel from "@/components/BillingMixPanel";
import VercelSpendPanel from "@/components/VercelSpendPanel";
import VendorTable from "@/components/VendorTable";
import { VENDORS, summarizeVendors } from "@/lib/vendors";

export default function Home() {
  const stats = summarizeVendors(VENDORS);

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <p className="text-[11px] uppercase tracking-wide mb-1" style={{ color: "var(--text-muted)" }}>
        ORAGROL / VENDOR CONTROL
      </p>
      <h1 className="text-3xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>
        Vendors.
      </h1>
      <div className="h-0.5 w-10 rounded mb-3" style={{ background: "var(--cat-3)" }} />
      <p className="text-sm mb-8" style={{ color: "var(--text-secondary)" }}>
        Every vendor, API and subscription the business depends on, in one accountable view.
      </p>

      <div className="flex gap-4 flex-wrap mb-6">
        <StatTile label="Vendors tracked" value={String(stats.total)} />
        <StatTile label="Live-tracked" value={String(stats.liveTracked)} accent="pulled automatically" />
        <StatTile
          label="Needs attention"
          value={String(stats.needsAttention)}
          tone={stats.needsAttention > 0 ? "warning" : "default"}
          accent="verify / needs input"
        />
        <StatTile label="Confirmed" value={String(stats.confirmed)} tone="default" />
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <VercelSpendPanel />
        <BillingMixPanel stats={stats} />
      </div>

      <VendorTable vendors={VENDORS} />
    </main>
  );
}
