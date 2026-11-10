import type { NextConfig } from "next";

/** PAGES=1 gera o site estático para o GitHub Pages, servido em /portal_csmj. */
const pages = process.env.PAGES === "1";
const basePath = pages ? "/portal_csmj" : "";

const config: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: { unoptimized: true },
  devIndicators: false,
  ...(pages ? { output: "export" as const, basePath, trailingSlash: true } : {}),
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default config;
