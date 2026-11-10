"use client";

import { CircleAlert, Lock, SearchX, WifiOff, Wrench } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, ButtonLink } from "@/design-system";
import { t } from "@/i18n";

const e = t.errors;
export type ErrorKind = "404" | "403" | "sem-ligacao" | "manutencao" | "geral";

const cfg = {
  "404": { icon: SearchX, title: e.notFoundTitle, lead: e.notFoundLead },
  "403": { icon: Lock, title: e.forbiddenTitle, lead: undefined },
  "sem-ligacao": { icon: WifiOff, title: e.offlineTitle, lead: e.offlineLead },
  manutencao: { icon: Wrench, title: e.maintenanceTitle, lead: e.maintenanceLead },
  geral: { icon: CircleAlert, title: e.generalTitle, lead: e.generalLead },
} as const;

/** Páginas de erro: dizem o que aconteceu e como resolver, sem pedir desculpa. */
export function ErrorPage({ kind, code, onRetry }: { kind: ErrorKind; code?: string; onRetry?: () => void }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const c = cfg[kind];
  return (
    <div className="wrap flex min-h-[60vh] items-center py-12">
      <div className="empty mx-auto w-full max-w-[640px] !items-start !p-8 !text-left">
        <c.icon size={32} aria-hidden className="text-brand" />
        <h1 className="mt-2 text-page font-bold tracking-[-0.02em]">{c.title}</h1>
        {c.lead && <p className="text-ui">{c.lead}</p>}
        {kind === "404" && (
          <form role="search" className="mt-3 flex w-full gap-2" onSubmit={(ev) => { ev.preventDefault(); if (q.trim()) router.push(`/pesquisa?q=${encodeURIComponent(q.trim())}`); }}>
            <label className="search-box flex-1"><span className="sr-only">{e.search}</span><input type="search" placeholder={t.shell.searchPlaceholder} value={q} onChange={(ev) => setQ(ev.target.value)} /></label>
            <Button type="submit">{e.search}</Button>
          </form>
        )}
        {code && <p className="font-mono text-label text-subtle">{e.code(code)}</p>}
        <div className="mt-3 flex flex-wrap gap-2">
          {onRetry && <Button variant="pri" onClick={onRetry}>{e.retry}</Button>}
          <ButtonLink variant={onRetry ? "sec" : "pri"} href="/">{e.home}</ButtonLink>
        </div>
      </div>
    </div>
  );
}
