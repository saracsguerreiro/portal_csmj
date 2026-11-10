import { Suspense } from "react";
import { Booted } from "@/features/shell/Booted";
import { events } from "@/data/events";
import { t } from "@/i18n";
import { EventView } from "./view";

export const dynamicParams = false;

export function generateStaticParams() {
  return events.map((x) => ({ slug: x.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const x = events.find((item) => item.slug === slug);
  return { title: x ? x.title : t.events.title };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <Suspense><Booted><EventView slug={slug} /></Booted></Suspense>;
}
