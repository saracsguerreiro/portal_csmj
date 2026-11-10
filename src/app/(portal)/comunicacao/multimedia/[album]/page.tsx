import { notFound } from "next/navigation";
import { PageHeader, ScopeTag } from "@/design-system";
import { Denied } from "@/features/comunicacao/content";
import { PhotoGrid } from "@/features/comunicacao/media";
import { albums } from "@/data/media";
import { t } from "@/i18n";
import { getAlbum } from "@/lib/api-comunicacao";
import { getSession } from "@/lib/session";

const m = t.media;

export async function generateMetadata({ params }: { params: Promise<{ album: string }> }) {
  const { album } = await params;
  return { title: albums.find((a) => a.slug === album)?.title ?? m.title };
}

export default async function AlbumPage({ params }: { params: Promise<{ album: string }> }) {
  const { album } = await params;
  const s = await getSession();
  const data = getAlbum(s, album);
  if (data.status === "missing") notFound();
  if (data.status === "denied") return <Denied />;
  const a = data.album;
  return (
    <div className="wrap flex flex-col gap-6 py-6 md:py-8">
      <PageHeader crumbs={[{ label: t.news.crumb, href: "/comunicacao/noticias" }, { label: m.title, href: "/comunicacao/multimedia" }, { label: a.title }]} title={a.title} description={a.description}>
        <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-label text-subtle">
          <span>{a.dateLabel}</span><span>{m.photosCount(a.total)}</span><ScopeTag kind={a.scopeKind}>{a.scopeLabel}</ScopeTag>
          {a.tags.map((x) => <span key={x} className="bdg bdg-neu !px-2.5">{x}</span>)}
        </p>
      </PageHeader>
      <PhotoGrid photos={data.photos} />
    </div>
  );
}
