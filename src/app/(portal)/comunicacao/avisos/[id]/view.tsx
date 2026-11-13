"use client";

import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/design-system";
import { Denied } from "@/features/comunicacao/content";
import { NoticeDetail } from "@/features/comunicacao/NoticeDetail";
import { t } from "@/i18n";
import { getNotice } from "@/lib/api-comunicacao";
import { useSession } from "@/lib/client";

const a = t.noticesPage;

export function NoticeView({ id }: { id: string }) {
  const s = useSession();
  const data = getNotice(s, id);
  if (data.status === "missing") notFound();
  if (data.status === "denied") return <Denied />;
  const n = data.notice;
  return (
    <div className="wrap py-6 md:py-8">
      <div className="mx-auto flex max-w-[960px] flex-col gap-6">
        <Breadcrumbs items={[{ label: t.news.crumb, href: "/comunicacao/noticias" }, { label: a.crumb, href: "/comunicacao/avisos" }, { label: n.title }]} label={t.shell.crumbs} />
        <NoticeDetail n={n} />
      </div>
    </div>
  );
}
