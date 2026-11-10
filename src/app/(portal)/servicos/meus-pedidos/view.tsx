"use client";

import Link from "next/link";
import { ButtonLink, EmptyState, LinkTabs, LoadError, PageHeader, UrlSheet } from "@/design-system";
import { RequestRow } from "@/features/servicos/parts";
import { RequestDetail, RequestHeaderStatus } from "@/features/servicos/RequestDetail";
import { BlockRetry } from "@/features/home/BlockRetry";
import { t } from "@/i18n";
import { getRequest, myRequests } from "@/lib/api-servicos";
import { withParams } from "@/lib/params";
import { useSession } from "@/lib/client";
import { useQuery } from "@/lib/use-query";

const v = t.services;


export function MyRequestsView() {
  const s = useSession();
  const f = useQuery();
  let data;
  try { data = myRequests(s, f.separador); } catch { data = null; }
  const open = f.pedido ? getRequest(s, f.pedido) : null;
  const tabs = (["em-curso", "concluidos", "rascunhos"] as const).map((k) => ({ href: withParams("/servicos/meus-pedidos", {}, { separador: k === "em-curso" ? undefined : k }), label: v.tabs[k], current: data?.tab === k, count: data?.counts[k] }));
  return (
    <div className="wrap flex flex-col gap-6 py-6 md:py-8">
      <PageHeader crumbs={[{ label: v.title, href: "/servicos" }, { label: v.myRequests }]} title={v.myRequests} description={v.myLead} actions={<ButtonLink variant="pri" href="/servicos">{v.makeRequest}</ButtonLink>} />
      {!data ? <LoadError what={v.what}><BlockRetry /></LoadError> : (
        <>
          <LinkTabs label={v.myRequests} tabs={tabs} />
          {data.items.length === 0 ? (
            <EmptyState title={data.counts["em-curso"] + data.counts.concluidos + data.counts.rascunhos === 0 ? v.noRequests : v.emptyTab[data.tab]}><Link className="link" href="/servicos">{v.makeRequest}</Link></EmptyState>
          ) : (
            <ul className="card !py-1 divide-y divide-[var(--ds-border-subtle)]">
              {data.items.map((r) => <RequestRow key={r.id} r={r} href={`/servicos/meus-pedidos/pedido?id=${r.id}`} sheetHref={withParams("/servicos/meus-pedidos", { separador: f.separador }, { pedido: r.id })} />)}
            </ul>
          )}
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
