"use client";

import { ChevronDown, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { EmptyState } from "@/design-system";
import { NamedIcon } from "@/features/shell/icons";
import { t } from "@/i18n";
import { normalise } from "@/lib/format";

const v = t.services;

type Item = { id: string; slug: string; name: string; description: string; decider: string; avgDays: number; icon: string; popular: boolean };

/** Catálogo filtrado enquanto se escreve; no telemóvel, categorias recolhíveis. */
export function ServiceCatalog({ categories }: { categories: { name: string; items: Item[] }[] }) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => categories.map((c) => ({ ...c, items: c.items.filter((i) => normalise(`${i.name} ${i.description} ${c.name}`).includes(normalise(q))) })).filter((c) => c.items.length), [categories, q]);
  return (
    <section aria-labelledby="catalogo" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="catalogo" className="text-section font-bold">{v.catalog}</h2>
        <label className="search-box w-full md:w-80">
          <span className="sr-only">{v.find}</span>
          <Search size={16} aria-hidden />
          <input type="search" placeholder={v.find} value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
      </div>
      <p className="sr-only" role="status">{filtered.reduce((a, c) => a + c.items.length, 0)}</p>
      {filtered.length === 0 && <EmptyState plain title={v.noMatch} />}
      {filtered.map((c) => (
        <details key={c.name} open className="group border-t border-line pt-3">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 text-block font-semibold text-ink md:pointer-events-none md:min-h-0">
            {c.name}
            <ChevronDown size={18} aria-hidden className="transition-transform group-open:rotate-180 md:hidden" />
          </summary>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {c.items.map((i) => (
              <li key={i.id}>
                <Link href={i.id === "sala" ? "/servicos/salas" : `/servicos/pedir/${i.slug}`} className="row-link flex h-full gap-3 rounded-[16px] border border-[var(--ds-border-card)] p-4 transition-colors hover:border-[var(--ds-content-brand)]">
                  <span className="mt-0.5 text-brand"><NamedIcon name={i.icon} size={24} /></span>
                  <span className="min-w-0">
                    <span className="row-title block font-semibold text-ink">{i.name}</span>
                    <span className="block text-label">{i.description}</span>
                    <span className="mt-2 block text-caption text-subtle">{v.decides}: {i.decider}</span>
                    <span className="block text-caption text-subtle">{v.avg(i.avgDays)}{i.popular ? ` · ${v.usedOften}` : ""}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </details>
      ))}
    </section>
  );
}
