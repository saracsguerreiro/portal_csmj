import Link from "next/link";
import { EmptyState, FilterBar, LoadError, PageHeader, Pagination, ScopeTag } from "@/design-system";
import { NewsCard, NewsCover } from "@/features/comunicacao/content";
import { BlockRetry } from "@/features/home/BlockRetry";
import { t } from "@/i18n";
import { listNews, scopeOptions } from "@/lib/api-comunicacao";
import { read, withParams, type SP } from "@/lib/params";
import { getSession } from "@/lib/session";

const n = t.news;
const l = t.lists;

export const metadata = { title: n.title };

export default async function NewsPage({ searchParams }: { searchParams: SP }) {
  const s = await getSession();
  const f = await read(searchParams);
  let data;
  try { data = listNews(s, f); } catch { data = null; }
  const periods = Object.entries(l.periods).map(([value, label]) => ({ value, label }));
  return (
    <div className="wrap flex flex-col gap-6 py-6 md:py-8">
      <PageHeader crumbs={[{ label: n.crumb, href: "/comunicacao/noticias" }, { label: n.title }]} title={n.title} description={n.lead} />
      {data && (
        <FilterBar
          chips={{ key: "etiqueta", options: [{ value: "", label: l.all }, ...data.tags.map((x) => ({ value: x, label: x }))] }}
          filters={[{ key: "quem", label: l.forWhom, options: scopeOptions(s) }, { key: "periodo", label: l.period, options: periods }]}
          extras={[{ key: "desde", label: l.sinceVisit }]}
          search={{ key: "q", label: n.search }}
        />
      )}
      {!data ? <LoadError what={n.what}><BlockRetry /></LoadError> : (
        <>
          <p className="sr-only" role="status">{n.count(data.total)}</p>
          {data.total === 0 && <EmptyState title={n.noResults}><Link className="link" href="/comunicacao/noticias">{l.clear}</Link></EmptyState>}
          {data.featured && (
            <article className="@container">
              <Link href={`/comunicacao/noticias/${data.featured.slug}`} className="row-link grid gap-6 md:grid-cols-[3fr_2fr] md:items-center">
                <NewsCover slug={data.featured.slug} src={data.featured.cover} alt={data.featured.coverAlt} className="aspect-video rounded-[24px]" eager />
                <div className="flex flex-col gap-3">
                  <span className="flex flex-wrap items-center gap-x-3 text-caption text-subtle"><ScopeTag kind={data.featured.scopeKind}>{data.featured.scopeLabel}</ScopeTag><span>{data.featured.dateLabel}</span></span>
                  <h2 className="row-title text-page font-bold tracking-[-0.02em]">{data.featured.title}</h2>
                  <p className="text-ui">{data.featured.summary}</p>
                  <span className="link-quiet">{n.read}</span>
                </div>
              </Link>
            </article>
          )}
          {data.items.length > 0 && (
            <ul className="grid gap-x-6 gap-y-10 border-t border-line pt-8 sm:grid-cols-2 xl:grid-cols-3">
              {data.items.map((item) => <li key={item.id}><NewsCard item={item} /></li>)}
            </ul>
          )}
          <Pagination page={data.page} pages={data.pages} href={(p) => withParams("/comunicacao/noticias", f, { pagina: p > 1 ? String(p) : undefined })} />
        </>
      )}
    </div>
  );
}
