import { prototypeToday } from "@/data/calendar";
import { holidays } from "@/data/calendar";
import { people } from "@/data/people";
import { rooms } from "@/data/rooms";
import { services, superiors, usage } from "@/data/services";
import { units } from "@/data/units";
import type { Absence, RequestItem, RequestStep, ServiceItem } from "@/data/types";
import { statusLabel } from "@/features/servicos/status";
import { dateLong, dateShort, normalise, relative } from "./format";
import type { Session } from "./session";
import { db } from "./store";

const NOW = new Date("2026-11-09T14:00:00+01:00");
const person = (id: string) => people.find((p) => p.id === id)!;
const unitShort = (id: string) => units.find((u) => u.id === id)?.short ?? "";
const pv = (id: string) => { const p = person(id); return { id: p.id, slug: p.slug, name: p.name, initials: p.initials, role: p.role, unit: unitShort(p.unitId) }; };
export type PersonView = ReturnType<typeof pv>;

export function absenceOn(personId: string, day = prototypeToday): Absence | undefined {
  return db().absences.find((a) => a.personId === personId && a.start <= day && a.end >= day);
}

/** Quem decide de facto: se estiver ausente, o substituto (e o substituto deste). Ninguém decide os próprios pedidos. */
export function effectiveDecider(deciderId: string, requesterId: string): { id: string; onBehalfOf?: string } {
  const tried = new Set<string>();
  let id = deciderId;
  while (absenceOn(id) || id === requesterId) {
    tried.add(id);
    const sub = absenceOn(id)?.substituteId;
    const next = sub && sub !== requesterId && !tried.has(sub) ? sub : superiors[id === requesterId ? deciderId : id] ?? "luisa-chilombo";
    if (tried.has(next) || next === requesterId) { id = superiors[deciderId] ?? "luisa-chilombo"; break; }
    id = next;
  }
  return { id, onBehalfOf: id !== deciderId ? deciderId : undefined };
}

export function stepDecider(service: ServiceItem, index: number, requesterId: string) {
  const def = service.steps[index];
  return def.by === "superior" ? superiors[requesterId] ?? "luisa-chilombo" : def.personId!;
}

function stepView(st: RequestStep, r: RequestItem) {
  const eff = st.state === "current" ? effectiveDecider(st.deciderId, r.personId) : undefined;
  return {
    ...st, decider: pv(st.deciderId), by: st.byId ? pv(st.byId) : undefined, atLabel: st.at ? dateShort(st.at) : undefined,
    effective: eff ? pv(eff.id) : undefined, onBehalfOf: eff?.onBehalfOf ? pv(eff.onBehalfOf) : undefined,
    overdue: st.state === "current" && !!st.due && new Date(st.due) < NOW, dueLabel: st.due ? dateShort(st.due) : undefined,
  };
}

export function requestView(r: RequestItem) {
  const service = services.find((x) => x.id === r.serviceId)!;
  const idx = r.steps.findIndex((x) => x.state === "current" || x.state === "returned");
  const steps = r.steps.map((x) => stepView(x, r));
  const position = r.status === "em-analise" && idx >= 0 ? `Passo ${idx + 1} de ${r.steps.length} · ${r.steps[idx].label}` : undefined;
  const extraKeys = Object.keys(r.answers).filter((k) => !service.fields.some((f) => f.id === k));
  const all = [...service.fields.map((f) => ({ key: f.id, label: f.label, value: r.answers[f.id] ?? "" })), ...extraKeys.map((k) => ({ key: k, label: k.charAt(0).toUpperCase() + k.slice(1), value: r.answers[k] ?? "" }))];
  const answers = all.filter((a) => a.value);
  const missing = r.status === "devolvido" ? all.filter((a) => !a.value) : [];
  return {
    id: r.id, number: r.number, status: r.status, statusLabel: statusLabel[r.status], position, summary: r.summary, service: { id: service.id, slug: service.slug, name: service.name, icon: service.icon },
    requester: pv(r.personId), createdLabel: dateLong(r.createdAt), updatedLabel: relative(r.updatedAt), updatedShort: dateShort(r.updatedAt), waitingLabel: relative(r.updatedAt), steps, answers,
    missing,
    returnedComment: r.steps.find((x) => x.state === "returned")?.comment, current: steps.find((x) => x.state === "current"),
  };
}
export type RequestView = ReturnType<typeof requestView>;

export function catalog(s: Session) {
  const used = usage[s.person.id] ?? [];
  const cats = Array.from(new Set(services.map((x) => x.category)));
  return cats.map((c) => ({
    name: c,
    items: services.filter((x) => x.category === c).sort((a, b) => (used.indexOf(a.id) + 1 || 99) - (used.indexOf(b.id) + 1 || 99)).map((x) => ({ id: x.id, slug: x.slug, name: x.name, description: x.description, decider: x.decider, avgDays: x.avgDays, icon: x.icon, popular: used.includes(x.id) })),
  }));
}

