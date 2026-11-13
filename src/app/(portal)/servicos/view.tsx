"use client";

import { ArrowUpRight, CalendarOff, DoorOpen, Plus, Stamp } from "lucide-react";
import Link from "next/link";
import { Breadcrumbs, EmptyState, LinkTabs, LoadError, UrlSheet } from "@/design-system";
import { RequestRow } from "@/features/servicos/parts";
import { RequestDetail, RequestHeaderStatus } from "@/features/servicos/RequestDetail";
import { ServiceCatalog } from "@/features/servicos/ServiceCatalog";
import { BlockRetry } from "@/features/home/BlockRetry";
import { t } from "@/i18n";
import { approvals, catalog, getRequest, myRequests } from "@/lib/api-servicos";
import { withParams } from "@/lib/params";
import { useSession } from "@/lib/client";
import { useQuery } from "@/lib/use-query";

const v = t.services;
const P = v.page;
const BASE = "/servicos";

function Stat({ n, label, href }: { n: number; label: string; href?: string }) {
  const inner = <><span className="text-[40px] font-semibold leading-none tabular-nums text-ink">{n}</span><span className="mt-2 block text-ui text-subtle">{label}</span></>;
  return href ? <Link href={href} scroll={false} className="block p-5 hover:bg-surface-2">{inner}</Link> : <div className="p-5">{inner}</div>;
}

/** Pedidos: uma só página em blocos — os meus pedidos, números, aprovações e o catálogo para um novo pedido. */
export function ServicesView() {
  const s = useSession();
  const f = useQuery();
  let mine, appr, all;
  try { mine = myRequests(s, f.separador); all = myRequests(s, "em-curso"); appr = s.profile.approver ? approvals(s) : null; } catch { mine = null; }
  const open = f.pedido ? getRequest(s, f.pedido) : null;
  const returned = all?.items.filter((r) => r.status === "devolvido").length ?? 0;
  const tabs = (["em-curso", "concluidos", "rascunhos"] as const).map((k) => ({ href: withParams(BASE, {}, { separador: k === "em-curso" ? undefined : k }), label: v.tabs[k], current: mine?.tab === k, count: mine?.counts[k] }));

  return (
    <div className="grid grid-cols-1 gap-[var(--gap)] xl:grid-cols-12">
      <header className="panel flex flex-wrap items-end justify-between gap-6 p-6 md:px-10 md:py-8 xl:col-span-12">
        <div className="flex flex-col gap-2">
          <Breadcrumbs items={[{ label: v.title, href: BASE }, { label: P.title }]} label={t.shell.crumbs} />
          <h1 className="text-page font-bold tracking-[-0.02em]">{P.title}</h1>
          <p className="max-w-[70ch] text-ui text-subtle">{v.lead}</p>
        </div>
        <a href="#novo-pedido" className="new-request" onClick={() => setTimeout(() => document.querySelector<HTMLInputElement>("#novo-pedido input")?.focus(), 350)}>
          <Plus size={24} aria-hidden />{P.newRequest}
        </a>
      </header>

      {!mine ? <div className="panel p-6 xl:col-span-12"><LoadError what={v.what}><BlockRetry /></LoadError></div> : (
        <>
          <section aria-labelledby="meus" className="panel flex min-w-0 flex-col gap-4 p-6 md:p-10 xl:col-span-8">
            <h2 id="meus" className="panel-title">{v.myRequests}</h2>
            <LinkTabs label={v.myRequests} tabs={tabs} />
            {mine.items.length === 0 ? (
              <EmptyState plain title={mine.counts["em-curso"] + mine.counts.concluidos + mine.counts.rascunhos === 0 ? v.noRequests : v.emptyTab[mine.tab]}><a className="link" href="#novo-pedido">{P.newRequest}</a></EmptyState>
            ) : (
              <ul className="divide-y divide-[var(--ds-border-subtle)]">
                {mine.items.map((r) => <RequestRow key={r.id} r={r} href={`/servicos/meus-pedidos/pedido?id=${r.id}`} sheetHref={withParams(BASE, { separador: f.separador }, { pedido: r.id })} />)}
              </ul>
            )}
          </section>

          <aside className="flex min-w-0 flex-col gap-[var(--gap)] xl:col-span-4" aria-label={P.summary}>
            <section className="panel" aria-labelledby="resumo">
              <h2 id="resumo" className="panel-title px-6 pt-6 md:px-8 md:pt-8">{P.summary}</h2>
              <div className="mt-2 grid grid-cols-3 divide-x divide-[var(--ds-border-default)] border-t border-line">
                <Stat n={mine.counts["em-curso"]} label={v.tabs["em-curso"]} href={BASE} />
                <Stat n={returned} label={P.toFix} href={BASE} />
                <Stat n={mine.counts.concluidos} label={v.tabs.concluidos} href={withParams(BASE, {}, { separador: "concluidos" })} />
              </div>
            </section>
            {appr && (
              <section className="panel flex flex-col gap-4 p-6 md:p-8" aria-labelledby="aprov">
                <div className="flex items-start justify-between gap-3">
                  <h2 id="aprov" className="panel-title flex items-center gap-2">{v.approvalsWaiting}{appr.counts.waiting > 0 && <span className="count">{appr.counts.waiting}</span>}</h2>
                  <Link href="/servicos/aprovacoes" className="sq-arrow" aria-label={t.approvals.title} title={t.approvals.title}><ArrowUpRight size={22} strokeWidth={1.75} aria-hidden /></Link>
                </div>
                <p className="flex items-start gap-2 text-ui text-copy"><Stamp size={18} aria-hidden className="mt-0.5 flex-none text-brand" />{appr.counts.waiting > 0 ? v.oldest(appr.items.map((r) => r.waitingLabel).at(-1) ?? "") : t.approvals.empty}</p>
              </section>
            )}
            <section className="panel flex flex-col gap-3 p-6 md:p-8" aria-labelledby="atalhos">
              <h2 id="atalhos" className="panel-title">{P.shortcuts}</h2>
              <ul className="quick-grid grid grid-cols-2">
                <li><Link href="/servicos/salas" className="quick-tile group !aspect-auto !min-h-[112px]"><span className="quick-fill" aria-hidden /><span className="quick-ico relative"><DoorOpen size={26} aria-hidden /></span><span className="quick-label relative">{P.rooms}</span></Link></li>
                <li><Link href="/servicos/ausencias" className="quick-tile group !aspect-auto !min-h-[112px]"><span className="quick-fill" aria-hidden /><span className="quick-ico relative"><CalendarOff size={26} aria-hidden /></span><span className="quick-label relative">{P.absences}</span></Link></li>
              </ul>
            </section>
          </aside>

          <section id="novo-pedido" className="panel scroll-mt-4 p-6 md:p-10 xl:col-span-12" aria-label={P.newRequest}>
            <ServiceCatalog categories={catalog(s)} />
          </section>
        </>
      )}
      {open?.status === "ok" && (
        <UrlSheet param="pedido" title={`${open.request.service.name} · ${v.number(open.request.number)}`} status={<><RequestHeaderStatus r={open.request} /><Link className="link-quiet" href={`/servicos/meus-pedidos/pedido?id=${open.request.id}`}>{v.openPage}</Link></>}>
          <RequestDetail r={open.request} mine={open.mine} />
        </UrlSheet>
      )}
    </div>
  );
}
