"use client";

import { ChevronDown, Folder, FolderOpen } from "lucide-react";
import Link from "next/link";
import { notFound, usePathname, useRouter } from "next/navigation";
import { EmptyState, FilterBar, LoadError, PageHeader } from "@/design-system";
import { DocRowItem } from "@/features/documentos/parts";
import { DocSheet } from "@/features/documentos/DocSheet";
import { BlockRetry } from "@/features/home/BlockRetry";
import { t } from "@/i18n";
import { collectionView } from "@/lib/api-documentos";
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
    <div className="wrap flex flex-col gap-6 py-6 md:py-8">
      <PageHeader crumbs={[{ label: d.title, href: "/documentos" }, { label: data?.collection.name ?? "" }]} title={data?.collection.name ?? d.title} description={data?.collection.description} />
      {!data ? <LoadError what={d.what}><BlockRetry /></LoadError> : (
        <>
          <FilterBar
            search={{ key: "q", label: d.inCollection(data.collection.name) }}
            filters={[{ key: "tipo", label: d.type, options: data.types.map((x) => ({ value: x, label: x })) }, { key: "ano", label: d.year, options: data.years.map((x) => ({ value: x, label: x })) }, { key: "quem", label: t.lists.forWhom, options: scopeOptions(s) }, { key: "ordem", label: d.order, options: Object.entries(d.orders).filter(([k]) => k !== "recentes").map(([value, label]) => ({ value, label })) }]}
          />
          <div className="grid gap-6 md:grid-cols-[220px_1fr]">
            <nav aria-label={d.folders} className="hidden md:block">
              <h2 className="mb-2 text-label font-semibold text-subtle">{d.folders}</h2>
              <ul className="flex flex-col gap-0.5">
                <li><Link href={withParams(base, { ...f, pasta: undefined, documento: undefined }, {})} scroll={false} aria-current={!f.pasta ? "page" : undefined} className="menu-item aria-[current=page]:bg-toned aria-[current=page]:font-semibold">{!f.pasta ? <FolderOpen size={18} aria-hidden /> : <Folder size={18} aria-hidden />}{d.allFolders}</Link></li>
                {data.folders.map((fo) => <li key={fo.id}><Link href={withParams(base, { ...f, documento: undefined }, { pasta: fo.id })} scroll={false} aria-current={f.pasta === fo.id ? "page" : undefined} className="menu-item aria-[current=page]:bg-toned aria-[current=page]:font-semibold">{f.pasta === fo.id ? <FolderOpen size={18} aria-hidden /> : <Folder size={18} aria-hidden />}<span className="flex-1">{fo.name}</span><span className="text-caption text-subtle">{fo.count}</span></Link></li>)}
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
              <p className="sr-only" role="status">{d.count(data.items.length)}</p>
              {data.items.length === 0 ? <EmptyState title={d.empty} /> : <ul className="card !py-1 divide-y divide-[var(--ds-border-subtle)]">{data.items.map((x) => <DocRowItem key={x.id} doc={x} />)}</ul>}
            </div>
          </div>
        </>
      )}
      <DocSheet />
    </div>
  );
}
