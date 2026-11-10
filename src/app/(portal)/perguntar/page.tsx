import { PageHeader } from "@/design-system";
import { AskConversation } from "@/features/ia/AskConversation";
import { t } from "@/i18n";
import { read, type SP } from "@/lib/params";

export const metadata = { title: t.ask.title };

export default async function AskPage({ searchParams }: { searchParams: SP }) {
  const { q } = await read(searchParams);
  return (
    <div className="wrap py-6 md:py-8"><div className="mx-auto flex max-w-[880px] flex-col gap-6">
      <PageHeader title={t.ask.title} description={t.ask.lead} />
      <AskConversation key={q ?? ""} initial={q} />
    </div></div>
  );
}
