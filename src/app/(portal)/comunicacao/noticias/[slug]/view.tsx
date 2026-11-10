"use client";

import { notFound } from "next/navigation";
import { Breadcrumbs, ScopeTag } from "@/design-system";
import { Denied, NewsCard, NewsCover, RichContent } from "@/features/comunicacao/content";
import { Comments, Reactions, Toc } from "@/features/comunicacao/discussion";
import { ArticleActions } from "@/features/comunicacao/interactive";
import { t } from "@/i18n";
import { getArticle } from "@/lib/api-comunicacao";
import { sanitize } from "@/lib/sanitize";
import { useSession } from "@/lib/client";
import { useQuery } from "@/lib/use-query";
import { news } from "@/data/news";

const n = t.news;


export function ArticleView({ slug }: { slug: string }) {
  const s = useSession();
  const data = getArticle(s, slug);
  if (data.status === "missing") notFound();
  if (data.status === "denied") return <Denied />;
  const a = data.article;
  return (
    <div className="wrap py-6 md:py-8">
      <article className="grid gap-x-12 xl:grid-cols-[minmax(0,720px)_1fr]">
        <div className="min-w-0">
          <header className="flex flex-col gap-4">
            <span className="no-print"><Breadcrumbs items={[{ label: n.crumb, href: "/comunicacao/noticias" }, { label: n.title, href: "/comunicacao/noticias" }, { label: a.title }]} label={t.shell.crumbs} /></span>
            {a.tags.length > 0 && <span className="flex flex-wrap gap-1.5">{a.tags.map((x) => <span key={x} className="bdg bdg-neu !px-2.5">{x}</span>)}</span>}
            <h1 className="text-page font-bold tracking-[-0.02em] md:text-[40px] md:leading-[48px]">{a.title}</h1>
            <p className="text-read">{a.summary}</p>
            <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-label text-subtle">
              <ScopeTag kind={a.scopeKind}>{a.scopeLabel}</ScopeTag>
              <span>{a.dateLabel}</span>
              <span>{n.minRead(a.minutes)}</span>
              {a.authorName && <span>{n.by} {a.authorName}</span>}
            </p>
            {data.toc.length >= 3 && <div className="no-print xl:hidden"><Toc items={data.toc} /></div>}
          </header>
          <figure className="my-8">
            <NewsCover slug={a.slug} src={a.cover} alt={a.coverAlt} className="aspect-video rounded-[24px]" eager />
            {a.caption && <figcaption className="mt-2 text-label text-subtle">{a.caption}</figcaption>}
          </figure>
          {a.html ? <div className="prose-read" dangerouslySetInnerHTML={{ __html: sanitize(a.html) }} /> : <RichContent blocks={data.blocks} visibleSlugs={data.visibleSlugs} />}
          <div className="no-print mt-10 flex flex-col gap-10 border-t border-line pt-8">
            <Reactions id={a.id} base={data.reactions} mine={data.myReaction} />
            <Comments newsId={a.id} initial={data.comments} people={data.people} me={data.me} />
          </div>
        </div>
        <aside className="no-print hidden xl:block">
          <div className="sticky top-24 flex flex-col gap-8">
            {data.toc.length >= 3 && <Toc items={data.toc} />}
            <ArticleActions id={a.id} saved={data.saved} canEdit={data.canEdit} editHref={`/painel/noticias/editar?id=${a.id}`} layout="column" />
          </div>
        </aside>
      </article>
      <div className="no-print sticky bottom-[calc(56px+env(safe-area-inset-bottom))] z-30 -mx-4 mt-8 border-t border-line bg-surface md:bottom-0 md:mx-0 xl:hidden">
        <ArticleActions id={a.id} saved={data.saved} canEdit={data.canEdit} editHref={`/painel/noticias/editar?id=${a.id}`} layout="bar" />
      </div>
      {data.related.length > 0 && (
        <section aria-labelledby="leia-tambem" className="no-print mt-12 border-t border-line pt-8">
          <h2 id="leia-tambem" className="mb-6 text-section font-bold">{n.seeAlso}</h2>
          <ul className="grid gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">{data.related.map((r) => <li key={r.id}><NewsCard item={r} /></li>)}</ul>
        </section>
      )}
    </div>
  );
}
