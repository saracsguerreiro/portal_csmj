"use client";

import { CalendarClock, CircleCheck, Clock, ListChecks } from "lucide-react";
import { useRef, useState } from "react";
import { Alert, Breadcrumbs, Button, Checkbox, Radio, TextArea, useToast } from "@/design-system";
import { postAction } from "@/features/shell/client-api";
import { t } from "@/i18n";
import { climateView } from "@/lib/api-participar";
import { useSession } from "@/lib/client";
import type { ClimateQuestion } from "@/data/types";

const c = t.climatePage;
type Past = ReturnType<typeof climateView>["past"][number];

function Scale({ q, max, value, onChange }: { q: ClimateQuestion; max: number; value: string; onChange: (v: string) => void }) {
  const opts = Array.from({ length: max === 5 ? 5 : 11 }, (_, i) => String(max === 5 ? i + 1 : i));
  return (
    <fieldset>
      <legend className="mb-2 text-ui font-medium text-ink">{q.text}</legend>
      <div className="flex flex-wrap gap-1.5">
        {opts.map((o) => <label key={o} className="chip !min-w-11 cursor-pointer justify-center has-[:checked]:border-transparent has-[:checked]:bg-[var(--ds-brand-background-default)] has-[:checked]:text-[var(--ds-brand-content)] has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-[var(--ds-border-focus)]"><input type="radio" className="sr-only" name={q.id} value={o} checked={value === o} onChange={() => onChange(o)} />{o}</label>)}
      </div>
      <div className="mt-1 flex justify-between text-caption text-subtle"><span>{max === 5 ? c.scaleLow : c.scale10Low}</span><span>{max === 5 ? c.scaleHigh : c.scale10High}</span></div>
    </fieldset>
  );
}

/** Resultado de um inquérito anterior: participação e média por tema em barras. */
function PastResult({ p }: { p: Past }) {
  const fmt = (n: number) => n.toFixed(1).replace(".", ",");
  return (
    <article className="flex flex-col gap-3 py-5 first:pt-0">
      <p className="text-caption font-semibold uppercase tracking-[0.06em] text-subtle">{c.closedOn(p.closedLabel)}</p>
      <h3 className="text-[17px] font-semibold leading-6 text-ink">{p.title}</h3>
      <p className="text-caption text-subtle">{c.participation(p.responses, p.participation)}</p>
      <ul className="flex flex-col gap-2">
        {p.themes.map((th) => (
          <li key={th.theme}>
            <div className="flex justify-between gap-3 text-body"><span>{th.theme}</span><b className="tabular-nums text-ink">{fmt(th.value)}</b></div>
            <div className="prog-trk mt-1" role="img" aria-label={`${th.theme}: ${fmt(th.value)} ${c.outOf5}`}><div className="prog-fill" style={{ width: `${(th.value / 5) * 100}%` }} /></div>
          </li>
        ))}
      </ul>
      <p className="border-l-4 border-[var(--ds-color-brand-700)] pl-3 text-ui text-ink">{p.highlight}</p>
    </article>
  );
}

