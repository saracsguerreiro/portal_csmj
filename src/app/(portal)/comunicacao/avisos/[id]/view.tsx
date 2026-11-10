"use client";

import { FileText } from "lucide-react";
import { notFound } from "next/navigation";
import { Alert, PageHeader, ScopeTag, StatusBadge } from "@/design-system";
import { Denied } from "@/features/comunicacao/content";
import { NoticeConfirm } from "@/features/comunicacao/NoticeConfirm";
import { notices } from "@/data/notices";
import { t } from "@/i18n";
import { getNotice } from "@/lib/api-comunicacao";
import { useSession } from "@/lib/client";
import { useQuery } from "@/lib/use-query";

const a = t.noticesPage;


export function NoticeView({ id }: { id: string }) {
  const s = useSession();
  const data = getNotice(s, id);
  if (data.status === "missing") notFound();
  if (data.status === "denied") return <Denied />;
  const n = data.notice;
  const showChanges = !!n.changed?.length && n.version > 1;
  return (
    <div className="wrap py-6 md:py-8"><div className="mx-auto max-w-[960px]">
      <PageHeader crumbs={[{ label: t.news.crumb, href: "/comunicacao/noticias" }, { label: a.crumb, href: "/comunicacao/avisos" }, { label: n.title }]} title={n.title}>
        <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-label text-subtle">
          {n.number && <span className="font-mono">{n.number}</span>}
          <ScopeTag kind={n.scopeKind}>{n.scopeLabel}</ScopeTag>
          <span>{a.published(n.publishedLong)}</span>
          {n.version > 1 && n.updatedLong && <span>{a.versionUpdated(n.version, n.updatedLong)}</span>}
        </p>
        {n.mandatory && (n.confirmedAt ? <span><StatusBadge tone="ok">{a.youConfirmed(n.confirmedAt)}</StatusBadge></span> : <span><StatusBadge tone="warn">{a.toConfirm}</StatusBadge></span>)}
      </PageHeader>
      {showChanges && <div className="mt-6"><Alert tone="info" title={a.changedTitle}>{a.changedHint}</Alert></div>}
      <div className="prose-read mt-6">
        {n.body.map((p, i) => (
          showChanges && n.changed!.includes(i)
            ? <p key={i} className="rounded-r-lg py-1 pl-4" style={{ borderLeft: "3px solid var(--ds-accent-gold)", background: "var(--ds-status-brand-bg)", color: "var(--ds-status-brand-fg)" }}><span className="sr-only">{a.changedMark}: </span>{p}</p>
            : <p key={i}>{p}</p>
        ))}
      </div>
      {n.attachments && (
        <section aria-labelledby="anexos" className="mt-8">
          <h2 id="anexos" className="mb-3 text-block font-semibold">{a.attachments}</h2>
          <ul className="flex flex-col gap-2">{n.attachments.map((x) => <li key={x.name}><a href="#" className="row-link flex items-center gap-3 rounded-[16px] border border-line p-4 text-body"><FileText size={22} aria-hidden className="text-brand" /><span className="flex-1"><span className="row-title block font-semibold text-ink">{x.name}</span><span className="text-caption text-subtle">{x.format} · {x.size}</span></span><span className="link-quiet">{t.news.attachment}</span></a></li>)}</ul>
        </section>
      )}
      {n.mandatory && !n.confirmedAt && <NoticeConfirm id={n.id} />}
    </div></div>
  );
}
