"use client";

import { Download, FileText, Megaphone } from "lucide-react";
import { Alert, ScopeTag, StatusBadge } from "@/design-system";
import { t } from "@/i18n";
import type { getNotice } from "@/lib/api-comunicacao";
import { NoticeConfirm } from "./NoticeConfirm";

const a = t.noticesPage;
type N = Extract<ReturnType<typeof getNotice>, { status: "ok" }>["notice"];

/** Conteúdo de um aviso ou circular: cabeçalho, texto, anexos e confirmação. Usado na página do aviso e na lista. */
export function NoticeDetail({ n, headingLevel = 1, inline }: { n: N; headingLevel?: 1 | 2; inline?: boolean }) {
  const H = headingLevel === 1 ? "h1" : "h2";
  const Icon = n.kind === "circular" ? FileText : Megaphone;
  const showChanges = !!n.changed?.length && n.version > 1;
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-3">
        <p className="flex items-center gap-2 text-label font-semibold uppercase tracking-[0.06em] text-brand"><Icon size={16} aria-hidden />{n.number ?? a.kinds[n.kind]}</p>
        <H id="aviso-titulo" className="text-page font-bold tracking-[-0.02em] md:text-[36px] md:leading-[44px]">{n.title}</H>
        <p className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-line pt-3 text-label text-subtle">
          <ScopeTag kind={n.scopeKind}>{n.scopeLabel}</ScopeTag>
          <span>{a.published(n.publishedLong)}</span>
          {n.version > 1 && n.updatedLong && <span>{a.versionUpdated(n.version, n.updatedLong)}</span>}
          {n.mandatory ? (n.confirmedAt ? <StatusBadge tone="ok">{a.youConfirmed(n.confirmedAt)}</StatusBadge> : <StatusBadge tone="warn">{a.toConfirm}</StatusBadge>) : <StatusBadge tone="neu">{a.info}</StatusBadge>}
        </p>
      </header>
      {showChanges && <Alert tone="info" title={a.changedTitle}>{a.changedHint}</Alert>}
      <div className="prose-read max-w-[72ch]">
        {n.body.map((p, i) => (
          showChanges && n.changed!.includes(i)
            ? <p key={i} className="py-1 pl-4" style={{ borderLeft: "3px solid var(--ds-color-brand-700)", background: "var(--ds-surface-2)" }}><span className="sr-only">{a.changedMark}: </span>{p}</p>
            : <p key={i}>{p}</p>
        ))}
      </div>
      {n.attachments && (
        <section aria-labelledby="anexos" className="flex flex-col gap-2">
          <h3 id="anexos" className="text-label font-semibold uppercase tracking-[0.06em] text-ink">{a.attachments}</h3>
          <ul className="flex flex-col gap-2">
            {n.attachments.map((x) => (
              <li key={x.name}>
                <a href="#" className="group flex items-center gap-3 border border-line p-4 text-body hover:border-[var(--ds-content-strong)]">
                  <FileText size={22} aria-hidden className="text-brand" />
                  <span className="flex-1"><span className="block font-semibold text-ink group-hover:underline">{x.name}</span><span className="text-caption text-subtle">{x.format} · {x.size}</span></span>
                  <span className="sq-arrow !h-10 !w-10" aria-hidden><Download size={18} /></span>
                  <span className="sr-only">{t.news.attachment}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
      {n.mandatory && !n.confirmedAt && <NoticeConfirm id={n.id} inline={inline} />}
    </div>
  );
}
