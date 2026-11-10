import { Suspense } from "react";
import { documents } from "@/data/documents";
import { Booted } from "@/features/shell/Booted";
import { DocPageView } from "./view";

export const dynamicParams = false;

export function generateStaticParams() {
  return documents.map((d) => ({ id: d.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return { title: documents.find((d) => d.id === id)?.title };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <Suspense><Booted><DocPageView id={id} /></Booted></Suspense>;
}
