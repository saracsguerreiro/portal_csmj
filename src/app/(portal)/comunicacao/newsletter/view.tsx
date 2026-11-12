"use client";

import { ArrowUpRight, CalendarClock, Mail } from "lucide-react";
import Link from "next/link";
import { entity } from "@/config/entity";
import { Breadcrumbs, ButtonLink, FilterBar, LoadError, ScopeTag } from "@/design-system";
import { BlockRetry } from "@/features/home/BlockRetry";
import { t } from "@/i18n";
import { listEditions } from "@/lib/api-comunicacao";
import { withParams } from "@/lib/params";
import { useSession } from "@/lib/client";
import { useQuery } from "@/lib/use-query";

const nl = t.newsletter;
const BASE = "/comunicacao/newsletter";
type Ed = NonNullable<ReturnType<typeof listEditions>["current"]>;
type Piece = Ed["sections"][number]["items"][number];

function Thumb({ src, className = "" }: { src?: string; className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return src ? <img src={src} alt="" loading="lazy" className={`object-cover ${className}`} /> : <span className={`block bg-surface-2 ${className}`} />;
}

/** Peça em destaque: fotografia grande com o título por cima. */
function Lead({ p }: { p: Piece }) {
  return (
    <Link href={p.href} className="group relative block overflow-hidden bg-surface-2">
      <Thumb src={p.cover} className="aspect-[16/8] w-full transition-transform duration-700 group-hover:scale-[1.02]" />
      <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <span className="sq-arrow absolute right-0 top-0" aria-hidden><ArrowUpRight size={22} strokeWidth={1.75} /></span>
      <span className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-6 text-white md:p-8">
        <span className="text-label font-semibold uppercase tracking-[0.06em] text-white/85">{p.scopeLabel}</span>
        <span className="max-w-[30ch] text-[24px] font-semibold leading-8 tracking-[-0.01em] md:text-[30px] md:leading-9">{p.title}</span>
        {p.summary && <span className="hidden max-w-[62ch] text-[15px] leading-6 text-white/90 md:block">{p.summary}</span>}
      </span>
    </Link>
  );
}

function Card({ p, wide }: { p: Piece; wide?: boolean }) {
  return (
    <Link href={p.href} className={`group flex h-full bg-surface ${wide ? "flex-col sm:flex-row" : "flex-col"}`}>
      <span className={`relative block overflow-hidden ${wide ? "sm:w-1/2 sm:flex-none" : ""}`}><Thumb src={p.cover} className={`w-full transition-transform duration-700 group-hover:scale-[1.03] ${wide ? "aspect-[16/10] sm:h-full sm:aspect-auto" : "aspect-[16/10]"}`} /></span>
      <span className={`flex flex-1 flex-col justify-center gap-2 border border-line p-5 md:p-6 ${wide ? "border-t-0 sm:border-l-0 sm:border-t" : "border-t-0"}`}>
        <ScopeTag kind={p.scopeKind}>{p.scopeLabel}</ScopeTag>
        <span className="text-[17px] font-semibold leading-6 text-ink group-hover:underline">{p.title}</span>
        {p.summary && <span className="line-clamp-2 text-ui text-subtle">{p.summary}</span>}
      </span>
    </Link>
  );
}

function EventPiece({ p }: { p: Piece }) {
  return (
    <Link href={p.href} className="group flex items-stretch gap-4 py-4">
      <span className="flex w-16 flex-none flex-col items-center justify-center bg-[var(--ds-color-brand-700)] py-2 text-white">
        <span className="text-[26px] font-semibold leading-7 tabular-nums">{p.day}</span>
        <span className="text-[11px] font-semibold uppercase tracking-[0.06em]">{p.month}</span>
      </span>
      <span className="min-w-0 flex-1 self-center">
        <span className="block font-semibold text-ink group-hover:underline">{p.title}</span>
        <span className="mt-1 block text-caption text-subtle">{p.time} · {p.scopeLabel}</span>
      </span>
      <Thumb src={p.cover} className="hidden h-20 w-28 flex-none sm:block" />
    </Link>
  );
}

/** A edição apresentada como uma revista: cabeçalho grená, abertura, destaque em fotografia e peças por secção. */
function Edition({ e, isLatest }: { e: Ed; isLatest: boolean }) {
  return (
    <article aria-labelledby="edicao-titulo" className="panel min-w-0 xl:col-span-8">
      <header className="rail-red flex flex-wrap items-end justify-between gap-6 px-6 py-8 md:px-10 md:py-10">
        <div className="flex items-start gap-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={entity.logo.symbol} alt="" width={48} height={52} className="mt-1 h-12 w-auto flex-none" />
          <div>
            <p className="eyebrow !text-[var(--ds-accent-gold)]">{nl.masthead}</p>
            <h2 id="edicao-titulo" className="mt-2 text-[36px] font-semibold leading-10 tracking-[-0.02em] !text-white md:text-[48px] md:leading-[52px]">{nl.edition(e.number)}</h2>
            <p className="mt-2 text-ui text-white/85">{e.dateLabel} · {nl.pieces(e.count)}</p>
          </div>
        </div>
        {isLatest ? <span className="bg-white px-3 py-1.5 text-label font-semibold uppercase tracking-[0.06em] text-[var(--ds-color-brand-700)]">{nl.latest}</span>
          : <Link href={BASE} scroll={false} className="border border-white px-3 py-1.5 text-label font-semibold text-white hover:bg-white hover:text-[var(--ds-color-brand-700)]">{nl.backToLatest}</Link>}
      </header>
      <div className="flex flex-col gap-10 p-6 md:p-10">
        <p className="max-w-[62ch] border-l-4 border-[var(--ds-color-brand-700)] pl-5 text-[20px] leading-8 text-ink">{e.intro}</p>
        {e.sections.map((sec, si) => {
          const events = sec.items.filter((i) => i.kind === "evento");
          const pieces = sec.items.filter((i) => i.kind !== "evento");
          const [first, ...rest] = pieces;
          return (
            <section key={sec.title} aria-labelledby={`sec-${si}`} className="flex flex-col gap-4">
              <h3 id={`sec-${si}`} className="panel-title border-b-2 border-[var(--ds-content-strong)] pb-3">{sec.title}</h3>
              {first && si === 0 && <Lead p={first} />}
              {(si === 0 ? rest : pieces).length > 0 && (
                <ul className="grid gap-3 sm:grid-cols-2">{(si === 0 ? rest : pieces).map((p, k, arr) => { const wide = arr.length % 2 === 1 && k === arr.length - 1; return <li key={p.href} className={wide ? "sm:col-span-2" : ""}><Card p={p} wide={wide} /></li>; })}</ul>
              )}
              {events.length > 0 && <ul className="divide-y divide-[var(--ds-border-default)]">{events.map((p) => <li key={p.href}><EventPiece p={p} /></li>)}</ul>}
            </section>
          );
        })}
        <p className="flex items-center gap-3 border-t-2 border-[var(--ds-content-strong)] pt-4 text-label font-semibold uppercase tracking-[0.06em] text-ink">
          <span aria-hidden className="h-3 w-3 bg-[var(--ds-color-brand-700)]" />{nl.end(e.number)}
        </p>
      </div>
    </article>
  );
}

/** Newsletter: à esquerda a edição em leitura, à direita o arquivo em cartões com miniaturas. */
export function NewsletterView() {
  const s = useSession();
  const f = useQuery();
  let data;
  try { data = listEditions(s, f); } catch { data = null; }
  return (
    <div className="grid grid-cols-1 gap-[var(--gap)] xl:grid-cols-12">
      <header className="panel flex flex-wrap items-end justify-between gap-4 p-6 md:px-10 md:py-8 xl:col-span-12">
        <div className="flex flex-col gap-2">
          <Breadcrumbs items={[{ label: t.news.crumb, href: "/comunicacao/noticias" }, { label: nl.title }]} label={t.shell.crumbs} />
          <h1 className="text-page font-bold tracking-[-0.02em]">{nl.title}</h1>
          <p className="max-w-[70ch] text-ui text-subtle">{nl.lead}</p>
        </div>
        <ButtonLink href="/conta?separador=notificacoes" icon={<Mail size={16} aria-hidden />}>{nl.manage}</ButtonLink>
      </header>
      {!data ? <div className="panel p-6 xl:col-span-12"><LoadError what={nl.what}><BlockRetry /></LoadError></div> : (
        <>
          {data.current && <Edition e={data.current} isLatest={data.isLatest} />}
          <aside className="flex min-w-0 flex-col gap-[var(--gap)] xl:col-span-4" aria-label={nl.archive}>
            <section className="panel flex flex-col gap-4 p-6 md:p-8" aria-labelledby="arquivo">
              <div className="flex items-baseline justify-between gap-3">
                <h2 id="arquivo" className="panel-title">{nl.archive}</h2>
                <span className="text-caption text-subtle">{nl.count(data.total)}</span>
              </div>
              <FilterBar search={{ key: "q", label: nl.search }} />
              {data.groups.length === 0 ? <p className="text-ui text-subtle">{nl.noResults}</p> : data.groups.map((g) => (
                <div key={g.label} className="flex flex-col gap-2">
                  <h3 className="text-label font-semibold uppercase tracking-[0.06em] text-subtle">{g.label}</h3>
                  <ul className="flex flex-col gap-2">
                    {g.items.map((e) => {
                      const on = e.id === data!.current?.id;
                      return (
                        <li key={e.id}>
                          <Link href={withParams(BASE, { q: f.q }, { edicao: e.id === data!.latest?.id ? undefined : e.id })} scroll={false} aria-current={on ? "true" : undefined} className={`ed-card group ${on ? "is-on" : ""}`}>
                            <span className="ed-num">{e.number}</span>
                            <span className="min-w-0 flex-1">
                              <span className="block font-semibold text-ink">{nl.edition(e.number)}</span>
                              <span className="block text-caption text-subtle">{e.dateLabel} · {nl.pieces(e.count)}</span>
                              <span className="mt-2 flex gap-1" aria-hidden>{e.covers.map((c, k) => <Thumb key={k} src={c} className="h-10 w-14" />)}</span>
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </section>
            <section className="panel flex flex-col gap-3 p-6 md:p-8" aria-labelledby="envio">
              <h2 id="envio" className="flex items-center gap-2 text-[17px] font-semibold text-ink"><CalendarClock size={20} aria-hidden className="text-brand" />{nl.schedule}</h2>
              <p className="text-ui text-subtle">{nl.scheduleText}</p>
            </section>
          </aside>
        </>
      )}
    </div>
  );
}
