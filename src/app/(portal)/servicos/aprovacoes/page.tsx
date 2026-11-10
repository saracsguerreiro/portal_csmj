import { UserRoundCheck } from "lucide-react";
import { Alert, EmptyState, LinkTabs, LoadError, PageHeader } from "@/design-system";
import { ApprovalRow } from "@/features/servicos/ApprovalRow";
import { BlockRetry } from "@/features/home/BlockRetry";
import { t } from "@/i18n";
import { approvals } from "@/lib/api-servicos";
import { read, type SP } from "@/lib/params";
import { getSession } from "@/lib/session";

const a = t.approvals;

export const metadata = { title: a.title };

export default async function ApprovalsPage({ searchParams }: { searchParams: SP }) {
  const s = await getSession();
  const f = await read(searchParams);
  let data;
  try { data = approvals(s, f.separador); } catch { data = null; }
  return (
    <div className="wrap flex flex-col gap-6 py-6 md:py-8">
      <PageHeader crumbs={[{ label: t.services.title, href: "/servicos" }, { label: a.title }]} title={a.title} description={a.lead} />
      {!data ? <LoadError what={a.what}><BlockRetry /></LoadError> : (
        <>
          {data.delegations.map((d) => <Alert key={d.for.id} tone="info">{a.deciding(d.for.name, d.until)}</Alert>)}
          <LinkTabs label={a.title} tabs={[{ href: "/servicos/aprovacoes", label: a.tabs.waiting, current: data.tab === "a-minha-espera", count: data.counts.waiting }, { href: "/servicos/aprovacoes?separador=decididos", label: a.tabs.decided, current: data.tab === "decididos", count: data.counts.decided }]} />
          {data.items.length === 0 ? (
            <EmptyState icon={<UserRoundCheck size={24} aria-hidden />} title={data.tab === "decididos" ? a.emptyDecided : a.empty} />
          ) : (
            <ul className="card !py-0 divide-y divide-[var(--ds-border-subtle)]">{data.items.map((r) => <ApprovalRow key={r.id} r={r} decided={data.tab === "decididos"} />)}</ul>
          )}
        </>
      )}
    </div>
  );
}
