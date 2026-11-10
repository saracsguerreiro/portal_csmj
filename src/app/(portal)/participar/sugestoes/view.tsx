"use client";

import { Lightbulb } from "lucide-react";
import { useState } from "react";
import { Button, Checkbox, EmptyState, FileUpload, LoadError, PageHeader, SelectField, StatusBadge, TextArea, useToast } from "@/design-system";
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
    <div className="wrap flex flex-col gap-6 py-6 md:py-8">
      <PageHeader title={g.title} description={g.lead} />
      <div className="grid gap-6 lg:grid-cols-12">
        <form noValidate onSubmit={send} className="card flex flex-col gap-4 lg:col-span-7">
          <SelectField label={g.theme} value={theme} onChange={(e) => setTheme(e.target.value)} options={suggestionThemes.map((x) => ({ value: x, label: x }))} />
          <TextArea label={g.text} required hint={g.textHint} rows={5} value={text} error={error} onChange={(e) => { setText(e.target.value); setError(""); }} />
          <div><Checkbox checked={anon} onChange={(e) => setAnon(e.target.checked)}>{g.anonymous}</Checkbox><p className="field-hint mt-1 pl-[30px]">{g.anonymousHint}</p></div>
          <FileUpload label={g.attach} />
          <span><Button type="submit" variant="pri" loading={busy}>{g.send}</Button></span>
        </form>
        <section aria-labelledby="implementadas" className="flex flex-col gap-3 lg:col-span-5">
          <h2 id="implementadas" className="text-block font-semibold">{g.implemented}</h2>
          <ul className="flex flex-col gap-3">{data?.implemented.map((x) => <li key={x.title} className="flex gap-3 rounded-[16px] border border-[var(--ds-border-card)] p-4"><Lightbulb size={20} aria-hidden className="mt-0.5 flex-none text-brand" /><span><b className="block font-semibold text-ink">{x.title}</b><span className="text-label">{x.detail}</span></span></li>)}</ul>
        </section>
      </div>
      <section aria-labelledby="minhas" className="card flex flex-col gap-2">
        <h2 id="minhas" className="text-block font-semibold">{g.mine}</h2>
        {!data ? <LoadError what={g.what}><BlockRetry /></LoadError> : data.mine.length === 0 ? <EmptyState plain title={g.noMine} /> : (
          <ul className="divide-y divide-[var(--ds-border-subtle)]">
            {data.mine.map((x) => (
              <li key={x.id} className="flex flex-col gap-2 py-3">
                <p className="flex flex-wrap items-center gap-2 text-caption text-subtle"><StatusBadge tone={tone[x.status]}>{x.status}</StatusBadge><span>{x.theme} · {x.atLabel}</span>{x.anonymous && <span>{g.anonymousTag}</span>}</p>
                <p className="text-ui text-ink">{x.text}</p>
                {x.answer && <p className="rounded-[12px] bg-surface-2 px-3 py-2 text-body"><b className="font-semibold text-ink">{g.answer}: </b>{x.answer}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
