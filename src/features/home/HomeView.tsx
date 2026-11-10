"use client";

import { ArrowUpRight, Bookmark, BookmarkCheck, BookOpen, Pause, Play, Quote } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { entity } from "@/config/entity";
import { ButtonLink, Skeleton, useToast } from "@/design-system";
import { AgendaBlock, DocumentsBlock, NeedsYouBlock, PeopleBlock, QuickAccessBlock } from "@/features/home/blocks";
import { postAction } from "@/features/shell/client-api";
import { t } from "@/i18n";
import { getDaySeal, getHomeNews, getSinceLastVisit, getWeek } from "@/lib/api";
import { useLoad, useSession } from "@/lib/client";
import type { Session } from "@/lib/session";
import { stateOf } from "@/lib/store";

const h = t.home;
const H = h.panels;
type HomeNews = Awaited<ReturnType<typeof getHomeNews>>[number];

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

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(m.matches);
    const on = () => setReduced(m.matches);
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, []);
  return reduced;
}

/** Painel principal: saudação, carrossel das notícias com fotografia (muda a cada 3 s, com pausa) e progresso das tarefas. */
function Hero({ s, items }: { s: Session; items: HomeNews[] | null }) {
  const reduced = useReducedMotion();
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hover, setHover] = useState(false);
  const slides = items?.slice(0, 4) ?? [];
  const running = !paused && !hover && !reduced && slides.length > 1;
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setI((x) => (x + 1) % slides.length), 3000);
    return () => clearInterval(id);
  }, [running, slides.length]);
  const cur = slides[i % Math.max(slides.length, 1)];
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
      <div className="flex flex-wrap items-start justify-between gap-4">
        <h1 id="hoje-titulo" suppressHydrationWarning className="text-[40px] font-semibold leading-[44px] tracking-[-0.03em] text-ink md:text-[64px] md:leading-[64px] 2xl:text-[76px] 2xl:leading-[76px]">
          {greetingFor()},<br />{first}
        </h1>
        {s.can("portal.build") && <ButtonLink size="sm" variant="gh" href="/painel/paginas/inicio/editar">{h.editPage}</ButtonLink>}
      </div>
      {!items ? <Skeleton className="aspect-[16/9] w-full !rounded-none" /> : cur ? (
        <>
          <div className="grid gap-4 md:grid-cols-[1fr_1.5fr_1.3fr] md:items-start md:gap-6">
            <p className="text-ui text-subtle">{H.now}</p>
            <div className="min-w-0">
              <p className="text-[18px] font-bold uppercase leading-6 tracking-[0.01em] text-ink"><Link href={`/comunicacao/noticias/${cur.slug}`} className="hover:underline">{cur.title}</Link></p>
              <p className="mt-1 text-ui text-subtle">{cur.scopeLabel} · {cur.dateLabel}</p>
            </div>
            <p className="flex gap-2 text-ui text-ink"><Quote size={16} aria-hidden className="mt-0.5 flex-none fill-[var(--ds-color-brand-700)] text-[var(--ds-color-brand-700)]" />{quote}</p>
          </div>
          <div className="relative flex min-h-[260px] flex-1 flex-col overflow-hidden bg-surface-2 md:min-h-[380px]" role="region" aria-roledescription="carrossel" aria-label={h.highlights.title} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} onFocus={() => setHover(true)} onBlur={() => setHover(false)}>
            <div className="relative w-full flex-1 max-md:aspect-[4/3]">
              {slides.map((n, k) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={n.id} src={n.cover} alt={k === i ? n.coverAlt : ""} aria-hidden={k !== i} loading={k === 0 ? "eager" : "lazy"}
                  className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${k === i ? "opacity-100" : "opacity-0"}`} />
              ))}
              <span aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/45 to-transparent" />
            </div>
            <div className="absolute bottom-0 left-0 flex items-center gap-2 p-3 md:p-4">
              <button type="button" className="grid h-11 w-11 place-items-center bg-black/55 text-white hover:bg-black/75" aria-label={paused ? H.play : H.pause} onClick={() => setPaused((p) => !p)}>{paused ? <Play size={18} aria-hidden /> : <Pause size={18} aria-hidden />}</button>
              <div className="flex" role="group" aria-label={H.slides}>
                {slides.map((n, k) => <button key={n.id} type="button" className="grid h-11 w-11 place-items-center" aria-label={H.slide(k + 1, n.title)} aria-current={k === i} onClick={() => setI(k)}><span className={`block h-1 w-6 ${k === i ? "bg-white" : "bg-white/45"}`} /></button>)}
              </div>
            </div>
            <div className="absolute bottom-0 right-0 flex">
              <Link href={`/comunicacao/noticias/${cur.slug}`} className="sq-btn bg-surface text-ink hover:bg-surface-2 max-md:!h-14 max-md:!w-14" aria-label={H.read(cur.title)} title={H.readShort}><BookOpen size={26} strokeWidth={1.5} aria-hidden /></Link>
              <Link href="/comunicacao/noticias" className="sq-btn bg-[var(--ds-color-brand-700)] text-white hover:bg-[var(--ds-color-brand-800)] max-md:!h-14 max-md:!w-14" aria-label={h.highlights.seeAll} title={h.highlights.seeAll}><ArrowUpRight size={26} strokeWidth={1.5} aria-hidden /></Link>
            </div>
          </div>
        </>
      ) : null}
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-6">
        <Link href="/notificacoes" className="text-[16px] text-ink hover:underline">{H.tasksDone(week.tasks.done, week.tasks.total)}</Link>
        <span className="relative h-1 bg-surface-2" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={H.tasksLabel}>
          <span className="absolute inset-y-0 left-0 bg-[var(--ds-color-brand-700)]" style={{ width: `${pct}%` }} />
        </span>
        <span className="font-mono text-[16px] text-subtle">{pct}%</span>
      </div>
    </section>
  );
}

/** Destaques na largura toda: lombadas com fotografia que abrem em acordeão ao passar o rato ou ao escolher. */
function Shelf({ s, items }: { s: Session; items: HomeNews[] | null }) {
  const toast = useToast();
  const [i, setI] = useState(0);
  const [, force] = useState(0);
  const list = items?.slice(4, 10) ?? [];
  if (!items) return <section className="panel p-6 md:p-10 xl:col-span-12"><Skeleton className="h-[420px] w-full !rounded-none" /></section>;
  if (!list.length) return null;
  const cur = list[i % list.length];
  const saved = stateOf(s.person.id).saved.has(cur.id);
  const toggle = async () => {
    try { await postAction({ action: "saved.toggle", id: cur.id }); force((n) => n + 1); toast.show({ message: saved ? H.unsaved : H.saved }); } catch { toast.show({ message: h.needs.failed }); }
  };
  return (
    <section aria-labelledby="destaques" className="panel flex flex-col gap-6 p-6 md:p-10 xl:col-span-12">
      <PanelHead id="destaques" title={h.highlights.title} href="/comunicacao/noticias" label={h.highlights.seeAll} />
      <ul className="flex h-[300px] gap-1 md:h-[420px]" aria-label={h.highlights.title}>
        {list.map((n, k) => {
          const on = k === i % list.length;
          return (
            <li key={n.id} className={`relative min-w-[48px] overflow-hidden transition-[flex-grow] duration-500 ease-out ${on ? "flex-[6]" : "flex-[1]"}`} onMouseEnter={() => setI(k)}>
              {on ? (
                <Link href={`/comunicacao/noticias/${n.slug}`} className="group block h-full w-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={n.cover} alt={n.coverAlt} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]" />
                  <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                  <span className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-5 text-white md:p-8">
                    <span className="text-label font-semibold uppercase tracking-[0.06em] text-white/85">{n.scopeLabel} · {n.dateLabel}</span>
                    <span className="max-w-[28ch] text-[22px] font-semibold leading-7 tracking-[-0.01em] md:text-[30px] md:leading-9">{n.title}</span>
                    <span className="hidden max-w-[60ch] text-[15px] leading-6 text-white/90 md:line-clamp-2">{n.summary}</span>
                  </span>
                </Link>
              ) : (
                <button type="button" className="group block h-full w-full" aria-label={n.title} onClick={() => setI(k)} onFocus={() => setI(k)}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={n.cover} alt="" className="h-full w-full object-cover brightness-[0.5] transition group-hover:brightness-75" />
                  <span className="absolute inset-0 flex items-end justify-center pb-5"><span className="vtext line-clamp-1 max-h-[86%] overflow-hidden font-semibold !text-white" style={{ transform: "rotate(180deg)" }}>{n.title}</span></span>
                </button>
              )}
            </li>
          );
        })}
      </ul>
      <div className="flex items-center justify-between gap-4">
        <p className="text-ui text-subtle">{H.position(i % list.length + 1, list.length)}</p>
        <button type="button" className="icbtn flex-none" aria-pressed={saved} aria-label={saved ? H.unsaveLabel(cur.title) : H.saveLabel(cur.title)} onClick={() => void toggle()}>
          {saved ? <BookmarkCheck size={22} aria-hidden className="text-brand" /> : <Bookmark size={22} aria-hidden />}
        </button>
      </div>
    </section>
  );
}

export function HomeView() {
  const s = useSession();
  const r = useLoad(() => getHomeNews(s), [s]);
  const items = r.ready ? r.data ?? [] : null;
  return (
    <div className="grid grid-cols-1 gap-[var(--gap)] xl:grid-cols-12">
      <Hero s={s} items={items} />
      <section aria-label={h.needs.title} className="panel p-6 md:p-10 xl:col-span-5"><NeedsYouBlock session={s} /></section>
      <section aria-label={h.quick.title} className="panel p-6 md:p-10 xl:col-span-5"><QuickAccessBlock session={s} /></section>
      <Shelf s={s} items={items} />
      <div className="panel p-6 md:p-10 xl:col-span-5"><AgendaBlock session={s} /></div>
      <div className="panel p-6 md:p-10 xl:col-span-7"><DocumentsBlock session={s} /></div>
      <div className="panel p-6 md:p-10 xl:col-span-12"><PeopleBlock session={s} /></div>
    </div>
  );
}
