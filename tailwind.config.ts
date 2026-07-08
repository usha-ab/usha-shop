import type { Config } from "tailwindcss";

// Usha Shop brand tokens — dark, premium, a little glam.
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Theme-driven tokens — values live as RGB channels in globals.css
        // (:root = dark default, .light = light override). rgb(var/<alpha>)
        // keeps Tailwind opacity modifiers (bg-base/80 etc.) working.
        base: "rgb(var(--c-base) / <alpha-value>)",
        card: "rgb(var(--c-card) / <alpha-value>)",
        border: "rgb(var(--c-border) / <alpha-value>)",
        text: "rgb(var(--c-text) / <alpha-value>)",
        muted: "rgb(var(--c-muted) / <alpha-value>)",
        gold: {
          DEFAULT: "rgb(var(--c-gold) / <alpha-value>)",
          light: "rgb(var(--c-gold-light) / <alpha-value>)",
        },
        coral: "rgb(var(--c-coral) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["var(--font-outfit)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "ui-monospace", "monospace"],
      },
      backgroundImage: {
        "usha-gradient": "linear-gradient(135deg, #c8a445 0%, #ff6b35 100%)",
      },
      boxShadow: {
        glow: "0 0 40px -12px rgba(200, 164, 69, 0.35)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
