"use client";

import { usePathname } from "next/navigation";
import { ArticleView } from "@/app/(portal)/comunicacao/noticias/[slug]/view";
import { EventView } from "@/app/(portal)/comunicacao/eventos/[slug]/view";
import { NoticeView } from "@/app/(portal)/comunicacao/avisos/[id]/view";
import { AlbumView } from "@/app/(portal)/comunicacao/multimedia/[album]/view";
import { albums, SEED_ALBUM_IDS } from "@/data/media";
import { STATIC_EVENT_SLUGS, STATIC_NEWS_SLUGS, STATIC_NOTICE_IDS } from "@/data/content";
import { events } from "@/data/events";
import { news } from "@/data/news";
import { notices } from "@/data/notices";
import { Booted } from "@/features/shell/Booted";
import { useVersion } from "@/lib/client";
import { ErrorPage } from "./ErrorPage";

/** Conteúdos publicados no painel depois da compilação não têm página estática:
 *  quando o endereço não existe, verifica se corresponde a um desses conteúdos e mostra-o. */
export function SmartNotFound() {
  return <Booted><Resolve /></Booted>;
}

/** A decisão só é tomada no browser: a página 404 estática e o primeiro desenho no cliente ficam iguais. */
function Resolve() {
  const path = usePathname().replace(/\/$/, "");
  useVersion();
  const id = path.split("/")[3];
  if (path.startsWith("/comunicacao/noticias/") && !STATIC_NEWS_SLUGS.has(id) && news.some((n) => n.slug === id)) return <ArticleView slug={id} />;
  if (path.startsWith("/comunicacao/eventos/") && !STATIC_EVENT_SLUGS.has(id) && events.some((e) => e.slug === id)) return <EventView slug={id} />;
  if (path.startsWith("/comunicacao/avisos/") && !STATIC_NOTICE_IDS.has(id) && notices.some((n) => n.id === id)) return <NoticeView id={id} />;
  const a = path.startsWith("/comunicacao/multimedia/") ? albums.find((x) => x.slug === id) : undefined;
  if (a && !SEED_ALBUM_IDS.has(a.id)) return <AlbumView album={id} />;
  return <ErrorPage kind="404" />;
}
