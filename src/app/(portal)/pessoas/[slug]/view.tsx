"use client";

import { notFound } from "next/navigation";
import { PageHeader } from "@/design-system";
import { PersonProfile } from "@/features/pessoas/parts";
import { t } from "@/i18n";
import { personDetail } from "@/lib/api-pessoas";
import { useSession } from "@/lib/client";

export function PersonView({ slug }: { slug: string }) {
  const s = useSession();
  const p = personDetail(s, slug);
  if (!p) notFound();
  return (
    <div className="wrap py-6 md:py-8">
      <div className="mx-auto flex max-w-[880px] flex-col gap-6">
        <PageHeader crumbs={[{ label: t.peoplePage.title, href: "/pessoas" }, { label: p.name }]} title={p.name} />
        <div className="card"><PersonProfile p={p} /></div>
      </div>
    </div>
  );
}
