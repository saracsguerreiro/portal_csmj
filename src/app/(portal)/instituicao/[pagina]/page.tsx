import { Suspense } from "react";
import { Booted } from "@/features/shell/Booted";
import { t } from "@/i18n";
import { AboutView } from "./view";

export const dynamicParams = false;

/** Páginas institucionais montadas no painel (A08). No protótipo: Sobre a instituição. */
export function generateStaticParams() {
  return [{ pagina: "sobre" }];
}

export const metadata = { title: t.about.title };

export default function Page() {
  return <Suspense><Booted><AboutView /></Booted></Suspense>;
}
