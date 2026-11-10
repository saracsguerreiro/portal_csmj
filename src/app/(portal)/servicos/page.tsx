import { Stamp } from "lucide-react";
import { ButtonLink, LoadError, PageHeader } from "@/design-system";
import { RequestRow } from "@/features/servicos/parts";
import { ServiceCatalog } from "@/features/servicos/ServiceCatalog";
import { BlockRetry } from "@/features/home/BlockRetry";
import { t } from "@/i18n";
import { approvals, catalog, myRequests } from "@/lib/api-servicos";
import { getSession } from "@/lib/session";

const v = t.services;

export const metadata = { title: v.title };

export default async function ServicesPage() {
  const s = await getSession();
  let mine, appr;
  try { mine = myRequests(s, "em-curso"); appr = s.profile.approver ? approvals(s) : null; } catch { mine = null; }
  return (
    <div className="wrap flex flex-col gap-8 py-6 md:py-8">
      <PageHeader title={v.title} description={v.lead} />
      {!mine ? <LoadError what={v.what}><BlockRetry /></LoadError> : (
        <div className="grid gap-6 lg:grid-cols-12">
          {mine.items.length > 0 && (
            <section aria-labelledby="em-curso" className="card lg:col-span-8">
              <div className="flex items-center justify-between gap-3">
                <h2 id="em-curso" className="flex items-center gap-2 text-block font-semibold">{v.inProgress}<span className="count">{mine.items.length}</span></h2>
                <ButtonLink size="sm" variant="gh" href="/servicos/meus-pedidos">{v.seeAll}</ButtonLink>
              </div>
              <ul className="divide-y divide-[var(--ds-border-subtle)]">{mine.items.slice(0, 3).map((r) => <RequestRow key={r.id} r={r} href={`/servicos/meus-pedidos/${r.id}`} sheetHref={`/servicos/meus-pedidos?pedido=${r.id}`} />)}</ul>
            </section>
          )}
          {appr && appr.counts.waiting > 0 && (
            <section aria-labelledby="aprovacoes" className="card flex flex-col items-start gap-3 lg:col-span-4">
              <Stamp size={24} aria-hidden className="text-brand" />
              <h2 id="aprovacoes" className="flex items-center gap-2 text-block font-semibold">{v.approvalsWaiting}<span className="count">{appr.counts.waiting}</span></h2>
              <p className="text-body">{v.oldest(appr.items.map((r) => r.waitingLabel).at(-1) ?? "")}</p>
              <ButtonLink variant="pri" href="/servicos/aprovacoes">{v.view}</ButtonLink>
            </section>
          )}
        </div>
      )}
      <ServiceCatalog categories={catalog(s)} />
    </div>
  );
}
