export default function ProgressBar({ value, max, height = 12, radius = 8 }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100 || 0));
  return (
    <div
      style={{
        width: "100%",
        background: "#eee",
        borderRadius: radius,
        overflow: "hidden",
        height,
      }}
      aria-label="XP progress"
    >
      <div
        style={{
          width: `${pct}%`,
          height: "100%",
          background:
            "linear-gradient(90deg, #6ee7b7 0%, #34d399 40%, #10b981 100%)",
          transition: "width 240ms ease",
        }}
      />
    </div>
  );
}
