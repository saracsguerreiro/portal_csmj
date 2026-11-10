import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import type { ReactNode } from "react";
import { brandStyle, entity } from "@/config/entity";
import { getSession } from "@/lib/session";
import "./globals.css";

const jakarta = localFont({ src: "../design-system/fonts/plus-jakarta-sans-latin-wght-normal.woff2", weight: "200 800", variable: "--font-jakarta", display: "swap" });
const dmMono = localFont({
  src: [
    { path: "../design-system/fonts/dm-mono-latin-400-normal.woff2", weight: "400" },
    { path: "../design-system/fonts/dm-mono-latin-500-normal.woff2", weight: "500" },
  ],
  variable: "--font-dmmono", display: "swap", preload: false,
});

export const metadata: Metadata = { title: { default: `${entity.productName} ${entity.shortName}`, template: `%s · ${entity.productName} ${entity.shortName}` }, description: entity.name };
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

export default async function RootLayout({ children }: { children: ReactNode }) {
  const s = await getSession();
  return (
    <html lang="pt-AO" data-theme={s.theme === "auto" ? undefined : s.theme} data-density={s.density} className={`${jakarta.variable} ${dmMono.variable}`}>
      <head><style dangerouslySetInnerHTML={{ __html: brandStyle() }} /></head>
      <body>{children}</body>
    </html>
  );
}
