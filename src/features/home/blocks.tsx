"use client";

import { ArrowUpRight, CalendarDays, Clock, Cake, CloudOff, FileSpreadsheet, FileText, MapPin, MonitorPlay, Shuffle, UserPlus } from "lucide-react";
import Link from "next/link";
import { DateMark, ScopeTag, Skeleton, StatusBadge } from "@/design-system";
import { t } from "@/i18n";
import { getAgenda, getHighlights, getNewDocuments, getPeopleBlock, getShortcuts, getTasks } from "@/lib/api";
import type { Session } from "@/lib/session";
import { useLoad } from "@/lib/client";
import { BlockRetry } from "./BlockRetry";
import { NeedsYou } from "./NeedsYou";
import { NewsCover } from "@/features/comunicacao/content";
import { personPhotoOf } from "@/data/photos";
import { QuickAccess } from "./QuickAccess";

const h = t.home;

function BlockTitle({ title, href, link }: { title: string; href: string; link: string }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-4">
      <h2 className="panel-title">{title}</h2>
      <Link href={href} className="sq-arrow" aria-label={link} title={link}><ArrowUpRight size={22} strokeWidth={1.75} aria-hidden /></Link>
    </div>
  );
}

function BlockError() {
  return (
    <div className="block-err" role="alert">
      <CloudOff size={20} aria-hidden className="flex-none" />
      <p>{h.blockError} <BlockRetry /></p>
    </div>
  );
}

export function NeedsYouBlock({ session }: { session: Session }) {
  const r = useLoad(() => getTasks(session), [session]);
  if (!r.ready) return <NeedsSkeleton />;
  if (r.error || !r.data) return <BlockError />;
  const { items, total } = r.data;
  return <NeedsYou key={`${session.person.id}-${session.unit.id}`} items={items} total={total} />;
}

export function QuickAccessBlock({ session }: { session: Session }) {
  const { all, pinned } = getShortcuts(session);
  return <QuickAccess key={session.person.id} all={all} pinned={pinned} />;
}

