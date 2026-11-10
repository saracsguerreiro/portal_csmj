import { notFound, redirect } from "next/navigation";
import { PageHeader } from "@/design-system";
import { RequestForm } from "@/features/servicos/RequestForm";
import { people } from "@/data/people";
import { services } from "@/data/services";
import { units } from "@/data/units";
import { t } from "@/i18n";
import { read, type SP } from "@/lib/params";
import { getSession } from "@/lib/session";
import { db } from "@/lib/store";

const v = t.services;

export async function generateMetadata({ params }: { params: Promise<{ servico: string }> }) {
  const { servico } = await params;
  return { title: services.find((x) => x.slug === servico)?.name ?? v.title };
}

export default async function RequestPage({ params, searchParams }: { params: Promise<{ servico: string }>; searchParams: SP }) {
  const { servico } = await params;
  const { rascunho } = await read(searchParams);
  const svc = services.find((x) => x.slug === servico);
  if (!svc) notFound();
  if (svc.id === "sala") redirect("/servicos/salas");
  const s = await getSession();
  const draft = rascunho ? db().requests.find((r) => r.id === rascunho && r.personId === s.person.id && r.status === "rascunho") : undefined;
  const opts = people.filter((p) => p.id !== s.person.id).map((p) => ({ value: p.id, label: p.name, detail: p.role }));
  const initial = draft ? Object.fromEntries(svc.fields.filter((f) => f.type === "text" || f.type === "textarea" || f.type === "number" || f.type === "select" || f.type === "radio" || f.type === "checks").map((f) => [f.id, draft.answers[f.id] ?? ""])) : {};
  return (
    <div className="wrap py-6 md:py-8">
      <div className="mx-auto flex max-w-[880px] flex-col gap-6">
        <PageHeader crumbs={[{ label: v.title, href: "/servicos" }, { label: svc.name }]} title={svc.name} description={svc.description}>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-label">
            <span className="font-semibold text-ink">{v.whoDecides}:</span>
            {svc.steps.map((st, i) => <span key={st.label} className="flex items-center gap-2">{i > 0 && <span aria-hidden className="text-subtle">›</span>}{st.label}</span>)}
            <span className="text-subtle">· {v.avg(svc.avgDays)}</span>
          </div>
        </PageHeader>
        <RequestForm serviceId={svc.id} serviceName={svc.name} fields={svc.fields} people={opts} units={units.map((u) => ({ value: u.id, label: u.short }))} draftId={draft?.id} initial={initial} />
      </div>
    </div>
  );
}
