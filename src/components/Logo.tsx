// Usha monogram — rounded square, gold "U" with accent bar + dot.
export function Logo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="usha-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#c8a445" />
          <stop offset="100%" stopColor="#ff6b35" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="46" height="46" rx="12" fill="#111113" stroke="#1f1f23" />
      <path
        d="M16 14v11a8 8 0 0 0 16 0V14"
        fill="none"
        stroke="url(#usha-g)"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle cx="34" cy="15" r="2.5" fill="#ff6b35" />
    </svg>
  );
}
