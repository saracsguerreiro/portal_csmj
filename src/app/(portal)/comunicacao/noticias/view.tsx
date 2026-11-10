"use client";

import Link from "next/link";
import { EmptyState, FilterBar, LoadError, PageHeader } from "@/design-system";
import { NewsMosaic } from "@/features/comunicacao/NewsMosaic";
import { BlockRetry } from "@/features/home/BlockRetry";
import { t } from "@/i18n";
import { listNews, scopeOptions } from "@/lib/api-comunicacao";
import { useSession } from "@/lib/client";
import { useQuery } from "@/lib/use-query";

const n = t.news;
const l = t.lists;


export function NewsView() {
  const s = useSession();
  const f = useQuery();
  let data;
  try { data = listNews(s, f); } catch { data = null; }
  const periods = Object.entries(l.periods).map(([value, label]) => ({ value, label }));
  return (
    <div className="wrap flex flex-col gap-6 py-6 md:py-8">
      <PageHeader crumbs={[{ label: n.crumb, href: "/comunicacao/noticias" }, { label: n.title }]} title={n.title} description={n.lead} />
      {data && (
        <FilterBar
          chips={{ key: "etiqueta", options: [{ value: "", label: l.all }, ...data.tags.map((x) => ({ value: x, label: x }))] }}
          filters={[{ key: "quem", label: l.forWhom, options: scopeOptions(s) }, { key: "periodo", label: l.period, options: periods }]}
          extras={[{ key: "desde", label: l.sinceVisit }]}
          search={{ key: "q", label: n.search }}
        />
      )}
      {!data ? <LoadError what={n.what}><BlockRetry /></LoadError> : (
        <>
          <p className="sr-only" role="status">{n.count(data.total)}</p>
          {data.total === 0 && <EmptyState title={n.noResults}><Link className="link" href="/comunicacao/noticias">{l.clear}</Link></EmptyState>}
          {data.total > 0 && <NewsMosaic items={data.all} />}
        </>
      )}
    </div>
  );
}
