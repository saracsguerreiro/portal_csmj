"use client";

import type { ReactNode } from "react";
import type { ContentStatus } from "@/data/types";
import { Breadcrumbs, StatusBadge, type Crumb } from "@/design-system";
import { t } from "@/i18n";
import { statusTone, type Kind } from "@/lib/api-painel";

const A = t.admin;

/** Moldura das páginas do painel: margens curtas e largura útil grande. */
export function AdminPage({ title, lead, crumbs, actions, children, wide }: { title: ReactNode; lead?: ReactNode; crumbs?: Crumb[]; actions?: ReactNode; children: ReactNode; wide?: boolean }) {
  return (
    <div className={`mx-auto flex w-full flex-col gap-6 px-4 py-6 md:px-6 md:py-8 xl:px-8 ${wide ? "" : "max-w-[1600px]"}`}>
      <header className="flex flex-col gap-3">
        {crumbs && <Breadcrumbs label={A.shell.title} items={crumbs} />}
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
          <div className="min-w-0">
            <h1 className="text-page font-bold tracking-[-0.02em]">{title}</h1>
            {lead && <p className="mt-1 max-w-[75ch] text-ui text-subtle">{lead}</p>}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
      </header>
      {children}
    </div>
  );
}

export function ContentStatusBadge({ status }: { status: ContentStatus }) {
  return <StatusBadge tone={statusTone[status]}>{A.status[status]}</StatusBadge>;
}

export const newHref = (kind: Kind) => `/painel/${kind}/${kind === "noticias" ? "nova" : "novo"}`;
export const editHref = (kind: Kind, id: string) => `/painel/${kind}/editar?id=${id}`;
export const kindOfCreate = { noticia: "noticias", evento: "eventos", aviso: "avisos", album: "multimedia" } as const;

/** Caixa de secção do painel: cartão branco com título. */
export function Panel({ title, action, children, id, className = "" }: { title: string; action?: ReactNode; children: ReactNode; id?: string; className?: string }) {
  const hid = id ? `${id}-t` : undefined;
  return (
    <section aria-labelledby={hid} className={`card flex flex-col gap-3 ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <h2 id={hid} className="text-block font-semibold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export const publicHref = (kind: Kind, slug: string) => (kind === "noticias" ? `/comunicacao/noticias/${slug}` : kind === "eventos" ? `/comunicacao/eventos/${slug}` : `/comunicacao/avisos/${slug}`);

/** Descarrega uma tabela como CSV (abre no Excel). */
export function downloadCsv(name: string, rows: (string | number | undefined)[][]) {
  const esc = (v: string | number | undefined) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const blob = new Blob(["﻿" + rows.map((r) => r.map(esc).join(";")).join("\r\n")], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