export function myRequests(s: Session, tab = "em-curso") {
  if (s.failing) throw new Error("falha simulada");
  const mine = db().requests.filter((r) => r.personId === s.person.id).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const groups = { "em-curso": mine.filter((r) => ["enviado", "em-analise", "devolvido"].includes(r.status)), concluidos: mine.filter((r) => ["aprovado", "recusado", "cancelado"].includes(r.status)), rascunhos: mine.filter((r) => r.status === "rascunho") };
  const key = (tab in groups ? tab : "em-curso") as keyof typeof groups;
  return { tab: key, counts: { "em-curso": groups["em-curso"].length, concluidos: groups.concluidos.length, rascunhos: groups.rascunhos.length }, items: groups[key].map(requestView) };
}

export function canSee(s: Session, r: RequestItem) {
  return r.personId === s.person.id || r.steps.some((x) => x.deciderId === s.person.id || x.byId === s.person.id || (x.state === "current" && effectiveDecider(x.deciderId, r.personId).id === s.person.id));
}

export function getRequest(s: Session, id: string) {
  const r = db().requests.find((x) => x.id === id);
  if (!r) return { status: "missing" as const };
  if (!canSee(s, r)) return { status: "denied" as const };
  return { status: "ok" as const, request: requestView(r), mine: r.personId === s.person.id };
}

export function approvals(s: Session, tab = "a-minha-espera") {
  if (s.failing) throw new Error("falha simulada");
  const all = db().requests.filter((r) => r.personId !== s.person.id);
  const waiting = all.filter((r) => r.status === "em-analise" && r.steps.some((x) => x.state === "current" && effectiveDecider(x.deciderId, r.personId).id === s.person.id));
  const decided = all.filter((r) => r.steps.some((x) => x.byId === s.person.id && (x.state === "done" || x.state === "refused" || x.state === "returned")));
  const delegations = db().absences.filter((a) => a.substituteId === s.person.id && a.start <= prototypeToday && a.end >= prototypeToday).map((a) => ({ for: pv(a.personId), until: dateLong(`${a.end}T12:00:00+01:00`) }));
  const key = tab === "decididos" ? "decididos" : "a-minha-espera";
  return { tab: key, delegations, counts: { waiting: waiting.length, decided: decided.length }, items: (key === "decididos" ? decided : waiting).map(requestView) };
}

export function decisionContext(s: Session, id: string) {
  const r = db().requests.find((x) => x.id === id);
  if (!r) return { status: "missing" as const };
  if (!canSee(s, r)) return { status: "denied" as const };
  const view = requestView(r);
  const cur = r.steps.find((x) => x.state === "current");
  const canDecide = !!cur && r.personId !== s.person.id && effectiveDecider(cur.deciderId, r.personId).id === s.person.id;
  const mineStep = r.steps.find((x) => x.deciderId === s.person.id && x.byId && x.byId !== s.person.id);
  const decidedBy = !canDecide && mineStep ? { name: person(mineStep.byId!).name, at: dateLong(mineStep.at!) } : undefined;
  let context: { title: string; lines: string[] } | undefined;
  if (r.serviceId === "ferias") {
    const team = people.filter((p) => p.unitId === person(r.personId).unitId && p.id !== r.personId);
    const overlaps = db().absences.filter((a) => team.some((p) => p.id === a.personId) && a.start <= "2026-12-16" && a.end >= "2026-12-12");
    context = { title: "Contexto", lines: ["Dias já gozados este ano: 16 de 22.", ...(overlaps.length ? overlaps.map((a) => `${person(a.personId).name} está ausente de ${dateShort(`${a.start}T12:00:00+01:00`)} a ${dateShort(`${a.end}T12:00:00+01:00`)}.`) : ["Ninguém da equipa está ausente nesse período."])] };
  }
  if (r.serviceId === "viatura") context = { title: "Contexto", lines: ["Viaturas disponíveis a 18 de Novembro: 2 de 3.", "Última deslocação desta secção: 21 de Outubro."] };
  return { status: "ok" as const, request: view, canDecide, decidedBy, own: r.personId === s.person.id, context, onBehalfOf: view.current?.onBehalfOf };
}

/* Salas */
export const HOURS = Array.from({ length: 20 }, (_, i) => `${String(8 + Math.floor(i / 2)).padStart(2, "0")}:${i % 2 ? "30" : "00"}`);
const toSlot = (t: string) => HOURS.indexOf(t) === -1 ? (t === "18:00" ? 20 : 0) : HOURS.indexOf(t);

