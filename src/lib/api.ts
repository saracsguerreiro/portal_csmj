import { documents } from "@/data/documents";
import { events } from "@/data/events";
import { holidays, prototypeLastVisit, prototypeToday } from "@/data/calendar";
import { menu } from "@/data/navigation";
import { news } from "@/data/news";
import { notices } from "@/data/notices";
import { notifications } from "@/data/notifications";
import { people } from "@/data/people";
import { services } from "@/data/services";
import { requestView, effectiveDecider } from "./api-servicos";
import { allShortcuts, defaultShortcutIds } from "@/data/shortcuts";
import { tasks } from "@/data/tasks";
import { units } from "@/data/units";
import type { MenuSection } from "@/data/types";
import { dateLong, dayOfMonth, monthLong, monthShort, normalise, relative, timeOf, weekday } from "./format";
import { inScope, scopeKind, scopeLabel } from "./scope";
import { canReadDoc } from "./docs";
import type { Session } from "./session";
import { db, stateOf } from "./store";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Atrasos curtos para os esqueletos serem reais e os blocos chegarem por ordem. */
const LATENCY = { needs: 80, rest: 180 };

export function getNoticesSync(s: Session) {
  const st = stateOf(s.person.id);
  return notices.filter((n) => inScope(n, s.unit.id)).map((n) => ({
    ...n, scopeLabel: scopeLabel(n), scopeKind: scopeKind(n), publishedLabel: dateLong(n.publishedAt), confirmedAt: st.confirmed.get(`${n.id}:${n.version}`) ?? null,
  }));
}

export function getPendingNoticesSync(s: Session) {
  return getNoticesSync(s).filter((n) => n.mandatory && !n.confirmedAt);
}

export function getSinceLastVisit(s: Session) {
  const after = (iso: string) => new Date(iso) > new Date(prototypeLastVisit);
  return {
    news: news.filter((n) => inScope(n, s.unit.id) && after(n.publishedAt)).length,
    documents: documents.filter((d) => canReadDoc(s, d) && d.isNew && after(d.updatedAt)).length,
    events: events.filter((e) => inScope(e, s.unit.id) && after(e.publishedAt)).length,
  };
}

export function getDaySeal() {
  const iso = `${prototypeToday}T12:00:00+01:00`;
  const next = holidays.find((h) => h.date >= prototypeToday);
  const days = next ? Math.round((new Date(`${next.date}T12:00:00+01:00`).getTime() - new Date(iso).getTime()) / 86400000) : null;
  const milestone = next && days !== null && days <= 14 ? { name: next.name, weekday: weekday(`${next.date}T12:00:00+01:00`), today: days === 0 } : null;
  return { day: dayOfMonth(iso), month: monthLong(iso), weekday: weekday(iso), milestone };
}

/** Uma tarefa ligada a um pedido só aparece enquanto o pedido estiver à espera desta pessoa. */
function requestStillOpen(id: string | undefined, me: string) {
  if (!id) return true;
  const r = db().requests.find((x) => x.id === id);
  if (!r) return false;
  if (r.personId === me) return r.status === "devolvido";
  const cur = r.steps.find((x) => x.state === "current");
  return r.status === "em-analise" && !!cur && effectiveDecider(cur.deciderId, r.personId).id === me;
}

export async function getTasks(s: Session) {
  await wait(LATENCY.needs);
  const st = stateOf(s.person.id);
  const mine = tasks.filter((t) => (t.assignees.includes("*") || t.assignees.includes(s.person.id)) && inScope(t, s.unit.id) && !st.doneTasks.has(t.id) && !st.postponed.has(t.id) && requestStillOpen(t.requestId, s.person.id));
  return { total: mine.length, items: mine.slice(0, 5).map((t) => ({ ...t, sinceLabel: relative(t.since), scopeLabel: scopeLabel(t), scopeKind: scopeKind(t) })) };
}

export function getShortcuts(s: Session) {
  const ids = stateOf(s.person.id).shortcuts ?? defaultShortcutIds;
  return { pinned: ids, all: allShortcuts };
}

export async function getHighlights(s: Session) {
  await wait(LATENCY.rest);
  return news.filter((n) => inScope(n, s.unit.id)).slice(0, 4).map((n) => ({ ...n, dateLabel: dateLong(n.publishedAt), scopeLabel: scopeLabel(n), scopeKind: scopeKind(n) }));
}

export async function getAgenda(s: Session) {
  await wait(LATENCY.rest);
  if (s.failing) throw new Error("falha simulada");
  return events.filter((e) => inScope(e, s.unit.id) && e.startsAt >= "2026-11-10").sort((a, b) => a.startsAt.localeCompare(b.startsAt)).slice(0, 3).map((e) => ({
    ...e, day: dayOfMonth(e.startsAt), month: monthShort(e.startsAt), time: timeOf(e.startsAt), scopeLabel: scopeLabel(e), scopeKind: scopeKind(e),
  }));
}

export async function getNewDocuments(s: Session) {
  await wait(LATENCY.rest);
  return documents.filter((d) => canReadDoc(s, d)).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 5).map((d) => ({ ...d, dateLabel: relative(d.updatedAt), scopeLabel: scopeLabel(d), scopeKind: scopeKind(d) }));
}