/** Inquéritos: à esquerda o inquérito disponível (e as perguntas, depois de começar); à direita os resultados dos últimos inquéritos. */
export function ClimateView() {
  const s = useSession();
  const data = climateView(s);
  const { show } = useToast();
  const top = useRef<HTMLElement>(null);
  const [page, setPage] = useState(-1);
  const [answers, setAnswers] = useState<Record<string, string>>(data.answers);
  const [done, setDone] = useState(data.submitted);
  const set = (id: string, v: string) => setAnswers((a) => ({ ...a, [id]: v }));
  const total = data.themes.length;
  const toTop = () => top.current?.scrollIntoView({ block: "start" });

  const finish = async () => {
    try { await postAction({ action: "climate.save", answers, submit: true }); setDone(true); toTop(); } catch { show({ message: t.home.needs.failed }); }
  };
  const go = async (p: number) => { setPage(p); toTop(); await postAction({ action: "climate.save", answers, submit: false }).catch(() => {}); };

  return (
    <div className="grid grid-cols-1 gap-[var(--gap)] xl:grid-cols-12">
      <header className="panel flex flex-col gap-2 p-6 md:px-10 md:py-8 xl:col-span-12">
        <Breadcrumbs items={[{ label: "Participar", href: "/participar/enquetes" }, { label: c.title }]} label={t.shell.crumbs} />
        <h1 className="text-page font-bold tracking-[-0.02em]">{c.title}</h1>
        <p className="max-w-[70ch] text-ui text-subtle">{c.lead}</p>
      </header>

      <section ref={top} aria-labelledby="disponivel" className="panel flex min-w-0 scroll-mt-4 flex-col gap-6 p-6 md:p-10 xl:col-span-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 id="disponivel" className="panel-title">{c.available}</h2>
            <p className="mt-3 text-[24px] font-semibold leading-8 tracking-[-0.01em] text-ink">{data.title}</p>
          </div>
          {!done && (
            <p className="flex items-center gap-3 bg-[var(--ds-color-brand-700)] px-4 py-3 text-white">
              <CalendarClock size={22} aria-hidden className="flex-none" />
              <span><span className="block text-caption font-semibold uppercase tracking-[0.06em] text-white/85">{c.deadline}</span><span className="block font-semibold">{data.closesLabel}</span></span>
            </p>
          )}
        </div>

        {done ? (
          <div className="flex flex-col items-start gap-3 border border-line p-6" role="status">
            <CircleCheck size={32} aria-hidden className="text-brand" />
            <h3 className="text-section font-bold">{c.thanksTitle}</h3>
            <p className="text-ui">{c.thanks(data.resultsOn)}</p>
          </div>
        ) : page < 0 ? (
          <>
            <p className="max-w-[65ch] text-read">{data.objective}</p>
            <ul className="flex flex-wrap gap-x-6 gap-y-2 border-y border-line py-4 text-body">
              <li className="flex items-center gap-2"><Clock size={16} aria-hidden />{c.time(data.minutes)}</li>
              <li className="flex items-center gap-2"><ListChecks size={16} aria-hidden />{c.questions(data.themes.reduce((n, th) => n + th.questions.length, 0), total)}</li>
              <li className="flex items-center gap-2 font-semibold text-brand"><CalendarClock size={16} aria-hidden />{c.daysLeft(data.daysLeft)}</li>
            </ul>
            <Alert tone="info" title={c.anonymity}>{c.anonymityText}</Alert>
            <span><Button variant="pri" onClick={() => go(0)}>{c.start}</Button></span>
          </>
        ) : (
          <div className="flex flex-col gap-6" aria-labelledby="tema">
            <div>
              <p className="text-label text-subtle" aria-live="polite">{c.progress(page + 1, total)}</p>
              <div className="prog-trk mt-2" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={page + 1} aria-label={c.progress(page + 1, total)}><div className="prog-fill" style={{ width: `${((page + 1) / total) * 100}%` }} /></div>
              <h3 id="tema" className="mt-4 text-section font-bold">{data.themes[page].title}</h3>
              <p className="field-hint">{c.optional}</p>
            </div>
            {data.themes[page].questions.map((q) => {
              const v = answers[q.id] ?? "";
              if (q.kind === "scale5" || q.kind === "scale10") return <Scale key={q.id} q={q} max={q.kind === "scale5" ? 5 : 10} value={v} onChange={(x) => set(q.id, x)} />;
              if (q.kind === "text") return <TextArea key={q.id} label={q.text} value={v} onChange={(e) => set(q.id, e.target.value)} />;
              const chosen = v.split("|").filter(Boolean);
              return (
                <fieldset key={q.id}>
                  <legend className="mb-2 text-ui font-medium text-ink">{q.text}</legend>
                  <div className="flex flex-col gap-1">{q.options!.map((o) => q.kind === "single" ? <Radio key={o} name={q.id} checked={v === o} onChange={() => set(q.id, o)}>{o}</Radio> : <Checkbox key={o} checked={chosen.includes(o)} onChange={(e) => set(q.id, (e.target.checked ? [...chosen, o] : chosen.filter((x) => x !== o)).join("|"))}>{o}</Checkbox>)}</div>
                </fieldset>
              );
            })}
            <div className="flex justify-between gap-2 border-t border-line pt-5">
              <Button variant="gh" onClick={() => go(page - 1)}>{c.back}</Button>
              {page < total - 1 ? <Button variant="pri" onClick={() => go(page + 1)}>{c.next}</Button> : <Button variant="pri" onClick={finish}>{c.finish}</Button>}
            </div>
          </div>
        )}
      </section>

      <section aria-labelledby="resultados" className="panel flex min-w-0 flex-col gap-5 p-6 md:p-10 xl:col-span-5">
        <div>
          <h2 id="resultados" className="panel-title">{c.results}</h2>
          <p className="mt-2 text-caption text-subtle">{c.resultsLead}</p>
        </div>
        <div className="flex flex-col divide-y divide-[var(--ds-border-default)]">{data.past.map((p) => <PastResult key={p.id} p={p} />)}</div>
      </section>
    </div>
  );
}
