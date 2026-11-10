import { notFound } from "next/navigation";
import { Alert, Avatar, ButtonLink, PageHeader } from "@/design-system";
import { Denied } from "@/features/comunicacao/content";
import { DecisionPanel } from "@/features/servicos/DecisionPanel";
import { Answers, Timeline } from "@/features/servicos/parts";
import { RequestHeaderStatus } from "@/features/servicos/RequestDetail";
import { t } from "@/i18n";
import { decisionContext } from "@/lib/api-servicos";
import { getSession } from "@/lib/session";

const a = t.approvals;
const v = t.services;

export default async function DecisionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const s = await getSession();
  const data = decisionContext(s, id);
  if (data.status === "missing") notFound();
  if (data.status === "denied") return <Denied />;
  const r = data.request;
  const card = data.canDecide ? <DecisionPanel id={r.id} /> : (
    <div className="flex flex-col gap-3">
      <Alert tone="info">{data.own ? a.own : data.decidedBy ? a.already(data.decidedBy.name, data.decidedBy.at) : a.notYours}</Alert>
      <ButtonLink href="/servicos/aprovacoes">{a.backToList}</ButtonLink>
    </div>
  );
  return (
    <div className="wrap py-6 md:py-8">
      <PageHeader crumbs={[{ label: v.title, href: "/servicos" }, { label: a.title, href: "/servicos/aprovacoes" }, { label: v.number(r.number) }]} title={`${r.service.name} · ${v.number(r.number)}`}>
        <div className="flex flex-wrap items-center gap-3">
          <RequestHeaderStatus r={r} />
        </div>
      </PageHeader>
      {data.onBehalfOf && data.canDecide && <div className="mt-4"><Alert tone="info">{a.decidingFor(data.onBehalfOf.name)}</Alert></div>}
      <div className="mt-6 grid gap-6 lg:grid-cols-12">
        <div className="flex min-w-0 flex-col gap-6 lg:col-span-8">
          <section className="card flex items-center gap-4" aria-label={a.requester}>
            <Avatar initials={r.requester.initials} size="lg" />
            <div><p className="text-block font-semibold text-ink">{r.requester.name}</p><p className="text-body">{r.requester.role} · {r.requester.unit}</p><p className="text-caption text-subtle">{v.sentOn(r.createdLabel)}</p></div>
          </section>
          <section className="card" aria-labelledby="respostas"><h2 id="respostas" className="mb-4 text-block font-semibold">{v.answers}</h2><Answers r={r} /></section>
          {data.context && <section className="card" aria-labelledby="contexto"><h2 id="contexto" className="mb-3 text-block font-semibold">{data.context.title}</h2><ul className="flex list-disc flex-col gap-1 pl-5 text-ui">{data.context.lines.map((l) => <li key={l}>{l}</li>)}</ul></section>}
          <section className="card" aria-labelledby="passos"><h2 id="passos" className="mb-4 text-block font-semibold">{v.timeline}</h2><Timeline r={r} /></section>
        </div>
        <aside className="lg:col-span-4" aria-labelledby="decisao">
          <div className="card sticky top-28 flex flex-col gap-4">
            <h2 id="decisao" className="text-block font-semibold">{a.decide}</h2>
            {card}
          </div>
        </aside>
      </div>
    </div>
  );
}
