import { Alert, StatusBadge } from "@/design-system";
import { t } from "@/i18n";
import type { RequestView } from "@/lib/api-servicos";
import { Answers, Timeline } from "./parts";
import { RequestActions } from "./RequestActions";
import { statusTone } from "./status";

const v = t.services;

export function RequestHeaderStatus({ r }: { r: RequestView }) {
  return <><StatusBadge tone={statusTone[r.status]}>{r.statusLabel}</StatusBadge>{r.position && <span className="text-label text-subtle">{r.position}</span>}</>;
}

/** Conteúdo do pedido: igual na ficha lateral e na página. */
export function RequestDetail({ r, mine }: { r: RequestView; mine: boolean }) {
  const canCancel = mine && ["em-analise", "devolvido", "rascunho"].includes(r.status) && !r.steps.some((x) => x.state === "done");
  return (
    <div className="flex flex-col gap-6">
      <p className="text-body">{v.sentOn(r.createdLabel)} · {r.summary}</p>
      {r.status === "devolvido" && r.returnedComment && <Alert tone="warn" title={v.returnedBecause}>{r.returnedComment}</Alert>}
      <section aria-labelledby={`tl-${r.id}`}>
        <h3 id={`tl-${r.id}`} className="mb-3 text-block font-semibold">{v.timeline}</h3>
        <Timeline r={r} />
      </section>
      <section aria-labelledby={`ans-${r.id}`}>
        <h3 id={`ans-${r.id}`} className="mb-3 text-block font-semibold">{v.answers}</h3>
        <Answers r={r} />
      </section>
      {mine && <RequestActions id={r.id} status={r.status} canCancel={canCancel} answers={[...r.missing, ...r.answers]} />}
    </div>
  );
}
