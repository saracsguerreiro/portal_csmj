"use client";

import { Landmark, Mail, MapPin, Phone, Scale, Search, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Avatar, Breadcrumbs, EmptyState } from "@/design-system";
import { usePersonHref } from "@/features/pessoas/parts";
import { PersonSheet } from "@/features/pessoas/PersonSheet";
import { t } from "@/i18n";
import { organs, type OrgNode } from "@/lib/api-pessoas";
import { useSession } from "@/lib/client";

const g = t.organs;
type Organ = OrgNode & { info?: { address: string; phone: string; email: string }; newsCount: number; eventsCount: number };

/** Todas as linhas usam a mesma grelha: identificação do órgão à esquerda (largura fixa) e conteúdo à direita. */
const ROW = "panel grid min-w-0 xl:col-span-12 lg:grid-cols-[380px_minmax(0,1fr)]";
/** Colunas da tabela de comarcas. */
const COLS = "md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,1.3fr)_120px]";

function Head({ n, bare }: { n: Organ; bare?: boolean }) {
  const href = usePersonHref();
  if (!n.head) return null;
  return (
    <Link href={href(n.head.slug)} scroll={false} className="row-link flex items-center gap-3">
      <Avatar initials={n.head.initials} size="sm" />
      <span className="min-w-0">{!bare && <span className="block text-caption text-subtle">{g.president}</span>}<span className="row-title block font-semibold text-ink">{n.head.name}</span></span>
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

function Links({ n, column }: { n: Organ; column?: boolean }) {
  if (!n.newsCount && !n.eventsCount) return column ? <span className="text-label text-subtle">—</span> : null;
  return (
    <p className={`flex gap-x-4 text-label ${column ? "flex-col gap-y-3" : "flex-wrap gap-y-1"}`}>
      {n.newsCount > 0 && <Link className="link-quiet" href={`/comunicacao/noticias?quem=${n.id}`}>{g.news(n.newsCount)}</Link>}
      {n.eventsCount > 0 && <Link className="link-quiet" href={`/comunicacao/eventos?quem=${n.id}`}>{g.events(n.eventsCount)}</Link>}
    </p>
  );
}

/** Coluna esquerda de cada linha: tipo, nome, responsável, contactos e ligações. */
function Identity({ n, kind, id }: { n: Organ; kind: string; id: string }) {
  return (
    <div className="flex flex-col gap-4 border-b border-line p-6 md:p-8 lg:border-b-0 lg:border-r">
      <p className="eyebrow">{kind}</p>
      <h2 id={id} className="text-[22px] font-bold leading-7 tracking-[-0.01em] text-ink">{n.name}</h2>
      <Head n={n} />
      <Contacts n={n} />
      {(n.newsCount > 0 || n.eventsCount > 0) && <div className="border-t border-line pt-3"><Links n={n} /></div>}
    </div>
  );
}

/** Órgãos do sistema judicial: cada órgão numa linha com a mesma grelha, para tudo ficar alinhado. */
export function OrgansView() {
  const s = useSession();
  const [q, setQ] = useState("");
  const data = organs(s, q);
  const courts = data.relations.reduce((n, r) => n + r.courts.length, 0);
  const people = (n: OrgNode): number => n.members.length + n.children.reduce((a, c) => a + people(c), 0);
  const stats = [
    { icon: Landmark, n: data.relations.length, label: g.statRelations },
    { icon: Scale, n: courts, label: g.statCourts },
    { icon: Users, n: people(data.national), label: g.statPeople },
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
        <section aria-labelledby="conselho" className={ROW}>
          <Identity n={data.national} kind={g.national} id="conselho" />
          <div className="flex min-w-0 flex-col gap-5 p-6 md:p-8">
            <h3 id="numeros" className="panel-title">{g.numbers}</h3>
            <ul className="grid flex-1 grid-cols-1 gap-[var(--gap)] sm:grid-cols-3">
              {stats.map(({ icon: Icon, n, label }) => (
                <li key={label} className="flex min-h-[130px] flex-col justify-between bg-[var(--ds-color-brand-700)] p-5 text-white">
                  <Icon size={22} aria-hidden />
                  <span><span className="block text-[40px] font-semibold leading-[44px] tabular-nums">{n}</span><span className="block text-label font-semibold">{label}</span></span>
                </li>
              ))}
            </ul>
            <p className="text-ui text-subtle">{g.numbersNote}</p>
          </div>
        </section>
      )}

      {data.relations.length === 0 ? <div className="panel p-6 xl:col-span-12"><EmptyState title={g.empty} /></div> : data.relations.map((r) => (
        <section key={r.id} id={r.id} aria-labelledby={`t-${r.id}`} className={ROW}>
          <Identity n={r} kind={g.relation} id={`t-${r.id}`} />
          <div className="flex min-w-0 flex-col gap-4 p-6 md:p-8">
            <h3 className="panel-title flex items-center gap-2">{g.courts}<span className="count">{r.courts.length}</span></h3>
            <div role="table" aria-label={`${g.courts}: ${r.name}`} className="flex flex-col">
              <div role="row" className={`hidden gap-6 border-b-2 border-[var(--ds-content-strong)] pb-2 text-caption font-semibold uppercase tracking-[0.06em] text-subtle md:grid ${COLS}`}>
                <span role="columnheader">{g.colCourt}</span><span role="columnheader">{g.president}</span><span role="columnheader">{g.colContacts}</span><span role="columnheader">{g.colComms}</span>
              </div>
              {r.courts.map((c) => (
                <div key={c.id} role="row" className={`grid gap-3 border-b border-line py-4 last:border-b-0 md:items-center md:gap-6 ${COLS}`}>
                  <span role="cell" className="flex items-center gap-3"><span className="grid h-9 w-9 flex-none place-items-center bg-[var(--ds-color-brand-700)] text-white" aria-hidden><Scale size={18} /></span><span className="font-semibold text-ink">{c.name}</span></span>
                  <span role="cell"><span className="md:hidden block text-caption text-subtle">{g.president}</span><Head n={c} bare /></span>
                  <span role="cell"><Contacts n={c} /></span>
                  <span role="cell"><Links n={c} column /></span>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}
      <PersonSheet />
    </div>
  );
}
