// The signature visual for LearnQuest: a concentric "mastery ring" —
// styled after an astrolabe/instrument dial rather than a flat progress bar.
// Used for rank progress, course completion, and topic completion alike.

export default function MasteryRing({
  ratio = 0,
  size = 120,
  strokeWidth = 6,
  label,
  sublabel,
  accent = "var(--color-brass)",
}) {
  const clamped = Math.min(1, Math.max(0, ratio));
  const radiusOuter = size / 2 - strokeWidth;
  const radiusInner = radiusOuter - strokeWidth - 4;
  const circOuter = 2 * Math.PI * radiusOuter;
  const circInner = 2 * Math.PI * radiusInner;

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
      >
        {/* Outer track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radiusOuter}
          fill="none"
          stroke="var(--color-panel-line)"
          strokeWidth={strokeWidth}
        />
        {/* Outer progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radiusOuter}
          fill="none"
          stroke={accent}
          strokeWidth={strokeWidth}
          strokeDasharray={circOuter}
          strokeDashoffset={circOuter * (1 - clamped)}
          strokeLinecap="butt"
          style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)" }}
        />
        {/* Inner hairline ring — purely instrumental / decorative, evokes a dial */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radiusInner}
          fill="none"
          stroke="var(--color-panel-line)"
          strokeWidth={1}
          strokeDasharray="2 4"
        />
        {/* Tick marks around inner ring */}
        {Array.from({ length: 24 }).map((_, i) => {
          const angle = (i / 24) * 2 * Math.PI;
          const r1 = radiusInner - 3;
          const r2 = radiusInner + 3;
          const cx = size / 2;
          const cy = size / 2;
          return (
            <line
              key={i}
              x1={cx + r1 * Math.cos(angle)}
              y1={cy + r1 * Math.sin(angle)}
              x2={cx + r2 * Math.cos(angle)}
              y2={cy + r2 * Math.sin(angle)}
              stroke="var(--color-panel-line)"
              strokeWidth={1}
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {label && (
          <span className="font-mono text-lg font-semibold text-[var(--color-parchment)] leading-none">
            {label}
          </span>
        )}
        {sublabel && (
          <span className="eyebrow mt-1 text-[9px] text-center leading-tight px-2">
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
}
