"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs, ScopeTag } from "@/design-system";
import { Denied, NewsCover, RichContent } from "@/features/comunicacao/content";
import { Comments, Reactions, Toc } from "@/features/comunicacao/discussion";
import { ArticleActions } from "@/features/comunicacao/interactive";
import { t } from "@/i18n";
import { getArticle } from "@/lib/api-comunicacao";
import { sanitize } from "@/lib/sanitize";
import { useSession } from "@/lib/client";

const n = t.news;

/** Detalhe da notícia em painéis: o texto num painel largo que acaba numa linha clara; reacções, comentários e recentes à parte. */
export function ArticleView({ slug }: { slug: string }) {
  const s = useSession();
  const data = getArticle(s, slug);
  if (data.status === "missing") notFound();
  if (data.status === "denied") return <div className="panel"><Denied /></div>;
  const a = data.article;
  const edit = `/painel/noticias/editar?id=${a.id}`;
  return (
    <div className="grid grid-cols-1 gap-[var(--gap)] xl:grid-cols-12">
      <article className="panel min-w-0 p-6 md:p-10 xl:col-span-8" aria-labelledby="noticia-titulo">
        <header className="flex flex-col gap-4">
          <span className="no-print"><Breadcrumbs items={[{ label: n.crumb, href: "/comunicacao/noticias" }, { label: n.title, href: "/comunicacao/noticias" }, { label: a.title }]} label={t.shell.crumbs} /></span>
          {a.tags.length > 0 && <span className="flex flex-wrap gap-1.5">{a.tags.map((x) => <span key={x} className="bdg bdg-neu !px-2.5">{x}</span>)}</span>}
          <h1 id="noticia-titulo" className="max-w-[24ch] text-page font-bold tracking-[-0.02em] md:text-[48px] md:leading-[56px]">{a.title}</h1>
          <p className="max-w-[70ch] text-read">{a.summary}</p>
          <p className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-line pt-4 text-label text-subtle">
            <ScopeTag kind={a.scopeKind}>{a.scopeLabel}</ScopeTag>
            <span>{a.dateLabel}</span>
            <span>{n.minRead(a.minutes)}</span>
            {a.authorName && <span>{n.by} {a.authorName}</span>}
          </p>
        </header>
        <figure className="-mx-6 my-8 md:-mx-10">
          <NewsCover slug={a.slug} src={a.cover} alt={a.coverAlt} className="aspect-[16/8] !rounded-none" eager />
          {a.caption && <figcaption className="mt-2 px-6 text-label text-subtle md:px-10">{a.caption}</figcaption>}
        </figure>
        {data.toc.length >= 3 && <div className="no-print mb-8 xl:hidden"><Toc items={data.toc} /></div>}
        <div className="max-w-[760px]">
          {a.html ? <div className="prose-read" dangerouslySetInnerHTML={{ __html: sanitize(a.html) }} /> : <RichContent blocks={data.blocks} visibleSlugs={data.visibleSlugs} />}
        </div>
        <p className="mt-12 flex items-center gap-3 border-t-2 border-[var(--ds-content-strong)] pt-4 text-label font-semibold uppercase tracking-[0.06em] text-ink">
          <span aria-hidden className="h-3 w-3 bg-[var(--ds-color-brand-700)]" />{n.end}
        </p>
      </article>

      <aside className="no-print flex min-w-0 flex-col gap-[var(--gap)] xl:col-span-4" aria-label={n.aside}>
        <div className="panel hidden p-6 xl:block xl:p-8">
          <ArticleActions id={a.id} saved={data.saved} canEdit={data.canEdit} editHref={edit} layout="column" />
          {data.toc.length >= 3 && <div className="mt-6 border-t border-line pt-6"><Toc items={data.toc} /></div>}
        </div>
        <section className="panel p-6 md:p-8 xl:sticky xl:top-3" aria-labelledby="recentes">
          <div className="mb-4 flex items-start justify-between gap-4">
            <h2 id="recentes" className="panel-title">{n.recent}</h2>
            <Link href="/comunicacao/noticias" className="sq-arrow" aria-label={t.home.highlights.seeAll} title={t.home.highlights.seeAll}><ArrowUpRight size={22} strokeWidth={1.75} aria-hidden /></Link>
          </div>
          <ul className="flex flex-col divide-y divide-[var(--ds-border-default)]">
            {data.recent.map((r) => (
              <li key={r.id}>
                <Link href={`/comunicacao/noticias/${r.slug}`} className="group flex gap-4 py-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={r.cover} alt="" loading="lazy" className="h-20 w-24 flex-none object-cover" />
                  <span className="min-w-0">
                    <span className="block font-semibold leading-5 text-ink group-hover:underline">{r.title}</span>
                    <span className="mt-1 block text-caption text-subtle">{r.dateLabel}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </aside>

      <section className="panel no-print p-6 md:p-10 xl:col-span-8" aria-label={n.reactionsTitle}>
        <Reactions id={a.id} base={data.reactions} mine={data.myReaction} />
      </section>
      <section className="panel no-print p-6 md:p-10 xl:col-span-8" aria-label={n.commentsRegion}>
        <Comments newsId={a.id} initial={data.comments} people={data.people} me={data.me} />
      </section>

      <div className="no-print sticky bottom-[calc(56px+env(safe-area-inset-bottom))] z-30 border-t border-line bg-surface md:bottom-0 xl:hidden">
        <ArticleActions id={a.id} saved={data.saved} canEdit={data.canEdit} editHref={edit} layout="bar" />
      </div>
    </div>
  );
}
