"use client";

import { PageHeader } from "@/design-system";
import { OrgChart, OrgList } from "@/features/pessoas/OrgChart";
import { PersonSheet } from "@/features/pessoas/PersonSheet";
import { t } from "@/i18n";
import { orgTree } from "@/lib/api-pessoas";
import { useSession } from "@/lib/client";
import { useQuery } from "@/lib/use-query";

export function OrgView() {
  const s = useSession();
  const { foco } = useQuery();
  const root = orgTree(s);
  return (
    <div className="wrap flex flex-col gap-6 py-6 md:py-8">
      <PageHeader crumbs={[{ label: t.peoplePage.title, href: "/pessoas" }, { label: t.org.title }]} title={t.org.title} description={t.org.lead} />
      <div className="hidden md:block"><OrgChart root={root} focusSlug={foco} /></div>
      <div className="card md:hidden"><OrgList node={root} /></div>
      <PersonSheet />
    </div>
  );
}
