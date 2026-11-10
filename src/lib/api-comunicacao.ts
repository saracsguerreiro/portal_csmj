import { prototypeLastVisit, prototypeToday, holidays } from "@/data/calendar";
import { comments as seedComments, seedReactions } from "@/data/comments";
import { events } from "@/data/events";
import { albums, editions, photosOf, videos } from "@/data/media";
import { news } from "@/data/news";
import { notices } from "@/data/notices";
import { people } from "@/data/people";
import { services } from "@/data/services";
import { tasks } from "@/data/tasks";
import { units } from "@/data/units";
import type { Block, Comment, EventItem, NewsItem, Rsvp, Unit } from "@/data/types";
import { dateLong, dateShort, dayOfMonth, monthLong, monthShort, normalise, relative, timeOf, weekday } from "./format";
import { inScope, scopeKind, scopeLabel } from "./scope";
import type { Session } from "./session";
import { extra, stateOf } from "./store";

const NOW = new Date("2026-11-09T14:00:00+01:00");
const PER_PAGE = 12;

const withScope = <T extends { scopes: string[] }>(x: T) => ({ ...x, scopeLabel: scopeLabel(x), scopeKind: scopeKind(x) });
const has = (q: string | undefined, ...f: string[]) => !q || normalise(f.join(" ")).includes(normalise(q));

export function scopeOptions(s: Session) {
  const line: Unit[] = [];
  let cur: Unit | undefined = s.unit;
  while (cur) { line.push(cur); cur = units.find((u) => u.id === cur!.parentId); }
  return line.reverse().map((u) => ({ value: u.id, label: u.short }));
}

export function inPeriod(iso: string, p?: string) {
  if (!p) return true;
  if (p === "d7") return NOW.getTime() - new Date(iso).getTime() <= 7 * 86400000;
  if (p === "d30") return NOW.getTime() - new Date(iso).getTime() <= 30 * 86400000;
  return iso.startsWith(p.replace("y", ""));
}

type NewsFilters = { etiqueta?: string; quem?: string; periodo?: string; q?: string; desde?: string; pagina?: string };

export function listNews(s: Session, f: NewsFilters) {
  if (s.failing) throw new Error("falha simulada");
  const visible = news.filter((n) => inScope(n, s.unit.id));
  const tags = Array.from(new Set(visible.flatMap((n) => n.tags))).sort();
  const filtered = visible.filter((n) =>
    (!f.etiqueta || n.tags.includes(f.etiqueta)) && (!f.quem || n.scopes.includes(f.quem)) && inPeriod(n.publishedAt, f.periodo) && has(f.q, n.title, n.summary) && (!f.desde || new Date(n.publishedAt) > new Date(prototypeLastVisit)),
  ).map((n) => ({ ...withScope(n), dateLabel: dateLong(n.publishedAt), dateShort: dateShort(n.publishedAt) }));
  const page = Math.max(1, Number(f.pagina) || 1);
  const isFirst = page === 1;
  const rest = filtered.slice(1);
  const pages = Math.max(1, Math.ceil(rest.length / PER_PAGE));
  return { total: filtered.length, tags, featured: isFirst ? filtered[0] : undefined, items: rest.slice((page - 1) * PER_PAGE, page * PER_PAGE), page, pages };
}

function readMinutes(n: NewsItem) {
  const words = (n.body ?? []).reduce((acc, b) => acc + ("text" in b ? b.text.split(/\s+/).length : 40), n.summary.split(/\s+/).length);
  return Math.max(1, Math.round(words / 200));
}

export type LiveBlock =
  | { t: "live-poll"; id: string; question: string; detail: string; options: string[]; votedFor?: string }
  | { t: "live-person"; person: { slug: string; name: string; initials: string; role: string; unit: string; email: string; extension: string } }
  | { t: "live-event"; event: EventView }
  | { t: "live-service"; name: string; description: string; href: string };
export type ResolvedBlock = Exclude<Block, { t: "live-poll" | "live-person" | "live-event" | "live-service" }> | LiveBlock;

const unitShort = (id: string) => units.find((u) => u.id === id)?.short ?? "";

