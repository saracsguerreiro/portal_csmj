"use client";

import { MessageCircleQuestion } from "lucide-react";
import Link from "next/link";
import { ButtonLink, EmptyState, FilterBar, LinkTabs, LoadError, PageHeader } from "@/design-system";
import { SearchPageBox } from "@/features/ia/SearchPageBox";
import { BlockRetry } from "@/features/home/BlockRetry";
import { t } from "@/i18n";
import { scopeOptions } from "@/lib/api-comunicacao";
import { searchAll, suggest, type Group, type Part, type Result } from "@/lib/api-pesquisa";
import { withParams } from "@/lib/params";
import { useSession } from "@/lib/client";
import { useQuery } from "@/lib/use-query";

const sp = t.searchPage;
const l = t.lists;
const GROUPS: Group[] = ["people", "services", "documents", "news", "events", "pages", "media"];


function Marked({ parts }: { parts: Part[] }) {
  return <>{parts.map((p, i) => (p.mark ? <mark key={i} className="hit">{p.text}</mark> : <span key={i}>{p.text}</span>))}</>;
}

function Row({ r }: { r: Result }) {
  return (
    <li>
      <Link href={r.href} className="row-link block py-3">
        <span className="row-title block text-ui font-semibold text-ink"><Marked parts={r.title} /></span>
        <span className="mt-0.5 block text-caption text-subtle">{r.detail}</span>
        {r.snippet && (r.group === "news" || r.group === "events" || r.group === "media") && <span className="mt-1 block max-w-[75ch] text-body"><Marked parts={r.snippet} /></span>}
      </Link>
    </li>
  );
}

export function SearchView() {
  const s = useSession();
  const f = useQuery();
  const q = (f.q ?? "").trim();
  const tipo = (GROUPS as string[]).includes(f.tipo ?? "") ? (f.tipo as Group) : undefined;
  let results: Result[] | null = [];
  if (q) { try { results = searchAll(s, q, f); } catch { results = null; } }
  const counts = Object.fromEntries(GROUPS.map((g) => [g, results?.filter((r) => r.group === g).length ?? 0])) as Record<Group, number>;
  const shown = tipo ? (results ?? []).filter((r) => r.group === tipo) : results ?? [];
  const hint = q && results && results.length === 0 ? suggest(q) : undefined;
  const base = { q, periodo: f.periodo, quem: f.quem, ficheiro: f.ficheiro };
  return (
    <div className="wrap flex flex-col gap-6 py-6 md:py-8">
      <PageHeader title={sp.title} />
      <SearchPageBox q={q} />
      {!q ? <EmptyState plain title={sp.emptyQuery} /> : results === null ? <LoadError what={sp.what}><BlockRetry /></LoadError> : (
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="flex min-w-0 flex-col gap-4 lg:col-span-8">
            <p className="text-body" role="status">{sp.results(results.length, q)}</p>
            <LinkTabs label={sp.tabsLabel} tabs={[{ href: withParams("/pesquisa", base, {}), label: sp.tabs.all, current: !tipo, count: results.length }, ...GROUPS.map((g) => ({ href: withParams("/pesquisa", base, { tipo: g }), label: sp.tabs[g], current: tipo === g, count: counts[g] }))]} />
            <FilterBar filters={[{ key: "periodo", label: l.period, options: Object.entries(l.periods).map(([value, label]) => ({ value, label })) }, { key: "quem", label: l.forWhom, options: scopeOptions(s) }, ...(tipo === "documents" || !tipo ? [{ key: "ficheiro", label: sp.fileType, options: [{ value: "PDF", label: "PDF" }, { value: "DOCX", label: "Word" }] }] : [])]} />
            {results.length === 0 ? (
              <EmptyState title={sp.none(q)}>{hint && <p>{sp.didYouMean} <Link className="link" href={`/pesquisa?q=${encodeURIComponent(hint)}`}>{hint}</Link></p>}</EmptyState>
            ) : tipo ? (
              <ul className="divide-y divide-[var(--ds-border-default)]">{shown.map((r) => <Row key={`${r.group}-${r.id}`} r={r} />)}</ul>
            ) : (
              GROUPS.filter((g) => counts[g] > 0).map((g) => (
                <section key={g} aria-labelledby={`g-${g}`}>
                  <div className="flex items-baseline justify-between gap-3 border-b border-line-strong pb-1">
                    <h2 id={`g-${g}`} className="text-block font-semibold">{sp.tabs[g]} <span className="text-subtle">({counts[g]})</span></h2>
                    {counts[g] > 5 && <Link className="link-quiet" href={withParams("/pesquisa", base, { tipo: g })}>{sp.seeGroup(sp.tabs[g])}</Link>}
                  </div>
                  <ul className="divide-y divide-[var(--ds-border-subtle)]">{results!.filter((r) => r.group === g).slice(0, 5).map((r) => <Row key={`${g}-${r.id}`} r={r} />)}</ul>
                </section>
              ))
            )}
          </div>
          <aside className="lg:col-span-4">
            <div className="card sticky top-24 flex flex-col gap-3">
              <MessageCircleQuestion size={24} aria-hidden className="text-brand" />
              <h2 className="text-block font-semibold">{sp.askTitle}</h2>
              <p className="text-body">{sp.askLead(q)}</p>
              <span><ButtonLink variant="pri" href={`/perguntar?q=${encodeURIComponent(q)}`}>{sp.ask}</ButtonLink></span>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
