"use client";

import { ArrowUpRight, Search } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Breadcrumbs, EmptyState, LoadError } from "@/design-system";
import { DocRowItem } from "@/features/documentos/parts";
import { DocSheet } from "@/features/documentos/DocSheet";
import { BlockRetry } from "@/features/home/BlockRetry";
import { NamedIcon } from "@/features/shell/icons";
import { t } from "@/i18n";
import { docsHome } from "@/lib/api-documentos";
import { useSession } from "@/lib/client";
import { useQuery } from "@/lib/use-query";

const d = t.docs;

export function DocumentsView() {
  const s = useSession();
  const f = useQuery();
  const router = useRouter();
  const pathname = usePathname();
  const [q, setQ] = useState(f.q ?? "");
  let data;
  try { data = docsHome(s, f.q); } catch { data = null; }
  return (
    <div className="grid grid-cols-1 gap-[var(--gap)] xl:grid-cols-12">
      <header className="panel flex flex-col gap-5 p-6 md:px-10 md:py-8 xl:col-span-12">
        <div className="flex flex-col gap-2">
          <Breadcrumbs items={[{ label: d.title }]} label={t.shell.crumbs} />
          <h1 className="text-page font-bold tracking-[-0.02em]">{d.title}</h1>
          <p className="max-w-[70ch] text-ui text-subtle">{d.lead}</p>
        </div>
        <form role="search" className="max-w-[860px]" onSubmit={(e) => { e.preventDefault(); router.replace(q.trim() ? `${pathname}?q=${encodeURIComponent(q.trim())}` : pathname, { scroll: false }); }}>
          <div className="today-box">
            <Search size={20} className="text-brand" aria-hidden />
            <label htmlFor="doc-q" className="sr-only">{d.search}</label>
            <input id="doc-q" type="search" placeholder={d.search} value={q} onChange={(e) => setQ(e.target.value)} aria-describedby="doc-q-hint" />
            <button type="submit" className="btn btn-pri btn-sm">{t.searchPage.submit}</button>
          </div>
          <p id="doc-q-hint" className="field-hint mt-1">{d.searchHint}</p>
        </form>
      </header>
      {!data ? <div className="panel p-6 xl:col-span-12"><LoadError what={d.what}><BlockRetry /></LoadError></div> : data.results ? (
        <section aria-labelledby="resultados" className="panel flex flex-col gap-3 p-6 md:p-10 xl:col-span-12">
          <h2 id="resultados" className="panel-title" role="status">{d.results(data.results.length, f.q ?? "")}</h2>
          {data.results.length === 0 ? <EmptyState plain title={d.noResults} /> : <ul className="divide-y divide-[var(--ds-border-subtle)]">{data.results.map((x) => <DocRowItem key={x.id} doc={x} showCollection />)}</ul>}
        </section>
      ) : (
        <>
          <section aria-labelledby="coleccoes" className="panel flex flex-col gap-5 p-6 md:p-10 xl:col-span-12">
            <h2 id="coleccoes" className="panel-title">{d.collections}</h2>
            <ul className="quick-grid grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
              {data.collections.map((c) => (
                <li key={c.id}>
                  <Link href={`/documentos/${c.slug}`} className="quick-tile group !aspect-auto !min-h-[176px] !p-6">
                    <span className="quick-fill" aria-hidden />
                    <span className="relative flex items-start justify-between">
                      <span className="quick-ico"><NamedIcon name={c.icon} size={30} /></span>
                      <span className="quick-arrow" aria-hidden><ArrowUpRight size={20} /></span>
                    </span>
                    <span className="relative flex flex-col gap-1">
                      <span className="quick-label !text-[18px] !leading-6">{c.name}</span>
                      <span className="text-[13px] leading-5 text-white/80">{c.description}</span>
                      <span className="mt-1 text-[12px] font-semibold uppercase tracking-[0.06em] text-[var(--ds-accent-gold)]">{d.count(c.count)}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
          <section aria-labelledby="recentes" className="panel flex min-w-0 flex-col gap-2 p-6 md:p-10 xl:col-span-8">
            <h2 id="recentes" className="panel-title mb-2">{d.recent}</h2>
            <ul className="divide-y divide-[var(--ds-border-default)]">{data.recent.map((x) => <DocRowItem key={x.id} doc={x} showCollection />)}</ul>
          </section>
          <div className="flex min-w-0 flex-col gap-[var(--gap)] xl:col-span-4">
            {data.favorites.length > 0 && (
              <section aria-labelledby="favoritos" className="panel flex flex-col gap-2 p-6 md:p-8">
                <div className="mb-2 flex items-start justify-between gap-3">
                  <h2 id="favoritos" className="panel-title">{d.favorites}</h2>
                  <Link href="/documentos/favoritos" className="sq-arrow" aria-label={d.seeAllFav} title={d.seeAllFav}><ArrowUpRight size={22} strokeWidth={1.75} aria-hidden /></Link>
                </div>
                <ul className="divide-y divide-[var(--ds-border-subtle)]">{data.favorites.map((x) => <DocRowItem key={x.id} doc={x} showCollection />)}</ul>
              </section>
            )}
            <section aria-labelledby="consultados" className="panel flex flex-col gap-2 p-6 md:p-8">
              <h2 id="consultados" className="panel-title mb-2">{d.popular}</h2>
              <ol className="divide-y divide-[var(--ds-border-default)]">{data.popular.map((x) => <DocRowItem key={x.id} doc={x} showCollection />)}</ol>
            </section>
          </div>
        </>
      )}
      <DocSheet />
    </div>
  );
}
