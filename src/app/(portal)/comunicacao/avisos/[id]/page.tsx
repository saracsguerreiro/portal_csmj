import { Suspense } from "react";
import { Booted } from "@/features/shell/Booted";
import { notices } from "@/data/notices";
import { t } from "@/i18n";
import { NoticeView } from "./view";

export const dynamicParams = false;

export function generateStaticParams() {
  return notices.map((x) => ({ id: x.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const x = notices.find((item) => item.id === id);
  return { title: x ? x.title : t.noticesPage.title };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <Suspense><Booted><NoticeView id={id} /></Booted></Suspense>;
}
