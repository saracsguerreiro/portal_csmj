"use client";

import { Building2, Mail, MapPin, Phone, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Avatar, EmptyState, PageHeader } from "@/design-system";
import { usePersonHref } from "@/features/pessoas/parts";
import { PersonSheet } from "@/features/pessoas/PersonSheet";
import { t } from "@/i18n";
import { organs, type OrgNode } from "@/lib/api-pessoas";
import { useSession } from "@/lib/client";

const g = t.organs;
type Organ = OrgNode & { info?: { address: string; phone: string; email: string }; newsCount: number; eventsCount: number };

function OrganCard({ n, level }: { n: Organ; level: "nacional" | "relacao" | "comarca" }) {
  const href = usePersonHref();
  return (
    <article className={`flex flex-col gap-3 ${level === "comarca" ? "rounded-[16px] border border-[var(--ds-border-card)] p-4" : ""}`}>
      <h3 className={level === "comarca" ? "text-ui font-semibold text-ink" : "text-section font-bold"}>{n.name}</h3>
      {n.head && <Link href={href(n.head.slug)} scroll={false} className="row-link flex items-center gap-3"><Avatar initials={n.head.initials} size="sm" /><span><span className="block text-caption text-subtle">{g.president}</span><span className="row-title block font-semibold text-ink">{n.head.name}</span></span></Link>}
      {n.info && (
        <ul className="flex flex-col gap-1 text-label">
          <li className="flex items-center gap-2"><MapPin size={14} aria-hidden className="text-subtle" />{n.info.address}</li>
          <li className="flex items-center gap-2"><Phone size={14} aria-hidden className="text-subtle" /><a className="hover:underline" href={`tel:${n.info.phone.replaceAll(" ", "")}`}>{n.info.phone}</a></li>
          <li className="flex items-center gap-2"><Mail size={14} aria-hidden className="text-subtle" /><a className="hover:underline" href={`mailto:${n.info.email}`}>{n.info.email}</a></li>
        </ul>
      )}
      <p className="flex flex-wrap gap-x-4 text-label">
        {n.newsCount > 0 && <Link className="link-quiet" href={`/comunicacao/noticias?quem=${n.id}`}>{g.news(n.newsCount)}</Link>}
        {n.eventsCount > 0 && <Link className="link-quiet" href={`/comunicacao/eventos?quem=${n.id}`}>{g.events(n.eventsCount)}</Link>}
      </p>
    </article>
  );
}

export function OrgansView() {
  const s = useSession();
  const [q, setQ] = useState("");
  const data = organs(s, q);
  return (
    <div className="wrap flex flex-col gap-6 py-6 md:py-8">
      <PageHeader crumbs={[{ label: t.peoplePage.title, href: "/pessoas" }, { label: g.title }]} title={g.title} description={g.lead} />
      <label className="search-box md:w-96"><span className="sr-only">{g.search}</span><Search size={16} aria-hidden /><input type="search" placeholder={g.search} value={q} onChange={(e) => setQ(e.target.value)} /></label>
      {!q && <section className="card"><OrganCard n={data.national} level="nacional" /></section>}
      {data.relations.length === 0 ? <EmptyState title={g.empty} /> : data.relations.map((r) => (
        <section key={r.id} className="card flex flex-col gap-5" aria-label={r.name}>
          <div className="flex items-start gap-3"><Building2 size={24} aria-hidden className="mt-1 text-brand" /><OrganCard n={r} level="relacao" /></div>
          <h4 className="text-label font-semibold text-subtle">{g.courts}</h4>
          <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{r.courts.map((c) => <li key={c.id}><OrganCard n={c} level="comarca" /></li>)}</ul>
        </section>
      ))}
      <PersonSheet />
    </div>
  );
}
