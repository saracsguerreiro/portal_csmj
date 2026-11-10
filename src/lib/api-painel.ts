import { albums as allAlbums, editions as sentEditions, photosOf, videos as allVideos } from "@/data/media";
import type { AdminEvent, AdminNews, AdminNotice } from "@/data/content";
import { people } from "@/data/people";
import { units } from "@/data/units";
import type { ContentStatus } from "@/data/types";
import { dateLong, dateShort, normalise, relative, timeOf } from "./format";
import { inScope, scopeKind, scopeLabel } from "./scope";
import type { Session } from "./session";
import { db, stateOf } from "./store";

export type Kind = "noticias" | "eventos" | "avisos";
export type AnyContent = AdminNews | AdminEvent | AdminNotice;

export const collectionOf = (kind: Kind): AnyContent[] => (kind === "noticias" ? db().news : kind === "eventos" ? db().events : db().notices);
const personName = (id?: string) => people.find((p) => p.id === id)?.name ?? "";
const dateOf = (x: AnyContent) => ("startsAt" in x ? x.startsAt : x.publishedAt);

/** Pessoas abrangidas por um âmbito: quem pertence às unidades escolhidas ou às de baixo. */
export function reach(scopes: string[]) {
  return people.filter((p) => inScope({ scopes }, p.unitId)).length;
}

export function noticeStats(n: AdminNotice) {
  const audience = people.filter((p) => inScope(n, p.unitId));
  const fromStore = audience.filter((p) => stateOf(p.id).confirmed.has(`${n.id}:${n.version}`)).map((p) => ({ personId: p.id, at: stateOf(p.id).confirmed.get(`${n.id}:${n.version}`)! }));
  const confirmed = [...n.confirmedBy.filter((c) => audience.some((p) => p.id === c.personId)), ...fromStore.filter((c) => !n.confirmedBy.some((x) => x.personId === c.personId))];
  const missing = audience.filter((p) => !confirmed.some((c) => c.personId === p.id));
  return { total: audience.length, confirmed, missing, pct: audience.length ? Math.round((confirmed.length / audience.length) * 100) : 0 };
}

/** Pode editar este conteúdo? Redactor: só os seus, enquanto não publicados. */
export function canEdit(s: Session, kind: Kind, x: AnyContent) {
  const publisher = kind === "avisos" ? s.can("notice.publish") : s.can("content.publish");
  if (publisher) return true;
  return s.can("content.draft") && x.meta.authorId === s.person.id && ["rascunho", "espera", "despublicado"].includes(x.meta.status);
}

export function canPublish(s: Session, kind: Kind) {
  return kind === "avisos" ? s.can("notice.publish") : s.can("content.publish");
}

export function rowOf(s: Session, kind: Kind, x: AnyContent) {
  const base = { id: x.id, slug: "slug" in x ? (x as AdminNews).slug : x.id, title: x.title, status: x.meta.status, scopeLabel: scopeLabel(x), scopeKind: scopeKind(x), langs: x.meta.langs, author: personName(x.meta.authorId), authorId: x.meta.authorId, dateLabel: dateShort(dateOf(x)), dateIso: dateOf(x), lockedBy: x.meta.lockedBy && x.meta.lockedBy !== s.person.id ? personName(x.meta.lockedBy) : undefined, editable: canEdit(s, kind, x), aiAssisted: x.meta.aiAssisted, tags: "tags" in x ? x.tags : [] };
  if (kind === "noticias") return { ...base, cover: (x as AdminNews).cover };
  if (kind === "eventos") { const e = x as AdminEvent; return { ...base, signups: e.taken ?? e.registrants.length, capacity: e.capacity }; }
  const n = x as AdminNotice;
  return { ...base, number: n.number, confirmPct: n.requireConfirm ? noticeStats(n).pct : undefined, closed: n.closed, hasConfirmations: n.confirmedBy.length > 0 };
}
export type ContentRow = ReturnType<typeof rowOf> & { cover?: string; signups?: number; capacity?: number; number?: string; confirmPct?: number; closed?: boolean; hasConfirmations?: boolean };

