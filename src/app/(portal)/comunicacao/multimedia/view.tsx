"use client";

import Link from "next/link";
import { EmptyState, FilterBar, LinkTabs, LoadError, PageHeader, ScopeTag } from "@/design-system";
import { VideoCard } from "@/features/comunicacao/media";
import { BlockRetry } from "@/features/home/BlockRetry";
import { t } from "@/i18n";
import { listMedia } from "@/lib/api-comunicacao";
import { withParams } from "@/lib/params";
import { useSession } from "@/lib/client";
import { useQuery } from "@/lib/use-query";

const m = t.media;
const l = t.lists;


export function MediaView() {
  const s = useSession();
  const f = useQuery();
  let data;
  try { data = listMedia(s, f); } catch { data = null; }
  return (
    <div className="wrap flex flex-col gap-6 py-6 md:py-8">
      <PageHeader crumbs={[{ label: t.news.crumb, href: "/comunicacao/noticias" }, { label: m.title }]} title={m.title} description={m.lead} />
      {!data ? <LoadError what={m.what}><BlockRetry /></LoadError> : (
        <>
          <LinkTabs label={m.title} tabs={[{ href: withParams("/comunicacao/multimedia", { etiqueta: f.etiqueta, ano: f.ano }, {}), label: m.tabs.photos, current: data.tab === "fotografias" }, { href: withParams("/comunicacao/multimedia", { etiqueta: f.etiqueta, ano: f.ano }, { separador: "videos" }), label: m.tabs.videos, current: data.tab === "videos" }]} />
          <FilterBar chips={{ key: "etiqueta", options: [{ value: "", label: l.allM }, ...data.tags.map((x) => ({ value: x, label: x }))] }} filters={[{ key: "ano", label: l.year, options: data.years.map((y) => ({ value: y, label: y })) }]} />
          {data.tab === "fotografias" ? (
            data.albums.length === 0 ? <EmptyState title={m.noResults} /> : (
              <ul className="grid gap-x-6 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">
                {data.albums.map((a) => (
                  <li key={a.id}>
                    <Link href={`/comunicacao/multimedia/${a.slug}`} className="row-link flex flex-col gap-2">
                      <img src={a.cover} alt={a.coverAlt} loading="lazy" className="cover-img aspect-[4/3] w-full rounded-[16px] object-cover" />
                      <span className="row-title text-block font-semibold text-ink">{a.title}</span>
                      <span className="flex flex-wrap items-center gap-x-3 text-caption text-subtle"><span>{a.dateLabel}</span><span>{m.photosCount(a.total)}</span><ScopeTag kind={a.scopeKind}>{a.scopeLabel}</ScopeTag></span>
                    </Link>
                  </li>
                ))}
              </ul>
            )
          ) : data.videos.length === 0 ? <EmptyState title={m.noVideos} /> : (
            <ul className="grid gap-x-6 gap-y-8 sm:grid-cols-2 xl:grid-cols-4">{data.videos.map((v) => <li key={v.id}><VideoCard title={v.title} poster={v.poster} duration={v.duration} date={v.dateLabel} /></li>)}</ul>
          )}
        </>
      )}
    </div>
  );
}
