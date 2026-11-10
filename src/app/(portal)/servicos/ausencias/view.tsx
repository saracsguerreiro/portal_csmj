"use client";

import { Avatar, LoadError, PageHeader } from "@/design-system";
import { AbsenceManager } from "@/features/servicos/Absences";
import { BlockRetry } from "@/features/home/BlockRetry";
import { t } from "@/i18n";
import { absencesView } from "@/lib/api-servicos";
import { useSession } from "@/lib/client";
import { useQuery } from "@/lib/use-query";

const a = t.absencesPage;


export function AbsencesView() {
  const s = useSession();
  let data;
  try { data = absencesView(s); } catch { data = null; }
  return (
    <div className="wrap flex flex-col gap-6 py-6 md:py-8">
      <PageHeader crumbs={[{ label: t.services.title, href: "/servicos" }, { label: a.title }]} title={a.title} description={a.lead} />
      {!data ? <LoadError what={a.what}><BlockRetry /></LoadError> : (
        <>
          <AbsenceManager mine={data.mine} people={data.people} />
          {data.isChief && data.teamRows.length > 0 && (
            <section aria-labelledby="equipa" className="card flex flex-col gap-3">
              <h2 id="equipa" className="text-block font-semibold">{a.team} · {data.monthLabel}</h2>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[860px] table-fixed border-collapse text-caption">
                  <caption className="sr-only">{a.team}</caption>
                  <colgroup><col style={{ width: 180 }} />{data.days.map((d) => <col key={d.iso} />)}</colgroup>
                  <thead>
                    <tr>
                      <th scope="col" className="p-1 text-left text-label font-semibold text-subtle">Pessoa</th>
                      {data.days.map((d) => <th key={d.iso} scope="col" className={`p-0.5 text-center font-semibold ${d.today ? "text-brand" : d.weekend || d.holiday ? "text-subtle" : "text-copy"}`} aria-label={`${d.day}${d.holiday ? `, ${t.events.holiday}` : ""}`}>{d.day}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {data.teamRows.map((row) => (
                      <tr key={row.person.id} className="border-t border-line">
                        <th scope="row" className="py-2 pr-2 text-left"><span className="flex items-center gap-2"><Avatar initials={row.person.initials} size="sm" /><span className="truncate text-label font-semibold text-ink">{row.person.name}</span></span></th>
                        {data.days.map((d) => {
                          const span = row.spans.find((x) => d.day >= x.from && d.day <= x.to);
                          return <td key={d.iso} className={`h-10 p-0 ${d.weekend || d.holiday ? "bg-surface-2" : ""}`}>{span && <span role={d.day === span.from ? "img" : undefined} title={`${row.person.name} · ${a.substitute}: ${span.substitute}`} aria-label={d.day === span.from ? `${row.person.name} ausente de ${span.from} a ${span.to}, ${a.substitute.toLowerCase()} ${span.substitute}` : undefined} className={`block h-6 ${d.day === span.from ? "ml-0.5 rounded-l-full" : ""} ${d.day === span.to ? "mr-0.5 rounded-r-full" : ""}`} style={{ background: "var(--ds-brand-background-default)" }} />}</td>;
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
