import { Suspense } from "react";
import { collections } from "@/data/documents";
import { Booted } from "@/features/shell/Booted";
import { CollectionView } from "./view";

export const dynamicParams = false;

export function generateStaticParams() {
  return collections.map((c) => ({ coleccao: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ coleccao: string }> }) {
  const { coleccao } = await params;
  return { title: collections.find((c) => c.slug === coleccao)?.name };
}

export default async function Page({ params }: { params: Promise<{ coleccao: string }> }) {
  const { coleccao } = await params;
  return <Suspense><Booted><CollectionView coleccao={coleccao} /></Booted></Suspense>;
}