export function listContent(s: Session, kind: Kind, f: { separador?: string; q?: string; estado?: string; quem?: string; periodo?: string; etiqueta?: string; idioma?: string; autor?: string; pagina?: string }) {
  if (s.failing) throw new Error("falha simulada");
  const all = collectionOf(kind);
  const tab = f.separador ?? "todas";
  const base = all.filter((x) => (tab === "lixeira" ? x.meta.status === "lixeira" : x.meta.status !== "lixeira") && (tab !== "minhas" || x.meta.authorId === s.person.id));
  const now = Date.parse("2026-11-09T14:00:00+01:00");
  const items = base.filter((x) =>
    (!f.q || normalise(x.title).includes(normalise(f.q))) && (!f.estado || x.meta.status === f.estado) && (!f.quem || x.scopes.includes(f.quem)) &&
    (!f.periodo || (f.periodo === "d7" ? now - Date.parse(dateOf(x)) <= 7 * 864e5 && now >= Date.parse(dateOf(x)) - 30 * 864e5 : f.periodo === "d30" ? Math.abs(now - Date.parse(dateOf(x))) <= 30 * 864e5 : dateOf(x).startsWith(f.periodo.replace("y", "")))) &&
    (!f.etiqueta || ("tags" in x && x.tags.includes(f.etiqueta))) && (!f.idioma || x.meta.langs.includes(f.idioma)) && (!f.autor || x.meta.authorId === f.autor),
  ).sort((a, b) => b.meta.updatedAt.localeCompare(a.meta.updatedAt) || dateOf(b).localeCompare(dateOf(a)));
  const page = Math.max(1, Number(f.pagina) || 1);
  const per = 25;
  return {
    tab, total: items.length, page, pages: Math.max(1, Math.ceil(items.length / per)),
    items: items.slice((page - 1) * per, page * per).map((x) => rowOf(s, kind, x) as ContentRow),
    counts: { todas: all.filter((x) => x.meta.status !== "lixeira").length, minhas: all.filter((x) => x.meta.status !== "lixeira" && x.meta.authorId === s.person.id).length, lixeira: all.filter((x) => x.meta.status === "lixeira").length },
    tags: Array.from(new Set(all.flatMap((x) => ("tags" in x ? x.tags : [])))).sort(),
    authors: Array.from(new Set(all.map((x) => x.meta.authorId))).map((id) => ({ value: id, label: personName(id) })),
    canPublish: canPublish(s, kind), canCreate: kind === "avisos" ? s.can("notice.publish") : s.can("content.draft"),
  };
}

export function getContent(s: Session, kind: Kind, id: string) {
  const x = collectionOf(kind).find((c) => c.id === id);
  if (!x) return null;
  return { item: structuredClone(x), editable: canEdit(s, kind, x), canPublish: canPublish(s, kind), lockedBy: x.meta.lockedBy && x.meta.lockedBy !== s.person.id ? personName(x.meta.lockedBy) : undefined, authorName: personName(x.meta.authorId), notice: kind === "avisos" ? noticeStatsView(x as AdminNotice) : undefined, attendees: kind === "eventos" ? attendeesView(x as AdminEvent) : undefined };
}

const unitOf = (id: string) => units.find((u) => u.id === people.find((p) => p.id === id)?.unitId)?.short ?? "";

function noticeStatsView(n: AdminNotice) {
  const st = noticeStats(n);
  return { ...st, confirmed: st.confirmed.map((c) => ({ name: personName(c.personId), unit: unitOf(c.personId), at: c.at.includes("T") ? dateShort(c.at) : c.at })), missing: st.missing.map((p) => ({ id: p.id, name: p.name, unit: unitOf(p.id) })) };
}

function attendeesView(e: AdminEvent) {
  const map = (ids: string[]) => ids.map((id) => ({ id, name: personName(id), unit: unitOf(id) }));
  return { going: map(e.registrants), waitlist: map(e.waitlist), pending: map(e.pendingRegs), taken: e.taken ?? 0, capacity: e.capacity };
}

export function workView(s: Session) {
  if (s.failing) throw new Error("falha simulada");
  const d = db();
  const all = [...d.news.map((x) => ({ kind: "noticias" as Kind, x })), ...d.events.map((x) => ({ kind: "eventos" as Kind, x })), ...d.notices.map((x) => ({ kind: "avisos" as Kind, x }))];
  const publisher = s.can("content.publish");
  const waiting = d.news.filter((x) => x.meta.status === "espera").length;
  const returned = all.filter(({ x }) => x.meta.authorId === s.person.id && x.meta.returnedComment && x.meta.status === "rascunho").length;
  const noticeRows = d.notices.filter((n) => n.meta.status === "publicado" && n.requireConfirm && !n.closed).map((n) => ({ id: n.id, title: n.number ? `${n.number} · ${n.title}` : n.title, pct: noticeStats(n).pct, missing: noticeStats(n).missing.length, until: dateLong(new Date(Date.parse(n.publishedAt) + 7 * 864e5).toISOString()) }));
  const cards = [
    publisher && waiting > 0 && { id: "espera", n: waiting, href: "/painel/noticias?estado=espera", action: "rever" },
    returned > 0 && { id: "devolvidos", n: returned, href: "/painel/noticias?separador=minhas", action: "corrigir" },
    s.can("comments.moderate") && { id: "comentarios", n: 4, href: "/painel/comentarios", action: "moderar" },
    s.can("documents.manage") && publisher && { id: "caducam", n: 3, href: "/painel/documentos", action: "ver" },
    s.can("access.grant") && { id: "semAcesso", n: 18, href: "/painel/pessoas/acessos", action: "dar" },
    s.can("notice.publish") && noticeRows.some((r) => r.pct < 100) && { id: "confirmacoes", n: noticeRows.filter((r) => r.pct < 100).length, href: "/painel/avisos", action: "ver" },
    s.can("climate.manage") && { id: "clima", n: 1, href: "/painel/clima", action: "ver" },
    s.can("system.configure") && { id: "alertas", n: 1, href: "/painel/sistema/saude", action: "ver" },
  ].filter(Boolean) as { id: string; n: number; href: string; action: string }[];
  const drafts = all.filter(({ x }) => x.meta.authorId === s.person.id && x.meta.status === "rascunho").sort((a, b) => b.x.meta.updatedAt.localeCompare(a.x.meta.updatedAt)).slice(0, 5).map(({ kind, x }) => ({ id: x.id, kind, title: x.title, when: relative(x.meta.updatedAt), returned: x.meta.returnedComment }));
  const scheduled = all.filter(({ x }) => x.meta.status === "agendado").map(({ kind, x }) => ({ id: x.id, kind, title: x.title, when: `${dateShort(x.meta.scheduledAt ?? x.meta.updatedAt)} ${timeOf(x.meta.scheduledAt ?? x.meta.updatedAt)}` }));
  return {
    cards, drafts, scheduled, notices: s.can("notice.publish") ? noticeRows : [],
    showDrafts: s.can("content.draft"), showScheduled: publisher, showQuality: publisher || s.can("system.configure"), showWeek: publisher || s.can("system.configure"), showHealth: s.can("system.configure"),
    quality: { noAlt: 120, stale: 6, broken: 2 }, week: { pubs: 14, readers: "1 230", noResults: 6 },
    create: [s.can("content.draft") && "noticia", s.can("content.draft") && "evento", s.can("notice.publish") && "aviso", s.can("content.draft") && "album"].filter(Boolean) as ("noticia" | "evento" | "aviso" | "album")[],
  };
}