export function HighlightsBlock({ session }: { session: Session }) {
  const r = useLoad(() => getHighlights(session), [session]);
  if (!r.ready) return <HighlightsSkeleton />;
  const items = r.data ?? [];
  if (items.length === 0) return null;
  const [main, ...rest] = items;
  return (
    <section aria-labelledby="destaques">
      <div className="mb-3 flex items-baseline justify-between gap-4">
        <h2 id="destaques" className="text-block font-semibold">{h.highlights.title}</h2>
        <Link href="/comunicacao/noticias" className="link-quiet flex-none">{h.highlights.seeAll}</Link>
      </div>
      <div className="@container grid gap-6 md:grid-cols-12">
        <article className="md:col-span-8">
          <Link href={`/comunicacao/noticias/${main.slug}`} className="row-link grid gap-4 @4xl:grid-cols-[3fr_2fr] @4xl:items-end">
            <NewsCover slug={main.slug} src={main.cover} alt={main.coverAlt} className="aspect-video rounded-[16px]" eager />
            <div className="min-w-0">
              <h3 className="row-title text-section font-bold tracking-[-0.01em]">{main.title}</h3>
              <p className="mt-2 max-w-[60ch] text-body">{main.summary}</p>
              <p className="mt-2 flex flex-wrap items-center gap-x-3 text-caption text-subtle"><ScopeTag kind={main.scopeKind}>{main.scopeLabel}</ScopeTag><span>{main.dateLabel}</span></p>
            </div>
          </Link>
        </article>
        {rest.length > 0 && (
          <ul className="flex flex-col divide-y divide-[var(--ds-border-default)] md:col-span-4">
            {rest.map((n) => (
              <li key={n.id} className="py-3 first:pt-0">
                <article>
                  <Link href={`/comunicacao/noticias/${n.slug}`} className="row-link flex gap-3">
                    <img src={n.cover} alt="" width={96} height={72} loading="lazy" className="cover-img h-[72px] w-24 flex-none rounded-lg object-cover md:hidden" />
                    <span className="min-w-0">
                      <h3 className="row-title font-semibold text-ink">{n.title}</h3>
                      <span className="mt-1 flex flex-wrap items-center gap-x-3 text-caption text-subtle"><ScopeTag kind={n.scopeKind}>{n.scopeLabel}</ScopeTag><span>{n.dateLabel}</span></span>
                    </span>
                  </Link>
                </article>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

const modeIcon = { online: MonitorPlay, presencial: MapPin, hibrido: Shuffle } as const;

export function AgendaBlock({ session }: { session: Session }) {
  const r = useLoad(() => getAgenda(session), [session]);
  if (!r.ready) return <ListSkeleton label={h.agenda.title} />;
  const items = r.data;
  if (r.error || !items) {
    return <section aria-label={h.agenda.title}><h2 className="panel-title mb-4">{h.agenda.title}</h2><BlockError /></section>;
  }
  if (items.length === 0) return null;
  const [main, ...rest] = items;
  const MainIcon = modeIcon[main.mode];
  return (
    <section aria-label={h.agenda.title}>
      <BlockTitle title={h.agenda.title} href="/comunicacao/eventos" link={h.agenda.seeAll} />
      <article className="grid gap-5 sm:grid-cols-2 sm:items-center">
        <Link href={`/comunicacao/eventos/${main.slug}`} className="group relative block overflow-hidden bg-surface-2" tabIndex={-1} aria-hidden>
          {main.photo && /* eslint-disable-next-line @next/next/no-img-element */ <img src={main.photo.src} alt="" className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />}
          <span className="absolute left-0 top-0 flex flex-col items-center bg-[var(--ds-color-brand-700)] px-4 py-2.5 text-white">
            <span className="text-[30px] font-semibold leading-8 tabular-nums">{main.day}</span>
            <span className="text-label font-semibold uppercase tracking-[0.06em]">{main.month}</span>
          </span>
        </Link>
        <div className="flex flex-col gap-3">
          <p className="text-label font-semibold uppercase tracking-[0.06em] text-brand">{h.agenda.next}</p>
          <h3 className="text-[22px] font-semibold leading-7 tracking-[-0.01em]"><Link href={`/comunicacao/eventos/${main.slug}`} className="hover:underline">{main.title}</Link></h3>
          <ul className="flex flex-col gap-1.5 text-ui text-copy">
            <li className="flex items-center gap-2"><CalendarDays size={16} aria-hidden className="text-subtle" /><span className="first-letter:uppercase">{main.weekday}</span></li>
            <li className="flex items-center gap-2"><Clock size={16} aria-hidden className="text-subtle" />{main.time}</li>
            <li className="flex items-center gap-2"><MainIcon size={16} aria-hidden className="text-subtle" />{h.agenda[main.mode]}</li>
          </ul>
        </div>
      </article>
      {rest.length > 0 && (
        <ul className="mt-6 flex flex-col divide-y divide-[var(--ds-border-default)] border-t border-[var(--ds-border-default)]">
          {rest.map((e) => {
            const Icon = modeIcon[e.mode];
            return (
              <li key={e.id}>
                <Link href={`/comunicacao/eventos/${e.slug}`} className="row-link flex items-center gap-4 py-3.5">
                  <DateMark day={e.day} month={e.month} />
                  <span className="min-w-0">
                    <span className="row-title block font-semibold text-ink">{e.title}</span>
                    <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-caption text-subtle">
                      <span>{e.time}</span>
                      <span className="scope"><Icon size={14} aria-hidden />{h.agenda[e.mode]}</span>
                      <ScopeTag kind={e.scopeKind}>{e.scopeLabel}</ScopeTag>
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export function DocumentsBlock({ session }: { session: Session }) {
  const r = useLoad(() => getNewDocuments(session), [session]);
  if (!r.ready) return <ListSkeleton label={h.documents.title} rows={5} />;
  const items = r.data ?? [];
  if (items.length === 0) return null;
  return (
    <section aria-label={h.documents.title}>
      <BlockTitle title={h.documents.title} href="/documentos" link={h.documents.seeAll} />
      <ul className="divide-y divide-[var(--ds-border-default)]">
        {items.map((d) => {
          const Icon = d.format === "PDF" ? FileText : FileSpreadsheet;
          return (
            <li key={d.id}>
              <Link href={`/documentos/ficheiro/${d.id}`} className="row-link flex gap-3 py-2.5">
                <Icon size={20} aria-hidden className="mt-0.5 flex-none text-subtle" />
                <span className="min-w-0 flex-1">
                  <span className="row-title block font-medium text-ink">{d.title}</span>
                  <span className="mt-0.5 flex flex-wrap items-center gap-x-3 text-caption text-subtle">
                    <span>{d.isNew ? d.format : `${h.documents.updated} · ${d.format}`} · {d.dateLabel}</span>
                    <ScopeTag kind={d.scopeKind}>{d.scopeLabel}</ScopeTag>
                  </span>
                </span>
                {d.isNew && <span className="flex-none self-start"><StatusBadge tone="brand">{h.documents.isNew}</StatusBadge></span>}
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function PeopleBlock({ session }: { session: Session }) {
  const r = useLoad(() => getPeopleBlock(session), [session]);
  if (!r.ready) return <ListSkeleton label={h.people.title} rows={1} />;
  if (!r.data) return null;
  const { birthdays, newcomers } = r.data;
  if (birthdays.length === 0 && newcomers.length === 0) return null;
  return (
    <section aria-label={h.people.title}>
      <BlockTitle title={h.people.title} href="/pessoas/novos-colegas" link={h.people.seeAll} />
      <div className="grid gap-8 lg:grid-cols-[1fr_1.35fr] lg:gap-10">
        {birthdays.length > 0 && (
          <div className="bday-box">
            <h3 className="flex items-center gap-2 text-[18px] font-semibold text-ink"><Cake size={22} aria-hidden className="text-[var(--ds-accent-gold-strong,#9a7410)]" />{h.people.birthdays}<span className="text-subtle">· {birthdays.length}</span></h3>
            <ul className="mt-2 flex flex-col border-t border-[var(--ds-border-default)]">
              {birthdays.map((p) => (
                <li key={p.id}>
                  <Link href={`/pessoas/${p.slug}`} className={`bday-row group ${p.isToday ? "is-today" : ""}`}>
                    <span className="bday-date" aria-hidden><span className="text-[22px] font-semibold leading-6 tabular-nums">{p.label.split(" ")[0]}</span><span className="text-[11px] font-semibold uppercase tracking-[0.06em]">{p.label.split(" de ")[1]?.slice(0, 3)}</span></span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold text-ink group-hover:underline">{p.name}</span>
                      <span className="block text-caption text-subtle">{p.isToday ? h.people.todayBday : p.label} · {p.unit}</span>
                    </span>
                    {p.isToday && <span className="bday-badge">{h.people.today}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
        {newcomers.length > 0 && (
          <div>
            <h3 className="flex items-center gap-2 text-[18px] font-semibold text-ink"><UserPlus size={22} aria-hidden className="text-brand" />{h.people.newcomers}<span className="text-subtle">· {newcomers.length}</span></h3>
            <ul className="mt-4 grid grid-cols-1 gap-1 sm:grid-cols-3">
              {newcomers.map((p) => (
                <li key={p.id}>
                  <Link href={`/pessoas/${p.slug}`} className="newbie group">
                    <span className="newbie-portrait" aria-hidden>{personPhotoOf(p.id) ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={personPhotoOf(p.id)!} alt="" loading="lazy" className="h-full w-full object-cover" /> : <span>{p.initials}</span>}</span>
                    <span className="flex flex-col gap-0.5 p-4">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-brand">{h.people.welcome}</span>
                      <span className="font-semibold text-ink group-hover:underline">{p.name}</span>
                      <span className="text-caption text-subtle">{p.role}</span>
                      <span className="text-caption text-subtle">{p.unit}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}

/* Esqueletos com a forma do conteúdo */
export function NeedsSkeleton() {
  return (
    <div role="status" aria-label={h.needs.title}>
      <Skeleton className="mb-4 h-6 w-36" />
      {[0, 1, 2].map((i) => <div key={i} className="flex items-center gap-3 border-t border-line py-3"><Skeleton className="h-5 w-5" /><div className="flex-1"><Skeleton className="mb-2 h-4 w-3/4" /><Skeleton className="h-3 w-1/2" /></div><Skeleton className="h-8 w-20 !rounded-full" /></div>)}
    </div>
  );
}

export function HighlightsSkeleton() {
  return (
    <div role="status" aria-label={h.highlights.title} className="grid gap-6 md:grid-cols-12">
      <Skeleton className="aspect-video w-full !rounded-[16px] md:col-span-8" />
      <div className="flex flex-col gap-5 md:col-span-4">{[0, 1, 2].map((i) => <div key={i}><Skeleton className="mb-2 h-4 w-full" /><Skeleton className="mb-2 h-4 w-2/3" /><Skeleton className="h-3 w-1/3" /></div>)}</div>
    </div>
  );
}

export function ListSkeleton({ label, rows = 3 }: { label: string; rows?: number }) {
  return (
    <div role="status" aria-label={label}>
      <Skeleton className="mb-4 h-6 w-28" />
      {Array.from({ length: rows }, (_, i) => <div key={i} className="flex items-center gap-4 border-t border-line py-3"><Skeleton className="h-10 w-12" /><div className="flex-1"><Skeleton className="mb-2 h-4 w-4/5" /><Skeleton className="h-3 w-2/5" /></div></div>)}
    </div>
  );
}
