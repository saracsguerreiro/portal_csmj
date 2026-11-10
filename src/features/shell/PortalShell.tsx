"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import type { ReactNode } from "react";
import { t } from "@/i18n";
import { getNavigation } from "@/lib/api";
import { shellData } from "./shell-data";
import { useSession, useVersion } from "@/lib/client";
import { Footer } from "./Footer";
import { ShellClient } from "./ShellClient";
import type { PaletteEntry, ShellData } from "./types";

/** Elementos globais do portal, calculados a partir da sessão activa. */
export function PortalShell({ children }: { children: ReactNode }) {
  const s = useSession();
  const v = useVersion();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (v > 0 && s.signedOut) router.replace(`/entrar?volta=${encodeURIComponent(pathname)}`);
  }, [v, s.signedOut, router, pathname]);

  const data = useMemo<ShellData>(() => {
    const nav = getNavigation(s);
    const a = t.actions;
    const palette: PaletteEntry[] = [
      { id: "a-ferias", label: a.askLeave, href: "/servicos/pedir/ferias", group: "actions" },
      { id: "a-sala", label: a.reserveRoom, href: "/servicos/salas", group: "actions" },
      { id: "a-ausencia", label: a.markAbsence, href: "/servicos/ausencias", group: "actions" },
      { id: "a-perguntar", label: a.ask, href: "/perguntar", group: "actions" },
      ...(s.profile.approver ? [{ id: "a-aprovar", label: a.approveRequests, href: "/servicos/aprovacoes", group: "actions" as const }] : []),
      ...(s.can("content.draft") ? [{ id: "a-noticia", label: a.newNews, href: "/painel/noticias/nova", group: "actions" as const }, { id: "a-evento", label: a.newEvent, href: "/painel/eventos/novo", group: "actions" as const }] : []),
      { id: "g-inicio", label: t.shell.home, href: "/", group: "goto" },
      ...nav.sections.flatMap((m) => m.items.map((i) => ({ id: `g-${m.id}-${i.id}`, label: i.label, detail: m.label, href: i.href, group: "goto" as const }))),
    ];
    return shellData(s, palette);
  }, [s, v]); // eslint-disable-line react-hooks/exhaustive-deps

  return <ShellClient key={`${s.person.id}-${s.unit.id}`} data={data} footer={<Footer />} skipLabel={t.shell.skip}>{children}</ShellClient>;
}
