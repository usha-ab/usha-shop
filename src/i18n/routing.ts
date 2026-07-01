import { defineRouting } from "next-intl/routing";

// Swedish is the default (unprefixed) locale; English and Spanish are prefixed.
export const routing = defineRouting({
  locales: ["sv", "en", "es"],
  defaultLocale: "sv",
  localePrefix: "as-needed",
});

export type Locale = (typeof routing.locales)[number];
