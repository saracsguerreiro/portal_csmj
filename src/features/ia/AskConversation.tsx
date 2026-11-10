"use client";

import { ArrowUp, LoaderCircle, Search, ThumbsDown, ThumbsUp, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Button, ButtonLink } from "@/design-system";
import { t } from "@/i18n";
import type { Answer, Source } from "@/lib/api-ia";

const a = t.ask;

/** Citação viva: passar o rato ou focar mostra o cartão; tocar abre-o; clique com rato abre a fonte. */
function Cite({ source }: { source: Source }) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLSpanElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const id = `cite-${source.n}-${source.href.replaceAll("/", "-")}`;
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => { if (!wrap.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);
  return (
    <span ref={wrap} className="relative inline-block" onMouseEnter={() => { clearTimeout(timer.current); setOpen(true); }} onMouseLeave={() => { timer.current = setTimeout(() => setOpen(false), 150); }} onKeyDown={(e) => { if (e.key === "Escape") setOpen(false); }}>
      <button
        type="button" className="cite" aria-label={a.sourceN(source.n, source.title)} aria-expanded={open} aria-describedby={open ? id : undefined}
        onFocus={() => setOpen(true)} onBlur={(e) => { if (!wrap.current?.contains(e.relatedTarget as Node)) setOpen(false); }}
        onPointerUp={(e) => { if (e.pointerType === "mouse") window.location.assign(source.href); else setOpen((o) => !o); }}
        onKeyUp={(e) => { if (e.key === "Enter") window.location.assign(source.href); }}
      >{source.n}</button>
      {open && (
        <span id={id} role="tooltip" className="menu absolute bottom-full left-1/2 z-30 mb-2 block w-72 -translate-x-1/2 !p-4 text-left text-body font-normal">
          <span className="block text-caption font-semibold text-subtle">{a.types[source.type]}</span>
          <span className="block font-semibold text-ink">{source.title}</span>
          <span className="mt-1 block text-label">{source.excerpt}</span>
          <Link href={source.href} className="link-quiet mt-2 inline-flex min-h-11 items-center md:min-h-0">{a.sourceOpen}</Link>
        </span>
      )}
    </span>
  );
}

function Rating() {
  const [value, setValue] = useState<"up" | "down" | null>(null);
  const [sent, setSent] = useState(false);
  const [comment, setComment] = useState("");
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label={a.rateLabel}>
        <span className="text-label text-subtle">{a.rateLabel}</span>
        <button type="button" className="chip" aria-pressed={value === "up"} onClick={() => setValue("up")}><ThumbsUp size={14} aria-hidden />{a.useful}</button>
        <button type="button" className="chip" aria-pressed={value === "down"} onClick={() => setValue("down")}><ThumbsDown size={14} aria-hidden />{a.notUseful}</button>
      </div>
      {value === "down" && !sent && (
        <div className="flex flex-col gap-2">
          <label className="field-label" htmlFor="ia-comentario">{a.commentLabel}</label>
          <textarea id="ia-comentario" className="inp" rows={2} value={comment} onChange={(e) => setComment(e.target.value)} />
          <span><Button size="sm" onClick={() => setSent(true)}>{a.sendComment}</Button></span>
        </div>
      )}
      {value && (value === "up" || sent) && <p className="text-label" role="status">{a.thanks}</p>}
    </div>
  );
}

type Turn = { q: string; state: "working" | "done" | "error"; step: number; answer?: Answer };

