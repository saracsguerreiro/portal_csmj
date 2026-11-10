"use client";

import { Copy, Download, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Button, ButtonLink, ScopeTag, StatusBadge } from "@/design-system";
import { t } from "@/i18n";
import type { docDetail } from "@/lib/api-documentos";
import { DocPreview, StarToggle, useDocActions } from "./parts";

const d = t.docs;
type Doc = Extract<ReturnType<typeof docDetail>, { status: "ok" }>["doc"];

export function DocMeta({ doc }: { doc: Doc }) {
  return (
    <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-label text-subtle">
      <span>{doc.collection} · {doc.folderName}</span>
      <ScopeTag kind={doc.scopeKind}>{doc.scopeLabel}</ScopeTag>
      {doc.outOfDate ? <StatusBadge tone="warn">{d.outOfDate}</StatusBadge> : <StatusBadge tone="ok">{d.current}</StatusBadge>}
    </p>
  );
}

/** Conteúdo da ficha do documento: igual na ficha lateral e na página. */
export function DocDetail({ doc, inSheet }: { doc: Doc; inSheet?: boolean }) {
  const acts = useDocActions();
  const info: [string, string | undefined][] = [[d.description, doc.description], [d.number, doc.number], [d.type, doc.type], [d.format, `${doc.format} · ${doc.size}`], [d.published, doc.publishedLabel], [d.updatedOn, doc.updatedLong], [d.validUntil, doc.validLabel], [d.responsible, doc.responsible]];
  return (
    <div className="flex flex-col gap-6">
      {doc.tags.length > 0 && <span className="flex flex-wrap gap-1.5">{doc.tags.map((x) => <span key={x} className="bdg bdg-neu !px-2.5">{x}</span>)}</span>}
      <div className="flex flex-wrap gap-2">
        <Button variant="pri" icon={<ExternalLink size={16} aria-hidden />} onClick={acts.download}>{d.open}</Button>
        <Button icon={<Download size={16} aria-hidden />} onClick={acts.download}>{d.download}</Button>
        <Button variant="gh" icon={<Copy size={16} aria-hidden />} onClick={() => acts.copy(doc.id)}>{d.copyLink}</Button>
        <span className="flex items-center gap-1 text-label"><StarToggle favKey={`doc:${doc.id}`} active={doc.favorite} name={doc.title} />{doc.favorite ? d.saved : d.save}</span>
      </div>
      <div className={inSheet ? "flex flex-col gap-6" : "grid gap-8 md:grid-cols-[280px_1fr]"}>
        <DocPreview title={doc.title} number={doc.number} />
        <section aria-labelledby={`info-${doc.id}`}>
          <h3 id={`info-${doc.id}`} className="mb-3 text-block font-semibold">{d.info}</h3>
          <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
            {info.filter(([, v]) => v).map(([k, v]) => <div key={k} className={k === d.description ? "sm:col-span-2" : ""}><dt className="text-label font-semibold text-ink">{k}</dt><dd className="text-ui">{v}</dd></div>)}
          </dl>
        </section>
      </div>
      <section aria-labelledby={`ver-${doc.id}`}>
        <h3 id={`ver-${doc.id}`} className="mb-2 text-block font-semibold">{d.versions}</h3>
        <ul className="divide-y divide-[var(--ds-border-subtle)]">
          {doc.versions.map((v, i) => <li key={v.label} className="flex items-center justify-between gap-3 py-2 text-body"><span className="font-medium text-ink">{v.label}{i === 0 && <span className="ml-2"><StatusBadge tone="ok">{d.current}</StatusBadge></span>}</span><span className="text-subtle">{v.dateLabel}</span></li>)}
        </ul>
      </section>
      {doc.usedIn.length > 0 && (
        <section aria-labelledby={`uso-${doc.id}`}>
          <h3 id={`uso-${doc.id}`} className="mb-2 text-block font-semibold">{d.usedIn}</h3>
          <ul className="flex flex-col gap-1">{doc.usedIn.map((u) => <li key={u.href}><Link className="link-quiet" href={u.href}>{u.title}</Link></li>)}</ul>
        </section>
      )}
      {inSheet && <ButtonLink variant="gh" href={`/documentos/ficheiro/${doc.id}`}>{d.openPage}</ButtonLink>}
    </div>
  );
}
