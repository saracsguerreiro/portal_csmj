"use client";

import { Bot, Download, Copy, Eye, Globe2, LayoutGrid, List, Lock, Pencil, RotateCcw, Trash2, Users, XCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import type { ContentStatus } from "@/data/types";
import { units } from "@/data/units";
import { ActionMenu, Button, ButtonLink, Checkbox, ConfirmDialog, Dialog, EmptyState, FilterBar, LinkTabs, LoadError, Pagination, ScopeTag, useToast } from "@/design-system";
import { BlockRetry } from "@/features/home/BlockRetry";
import { postAdmin } from "@/features/shell/client-api";
import { t } from "@/i18n";
import { listContent, type ContentRow, type Kind } from "@/lib/api-painel";
import { useSession } from "@/lib/client";
import { withParams } from "@/lib/params";
import { useQuery } from "@/lib/use-query";
import { AdminPage, ContentStatusBadge, downloadCsv, editHref, newHref, publicHref } from "./parts";

const A = t.admin;
const L = A.list;
const VIEW_KEY = "csmj_painel_vista";

function RowCheck({ on, onChange, label }: { on: boolean; onChange: () => void; label: string }) {
  return <Checkbox checked={on} onChange={onChange} aria-label={label}><span className="sr-only">{label}</span></Checkbox>;
}

/** PD-Lista partilhada por notícias, eventos e avisos (A02). */
export function ContentList({ kind }: { kind: Kind }) {
  const s = useSession();
  const f = useQuery();
  const router = useRouter();
  const toast = useToast();
  const [sel, setSel] = useState<string[]>([]);
  const [view, setView] = useState<"rows" | "grid">("rows");
  const [tagsOpen, setTagsOpen] = useState(false);
  const [tagPick, setTagPick] = useState<string[]>([]);
  const [closeId, setCloseId] = useState<string | null>(null);
  useEffect(() => { try { if (kind === "noticias" && localStorage.getItem(VIEW_KEY) === "grid") setView("grid"); } catch { /* sem armazenamento */ } }, [kind]);
  useEffect(() => setSel([]), [f.separador, f.estado, f.q, f.pagina]);

  let data: ReturnType<typeof listContent> | null;
  try { data = listContent(s, kind, f); } catch { data = null; }
  const base = `/painel/${kind}`;
  const trash = data?.tab === "lixeira";
  const ids = data?.items.map((r) => r.id) ?? [];
  const allOn = ids.length > 0 && ids.every((id) => sel.includes(id));

  const run = async (fn: () => Promise<unknown>, msg: string, undo?: () => Promise<unknown>) => {
    try { await fn(); setSel([]); toast.show({ message: msg, onUndo: undo ? () => void undo() : undefined }); }
    catch (e) { toast.show({ message: (e as Error).message }); }
  };
  const setStatus = (list: string[], status: ContentStatus, msg: string) => {
    const prev = data?.items.filter((r) => list.includes(r.id)).map((r) => [r.id, r.status] as const) ?? [];
    return run(() => postAdmin({ action: "content.status", kind, ids: list, status }), msg,
      () => Promise.all(prev.map(([id, st]) => postAdmin({ action: "content.status", kind, ids: [id], status: st }))));
  };

  const scopeOpts = units.filter((u) => u.type === "national" || u.type === "relation" || u.type === "general").map((u) => ({ value: u.id, label: u.short }));
  const filters = data ? [
    { key: "estado", label: L.status, options: (["rascunho", "espera", "agendado", "publicado", "despublicado"] as const).map((v) => ({ value: v, label: A.status[v] })) },
    { key: "quem", label: L.scope, options: scopeOpts },
    { key: "periodo", label: L.period, options: [{ value: "d7", label: "Últimos 7 dias" }, { value: "d30", label: "Últimos 30 dias" }, { value: "y2026", label: "2026" }, { value: "y2025", label: "2025" }] },
    ...(kind !== "avisos" && data.tags.length ? [{ key: "etiqueta", label: L.tag, options: data.tags.map((x) => ({ value: x, label: x })) }] : []),
    { key: "idioma", label: L.lang, options: [{ value: "PT", label: "Português" }, { value: "EN", label: "Inglês" }] },
    { key: "autor", label: L.author, options: data.authors },
  ] : [];

  const tabs = (["todas", "minhas", "lixeira"] as const).map((k) => ({ href: withParams(base, {}, { separador: k === "todas" ? undefined : k }), label: L.tabs[k], current: data?.tab === k, count: data?.counts[k] }));
  const extraHead = kind === "eventos" ? "Inscritos" : kind === "avisos" ? "Confirmação" : null;

  const exportCsv = () => {
    if (!data) return;
    const head = ["Título", "Estado", "Para quem", "Idiomas", "Autor", "Data", ...(extraHead ? [extraHead] : [])];
    const extra = (r: ContentRow) => (kind === "eventos" ? [L.signups(r.signups ?? 0, r.capacity)] : kind === "avisos" ? [r.confirmPct != null ? `${r.confirmPct} %` : "—"] : []);
    downloadCsv(`${kind}.csv`, [head, ...data.items.map((r) => [r.title, A.status[r.status], r.scopeLabel, r.langs.join(" "), r.author, r.dateLabel, ...extra(r)])]);
    toast.show({ message: L.exported });
  };

  const rowMenu = (r: ContentRow) => {
    const items: { label: string; onSelect: () => void; icon?: ReactNode }[] = [];
    if (trash) {
      if (r.editable) items.push({ label: L.row.restore, icon: <RotateCcw size={16} aria-hidden />, onSelect: () => void setStatus([r.id], "rascunho", L.done.restore) });
      return items;
    }
    items.push({ label: L.row.open, icon: <Pencil size={16} aria-hidden />, onSelect: () => router.push(editHref(kind, r.id)) });
    if (r.status === "publicado") items.push({ label: L.row.view, icon: <Eye size={16} aria-hidden />, onSelect: () => router.push(publicHref(kind, r.slug)) });
    if (kind === "eventos") items.push({ label: L.row.attendees, icon: <Users size={16} aria-hidden />, onSelect: () => router.push(`${editHref(kind, r.id)}&separador=inscritos`) });
    if (kind === "avisos" && r.confirmPct != null) items.push({ label: L.row.missing, icon: <Users size={16} aria-hidden />, onSelect: () => router.push(`${editHref(kind, r.id)}&separador=confirmacoes`) });
    items.push({ label: L.row.duplicate, icon: <Copy size={16} aria-hidden />, onSelect: () => void run(() => postAdmin({ action: "content.duplicate", kind, id: r.id }), L.done.duplicate) });
    if (kind === "noticias" && !r.langs.includes("EN")) items.push({ label: L.row.translate, icon: <Globe2 size={16} aria-hidden />, onSelect: () => void run(() => postAdmin({ action: "content.translate", kind, id: r.id }), L.done.translate) });
    if (kind === "avisos" && r.hasConfirmations) { if (data?.canPublish && !r.closed) items.push({ label: L.row.close, icon: <XCircle size={16} aria-hidden />, onSelect: () => setCloseId(r.id) }); }
    else if (r.editable) items.push({ label: L.row.trash, icon: <Trash2 size={16} aria-hidden />, onSelect: () => void setStatus([r.id], "lixeira", L.done.trash(1)) });
    return items;
  };

  const toggle = (id: string) => setSel((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  const extraCell = (r: ContentRow) => kind === "eventos" ? <span className="font-mono">{L.signups(r.signups ?? 0, r.capacity)}</span>
    : r.confirmPct != null ? <span className="font-mono">{L.confirmCol(r.confirmPct)}</span> : <span className="text-subtle">—</span>;

  const titleCell = (r: ContentRow) => (
    <div className="flex min-w-0 flex-col gap-0.5">
      <span className="flex items-center gap-1.5">
        {r.lockedBy && <Lock size={14} aria-hidden className="flex-none text-subtle" />}
        {trash ? <span className="font-semibold">{r.title}</span> : <Link href={editHref(kind, r.id)} className="font-semibold hover:underline">{r.number ? `${r.number} · ` : ""}{r.title}</Link>}
      </span>
      {(r.lockedBy || r.aiAssisted || r.closed) && (
        <span className="flex flex-wrap gap-x-3 text-label text-subtle">
          {r.lockedBy && <span>{L.locked(r.lockedBy)}</span>}
          {r.aiAssisted && <span className="inline-flex items-center gap-1"><Bot size={12} aria-hidden />{A.editor.aiMarked}</span>}
          {r.closed && <span>Encerrado</span>}
        </span>
      )}
    </div>
  );

  const create = data?.canCreate && !trash ? <ButtonLink variant="pri" href={newHref(kind)}>{L.create[kind]}</ButtonLink> : null;

  return (
    <AdminPage title={L.titles[kind]} lead={data ? L.count[kind](data.total) : undefined} crumbs={[{ label: A.items.trabalho, href: "/painel" }, { label: L.titles[kind] }]}
      actions={<><Button onClick={exportCsv} icon={<Download size={18} aria-hidden />}>{L.export}</Button>{create}</>}>
      {!data ? <LoadError what={L.what}><BlockRetry /></LoadError> : (
        <>
          <LinkTabs label={L.titles[kind]} tabs={tabs} />
          {!trash && (
            <FilterBar search={{ key: "q", label: L.search }} filters={filters}
              leading={kind === "noticias" ? (
                <div role="group" aria-label={L.view} className="flex flex-none gap-0.5 rounded-full border border-line p-0.5">
                  {(["rows", "grid"] as const).map((v) => (
                    <button key={v} type="button" className="icbtn !h-8 !w-8" aria-pressed={view === v} aria-label={v === "rows" ? L.rows : L.grid} title={v === "rows" ? L.rows : L.grid}
                      onClick={() => { setView(v); try { localStorage.setItem(VIEW_KEY, v); } catch { /* sem armazenamento */ } }}>
                      {v === "rows" ? <List size={16} aria-hidden /> : <LayoutGrid size={16} aria-hidden />}
                    </button>
                  ))}
                </div>
              ) : undefined} />
          )}
          {data.items.length === 0 ? <EmptyState title={trash ? L.emptyTrash : L.empty}>{create}</EmptyState> : view === "grid" && !trash ? (
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
              {data.items.map((r) => (
                <li key={r.id} className="card relative flex flex-col gap-3 overflow-hidden !p-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {r.cover && <img src={r.cover} alt="" className="aspect-[16/9] w-full object-cover" />}
                  <div className="absolute left-3 top-3 rounded-full bg-surface px-1.5 py-1"><RowCheck on={sel.includes(r.id)} onChange={() => toggle(r.id)} label={L.select(r.title)} /></div>
                  <div className="absolute right-2 top-2 rounded-full bg-surface"><ActionMenu label={L.more(r.title)} items={rowMenu(r)} /></div>
                  <div className="flex flex-1 flex-col gap-2 px-4 pb-4">
                    {titleCell(r)}
                    <div className="mt-auto flex flex-wrap items-center gap-2"><ContentStatusBadge status={r.status} /><span className="font-mono text-label text-subtle">{r.dateLabel}</span></div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <>
              <div className="card hidden !p-0 md:block">
                <table className="w-full text-ui">
                  <caption className="sr-only">{L.titles[kind]} · {L.sortBy}</caption>
                  <thead>
                    <tr className="border-b border-line text-left text-label text-subtle">
                      <th scope="col" className="w-12 py-3 pl-5"><RowCheck on={allOn} onChange={() => setSel(allOn ? [] : ids)} label={L.selectAll} /></th>
                      <th scope="col" className="py-3 pr-4 font-semibold">Título</th>
                      <th scope="col" className="py-3 pr-4 font-semibold">{L.status}</th>
                      <th scope="col" className="hidden py-3 pr-4 font-semibold lg:table-cell">{L.scope}</th>
                      <th scope="col" className="hidden py-3 pr-4 font-semibold xl:table-cell">{L.lang}</th>
                      <th scope="col" className="hidden py-3 pr-4 font-semibold lg:table-cell">{L.author}</th>
                      <th scope="col" className="py-3 pr-4 font-semibold" aria-sort="descending">{L.period}</th>
                      {extraHead && <th scope="col" className="py-3 pr-4 font-semibold">{extraHead}</th>}
                      <th scope="col" className="w-14 py-3 pr-3"><span className="sr-only">Acções</span></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--ds-border-subtle)]">
                    {data.items.map((r) => (
                      <tr key={r.id} className={`align-middle hover:bg-hover ${sel.includes(r.id) ? "bg-[var(--ds-color-brand-50)]" : ""}`}>
                        <td className="py-3 pl-5"><RowCheck on={sel.includes(r.id)} onChange={() => toggle(r.id)} label={L.select(r.title)} /></td>
                        <td className="max-w-[440px] py-3 pr-4">{titleCell(r)}</td>
                        <td className="py-3 pr-4"><ContentStatusBadge status={r.status} /></td>
                        <td className="hidden py-3 pr-4 lg:table-cell"><ScopeTag kind={r.scopeKind}>{r.scopeLabel}</ScopeTag></td>
                        <td className="hidden whitespace-nowrap py-3 pr-4 font-mono xl:table-cell">{r.langs.join(" · ")}</td>
                        <td className="hidden py-3 pr-4 lg:table-cell">{r.author}</td>
                        <td className="whitespace-nowrap py-3 pr-4 font-mono">{r.dateLabel}</td>
                        {extraHead && <td className="py-3 pr-4">{extraCell(r)}</td>}
                        <td className="py-3 pr-3"><ActionMenu label={L.more(r.title)} items={rowMenu(r)} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <ul className="flex flex-col gap-3 md:hidden">
                {data.items.map((r) => (
                  <li key={r.id} className={`card flex gap-3 !p-4 ${sel.includes(r.id) ? "!border-[var(--ds-border-brand)]" : ""}`}>
                    <div className="pt-0.5"><RowCheck on={sel.includes(r.id)} onChange={() => toggle(r.id)} label={L.select(r.title)} /></div>
                    <div className="flex min-w-0 flex-1 flex-col gap-2">
                      {titleCell(r)}
                      <div className="flex flex-wrap items-center gap-2"><ContentStatusBadge status={r.status} /><span className="font-mono text-label text-subtle">{r.dateLabel}</span></div>
                      <span className="text-label text-subtle">{r.scopeLabel} · {r.author}{extraHead ? <> · {extraHead} {extraCell(r)}</> : null}</span>
                    </div>
                    <ActionMenu label={L.more(r.title)} items={rowMenu(r)} />
                  </li>
                ))}
              </ul>
            </>
          )}
          {data.pages > 1 && <Pagination page={data.page} pages={data.pages} href={(p) => withParams(base, f, { pagina: p > 1 ? String(p) : undefined })} />}
        </>
      )}

      {sel.length > 0 && data && (
        <div role="region" aria-label={L.selected(sel.length)} className="sticky bottom-[calc(16px+env(safe-area-inset-bottom))] z-20 mx-auto flex w-full max-w-[860px] flex-wrap items-center gap-2 rounded-[20px] border border-line-strong bg-surface p-2 pl-4 shadow-[var(--ds-shadow-3)]">
          <span className="mr-auto text-ui font-semibold" aria-live="polite">{L.selected(sel.length)}</span>
          {trash ? <Button size="sm" onClick={() => void setStatus(sel, "rascunho", L.done.restore)}>{L.bulk.restore}</Button> : (
            <>
              {data.canPublish && <Button size="sm" onClick={() => void setStatus(sel, "publicado", L.done.publish(sel.length))}>{L.bulk.publish}</Button>}
              {data.canPublish && <Button size="sm" onClick={() => void setStatus(sel, "despublicado", L.done.unpublish(sel.length))}>{L.bulk.unpublish}</Button>}
              {kind !== "avisos" && <Button size="sm" onClick={() => { setTagPick([]); setTagsOpen(true); }}>{L.bulk.tags}</Button>}
              <Button size="sm" variant="dng" onClick={() => void setStatus(sel, "lixeira", L.done.trash(sel.length))}>{L.bulk.trash}</Button>
            </>
          )}
          <Button size="sm" variant="gh" onClick={() => setSel([])}>{t.common.cancel}</Button>
        </div>
      )}

      <Dialog open={tagsOpen} onClose={() => setTagsOpen(false)} title={L.tagsTitle}
        actions={<><Button onClick={() => setTagsOpen(false)}>{t.common.cancel}</Button><Button variant="pri" onClick={() => { setTagsOpen(false); void run(() => postAdmin({ action: "content.tags", kind, ids: sel, tags: tagPick }), L.done.tags); }}>{L.tagsVerb}</Button></>}>
        <fieldset className="flex flex-col gap-2"><legend className="sr-only">{A.editor.tags}</legend>
          {(data?.tags ?? []).map((tg) => <Checkbox key={tg} checked={tagPick.includes(tg)} onChange={() => setTagPick((p) => (p.includes(tg) ? p.filter((x) => x !== tg) : [...p, tg]))}>{tg}</Checkbox>)}
        </fieldset>
      </Dialog>
      <ConfirmDialog open={!!closeId} onClose={() => setCloseId(null)} title={A.editor.closeTitle} verb={A.editor.closeVerb} danger
        onConfirm={() => { const id = closeId!; setCloseId(null); void run(() => postAdmin({ action: "notice.close", id }), L.done.closed); }}>
        {A.editor.closeBody}
      </ConfirmDialog>
    </AdminPage>
  );
}
