"use client";

import { ArrowUpRight, Info, UserRoundCheck } from "lucide-react";
import Link from "next/link";
import { Breadcrumbs, EmptyState, LinkTabs, LoadError } from "@/design-system";
import { ApprovalRow } from "@/features/servicos/ApprovalRow";
import { BlockRetry } from "@/features/home/BlockRetry";
import { t } from "@/i18n";
import { approvals } from "@/lib/api-servicos";
import { useSession } from "@/lib/client";
import { useQuery } from "@/lib/use-query";

const a = t.approvals;
const P = a.page;

/** Aprovações em blocos: a lista com separadores à esquerda, o resumo e as ausências à direita. */
export function ApprovalsView() {
  const s = useSession();
  const f = useQuery();
  let data, waiting;
  try { data = approvals(s, f.separador); waiting = approvals(s); } catch { data = null; }
  const oldest = waiting?.items.map((r) => r.waitingLabel).at(-1);
  return (
    <div className="grid grid-cols-1 gap-[var(--gap)] xl:grid-cols-12">
      <header className="panel flex flex-col gap-2 p-6 md:px-10 md:py-8 xl:col-span-12">
        <Breadcrumbs items={[{ label: t.services.title, href: "/servicos" }, { label: a.title }]} label={t.shell.crumbs} />
        <h1 className="text-page font-bold tracking-[-0.02em]">{a.title}</h1>
        <p className="text-ui text-subtle">{a.lead}</p>
      </header>
      {!data ? <div className="panel p-6 xl:col-span-12"><LoadError what={a.what}><BlockRetry /></LoadError></div> : (
        <>
          {data.delegations.map((d) => (
            <div key={d.for.id} className="panel flex items-start gap-3 border-l-4 border-[var(--ds-color-brand-700)] p-5 md:px-8 xl:col-span-12">
              <Info size={20} aria-hidden className="mt-0.5 flex-none text-brand" /><p className="text-ui text-ink">{a.deciding(d.for.name, d.until)}</p>
            </div>
          ))}
          <section aria-labelledby="lista-aprov" className="panel flex min-w-0 flex-col gap-4 p-6 md:p-10 xl:col-span-8">
            <h2 id="lista-aprov" className="panel-title">{P.list}</h2>
            <LinkTabs label={a.title} tabs={[{ href: "/servicos/aprovacoes", label: a.tabs.waiting, current: data.tab === "a-minha-espera", count: data.counts.waiting }, { href: "/servicos/aprovacoes?separador=decididos", label: a.tabs.decided, current: data.tab === "decididos", count: data.counts.decided }]} />
            {data.items.length === 0 ? (
              <EmptyState plain icon={<UserRoundCheck size={24} aria-hidden />} title={data.tab === "decididos" ? a.emptyDecided : a.empty} />
            ) : (
              <ul className="divide-y divide-[var(--ds-border-subtle)]">{data.items.map((r) => <ApprovalRow key={r.id} r={r} decided={data.tab === "decididos"} />)}</ul>
            )}
          </section>
          <aside className="flex min-w-0 flex-col gap-[var(--gap)] xl:col-span-4" aria-label={P.summary}>
            <section className="panel" aria-labelledby="resumo-aprov">
              <h2 id="resumo-aprov" className="panel-title px-6 pt-6 md:px-8 md:pt-8">{P.summary}</h2>
              <div className="mt-2 grid grid-cols-2 divide-x divide-[var(--ds-border-default)] border-t border-line">
                <Link href="/servicos/aprovacoes" className="block p-5 hover:bg-surface-2"><span className="text-[40px] font-semibold leading-none tabular-nums text-ink">{data.counts.waiting}</span><span className="mt-2 block text-ui text-subtle">{a.tabs.waiting}</span></Link>
                <Link href="/servicos/aprovacoes?separador=decididos" className="block p-5 hover:bg-surface-2"><span className="text-[40px] font-semibold leading-none tabular-nums text-ink">{data.counts.decided}</span><span className="mt-2 block text-ui text-subtle">{a.tabs.decided}</span></Link>
              </div>
              {oldest && <p className="border-t border-line px-6 py-4 text-ui text-copy md:px-8">{t.services.oldest(oldest)}</p>}
            </section>
            <section className="panel flex flex-col gap-3 p-6 md:p-8" aria-labelledby="ausente">
              <div className="flex items-start justify-between gap-3">
                <h2 id="ausente" className="panel-title">{P.awayTitle}</h2>
                <Link href="/servicos/ausencias" className="sq-arrow" aria-label={P.awayLink} title={P.awayLink}><ArrowUpRight size={22} strokeWidth={1.75} aria-hidden /></Link>
              </div>
              <p className="text-ui text-copy">{P.awayText}</p>
            </section>
          </aside>
        </>
      )}
    </div>
  );
}
