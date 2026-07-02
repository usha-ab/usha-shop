"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { ColorId, ProductColor } from "@/lib/product";
import { CheckIcon, ShieldIcon, TruckIcon, ReturnIcon } from "./icons";

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

  // Mobile sticky bar: show once the main CTA has scrolled out of view.
  const ctaRef = useRef<HTMLButtonElement>(null);
  const [showStickyBar, setShowStickyBar] = useState(false);

  useEffect(() => {
    const el = ctaRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyBar(!entry.isIntersecting),
      { rootMargin: "0px 0px -80px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

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
    <>
    <div className="grid gap-8 md:grid-cols-2 md:items-start md:gap-10 lg:gap-12">
      {/* Gallery — white studio card so the product reads as a clean shot */}
      <div className="mx-auto w-full max-w-md md:mx-0 md:max-w-none md:sticky md:top-24">
        <div className="overflow-hidden rounded-2xl border border-border bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={activeImage}
            alt={t("name")}
            className="aspect-square w-full object-contain p-6 sm:p-8"
            loading="eager"
          />
        </div>
        <div className="mt-3 grid grid-cols-5 gap-2 sm:gap-3">
          {thumbnails.map((src) => (
            <button
              key={src}
              type="button"
              onClick={() => setActiveImage(src)}
              className={`overflow-hidden rounded-lg border bg-white transition ${
                activeImage === src
                  ? "border-gold ring-1 ring-gold/40"
                  : "border-border hover:border-muted"
              }`}
              aria-label={t("name")}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="aspect-square w-full object-contain p-1.5" loading="eager" />
            </button>
          ))}
        </div>
      </div>

      {/* Buy box */}
      <div className="md:pt-1">
        <h1 className="text-2xl font-semibold leading-tight tracking-tight sm:text-3xl lg:text-4xl">
          {t("name")}
        </h1>
        <p className="mt-3 text-base leading-relaxed text-muted sm:text-lg">{t("tagline")}</p>

        <div className="mt-6 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-3xl font-bold text-gradient sm:text-4xl">{priceDisplay}</span>
          <span className="font-mono text-xs text-muted">
            {t("freeShipping", { threshold: freeShippingDisplay })}
          </span>
        </div>

        {/* Color selector */}
        <div className="mt-8">
          <div className="mb-3 flex items-center gap-2 text-sm">
            <span className="text-muted">{t("colorsLabel")}:</span>
            <span className="font-medium text-text">{t(`colorNames.${color}`)}</span>
          </div>
          <div className="flex gap-3">
            {colors.map((c) => {
              const selected = color === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => selectColor(c)}
                  aria-label={t(`colorNames.${c.id}`)}
                  aria-pressed={selected}
                  className={`relative h-11 w-11 rounded-full border transition-transform hover:scale-105 ${
                    selected
                      ? "border-gold ring-2 ring-gold/40 ring-offset-2 ring-offset-base"
                      : "border-border"
                  }`}
                  style={{ backgroundColor: c.swatch }}
                >
                  {selected && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <CheckIcon className="h-4 w-4 text-white drop-shadow" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Quantity + CTA */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <div className="flex items-center justify-between rounded-xl border border-border sm:justify-start">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="px-4 py-3 text-lg text-muted transition-colors hover:text-text disabled:opacity-40"
              disabled={quantity <= 1}
              aria-label="-"
            >
              −
            </button>
            <span className="w-10 text-center font-mono text-lg">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(10, q + 1))}
              className="px-4 py-3 text-lg text-muted transition-colors hover:text-text"
              aria-label="+"
            >
              +
            </button>
          </div>
          <button
            ref={ctaRef}
            type="button"
            onClick={checkout}
            disabled={loading}
            className="flex-1 rounded-xl bg-usha-gradient px-6 py-4 text-base font-semibold text-[#0a0a0b] shadow-glow transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {loading ? t("ctaLoading") : t("cta")}
          </button>
        </div>
        {error && (
          <p className="mt-3 text-sm text-coral" role="alert">
            {error}
          </p>
        )}

        {/* Reassurance strip */}
        <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted">
          <span className="inline-flex items-center gap-1.5">
            <ShieldIcon className="h-4 w-4 text-gold" />
            {t("trustSecure")}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <TruckIcon className="h-4 w-4 text-gold" />
            {t("trustShipping")}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ReturnIcon className="h-4 w-4 text-gold" />
            {t("trustReturns")}
          </span>
        </div>
        <p className="mt-4 font-mono text-[11px] text-muted">{t("materialNote")}</p>
      </div>
    </div>

    {/* Mobile sticky add-to-cart bar */}
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-border bg-base/95 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur transition-transform duration-300 md:hidden ${
        showStickyBar ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="min-w-0">
          <div className="truncate text-[11px] text-muted">{t(`colorNames.${color}`)}</div>
          <div className="font-semibold leading-tight text-gradient">{priceDisplay}</div>
        </div>
        <button
          type="button"
          onClick={checkout}
          disabled={loading}
          className="ml-auto min-w-[55%] rounded-xl bg-usha-gradient px-5 py-3 text-sm font-semibold text-[#0a0a0b] transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {loading ? t("ctaLoading") : t("cta")}
        </button>
      </div>
    </div>
    </>
  );
}
