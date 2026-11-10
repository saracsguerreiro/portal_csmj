import { Suspense } from "react";
import { Booted } from "@/features/shell/Booted";
import { services } from "@/data/services";
import { t } from "@/i18n";
import { RequestView } from "./view";

export const dynamicParams = false;

export function generateStaticParams() {
  return services.map((x) => ({ servico: x.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ servico: string }> }) {
  const { servico } = await params;
  const x = services.find((item) => item.slug === servico);
  return { title: x ? x.name : t.services.title };
}

export default async function Page({ params }: { params: Promise<{ servico: string }> }) {
  const { servico } = await params;
  return <Suspense><Booted><RequestView servico={servico} /></Booted></Suspense>;
}
