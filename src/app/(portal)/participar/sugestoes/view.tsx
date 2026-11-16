"use client";

import { Lightbulb } from "lucide-react";
import { useState } from "react";
import { Breadcrumbs, Button, Checkbox, EmptyState, FileUpload, LoadError, SelectField, StatusBadge, TextArea, useToast } from "@/design-system";
import { postAction } from "@/features/shell/client-api";
import { BlockRetry } from "@/features/home/BlockRetry";
import { suggestionThemes } from "@/data/institution";
import { t } from "@/i18n";
import { suggestionsView } from "@/lib/api-participar";
import { useSession } from "@/lib/client";

const g = t.suggestionsPage;
const tone = { Recebida: "neu", "Em análise": "info", Respondida: "ok" } as const;

export function SuggestionsView() {
  const s = useSession();
  const { show } = useToast();
  const [theme, setTheme] = useState(suggestionThemes[0]);
  const [text, setText] = useState("");
  const [anon, setAnon] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  let data;
  try { data = suggestionsView(s); } catch { data = null; }
  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) { setError(g.errText); return; }
    setBusy(true);
    try { await postAction({ action: "suggestion.add", theme, text, anonymous: anon }); setText(""); setAnon(false); show({ message: g.sent }); } catch (err) { setError((err as Error).message); } finally { setBusy(false); }
  };
  return (
    <div className="grid grid-cols-1 gap-[var(--gap)] xl:grid-cols-12">
      <header className="panel flex flex-col gap-2 p-6 md:px-10 md:py-8 xl:col-span-12">
        <Breadcrumbs items={[{ label: "Participar", href: "/participar/enquetes" }, { label: g.title }]} label={t.shell.crumbs} />
        <h1 className="text-page font-bold tracking-[-0.02em]">{g.title}</h1>
        <p className="max-w-[70ch] text-ui text-subtle">{g.lead}</p>
      </header>
      <div className="flex min-w-0 flex-col gap-[var(--gap)] xl:col-span-7">
        <form noValidate onSubmit={send} aria-labelledby="caixa" className="panel flex flex-col gap-5 p-6 md:p-10">
          <h2 id="caixa" className="panel-title">{g.box}</h2>
          <SelectField label={g.theme} value={theme} onChange={(e) => setTheme(e.target.value)} options={suggestionThemes.map((x) => ({ value: x, label: x }))} />
          <TextArea label={g.text} required hint={g.textHint} rows={6} value={text} error={error} onChange={(e) => { setText(e.target.value); setError(""); }} />
          <div><Checkbox checked={anon} onChange={(e) => setAnon(e.target.checked)}>{g.anonymous}</Checkbox><p className="field-hint mt-1 pl-[30px]">{g.anonymousHint}</p></div>
          <FileUpload label={g.attach} />
          <span><Button type="submit" variant="pri" loading={busy}>{g.send}</Button></span>
        </form>
        <section aria-labelledby="minhas" className="panel flex flex-col gap-3 p-6 md:p-10">
          <h2 id="minhas" className="panel-title">{g.mine}</h2>
          {!data ? <LoadError what={g.what}><BlockRetry /></LoadError> : data.mine.length === 0 ? <EmptyState plain title={g.noMine} /> : (
            <ul className="divide-y divide-[var(--ds-border-default)]">
              {data.mine.map((x) => (
                <li key={x.id} className="flex flex-col gap-2 py-4 first:pt-0">
                  <p className="flex flex-wrap items-center gap-2 text-caption text-subtle"><StatusBadge tone={tone[x.status]}>{x.status}</StatusBadge><span>{x.theme} · {x.atLabel}</span>{x.anonymous && <span>{g.anonymousTag}</span>}</p>
                  <p className="text-ui text-ink">{x.text}</p>
                  {x.answer && <p className="bg-surface-2 px-3 py-2 text-body"><b className="font-semibold text-ink">{g.answer}: </b>{x.answer}</p>}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
      <section aria-labelledby="implementadas" className="panel flex min-w-0 flex-col gap-5 p-6 md:p-10 xl:col-span-5">
        <h2 id="implementadas" className="panel-title">{g.implemented}</h2>
        <ul className="flex flex-col divide-y divide-[var(--ds-border-default)]">
          {data?.implemented.map((x) => (
            <li key={x.title} className="flex gap-4 py-5 first:pt-0">
              <span className="grid h-11 w-11 flex-none place-items-center bg-[var(--ds-color-brand-700)] text-white" aria-hidden><Lightbulb size={20} /></span>
              <span><b className="block text-[17px] font-semibold leading-6 text-ink">{x.title}</b><span className="mt-1 block text-ui text-subtle">{x.detail}</span></span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
