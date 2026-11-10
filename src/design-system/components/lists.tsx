"use client";

import { ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import type { ReactNode } from "react";
import { t } from "@/i18n";
import { Button, IconButton } from "./Button";
import { SelectField } from "./forms";
import { Sheet } from "./overlay";

const l = t.lists;

export type FilterDef = { key: string; label: string; options: { value: string; label: string }[] };
export type ChipFilter = { key: string; options: { value: string; label: string } [] };
export type ExtraFilter = { key: string; label: string };

/** Filtros numa só linha, aplicados de imediato e reflectidos no URL. */
export function FilterBar({ filters = [], chips, search, leading, extras = [] }: { filters?: FilterDef[]; chips?: ChipFilter; search?: { key: string; label: string }; leading?: ReactNode; extras?: ExtraFilter[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, start] = useTransition();
  const [sheet, setSheet] = useState(false);
  const [text, setText] = useState(search ? (params.get(search.key) ?? "") : "");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const update = (changes: Record<string, string | null>) => {
    const next = new URLSearchParams(params.toString());
    next.delete("pagina");
    Object.entries(changes).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    const q = next.toString();
    start(() => router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false }));
  };

  useEffect(() => () => clearTimeout(timer.current), []);

  const onText = (v: string) => {
    setText(v);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => search && update({ [search.key]: v.trim() || null }), 280);
  };

  const active = [
    ...filters.filter((f) => params.get(f.key)).map((f) => ({ key: f.key, label: `${f.label}: ${f.options.find((o) => o.value === params.get(f.key))?.label ?? ""}` })),
    ...extras.filter((e) => params.get(e.key)),
  ];
  const clearAll = () => { setText(""); update(Object.fromEntries([...filters.map((f) => [f.key, null]), ...extras.map((e) => [e.key, null]), ...(search ? [[search.key, null]] : []), ...(chips ? [[chips.key, null]] : [])])); };

  const searchBox = search && (
    <label className="search-box !h-[var(--ds-btn-sm)] md:w-56 max-md:!h-12">
      <span className="sr-only">{search.label}</span>
      <Search size={16} className="text-subtle" aria-hidden />
      <input type="search" placeholder={search.label} value={text} onChange={(e) => onText(e.target.value)} />
    </label>
  );

  const chipRow = chips && (
    <ul className="flex min-w-0 gap-1.5 overflow-x-auto p-0.5">
      {chips.options.map((o) => {
        const on = (params.get(chips.key) ?? "") === o.value;
        return <li key={o.value || "todas"} className="flex-none"><button type="button" className="chip" aria-pressed={on} onClick={() => update({ [chips.key]: o.value || null })}>{o.label}</button></li>;
      })}
    </ul>
  );

  const selects = filters.map((f) => (
    <span key={f.key} className="relative inline-block flex-none">
      <select aria-label={f.label} className="filter-select" data-on={!!params.get(f.key)} value={params.get(f.key) ?? ""} onChange={(e) => update({ [f.key]: e.target.value || null })}>
        <option value="">{f.label}</option>
        {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <ChevronDown size={14} aria-hidden className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-subtle" />
    </span>
  ));

  return (
    <div className="flex flex-col gap-2" aria-busy={pending}>
      <div className="hidden items-center gap-2 md:flex">
        {leading}
        <div className="min-w-0 flex-1">{chipRow}</div>
        {selects}
        {searchBox}
      </div>
      <div className="flex flex-col gap-2 md:hidden">
        {searchBox}
        {chipRow}
        {filters.length > 0 && (
          <div>
            <Button size="sm" icon={<SlidersHorizontal size={16} aria-hidden />} onClick={() => setSheet(true)}>{l.filter}{active.length > 0 ? ` (${active.length})` : ""}</Button>
            <Sheet open={sheet} onClose={() => setSheet(false)} title={l.filters} footer={<Button variant="pri" block onClick={() => setSheet(false)}>{l.apply}</Button>}>
              <div className="flex flex-col gap-4">
                {filters.map((f) => <SelectField key={f.key} label={f.label} value={params.get(f.key) ?? ""} onChange={(e) => update({ [f.key]: e.target.value || null })} options={[{ value: "", label: l.allM }, ...f.options]} />)}
              </div>
            </Sheet>
          </div>
        )}
      </div>
      {active.length > 0 && (
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label={l.active}>
          {active.map((a) => (
            <span key={a.key} className="fchip">
              {a.label}
              <IconButton size="sm" label={l.remove(a.label)} onClick={() => update({ [a.key]: null })}><X size={14} aria-hidden /></IconButton>
            </span>
          ))}
          <button type="button" className="link text-label" onClick={clearAll}>{l.clear}</button>
        </div>
      )}
    </div>
  );
}

/** Separadores reflectidos no URL. */
export function LinkTabs({ label, tabs }: { label: string; tabs: { href: string; label: string; current: boolean; count?: number }[] }) {
  return (
    <nav aria-label={label}>
      <div className="tabs">
        {tabs.map((x) => (
          <Link key={x.href} href={x.href} scroll={false} className="tb" aria-current={x.current ? "page" : undefined}>
            {x.label}
            {x.count !== undefined && <span className="text-caption font-medium text-subtle">{x.count}</span>}
          </Link>
        ))}
      </div>
    </nav>
  );
}

/** Ficha lateral cujo estado vive no URL: pode ser partilhada e fecha com Escape. */
export function UrlSheet({ param, title, status, children, footer }: { param: string; title: ReactNode; status?: ReactNode; children: ReactNode; footer?: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const close = () => {
    const next = new URLSearchParams(params.toString());
    next.delete(param);
    const q = next.toString();
    router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
  };
  return <Sheet open onClose={close} title={title} status={status} footer={footer}>{children}</Sheet>;
}
