"use client";

import { PageHeader } from "@/design-system";
import { useQuery } from "@/lib/use-query";
import { AskConversation } from "@/features/ia/AskConversation";
import { t } from "@/i18n";


export function AskView() {
  const { q } = useQuery();
  return (
    <div className="wrap py-6 md:py-8"><div className="mx-auto flex max-w-[880px] flex-col gap-6">
      <PageHeader title={t.ask.title} description={t.ask.lead} />
      <AskConversation key={q ?? ""} initial={q} />
    </div></div>
  );
}
