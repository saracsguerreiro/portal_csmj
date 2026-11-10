"use client";

import { ChevronRight, Maximize2, Minus, Plus, Printer, Search, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Avatar, Button, IconButton, Segmented } from "@/design-system";
import { t } from "@/i18n";
import type { OrgNode } from "@/lib/api-pessoas";
import { normalise } from "@/lib/format";
import { usePersonHref } from "./parts";

const o = t.org;
const W = 200;
const GAP_X = 16;
const GAP_Y = 64;

type Placed = { node: OrgNode; x: number; y: number; h: number; depth: number; parent?: string };

function layout(root: OrgNode, people: boolean) {
  const height = (n: OrgNode) => (people ? 112 + Math.min(n.members.length, 6) * 20 + (n.members.length > 6 ? 20 : 0) : 108);
  const depthH: number[] = [];
  const walk = (n: OrgNode, d: number) => { depthH[d] = Math.max(depthH[d] ?? 0, height(n)); n.children.forEach((c) => walk(c, d + 1)); };
  walk(root, 0);
  const yAt = (d: number) => depthH.slice(0, d).reduce((a, h) => a + h + GAP_Y, 0);
  const placed: Placed[] = [];
  let cursor = 0;
  const place = (n: OrgNode, d: number, parent?: string): number => {
    let x: number;
    if (!n.children.length) { x = cursor; cursor += W + GAP_X; }
    else { const xs = n.children.map((c) => place(c, d + 1, n.id)); x = (xs[0] + xs[xs.length - 1]) / 2; }
    placed.push({ node: n, x, y: yAt(d), h: height(n), depth: d, parent });
    return x;
  };
  place(root, 0);
  const width = cursor - GAP_X;
  const total = yAt(depthH.length - 1) + depthH[depthH.length - 1];
  return { placed, width, height: total };
}

function findPath(root: OrgNode, pred: (n: OrgNode) => boolean): string[] | null {
  if (pred(root)) return [root.id];
  for (const c of root.children) { const p = findPath(c, pred); if (p) return [root.id, ...p]; }
  return null;
}

