"use client";

import { Landmark, Mail, MapPin, Phone, Scale, Search, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Avatar, Breadcrumbs, EmptyState } from "@/design-system";
import { photoOf } from "@/data/photos";
import { usePersonHref } from "@/features/pessoas/parts";
import { PersonSheet } from "@/features/pessoas/PersonSheet";
import { t } from "@/i18n";
import { organs, type OrgNode } from "@/lib/api-pessoas";
import { useSession } from "@/lib/client";

const g = t.organs;
type Organ = OrgNode & { info?: { address: string; phone: string; email: string }; newsCount: number; eventsCount: number };

/** Fotografia de cada órgão (biblioteca de exemplo). */
const PHOTO: Record<string, string> = { nacional: "n7", "rel-luanda": "n12", "rel-benguela": "d3" };

function Head({ n }: { n: Organ }) {
  const href = usePersonHref();
  if (!n.head) return null;
  return (
    <Link href={href(n.head.slug)} scroll={false} className="row-link flex items-center gap-3">
      <Avatar initials={n.head.initials} size="sm" />
      <span><span className="block text-caption text-subtle">{g.president}</span><span className="row-title block font-semibold text-ink">{n.head.name}</span></span>
    </Link>
  );
}

function Contacts({ n }: { n: Organ }) {
  if (!n.info) return null;
  return (
    <ul className="flex flex-col gap-1.5 text-label">
      <li className="flex items-center gap-2"><MapPin size={14} aria-hidden className="flex-none text-subtle" />{n.info.address}</li>
      <li className="flex items-center gap-2"><Phone size={14} aria-hidden className="flex-none text-subtle" /><a className="hover:underline" href={`tel:${n.info.phone.replaceAll(" ", "")}`}>{n.info.phone}</a></li>
      <li className="flex min-w-0 items-center gap-2"><Mail size={14} aria-hidden className="flex-none text-subtle" /><a className="truncate hover:underline" href={`mailto:${n.info.email}`}>{n.info.email}</a></li>
    </ul>
  );
}

function Links({ n }: { n: Organ }) {
  if (!n.newsCount && !n.eventsCount) return null;
  return (
    <p className="mt-auto flex flex-wrap gap-x-4 gap-y-1 border-t border-line pt-3 text-label">
      {n.newsCount > 0 && <Link className="link-quiet" href={`/comunicacao/noticias?quem=${n.id}`}>{g.news(n.newsCount)}</Link>}
      {n.eventsCount > 0 && <Link className="link-quiet" href={`/comunicacao/eventos?quem=${n.id}`}>{g.events(n.eventsCount)}</Link>}
    </p>
  );
}

function Photo({ id, className = "" }: { id: string; className?: string }) {
  const p = photoOf(PHOTO[id] ?? "n12");
  // eslint-disable-next-line @next/next/no-img-element
  return p ? <img src={p.src} alt="" loading="lazy" className={`object-cover ${className}`} /> : null;
}

/** Tribunal da Relação: a fotografia ocupa a coluna toda e os dados ficam por cima, para a linha ter a altura das comarcas. */
function RelationCover({ r }: { r: Organ }) {
  const href = usePersonHref();
  return (
    <div className="relative min-h-[360px] overflow-hidden bg-[var(--ds-content-strong)] text-white">
      <Photo id={r.id} className="absolute inset-0 h-full w-full" />
      <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-black/10" />
      <div className="relative flex h-full flex-col justify-end gap-4 p-6 md:p-8">
        <p className="text-label font-semibold uppercase tracking-[0.06em] text-white/85">{g.relation}</p>
        <h2 id={`t-${r.id}`} className="text-section font-bold !text-white">{r.name}</h2>
        {r.head && (
          <Link href={href(r.head.slug)} scroll={false} className="flex items-center gap-3 hover:underline">
            <Avatar initials={r.head.initials} size="sm" />
            <span><span className="block text-caption text-white/80">{g.president}</span><span className="block font-semibold">{r.head.name}</span></span>
          </Link>
        )}
        {r.info && (
          <ul className="flex flex-col gap-1.5 text-label text-white/90">
            <li className="flex items-center gap-2"><MapPin size={14} aria-hidden className="flex-none" />{r.info.address}</li>
            <li className="flex items-center gap-2"><Phone size={14} aria-hidden className="flex-none" /><a className="hover:underline" href={`tel:${r.info.phone.replaceAll(" ", "")}`}>{r.info.phone}</a></li>
            <li className="flex min-w-0 items-center gap-2"><Mail size={14} aria-hidden className="flex-none" /><a className="truncate hover:underline" href={`mailto:${r.info.email}`}>{r.info.email}</a></li>
          </ul>
        )}
        {(r.newsCount > 0 || r.eventsCount > 0) && (
          <p className="flex flex-wrap gap-x-4 border-t border-white/30 pt-3 text-label font-semibold">
            {r.newsCount > 0 && <Link className="hover:underline" href={`/comunicacao/noticias?quem=${r.id}`}>{g.news(r.newsCount)}</Link>}
            {r.eventsCount > 0 && <Link className="hover:underline" href={`/comunicacao/eventos?quem=${r.id}`}>{g.events(r.eventsCount)}</Link>}
          </p>
        )}
      </div>
    </div>
  );
}

