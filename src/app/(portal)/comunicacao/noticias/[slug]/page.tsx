import { Suspense } from "react";
import { Booted } from "@/features/shell/Booted";
import { news } from "@/data/news";
import { t } from "@/i18n";
import { ArticleView } from "./view";

export const dynamicParams = false;

export function generateStaticParams() {
  return news.map((x) => ({ slug: x.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const x = news.find((item) => item.slug === slug);
  return { title: x ? x.title : t.news.title };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <Suspense><Booted><ArticleView slug={slug} /></Booted></Suspense>;
}