export function eventView(e: EventItem, s: Session) {
  const st = stateOf(s.person.id);
  const rsvp: Rsvp = st.rsvp.get(e.id) ?? "none";
  const free = e.capacity !== undefined ? Math.max(0, e.capacity - (e.taken ?? 0) - (rsvp === "going" ? 1 : 0)) : undefined;
  const closed = !!e.deadline && new Date(e.deadline) < NOW;
  const running = new Date(e.startsAt) <= NOW && new Date(e.endsAt) >= NOW;
  const sameDay = e.startsAt.slice(0, 10) === e.endsAt.slice(0, 10);
  return {
    id: e.id, slug: e.slug, title: e.title, mode: e.mode, place: e.place, address: e.address, organizer: e.organizer, tags: e.tags, description: e.description, programme: e.programme,
    startsAt: e.startsAt, day: dayOfMonth(e.startsAt), month: monthShort(e.startsAt), monthLabel: `${monthLong(e.startsAt)} de ${e.startsAt.slice(0, 4)}`, monthKey: e.startsAt.slice(0, 7),
    weekday: weekday(e.startsAt), time: `${timeOf(e.startsAt)} às ${timeOf(e.endsAt)}`, whenLong: sameDay ? `${dateLong(e.startsAt)}, ${timeOf(e.startsAt)} às ${timeOf(e.endsAt)}` : `${dateLong(e.startsAt)} a ${dateLong(e.endsAt)}`,
    hasSignup: e.capacity !== undefined, free, full: free === 0 && rsvp !== "going", deadlineLabel: e.deadline ? `${dayOfMonth(e.deadline)} ${monthShort(e.deadline)}` : undefined, closed, needsApproval: !!e.needsApproval, rsvp, running,
    scopeLabel: scopeLabel(e), scopeKind: scopeKind(e), goingCount: (e.taken ?? 0) + (rsvp === "going" ? 1 : 0), showAttendees: !!e.showAttendees,
    speakers: (e.speakers ?? []).map((id) => people.find((p) => p.id === id)!).map((p) => ({ slug: p.slug, name: p.name, initials: p.initials, role: p.role, unit: unitShort(p.unitId) })),
  };
}
export type EventView = ReturnType<typeof eventView>;

function resolveBlock(b: Block, s: Session): ResolvedBlock | null {
  switch (b.t) {
    case "live-poll": {
      const task = tasks.find((x) => x.id === b.taskId);
      if (!task || !inScope(task, s.unit.id)) return null;
      return { t: "live-poll", id: task.id, question: task.title, detail: task.detail, options: task.options ?? [], votedFor: stateOf(s.person.id).votes.get(task.id) };
    }
    case "live-person": {
      const p = people.find((x) => x.id === b.personId);
      return p ? { t: "live-person", person: { slug: p.slug, name: p.name, initials: p.initials, role: p.role, unit: unitShort(p.unitId), email: p.email, extension: p.extension } } : null;
    }
    case "live-event": {
      const e = events.find((x) => x.id === b.eventId);
      return e && inScope(e, s.unit.id) ? { t: "live-event", event: eventView(e, s) } : null;
    }
    case "live-service": {
      const x = services.find((v) => v.id === b.serviceId);
      return x ? { t: "live-service", name: x.name, description: x.description, href: `/servicos/pedir/${x.slug}` } : null;
    }
    default:
      return b;
  }
}

export type CommentView = { id: string; author: { slug: string; name: string; initials: string; role: string }; text: string; atLabel: string; replies: CommentView[] };

function commentView(c: Comment, all: Comment[]): CommentView {
  const p = people.find((x) => x.id === c.authorId)!;
  return { id: c.id, author: { slug: p.slug, name: p.name, initials: p.initials, role: p.role }, text: c.text, atLabel: relative(c.at), replies: all.filter((r) => r.replyTo === c.id).map((r) => commentView(r, all)) };
}

