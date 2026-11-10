"use client";

import { Copy, Download, Mail, Network, Phone } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Avatar, Button, ButtonLink, IconButton, StatusBadge, useToast } from "@/design-system";
import { StarToggle } from "@/features/documentos/parts";
import { t } from "@/i18n";
import type { PersonCardView, PersonDetail } from "@/lib/api-pessoas";

const pp = t.peoplePage;

export function Availability({ p }: { p: PersonCardView }) {
  return p.away ? <StatusBadge tone="warn">{pp.away(p.away.until)}</StatusBadge> : <span className="scope"><span aria-hidden className="h-2 w-2 rounded-full border-2 border-[var(--ds-content-subtle)] bg-[var(--ds-content-subtle)]" />{pp.available}</span>;
}

export function useCopyContact() {
  const { show } = useToast();
  return async (p: PersonCardView) => {
    try { await navigator.clipboard.writeText([p.name, p.role, p.unitName, p.email, `Ext. ${p.extension}`, p.phone].filter(Boolean).join(" · ")); } catch { /* sem permissão */ }
    show({ message: pp.copied });
  };
}

export function QuickActions({ p, compact }: { p: PersonCardView; compact?: boolean }) {
  const copy = useCopyContact();
  if (compact) return (
    <span className="flex gap-1">
      <a className="icbtn" href={`mailto:${p.email}`} aria-label={`${pp.email}: ${p.name}`} title={pp.email}><Mail size={18} aria-hidden /></a>
      <a className="icbtn" href={`tel:${p.phone ?? p.extension}`} aria-label={`${pp.call}: ${p.name}`} title={pp.call}><Phone size={18} aria-hidden /></a>
      <IconButton label={`${pp.copy}: ${p.name}`} onClick={() => copy(p)}><Copy size={18} aria-hidden /></IconButton>
    </span>
  );
  return (
    <span className="flex flex-wrap gap-2">
      <ButtonLink size="sm" variant="pri" href={`mailto:${p.email}`} icon={<Mail size={14} aria-hidden />}>{pp.email}</ButtonLink>
      <ButtonLink size="sm" href={`tel:${p.phone ?? p.extension}`} icon={<Phone size={14} aria-hidden />}>{pp.call}</ButtonLink>
    </span>
  );
}

export function usePersonHref() {
  const pathname = usePathname();
  const params = useSearchParams();
  return (slug: string) => { const n = new URLSearchParams(params.toString()); n.set("pessoa", slug); return `${pathname}?${n}`; };
}

export function PersonCard({ p }: { p: PersonCardView }) {
  const href = usePersonHref();
  return (
    <article className="flex h-full flex-col gap-3 rounded-[16px] border border-[var(--ds-border-card)] p-4">
      <Link href={href(p.slug)} scroll={false} className="row-link flex items-center gap-3">
        <Avatar initials={p.initials} size="lg" />
        <span className="min-w-0"><span className="row-title block font-semibold text-ink">{p.name}</span><span className="block text-label">{p.role}</span><span className="block truncate text-caption text-subtle">{p.unit}</span></span>
      </Link>
      <div className="mt-auto flex flex-wrap items-center justify-between gap-2"><Availability p={p} /><QuickActions p={p} compact /></div>
    </article>
  );
}

export function PersonRow({ p }: { p: PersonCardView }) {
  const href = usePersonHref();
  return (
    <li className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:gap-4">
      <Link href={href(p.slug)} scroll={false} className="row-link flex min-w-0 flex-1 items-center gap-3">
        <Avatar initials={p.initials} />
        <span className="min-w-0"><span className="row-title block font-semibold text-ink">{p.name}</span><span className="block text-label">{p.role} · {p.unit} · Ext. {p.extension}</span></span>
      </Link>
      <span className="flex items-center gap-2 pl-[52px] sm:pl-0"><Availability p={p} /><QuickActions p={p} compact /></span>
    </li>
  );
}

