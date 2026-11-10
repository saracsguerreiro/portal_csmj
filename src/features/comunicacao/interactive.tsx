"use client";

import { Bookmark, BookmarkCheck, Link2, Pencil, Play, Printer, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, ButtonLink, IconButton, Radio, StatusBadge, useToast } from "@/design-system";
import type { Rsvp } from "@/data/types";
import { postAction } from "@/features/shell/client-api";
import { t } from "@/i18n";

const n = t.news;
const ev = t.events;

/** Inscrição num evento: optimista, com Desfazer. */
export function RsvpControl({ id, rsvp, full, closed, needsApproval, hasSignup, compact }: { id: string; rsvp: Rsvp; full: boolean; closed: boolean; needsApproval: boolean; hasSignup: boolean; compact?: boolean }) {
  const { show } = useToast();
  const router = useRouter();
  const [state, setState] = useState<Rsvp>(rsvp);
  useEffect(() => setState(rsvp), [rsvp]);
  if (!hasSignup) return compact ? null : <p className="text-body">{ev.noRegistration}</p>;

  const set = async (value: Rsvp, message: string) => {
    const before = state;
    setState(value);
    show({ message, onUndo: async () => { setState(before); await postAction({ action: "event.set", id, value: before }).catch(() => {}); } });
    try {
      await postAction({ action: "event.set", id, value });
    } catch {
      setState(before);
      show({ message: t.home.needs.failed });
    }
  };

  const size = compact ? "sm" : "md";
  if (state === "going") return (
    <div className="flex flex-wrap items-center gap-2">
      <StatusBadge tone="ok">{ev.isGoing}</StatusBadge>
      <Button size={size} variant="gh" onClick={() => set("none", ev.cancelMsg)}>{ev.notGoing}</Button>
    </div>
  );
  if (state === "waitlist") return (
    <div className="flex flex-wrap items-center gap-2">
      <StatusBadge tone="info">{ev.onWait}</StatusBadge>
      <Button size={size} variant="gh" onClick={() => set("none", ev.cancelMsg)}>{ev.leaveWait}</Button>
    </div>
  );
  if (state === "pending") return (
    <div className="flex flex-wrap items-center gap-2">
      <StatusBadge tone="warn">{ev.pending}</StatusBadge>
      <Button size={size} variant="gh" onClick={() => set("none", ev.cancelMsg)}>{ev.notGoing}</Button>
    </div>
  );
  if (closed) return <span className="text-label text-subtle">{ev.closed}</span>;
  if (full) return <Button size={size} variant="sec" onClick={() => set("waitlist", ev.waitMsg)}>{ev.joinWait}</Button>;
  return <Button size={size} variant={compact ? "sec" : "pri"} block={!compact} onClick={() => set(needsApproval ? "pending" : "going", needsApproval ? ev.pendingMsg : ev.goingMsg)}>{ev.going}</Button>;
}

/** Enquete dentro do texto: voto único, confirmado antes de enviar. */
export function LivePoll({ id, question, detail, options, votedFor }: { id: string; question: string; detail: string; options: string[]; votedFor?: string }) {
  const { show } = useToast();
  const [choice, setChoice] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [voted, setVoted] = useState(votedFor);
  const vote = async () => {
    setVoted(choice);
    setConfirming(false);
    show({ message: t.home.needs.voted });
    try { await postAction({ action: "poll.vote", id, option: choice }); } catch { setVoted(undefined); show({ message: t.home.needs.failed }); }
  };
  return (
    <section aria-label={question} className="not-prose rounded-[16px] border border-line bg-surface p-5 text-body">
      <p className="text-ui font-semibold text-ink">{question}</p>
      <p className="text-label text-subtle">{detail}</p>
      {voted ? (
        <p className="mt-3 flex items-center gap-2" role="status"><StatusBadge tone="ok">{t.home.needs.voted}</StatusBadge><span>{voted}</span></p>
      ) : (
        <fieldset className="mt-3">
          <legend className="sr-only">{t.home.needs.voteLegend}</legend>
          <div className="flex flex-col gap-2">{options.map((o) => <Radio key={o} name={`poll-${id}`} checked={choice === o} onChange={() => setChoice(o)}>{o}</Radio>)}</div>
          <p className="field-hint mt-2">{t.home.needs.voteFinal}</p>
          {confirming ? (
            <div className="mt-3 flex flex-wrap items-center gap-2"><span className="font-medium text-ink">{t.home.needs.confirmVote}?</span><Button size="sm" variant="pri" onClick={vote} autoFocus>{t.home.needs.confirm}</Button><Button size="sm" variant="gh" onClick={() => setConfirming(false)}>{t.home.needs.keep}</Button></div>
          ) : (
            <Button className="mt-3" size="sm" variant="pri" disabled={!choice} onClick={() => setConfirming(true)}>{t.home.needs.vote}</Button>
          )}
        </fieldset>
      )}
    </section>
  );
}