export function getArticle(s: Session, slug: string) {
  const n = news.find((x) => x.slug === slug);
  if (!n) return { status: "missing" as const };
  if (!inScope(n, s.unit.id)) return { status: "denied" as const };
  const st = stateOf(s.person.id);
  const author = people.find((p) => p.id === n.authorId);
  const blocks = (n.body ?? [{ t: "p", text: n.summary } as Block]).map((b) => resolveBlock(b, s)).filter(Boolean) as ResolvedBlock[];
  const toc = blocks.filter((b) => b.t === "h2").map((b) => ({ id: (b as { id: string }).id, text: (b as { text: string }).text }));
  const all = [...seedComments, ...extra.comments].filter((c) => c.newsId === n.id);
  const related = news.filter((x) => x.id !== n.id && inScope(x, s.unit.id) && x.tags.some((v) => n.tags.includes(v))).slice(0, 3).map((x) => ({ ...withScope(x), dateLabel: dateLong(x.publishedAt) }));
  const base = seedReactions[n.id] ?? { gosto: 0, aplauso: 0, importante: 0 };
  const visibleSlugs = news.filter((x) => inScope(x, s.unit.id)).map((x) => x.slug);
  return {
    status: "ok" as const,
    article: { ...withScope(n), dateLabel: dateLong(n.publishedAt), minutes: readMinutes(n), authorName: author?.name ?? "" },
    blocks, toc, related, visibleSlugs,
    comments: all.filter((c) => !c.replyTo).map((c) => commentView(c, all)),
    reactions: base, myReaction: st.reacted.get(n.id) ?? null, saved: st.saved.has(n.id),
    me: { name: s.person.name, initials: s.person.initials, slug: s.person.slug, role: s.person.role },
    people: people.map((p) => ({ slug: p.slug, name: p.name })),
    canEdit: s.can("content.publish"),
  };
}

type EventFilters = { etiqueta?: string; modalidade?: string; quem?: string; desde?: string; mes?: string };

export function listEvents(s: Session, f: EventFilters) {
  if (s.failing) throw new Error("falha simulada");
  const visible = events.filter((e) => inScope(e, s.unit.id));
  const tags = Array.from(new Set(visible.flatMap((e) => e.tags))).sort();
  const filtered = visible.filter((e) => (!f.etiqueta || e.tags.includes(f.etiqueta)) && (!f.modalidade || e.mode === f.modalidade) && (!f.quem || e.scopes.includes(f.quem)) && (!f.desde || new Date(e.publishedAt) > new Date(prototypeLastVisit))).sort((a, b) => a.startsAt.localeCompare(b.startsAt)).map((e) => eventView(e, s));
  const running = filtered.filter((e) => e.running);
  const upcoming = filtered.filter((e) => !e.running);
  const months = Array.from(new Set(upcoming.map((e) => e.monthKey))).map((key) => ({ key, label: upcoming.find((e) => e.monthKey === key)!.monthLabel, items: upcoming.filter((e) => e.monthKey === key) }));

  const monthKey = /^\d{4}-\d{2}$/.test(f.mes ?? "") ? f.mes! : prototypeToday.slice(0, 7);
  const [y, m] = monthKey.split("-").map(Number);
  const first = new Date(Date.UTC(y, m - 1, 1));
  const lead = (first.getUTCDay() + 6) % 7;
  const cells = Array.from({ length: 42 }, (_, i) => {
    const d = new Date(Date.UTC(y, m - 1, 1 + i - lead));
    const iso = d.toISOString().slice(0, 10);
    return { iso, day: d.getUTCDate(), inMonth: d.getUTCMonth() === m - 1, today: iso === prototypeToday, holiday: holidays.find((h) => h.date === iso)?.name, events: filtered.filter((e) => e.startsAt.slice(0, 10) === iso) };
  });
  const trimmed = cells.slice(0, cells[35].inMonth ? 42 : 35);
  const shift = (delta: number) => new Date(Date.UTC(y, m - 1 + delta, 1)).toISOString().slice(0, 7);
  const label = `${new Intl.DateTimeFormat("pt-PT", { month: "long", timeZone: "UTC" }).format(first).replace(/^./, (c) => c.toUpperCase())} de ${y}`;

  const strip = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(Date.parse(`${prototypeToday}T12:00:00Z`) + i * 86400000);
    const iso = d.toISOString().slice(0, 10);
    return { iso, day: d.getUTCDate(), weekday: new Intl.DateTimeFormat("pt-PT", { weekday: "short", timeZone: "UTC" }).format(d).replace(".", "").replace(/^./, (c) => c.toUpperCase()), holiday: holidays.some((h) => h.date === iso), event: filtered.find((e) => e.startsAt.slice(0, 10) === iso) };
  });

  return { total: filtered.length, tags, running, months, calendar: { cells: trimmed, label, prev: shift(-1), next: shift(1) }, strip };
}

export function getEvent(s: Session, slug: string) {
  const e = events.find((x) => x.slug === slug);
  if (!e) return { status: "missing" as const };
  if (!inScope(e, s.unit.id)) return { status: "denied" as const };
  return { status: "ok" as const, event: eventView(e, s), attendees: people.slice(3, 9).map((p) => ({ slug: p.slug, name: p.name, initials: p.initials })) };
}

