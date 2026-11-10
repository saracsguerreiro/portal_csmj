import type { ReactNode } from "react";
import { profiles } from "@/data/profiles";
import { units } from "@/data/units";
import { Footer } from "@/features/shell/Footer";
import { ShellClient } from "@/features/shell/ShellClient";
import type { PaletteEntry, ShellData } from "@/features/shell/types";
import { t } from "@/i18n";
import { getNavigation, getNotifications, getPendingNotices } from "@/lib/api";
import { getSession } from "@/lib/session";

export default async function PortalLayout({ children }: { children: ReactNode }) {
  const s = await getSession();
  const nav = getNavigation(s);
  const pending = await getPendingNotices(s);
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
  const data: ShellData = {
    person: { name: s.person.name, initials: s.person.initials, role: s.person.role },
    unit: { value: s.unit.id, label: s.unit.short },
    myUnits: s.myUnits.map((u) => ({ value: u.id, label: u.short })),
    sections: nav.sections,
    highlight: nav.highlight,
    notifications: getNotifications(s).map((n) => ({ id: n.id, kind: n.kind, text: n.text, atLabel: n.atLabel, href: n.href, mention: n.mention, read: n.read })),
    pendingNotices: pending.map((n) => ({ id: n.id, title: n.title, number: n.number, body: n.body, version: n.version, publishedLabel: n.publishedLabel, scopeLabel: n.scopeLabel, scopeKind: n.scopeKind })),
    canUseAdmin: s.canUseAdmin,
    theme: s.theme,
    density: s.density,
    blockingNotice: s.blockingNotice,
    failing: s.failing,
    profileId: s.profile.id,
    profiles: profiles.map((p) => ({ value: p.id, label: p.label })),
    units: units.map((u) => ({ value: u.id, label: u.short })),
    palette,
  };
  return <ShellClient data={data} footer={<Footer />} skipLabel={t.shell.skip}>{children}</ShellClient>;
}
