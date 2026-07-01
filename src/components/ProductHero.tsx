"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { ColorId, ProductColor } from "@/lib/product";

interface Props {
  colors: ProductColor[];
  gallery: string[];
  priceDisplay: string;
  freeShippingDisplay: string;
}

export function ProductHero({ colors, gallery, priceDisplay, freeShippingDisplay }: Props) {
  const t = useTranslations("product");
  const locale = useLocale();

  const [color, setColor] = useState<ColorId>(colors[0].id);
  const [activeImage, setActiveImage] = useState<string>(colors[0].image);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectColor = (c: ProductColor) => {
    setColor(c.id);
    setActiveImage(c.image);
  };

  const thumbnails = [...colors.map((c) => c.image), ...gallery];

  async function checkout() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ colorId: color, quantity, locale }),
      });
      if (!res.ok) throw new Error("checkout failed");
      const { url } = (await res.json()) as { url: string };
      window.location.href = url;
    } catch {
      setError(t("checkoutError"));
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
      {/* Gallery */}
      <div>
        <div className="overflow-hidden rounded-xl2 border border-border bg-card shadow-glow">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={activeImage}
            alt={t("name")}
            className="aspect-square w-full object-cover"
            loading="eager"
          />
        </div>
        <div className="mt-4 grid grid-cols-5 gap-3">
          {thumbnails.map((src) => (
            <button
              key={src}
              type="button"
              onClick={() => setActiveImage(src)}
              className={`overflow-hidden rounded-lg border transition-colors ${
                activeImage === src ? "border-gold" : "border-border hover:border-muted"
              }`}
              aria-label={t("name")}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="aspect-square w-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      </div>

      {/* Buy box */}
      <div className="lg:pt-2">
        <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
          {t("name")}
        </h1>
        <p className="mt-3 text-lg text-muted">{t("tagline")}</p>

        <div className="mt-6 flex items-baseline gap-3">
          <span className="text-3xl font-semibold text-gradient">{priceDisplay}</span>
          <span className="font-mono text-xs text-muted">
            {t("freeShipping", { threshold: freeShippingDisplay })}
          </span>
        </div>

        {/* Color selector */}
        <div className="mt-8">
          <div className="mb-3 flex items-center gap-2 text-sm">
            <span className="text-muted">{t("colorsLabel")}:</span>
            <span className="font-medium">{t(`colorNames.${color}`)}</span>
          </div>
          <div className="flex gap-3">
            {colors.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => selectColor(c)}
                aria-label={t(`colorNames.${c.id}`)}
                aria-pressed={color === c.id}
                className={`h-10 w-10 rounded-full border-2 transition-transform hover:scale-105 ${
                  color === c.id ? "border-gold ring-2 ring-gold/30" : "border-border"
                }`}
                style={{ backgroundColor: c.swatch }}
              />
            ))}
          </div>
        </div>

        {/* Quantity */}
        <div className="mt-6">
          <label className="mb-3 block text-sm text-muted">{t("quantityLabel")}</label>
          <div className="inline-flex items-center rounded-lg border border-border">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="px-4 py-2 text-lg text-muted transition-colors hover:text-text disabled:opacity-40"
              disabled={quantity <= 1}
              aria-label="-"
            >
              −
            </button>
            <span className="w-10 text-center font-mono">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(10, q + 1))}
              className="px-4 py-2 text-lg text-muted transition-colors hover:text-text"
              aria-label="+"
            >
              +
            </button>
          </div>
        </div>

        {/* CTA */}
        <button
          type="button"
          onClick={checkout}
          disabled={loading}
          className="mt-8 w-full rounded-xl bg-usha-gradient px-6 py-4 text-base font-semibold text-base shadow-glow transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {loading ? t("ctaLoading") : t("cta")}
        </button>
        {error && (
          <p className="mt-3 text-sm text-coral" role="alert">
            {error}
          </p>
        )}
        <p className="mt-3 text-center font-mono text-[11px] text-muted">{t("materialNote")}</p>
      </div>
    </div>
  );
}
