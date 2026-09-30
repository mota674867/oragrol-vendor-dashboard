import DashboardClient from "@/components/DashboardClient";
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

      <DashboardClient vendors={VENDORS} stats={stats} />
    </main>
  );
}