function noticeView(n: (typeof notices)[number], s: Session) {
  const confirmedAt = stateOf(s.person.id).confirmed.get(`${n.id}:${n.version}`) ?? null;
  return { ...withScope(n), dateLabel: dateShort(n.publishedAt), publishedLong: dateLong(n.publishedAt), updatedLong: n.updatedAt ? dateLong(n.updatedAt) : undefined, confirmedAt };
}

export function listNotices(s: Session, f: { separador?: string; ano?: string; quem?: string }) {
  if (s.failing) throw new Error("falha simulada");
  const all = notices.filter((n) => inScope(n, s.unit.id)).map((n) => noticeView(n, s));
  const pending = all.filter((n) => n.mandatory && !n.confirmedAt);
  const tab = f.separador ?? "por-confirmar";
  const base = tab === "por-confirmar" ? pending : tab === "circulares" ? all.filter((n) => n.kind === "circular") : all;
  const items = base.filter((n) => (!f.ano || n.publishedAt.startsWith(f.ano)) && (!f.quem || n.scopes.includes(f.quem))).sort((a, b) => Number(!!(b.mandatory && !b.confirmedAt)) - Number(!!(a.mandatory && !a.confirmedAt)) || b.publishedAt.localeCompare(a.publishedAt));
  return { tab, items, pendingCount: pending.length, years: Array.from(new Set(all.map((n) => n.publishedAt.slice(0, 4)))).sort().reverse() };
}

export function getNotice(s: Session, id: string) {
  const n = notices.find((x) => x.id === id);
  if (!n) return { status: "missing" as const };
  if (!inScope(n, s.unit.id)) return { status: "denied" as const };
  return { status: "ok" as const, notice: noticeView(n, s) };
}

export function listMedia(s: Session, f: { etiqueta?: string; ano?: string; separador?: string }) {
  if (s.failing) throw new Error("falha simulada");
  const vis = albums.filter((a) => inScope(a, s.unit.id));
  const vids = videos.filter((v) => inScope(v, s.unit.id));
  const tags = Array.from(new Set([...vis, ...vids].flatMap((x) => x.tags))).sort();
  const years = Array.from(new Set(vis.map((a) => a.happenedAt.slice(0, 4)))).sort().reverse();
  return {
    tab: f.separador === "videos" ? "videos" : "fotografias", tags, years,
    albums: vis.filter((a) => (!f.etiqueta || a.tags.includes(f.etiqueta)) && (!f.ano || a.happenedAt.startsWith(f.ano))).map((a) => ({ ...withScope(a), dateLabel: dateLong(a.happenedAt) })),
    videos: vids.filter((v) => (!f.etiqueta || v.tags.includes(f.etiqueta)) && (!f.ano || v.publishedAt.startsWith(f.ano))).map((v) => ({ ...withScope(v), dateLabel: dateShort(v.publishedAt) })),
  };
}

export function getAlbum(s: Session, slug: string) {
  const a = albums.find((x) => x.slug === slug);
  if (!a) return { status: "missing" as const };
  if (!inScope(a, s.unit.id)) return { status: "denied" as const };
  return { status: "ok" as const, album: { ...withScope(a), dateLabel: dateLong(a.happenedAt) }, photos: photosOf(a) };
}

export function listEditions(s: Session, f: { q?: string; edicao?: string }) {
  if (s.failing) throw new Error("falha simulada");
  const scoped = editions.map((e) => ({
    ...e, dateLabel: dateLong(e.sentAt), monthGroup: `${monthLong(e.sentAt)} de ${e.sentAt.slice(0, 4)}`,
    sections: e.sections.map((x) => ({ ...x, items: x.items.filter((i) => inScope(i, s.unit.id)).map((i) => ({ ...i, scopeLabel: scopeLabel(i), scopeKind: scopeKind(i) })) })).filter((x) => x.items.length),
  }));
  const withCount = scoped.map((e) => ({ ...e, count: e.sections.reduce((a, x) => a + x.items.length, 0) }));
  const latest = withCount[0];
  const archive = withCount.slice(1).filter((e) => has(f.q, e.intro, String(e.number), ...e.sections.flatMap((x) => x.items.map((i) => i.title))));
  const groups = Array.from(new Set(archive.map((e) => e.monthGroup))).map((label) => ({ label, items: archive.filter((e) => e.monthGroup === label) }));
  return { latest, groups, open: withCount.find((e) => e.id === f.edicao) };
}
