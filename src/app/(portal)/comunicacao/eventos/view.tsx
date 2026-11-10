"use client";

import { downloadIcs } from "@/features/shell/client-api";
import { CalendarPlus, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Button, ButtonLink, EmptyState, FilterBar, LoadError, PageHeader } from "@/design-system";
import { EventRow } from "@/features/comunicacao/content";
import { ViewSwitch } from "@/features/comunicacao/ViewSwitch";
import { BlockRetry } from "@/features/home/BlockRetry";
import { t } from "@/i18n";
import { listEvents, scopeOptions } from "@/lib/api-comunicacao";
import { withParams } from "@/lib/params";
import { useSession } from "@/lib/client";
import { useQuery } from "@/lib/use-query";

const ev = t.events;
const l = t.lists;


export function EventsView() {
  const s = useSession();
  const f = useQuery();
  const view = f.vista === "calendario" ? "calendario" : "lista";
  let data;
  try { data = listEvents(s, f); } catch { data = null; }
  return (
    <div className="wrap flex flex-col gap-6 py-6 md:py-8">
      <PageHeader crumbs={[{ label: t.news.crumb, href: "/comunicacao/noticias" }, { label: ev.title }]} title={ev.title} description={ev.lead} actions={<Button onClick={() => downloadIcs()} icon={<CalendarPlus size={16} aria-hidden />}>{ev.addCalendar}</Button>} />
      {data && (
        <FilterBar
          leading={<span className="hidden md:inline-flex"><ViewSwitch value={view} /></span>}
          chips={{ key: "etiqueta", options: [{ value: "", label: l.allM }, ...data.tags.map((x) => ({ value: x, label: x }))] }}
          filters={[{ key: "modalidade", label: ev.mode, options: Object.entries(ev.modes).map(([value, label]) => ({ value, label })) }, { key: "quem", label: l.forWhom, options: scopeOptions(s) }]}
          extras={[{ key: "desde", label: l.sinceVisit }]}
        />
      )}
      {!data ? <LoadError what={ev.what}><BlockRetry /></LoadError> : data.total === 0 ? (
        <EmptyState title={ev.noResults}><Link className="link" href="/comunicacao/eventos">{l.clear}</Link></EmptyState>
      ) : (
        <>
          <section aria-label={ev.strip} className="md:hidden">
            <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
              {data.strip.map((d) => {
                const inner = <><span className="text-caption">{d.weekday}</span><span className="text-block font-semibold">{d.day}</span><span className={`h-1.5 w-1.5 rounded-full ${d.event ? "" : "invisible"}`} style={{ background: "var(--ds-brand-background-default)" }} /></>;
                const cls = `flex min-h-16 w-12 flex-none flex-col items-center justify-center gap-0.5 rounded-[12px] ${d.iso === "2026-11-09" ? "on-brand" : "bg-surface text-ink"} ${d.holiday ? "outline outline-1 outline-[var(--ds-accent-gold)]" : ""}`;
                return <li key={d.iso}>{d.event ? <Link href={`/comunicacao/eventos/${d.event.slug}`} className={`${cls} no-underline`} aria-label={`${d.day}: ${d.event.title}`}>{inner}</Link> : <span className={cls} aria-label={d.holiday ? `${d.day}: ${ev.holiday}` : undefined}>{inner}</span>}</li>;
              })}
            </ul>
          </section>
          {view === "calendario" ? (
            <section aria-label={ev.calendar} className="hidden md:block">
              <div className="mb-3 flex items-center gap-2">
                <ButtonLink size="sm" variant="gh" href={withParams("/comunicacao/eventos", f, { mes: data.calendar.prev })} aria-label={ev.prevMonth}><ChevronLeft size={18} aria-hidden /></ButtonLink>
                <h2 className="min-w-48 text-center text-block font-semibold">{data.calendar.label}</h2>
                <ButtonLink size="sm" variant="gh" href={withParams("/comunicacao/eventos", f, { mes: data.calendar.next })} aria-label={ev.nextMonth}><ChevronRight size={18} aria-hidden /></ButtonLink>
              </div>
              <div className="cal" role="grid" aria-label={data.calendar.label}>
                {ev.weekdays.map((w) => <div key={w} role="columnheader" className="bg-surface-2 px-2 py-1.5 text-label font-semibold text-subtle">{w}</div>)}
                {data.calendar.cells.map((c) => (
                  <div key={c.iso} role="gridcell" className="cal-day" data-out={!c.inMonth} data-today={c.today}>
                    <span className="cal-num">{c.day}</span>
                    {c.holiday && <span className="block text-caption font-medium" style={{ color: "var(--ds-color-gold-700)" }}>{ev.holiday}</span>}
                    {c.events.map((e) => <Link key={e.id} href={`/comunicacao/eventos/${e.slug}`} className="cal-ev">{e.title}</Link>)}
                  </div>
                ))}
              </div>
            </section>
          ) : null}
          <div className={view === "calendario" ? "md:hidden" : ""}>
            {data.running.length > 0 && (
              <section aria-labelledby="a-decorrer" className="mb-8">
                <h2 id="a-decorrer" className="text-block font-semibold">{ev.running}</h2>
                <ul className="divide-y divide-[var(--ds-border-default)]">{data.running.map((e) => <li key={e.id}><EventRow e={e} /></li>)}</ul>
              </section>
            )}
            {data.months.map((m) => (
              <section key={m.key} aria-labelledby={`mes-${m.key}`} className="mb-8">
                <h2 id={`mes-${m.key}`} className="text-block font-semibold">{m.label}</h2>
                <ul className="divide-y divide-[var(--ds-border-default)]">{m.items.map((e) => <li key={e.id}><EventRow e={e} /></li>)}</ul>
              </section>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
