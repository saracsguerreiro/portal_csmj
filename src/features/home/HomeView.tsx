"use client";

import { ArrowUpRight, Bookmark, BookmarkCheck, BookOpen, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import Link from "next/link";
import { useContext, useState } from "react";
import { entity } from "@/config/entity";
import { ButtonLink, Skeleton, useToast } from "@/design-system";
import { AgendaBlock, DocumentsBlock, NeedsYouBlock, PeopleBlock, QuickAccessBlock } from "@/features/home/blocks";
import { postAction } from "@/features/shell/client-api";
import { TopRow } from "@/features/shell/Frame";
import { HomeSearchRef } from "@/features/shell/home-search";
import { t } from "@/i18n";
import { getDaySeal, getHighlights, getSinceLastVisit, getWeek } from "@/lib/api";
import { useLoad, useSession } from "@/lib/client";
import type { Session } from "@/lib/session";
import { stateOf } from "@/lib/store";

const h = t.home;
const H = h.panels;

function greetingFor() {
  const hour = Number(new Intl.DateTimeFormat("en-GB", { hour: "2-digit", hour12: false, timeZone: entity.timeZone }).format(new Date()));
  if (hour >= 5 && hour < 12) return h.greeting.morning;
  if (hour >= 12 && hour < 19) return h.greeting.afternoon;
  return h.greeting.evening;
}

function PanelHead({ title, href, label, id }: { title: string; href?: string; label?: string; id: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <h2 id={id} className="panel-title">{title}</h2>
      {href && <Link href={href} className="icbtn flex-none" aria-label={label} title={label}><ArrowUpRight size={20} aria-hidden /></Link>}
    </div>
  );
}

/** Painel principal: saudação, o destaque do momento com a capa grande e o progresso do que a pessoa tem em mãos. */
function Hero({ s }: { s: Session }) {
  const searchRef = useContext(HomeSearchRef);
  const r = useLoad(() => getHighlights(s), [s]);
  const main = r.data?.[0];
  const seal = getDaySeal();
  const since = getSinceLastVisit(s);
  const week = getWeek(s);
  const pct = week.tasks.total ? Math.round((week.tasks.done / week.tasks.total) * 100) : 100;
  const first = s.person.name.split(" ")[0];
  const quote = seal.milestone
    ? `${seal.milestone.today ? h.seal.today : seal.milestone.weekday.charAt(0).toUpperCase() + seal.milestone.weekday.slice(1)}${seal.milestone.today ? "" : " é feriado"}: ${seal.milestone.name}`
    : H.sinceQuote(since.news, since.documents);

  return (
    <section aria-labelledby="hoje-titulo" className="panel flex flex-col gap-8 p-6 md:p-10 xl:col-span-7 xl:row-span-2">
      <TopRow searchRef={searchRef ?? undefined} />
      <div className="flex flex-wrap items-start justify-between gap-4">
        <h1 id="hoje-titulo" suppressHydrationWarning className="text-[40px] font-semibold leading-[44px] tracking-[-0.03em] text-ink md:text-[64px] md:leading-[64px] 2xl:text-[76px] 2xl:leading-[76px]">
          {greetingFor()},<br />{first}
        </h1>
        {s.can("portal.build") && <ButtonLink size="sm" variant="gh" href="/painel/paginas/inicio/editar">{h.editPage}</ButtonLink>}
      </div>
      {!r.ready ? <Skeleton className="aspect-[16/8] w-full !rounded-none" /> : main ? (
        <>
          <div className="grid gap-4 md:grid-cols-[1fr_1.4fr_1.3fr] md:items-start md:gap-6">
            <p className="text-ui text-subtle">{H.now}</p>
            <div className="min-w-0">
              <p className="text-[18px] font-bold uppercase leading-6 tracking-[0.01em] text-ink">{main.title}</p>
              <p className="mt-1 text-ui text-subtle">{main.scopeLabel} · {main.dateLabel}</p>
            </div>
            <p className="flex gap-2 text-ui text-ink"><Quote size={16} aria-hidden className="mt-0.5 flex-none fill-[var(--ds-brand-background-default)] text-[var(--ds-brand-background-default)]" />{quote}</p>
          </div>
          <div className="relative overflow-hidden bg-surface-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={main.cover} alt={main.coverAlt} className="cover-img aspect-[16/8] w-full object-cover" />
            <div className="absolute bottom-0 right-0 flex">
              <Link href={`/comunicacao/noticias/${main.slug}`} className="sq-btn bg-surface text-ink hover:bg-surface-2 max-md:!h-14 max-md:!w-14" aria-label={H.read(main.title)} title={H.readShort}><BookOpen size={26} strokeWidth={1.5} aria-hidden /></Link>
              <Link href="/comunicacao/noticias" className="sq-btn bg-[var(--ds-brand-background-default)] text-[var(--ds-brand-content)] hover:bg-[var(--ds-brand-background-hover)] max-md:!h-14 max-md:!w-14" aria-label={h.highlights.seeAll} title={h.highlights.seeAll}><ArrowUpRight size={26} strokeWidth={1.5} aria-hidden /></Link>
            </div>
          </div>
        </>
      ) : null}
      <div className="mt-auto grid grid-cols-[auto_1fr_auto] items-center gap-6">
        <Link href="/notificacoes" className="text-[16px] text-ink hover:underline">{H.tasksDone(week.tasks.done, week.tasks.total)}</Link>
        <span className="relative h-1 bg-surface-2" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={H.tasksLabel}>
          <span className="absolute inset-y-0 left-0 bg-[var(--ds-brand-background-default)]" style={{ width: `${pct}%` }} />
        </span>
        <span className="font-mono text-[16px] text-subtle">{pct}%</span>
      </div>
    </section>
  );
}

/** Destaques em lombadas: a escolhida abre em capa, as outras ficam estreitas ao lado. */
function Shelf({ s }: { s: Session }) {
  const r = useLoad(() => getHighlights(s), [s]);
  const toast = useToast();
  const [i, setI] = useState(0);
  const [, force] = useState(0);
  const items = r.data ?? [];
  if (!r.ready) return <section className="panel p-6 md:p-10 xl:col-span-5"><Skeleton className="h-[320px] w-full !rounded-none" /></section>;
  if (!items.length) return null;
  const cur = items[i % items.length];
  const saved = stateOf(s.person.id).saved.has(cur.id);
  const toggle = async () => {
    try { await postAction({ action: "saved.toggle", id: cur.id }); force((n) => n + 1); toast.show({ message: saved ? H.unsaved : H.saved }); } catch { toast.show({ message: h.needs.failed }); }
  };
  return (
    <section aria-labelledby="destaques" className="panel flex flex-col gap-6 p-6 md:p-10 xl:col-span-5">
      <PanelHead id="destaques" title={h.highlights.title} href="/comunicacao/noticias" label={h.highlights.seeAll} />
      <div className="flex items-center gap-2">
        <button type="button" className="icbtn flex-none" aria-label={H.prev} onClick={() => setI((x) => (x - 1 + items.length) % items.length)}><ChevronLeft size={20} aria-hidden /></button>
        <ul className="flex h-[240px] min-w-0 flex-1 items-stretch gap-1.5 md:h-[260px]" aria-label={h.highlights.title}>
          {items.map((n, k) => {
            const on = k === i % items.length;
            return (
              <li key={n.id} className={`relative overflow-hidden transition-[flex] duration-300 ${on ? "flex-[5]" : "min-w-[44px] flex-[1]"}`}>
                <button type="button" className="group block h-full w-full text-left" aria-pressed={on} aria-label={n.title} onClick={() => setI(k)}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={n.cover} alt="" className={`h-full w-full object-cover ${on ? "" : "brightness-[0.55] group-hover:brightness-75"}`} />
                  {!on && <span className="absolute inset-0 flex items-start justify-center pt-3"><span className="vtext line-clamp-1 max-h-[90%] overflow-hidden !text-white font-semibold" style={{ transform: "rotate(180deg)" }}>{n.title}</span></span>}
                </button>
              </li>
            );
          })}
        </ul>
        <button type="button" className="icbtn flex-none" aria-label={H.next} onClick={() => setI((x) => (x + 1) % items.length)}><ChevronRight size={20} aria-hidden /></button>
      </div>
      <article className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-[22px] font-semibold leading-7 tracking-[-0.01em]"><Link href={`/comunicacao/noticias/${cur.slug}`} className="hover:underline">{cur.title}</Link></h3>
          <button type="button" className="icbtn flex-none" aria-pressed={saved} aria-label={saved ? H.unsaveLabel(cur.title) : H.saveLabel(cur.title)} onClick={() => void toggle()}>
            {saved ? <BookmarkCheck size={22} aria-hidden className="text-brand" /> : <Bookmark size={22} aria-hidden />}
          </button>
        </div>
        <p className="line-clamp-3 max-w-[60ch] text-[16px] leading-6 text-copy">{cur.summary}</p>
        <p className="text-ui text-subtle">{cur.scopeLabel} · {cur.dateLabel}</p>
      </article>
    </section>
  );
}

/** A semana em barras (hoje em grená) e os avisos confirmados no ano em quadrículas. */
function Week({ s }: { s: Session }) {
  const w = getWeek(s);
  const cells = 50;
  const filled = Math.round((w.noticesPct / 100) * cells);
  return (
    <section aria-labelledby="semana" className="panel flex flex-col gap-6 p-6 md:p-10 xl:col-span-5">
      <PanelHead id="semana" title={H.week} href="/servicos/meus-pedidos" label={H.weekLink} />
      <div className="mt-auto grid grid-cols-1 items-end gap-8 sm:grid-cols-[1fr_auto]">
        <ul className="flex h-[150px] items-end justify-between gap-2" aria-label={H.weekBars}>
          {w.days.map((d) => (
            <li key={d.iso} className="flex h-full flex-1 flex-col items-center justify-end gap-2" title={d.holiday ?? H.dayCount(d.n)}>
              <span className={`text-[11px] font-semibold uppercase tracking-[0.04em] ${d.today ? "text-brand" : "text-subtle"}`}>{d.label}</span>
              <span className={`w-1 ${d.today ? "bg-[var(--ds-brand-background-default)]" : d.holiday || d.weekend ? "bg-[var(--ds-border-default)]" : "bg-[var(--ds-content-strong)]"}`} style={{ height: `${d.holiday ? 8 : Math.max(8, (d.n / w.max) * 110)}px` }} aria-hidden />
              <span className="sr-only">{d.holiday ? `${d.label}: ${d.holiday}` : `${d.label}: ${H.dayCount(d.n)}`}</span>
            </li>
          ))}
        </ul>
        <div className="flex flex-col items-start gap-3 sm:items-end">
          <p className="text-ui text-subtle">{H.noticesPct(w.noticesPct)}</p>
          <div className="grid grid-cols-10 gap-[3px]" role="img" aria-label={H.noticesPct(w.noticesPct)}>
            {Array.from({ length: cells }, (_, k) => {
              const col = k % 10, row = Math.floor(k / 10);
              const order = col * 5 + row;
              return <span key={k} className={`h-[14px] w-[14px] ${order < filled ? "bg-[var(--ds-brand-background-default)]" : "bg-surface-2"}`} />;
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export function HomeView() {
  const s = useSession();
  return (
    <div className="grid grid-cols-1 gap-[var(--gap)] xl:grid-cols-12">
      <Hero s={s} />
      <section aria-label={h.needs.title} className="panel p-6 md:p-10 xl:col-span-5"><NeedsYouBlock session={s} /></section>
      <Week s={s} />
      <section aria-label={h.quick.title} className="panel p-6 md:p-10 xl:col-span-7"><QuickAccessBlock session={s} /></section>
      <Shelf s={s} />
      <div className="panel p-6 md:p-10 xl:col-span-5"><AgendaBlock session={s} /></div>
      <div className="panel p-6 md:p-10 xl:col-span-7"><DocumentsBlock session={s} /></div>
      <div className="panel p-6 md:p-10 xl:col-span-12"><PeopleBlock session={s} /></div>
    </div>
  );
}
