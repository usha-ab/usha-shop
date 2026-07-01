// Text-style payment badges (no external logo assets → no extra requests / CSP
// exceptions). Payment methods are enabled on the platform Stripe account.
const METHODS = ["Klarna", "Swish", "Visa", "Mastercard", "Apple Pay", "Google Pay"];

export function PaymentBadges({ className = "" }: { className?: string }) {
  return (
    <ul className={`flex flex-wrap gap-2 ${className}`} aria-label="Accepted payment methods">
      {METHODS.map((m) => (
        <li
          key={m}
          className="rounded-md border border-border bg-card px-2.5 py-1 font-mono text-[11px] text-muted"
        >
          {m}
        </li>
      ))}
    </ul>
  );
}
