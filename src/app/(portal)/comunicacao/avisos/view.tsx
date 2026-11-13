"use client";

import { ArrowUpRight, FileText, Megaphone } from "lucide-react";
import Link from "next/link";
import { Breadcrumbs, EmptyState, FilterBar, LinkTabs, LoadError, StatusBadge } from "@/design-system";
import { NoticeDetail } from "@/features/comunicacao/NoticeDetail";
import { BlockRetry } from "@/features/home/BlockRetry";
import { t } from "@/i18n";
import { getNotice, listNotices, scopeOptions } from "@/lib/api-comunicacao";
import { withParams } from "@/lib/params";
import { useSession } from "@/lib/client";
import { useQuery } from "@/lib/use-query";

const a = t.noticesPage;
const l = t.lists;
const BASE = "/comunicacao/avisos";

/** Avisos e circulares em blocos: à esquerda o aviso escolhido (por omissão o primeiro da lista), à direita a lista com separadores. */
export function NoticesView() {
  const s = useSession();
  const f = useQuery();
  let data;
  try { data = listNotices(s, f); } catch { data = null; }
  const keep = { ano: f.ano, quem: f.quem, separador: f.separador };
  const tab = (id: string, label: string, count?: number) => ({ href: withParams(BASE, { ano: f.ano, quem: f.quem }, { separador: id === "por-confirmar" ? undefined : id }), label, current: (data?.tab ?? "por-confirmar") === id, count });
  const selectedId = f.aviso ?? data?.items[0]?.id ?? (data ? listNotices(s, { separador: "todos" }).items[0]?.id : undefined);
  const sel = selectedId ? getNotice(s, selectedId) : null;

  return (
    <div className="grid grid-cols-1 gap-[var(--gap)] xl:grid-cols-12">
      <header className="panel flex flex-wrap items-end justify-between gap-4 p-6 md:px-10 md:py-8 xl:col-span-12">
        <div className="flex flex-col gap-2">
          <Breadcrumbs items={[{ label: t.news.crumb, href: "/comunicacao/noticias" }, { label: a.title }]} label={t.shell.crumbs} />
          <h1 className="text-page font-bold tracking-[-0.02em]">{a.title}</h1>
          <p className="text-ui text-subtle">{a.lead}</p>
        </div>
        {data && data.pendingCount > 0 && <StatusBadge tone="warn">{a.pending(data.pendingCount)}</StatusBadge>}
      </header>
      {!data ? <div className="panel p-6 xl:col-span-12"><LoadError what={a.what}><BlockRetry /></LoadError></div> : (
        <>
          <article className="panel min-w-0 p-6 md:p-10 xl:col-span-7" aria-labelledby="aviso-titulo">
            {sel?.status === "ok" ? (
              <>
                <div className="mb-6 flex items-center justify-between gap-3">
                  <span className="text-label font-semibold uppercase tracking-[0.06em] text-subtle">{!f.aviso ? a.latest : ""}</span>
                  <Link href={`${BASE}/${sel.notice.id}`} className="sq-arrow" aria-label={a.openPage} title={a.openPage}><ArrowUpRight size={22} strokeWidth={1.75} aria-hidden /></Link>
                </div>
                <NoticeDetail n={sel.notice} headingLevel={2} inline />
              </>
            ) : <EmptyState title={a.emptyPending} />}
          </article>
          <section className="panel flex min-w-0 flex-col gap-4 p-6 md:p-8 xl:col-span-5" aria-labelledby="lista-avisos">
            <h2 id="lista-avisos" className="panel-title">{a.listTitle}</h2>
            <LinkTabs label={a.title} tabs={[tab("por-confirmar", a.tabs.pending, data.pendingCount), tab("todos", a.tabs.all), tab("circulares", a.tabs.circulars)]} />
            <FilterBar filters={[{ key: "ano", label: l.year, options: data.years.map((y) => ({ value: y, label: y })) }, { key: "quem", label: l.forWhom, options: scopeOptions(s) }]} />
            {data.items.length === 0 ? (
              <p className="py-6 text-ui text-subtle">{data.tab === "por-confirmar" && !f.ano && !f.quem ? a.emptyPending : a.noResults}</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {data.items.map((n) => {
                  const Icon = n.kind === "circular" ? FileText : Megaphone;
                  const on = n.id === selectedId;
                  return (
                    <li key={n.id}>
                      <Link href={withParams(BASE, keep, { aviso: n.id })} scroll={false} aria-current={on ? "true" : undefined} className={`notice-item group ${on ? "is-on" : ""}`}>
                        <Icon size={20} aria-hidden className="mt-0.5 flex-none text-brand" />
                        <span className="min-w-0 flex-1">
                          <span className="block font-semibold leading-5 text-ink group-hover:underline">{n.title}</span>
                          <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-caption text-subtle">{n.number && <span className="font-mono">{n.number}</span>}<span>{n.dateLabel}</span></span>
                          <span className="mt-2 block">{n.mandatory ? (n.confirmedAt ? <StatusBadge tone="ok">{a.confirmedOn(n.confirmedAt)}</StatusBadge> : <StatusBadge tone="warn">{a.toConfirm}</StatusBadge>) : <StatusBadge tone="neu">{a.info}</StatusBadge>}</span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}