export async function getPeopleBlock(s: Session) {
  await wait(LATENCY.rest);
  const today = prototypeToday.slice(5);
  const week = Array.from({ length: 8 }, (_, i) => new Date(Date.parse(`${prototypeToday}T12:00:00Z`) + i * 86400000).toISOString().slice(5, 10));
  const cut = new Date(Date.parse(`${prototypeToday}T12:00:00Z`) - 30 * 86400000).toISOString().slice(0, 10);
  const birthdays = people.filter((p) => p.birthday && week.includes(p.birthday)).sort((a, b) => week.indexOf(a.birthday!) - week.indexOf(b.birthday!)).map((p) => ({ ...p, isToday: p.birthday === today, label: `${Number(p.birthday!.slice(3))} de ${monthLong(`2026-${p.birthday}T12:00:00+01:00`)}`, unit: units.find((u) => u.id === p.unitId)?.short ?? "" }));
  const newcomers = people.filter((p) => p.joinedAt && p.joinedAt >= cut).map((p) => ({ ...p, unit: units.find((u) => u.id === p.unitId)?.short ?? "" }));
  return { birthdays, newcomers };
}

export function getNotifications(s: Session) {
  const st = stateOf(s.person.id);
  return notifications.map((n) => ({ ...n, read: !!n.read || st.readAll || st.read.has(n.id), atLabel: relative(n.at) }));
}

export type HighlightCard = { label: string; title: string; detail?: string; href: string };

/** Mega-menu: secções e destaque contextual, conforme perfil e unidade. */
export function getNavigation(s: Session) {
  const mine = db().requests.filter((r) => r.personId === s.person.id && r.status !== "rascunho").sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const req = mine[0];
  const statusLabel = (r: typeof req) => requestView(r).position ?? requestView(r).statusLabel;
  const firstNews = news.find((n) => inScope(n, s.unit.id));
  const nextEvent = events.filter((e) => inScope(e, s.unit.id) && e.startsAt >= "2026-11-10").sort((a, b) => a.startsAt.localeCompare(b.startsAt))[0];
  const doc = [...documents].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).find((d) => canReadDoc(s, d));
  const newcomer = people.find((p) => p.joinedAt);
  const highlight: Record<string, HighlightCard | undefined> = {
    comunicacao: nextEvent && { label: "Próximo evento", title: nextEvent.title, detail: `${dayOfMonth(nextEvent.startsAt)} ${monthShort(nextEvent.startsAt)} · ${timeOf(nextEvent.startsAt)}`, href: `/comunicacao/eventos/${nextEvent.slug}` },
    servicos: req ? { label: "O seu último pedido", title: `${services.find((x) => x.id === req.serviceId)?.name} n.º ${req.number}`, detail: statusLabel(req), href: `/servicos/meus-pedidos?pedido=${req.id}` } : { label: "Mais pedido", title: "Pedido de férias", detail: "Decide a chefia directa", href: "/servicos/pedir/ferias" },
    documentos: doc && { label: doc.isNew ? "Novo" : "Actualizado", title: doc.title, detail: `${doc.collection} · ${doc.format}`, href: `/documentos/ficheiro/${doc.id}` },
    pessoas: newcomer && { label: "Novo colega", title: newcomer.name, detail: newcomer.role, href: `/pessoas/${newcomer.slug}` },
    participar: { label: "Enquete aberta", title: "Formação no primeiro trimestre de 2027", detail: "Vota-se até 28 de Novembro", href: "/participar/enquetes" },
  };
  void firstNews;
  const sections: MenuSection[] = menu.map((m) => ({ ...m, items: m.items.filter((i) => i.requires !== "approver" || s.profile.approver) }));
  return { sections, highlight };
}

export type SearchHit = { id: string; group: "people" | "services" | "documents" | "news" | "pages"; title: string; detail: string; href: string };

const norm = normalise;
const match = (q: string, ...fields: string[]) => {
  const hay = norm(fields.join(" "));
  return norm(q).split(/\s+/).filter(Boolean).every((w) => hay.includes(w));
};

/** Só devolve o que a pessoa pode ler. Sem acentos nem maiúsculas. */
export function search(s: Session, q: string) {
  const hits: SearchHit[] = [];
  people.filter((p) => match(q, p.name, p.role)).slice(0, 3).forEach((p) => hits.push({ id: p.id, group: "people", title: p.name, detail: `${p.role} · ${units.find((u) => u.id === p.unitId)?.short}`, href: `/pessoas/${p.slug}` }));
  services.filter((x) => match(q, x.name, x.description, x.category)).slice(0, 3).forEach((x) => hits.push({ id: x.id, group: "services", title: x.name, detail: x.category, href: `/servicos/pedir/${x.slug}` }));
  documents.filter((d) => canReadDoc(s, d) && match(q, d.title, d.collection, d.type)).slice(0, 3).forEach((d) => hits.push({ id: d.id, group: "documents", title: d.title, detail: `${d.collection} · ${d.format}`, href: `/documentos/ficheiro/${d.id}` }));
  [...news.filter((n) => inScope(n, s.unit.id) && match(q, n.title, n.summary)).map((n) => ({ id: n.id, title: n.title, detail: `Notícia · ${scopeLabel(n)}`, href: `/comunicacao/noticias/${n.slug}` })),
   ...events.filter((e) => inScope(e, s.unit.id) && match(q, e.title)).map((e) => ({ id: e.id, title: e.title, detail: `Evento · ${dayOfMonth(e.startsAt)} ${monthShort(e.startsAt)}`, href: `/comunicacao/eventos/${e.slug}` }))].slice(0, 3).forEach((n) => hits.push({ ...n, group: "news" }));
  menu.flatMap((m) => m.items.filter((i) => i.requires !== "approver" || s.profile.approver)).filter((i) => match(q, i.label, i.description)).slice(0, 3).forEach((i) => hits.push({ id: i.id, group: "pages", title: i.label, detail: i.description, href: i.href }));
  return hits;
}
