"use client";

import { notFound } from "next/navigation";
import { PageHeader } from "@/design-system";
import { Denied } from "@/features/comunicacao/content";
import { DocDetail, DocMeta } from "@/features/documentos/DocDetail";
import { DocIcon } from "@/features/documentos/parts";
import { t } from "@/i18n";
import { docDetail } from "@/lib/api-documentos";
import { useSession } from "@/lib/client";

export function DocPageView({ id }: { id: string }) {
  const s = useSession();
  const r = docDetail(s, id);
  if (r.status === "missing") notFound();
  if (r.status === "denied") return <Denied />;
  return (
    <div className="wrap flex flex-col gap-6 py-6 md:py-8">
      <PageHeader crumbs={[{ label: t.docs.title, href: "/documentos" }, { label: r.doc.collection, href: `/documentos/${r.doc.collectionSlug}` }, { label: r.doc.title }]} title={r.doc.title}>
        <div className="flex items-center gap-2"><DocIcon format={r.doc.format} /><DocMeta doc={r.doc} /></div>
      </PageHeader>
      <div className="card"><DocDetail doc={r.doc} /></div>
    </div>
  );
}
