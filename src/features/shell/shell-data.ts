import { profiles } from "@/data/profiles";
import { units } from "@/data/units";
import { getNavigation, getNotifications, getPendingNoticesSync } from "@/lib/api";
import type { Session } from "@/lib/session";
import type { PaletteEntry, ShellData } from "./types";

/** Dados dos elementos globais (barra, notificações, conta, protótipo), partilhados por portal e painel. */
export function shellData(s: Session, palette: PaletteEntry[]): ShellData {
  const nav = getNavigation(s);
  return {
    person: { name: s.person.name, initials: s.person.initials, role: s.person.role },
    unit: { value: s.unit.id, label: s.unit.short },
    myUnits: s.myUnits.map((u) => ({ value: u.id, label: u.short })),
    sections: nav.sections,
    highlight: nav.highlight,
    notifications: getNotifications(s).map((n) => ({ id: n.id, kind: n.kind, text: n.text, atLabel: n.atLabel, href: n.href, mention: n.mention, read: n.read })),
    pendingNotices: getPendingNoticesSync(s).map((n) => ({ id: n.id, title: n.title, number: n.number, body: n.body, version: n.version, publishedLabel: n.publishedLabel, scopeLabel: n.scopeLabel, scopeKind: n.scopeKind })),
    canUseAdmin: s.canUseAdmin, theme: s.theme, density: s.density, blockingNotice: s.blockingNotice, failing: s.failing, profileId: s.profile.id,
    profiles: profiles.map((p) => ({ value: p.id, label: p.label })),
    units: units.map((u) => ({ value: u.id, label: u.short })),
    palette,
  };
}
