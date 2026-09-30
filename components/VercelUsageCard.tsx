"use client";

import { useEffect, useState } from "react";
import type { VercelUsageSummary } from "@/lib/vercel";

export default function VercelUsageCard() {
  const [data, setData] = useState<VercelUsageSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/vercel-usage")
      .then((r) => r.json())
      .then(setData)
      .catch((err) => setData({ ok: false, error: "Request failed", detail: String(err) }))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-lg">Live Vercel spend (last 30 days)</h2>
        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          Pulled automatically — not a manual check
        </span>
      </div>

      {loading && <p className="text-sm text-neutral-500">Loading real usage from Vercel&apos;s billing API…</p>}

      {!loading && data && !data.ok && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3 dark:text-red-300 dark:bg-red-950 dark:border-red-900">
          <p className="font-medium">Couldn&apos;t pull real usage: {data.error}</p>
          {data.detail && <p className="mt-1 text-xs opacity-80">{data.detail}</p>}
          <p className="mt-1 text-xs opacity-80">This is shown as an error on purpose — never a guessed $0.</p>
        </div>
      )}

      {!loading && data && data.ok && (
        <div>
          <p className="text-3xl font-bold mb-1">
            ${data.totalBilledCost.toFixed(4)} <span className="text-base font-normal text-neutral-500">{data.currency}</span>
          </p>
          <p className="text-xs text-neutral-500 mb-4">
            Team: {data.teamSlug} · {new Date(data.rangeFrom).toLocaleDateString()} – {new Date(data.rangeTo).toLocaleDateString()}
          </p>
          {data.byService.length === 0 ? (
            <p className="text-sm text-neutral-500">No billed charges in this period — consistent with the Hobby plan&apos;s $20/mo included credit covering everything so far.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase text-neutral-500 border-b border-neutral-200 dark:border-neutral-800">
                  <th className="py-1.5">Service</th>
                  <th className="py-1.5">Provider</th>
                  <th className="py-1.5 text-right">Cost</th>
                  <th className="py-1.5 text-right">Charges</th>
                </tr>
              </thead>
              <tbody>
                {data.byService.map((s) => (
                  <tr key={`${s.providerName}-${s.serviceName}`} className="border-b border-neutral-100 dark:border-neutral-800/50">
                    <td className="py-1.5">{s.serviceName}</td>
                    <td className="py-1.5 text-neutral-500">{s.providerName}</td>
                    <td className="py-1.5 text-right font-mono">${s.totalCost.toFixed(4)}</td>
                    <td className="py-1.5 text-right text-neutral-500">{s.charges}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