/** Organograma como tela navegável: arrastar, ampliar, ajustar e procurar (a pesquisa centra e realça o caminho). */
export function OrgChart({ root, focusSlug }: { root: OrgNode; focusSlug?: string }) {
  const [mode, setMode] = useState<"unidades" | "pessoas">("unidades");
  const { placed, width, height } = useMemo(() => layout(root, mode === "pessoas"), [root, mode]);
  const box = useRef<HTMLDivElement>(null);
  const [view, setView] = useState({ x: 0, y: 0, k: 1 });
  const [selected, setSelected] = useState<string | null>(null);
  const [path, setPath] = useState<string[]>([]);
  const [q, setQ] = useState("");
  const [miss, setMiss] = useState(false);
  const drag = useRef<{ x: number; y: number; vx: number; vy: number } | null>(null);
  const personHref = usePersonHref();

  const fit = useCallback(() => {
    const el = box.current;
    if (!el) return;
    const k = Math.max(0.7, Math.min(1, (el.clientWidth - 48) / width, (el.clientHeight - 48) / height));
    setView({ k, x: Math.max(24, (el.clientWidth - width * k) / 2), y: 24 });
  }, [width, height]);

  const centerOn = useCallback((id: string) => {
    const el = box.current;
    const p = placed.find((x) => x.node.id === id);
    if (!el || !p) return;
    const k = Math.max(view.k, 0.85);
    setView({ k, x: el.clientWidth / 2 - (p.x + W / 2) * k, y: el.clientHeight / 2 - (p.y + p.h / 2) * k });
  }, [placed, view.k]);

  useEffect(() => { fit(); }, [fit]);

  useEffect(() => {
    if (!focusSlug) return;
    const pth = findPath(root, (n) => n.head?.slug === focusSlug || n.members.some((m) => m.slug === focusSlug));
    if (pth) { setPath(pth); setSelected(pth[pth.length - 1]); requestAnimationFrame(() => centerOn(pth[pth.length - 1])); }
  }, [focusSlug]); // eslint-disable-line react-hooks/exhaustive-deps

  /* Roda do rato: amplia à volta do ponteiro */
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const r = el.getBoundingClientRect();
      const px = e.clientX - r.left;
      const py = e.clientY - r.top;
      setView((v) => { const k = Math.min(1.6, Math.max(0.35, v.k * (e.deltaY < 0 ? 1.1 : 0.9))); return { k, x: px - ((px - v.x) / v.k) * k, y: py - ((py - v.y) / v.k) * k }; });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const zoom = (f: number) => setView((v) => { const el = box.current!; const cx = el.clientWidth / 2; const cy = el.clientHeight / 2; const k = Math.min(1.6, Math.max(0.35, v.k * f)); return { k, x: cx - ((cx - v.x) / v.k) * k, y: cy - ((cy - v.y) / v.k) * k }; });

  const search = (e: React.FormEvent) => {
    e.preventDefault();
    const term = normalise(q.trim());
    if (!term) return;
    const pth = findPath(root, (n) => normalise(n.name).includes(term) || normalise(n.short).includes(term) || normalise(n.head?.name ?? "").includes(term) || n.members.some((m) => normalise(m.name).includes(term)));
    setMiss(!pth);
    if (pth) { setPath(pth); setSelected(pth[pth.length - 1]); centerOn(pth[pth.length - 1]); }
  };

  const onKey = (e: React.KeyboardEvent) => {
    if ((e.target as HTMLElement).tagName === "INPUT") return;
    const step = 60;
    if (e.key === "ArrowLeft") setView((v) => ({ ...v, x: v.x + step }));
    else if (e.key === "ArrowRight") setView((v) => ({ ...v, x: v.x - step }));
    else if (e.key === "ArrowUp") setView((v) => ({ ...v, y: v.y + step }));
    else if (e.key === "ArrowDown") setView((v) => ({ ...v, y: v.y - step }));
    else if (e.key === "+" || e.key === "=") zoom(1.15);
    else if (e.key === "-") zoom(0.87);
    else if (e.key === "0") fit();
    else return;
    e.preventDefault();
  };

  const sel = placed.find((p) => p.node.id === selected)?.node;
  const focusName = normalise(q.trim());

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Segmented legend={o.views} value={mode} onChange={(v) => setMode(v)} options={[{ value: "unidades", label: o.units }, { value: "pessoas", label: o.people }]} />
        <form role="search" onSubmit={search} className="flex flex-1 items-center gap-2 md:max-w-md">
          <label className="search-box flex-1"><span className="sr-only">{o.search}</span><Search size={16} aria-hidden /><input type="search" placeholder={o.search} value={q} onChange={(e) => { setQ(e.target.value); setMiss(false); }} /></label>
          <Button size="sm" type="submit">{t.searchPage.submit}</Button>
        </form>
        <span className="ml-auto flex items-center gap-1">
          <IconButton label={o.zoomOut} onClick={() => zoom(0.87)}><Minus size={18} aria-hidden /></IconButton>
          <span className="w-12 text-center text-label tabular-nums" aria-live="polite">{Math.round(view.k * 100)} %</span>
          <IconButton label={o.zoomIn} onClick={() => zoom(1.15)}><Plus size={18} aria-hidden /></IconButton>
          <Button size="sm" variant="gh" icon={<Maximize2 size={16} aria-hidden />} onClick={fit}>{o.fit}</Button>
        </span>
      </div>
      {miss && <p className="text-body" role="status">{o.noMatch}</p>}
      <div className="relative">
        <div
          ref={box} tabIndex={0} role="region" aria-label={`${o.canvas}. ${o.keys}`} onKeyDown={onKey}
          className="relative h-[560px] cursor-grab touch-none overflow-hidden rounded-[24px] border border-[var(--ds-border-card)] bg-surface-2 active:cursor-grabbing"
          onPointerDown={(e) => { if ((e.target as HTMLElement).closest("button,a")) return; drag.current = { x: e.clientX, y: e.clientY, vx: view.x, vy: view.y }; (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); }}
          onPointerMove={(e) => { const d = drag.current; if (d) setView((v) => ({ ...v, x: d.vx + e.clientX - d.x, y: d.vy + e.clientY - d.y })); }}
          onPointerUp={() => { drag.current = null; }}
        >
          <div className="absolute left-0 top-0 origin-top-left" style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.k})`, width, height }}>
            <svg width={width} height={height} className="absolute inset-0" aria-hidden>
              {placed.filter((p) => p.parent).map((p) => {
                const parent = placed.find((x) => x.node.id === p.parent)!;
                const x1 = parent.x + W / 2; const y1 = parent.y + parent.h; const x2 = p.x + W / 2; const y2 = p.y; const mid = y1 + GAP_Y / 2;
                const on = path.includes(p.node.id) && path.includes(parent.node.id);
                return <path key={p.node.id} d={`M${x1} ${y1}V${mid}H${x2}V${y2}`} fill="none" stroke={on ? "var(--ds-content-brand)" : "var(--ds-border-default)"} strokeWidth={on ? 2.5 : 1.5} />;
              })}
            </svg>
            {placed.map((p) => {
              const n = p.node;
              const onPath = path.includes(n.id);
              const isSel = selected === n.id;
              return (
                <div key={n.id} className="absolute" style={{ left: p.x, top: p.y, width: W, height: p.h }}>
                  <button
                    type="button" aria-pressed={isSel} onClick={() => { setSelected(n.id); setPath(findPath(root, (x) => x.id === n.id) ?? []); }}
                    aria-label={`${n.name}${n.head ? `, ${o.head.toLowerCase()} ${n.head.name}` : ""}, ${o.members(n.members.length + (n.head ? 1 : 0))}`}
                    className="flex h-full w-full flex-col gap-1.5 overflow-hidden rounded-[16px] border bg-surface p-3 text-left transition-colors hover:border-[var(--ds-content-brand)] [&>*]:shrink-0"
                    style={{ borderColor: isSel || onPath ? "var(--ds-content-brand)" : "var(--ds-border-card)", boxShadow: isSel ? "0 0 0 2px var(--ds-content-brand)" : undefined }}
                  >
                    <span className="truncate text-label font-semibold text-ink">{n.short}</span>
                    {n.head && <span className="flex items-center gap-2"><Avatar initials={n.head.initials} size="sm" /><span className="min-w-0"><span className={`block truncate text-caption ${focusName && normalise(n.head.name).includes(focusName) ? "font-bold text-brand" : "text-ink"}`}>{n.head.name}</span><span className="block truncate text-caption text-subtle">{n.head.role}</span></span></span>}
                    {mode === "pessoas" ? (
                      <ul className="mt-1 flex flex-col gap-0.5">
                        {n.members.slice(0, 6).map((m) => <li key={m.slug} className={`truncate text-caption ${focusName && normalise(m.name).includes(focusName) ? "font-bold text-brand" : "text-copy"}`}>{m.name}</li>)}
                        {n.members.length > 6 && <li className="text-caption text-subtle">+{n.members.length - 6}</li>}
                      </ul>
                    ) : <span className="mt-auto text-caption text-subtle">{o.members(n.members.length + (n.head ? 1 : 0))}</span>}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
        {sel && (
        <aside aria-label={sel.name} className="card absolute right-4 top-4 flex max-h-[528px] w-80 flex-col gap-3 overflow-auto" style={{ boxShadow: "var(--ds-shadow-lg)" }}>
          {(

            <>
              <div className="flex items-start justify-between gap-2"><h2 className="text-block font-semibold">{sel.name}</h2><IconButton size="sm" label={t.common.close} onClick={() => { setSelected(null); setPath([]); }}><X size={16} aria-hidden /></IconButton></div>
              <nav aria-label={t.shell.crumbs}><ol className="crumbs">{path.map((id, i) => { const n = placed.find((p) => p.node.id === id)?.node; return <li key={id} className="flex items-center gap-1">{i > 0 && <ChevronRight size={14} aria-hidden />}<button type="button" className="hover:underline" onClick={() => { setSelected(id); setPath(path.slice(0, i + 1)); centerOn(id); }}>{n?.short}</button></li>; })}</ol></nav>
              {sel.head && <div><p className="mb-1 text-caption font-semibold text-subtle">{o.head}</p><Link href={personHref(sel.head.slug)} scroll={false} className="row-link flex items-center gap-2"><Avatar initials={sel.head.initials} size="sm" /><span><span className="row-title block font-semibold text-ink">{sel.head.name}</span><span className="text-caption text-subtle">{sel.head.role}</span></span></Link></div>}
              {sel.members.length > 0 && <div><p className="mb-1 text-caption font-semibold text-subtle">{o.panelPeople}</p><ul className="flex flex-col gap-2">{sel.members.map((m) => <li key={m.slug}><Link href={personHref(m.slug)} scroll={false} className="row-link flex items-center gap-2"><Avatar initials={m.initials} size="sm" /><span><span className="row-title block text-label font-medium text-ink">{m.name}</span><span className="text-caption text-subtle">{m.role}</span></span></Link></li>)}</ul></div>}
              <Button size="sm" variant="gh" icon={<Printer size={16} aria-hidden />} onClick={() => window.print()}>{o.print}</Button>
            </>
          )}
        </aside>
        )}
      </div>
    </div>
  );
}

/** No telemóvel: lista hierárquica recolhível. */
export function OrgList({ node, depth = 0 }: { node: OrgNode; depth?: number }) {
  const personHref = usePersonHref();
  return (
    <details open={depth < 1} className={depth ? "border-l border-line pl-3" : ""}>
      <summary className="flex min-h-11 cursor-pointer items-center gap-2 font-semibold text-ink">{node.short}<span className="text-caption font-normal text-subtle">{o.members(node.members.length + (node.head ? 1 : 0))}</span></summary>
      <div className="flex flex-col gap-2 pb-2">
        {[...(node.head ? [node.head] : []), ...node.members].map((m) => <Link key={m.slug} href={personHref(m.slug)} scroll={false} className="row-link flex min-h-11 items-center gap-2"><Avatar initials={m.initials} size="sm" /><span><span className="row-title block text-label font-medium text-ink">{m.name}</span><span className="text-caption text-subtle">{m.role}</span></span></Link>)}
        {node.children.map((c) => <OrgList key={c.id} node={c} depth={depth + 1} />)}
      </div>
    </details>
  );
}
