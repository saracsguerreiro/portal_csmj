"use client";

import { Activity, CalendarClock, FileText, Images, Megaphone, Newspaper, CalendarDays, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button, ButtonLink, LoadError, Progress, Sheet, useToast } from "@/design-system";
import { BlockRetry } from "@/features/home/BlockRetry";
import { postAdmin } from "@/features/shell/client-api";
import { t } from "@/i18n";
import { getContent, workView, type Kind } from "@/lib/api-painel";
import { useSession } from "@/lib/client";
import { AdminPage, Panel, editHref, kindOfCreate, newHref } from "./parts";

const A = t.admin;
const W = A.work;
const createIcon = { noticia: Newspaper, evento: CalendarDays, aviso: Megaphone, album: Images };
const kindIcon: Record<Kind, typeof FileText> = { noticias: Newspaper, eventos: CalendarDays, avisos: Megaphone };

function greeting() {
  const h = Number(new Intl.DateTimeFormat("pt-PT", { timeZone: "Africa/Luanda", hour: "numeric", hour12: false }).format(new Date()));
  return h >= 5 && h < 12 ? t.home.greeting.morning : h < 19 && h >= 12 ? t.home.greeting.afternoon : t.home.greeting.evening;
}

export function WorkView() {
  const s = useSession();
  const toast = useToast();
  const [missingOf, setMissingOf] = useState<string | null>(null);
  let data: ReturnType<typeof workView> | null;
  try { data = workView(s); } catch { data = null; }
  const first = s.person.name.split(" ")[0];
  const missing = missingOf ? getContent(s, "avisos", missingOf) : null;

  const remind = async (id: string) => {
    try { const r = await postAdmin<{ sent: number }>({ action: "notice.remind", id }); toast.show({ message: A.editor.reminded(r.sent) }); }
    catch (e) { toast.show({ message: (e as Error).message }); }
  };

  return (
    <AdminPage title={`${greeting()}, ${first}`} lead={`${s.profile.label} · ${s.unit.name}`} actions={data?.create.map((c, i) => {
      const Icon = createIcon[c];
      const href = c === "album" ? "/painel/multimedia?novo=1" : newHref(kindOfCreate[c] as Kind);
      return <ButtonLink key={c} href={href} variant={i === 0 ? "pri" : "sec"} icon={<Icon size={18} aria-hidden />}>{W.create[c]}</ButtonLink>;
    })}>
      {!data ? <LoadError what={A.list.what}><BlockRetry /></LoadError> : (
        <>
          <section aria-labelledby="precisa-t" className="flex flex-col gap-3">
            <h2 id="precisa-t" className="text-block font-semibold">{W.needs}</h2>
            {data.cards.length === 0 ? <p className="text-ui text-subtle">{W.allClear}</p> : (
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {data.cards.map((c) => (
                  <li key={c.id}>
                    <Link href={c.href} className="card group flex h-full flex-col gap-2 !p-5 transition-colors hover:border-[var(--ds-border-default)]">
                      <span className="font-mono text-[32px] font-medium leading-none tracking-[-0.02em] text-ink">{c.n}</span>
                      <span className="text-ui text-copy">{W.cards[c.id as keyof typeof W.cards](c.n)}</span>
                      <span className="mt-auto inline-flex items-center gap-1 pt-2 text-ui font-semibold text-brand">{W.actions[c.action as keyof typeof W.actions]}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            {data.showDrafts && (
              <Panel id="rascunhos" title={W.drafts} action={<Link className="link-quiet text-ui" href="/painel/noticias?separador=minhas">{W.seeAll}</Link>}>
                {data.drafts.length === 0 ? <p className="text-ui text-subtle">{W.noDrafts}</p> : (
                  <ul className="divide-y divide-[var(--ds-border-subtle)]">
                    {data.drafts.map((d) => {
                      const Icon = kindIcon[d.kind];
                      return (
                        <li key={d.id} className="flex items-start gap-3 py-3">
                          <Icon size={18} aria-hidden className="mt-0.5 flex-none text-subtle" />
                          <div className="min-w-0 flex-1">
                            <Link className="font-semibold hover:underline" href={editHref(d.kind, d.id)}>{d.title}</Link>
                            {d.returned && <p className="mt-0.5 text-ui text-copy">{A.editor.returnedBanner(d.returned)}</p>}
                          </div>
                          <span className="flex-none text-ui text-subtle">{d.when}</span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </Panel>
            )}

            {data.notices.length > 0 && (
              <Panel id="avisos-curso" title={W.notices} action={<Link className="link-quiet text-ui" href="/painel/avisos">{W.seeAll}</Link>}>
                <ul className="flex flex-col divide-y divide-[var(--ds-border-subtle)]">
                  {data.notices.map((n) => (
                    <li key={n.id} className="flex flex-col gap-2 py-3">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <Link className="font-semibold hover:underline" href={editHref("avisos", n.id)}>{n.title}</Link>
                        <span className="text-ui text-subtle">{W.until(n.until)}</span>
                      </div>
                      <Progress value={n.pct} label={W.confirmed(n.pct)} />
                      {n.missing > 0 && (
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" onClick={() => setMissingOf(n.id)}>{W.whoMissing}</Button>
                          <Button size="sm" variant="gh" onClick={() => remind(n.id)}>{W.remind}</Button>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </Panel>
            )}

            {data.showScheduled && (
              <Panel id="agendado" title={W.scheduled}>
                {data.scheduled.length === 0 ? <p className="text-ui text-subtle">{W.noScheduled}</p> : (
                  <ul className="divide-y divide-[var(--ds-border-subtle)]">
                    {data.scheduled.map((d) => (
                      <li key={d.id} className="flex items-center gap-3 py-3">
                        <CalendarClock size={18} aria-hidden className="flex-none text-subtle" />
                        <Link className="min-w-0 flex-1 font-semibold hover:underline" href={editHref(d.kind, d.id)}>{d.title}</Link>
                        <span className="flex-none font-mono text-ui text-subtle">{d.when}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </Panel>
            )}

            {data.showQuality && (
              <Panel id="qualidade" title={W.quality}>
                <ul className="flex flex-col gap-2 text-ui">
                  <li>{W.noAlt(data.quality.noAlt)}</li>
                  <li>{W.stale(data.quality.stale)}</li>
                  <li>{W.broken(data.quality.broken)}</li>
                </ul>
                <div><ButtonLink size="sm" href="/painel/multimedia" icon={<Sparkles size={16} aria-hidden />}>{W.reviewAi}</ButtonLink></div>
              </Panel>
            )}

            {data.showWeek && (
              <Panel id="semana" title={W.week} action={<Link className="link-quiet text-ui" href="/painel/indicadores">{W.seeMetrics}</Link>}>
                <dl className="grid grid-cols-3 gap-3">
                  {[[data.week.pubs, "publicações"], [data.week.readers, "leitores"], [data.week.noResults, "pesquisas sem resultado"]].map(([v, l]) => (
                    <div key={String(l)} className="flex flex-col gap-1">
                      <dd className="order-1 font-mono text-[28px] font-medium leading-none text-ink">{v}</dd>
                      <dt className="order-2 text-ui text-subtle">{l}</dt>
                    </div>
                  ))}
                </dl>
              </Panel>
            )}

            {data.showHealth && (
              <Panel id="saude" title={W.health} action={<Link className="link-quiet text-ui" href="/painel/sistema/saude">{W.seeAll}</Link>}>
                <p className="flex items-start gap-2 text-ui"><Activity size={18} aria-hidden className="mt-0.5 flex-none text-subtle" />{W.healthAlert}</p>
              </Panel>
            )}
          </div>
        </>
      )}
      <Sheet open={!!missing} onClose={() => setMissingOf(null)} title={missing?.item.title ?? ""} status={missing?.notice && <span className="text-ui text-subtle">{A.editor.progress(missing.notice.confirmed.length, missing.notice.total)}</span>}
        footer={missing && <Button variant="pri" onClick={() => { void remind(missing.item.id); setMissingOf(null); }}>{A.editor.remindNow}</Button>}>
        {missing?.notice && (
          <>
            <h3 className="mb-2 font-semibold">{A.editor.missingTab} ({missing.notice.missing.length})</h3>
            <ul className="divide-y divide-[var(--ds-border-subtle)]">
              {missing.notice.missing.map((p) => <li key={p.id} className="flex justify-between gap-3 py-2.5"><span>{p.name}</span><span className="text-ui text-subtle">{p.unit}</span></li>)}
            </ul>
          </>
        )}
      </Sheet>
    </AdminPage>
  );
}
