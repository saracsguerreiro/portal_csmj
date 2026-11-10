import { CalendarDays, FileText, Hash, Mail, MapPin, MonitorPlay, Phone, Shuffle } from "lucide-react";
import Link from "next/link";
import { ViewTransition } from "react";
import { Avatar, ButtonLink, DateMark, EmptyState, ScopeTag } from "@/design-system";
import type { ScopeKind } from "@/design-system/components/display";
import { t } from "@/i18n";
import type { EventView, ResolvedBlock } from "@/lib/api-comunicacao";
import { RichText } from "./discussion";
import { LivePoll, RsvpControl, VideoBlock } from "./interactive";

const n = t.news;
const ev = t.events;

export const modeIcon = { online: MonitorPlay, presencial: MapPin, hibrido: Shuffle } as const;

type CardNews = { id: string; slug: string; title: string; summary: string; cover: string; coverAlt: string; tags: string[]; scopeLabel: string; scopeKind: ScopeKind; dateLabel: string };

/** O cartão de notícia expande-se para a notícia (View Transitions). */
export function NewsCover({ slug, src, alt, className, eager }: { slug: string; src: string; alt: string; className?: string; eager?: boolean }) {
  return (
    <ViewTransition name={`capa-${slug}`}>
      <img src={src} alt={alt} width={960} height={540} loading={eager ? "eager" : "lazy"} className={`cover-img w-full object-cover ${className ?? ""}`} />
    </ViewTransition>
  );
}

export function NewsCard({ item }: { item: CardNews }) {
  return (
    <article>
      <Link href={`/comunicacao/noticias/${item.slug}`} className="row-link flex flex-col gap-3">
        <NewsCover slug={item.slug} src={item.cover} alt="" className="aspect-[4/3] rounded-[16px]" />
        <span className="flex flex-wrap items-center gap-x-3 text-caption text-subtle"><ScopeTag kind={item.scopeKind}>{item.scopeLabel}</ScopeTag><span>{item.dateLabel}</span></span>
        <h2 className="row-title line-clamp-3 text-block font-semibold text-ink">{item.title}</h2>
        {item.tags.length > 0 && <span className="flex flex-wrap gap-1.5">{item.tags.slice(0, 2).map((x) => <span key={x} className="bdg bdg-neu !px-2.5">{x}</span>)}</span>}
      </Link>
    </article>
  );
}

export function EventRow({ e, showRsvp = true }: { e: EventView; showRsvp?: boolean }) {
  const Icon = modeIcon[e.mode];
  return (
    <article className="@container flex gap-4 py-4">
      <DateMark day={e.day} month={e.month} />
      <div className="flex min-w-0 flex-1 flex-col gap-3 @2xl:flex-row @2xl:items-center">
        <div className="min-w-0 flex-1">
          <Link href={`/comunicacao/eventos/${e.slug}`} className="row-link"><h3 className="row-title text-ui font-semibold text-ink">{e.title}</h3></Link>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-label">
            <span>{e.weekday}, {e.time}</span>
            <span className="scope !text-label"><Icon size={14} aria-hidden />{ev.modes[e.mode]}{e.place ? ` · ${e.place}` : ""}</span>
            <ScopeTag kind={e.scopeKind}>{e.scopeLabel}</ScopeTag>
          </p>
          {e.hasSignup && (
            <p className="mt-1 text-caption text-subtle">
              {e.full ? ev.full : e.free !== undefined ? ev.spots(e.free) : ""}
              {e.deadlineLabel && !e.closed ? ` · ${ev.until(e.deadlineLabel)}` : ""}
            </p>
          )}
        </div>
        {showRsvp && e.hasSignup && <div className="flex-none"><RsvpControl id={e.id} rsvp={e.rsvp} full={e.full} closed={e.closed} needsApproval={e.needsApproval} hasSignup compact /></div>}
      </div>
    </article>
  );
}

