// Real day-by-day Vercel spend — bucketed server-side from actual charge
// records (ChargePeriodStart), not simulated. A flat line at 0 is a true
// reading (nothing invoiced that day), not a placeholder.
import type { VercelUsageSummary } from "@/lib/vercel";

export default function DailySpendTrend({ data }: { data: VercelUsageSummary | null }) {
  if (!data || !data.ok) return null;

  const days = data.byDay;
  const max = Math.max(...days.map((d) => d.totalCost), 0.01);
  const barWidth = Math.max(6, Math.min(20, Math.floor(760 / days.length) - 2));

  // Sparse x-axis labels: first, middle, last — avoids 30 overlapping ticks.
  const labelIdx = new Set([0, Math.floor(days.length / 2), days.length - 1]);

  return (
    <div className="rounded-xl p-5" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
      <p className="text-[11px] uppercase tracking-wide mb-1" style={{ color: "var(--text-muted)" }}>
        Day-by-day / Vercel-billed spend
      </p>
      <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
        Daily cost, last {days.length} days.
      </h2>

      <div className="flex items-end gap-[2px] h-28" role="img" aria-label="Daily Vercel spend, last 30 days">
        {days.map((d) => {
          const h = Math.max(2, Math.round((d.totalCost / max) * 100));
          return (
            <div
              key={d.date}
              title={`${d.date}: $${d.totalCost.toFixed(4)}`}
              className="rounded-t"
              style={{ width: barWidth, height: `${h}%`, background: "var(--cat-1)", flexShrink: 0 }}
            />
          );
        })}
      </div>
      <div className="flex justify-between mt-2 text-[10px]" style={{ color: "var(--text-muted)" }}>
        {days.map((d, i) =>
          labelIdx.has(i) ? (
            <span key={d.date}>{new Date(d.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
          ) : (
            <span key={d.date} />
          )
        )}
      </div>
      <p className="text-xs mt-3" style={{ color: "var(--text-muted)" }}>
        Hover a bar for the exact date and $ amount. All-zero right now is a real reading — nothing has been invoiced yet (Hobby plan, still inside included credit).
      </p>
    </div>
  );
}
