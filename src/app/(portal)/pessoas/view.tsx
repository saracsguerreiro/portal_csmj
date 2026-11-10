"use client";

import { LayoutGrid, List } from "lucide-react";
import { useEffect, useState } from "react";
import { EmptyState, FilterBar, LoadError, PageHeader, Segmented } from "@/design-system";
import { PersonCard, PersonRow } from "@/features/pessoas/parts";
import { PersonSheet } from "@/features/pessoas/PersonSheet";
import { BlockRetry } from "@/features/home/BlockRetry";
import { t } from "@/i18n";
import { contacts } from "@/lib/api-pessoas";
import { useSession } from "@/lib/client";
import { useQuery } from "@/lib/use-query";

const pp = t.peoplePage;
const VIEW_KEY = "csmj_vista_contactos";

export function ContactsView() {
  const s = useSession();
  const f = useQuery();
  const [view, setView] = useState<"grelha" | "lista">("grelha");
  useEffect(() => { try { const v = localStorage.getItem(VIEW_KEY); if (v === "lista" || v === "grelha") setView(v); } catch { /* bloqueado */ } }, []);
  const change = (v: "grelha" | "lista") => { setView(v); try { localStorage.setItem(VIEW_KEY, v); } catch { /* bloqueado */ } };
  let data;
  try { data = contacts(s, f); } catch { data = null; }
  const letters = data ? Array.from(new Set(data.items.map((p) => p.name[0].toUpperCase()))) : [];
  return (
    <div className="wrap flex flex-col gap-6 py-6 md:py-8">
      <PageHeader crumbs={[{ label: t.shell.bottom.home, href: "/" }, { label: pp.title }]} title={pp.title} description={pp.lead} />
      {!data ? <LoadError what={pp.what}><BlockRetry /></LoadError> : (
        <>
          <FilterBar
            search={{ key: "q", label: pp.search }}
            leading={<Segmented legend={pp.view} value={view} onChange={change} options={[{ value: "grelha", label: pp.grid, icon: <LayoutGrid size={14} aria-hidden /> }, { value: "lista", label: pp.list, icon: <List size={14} aria-hidden /> }]} />}
            filters={[{ key: "unidade", label: pp.unit, options: data.units }, { key: "cargo", label: pp.role, options: data.roles.map((x) => ({ value: x, label: x })) }, { key: "sector", label: pp.sector, options: data.sectors.map((x) => ({ value: x, label: x })) }, { key: "disponibilidade", label: pp.availability, options: [{ value: "disponivel", label: pp.available }, { value: "ausente", label: pp.awayFilter }] }]}
          />
          <p className="text-label text-subtle" role="status">{pp.count(data.items.length)}</p>
          {data.items.length === 0 ? <EmptyState title={pp.empty} /> : view === "grelha" ? (
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{data.items.map((p) => <li key={p.id}><PersonCard p={p} /></li>)}</ul>
          ) : (
            <div className="flex gap-4">
              <div className="card min-w-0 flex-1 !py-1">
                {letters.map((l) => (
                  <section key={l} id={`letra-${l}`} aria-label={l} className="scroll-mt-28">
                    <h2 className="pt-3 text-label font-bold text-subtle">{l}</h2>
                    <ul className="divide-y divide-[var(--ds-border-subtle)]">{data.items.filter((p) => p.name[0].toUpperCase() === l).map((p) => <PersonRow key={p.id} p={p} />)}</ul>
                  </section>
                ))}
              </div>
              <nav aria-label={pp.index} className="sticky top-28 hidden h-fit flex-col md:flex">
                {letters.map((l) => <a key={l} href={`#letra-${l}`} className="grid h-7 w-7 place-items-center rounded-full text-label font-semibold text-brand hover:bg-toned">{l}</a>)}
              </nav>
            </div>
          )}
        </>
      )}
      <PersonSheet />
    </div>
  );
}
