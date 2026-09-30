import VercelUsageCard from "@/components/VercelUsageCard";
import { VENDORS, type Vendor, type BillingType, type VerifyStatus } from "@/lib/vendors";

const BILLING_LABEL: Record<BillingType, string> = {
  usage: "Usage-based",
  fixed: "Fixed",
  free: "Free tier",
  deferred: "Deferred",
  not_used: "Not used",
};

const BILLING_COLOR: Record<BillingType, string> = {
  usage: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  fixed: "bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
  free: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  deferred: "bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
  not_used: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

const VERIFY_LABEL: Record<VerifyStatus, string> = {
  confirmed: "Confirmed",
  verify: "Verify",
  needs_input: "Needs input",
};

const VERIFY_COLOR: Record<VerifyStatus, string> = {
  confirmed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  verify: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  needs_input: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

function VendorRow({ v }: { v: Vendor }) {
  return (
    <tr className="border-b border-neutral-100 dark:border-neutral-800/50 align-top">
      <td className="py-3 pr-3 font-medium">
        {v.checkUrl ? (
          <a href={v.checkUrl} target="_blank" rel="noopener" className="hover:underline">
            {v.name}
          </a>
        ) : (
          v.name
        )}
        {v.liveTracked && (
          <span className="ml-2 text-[10px] uppercase tracking-wide text-blue-700 dark:text-blue-300">● live</span>
        )}
      </td>
      <td className="py-3 pr-3 text-neutral-500">{v.usedBy.join(", ") || "—"}</td>
      <td className="py-3 pr-3">
        <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${BILLING_COLOR[v.billingType]}`}>
          {BILLING_LABEL[v.billingType]}
        </span>
      </td>
      <td className="py-3 pr-3 text-neutral-600 dark:text-neutral-400">{v.billingNote}</td>
      <td className="py-3">
        <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${VERIFY_COLOR[v.verifyStatus]}`}>
          {VERIFY_LABEL[v.verifyStatus]}
        </span>
      </td>
    </tr>
  );
}

export default function Home() {
  const needsInput = VENDORS.filter((v) => v.verifyStatus === "needs_input");
  const toVerify = VENDORS.filter((v) => v.verifyStatus === "verify");

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-1">ORAGROL Vendor &amp; Cost Dashboard</h1>
      <p className="text-neutral-500 text-sm mb-8">
        Every vendor/API/subscription the site depends on. Rows marked <span className="text-blue-700 dark:text-blue-300">● live</span> are pulled
        automatically, not manually checked.
      </p>

      <div className="grid gap-6 mb-8">
        <VercelUsageCard />
      </div>

      {(needsInput.length > 0 || toVerify.length > 0) && (
        <div className="mb-6 rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950 dark:border-amber-800 p-4 text-sm">
          <p className="font-medium mb-1">{needsInput.length + toVerify.length} item(s) not fully confirmed yet</p>
          <ul className="list-disc list-inside text-neutral-700 dark:text-neutral-300">
            {[...needsInput, ...toVerify].map((v) => (
              <li key={v.id}>{v.name} — {v.note ?? v.billingNote}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase text-neutral-500 bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
              <th className="py-2 px-3">Vendor</th>
              <th className="py-2 px-3">Used by</th>
              <th className="py-2 px-3">Billing</th>
              <th className="py-2 px-3">Rate / notes</th>
              <th className="py-2 px-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {VENDORS.map((v) => (
              <VendorRow key={v.id} v={v} />
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-neutral-400 mt-6">
        Data source: <code>lib/vendors.ts</code> in this repo, built from a full grep of the live oragrol-website codebase — edit that file to update a vendor&apos;s facts.
      </p>
    </main>
  );
}
