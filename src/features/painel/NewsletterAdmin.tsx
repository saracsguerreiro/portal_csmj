"use client";

import { ArrowDown, ArrowUp, CalendarClock, RotateCcw, Send, X } from "lucide-react";
import { useEffect, useState } from "react";
import { entity } from "@/config/entity";
import { Button, ConfirmDialog, LoadError, ScopeTag, Segmented, StatusBadge, TextArea, useToast } from "@/design-system";
import { BlockRetry } from "@/features/home/BlockRetry";
import { postAdmin } from "@/features/shell/client-api";
import { t } from "@/i18n";
import { newsletterAdmin } from "@/lib/api-painel";
import { useSession } from "@/lib/client";
import { scopeKind } from "@/lib/scope";
import { AdminPage, Panel } from "./parts";

const A = t.admin;
const N = A.newsletter;

/** A07: newsletter semanal. */
export function NewsletterAdmin() {
  const s = useSession();
  const toast = useToast();
  let data: ReturnType<typeof newsletterAdmin> | null;
  try { data = newsletterAdmin(s); } catch { data = null; }
  const [intro, setIntro] = useState(data?.draft.intro ?? "");
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [sendDlg, setSendDlg] = useState(false);
  const [cancelDlg, setCancelDlg] = useState(false);
  const draftId = data?.draft.id;
  useEffect(() => { if (data) setIntro(data.draft.intro); }, [draftId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!data) return <AdminPage title={N.title}><LoadError what={N.what}><BlockRetry /></LoadError></AdminPage>;
  const { draft } = data;
  const order = draft.pieces.map((p) => p.id);
  const removed = draft.removedPieces.map((p) => p.id);

  const save = (next: { intro?: string; removed?: string[]; order?: string[] }, msg?: string) =>
    postAdmin({ action: "newsletter.save", id: draft.id, intro: next.intro ?? intro, removed: next.removed ?? removed, order: next.order ?? order }).then(() => msg && toast.show({ message: msg })).catch((e: Error) => toast.show({ message: e.message }));
  const move = (i: number, d: number) => { const o = [...order]; const [x] = o.splice(i, 1); o.splice(i + d, 0, x); void save({ order: o }); };
  const act = async (action: "newsletter.send" | "newsletter.cancel" | "newsletter.generate", msg: string) => {
    try { if (action === "newsletter.send") await save({}); await postAdmin({ action, id: draft.id }); toast.show({ message: msg }); } catch (e) { toast.show({ message: (e as Error).message }); }
  };

  const email = (
    <div className={`mx-auto overflow-hidden rounded-[12px] border border-line bg-surface shadow-[var(--ds-shadow-1)] ${device === "mobile" ? "max-w-[360px]" : "max-w-[640px]"}`}>
      <div className="brand-bar !h-auto !static flex items-center gap-3 px-5 py-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={entity.logo.onBrand} alt={entity.name} className="h-8 w-auto" />
      </div>
      <div className="flex flex-col gap-4 p-5">
        <p className="font-mono text-label text-subtle">{N.edition(draft.number)} · 13/11/2026</p>
        <p className="text-[15px] leading-6">{intro || "—"}</p>
        {draft.pieces.length === 0 ? <p className="text-ui text-subtle">{N.noPieces}</p> : (
          <ul className="flex flex-col divide-y divide-[var(--ds-border-subtle)]">
            {draft.pieces.map((p) => (
              <li key={p.id} className="flex flex-col gap-0.5 py-3">
                <span className="text-label font-semibold uppercase tracking-[0.04em] text-subtle">{p.kind}</span>
                <span className="font-semibold text-brand underline underline-offset-2">{p.title}</span>
                <span className="text-label text-subtle">{p.scope}</span>
              </li>
            ))}
          </ul>
        )}
        <p className="border-t border-line pt-3 text-label text-subtle">Recebe esta newsletter porque trabalha no {entity.shortName}. Pode deixar de a receber nas suas notificações.</p>
      </div>
    </div>
  );

  return (
    <AdminPage title={N.title} lead={N.lead} crumbs={[{ label: A.items.trabalho, href: "/painel" }, { label: N.title }]}
      actions={<>
        <Button icon={<RotateCcw size={18} aria-hidden />} onClick={() => void act("newsletter.generate", N.generated)}>{N.generate}</Button>
        <Button onClick={() => toast.show({ message: N.testSent(data!.email) })}>{N.test}</Button>
        {data.canSend && <Button variant="pri" icon={<Send size={18} aria-hidden />} disabled={draft.pieces.length === 0} onClick={() => setSendDlg(true)}>{N.send}</Button>}
      </>}>
      <p className="flex items-center gap-2 text-ui"><CalendarClock size={18} aria-hidden className="text-subtle" /><span className="font-semibold">{N.schedule}:</span> {N.scheduleValue} · {N.recipients(data.recipients)}</p>
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-5">
          <Panel id="edicao" title={`${N.edition(draft.number)} · ${N.draft}`} action={<Button size="sm" variant="gh" icon={<X size={16} aria-hidden />} onClick={() => setCancelDlg(true)}>{N.cancel}</Button>}>
            <TextArea label={N.intro} rows={3} value={intro} onChange={(e) => setIntro(e.target.value)} onBlur={() => intro !== draft.intro && void save({ intro }, "Texto de abertura guardado")} />
            <h3 className="field-label">{N.pieces} <span className="font-normal text-subtle">· {N.since}</span></h3>
            {draft.pieces.length === 0 ? <p className="text-ui text-subtle">{N.noPieces}</p> : (
              <ol className="flex flex-col divide-y divide-[var(--ds-border-subtle)] rounded-[16px] border border-line">
                {draft.pieces.map((p, i) => (
                  <li key={p.id} className="flex items-center gap-2 py-2.5 pl-4 pr-2">
                    <span className="w-5 flex-none font-mono text-label text-subtle">{i + 1}</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">{p.title}</p>
                      <p className="flex flex-wrap items-center gap-2 text-label text-subtle">{p.kind}<ScopeTag kind={scopeKind({ scopes: p.scopes })}>{p.scope}</ScopeTag></p>
                    </div>
                    <button type="button" className="icbtn" aria-label={N.up(p.title)} disabled={i === 0} onClick={() => move(i, -1)}><ArrowUp size={16} aria-hidden /></button>
                    <button type="button" className="icbtn" aria-label={N.down(p.title)} disabled={i === draft.pieces.length - 1} onClick={() => move(i, 1)}><ArrowDown size={16} aria-hidden /></button>
                    <button type="button" className="icbtn" aria-label={N.removePiece(p.title)} onClick={() => void save({ removed: [...removed, p.id] }, `Retirada: ${p.title}`)}><X size={16} aria-hidden /></button>
                  </li>
                ))}
              </ol>
            )}
            {draft.removedPieces.length > 0 && (
              <details className="text-ui">
                <summary className="cursor-pointer font-semibold">Peças retiradas ({draft.removedPieces.length})</summary>
                <ul className="mt-2 flex flex-col gap-1">{draft.removedPieces.map((p) => <li key={p.id} className="flex items-center justify-between gap-2"><span>{p.title}</span><Button size="sm" variant="gh" onClick={() => void save({ removed: removed.filter((x) => x !== p.id) })}>Repor</Button></li>)}</ul>
              </details>
            )}
          </Panel>
          <Panel id="edicoes" title={N.editions}>
            <ul className="flex flex-col divide-y divide-[var(--ds-border-subtle)]">
              {data.history.map((e) => (
                <li key={e.id} className="flex flex-wrap items-center gap-3 py-2.5">
                  <span className="w-28 flex-none font-semibold">{N.edition(e.number)}</span>
                  <span className="min-w-0 flex-1 truncate text-ui text-subtle">{e.intro}</span>
                  <StatusBadge tone={e.status === "enviada" ? "ok" : "neu"}>{e.status === "enviada" ? N.sent : N.cancelled}</StatusBadge>
                  <span className="font-mono text-ui text-subtle">{e.date}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
        <Panel id="previsualizacao" title={N.preview} action={<Segmented legend={N.preview} value={device} onChange={setDevice} options={[{ value: "desktop", label: N.desktop }, { value: "mobile", label: N.mobile }]} />} className="self-start xl:sticky xl:top-[90px]">
          <div className="rounded-[16px] bg-surface-2 p-4">{email}</div>
        </Panel>
      </div>
      <ConfirmDialog open={sendDlg} onClose={() => setSendDlg(false)} title={N.sendTitle} verb={N.sendVerb} onConfirm={() => { setSendDlg(false); void act("newsletter.send", N.sentMsg); }}>{N.sendBody(data.recipients)}</ConfirmDialog>
      <ConfirmDialog open={cancelDlg} onClose={() => setCancelDlg(false)} title={N.cancelTitle} verb={N.cancelVerb} danger onConfirm={() => { setCancelDlg(false); void act("newsletter.cancel", N.cancelledMsg); }}>{N.cancelBody}</ConfirmDialog>
    </AdminPage>
  );
}
