import Link from "next/link";
import { ButtonLink, EmptyState, FilterBar, LoadError, PageHeader, ScopeTag, UrlSheet } from "@/design-system";
import { BlockRetry } from "@/features/home/BlockRetry";
import { t } from "@/i18n";
import { listEditions } from "@/lib/api-comunicacao";
import { read, withParams, type SP } from "@/lib/params";
import { getSession } from "@/lib/session";

const nl = t.newsletter;

export const metadata = { title: nl.title };

type Ed = NonNullable<ReturnType<typeof listEditions>["latest"]>;

function Pieces({ e }: { e: Ed }) {
  return (
    <div className="flex flex-col gap-6">
      <p className="text-ui">{e.intro}</p>
      {e.sections.map((s) => (
        <section key={s.title} aria-label={s.title}>
          <h3 className="mb-2 text-label font-semibold text-subtle">{s.title}</h3>
          <ul className="divide-y divide-[var(--ds-border-subtle)]">
            {s.items.map((i) => <li key={i.href}><Link href={i.href} className="row-link flex flex-col gap-1 py-2.5"><span className="row-title font-semibold text-ink">{i.title}</span><ScopeTag kind={i.scopeKind}>{i.scopeLabel}</ScopeTag></Link></li>)}
          </ul>
        </section>
      ))}
    </div>
  );
}

export default async function NewsletterPage({ searchParams }: { searchParams: SP }) {
  const s = await getSession();
  const f = await read(searchParams);
  let data;
  try { data = listEditions(s, f); } catch { data = null; }
  return (
    <div className="wrap flex flex-col gap-8 py-6 md:py-8">
      <PageHeader crumbs={[{ label: t.news.crumb, href: "/comunicacao/noticias" }, { label: nl.title }]} title={nl.title} description={nl.lead} actions={<ButtonLink href="/conta?separador=notificacoes">{nl.manage}</ButtonLink>} />
      {!data ? <LoadError what={nl.what}><BlockRetry /></LoadError> : (
        <div className="grid gap-8 lg:grid-cols-12">
          {data.latest && (
            <section aria-labelledby="ultima" className="card lg:col-span-7">
              <p className="text-label font-semibold text-subtle">{nl.latest}</p>
              <h2 id="ultima" className="mt-1 text-section font-bold">{nl.edition(data.latest.number)} · {data.latest.dateLabel}</h2>
              <hr className="rule my-4" />
              <Pieces e={data.latest} />
            </section>
          )}
          <section aria-labelledby="arquivo" className="flex flex-col gap-4 lg:col-span-5">
            <h2 id="arquivo" className="text-block font-semibold">{nl.archive}</h2>
            <FilterBar search={{ key: "q", label: nl.search }} />
            {data.groups.length === 0 ? <EmptyState plain title={nl.noResults} /> : data.groups.map((g) => (
              <div key={g.label}>
                <h3 className="mb-1 text-label font-semibold text-subtle">{g.label}</h3>
                <ul className="divide-y divide-[var(--ds-border-default)]">
                  {g.items.map((e) => (
                    <li key={e.id}>
                      <Link href={withParams("/comunicacao/newsletter", f, { edicao: e.id })} scroll={false} className="row-link flex items-center justify-between gap-3 py-3">
                        <span><span className="row-title block font-semibold text-ink">{nl.edition(e.number)}</span><span className="text-caption text-subtle">{e.dateLabel} · {nl.pieces(e.count)}</span></span>
                        <span className="link-quiet flex-none">{nl.open}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        </div>
      )}
      {data?.open && <UrlSheet param="edicao" title={`${nl.edition(data.open.number)} · ${data.open.dateLabel}`}><Pieces e={data.open} /></UrlSheet>}
    </div>
  );
}
