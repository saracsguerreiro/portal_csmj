"use client";

import { ArrowUpRight, Images, Play } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button, Dialog, EmptyState, FilterBar, LinkTabs, LoadError, PageHeader } from "@/design-system";
import { BlockRetry } from "@/features/home/BlockRetry";
import { t } from "@/i18n";
import { listMedia } from "@/lib/api-comunicacao";
import { withParams } from "@/lib/params";
import { useSession } from "@/lib/client";
import { useQuery } from "@/lib/use-query";

const m = t.media;
const l = t.lists;
const BASE = "/comunicacao/multimedia";

type Item = { type: "album" | "video"; id: string; title: string; text: string; cover: string; date: string; sort: string; count?: number; duration?: string; href?: string; scope: string };

/** Larguras do mosaico numa grelha de 10 colunas: cada linha soma 10, como na referência. */
const SPANS = ["md:col-span-4", "md:col-span-3", "md:col-span-3", "md:col-span-3", "md:col-span-4", "md:col-span-3", "md:col-span-3", "md:col-span-3", "md:col-span-4"];
/** A última linha estica para não deixar buracos: dois cartões a meias, um sozinho a toda a largura. */
function spanFor(i: number, total: number) {
  const lastStart = total - (total % 3 || 3);
  const left = total - lastStart;
  if (i >= lastStart && left === 2) return "md:col-span-5";
  if (i >= lastStart && left === 1) return "md:col-span-10";
  return SPANS[i % SPANS.length];
}
/** Cartões com texto por baixo da imagem; os restantes têm o título sobre a fotografia. */
const WITH_TEXT = new Set([0, 4, 8]);

function TypeTag({ item }: { item: Item }) {
  return (
    <span className="absolute left-0 top-0 inline-flex items-center gap-1.5 bg-[var(--ds-color-brand-700)] px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-white">
      {item.type === "video" ? <Play size={12} aria-hidden /> : <Images size={12} aria-hidden />}
      {item.type === "video" ? m.typeVideo : m.typeAlbum}
    </span>
  );
}

function Card({ item, index, span, onPlay }: { item: Item; index: number; span: string; onPlay: (i: Item) => void }) {
  const withText = WITH_TEXT.has(index % SPANS.length);
  const meta = item.type === "video" ? `${item.duration} · ${item.date}` : `${m.photosCount(item.count ?? 0)} · ${item.date}`;
  const inner = withText ? (
    <span className="flex h-full flex-col bg-surface">
      <span className="relative block h-[55%] flex-none overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.cover} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
        <TypeTag item={item} />
        {item.type === "video" && <span className="absolute inset-0 grid place-items-center"><span className="grid h-14 w-14 place-items-center bg-[var(--ds-color-brand-700)] text-white transition-transform group-hover:scale-110"><Play size={24} aria-hidden /></span></span>}
      </span>
      <span className="flex flex-1 flex-col gap-2 border border-t-0 border-line p-5">
        <span className="text-[17px] font-semibold leading-6 text-ink group-hover:underline">{item.title}</span>
        {item.text && <span className="line-clamp-2 text-ui text-subtle">{item.text}</span>}
        <span className="mt-auto flex items-center justify-between gap-3 text-caption text-subtle"><span>{meta}</span><span>{item.scope}</span></span>
      </span>
    </span>
  ) : (
    <span className="relative block h-full overflow-hidden bg-surface-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={item.cover} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
      <span aria-hidden className="absolute inset-0 bg-black/45 transition-colors duration-300 group-hover:bg-black/60" />
      <TypeTag item={item} />
      <span className="sq-arrow absolute right-0 top-0" aria-hidden><ArrowUpRight size={22} strokeWidth={1.75} /></span>
      <span className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center text-white">
        {item.type === "video" && <span className="grid h-14 w-14 place-items-center border-2 border-white transition-transform group-hover:scale-110"><Play size={24} aria-hidden /></span>}
        <span className="max-w-[22ch] text-[22px] font-semibold leading-7 tracking-[-0.01em]">{item.title}</span>
        <span className="text-label font-semibold uppercase tracking-[0.06em] text-white/85">{meta}</span>
      </span>
    </span>
  );
  return (
    <li className={`h-[300px] ${span}`}>
      {item.href ? (
        <Link href={item.href} className="group block h-full" aria-label={`${m.typeAlbum}: ${item.title}, ${meta}`}>{inner}</Link>
      ) : (
        <button type="button" className="group block h-full w-full text-left" onClick={() => onPlay(item)} aria-label={`${m.play(item.title)}, ${meta}`}>{inner}</button>
      )}
    </li>
  );
}

/** Multimédia: álbuns de fotografias e vídeos num só mosaico, distinguidos pela etiqueta de tipo. */
export function MediaView() {
  const s = useSession();
  const f = useQuery();
  const [video, setVideo] = useState<Item | null>(null);
  let data;
  try { data = listMedia(s, f); } catch { data = null; }
  const keep = { etiqueta: f.etiqueta, ano: f.ano };
  const items: Item[] = data ? [
    ...(data.tab !== "videos" ? data.albums.map((a) => ({ type: "album" as const, id: a.id, title: a.title, text: a.description, cover: a.photo?.src ?? a.cover, date: a.dateLabel, sort: a.happenedAt, count: a.count, href: `${BASE}/${a.slug}`, scope: a.scopeLabel })) : []),
    ...(data.tab !== "fotografias" ? data.videos.map((v) => ({ type: "video" as const, id: v.id, title: v.title, text: "", cover: v.photo?.src ?? v.poster, date: v.dateLabel, sort: v.publishedAt, duration: v.duration, scope: v.scopeLabel })) : []),
  ].sort((a, b) => b.sort.localeCompare(a.sort)) : [];

  return (
    <div className="wrap flex flex-col gap-6 py-6 md:py-8">
      <PageHeader crumbs={[{ label: t.news.crumb, href: "/comunicacao/noticias" }, { label: m.title }]} title={m.title} description={m.lead} />
      {!data ? <LoadError what={m.what}><BlockRetry /></LoadError> : (
        <>
          <LinkTabs label={m.title} tabs={[
            { href: withParams(BASE, keep, {}), label: m.tabs.all, current: data.tab === "todos", count: data.albums.length + data.videos.length },
            { href: withParams(BASE, keep, { separador: "fotografias" }), label: m.tabs.photos, current: data.tab === "fotografias", count: data.albums.length },
            { href: withParams(BASE, keep, { separador: "videos" }), label: m.tabs.videos, current: data.tab === "videos", count: data.videos.length },
          ]} />
          <FilterBar chips={{ key: "etiqueta", options: [{ value: "", label: l.allM }, ...data.tags.map((x) => ({ value: x, label: x }))] }} filters={[{ key: "ano", label: l.year, options: data.years.map((y) => ({ value: y, label: y })) }]} />
          {items.length === 0 ? <EmptyState title={data.tab === "videos" ? m.noVideos : m.noResults} /> : (
            <ul className="grid grid-cols-1 gap-3 md:grid-cols-10" aria-label={m.title}>
              {items.map((item, i) => <Card key={item.id} item={item} index={i} span={spanFor(i, items.length)} onPlay={setVideo} />)}
            </ul>
          )}
        </>
      )}
      <Dialog open={!!video} onClose={() => setVideo(null)} title={video?.title ?? ""} actions={<Button variant="sec" onClick={() => setVideo(null)}>{t.common.close}</Button>}>
        {video && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={video.cover} alt="" className="mb-3 aspect-video w-full object-cover" />
            <p>{t.news.videoNote}</p>
          </>
        )}
      </Dialog>
    </div>
  );
}
