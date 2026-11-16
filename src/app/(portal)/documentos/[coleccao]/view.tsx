"use client";

import { ChevronDown, Folder, FolderOpen } from "lucide-react";
import Link from "next/link";
import { notFound, usePathname, useRouter } from "next/navigation";
import { Breadcrumbs, EmptyState, FilterBar, LoadError } from "@/design-system";
import { DocRowItem } from "@/features/documentos/parts";
import { DocSheet } from "@/features/documentos/DocSheet";
import { BlockRetry } from "@/features/home/BlockRetry";
import { t } from "@/i18n";
import { collectionView, importantDocs, otherCollections } from "@/lib/api-documentos";
import { DocShortcuts, OtherCollections } from "@/features/documentos/Shortcuts";
import { scopeOptions } from "@/lib/api-comunicacao";
import { useSession } from "@/lib/client";
import { withParams } from "@/lib/params";
import { useQuery } from "@/lib/use-query";

const d = t.docs;

export function CollectionView({ coleccao }: { coleccao: string }) {
  const s = useSession();
  const f = useQuery();
  const router = useRouter();
  const pathname = usePathname();
  let data;
  try { data = collectionView(s, coleccao, f); } catch { data = undefined; }
  if (data === null) notFound();
  const base = `/documentos/${coleccao}`;
  return (
    <div className="grid grid-cols-1 gap-[var(--gap)] xl:grid-cols-12">
      <header className="panel flex flex-col gap-5 p-6 md:px-10 md:py-8 xl:col-span-12">
        <div className="flex flex-col gap-2">
          <Breadcrumbs items={[{ label: d.title, href: "/documentos" }, { label: data?.collection.name ?? "" }]} label={t.shell.crumbs} />
          <h1 className="text-page font-bold tracking-[-0.02em]">{data?.collection.name ?? d.title}</h1>
          {data?.collection.description && <p className="max-w-[70ch] text-ui text-subtle">{data.collection.description}</p>}
        </div>
        {data && (
          <FilterBar
            search={{ key: "q", label: d.inCollection(data.collection.name) }}
            filters={[{ key: "tipo", label: d.type, options: data.types.map((x) => ({ value: x, label: x })) }, { key: "ano", label: d.year, options: data.years.map((x) => ({ value: x, label: x })) }, { key: "quem", label: t.lists.forWhom, options: scopeOptions(s) }, { key: "ordem", label: d.order, options: Object.entries(d.orders).filter(([k]) => k !== "recentes").map(([value, label]) => ({ value, label })) }]}
          />
        )}
      </header>
      {!data ? <div className="panel p-6 xl:col-span-12"><LoadError what={d.what}><BlockRetry /></LoadError></div> : (
        <>
          <section className="panel min-w-0 p-6 md:p-10 xl:col-span-8" aria-labelledby="pastas-t">
            <div className="grid gap-8 md:grid-cols-[220px_minmax(0,1fr)]">
              <nav aria-labelledby="pastas-t" className="hidden md:block">
                <h2 id="pastas-t" className="panel-title mb-4 !text-[18px]">{d.folders}</h2>
                <ul className="flex flex-col gap-1">
                  <li><Link href={withParams(base, { ...f, pasta: undefined, documento: undefined }, {})} scroll={false} aria-current={!f.pasta ? "page" : undefined} className="folder-link">{!f.pasta ? <FolderOpen size={18} aria-hidden /> : <Folder size={18} aria-hidden />}<span className="flex-1">{d.allFolders}</span><span className="text-caption">{data.folders.reduce((n, fo) => n + fo.count, 0)}</span></Link></li>
                  {data.folders.map((fo) => <li key={fo.id}><Link href={withParams(base, { ...f, documento: undefined }, { pasta: fo.id })} scroll={false} aria-current={f.pasta === fo.id ? "page" : undefined} className="folder-link">{f.pasta === fo.id ? <FolderOpen size={18} aria-hidden /> : <Folder size={18} aria-hidden />}<span className="flex-1">{fo.name}</span><span className="text-caption">{fo.count}</span></Link></li>)}
                </ul>
              </nav>
              <div className="min-w-0">
                <span className="relative mb-3 block md:hidden">
                  <select aria-label={d.folders} className="inp" value={f.pasta ?? ""} onChange={(e) => router.replace(withParams(pathname, { ...f, documento: undefined }, { pasta: e.target.value || undefined }), { scroll: false })}>
                    <option value="">{d.allFolders}</option>
                    {data.folders.map((fo) => <option key={fo.id} value={fo.id}>{fo.name}</option>)}
                  </select>
                  <ChevronDown size={16} className="inp-chevron" aria-hidden />
                </span>
                <h2 className="mb-2 text-label font-semibold uppercase tracking-[0.06em] text-subtle" role="status">{(data.folders.find((fo) => fo.id === f.pasta)?.name ?? d.allFolders)} · {d.count(data.items.length)}</h2>
                {data.items.length === 0 ? <EmptyState plain title={d.empty} /> : <ul className="divide-y divide-[var(--ds-border-subtle)]">{data.items.map((x) => <DocRowItem key={x.id} doc={x} />)}</ul>}
              </div>
            </div>
          </section>
          <aside className="flex min-w-0 flex-col gap-[var(--gap)] xl:col-span-4" aria-label={d.shortcuts}>
            <DocShortcuts items={importantDocs(s, data.collection.id)} lead={d.shortcutsLead(data.collection.name)} />
            <OtherCollections items={otherCollections(coleccao)} />
          </aside>
        </>
      )}
      <DocSheet />
    </div>
  );
}
