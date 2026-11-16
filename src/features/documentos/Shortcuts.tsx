"use client";

import { ArrowUpRight, FileSpreadsheet, FileText } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { NamedIcon } from "@/features/shell/icons";
import { t } from "@/i18n";
import type { importantDocs, otherCollections } from "@/lib/api-documentos";

const d = t.docs;

/** Atalhos rápidos: os documentos mais importantes em quadrados vermelhos; abrem a ficha lateral. */
export function DocShortcuts({ items, lead }: { items: ReturnType<typeof importantDocs>; lead?: string }) {
  const pathname = usePathname();
  const params = useSearchParams();
  const hrefFor = (id: string) => { const n = new URLSearchParams(params.toString()); n.set("documento", id); return `${pathname}?${n}`; };
  return (
    <section className="panel flex flex-col gap-4 p-6 md:p-8" aria-labelledby="atalhos-docs">
      <div>
        <h2 id="atalhos-docs" className="panel-title">{d.shortcuts}</h2>
        {lead && <p className="mt-1 text-ui text-subtle">{lead}</p>}
      </div>
      <ul className="quick-grid grid grid-cols-2">
        {items.map((x) => {
          const Icon = x.format === "XLSX" ? FileSpreadsheet : FileText;
          return (
            <li key={x.id}>
              <Link href={hrefFor(x.id)} scroll={false} className="quick-tile group !aspect-auto !min-h-[150px]">
                <span className="quick-fill" aria-hidden />
                <span className="relative flex items-start justify-between">
                  <span className="quick-ico"><Icon size={26} aria-hidden /></span>
                  <span className="quick-arrow" aria-hidden><ArrowUpRight size={20} /></span>
                </span>
                <span className="relative flex flex-col gap-1">
                  <span className="quick-label line-clamp-3">{x.title}</span>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--ds-accent-gold)]">{x.format} · {x.size}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function OtherCollections({ items, hideFavorites }: { items: ReturnType<typeof otherCollections>; hideFavorites?: boolean }) {
  return (
    <section className="panel flex flex-col gap-3 p-6 md:p-8" aria-labelledby="outras-col">
      <h2 id="outras-col" className="panel-title">{d.otherCollections}</h2>
      <ul className="flex flex-col divide-y divide-[var(--ds-border-default)]">
        {items.map((c) => (
          <li key={c.slug}>
            <Link href={`/documentos/${c.slug}`} className="group flex items-center gap-3 py-3">
              <span className="text-brand"><NamedIcon name={c.icon} size={20} /></span>
              <span className="flex-1 font-semibold text-ink group-hover:underline">{c.name}</span>
              <ArrowUpRight size={18} aria-hidden className="text-subtle" />
            </Link>
          </li>
        ))}
        {!hideFavorites && <li><Link href="/documentos/favoritos" className="group flex items-center gap-3 py-3"><span className="text-brand"><NamedIcon name="Star" size={20} /></span><span className="flex-1 font-semibold text-ink group-hover:underline">{d.favTitle}</span><ArrowUpRight size={18} aria-hidden className="text-subtle" /></Link></li>}
      </ul>
    </section>
  );
}
