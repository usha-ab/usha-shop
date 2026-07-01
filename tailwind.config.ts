import type { Config } from "tailwindcss";

// Usha Shop brand tokens — dark, premium, a little glam.
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        base: "#0a0a0b",
        card: "#111113",
        border: "#1f1f23",
        text: "#fafaf9",
        muted: "#8b8b8b",
        gold: {
          DEFAULT: "#c8a445",
          light: "#e8d48b",
        },
        coral: "#ff6b35",
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