export const statusTone: Record<ContentStatus, "neu" | "warn" | "info" | "ok" | "err"> = { rascunho: "neu", espera: "warn", agendado: "info", publicado: "ok", despublicado: "neu", lixeira: "err" };

/* Multimédia e newsletter (A06, A07) */

export function mediaAdmin(s: Session) {
  if (s.failing) throw new Error("falha simulada");
  const list = allAlbums.map((a) => { const ph = photosOf(a); return { ...a, count: ph.length, noAlt: ph.filter((p) => !p.alt).length, cover: ph[0]?.src ?? a.cover, dateLabel: dateShort(a.happenedAt), scopeLabel: scopeLabel(a), isNew: !STATIC_ALBUM.has(a.id) }; });
  return { albums: list, videos: allVideos.map((v) => ({ ...v, dateLabel: dateShort(v.publishedAt), scopeLabel: scopeLabel(v) })), noAltTotal: list.reduce((n, a) => n + a.noAlt, 0) };
}
const STATIC_ALBUM = new Set(["a1", "a2", "a3", "a4", "a5", "a6"]);

export function albumAdmin(s: Session, id: string) {
  const a = allAlbums.find((x) => x.id === id);
  if (!a) return null;
  return { album: a, photos: photosOf(a), scopeLabel: scopeLabel(a) };
}

/** Edição da newsletter em preparação: peças publicadas desde a última edição enviada. */
export function newsletterAdmin(s: Session) {
  if (s.failing) throw new Error("falha simulada");
  const d = db();
  const draft = d.editions.find((e) => e.status === "rascunho")!;
  const lastSent = "2026-11-06T16:00:00+01:00";
  const pool = [
    ...d.news.filter((n) => n.meta.status === "publicado" && n.publishedAt > lastSent).map((n) => ({ id: `n:${n.id}`, kind: "Notícia", title: n.title, scope: scopeLabel(n), scopes: n.scopes, date: n.publishedAt })),
    ...d.events.filter((e) => e.meta.status === "publicado" && e.startsAt > "2026-11-09").slice(0, 3).map((e) => ({ id: `e:${e.id}`, kind: "Evento", title: e.title, scope: scopeLabel(e), scopes: e.scopes, date: e.startsAt })),
    ...d.notices.filter((n) => n.meta.status === "publicado" && n.publishedAt > lastSent).map((n) => ({ id: `a:${n.id}`, kind: "Aviso", title: n.title, scope: scopeLabel(n), scopes: n.scopes, date: n.publishedAt })),
  ];
  const ordered = [...draft.order.map((id) => pool.find((p) => p.id === id)).filter(Boolean) as typeof pool, ...pool.filter((p) => !draft.order.includes(p.id))];
  const pieces = ordered.filter((p) => !draft.removed.includes(p.id));
  const sentLocal = d.editions.filter((e) => e.status !== "rascunho");
  const number = 45 + sentLocal.length;
  return {
    draft: { ...draft, number, pieces, removedPieces: ordered.filter((p) => draft.removed.includes(p.id)) },
    history: [
      ...sentLocal.map((e, i) => ({ id: e.id, number: number - 1 - i, status: e.status, date: dateShort(e.sentAt ?? lastSent), intro: e.intro })),
      ...sentEditions.map((e) => ({ id: e.id, number: e.number, status: "enviada" as const, date: dateShort(e.sentAt), intro: e.intro })),
    ],
    recipients: people.length * 18,
    canSend: s.can("newsletter.send"),
    email: s.person.email,
  };
}
