import { Suspense } from "react";
import { Booted } from "@/features/shell/Booted";
import { albums } from "@/data/media";
import { t } from "@/i18n";
import { AlbumView } from "./view";

export const dynamicParams = false;

export function generateStaticParams() {
  return albums.map((x) => ({ album: x.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ album: string }> }) {
  const { album } = await params;
  const x = albums.find((item) => item.slug === album);
  return { title: x ? x.title : t.media.title };
}

export default async function Page({ params }: { params: Promise<{ album: string }> }) {
  const { album } = await params;
  return <Suspense><Booted><AlbumView album={album} /></Booted></Suspense>;
}