/** Texto rico da notícia: blocos de conteúdo e conteúdos vivos. */
export function RichContent({ blocks, visibleSlugs }: { blocks: ResolvedBlock[]; visibleSlugs: string[] }) {
  return (
    <div className="prose-read">
      {blocks.map((b, i) => {
        switch (b.t) {
          case "p": return <p key={i}><RichText text={b.text} visibleSlugs={visibleSlugs} /></p>;
          case "h2": return (
            <h2 key={i} id={b.id} className="group flex items-center gap-2">
              {b.text}
              <a href={`#${b.id}`} aria-label={n.linkSection(b.text)} className="text-subtle opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"><Hash size={18} aria-hidden /></a>
            </h2>
          );
          case "ul": return <ul key={i}>{b.items.map((x) => <li key={x}>{x}</li>)}</ul>;
          case "quote": return <blockquote key={i}><p>{b.text}</p><footer>{b.by}</footer></blockquote>;
          case "callout": return <aside key={i} className="rounded-[16px] p-5 text-ui" style={{ background: "var(--ds-status-brand-bg)", color: "var(--ds-status-brand-fg)" }}><b className="block">{b.title}</b>{b.text}</aside>;
          case "table": return <div key={i} className="overflow-x-auto"><table><caption>{b.caption}</caption><thead><tr>{b.head.map((h) => <th key={h} scope="col">{h}</th>)}</tr></thead><tbody>{b.rows.map((r) => <tr key={r[0]}>{r.map((c, j) => <td key={j} className={j === r.length - 1 ? "tabular-nums" : ""}>{c}</td>)}</tr>)}</tbody></table></div>;
          case "img": return <figure key={i}><img src={b.src} alt={b.alt} width={1200} height={800} loading="lazy" className="cover-img w-full rounded-[16px] object-cover" />{b.caption && <figcaption>{b.caption}</figcaption>}</figure>;
          case "gallery": return <div key={i} className="grid grid-cols-2 gap-2">{b.images.map((g) => <img key={g.src} src={g.src} alt={g.alt} loading="lazy" className="cover-img aspect-[4/3] w-full rounded-lg object-cover" />)}</div>;
          case "video": return <VideoBlock key={i} title={b.title} poster={b.poster} duration={b.duration} />;
          case "details": return <details key={i}><summary>{b.title}</summary><p className="text-ui">{b.text}</p></details>;
          case "columns": return <div key={i} className="grid gap-6 text-ui md:grid-cols-2">{b.cols.map((c) => <p key={c}>{c}</p>)}</div>;
          case "file": return (
            <a key={i} href="#" className="row-link flex items-center gap-3 rounded-[16px] border border-line p-4 text-body">
              <FileText size={24} aria-hidden className="flex-none text-brand" />
              <span className="min-w-0 flex-1"><span className="row-title block font-semibold text-ink">{b.name}</span><span className="text-caption text-subtle">{b.format} · {b.size}</span></span>
              <span className="link-quiet">{n.attachment}</span>
            </a>
          );
          case "button": return <ButtonLink key={i} variant="sec" href={b.href}>{b.label}</ButtonLink>;
          case "live-poll": return <LivePoll key={i} id={b.id} question={b.question} detail={b.detail} options={b.options} votedFor={b.votedFor} />;
          case "live-person": return (
            <div key={i} className="flex flex-wrap items-center gap-4 rounded-[16px] border border-line p-4 text-body">
              <Avatar initials={b.person.initials} />
              <span className="min-w-0 flex-1 basis-48"><Link href={`/pessoas/${b.person.slug}`} className="font-semibold text-ink hover:underline">{b.person.name}</Link><span className="block text-label text-subtle">{b.person.role} · {b.person.unit}</span></span>
              <span className="flex gap-2"><ButtonLink size="sm" href={`mailto:${b.person.email}`} icon={<Mail size={14} aria-hidden />}>Email</ButtonLink><ButtonLink size="sm" variant="gh" href={`tel:${b.person.extension}`} icon={<Phone size={14} aria-hidden />}>{b.person.extension}</ButtonLink></span>
            </div>
          );
          case "live-event": return <div key={i} className="rounded-[16px] border border-line px-4 text-body"><EventRow e={b.event} /></div>;
          case "live-service": return (
            <div key={i} className="flex flex-wrap items-center gap-4 rounded-[16px] border border-line p-4 text-body">
              <CalendarDays size={24} aria-hidden className="flex-none text-brand" />
              <span className="min-w-0 flex-1 basis-48"><b className="block text-ink">{b.name}</b><span className="text-label text-subtle">{b.description}</span></span>
              <ButtonLink size="sm" variant="pri" href={b.href}>{b.name}</ButtonLink>
            </div>
          );
        }
      })}
    </div>
  );
}

export function Denied() {
  return (
    <div className="wrap py-12">
      <EmptyState title={t.lists.noPermission}><ButtonLink href="/" variant="pri" className="mt-3">{t.lists.backHome}</ButtonLink></EmptyState>
    </div>
  );
}
