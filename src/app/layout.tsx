import type { ReactNode } from "react";
import "./globals.css";

// The real <html>/<body> live in [locale]/layout.tsx so the lang attribute can
// follow the active locale. Next requires a root layout, so this just passes
// children through.
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
