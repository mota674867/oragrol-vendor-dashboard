// Stat tile — label / value / optional accent, per the dataviz skill's
// figure contract (sentence-case label, semibold value, no trailing colon).
export default function StatTile({
  label,
  value,
  accent,
  tone = "default",
}: {
  label: string;
  value: string;
  accent?: string;
  tone?: "default" | "warning" | "critical";
}) {
  const toneColor =
    tone === "warning" ? "var(--status-warning)" : tone === "critical" ? "var(--status-critical)" : "var(--text-primary)";

  return (
    <div
      className="rounded-xl p-4 flex-1 min-w-[150px]"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
    >
      <p className="text-[11px] uppercase tracking-wide mb-2" style={{ color: "var(--text-muted)" }}>
        {label}
      </p>
      <p className="text-2xl font-semibold" style={{ color: toneColor }}>
        {value}
      </p>
      {accent && (
        <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
          {accent}
        </p>
      )}
    </div>
  );
}
