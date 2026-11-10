"use client";

import { AgendaBlock, DocumentsBlock, HighlightsBlock, NeedsYouBlock, PeopleBlock, QuickAccessBlock } from "@/features/home/blocks";
import { TodayBlock } from "@/features/home/TodayBlock";
import { t } from "@/i18n";
import { useSession } from "@/lib/client";

const h = t.home;

export function HomeView() {
  const s = useSession();
  return (
    <div className="wrap flex flex-col py-4 md:py-6" style={{ gap: "var(--ds-block-gap)" }}>
      <TodayBlock session={s} />
      <div className="grid gap-4 md:grid-cols-12 md:gap-6">
        <section aria-label={h.needs.title} className="card md:col-span-8"><NeedsYouBlock session={s} /></section>
        <section aria-label={h.quick.title} className="card md:col-span-4"><QuickAccessBlock session={s} /></section>
      </div>
      <HighlightsBlock session={s} />
      <div className="grid gap-8 md:grid-cols-12 md:gap-6">
        <div className="md:col-span-7"><AgendaBlock session={s} /></div>
        <div className="md:col-span-5"><DocumentsBlock session={s} /></div>
      </div>
      <PeopleBlock session={s} />
    </div>
  );
}
