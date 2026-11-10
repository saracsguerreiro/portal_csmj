"use client";

import { notFound } from "next/navigation";
import { PageHeader } from "@/design-system";
import { Denied } from "@/features/comunicacao/content";
import { RequestDetail, RequestHeaderStatus } from "@/features/servicos/RequestDetail";
import { t } from "@/i18n";
import { getRequest } from "@/lib/api-servicos";
import { useSession } from "@/lib/client";
import { useQuery } from "@/lib/use-query";

const v = t.services;

export function RequestDetailView() {
  const id = useQuery().id ?? "";
  const s = useSession();
  const data = getRequest(s, id);
  if (data.status === "missing") notFound();
  if (data.status === "denied") return <Denied />;
  const r = data.request;
  return (
    <div className="wrap py-6 md:py-8">
      <div className="mx-auto flex max-w-[880px] flex-col gap-6">
        <PageHeader crumbs={[{ label: v.title, href: "/servicos" }, { label: v.myRequests, href: "/servicos/meus-pedidos" }, { label: v.number(r.number) }]} title={`${r.service.name} · ${v.number(r.number)}`}>
          <div className="flex flex-wrap items-center gap-2"><RequestHeaderStatus r={r} /></div>
        </PageHeader>
        <div className="card"><RequestDetail r={r} mine={data.mine} /></div>
      </div>
    </div>
  );
}
