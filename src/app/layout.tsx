import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import type { ReactNode } from "react";
import { brandStyle, entity } from "@/config/entity";
import { ClientBoot } from "@/features/shell/ClientBoot";
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

/* Aplica tema e densidade guardados antes da primeira pintura, sem piscar. */
const prefsScript = `try{var p=JSON.parse(localStorage.getItem("csmj_prefs")||"{}");var d=document.documentElement;if(p.csmj_tema&&p.csmj_tema!=="auto")d.dataset.theme=p.csmj_tema;if(p.csmj_densidade)d.dataset.density=p.csmj_densidade;}catch(e){}`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-AO" data-density="comfortable" className={`${jakarta.variable} ${dmMono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: prefsScript }} />
        <style dangerouslySetInnerHTML={{ __html: brandStyle() }} />
      </head>
      <body>
        <ClientBoot />
        {children}
      </body>
    </html>
  );
}
