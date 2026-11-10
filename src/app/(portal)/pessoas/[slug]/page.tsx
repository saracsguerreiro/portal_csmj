import { Suspense } from "react";
import { people } from "@/data/people";
import { Booted } from "@/features/shell/Booted";
import { PersonView } from "./view";

export const dynamicParams = false;

export function generateStaticParams() {
  return people.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return { title: people.find((p) => p.slug === slug)?.name };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <Suspense><Booted><PersonView slug={slug} /></Booted></Suspense>;
}
