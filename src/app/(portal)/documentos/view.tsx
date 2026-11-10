"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { EmptyState, LoadError, PageHeader } from "@/design-system";
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
    <div className="wrap flex flex-col gap-8 py-6 md:py-8">
      <PageHeader title={d.title} description={d.lead} />
      <form role="search" onSubmit={(e) => { e.preventDefault(); router.replace(q.trim() ? `${pathname}?q=${encodeURIComponent(q.trim())}` : pathname, { scroll: false }); }}>
        <div className="today-box">
          <Search size={20} className="text-subtle" aria-hidden />
          <label htmlFor="doc-q" className="sr-only">{d.search}</label>
          <input id="doc-q" type="search" placeholder={d.search} value={q} onChange={(e) => setQ(e.target.value)} aria-describedby="doc-q-hint" />
          <button type="submit" className="btn btn-pri btn-sm">{t.searchPage.submit}</button>
        </div>
        <p id="doc-q-hint" className="field-hint mt-1 pl-5">{d.searchHint}</p>
      </form>
      {!data ? <LoadError what={d.what}><BlockRetry /></LoadError> : data.results ? (
        <section aria-labelledby="resultados" className="flex flex-col gap-2">
          <h2 id="resultados" className="text-block font-semibold" role="status">{d.results(data.results.length, f.q ?? "")}</h2>
          {data.results.length === 0 ? <EmptyState title={d.noResults} /> : <ul className="card !py-1 divide-y divide-[var(--ds-border-subtle)]">{data.results.map((x) => <DocRowItem key={x.id} doc={x} showCollection />)}</ul>}
        </section>
      ) : (
        <>
          <section aria-labelledby="coleccoes">
            <h2 id="coleccoes" className="mb-3 text-section font-bold">{d.collections}</h2>
            <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {data.collections.map((c) => (
                <li key={c.id}>
                  <Link href={`/documentos/${c.slug}`} className="row-link flex h-full gap-3 rounded-[16px] border border-[var(--ds-border-card)] p-4 transition-colors hover:border-[var(--ds-content-brand)]">
                    <span className="mt-0.5 text-brand"><NamedIcon name={c.icon} size={24} /></span>
                    <span><span className="row-title block font-semibold text-ink">{c.name}</span><span className="block text-label">{c.description}</span><span className="mt-2 block text-caption text-subtle">{d.count(c.count)}</span></span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
          <div className="grid gap-8 lg:grid-cols-12">
            <section aria-labelledby="recentes" className="lg:col-span-8">
              <h2 id="recentes" className="mb-1 text-block font-semibold">{d.recent}</h2>
              <ul className="divide-y divide-[var(--ds-border-default)]">{data.recent.map((x) => <DocRowItem key={x.id} doc={x} showCollection />)}</ul>
            </section>
            <div className="flex flex-col gap-8 lg:col-span-4">
              {data.favorites.length > 0 && (
                <section aria-labelledby="favoritos" className="card">
                  <div className="mb-1 flex items-baseline justify-between"><h2 id="favoritos" className="text-block font-semibold">{d.favorites}</h2><Link href="/documentos/favoritos" className="link-quiet">{d.seeAllFav}</Link></div>
                  <ul className="divide-y divide-[var(--ds-border-subtle)]">{data.favorites.map((x) => <DocRowItem key={x.id} doc={x} showCollection />)}</ul>
                </section>
              )}
              <section aria-labelledby="consultados">
                <h2 id="consultados" className="mb-1 text-block font-semibold">{d.popular}</h2>
                <ol className="divide-y divide-[var(--ds-border-default)]">{data.popular.map((x) => <DocRowItem key={x.id} doc={x} showCollection />)}</ol>
              </section>
            </div>
          </div>
        </>
      )}
      <DocSheet />
    </div>
  );
}
