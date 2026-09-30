"use client";

import { useEffect, useState } from "react";
import type { VercelUsageSummary } from "@/lib/vercel";

const BAR_COLORS = ["var(--cat-1)", "var(--cat-2)", "var(--cat-3)", "var(--cat-4)", "var(--cat-5)"];

export default function VercelSpendPanel() {
  const [data, setData] = useState<VercelUsageSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/vercel-usage")
      .then((r) => r.json())
      .then(setData)
      .catch((err) => setData({ ok: false, error: "Request failed", detail: String(err) }))
      .finally(() => setLoading(false));
  }, []);

  const max = data?.ok ? Math.max(...data.byService.map((s) => s.totalCost), 0.0001) : 1;

  return (
    <div className="rounded-xl p-5" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
      <div className="flex items-center justify-between mb-1">
        <p className="text-[11px] uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
          Live spend / last 30 days
        </p>
        <span
          className="text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wide"
          style={{ background: "var(--surface-2)", color: "var(--cat-3)" }}
        >
          Pulled automatically
        </span>
      </div>
      <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
        Vercel-billed spend, by service.
      </h2>

      {loading && <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Loading real usage from Vercel&apos;s billing API…</p>}

      {!loading && data && !data.ok && (
        <div
          className="text-sm rounded-lg p-3"
          style={{ background: "rgba(230,103,103,0.08)", border: "1px solid rgba(230,103,103,0.35)" }}
        >
          <p className="font-medium" style={{ color: "var(--status-critical)" }}>
            Couldn&apos;t pull real usage: {data.error}
          </p>
          {data.detail && (
            <p className="mt-1 text-xs" style={{ color: "var(--text-secondary)" }}>
              {data.detail}
            </p>
          )}
          <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
            Shown as an error on purpose — never a guessed $0.
          </p>
        </div>
      )}

      {!loading && data && data.ok && (
        <div>
          <p className="text-3xl font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
            ${data.totalBilledCost.toFixed(2)}{" "}
            <span className="text-sm font-normal" style={{ color: "var(--text-muted)" }}>
              {data.currency} · team {data.teamSlug}
            </span>
          </p>

          {data.byService.length === 0 ? (
            <p className="text-sm mt-3" style={{ color: "var(--text-secondary)" }}>
              No billed charges this period — consistent with the Hobby plan&apos;s included credit covering everything so far.
            </p>
          ) : (
            <div className="flex flex-col gap-3 mt-4">
              {data.byService.map((s, i) => (
                <div key={`${s.providerName}-${s.serviceName}`} className="flex items-center gap-3">
                  <span className="text-xs w-28 shrink-0 truncate" style={{ color: "var(--text-secondary)" }}>
                    {s.serviceName}
                  </span>
                  <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "var(--surface-2)" }}>
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${(s.totalCost / max) * 100}%`, background: BAR_COLORS[i % BAR_COLORS.length] }}
                    />
                  </div>
                  <span className="text-xs w-16 text-right tabular-nums" style={{ color: "var(--text-primary)" }}>
                    ${s.totalCost.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
