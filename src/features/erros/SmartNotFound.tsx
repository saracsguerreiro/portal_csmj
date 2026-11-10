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
  const path = usePathname().replace(/\/$/, "");
  useVersion();
  const [, , kind, id] = path.split("/");
  if (path.startsWith("/comunicacao/noticias/") && !STATIC_NEWS_SLUGS.has(id)) return <Booted>{news.some((n) => n.slug === id) ? <ArticleView slug={id} /> : <ErrorPage kind="404" />}</Booted>;
  if (path.startsWith("/comunicacao/eventos/") && !STATIC_EVENT_SLUGS.has(id)) return <Booted>{events.some((e) => e.slug === id) ? <EventView slug={id} /> : <ErrorPage kind="404" />}</Booted>;
  if (path.startsWith("/comunicacao/avisos/") && !STATIC_NOTICE_IDS.has(id)) return <Booted>{notices.some((n) => n.id === id) ? <NoticeView id={id} /> : <ErrorPage kind="404" />}</Booted>;
  if (path.startsWith("/comunicacao/multimedia/")) { const a = albums.find((x) => x.slug === id); return <Booted>{a && !SEED_ALBUM_IDS.has(a.id) ? <AlbumView album={id} /> : <ErrorPage kind="404" />}</Booted>; }
  void kind;
  return <ErrorPage kind="404" />;
}
