import { Suspense } from "react";
import { AgendaBlock, DocumentsBlock, HighlightsBlock, HighlightsSkeleton, ListSkeleton, NeedsSkeleton, NeedsYouBlock, PeopleBlock, QuickAccessBlock } from "@/features/home/blocks";
import { TodayBlock } from "@/features/home/TodayBlock";
import { t } from "@/i18n";
import { getSession } from "@/lib/session";

const h = t.home;

export const metadata = { title: t.home.title };

export default async function Home() {
  const s = await getSession();
  const key = `${s.person.id}-${s.unit.id}`;
  return (
    <div className="wrap flex flex-col py-4 md:py-6" style={{ gap: "var(--ds-block-gap)" }}>
      <TodayBlock session={s} />
      <div className="grid gap-4 md:grid-cols-12 md:gap-6">
        <section aria-label={h.needs.title} className="card md:col-span-8">
          <Suspense key={key} fallback={<NeedsSkeleton />}><NeedsYouBlock session={s} /></Suspense>
        </section>
        <section aria-label={h.quick.title} className="card md:col-span-4">
          <QuickAccessBlock session={s} />
        </section>
      </div>
      <Suspense key={`h-${key}`} fallback={<HighlightsSkeleton />}><HighlightsBlock session={s} /></Suspense>
      <div className="grid gap-8 md:grid-cols-12 md:gap-6">
        <div className="md:col-span-7"><Suspense key={`a-${key}`} fallback={<ListSkeleton label={h.agenda.title} />}><AgendaBlock session={s} /></Suspense></div>
        <div className="md:col-span-5"><Suspense key={`d-${key}`} fallback={<ListSkeleton label={h.documents.title} rows={5} />}><DocumentsBlock session={s} /></Suspense></div>
      </div>
      <Suspense key={`p-${key}`} fallback={<ListSkeleton label={h.people.title} rows={1} />}><PeopleBlock session={s} /></Suspense>
    </div>
  );
}
