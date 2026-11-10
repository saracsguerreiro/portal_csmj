"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Avatar, Button, ButtonLink, StatusBadge, useToast } from "@/design-system";
import { postService } from "@/features/shell/client-api";
import { NamedIcon } from "@/features/shell/icons";
import { t } from "@/i18n";
import type { RequestView } from "@/lib/api-servicos";
import { statusTone } from "./status";

const a = t.approvals;
const v = t.services;

/** Linha de aprovação: Aprovar com confirmação na própria linha e Desfazer. Devolver e Recusar abrem o detalhe. */
export function ApprovalRow({ r, decided }: { r: RequestView; decided?: boolean }) {
  const router = useRouter();
  const { show } = useToast();
  const [mode, setMode] = useState<"idle" | "confirm" | "gone">("idle");
  if (mode === "gone") return null;
  const approve = async () => {
    setMode("gone");
    try {
      await postService({ action: "decision", id: r.id, verdict: "approve" });
      show({ message: a.approved, onUndo: async () => { await postService({ action: "decision.undo", id: r.id }).catch(() => {}); setMode("idle"); } });
    } catch (e) {
      setMode("idle");
      show({ message: (e as Error).message });
    }
  };
  const cur = r.current;
  return (
    <li className="@container py-4">
      <div className="flex flex-col gap-3 @3xl:flex-row @3xl:items-center">
        <div className="flex min-w-0 flex-1 gap-3">
          <Avatar initials={r.requester.initials} />
          <div className="min-w-0">
            <Link href={`/servicos/aprovacoes/decidir?id=${r.id}`} className="row-link"><span className="row-title font-semibold text-ink">{r.service.name}</span></Link>
            <span className="text-label"> · {r.requester.name} · {r.requester.unit}</span>
            <p className="text-label">{r.summary}</p>
            <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-caption text-subtle">
              <span className="inline-flex items-center gap-1"><NamedIcon name={r.service.icon} size={14} />{v.number(r.number)}</span>
              {decided ? <StatusBadge tone={statusTone[r.status]}>{r.statusLabel}</StatusBadge> : <span>{a.waitingSince(r.waitingLabel)}</span>}
              {!decided && cur?.overdue && <StatusBadge tone="warn">{v.overdue}</StatusBadge>}
              {!decided && cur && !cur.overdue && cur.dueLabel && <span>{v.dueOn(cur.dueLabel)}</span>}
              {!decided && cur?.onBehalfOf && <span>{v.inNameOf(cur.effective!.name, cur.onBehalfOf.name)}</span>}
            </p>
          </div>
        </div>
        {!decided && (mode === "idle" ? (
          <div className="flex flex-none gap-2 pl-[52px] @3xl:pl-0">
            <Button size="sm" variant="sec" icon={<Check size={14} aria-hidden />} onClick={() => setMode("confirm")}>{a.approve}</Button>
            <ButtonLink size="sm" variant="gh" href={`/servicos/aprovacoes/decidir?id=${r.id}`}>{a.open}</ButtonLink>
          </div>
        ) : (
          <div className="flex flex-none flex-wrap items-center gap-2 pl-[52px] @3xl:pl-0" role="group" aria-label={a.confirm}>
            <Button size="sm" variant="pri" autoFocus onClick={approve}>{a.confirm}</Button>
            <Button size="sm" variant="gh" onClick={() => setMode("idle")}>{a.keep}</Button>
          </div>
        ))}
      </div>
    </li>
  );
}
