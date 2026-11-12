"use client";

import { downloadIcs } from "@/features/shell/client-api";
import { CalendarPlus, ChevronLeft, ChevronRight, X } from "lucide-react";
import Link from "next/link";
import { Button, EmptyState, FilterBar, LoadError, PageHeader } from "@/design-system";
import { EventRow } from "@/features/comunicacao/content";
import { BlockRetry } from "@/features/home/BlockRetry";
import { t } from "@/i18n";
import { listEvents, scopeOptions } from "@/lib/api-comunicacao";
import { dateLong } from "@/lib/format";
import { withParams } from "@/lib/params";
import { useSession } from "@/lib/client";
import { useQuery } from "@/lib/use-query";

const ev = t.events;
const l = t.lists;
const BASE = "/comunicacao/eventos";

/** Eventos: calendário do mês à esquerda (dias com eventos assinalados) e a lista à direita. */
export function EventsView() {
  const s = useSession();
  const f = useQuery();
  let data;
  try { data = listEvents(s, f); } catch { data = null; }
  const day = f.dia && /^\d{4}-\d{2}-\d{2}$/.test(f.dia) ? f.dia : undefined;
  const dayEvents = day && data ? data.calendar.cells.find((c) => c.iso === day)?.events ?? [] : [];
  const dayLabel = day ? dateLong(`${day}T12:00:00+01:00`).replace(/ de \d{4}$/, "") : "";

  return (
    <div className="wrap flex flex-col gap-6 py-6 md:py-8">
      <PageHeader crumbs={[{ label: t.news.crumb, href: "/comunicacao/noticias" }, { label: ev.title }]} title={ev.title} description={ev.lead} actions={<Button onClick={() => downloadIcs()} icon={<CalendarPlus size={16} aria-hidden />}>{ev.addCalendar}</Button>} />
      {data && (
        <FilterBar
          chips={{ key: "etiqueta", options: [{ value: "", label: l.allM }, ...data.tags.map((x) => ({ value: x, label: x }))] }}
          filters={[{ key: "modalidade", label: ev.mode, options: Object.entries(ev.modes).map(([value, label]) => ({ value, label })) }, { key: "quem", label: l.forWhom, options: scopeOptions(s) }]}
          extras={[{ key: "desde", label: l.sinceVisit }]}
        />
      )}
      {!data ? <LoadError what={ev.what}><BlockRetry /></LoadError> : (
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(320px,420px)_minmax(0,1fr)] lg:gap-10">
          <section aria-labelledby="cal-mes" className="border border-line p-4 md:p-5 lg:sticky lg:top-4">
            <div className="mb-4 flex items-center justify-between gap-2">
              <Link href={withParams(BASE, f, { mes: data.calendar.prev, dia: undefined })} className="icbtn" aria-label={ev.prevMonth}><ChevronLeft size={20} aria-hidden /></Link>
              <h2 id="cal-mes" className="text-block font-semibold" aria-live="polite">{data.calendar.label}</h2>
              <Link href={withParams(BASE, f, { mes: data.calendar.next, dia: undefined })} className="icbtn" aria-label={ev.nextMonth}><ChevronRight size={20} aria-hidden /></Link>
            </div>
            <table className="mini-cal w-full" aria-labelledby="cal-mes">
              <thead><tr>{ev.weekdays.map((w) => <th key={w} scope="col" className="pb-2 text-center text-caption font-semibold text-subtle"><abbr title={w} className="no-underline">{w.slice(0, 3)}</abbr></th>)}</tr></thead>
              <tbody>
                {Array.from({ length: data.calendar.cells.length / 7 }, (_, r) => (
                  <tr key={r}>
                    {data!.calendar.cells.slice(r * 7, r * 7 + 7).map((c) => {
                      const n = c.events.length;
                      const label = `${c.day}${c.holiday ? `, ${ev.holiday}: ${c.holiday}` : ""}${n ? `, ${ev.eventsCount(n)}` : ""}`;
                      const inner = (
                        <>
                          <span className="mini-num">{c.day}</span>
                          <span className="mini-marks" aria-hidden>{c.events.slice(0, 3).map((e) => <span key={e.id} className="mini-mark" />)}</span>
                        </>
                      );
                      return (
                        <td key={c.iso} className="p-0.5" data-out={!c.inMonth}>
                          {n ? (
                            <Link href={withParams(BASE, f, { dia: day === c.iso ? undefined : c.iso })} scroll={false} className="mini-day has-ev" data-today={c.today} data-holiday={!!c.holiday} aria-current={day === c.iso ? "true" : undefined} aria-label={label}>{inner}</Link>
                          ) : (
                            <span className="mini-day" data-today={c.today} data-holiday={!!c.holiday} aria-label={label} title={c.holiday}>{inner}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
            <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t border-line pt-4 text-caption text-subtle">
              <li className="flex items-center gap-2"><span className="mini-mark" aria-hidden />{ev.legendEvent}</li>
              <li className="flex items-center gap-2"><span className="inline-grid h-5 w-5 place-items-center bg-[var(--ds-color-brand-700)] text-[11px] font-semibold text-white" aria-hidden>9</span>{ev.legendToday}</li>
              <li className="flex items-center gap-2"><span className="h-5 w-5 border-b-2 border-[var(--ds-accent-gold)] bg-surface-2" aria-hidden />{ev.holiday}</li>
            </ul>
          </section>

          <div className="min-w-0">
            {day ? (
              <section aria-labelledby="dia-sel">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-[var(--ds-content-strong)] pb-3">
                  <h2 id="dia-sel" className="panel-title">{ev.onDay(dayLabel)}</h2>
                  <Link href={withParams(BASE, f, { dia: undefined })} scroll={false} className="btn btn-sec btn-sm" ><X size={14} aria-hidden />{ev.allEvents}</Link>
                </div>
                {dayEvents.length ? <ul className="divide-y divide-[var(--ds-border-default)]">{dayEvents.map((e) => <li key={e.id}><EventRow e={e} /></li>)}</ul> : <p className="py-6 text-ui text-subtle">{ev.noResults}</p>}
              </section>
            ) : data.total === 0 ? (
              <EmptyState title={ev.noResults}><Link className="link" href={BASE}>{l.clear}</Link></EmptyState>
            ) : (
              <>
                {data.running.length > 0 && (
                  <section aria-labelledby="a-decorrer" className="mb-10">
                    <h2 id="a-decorrer" className="panel-title border-b-2 border-[var(--ds-content-strong)] pb-3">{ev.running}</h2>
                    <ul className="divide-y divide-[var(--ds-border-default)]">{data.running.map((e) => <li key={e.id}><EventRow e={e} /></li>)}</ul>
                  </section>
                )}
                {data.months.map((m) => (
                  <section key={m.key} aria-labelledby={`mes-${m.key}`} className="mb-10">
                    <h2 id={`mes-${m.key}`} className="panel-title border-b-2 border-[var(--ds-content-strong)] pb-3">{m.label}</h2>
                    <ul className="divide-y divide-[var(--ds-border-default)]">{m.items.map((e) => <li key={e.id}><EventRow e={e} /></li>)}</ul>
                  </section>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