export function roomDay(s: Session, f: { dia?: string; lugares?: string; material?: string; zona?: string }) {
  if (s.failing) throw new Error("falha simulada");
  const day = /^\d{4}-\d{2}-\d{2}$/.test(f.dia ?? "") ? f.dia! : prototypeToday;
  const holiday = holidays.find((h) => h.date === day)?.name;
  const mats = (f.material ?? "").split(",").filter(Boolean);
  const list = rooms.filter((r) => (!f.lugares || r.seats >= Number(f.lugares)) && mats.every((m) => r.equipment.includes(m)) && (!f.zona || r.zone === f.zona));
  const rows = list.map((room) => ({
    ...room,
    bookings: db().bookings.filter((b) => b.roomId === room.id && b.date === day).map((b) => {
      const mine = b.personId === s.person.id;
      return { id: b.id, from: toSlot(b.start), to: toSlot(b.end), start: b.start, end: b.end, status: b.status, mine, label: mine ? b.subject : b.status === "pendente" ? "Pendente" : "Ocupada" };
    }),
  }));
  const shift = (n: number) => { const d = new Date(`${day}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
  const week = Array.from({ length: 5 }, (_, i) => { const d = new Date(`${day}T12:00:00Z`); d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7) + i); return d.toISOString().slice(0, 10); }).map((iso) => ({
    iso, label: new Intl.DateTimeFormat("pt-PT", { weekday: "short", day: "numeric", timeZone: "UTC" }).format(new Date(`${iso}T12:00:00Z`)).replace(".", ""), holiday: holidays.some((h) => h.date === iso),
    rooms: list.map((room) => { const used = db().bookings.filter((b) => b.roomId === room.id && b.date === iso).reduce((a, b) => a + toSlot(b.end) - toSlot(b.start), 0); return { id: room.id, free: (20 - used) / 2 }; }),
  }));
  const mine = db().bookings.filter((b) => b.personId === s.person.id && b.date >= prototypeToday).sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start)).map((b) => ({ ...b, room: rooms.find((r) => r.id === b.roomId)!.name, dayLabel: dateLong(`${b.date}T12:00:00+01:00`) }));
  return { day, dayLabel: `${new Intl.DateTimeFormat("pt-PT", { weekday: "long", timeZone: "UTC" }).format(new Date(`${day}T12:00:00Z`))}, ${dateLong(`${day}T12:00:00+01:00`)}`, isToday: day === prototypeToday, holiday, prev: shift(-1), next: shift(1), rows, week, mine, zones: Array.from(new Set(rooms.map((r) => r.zone))) };
}

/* Ausências */
export function absencesView(s: Session) {
  if (s.failing) throw new Error("falha simulada");
  const view = (a: Absence) => ({ ...a, substitute: pv(a.substituteId), who: pv(a.personId), range: `${dateShort(`${a.start}T12:00:00+01:00`)} a ${dateShort(`${a.end}T12:00:00+01:00`)}`, active: a.start <= prototypeToday && a.end >= prototypeToday });
  const mine = db().absences.filter((a) => a.personId === s.person.id && a.end >= prototypeToday).sort((a, b) => a.start.localeCompare(b.start)).map(view);
  const isChief = s.profile.approver;
  const team = isChief ? people.filter((p) => p.unitId === s.unit.id || superiors[p.id] === s.person.id) : [];
  const month = prototypeToday.slice(0, 7);
  const days = Array.from({ length: 30 }, (_, i) => { const iso = `${month}-${String(i + 1).padStart(2, "0")}`; const wd = new Date(`${iso}T12:00:00Z`).getUTCDay(); return { iso, day: i + 1, weekend: wd === 0 || wd === 6, holiday: holidays.some((h) => h.date === iso), today: iso === prototypeToday }; });
  const teamRows = team.map((p) => ({ person: pv(p.id), spans: db().absences.filter((a) => a.personId === p.id && a.start.slice(0, 7) <= month && a.end.slice(0, 7) >= month).map((a) => ({ id: a.id, from: Math.max(1, a.start.slice(0, 7) < month ? 1 : Number(a.start.slice(8))), to: Math.min(30, a.end.slice(0, 7) > month ? 30 : Number(a.end.slice(8))), substitute: person(a.substituteId).name })) }));
  return { mine, isChief, teamRows, days, monthLabel: "Novembro de 2026", people: people.filter((p) => p.id !== s.person.id).map((p) => ({ value: p.id, label: p.name, detail: `${p.role} · ${unitShort(p.unitId)}` })) };
}

export function searchServices(q: string) {
  return services.filter((x) => normalise(`${x.name} ${x.description} ${x.category}`).includes(normalise(q)));
}
