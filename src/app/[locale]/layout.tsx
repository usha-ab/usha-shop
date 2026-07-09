import type { ReactNode } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Outfit, JetBrains_Mono } from "next/font/google";
import { routing } from "@/i18n/routing";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://shop.usha.se";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "catalog" });
  const meta = await getTranslations({ locale, namespace: "meta" });
  const defaultTitle = `${t("heading")} — ${t("subheading")}`;

  return {
    metadataBase: new URL(SITE_URL),
    // Favicon is served same-origin from src/app/icon.png (Next file convention).
    // The previous cross-origin icon URL rendered unreliably — a grey globe in
    // the browser tab.
    title: {
      default: defaultTitle,
      template: `%s | ${meta("siteName")}`,
    },
    description: t("subheading"),
    openGraph: {
      type: "website",
      siteName: meta("siteName"),
      title: defaultTitle,
      description: t("subheading"),
      images: [{ url: "/images/og-cover.jpg", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: defaultTitle,
      description: t("subheading"),
      images: ["/images/og-cover.jpg"],
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  return (
    <html lang={locale} className={`${outfit.variable} ${jetbrainsMono.variable}`}>
      <head>
        {/* Set the saved theme before paint to avoid a flash of the wrong mode. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{if(localStorage.getItem('usha-theme')==='light')document.documentElement.classList.add('light')}catch(e){}})()",
          }}
        />
      </head>
      <body className="min-h-screen bg-base font-sans text-text antialiased">
        <NextIntlClientProvider>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
