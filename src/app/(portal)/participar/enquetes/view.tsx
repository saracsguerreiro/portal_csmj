"use client";

import { Vote } from "lucide-react";
import { useState } from "react";
import { Button, ConfirmDialog, EmptyState, LoadError, PageHeader, Radio, StatusBadge, useToast } from "@/design-system";
import { postAction } from "@/features/shell/client-api";
import { BlockRetry } from "@/features/home/BlockRetry";
import { t } from "@/i18n";
import { pollsView } from "@/lib/api-participar";
import { useSession } from "@/lib/client";

const pl = t.pollsPage;
type PollV = ReturnType<typeof pollsView>["open"][number];

function Results({ p }: { p: PollV }) {
  const max = Math.max(...p.results);
  return (
    <div className="flex flex-col gap-2">
      {p.options.map((o, i) => (
        <div key={o}>
          <div className="flex justify-between gap-3 text-body"><span className={p.results[i] === max ? "font-semibold text-ink" : ""}>{o}{p.voted === o ? " ✓" : ""}</span><b className="tabular-nums text-ink">{p.pct[i]} %</b></div>
          <div className="prog-trk mt-1" role="img" aria-label={`${o}: ${p.pct[i]} %`}><div className="prog-fill" style={{ width: `${p.pct[i]}%`, background: p.results[i] === max ? undefined : "var(--ds-content-subtle)" }} /></div>
        </div>
      ))}
      <p className="text-caption text-subtle">{pl.total(p.total)}</p>
    </div>
  );
}

function OpenPoll({ p }: { p: PollV }) {
  const { show } = useToast();
  const [choice, setChoice] = useState("");
  const [confirm, setConfirm] = useState(false);
  const vote = async () => {
    setConfirm(false);
    try { await postAction({ action: "poll.vote", id: p.key, option: choice }); show({ message: pl.voted }); } catch { show({ message: t.home.needs.failed }); }
  };
  return (
    <article className="card flex flex-col gap-4">
      <div>
        <p className="flex flex-wrap items-center gap-2 text-caption text-subtle"><span>{pl.until(p.closesLabel)}</span><StatusBadge tone="neu">{p.anonymous ? pl.anonymous : pl.nominal}</StatusBadge></p>
        <h2 className="mt-1 text-block font-semibold">{p.question}</h2>
        <p className="text-body">{p.description}</p>
      </div>
      {p.voted ? (
        <>
          <p className="flex items-center gap-2 text-body" role="status"><StatusBadge tone="ok">{pl.voted}</StatusBadge>{pl.youVoted(p.voted)}</p>
          {p.showResults ? <Results p={p} /> : <p className="text-label text-subtle">{pl.resultsLater}</p>}
        </>
      ) : (
        <fieldset>
          <legend className="sr-only">{p.question}</legend>
          <div className="flex flex-col gap-2">{p.options.map((o) => <Radio key={o} name={p.id} checked={choice === o} onChange={() => setChoice(o)}>{o}</Radio>)}</div>
          <Button className="mt-4" variant="pri" disabled={!choice} onClick={() => setConfirm(true)}>{pl.vote}</Button>
        </fieldset>
      )}
      <ConfirmDialog open={confirm} onClose={() => setConfirm(false)} onConfirm={vote} title={pl.confirmTitle} verb={pl.confirmVerb}>{pl.confirmBody(choice)}</ConfirmDialog>
    </article>
  );
}

export function PollsView() {
  const s = useSession();
  let data;
  try { data = pollsView(s); } catch { data = null; }
  return (
    <div className="wrap flex flex-col gap-6 py-6 md:py-8">
      <PageHeader title={pl.title} description={pl.lead} />
      {!data ? <LoadError what={pl.what}><BlockRetry /></LoadError> : (
        <>
          <section aria-labelledby="abertas" className="flex flex-col gap-4">
            <h2 id="abertas" className="text-section font-bold">{pl.open}</h2>
            {data.open.length === 0 ? <EmptyState icon={<Vote size={24} aria-hidden />} title={pl.noOpen} /> : <div className="grid gap-4 lg:grid-cols-2">{data.open.map((p) => <OpenPoll key={p.id} p={p} />)}</div>}
          </section>
          {data.closed.length > 0 && (
            <section aria-labelledby="encerradas" className="flex flex-col gap-4">
              <h2 id="encerradas" className="text-section font-bold">{pl.closed}</h2>
              <div className="grid gap-4 lg:grid-cols-2">{data.closed.map((p) => <article key={p.id} className="card flex flex-col gap-3"><h3 className="text-block font-semibold">{p.question}</h3><Results p={p} /></article>)}</div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