export function AskConversation({ initial, compact }: { initial?: string; compact?: boolean }) {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [text, setText] = useState("");
  const started = useRef(false);
  const end = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);

  const askQ = async (q: string) => {
    const question = q.trim();
    if (!question) return;
    setText("");
    const idx = turns.length;
    setTurns((tt) => [...tt, { q: question, state: "working", step: 0 }]);
    const stepper = [1, 2].map((s, i) => setTimeout(() => setTurns((tt) => tt.map((x, j) => (j === idx && x.state === "working" ? { ...x, step: s } : x))), 380 * (i + 1)));
    try {
      const [res] = await Promise.all([fetch("/api/perguntar", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ q: question }) }), new Promise((r) => setTimeout(r, 1100))]);
      if (!res.ok) throw new Error();
      const answer = (await res.json()) as Answer;
      setTurns((tt) => tt.map((x, j) => (j === idx ? { ...x, state: "done", answer } : x)));
    } catch {
      stepper.forEach(clearTimeout);
      setTurns((tt) => tt.map((x, j) => (j === idx ? { ...x, state: "error" } : x)));
    }
  };

  useEffect(() => {
    if (initial && !started.current) { started.current = true; void askQ(initial); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial]);

  useEffect(() => { end.current?.scrollIntoView({ block: "nearest", behavior: "smooth" }); }, [turns]);

  return (
    <div className="flex flex-col gap-6">
      {turns.length === 0 && (
        <div>
          <p className="mb-2 text-label font-semibold text-subtle">{a.examples}</p>
          <ul className="flex flex-wrap gap-2">{a.exampleList.map((x) => <li key={x}><button type="button" className="chip" onClick={() => askQ(x)}>{x}</button></li>)}</ul>
        </div>
      )}
      {turns.map((turn, i) => (
        <section key={i} aria-label={turn.q} className="flex flex-col gap-3">
          <p className="self-end rounded-[20px] rounded-br-md bg-toned px-4 py-2 text-ui text-ink"><span className="sr-only">{a.you}: </span>{turn.q}</p>
          {turn.state === "working" && <p className="flex items-center gap-2 text-body" role="status"><LoaderCircle size={16} className="spin" aria-hidden />{a.steps[turn.step]}</p>}
          {turn.state === "error" && (
            <div className="alert alert-err" role="alert"><TriangleAlert size={20} aria-hidden /><div>{a.error} <button type="button" className="link" onClick={() => askQ(turn.q)}>{t.common.tryAgain}</button></div></div>
          )}
          {turn.state === "done" && turn.answer && (
            turn.answer.found ? (
              <div className={`flex flex-col gap-4 ${compact ? "" : "card"}`}>
                <p className={compact ? "text-ui" : "text-read"} aria-live="polite">
                  {turn.answer.segments.map((seg, k) => ("text" in seg ? <span key={k}>{seg.text}</span> : <Cite key={k} source={turn.answer!.sources[seg.cite - 1]} />))}
                </p>
                <div>
                  <h3 className="mb-1 text-label font-semibold text-ink">{a.references}</h3>
                  <ol className="flex flex-col gap-1 text-body">
                    {turn.answer.sources.map((s) => <li key={s.n} className="flex gap-2"><span className="cite !cursor-default">{s.n}</span><Link href={s.href} className="link-quiet !font-medium">{s.title}</Link><span className="text-caption text-subtle">{a.types[s.type]}</span></li>)}
                  </ol>
                </div>
                <p className="flex items-start gap-2 text-label text-subtle"><TriangleAlert size={14} aria-hidden className="mt-0.5 flex-none" />{a.disclaimer}</p>
                <Rating />
                {turn.answer.followUps.length > 0 && (
                  <div>
                    <p className="mb-2 text-label font-semibold text-ink">{a.followUps}</p>
                    <ul className="flex flex-wrap gap-2">{turn.answer.followUps.map((x) => <li key={x}><button type="button" className="chip" onClick={() => askQ(x)}>{x}</button></li>)}</ul>
                  </div>
                )}
              </div>
            ) : (
              <div className={`flex flex-col gap-2 ${compact ? "" : "card"}`} aria-live="polite">
                <p className="text-ui font-semibold text-ink">{a.none}</p>
                <p className="text-body">{a.noneHint}</p>
                <span><ButtonLink size="sm" href={`/pesquisa?q=${encodeURIComponent(turn.q)}`} icon={<Search size={14} aria-hidden />}>{a.searchInstead}</ButtonLink></span>
              </div>
            )
          )}
        </section>
      ))}
      <div ref={end} />
      <form className="sticky bottom-[calc(64px+env(safe-area-inset-bottom))] md:bottom-4" onSubmit={(e) => { e.preventDefault(); void askQ(text); }}>
        <div className="today-box !items-end !rounded-[24px] !py-2" style={{ boxShadow: "var(--ds-shadow-md)" }}>
          <label htmlFor="ia-pergunta" className="sr-only">{a.label}</label>
          <textarea
            id="ia-pergunta" ref={input} rows={1} value={text} placeholder={a.placeholder} aria-describedby="ia-dica"
            className="max-h-40 min-h-10 flex-1 resize-none bg-transparent py-2 text-ui text-ink outline-none placeholder:text-subtle"
            onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void askQ(text); } }}
          />
          <button type="submit" className="btn btn-pri !h-11 !w-11 !p-0 md:!h-10 md:!w-10" aria-label={a.submit} disabled={!text.trim()}><ArrowUp size={18} aria-hidden /></button>
        </div>
        <p id="ia-dica" className="mt-1 hidden text-caption text-subtle md:block">{a.hint}</p>
      </form>
    </div>
  );
}
