import { heads, unitInfo } from "@/data/institution";
import { news } from "@/data/news";
import { events } from "@/data/events";
import { people } from "@/data/people";
import { superiors } from "@/data/services";
import { units } from "@/data/units";
import type { Person } from "@/data/types";
import { absenceOn } from "./api-servicos";
import { favoriteKeys } from "./api-documentos";
import { dateLong, normalise } from "./format";
import { inScope } from "./scope";
import type { Session } from "./session";
import { stateOf } from "./store";

const unitName = (id: string) => units.find((u) => u.id === id)?.name ?? "";
const unitShort = (id: string) => units.find((u) => u.id === id)?.short ?? "";

export function personCard(p: Person, s: Session) {
  const away = absenceOn(p.id);
  const sub = away ? people.find((x) => x.id === away.substituteId) : undefined;
  return {
    id: p.id, slug: p.slug, name: p.name, initials: p.initials, role: p.role, unitId: p.unitId, unit: unitShort(p.unitId), unitName: unitName(p.unitId), sector: p.sector,
    email: p.email, extension: p.extension, phone: p.phone, mobile: p.mobile, room: p.room,
    away: away ? { until: dateLong(`${away.end}T12:00:00+01:00`), substitute: sub ? { name: sub.name, slug: sub.slug } : undefined, message: away.message } : undefined,
    favorite: favoriteKeys(s).includes(`pessoa:${p.slug}`),
  };
}
export type PersonCardView = ReturnType<typeof personCard>;

export function contacts(s: Session, f: { q?: string; unidade?: string; cargo?: string; sector?: string; disponibilidade?: string }) {
  if (s.failing) throw new Error("falha simulada");
  const q = normalise(f.q ?? "");
  const list = people.filter((p) => (!q || normalise(`${p.name} ${p.role} ${unitName(p.unitId)} ${p.extension}`).includes(q)) && (!f.unidade || p.unitId === f.unidade) && (!f.cargo || p.role === f.cargo) && (!f.sector || p.sector === f.sector) && (!f.disponibilidade || (f.disponibilidade === "ausente" ? !!absenceOn(p.id) : !absenceOn(p.id))))
    .sort((a, b) => a.name.localeCompare(b.name, "pt"));
  return {
    items: list.map((p) => personCard(p, s)),
    roles: Array.from(new Set(people.map((p) => p.role))).sort((a, b) => a.localeCompare(b, "pt")),
    sectors: Array.from(new Set(people.map((p) => p.sector))).sort(),
    units: units.filter((u) => people.some((p) => p.unitId === u.id)).map((u) => ({ value: u.id, label: u.short })),
  };
}

export function personDetail(s: Session, slug: string) {
  const p = people.find((x) => x.slug === slug);
  if (!p) return null;
  const boss = people.find((x) => x.id === superiors[p.id]);
  const team = people.filter((x) => superiors[x.id] === p.id);
  const birthday = p.birthday && p.showBirthday ? `${Number(p.birthday.slice(3))} de ${new Intl.DateTimeFormat("pt-PT", { month: "long", timeZone: "UTC" }).format(new Date(`2026-${p.birthday}T12:00:00Z`))}` : undefined;
  return { ...personCard(p, s), birthday, boss: boss ? personCard(boss, s) : undefined, team: team.map((x) => personCard(x, s)) };
}
export type PersonDetail = NonNullable<ReturnType<typeof personDetail>>;

export function newcomers(s: Session) {
  const st = stateOf(s.person.id);
  const cut = "2026-09-10";
  return people.filter((p) => p.joinedAt && p.joinedAt >= cut).sort((a, b) => b.joinedAt!.localeCompare(a.joinedAt!)).map((p) => ({ ...personCard(p, s), joinedLabel: dateLong(`${p.joinedAt}T12:00:00+01:00`), welcomed: st.welcomes.includes(p.slug), welcomes: 3 + (p.slug.length % 5) + (st.welcomes.includes(p.slug) ? 1 : 0) }));
}

export type OrgNode = { id: string; name: string; short: string; type: string; head?: PersonCardView; members: PersonCardView[]; children: OrgNode[] };

export function orgTree(s: Session): OrgNode {
  const build = (id: string): OrgNode => {
    const u = units.find((x) => x.id === id)!;
    const head = heads[id] ? people.find((p) => p.id === heads[id]) : undefined;
    return { id, name: u.name, short: u.short, type: u.type, head: head ? personCard(head, s) : undefined, members: people.filter((p) => p.unitId === id && p.id !== head?.id).map((p) => personCard(p, s)), children: units.filter((x) => x.parentId === id).map((x) => build(x.id)) };
  };
  return build("nacional");
}

export function organs(s: Session, q?: string) {
  const tree = orgTree(s);
  const info = (n: OrgNode) => ({ ...n, info: unitInfo[n.id], newsCount: news.filter((x) => x.scopes.includes(n.id) && inScope(x, s.unit.id)).length, eventsCount: events.filter((x) => x.scopes.includes(n.id) && inScope(x, s.unit.id)).length });
  const judicial = [tree, ...tree.children.filter((c) => c.type === "relation")];
  const match = (n: OrgNode) => !q || normalise(`${n.name} ${n.head?.name ?? ""}`).includes(normalise(q));
  return {
    national: info(tree),
    relations: tree.children.filter((c) => c.type === "relation").map((r) => ({ ...info(r), courts: r.children.filter(match).map(info) })).filter((r) => match(r) || r.courts.length),
    count: judicial.length,
  };
}