function vcard(p: PersonDetail) {
  const lines = ["BEGIN:VCARD", "VERSION:3.0", `FN:${p.name}`, `TITLE:${p.role}`, `ORG:${p.unitName}`, `EMAIL:${p.email}`, `TEL;TYPE=WORK:${p.phone ?? p.extension}`, ...(p.mobile ? [`TEL;TYPE=CELL:${p.mobile}`] : []), "END:VCARD"];
  const url = URL.createObjectURL(new Blob([lines.join("\r\n")], { type: "text/vcard" }));
  const a = document.createElement("a");
  a.href = url; a.download = `${p.slug}.vcf`; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Ficha da pessoa: igual na ficha lateral e na página. Campos vazios não aparecem. */
export function PersonProfile({ p, inSheet }: { p: PersonDetail; inSheet?: boolean }) {
  const { show } = useToast();
  const copy = useCopyContact();
  const contacts: [string, string | undefined, string?][] = [[pp.email, p.email, `mailto:${p.email}`], [pp.phone, p.phone, p.phone && `tel:${p.phone}`], [pp.extension, p.extension], [pp.mobile, p.mobile, p.mobile && `tel:${p.mobile}`], [pp.room, p.room], [pp.birthday, p.birthday]];
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Avatar initials={p.initials} size="lg" />
        <div className="min-w-0">
          <p className="text-block font-semibold text-ink">{p.name}</p>
          <p className="text-body">{p.role} · {p.unitName}</p>
          <div className="mt-1"><Availability p={p} /></div>
        </div>
      </div>
      {p.away?.substitute && <p className="rounded-[12px] bg-surface-2 px-4 py-3 text-body">{p.away.message ?? `${pp.substitute}:`} <Link className="link" href={`/pessoas/${p.away.substitute.slug}`}>{p.away.substitute.name}</Link></p>}
      <div className="flex flex-wrap items-center gap-2">
        <QuickActions p={p} />
        <Button size="sm" variant="gh" icon={<Copy size={14} aria-hidden />} onClick={() => copy(p)}>{pp.copy}</Button>
        <Button size="sm" variant="gh" icon={<Download size={14} aria-hidden />} onClick={() => { vcard(p); show({ message: pp.vcardDone }); }}>{pp.vcard}</Button>
        <ButtonLink size="sm" variant="gh" href={`/pessoas/organograma?foco=${p.slug}`} icon={<Network size={14} aria-hidden />}>{pp.inOrg}</ButtonLink>
        <span className="flex items-center text-label"><StarToggle favKey={`pessoa:${p.slug}`} active={p.favorite} name={p.name} />{p.favorite ? pp.saved : pp.save}</span>
      </div>
      <section aria-labelledby={`c-${p.slug}`}>
        <h3 id={`c-${p.slug}`} className="mb-3 text-block font-semibold">{pp.contacts}</h3>
        <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
          {contacts.filter(([, v]) => v).map(([k, v, href]) => <div key={k}><dt className="text-label font-semibold text-ink">{k}</dt><dd className="text-ui">{href ? <a className="link-quiet !text-ui" href={href}>{v}</a> : v}</dd></div>)}
        </dl>
      </section>
      {(p.boss || p.team.length > 0) && (
        <section aria-labelledby={`r-${p.slug}`}>
          <h3 id={`r-${p.slug}`} className="mb-3 text-block font-semibold">{pp.relations}</h3>
          {p.boss && <div className="mb-4"><p className="mb-1 text-label font-semibold text-subtle">{pp.reportsTo}</p><Link href={`/pessoas/${p.boss.slug}`} className="row-link flex items-center gap-3"><Avatar initials={p.boss.initials} size="sm" /><span><span className="row-title block font-medium text-ink">{p.boss.name}</span><span className="text-caption text-subtle">{p.boss.role}</span></span></Link></div>}
          {p.team.length > 0 && <div><p className="mb-1 text-label font-semibold text-subtle">{pp.team}</p><ul className="flex flex-wrap gap-x-5 gap-y-2">{p.team.map((m) => <li key={m.slug}><Link href={`/pessoas/${m.slug}`} className="row-link flex items-center gap-2"><Avatar initials={m.initials} size="sm" /><span className="row-title text-label font-medium text-ink">{m.name}</span></Link></li>)}</ul></div>}
        </section>
      )}
      {inSheet && <ButtonLink variant="gh" href={`/pessoas/${p.slug}`}>{pp.openPage}</ButtonLink>}
    </div>
  );
}
