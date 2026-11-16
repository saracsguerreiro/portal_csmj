"use client";

import { Vote } from "lucide-react";
import { useState } from "react";
import { Breadcrumbs, Button, ConfirmDialog, EmptyState, LoadError, Radio, StatusBadge, useToast } from "@/design-system";
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
    <article className="flex flex-col gap-4 border border-line p-5 md:p-6">
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
    <div className="grid grid-cols-1 gap-[var(--gap)] xl:grid-cols-12">
      <header className="panel flex flex-col gap-2 p-6 md:px-10 md:py-8 xl:col-span-12">
        <Breadcrumbs items={[{ label: "Participar", href: "/participar/enquetes" }, { label: pl.title }]} label={t.shell.crumbs} />
        <h1 className="text-page font-bold tracking-[-0.02em]">{pl.title}</h1>
        <p className="max-w-[70ch] text-ui text-subtle">{pl.lead}</p>
      </header>
      {!data ? <div className="panel p-6 xl:col-span-12"><LoadError what={pl.what}><BlockRetry /></LoadError></div> : (
        <>
          <section aria-labelledby="abertas" className="panel flex min-w-0 flex-col gap-5 p-6 md:p-10 xl:col-span-7">
            <h2 id="abertas" className="panel-title flex items-center gap-2">{pl.open}{data.open.length > 0 && <span className="count">{data.open.length}</span>}</h2>
            {data.open.length === 0 ? <EmptyState plain icon={<Vote size={24} aria-hidden />} title={pl.noOpen} /> : <div className="flex flex-col gap-4">{data.open.map((p) => <OpenPoll key={p.id} p={p} />)}</div>}
          </section>
          <section aria-labelledby="encerradas" className="panel flex min-w-0 flex-col gap-5 p-6 md:p-10 xl:col-span-5">
            <h2 id="encerradas" className="panel-title">{pl.closed}</h2>
            {data.closed.length === 0 ? <p className="text-ui text-subtle">{pl.noClosed}</p> : (
              <div className="flex flex-col divide-y divide-[var(--ds-border-default)]">
                {data.closed.map((p) => (
                  <article key={p.id} className="flex flex-col gap-3 py-5 first:pt-0">
                    <p className="text-caption font-semibold uppercase tracking-[0.06em] text-subtle">{pl.closedOn(p.closesLabel)}</p>
                    <h3 className="text-[17px] font-semibold leading-6 text-ink">{p.question}</h3>
                    <Results p={p} />
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
