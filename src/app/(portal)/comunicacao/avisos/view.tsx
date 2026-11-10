"use client";

import { FileText, Megaphone } from "lucide-react";
import Link from "next/link";
import { EmptyState, FilterBar, LinkTabs, LoadError, PageHeader, ScopeTag, StatusBadge } from "@/design-system";
import { BlockRetry } from "@/features/home/BlockRetry";
import { t } from "@/i18n";
import { listNotices, scopeOptions } from "@/lib/api-comunicacao";
import { withParams } from "@/lib/params";
import { useSession } from "@/lib/client";
import { useQuery } from "@/lib/use-query";

const a = t.noticesPage;
const l = t.lists;


export function NoticesView() {
  const s = useSession();
  const f = useQuery();
  let data;
  try { data = listNotices(s, f); } catch { data = null; }
  const tab = (id: string, label: string, count?: number) => ({ href: withParams("/comunicacao/avisos", { ano: f.ano, quem: f.quem }, { separador: id === "por-confirmar" ? undefined : id }), label, current: (data?.tab ?? "por-confirmar") === id, count });
  return (
    <div className="wrap flex flex-col gap-6 py-6 md:py-8">
      <PageHeader
        crumbs={[{ label: t.news.crumb, href: "/comunicacao/noticias" }, { label: a.title }]} title={a.title} description={a.lead}
        actions={data && data.pendingCount > 0 ? <StatusBadge tone="warn">{a.pending(data.pendingCount)}</StatusBadge> : undefined}
      />
      {!data ? <LoadError what={a.what}><BlockRetry /></LoadError> : (
        <>
          <LinkTabs label={a.title} tabs={[tab("por-confirmar", a.tabs.pending, data.pendingCount), tab("todos", a.tabs.all), tab("circulares", a.tabs.circulars)]} />
          <FilterBar filters={[{ key: "ano", label: l.year, options: data.years.map((y) => ({ value: y, label: y })) }, { key: "quem", label: l.forWhom, options: scopeOptions(s) }]} />
          {data.items.length === 0 ? (
            <EmptyState title={data.tab === "por-confirmar" && !f.ano && !f.quem ? a.emptyPending : a.noResults} />
          ) : (
            <ul className="card !py-0 divide-y divide-[var(--ds-border-subtle)]">
              {data.items.map((n) => {
                const Icon = n.kind === "circular" ? FileText : Megaphone;
                return (
                  <li key={n.id}>
                    <Link href={`/comunicacao/avisos/${n.id}`} className="row-link flex flex-col gap-2 py-4 md:flex-row md:items-center md:gap-4">
                      <span className="flex min-w-0 flex-1 gap-3">
                        <Icon size={20} aria-hidden className="mt-0.5 flex-none text-brand" />
                        <span className="min-w-0">
                          <span className="row-title block font-semibold text-ink">{n.title}</span>
                          <span className="mt-0.5 flex flex-wrap items-center gap-x-3 text-caption text-subtle">{n.number && <span className="font-mono">{n.number}</span>}<ScopeTag kind={n.scopeKind}>{n.scopeLabel}</ScopeTag><span>{n.dateLabel}</span></span>
                        </span>
                      </span>
                      <span className="pl-8 md:pl-0">
                        {n.mandatory ? (n.confirmedAt ? <StatusBadge tone="ok">{a.confirmedOn(n.confirmedAt)}</StatusBadge> : <StatusBadge tone="warn">{a.toConfirm}</StatusBadge>) : <StatusBadge tone="neu">{a.info}</StatusBadge>}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