/** Órgãos em blocos: o Conselho e os números na primeira linha; cada Tribunal da Relação numa linha inteira, com as comarcas a ocupar a largura. */
export function OrgansView() {
  const s = useSession();
  const [q, setQ] = useState("");
  const data = organs(s, q);
  const courts = data.relations.reduce((n, r) => n + r.courts.length, 0);
  const people = (n: OrgNode): number => n.members.length + n.children.reduce((a, c) => a + people(c), 0);
  const stats = [
    { icon: Landmark, n: data.relations.length, label: g.statRelations, href: `#${data.relations[0]?.id ?? ""}` },
    { icon: Scale, n: courts, label: g.statCourts, href: `#${data.relations[0]?.id ?? ""}` },
    { icon: Users, n: people(data.national), label: g.statPeople, href: "/pessoas" },
  ];

  return (
    <div className="grid grid-cols-1 gap-[var(--gap)] xl:grid-cols-12">
      <header className="panel flex flex-wrap items-end justify-between gap-6 p-6 md:px-10 md:py-8 xl:col-span-12">
        <div className="flex flex-col gap-2">
          <Breadcrumbs items={[{ label: t.peoplePage.title, href: "/pessoas" }, { label: g.title }]} label={t.shell.crumbs} />
          <h1 className="text-page font-bold tracking-[-0.02em]">{g.title}</h1>
          <p className="max-w-[70ch] text-ui text-subtle">{g.lead}</p>
        </div>
        <label className="search-box w-full md:w-96"><span className="sr-only">{g.search}</span><Search size={16} aria-hidden /><input type="search" placeholder={g.search} value={q} onChange={(e) => setQ(e.target.value)} /></label>
      </header>

      {!q && (
        <>
          <section aria-labelledby="conselho" className="panel grid min-w-0 overflow-hidden md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] xl:col-span-7">
            <Photo id="nacional" className="h-56 w-full md:h-full" />
            <div className="flex flex-col gap-4 p-6 md:p-8">
              <p className="eyebrow">{g.national}</p>
              <h2 id="conselho" className="text-section font-bold">{data.national.name}</h2>
              <Head n={data.national} />
              <Contacts n={data.national} />
              <Links n={data.national} />
            </div>
          </section>
          <section aria-labelledby="numeros" className="panel flex min-w-0 flex-col gap-5 p-6 md:p-8 xl:col-span-5">
            <h2 id="numeros" className="panel-title">{g.numbers}</h2>
            <ul className="grid flex-1 grid-cols-3 gap-[var(--gap)]">
              {stats.map(({ icon: Icon, n, label, href }) => (
                <li key={label}>
                  <Link href={href} className="quick-tile flex h-full min-h-[150px] flex-col justify-between bg-[var(--ds-color-brand-700)] p-4 text-white">
                    <Icon size={22} aria-hidden />
                    <span><span className="block text-[36px] font-semibold leading-10 tabular-nums">{n}</span><span className="block min-h-[40px] text-label font-semibold">{label}</span></span>
                  </Link>
                </li>
              ))}
            </ul>
            <p className="text-ui text-subtle">{g.numbersNote}</p>
          </section>
        </>
      )}

      {data.relations.length === 0 ? <div className="panel p-6 xl:col-span-12"><EmptyState title={g.empty} /></div> : data.relations.map((r) => (
        <section key={r.id} id={r.id} aria-labelledby={`t-${r.id}`} className="panel grid min-w-0 scroll-mt-4 overflow-hidden lg:grid-cols-[minmax(300px,4fr)_minmax(0,8fr)] xl:col-span-12">
          <RelationCover r={r} />
          <div className="flex min-w-0 flex-col gap-4 p-6 md:p-8">
            <h3 className="panel-title flex items-center gap-2">{g.courts}<span className="count">{r.courts.length}</span></h3>
            <ul className="grid flex-1 gap-[var(--gap)] [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
              {r.courts.map((c) => (
                <li key={c.id}>
                  <article className="flex h-full flex-col gap-4 border border-line p-5">
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="text-[17px] font-semibold leading-6 text-ink">{c.name}</h4>
                      <span className="grid h-9 w-9 flex-none place-items-center bg-[var(--ds-color-brand-700)] text-white" aria-hidden><Scale size={18} /></span>
                    </div>
                    <Head n={c} />
                    <Contacts n={c} />
                    <Links n={c} />
                  </article>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ))}
      <PersonSheet />
    </div>
  );
}
