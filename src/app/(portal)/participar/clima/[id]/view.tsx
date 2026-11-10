"use client";

import { CircleCheck, Clock, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Alert, Button, Checkbox, PageHeader, Radio, TextArea, useToast } from "@/design-system";
import { postAction } from "@/features/shell/client-api";
import { t } from "@/i18n";
import { climateView } from "@/lib/api-participar";
import { useSession } from "@/lib/client";
import type { ClimateQuestion } from "@/data/types";

const c = t.climatePage;

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

export function ClimateView() {
  const s = useSession();
  const data = climateView(s);
  const { show } = useToast();
  const [page, setPage] = useState(-1);
  const [answers, setAnswers] = useState<Record<string, string>>(data.answers);
  const [done, setDone] = useState(data.submitted);
  const set = (id: string, v: string) => setAnswers((a) => ({ ...a, [id]: v }));
  const total = data.themes.length;

  const finish = async () => {
    try { await postAction({ action: "climate.save", answers, submit: true }); setDone(true); window.scrollTo({ top: 0 }); } catch { show({ message: t.home.needs.failed }); }
  };
  const go = async (p: number) => { setPage(p); window.scrollTo({ top: 0 }); await postAction({ action: "climate.save", answers, submit: false }).catch(() => {}); };

  return (
    <div className="wrap py-6 md:py-8">
      <div className="mx-auto flex max-w-[880px] flex-col gap-6">
        <PageHeader crumbs={[{ label: t.pollsPage.title, href: "/participar/enquetes" }, { label: data.title }]} title={data.title} description={c.lead} />
        {done ? (
          <section className="card flex flex-col items-start gap-3" role="status">
            <CircleCheck size={32} aria-hidden className="text-brand" />
            <h2 className="text-section font-bold">{c.thanksTitle}</h2>
            <p className="text-ui">{c.thanks(data.resultsOn)}</p>
          </section>
        ) : page < 0 ? (
          <section className="card flex flex-col gap-4">
            <p className="max-w-[65ch] text-ui">{data.objective}</p>
            <Alert tone="info" title={c.anonymity}>{c.anonymityText}</Alert>
            <ul className="flex flex-wrap gap-x-6 gap-y-1 text-body"><li className="flex items-center gap-2"><Clock size={16} aria-hidden />{c.time(data.minutes)}</li><li className="flex items-center gap-2"><ShieldCheck size={16} aria-hidden />{c.until(data.closesLabel)}</li></ul>
            <span><Button variant="pri" onClick={() => go(0)}>{c.start}</Button></span>
          </section>
        ) : (
          <section className="card flex flex-col gap-6" aria-labelledby="tema">
            <div>
              <p className="text-label text-subtle" aria-live="polite">{c.progress(page + 1, total)}</p>
              <div className="prog-trk mt-2" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={page + 1} aria-label={c.progress(page + 1, total)}><div className="prog-fill" style={{ width: `${((page + 1) / total) * 100}%` }} /></div>
              <h2 id="tema" className="mt-4 text-section font-bold">{data.themes[page].title}</h2>
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
            <div className="flex justify-between gap-2">
              <Button variant="gh" onClick={() => go(page - 1)}>{c.back}</Button>
              {page < total - 1 ? <Button variant="pri" onClick={() => go(page + 1)}>{c.next}</Button> : <Button variant="pri" onClick={finish}>{c.finish}</Button>}
            </div>
          </section>
        )}
        <section aria-labelledby="resultados" className="card flex flex-col gap-4">
          <div><h2 id="resultados" className="text-block font-semibold">{c.results}</h2><p className="text-label text-subtle">{c.resultsLead}</p></div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-body">
              <caption className="sr-only">{c.results}</caption>
              <thead><tr className="text-left text-label text-subtle"><th scope="col" className="bg-surface-2 p-2 font-semibold">{t.services.answers}</th><th scope="col" className="bg-surface-2 p-2 font-semibold">{c.national}</th>{data.results2025[0].units.map((u) => <th key={u.name} scope="col" className="bg-surface-2 p-2 font-semibold">{u.name}</th>)}</tr></thead>
              <tbody>{data.results2025.map((r) => <tr key={r.theme} className="border-t border-line"><th scope="row" className="p-2 text-left font-semibold text-ink">{r.theme}</th><td className="p-2 tabular-nums">{String(r.national).replace(".", ",")}</td>{r.units.map((u) => <td key={u.name} className="p-2 tabular-nums">{u.value === null ? <span className="text-caption text-subtle">{c.hidden}</span> : <>{String(u.value).replace(".", ",")} <span className="text-caption text-subtle">· {c.responses(u.n)}</span></>}</td>)}</tr>)}</tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
