"use client";

import Link from "next/link";
import { ButtonLink } from "@/design-system";
import { UnitControl } from "@/features/shell/AccountMenu";
import { t } from "@/i18n";
import { getDaySeal, getSinceLastVisit } from "@/lib/api";
import { entity } from "@/config/entity";
import type { Session } from "@/lib/session";
import { TodayBox, TodayMotion } from "./TodayBox";

const h = t.home;

function greetingFor() {
  const hour = Number(new Intl.DateTimeFormat("en-GB", { hour: "2-digit", hour12: false, timeZone: entity.timeZone }).format(new Date()));
  if (hour >= 5 && hour < 12) return h.greeting.morning;
  if (hour >= 12 && hour < 19) return h.greeting.afternoon;
  return h.greeting.evening;
}

export function TodayBlock({ session }: { session: Session }) {
  const since = getSinceLastVisit(session);
  const seal = getDaySeal();
  const first = session.person.name.split(" ")[0];
  const chips = [
    { n: since.news, label: h.since.news(since.news), href: "/comunicacao/noticias?desde=ultima-visita" },
    { n: since.documents, label: h.since.documents(since.documents), href: "/documentos?desde=ultima-visita" },
    { n: since.events, label: h.since.events(since.events), href: "/comunicacao/eventos?desde=ultima-visita" },
  ].filter((c) => c.n > 0);

  return (
    <TodayMotion>
      <section aria-labelledby="hoje-titulo" className="card flex flex-col justify-between gap-4 md:col-span-8 md:!p-8">
        <div className="hoje-1 flex flex-wrap items-center justify-between gap-x-4">
          <h1 id="hoje-titulo" suppressHydrationWarning className="text-page font-semibold tracking-[-0.02em] md:text-display">{greetingFor()}, {first}.</h1>
          <div className="flex items-center gap-3">
            <UnitControl quiet />
            {session.can("portal.build") && <ButtonLink size="sm" variant="gh" href="/painel/paginas/inicio/editar">{h.editPage}</ButtonLink>}
          </div>
        </div>
        <div className="hoje-2"><TodayBox /></div>
        {chips.length > 0 && (
          <div className="hoje-3 flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="text-body">{h.sinceLabel}</span>
            <ul className="flex flex-wrap gap-2">{chips.map((c) => <li key={c.href}><Link href={c.href} className="chip">{c.label}</Link></li>)}</ul>
          </div>
        )}
      </section>
      <aside aria-label={h.seal.region} className="hoje-seal on-brand relative flex items-center justify-between gap-4 overflow-hidden rounded-[24px] p-4 md:col-span-4 md:flex-col md:items-start md:p-8">
        <span aria-hidden className="pattern-brand absolute right-0 top-0 hidden h-[192px] w-[192px] md:block" />
        <p className="relative flex items-center gap-3 md:flex-col md:items-start md:gap-1">
          <span className="text-page font-semibold tracking-[-0.02em] tabular-nums md:text-[96px] md:leading-[88px]">{seal.day}</span>
          <span className="text-body md:text-ui">{seal.month}<span className="block">{seal.weekday}</span></span>
        </p>
        {seal.milestone && (
          <p className="relative max-w-[22ch] text-right text-label md:max-w-none md:text-left md:text-body">
            <b className="font-semibold">{seal.milestone.today ? h.seal.today : `${seal.milestone.weekday.charAt(0).toUpperCase()}${seal.milestone.weekday.slice(1)} ${h.seal.holidayIn.toLowerCase()}`}:</b> {seal.milestone.name}
          </p>
        )}
        <span className="hoje-filete filete absolute inset-x-0 bottom-0" />
      </aside>
    </TodayMotion>
  );
}
