import { useTranslations } from "next-intl";
import { StarIcon } from "./icons";

interface ReviewItem {
  name: string;
  rating: number;
  text: string;
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating}/5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <StarIcon
          key={i}
          className={`h-4 w-4 ${i < rating ? "text-gold" : "text-border"}`}
        />
      ))}
    </div>
  );
}

export function Reviews() {
  const t = useTranslations("reviews");
  // useTranslations can't return arrays directly; read raw via t.raw.
  const items = t.raw("items") as ReviewItem[];

  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <h2 className="text-2xl font-semibold tracking-tight">{t("heading")}</h2>
      <p className="mt-2 text-sm text-muted">{t("placeholderNote")}</p>
      <div className="mt-8 grid gap-5 sm:grid-cols-3">
        {items.map((r, i) => (
          <figure key={i} className="rounded-xl2 border border-border bg-card p-6">
            <Stars rating={r.rating} />
            <blockquote className="mt-4 text-sm leading-relaxed text-text">“{r.text}”</blockquote>
            <figcaption className="mt-4 font-mono text-xs text-muted">— {r.name}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
