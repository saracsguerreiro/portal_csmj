import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { Avatar, ButtonLink, StatusBadge } from "@/design-system";
import { NamedIcon } from "@/features/shell/icons";
import { t } from "@/i18n";
import type { RequestView } from "@/lib/api-servicos";
import { statusTone } from "./status";

const v = t.services;

/** Linha de pedido: serviço, número, estado com ícone, passo actual e acção directa. */
export function RequestRow({ r, href, sheetHref }: { r: RequestView; href: string; sheetHref?: string }) {
  const action = r.status === "devolvido" ? v.fix : r.status === "rascunho" ? v.continue : v.view;
  const actionHref = r.status === "rascunho" ? `/servicos/pedir/${r.service.slug}?rascunho=${r.id}` : sheetHref ?? href;
  return (
    <li className="flex flex-col gap-2 py-3 md:flex-row md:items-center md:gap-4">
      <Link href={sheetHref ?? href} scroll={false} className="row-link flex min-w-0 flex-1 gap-3">
        <span className="mt-0.5 text-brand"><NamedIcon name={r.service.icon} /></span>
        <span className="min-w-0">
          <span className="row-title block font-semibold text-ink">{r.service.name} <span className="font-normal text-subtle">· {v.number(r.number)}</span></span>
          <span className="block text-label">{r.summary}</span>
          <span className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-caption text-subtle">
            <StatusBadge tone={statusTone[r.status]}>{r.statusLabel}</StatusBadge>
            {r.position && <span>{r.position}</span>}
            <span>{r.updatedShort}</span>
          </span>
        </span>
      </Link>
      <span className="pl-9 md:pl-0"><ButtonLink size="sm" variant={r.status === "devolvido" ? "pri" : "sec"} href={actionHref} scroll={false}>{action}</ButtonLink></span>
    </li>
  );
}

/** Linha do tempo dos passos de decisão. */
export function Timeline({ r }: { r: RequestView }) {
  return (
    <ol className="relative flex flex-col gap-5 border-l border-line-strong pl-6" aria-label={v.timeline}>
      <li className="relative">
        <span className="absolute -left-[31px] top-1 h-3 w-3 rounded-full" style={{ background: "var(--ds-content-subtle)" }} aria-hidden />
        <p className="text-label font-semibold text-ink">{v.sentOn(r.createdLabel)}</p>
        <p className="text-caption text-subtle">{r.requester.name}</p>
      </li>
      {r.steps.map((st, i) => {
        const tone = st.state === "done" ? "ok" : st.state === "returned" ? "warn" : st.state === "refused" ? "err" : st.state === "current" ? "info" : "neu";
        return (
          <li key={i} className="relative">
            <span className="absolute -left-[31px] top-1 h-3 w-3 rounded-full border-2" style={{ borderColor: st.state === "waiting" ? "var(--ds-border-default)" : "var(--ds-brand-background-default)", background: st.state === "done" ? "var(--ds-brand-background-default)" : "var(--ds-surface-default)" }} aria-hidden />
            <p className="flex flex-wrap items-center gap-2 text-label font-semibold text-ink">{st.label}<StatusBadge tone={tone}>{v.stepStates[st.state]}</StatusBadge>{st.overdue && <StatusBadge tone="warn">{v.overdue}</StatusBadge>}</p>
            <p className="mt-0.5 flex items-center gap-2 text-caption text-subtle">
              <Avatar initials={(st.by ?? st.effective ?? st.decider).initials} size="sm" />
              {st.by ? v.decidedBy(st.by.name, st.atLabel ?? "") : st.onBehalfOf && st.effective ? v.inNameOf(st.effective.name, st.onBehalfOf.name) : v.waitingFor((st.effective ?? st.decider).name)}
              {st.state === "current" && st.dueLabel && !st.overdue && <span>· {v.dueOn(st.dueLabel)}</span>}
            </p>
            {st.comment && <p className="mt-1 max-w-[60ch] rounded-[12px] bg-surface-2 px-3 py-2 text-body">{st.comment}</p>}
          </li>
        );
      })}
    </ol>
  );
}

export function Answers({ r }: { r: RequestView }) {
  return (
    <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
      {r.answers.map((a) => <div key={a.label}><dt className="text-label font-semibold text-ink">{a.label}</dt><dd className="text-ui">{a.value}</dd></div>)}
    </dl>
  );
}

export function MoreLink({ href, label }: { href: string; label: string }) {
  return <Link href={href} className="link-quiet inline-flex items-center gap-1">{label}<ChevronRight size={16} aria-hidden /></Link>;
}