/** Vídeo: nada é pedido antes do clique. */
export function VideoBlock({ title, poster, duration }: { title: string; poster: string; duration: string }) {
  const [playing, setPlaying] = useState(false);
  return (
    <figure>
      {playing ? (
        <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-[16px] border border-line-strong bg-surface p-6 text-center text-body">
          <p className="font-semibold text-ink">{title}</p>
          <p className="max-w-[48ch]">{n.videoNote}</p>
          <IconButton label={t.common.close} onClick={() => setPlaying(false)}><X size={18} aria-hidden /></IconButton>
        </div>
      ) : (
        <button type="button" onClick={() => setPlaying(true)} className="group relative block w-full overflow-hidden rounded-[16px]" aria-label={n.playVideo(title)}>
          <img src={poster} alt="" width={960} height={540} loading="lazy" className="cover-img aspect-video w-full object-cover" />
          <span className="absolute inset-0 grid place-items-center">
            <span className="grid h-16 w-16 place-items-center rounded-full text-white transition-transform group-hover:scale-105" style={{ background: "var(--ds-surface-brand)" }}><Play size={28} aria-hidden /></span>
          </span>
          <span className="absolute bottom-3 right-3 rounded-full px-2.5 py-0.5 text-caption font-semibold text-white" style={{ background: "var(--ds-surface-toast)" }}>{duration}</span>
        </button>
      )}
      <figcaption>{title}</figcaption>
    </figure>
  );
}

export function ArticleActions({ id, saved, canEdit, editHref, layout }: { id: string; saved: boolean; canEdit: boolean; editHref: string; layout: "column" | "bar" }) {
  const { show } = useToast();
  const [isSaved, setSaved] = useState(saved);
  const share = async () => {
    try { await navigator.clipboard.writeText(window.location.href); } catch { /* sem permissão */ }
    show({ message: n.linkCopied });
  };
  const toggle = async () => {
    const next = !isSaved;
    setSaved(next);
    show({ message: next ? n.savedMsg : n.unsavedMsg });
    try { await postAction({ action: "saved.toggle", id }); } catch { setSaved(!next); show({ message: t.home.needs.failed }); }
  };
  const cls = layout === "bar" ? "bottom-item !min-h-12 !text-copy" : "menu-item";
  return (
    <ul className={layout === "bar" ? "flex" : "flex flex-col"}>
      <li className={layout === "bar" ? "flex flex-1" : ""}><button type="button" className={cls} onClick={share}><Link2 size={20} aria-hidden />{n.share}</button></li>
      <li className={layout === "bar" ? "flex flex-1" : ""}><button type="button" className={cls} aria-pressed={isSaved} onClick={toggle}>{isSaved ? <BookmarkCheck size={20} aria-hidden /> : <Bookmark size={20} aria-hidden />}{isSaved ? n.saved : n.save}</button></li>
      <li className={layout === "bar" ? "flex flex-1" : ""}><button type="button" className={cls} onClick={() => window.print()}><Printer size={20} aria-hidden />{n.print}</button></li>
      {canEdit && <li className={layout === "bar" ? "flex flex-1" : ""}><Link className={cls} href={editHref}><Pencil size={20} aria-hidden />{n.edit}</Link></li>}
    </ul>
  );
}

export { ButtonLink };
