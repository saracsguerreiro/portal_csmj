"use client";

import { CircleAlert, CircleCheck } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Field } from "@/data/types";
import { Button, ButtonLink, Checkbox, DateField, DateRangeField, FileUpload, PersonPicker, Radio, SelectField, TextArea, TextField, type PickOption } from "@/design-system";
import { postService } from "@/features/shell/client-api";
import { t } from "@/i18n";

const v = t.services;

type Props = { serviceId: string; serviceName: string; fields: Field[]; people: PickOption[]; units: { value: string; label: string }[]; draftId?: string; initial?: Record<string, string> };

const fmt = (iso: string) => (iso ? iso.split("-").reverse().join("/") : "");

function display(f: Field, value: string, people: PickOption[], units: { value: string; label: string }[]) {
  if (!value) return "";
  if (f.type === "daterange") { const [a, b] = value.split("|"); return `${fmt(a)} a ${fmt(b)}`; }
  if (f.type === "date") return fmt(value);
  if (f.type === "person") return people.find((p) => p.value === value)?.label ?? value;
  if (f.type === "unit") return units.find((u) => u.value === value)?.label ?? value;
  return value;
}

export function RequestForm({ serviceId, serviceName, fields, people, units, draftId: initialDraft, initial = {} }: Props) {
  const [values, setValues] = useState<Record<string, string>>(initial);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showErrors, setShowErrors] = useState(false);
  const [draftId, setDraftId] = useState(initialDraft);
  const [dirty, setDirty] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const [busy, setBusy] = useState(false);
  const [sendError, setSendError] = useState("");
  const [sent, setSent] = useState<{ id: string; number: number; next?: { step: string; who?: string } } | null>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const dataFields = fields.filter((f) => f.section !== "anexos");
  const fileFields = fields.filter((f) => f.section === "anexos");
  const useSteps = fields.length > 6;
  type PageKey = "dados" | "anexos" | "rever";
  const pages: PageKey[] = useSteps ? ["dados", ...(fileFields.length ? (["anexos"] as PageKey[]) : []), "rever"] : ["dados", "rever"];
  const [page, setPage] = useState(0);
  const current = pages[page];
  const pageFields = current === "dados" ? (useSteps ? dataFields : fields) : current === "anexos" ? fileFields : [];

  const errorOf = (f: Field) => {
    const val = values[f.id] ?? "";
    if (f.required && !val.trim()) return v.requiredError(f.label);
    if (f.type === "number" && val && (Number(val) < (f.min ?? -Infinity) || Number(val) > (f.max ?? Infinity))) return v.numberError(f.min ?? 0, f.max ?? 99);
    if (f.type === "daterange" && val) { const [a, b] = val.split("|"); if (!a || !b) return f.required ? v.requiredError(f.label) : undefined; if (b < a) return v.rangeError; }
    return undefined;
  };
  const errors = pageFields.map((f) => ({ f, e: errorOf(f) })).filter((x) => x.e);
  const shown = (f: Field) => (showErrors || touched[f.id] ? errorOf(f) : undefined);

  const set = (id: string, value: string) => { setValues((x) => ({ ...x, [id]: value })); setDirty(true); };
  const blur = (id: string) => setTouched((x) => ({ ...x, [id]: true }));

  const summary = useMemo(() => fields.slice(0, 2).map((f) => display(f, values[f.id] ?? "", people, units)).filter(Boolean).join(" · ").slice(0, 120) || serviceName, [fields, values, people, units, serviceName]);
  const answers = useMemo(() => Object.fromEntries(fields.map((f) => [f.id, display(f, values[f.id] ?? "", people, units)])), [fields, values, people, units]);

  const save = async (send: boolean) => {
    const res = await postService<{ id: string; number: number; next?: { step: string; who?: string } }>({ action: "request.save", serviceId, answers, summary, draftId, send });
    setDraftId(res.id);
    setDirty(false);
    setSavedAt(Date.now());
    return res;
  };

  /* Gravação automática do rascunho a cada 10 s */
  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(tick);
  }, []);
  useEffect(() => {
    if (!dirty || sent) return;
    const timer = setTimeout(() => { save(false).catch(() => {}); }, 10000);
    return () => clearTimeout(timer);
  }); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const onLeave = (e: BeforeUnloadEvent) => { if (dirty && !sent) { e.preventDefault(); e.returnValue = v.leaveConfirm; } };
    window.addEventListener("beforeunload", onLeave);
    return () => window.removeEventListener("beforeunload", onLeave);
  }, [dirty, sent]);

  const goNext = () => {
    if (errors.length) {
      setShowErrors(true);
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    setShowErrors(false);
    setPage((p) => p + 1);
    requestAnimationFrame(() => headingRef.current?.focus());
  };

  const send = async () => {
    setBusy(true);
    setSendError("");
    try {
      setSent(await save(true));
    } catch (e) {
      setSendError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  if (sent) {
    const who = people.find((p) => p.value === sent.next?.who)?.label;
    return (
      <section className="card flex flex-col items-start gap-3" aria-labelledby="enviado" role="status">
        <CircleCheck size={32} aria-hidden className="text-brand" />
        <h2 id="enviado" className="text-section font-bold">{v.sentTitle}</h2>
        <p className="text-ui">{v.sentLead(sent.number)}</p>
        {sent.next && who && <p className="text-body">{v.nextStep(sent.next.step, who)}</p>}
        <div className="mt-2 flex flex-wrap gap-2">
          <ButtonLink variant="pri" href={`/servicos?pedido=${sent.id}`}>{v.seeMine}</ButtonLink>
          <ButtonLink href="/servicos">{v.another}</ButtonLink>
        </div>
      </section>
    );
  }

  const render = (f: Field) => {
    const common = { label: f.label, hint: f.hint, error: shown(f), required: f.required };
    const val = values[f.id] ?? "";
    const id = `campo-${f.id}`;
    switch (f.type) {
      case "text": return <TextField key={f.id} id={id} {...common} value={val} onChange={(e) => set(f.id, e.target.value)} onBlur={() => blur(f.id)} />;
      case "number": return <TextField key={f.id} id={id} {...common} type="number" inputMode="numeric" min={f.min} max={f.max} value={val} onChange={(e) => set(f.id, e.target.value)} onBlur={() => blur(f.id)} />;
      case "date": return <DateField key={f.id} id={id} {...common} value={val} min="2026-11-01" onChange={(e) => set(f.id, e.target.value)} onBlur={() => blur(f.id)} />;
      case "textarea": return <TextArea key={f.id} id={id} {...common} value={val} onChange={(e) => set(f.id, e.target.value)} onBlur={() => blur(f.id)} />;
      case "select": return <SelectField key={f.id} id={id} {...common} value={val} onChange={(e) => { set(f.id, e.target.value); blur(f.id); }} options={[{ value: "", label: v.none }, ...(f.options ?? []).map((o) => ({ value: o, label: o }))]} />;
      case "unit": return <SelectField key={f.id} id={id} {...common} value={val} onChange={(e) => { set(f.id, e.target.value); blur(f.id); }} options={[{ value: "", label: v.chooseUnit }, ...units]} />;
      case "daterange": { const [a = "", b = ""] = val.split("|"); return <DateRangeField key={f.id} id={id} label={f.label} hint={f.hint} required={f.required} error={shown(f)} start={a} end={b} onStart={(x) => set(f.id, `${x}|${b}`)} onEnd={(x) => { set(f.id, `${a}|${x}`); blur(f.id); }} />; }
      case "person": return <PersonPicker key={f.id} id={id} {...common} people={people} value={val || undefined} onChange={(x) => { set(f.id, x ?? ""); blur(f.id); }} />;
      case "file": return <FileUpload key={f.id} id={id} {...common} onFiles={(names) => { if (names.join(", ") !== val) set(f.id, names.join(", ")); }} />;
      case "radio":
      case "yesno":
      case "checks": {
        const opts = f.type === "yesno" ? [v.yes, v.no] : f.options ?? [];
        const chosen = val.split(", ").filter(Boolean);
        return (
          <fieldset key={f.id} className="field" style={{ border: 0, padding: 0, margin: 0 }} aria-describedby={shown(f) ? `${id}-err` : undefined}>
            <legend className="field-label" style={{ padding: 0, marginBottom: 6 }}>{f.label}{f.required && <span className="field-req" aria-hidden>*</span>}</legend>
            <div className={f.type === "checks" ? "grid gap-1 sm:grid-cols-2" : "flex flex-wrap gap-x-6 gap-y-1"}>
              {opts.map((o, i) => f.type === "checks"
                ? <Checkbox key={o} id={i === 0 ? id : undefined} checked={chosen.includes(o)} onChange={(e) => { set(f.id, (e.target.checked ? [...chosen, o] : chosen.filter((x) => x !== o)).join(", ")); blur(f.id); }}>{o}</Checkbox>
                : <Radio key={o} id={i === 0 ? id : undefined} name={f.id} checked={val === o} onChange={() => { set(f.id, o); blur(f.id); }}>{o}</Radio>)}
            </div>
            {shown(f) && <span id={`${id}-err`} className="field-err"><CircleAlert size={14} aria-hidden />{shown(f)}</span>}
          </fieldset>
        );
      }
    }
  };

  const status = savedAt ? v.savedAgo(Math.round((now - savedAt) / 1000)) : dirty ? v.unsaved : "";

  return (
    <div className="flex flex-col gap-6">
      {useSteps && (
        <ol aria-label={v.stepsLabel} className="flex flex-wrap gap-x-6 gap-y-2 text-body">
          {pages.map((p, i) => (
            <li key={p} aria-current={i === page ? "step" : undefined} className={`flex items-center gap-2 ${i === page ? "font-semibold text-ink" : i < page ? "text-copy" : "text-subtle"}`}>
              <span className={`grid h-6 w-6 place-items-center rounded-full text-caption font-bold ${i <= page ? "bg-[var(--ds-brand-background-default)] text-[var(--ds-brand-content)]" : "border border-line-strong"}`}>{i + 1}</span>
              {v.stepNames[p]}
            </li>
          ))}
        </ol>
      )}
      <section className="card flex flex-col gap-5" aria-labelledby="passo-titulo">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="passo-titulo" ref={headingRef} tabIndex={-1} className="text-block font-semibold outline-none">{useSteps ? `${v.step(page + 1, pages.length)} · ${v.stepNames[current]}` : current === "rever" ? v.stepNames.rever : v.stepNames.dados}</h2>
          <span className="text-caption text-subtle" aria-live="polite">{status}</span>
        </div>
        {showErrors && errors.length > 0 && (
          <div ref={summaryRef} tabIndex={-1} className="alert alert-err outline-none" role="alert">
            <CircleAlert size={20} aria-hidden />
            <div>
              <b>{v.errorsTitle(errors.length)}</b>
              <ul className="mt-1 list-disc pl-5">{errors.map(({ f, e }) => <li key={f.id}><a className="underline" href={`#campo-${f.id}`} onClick={(ev) => { ev.preventDefault(); document.getElementById(`campo-${f.id}`)?.focus(); }}>{e}</a></li>)}</ul>
            </div>
          </div>
        )}
        {current !== "rever" ? (
          <>
            <p className="field-hint">{v.required}</p>
            <div className="flex max-w-[640px] flex-col gap-5">{pageFields.map(render)}</div>
          </>
        ) : (
          <dl className="flex flex-col divide-y divide-[var(--ds-border-subtle)]">
            {fields.map((f) => (
              <div key={f.id} className="flex flex-wrap items-baseline justify-between gap-2 py-3">
                <div className="min-w-0">
                  <dt className="text-label font-semibold text-ink">{f.label}</dt>
                  <dd className="text-ui">{display(f, values[f.id] ?? "", people, units) || <span className="text-subtle">{v.none}</span>}</dd>
                </div>
                <button type="button" className="link text-label" onClick={() => setPage(useSteps && f.section === "anexos" ? 1 : 0)} aria-label={`${v.change}: ${f.label}`}>{v.change}</button>
              </div>
            ))}
          </dl>
        )}
        {sendError && <div className="alert alert-err" role="alert"><CircleAlert size={20} aria-hidden /><div>{sendError}</div></div>}
      </section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {page > 0 && <Button variant="gh" onClick={() => setPage((p) => p - 1)}>{v.back}</Button>}
          <Button variant="sec" onClick={async () => { try { await save(false); } catch (e) { setSendError((e as Error).message); } }}>{v.saveDraft}</Button>
        </div>
        {current === "rever" ? <Button variant="pri" loading={busy} onClick={send}>{v.send}</Button> : <Button variant="pri" onClick={goNext}>{v.next}</Button>}
      </div>
      <Link href="/servicos" className="sr-only">{t.common.back}</Link>
    </div>
  );
}
