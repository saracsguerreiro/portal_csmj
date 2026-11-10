/** Escritas do painel. As permissões são verificadas aqui, nunca só na interface. */
import type { AdminEvent, AdminNews, AdminNotice } from "@/data/content";
import type { ContentStatus } from "@/data/types";
import { asset } from "./assets";
import { ApiError } from "./handlers";
import { canEdit, canPublish, collectionOf, noticeStats, type AnyContent, type Kind } from "./api-painel";
import { currentSession } from "./session";
import { db } from "./store";
import { albums as albumsAll_, baseKeys, photosOf } from "@/data/media";

const albumsAll = () => albumsAll_;

const fail = (msg: string, status = 400): never => { throw new ApiError(msg, status); };
const now = () => new Date().toISOString();
const slugify = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "conteudo";

export type AdminBody =
  | { action: "content.save"; kind: Kind; id?: string; data: Partial<AnyContent> & { html?: string }; intent: "draft" | "publish" | "request" | "schedule"; scheduledAt?: string; aiAssisted?: boolean; newVersion?: boolean }
  | { action: "content.status"; kind: Kind; ids: string[]; status: ContentStatus }
  | { action: "content.duplicate" | "content.translate"; kind: Kind; id: string }
  | { action: "content.return"; kind: Kind; id: string; comment: string }
  | { action: "content.tags"; kind: Kind; ids: string[]; tags: string[] }
  | { action: "content.restoreVersion"; kind: Kind; id: string; title: string }
  | { action: "notice.remind" | "notice.close"; id: string }
  | { action: "event.approveReg" | "event.promote"; id: string; personId: string }
  | { action: "media.photo"; key: string; caption?: string; alt?: string; credit?: string }
  | { action: "media.remove"; keys: string[] }
  | { action: "media.order"; albumId: string; keys: string[] }
  | { action: "media.album"; id?: string; title: string; happenedAt: string; description: string; scopes: string[] }
  | { action: "media.upload"; albumId: string; count: number }
  | { action: "media.move"; keys: string[]; from: string; to: string }
  | { action: "media.number"; albumId: string }
  | { action: "media.altAll"; items: { key: string; alt: string }[] }
  | { action: "media.video"; title: string; link: string; duration: string; scopes: string[] }
  | { action: "newsletter.save"; id: string; intro: string; removed: string[]; order: string[] }
  | { action: "newsletter.send" | "newsletter.cancel" | "newsletter.generate"; id: string };

function nextId(prefix: string) { const d = db(); d.seq += 1; return `${prefix}${d.seq}`; }

export function handleAdmin(body: AdminBody): Record<string, unknown> {
  const s = currentSession();
  if (s.failing) fail("unavailable", 503);
  if (!s.canUseAdmin) fail("O seu perfil não tem acesso ao painel.", 403);
  const d = db();
  switch (body.action) {
    case "content.save": {
      const list = collectionOf(body.kind);
      let x = body.id ? list.find((c) => c.id === body.id) : undefined;
      if (x && !canEdit(s, body.kind, x)) fail("Não pode editar este conteúdo.", 403);
      if (x?.meta.lockedBy && x.meta.lockedBy !== s.person.id) fail("Outra pessoa está a editar este conteúdo.", 409);
      if ((body.intent === "publish" || body.intent === "schedule") && !canPublish(s, body.kind)) fail("O seu perfil pode pedir publicação, mas não publicar.", 403);
      if (!body.data.title?.trim()) fail("Escreva o título.");
      if (body.kind === "noticias" && body.intent !== "draft" && !(body.data as Partial<AdminNews>).coverAlt?.trim()) fail("Escreva o texto alternativo da capa.");
      const status: ContentStatus = body.intent === "publish" ? "publicado" : body.intent === "schedule" ? "agendado" : body.intent === "request" ? "espera" : x?.meta.status === "publicado" ? "publicado" : "rascunho";
      if (!x) {
        const id = nextId(body.kind === "noticias" ? "nn" : body.kind === "eventos" ? "ne" : "na");
        const base = { id, slug: `${slugify(body.data.title ?? "")}-${id}`, scopes: ["nacional"], publishedAt: now(), meta: { status, authorId: s.person.id, langs: ["PT"], featured: false, comments: true, aiAssisted: false, updatedAt: now(), history: [] } };
        x = (body.kind === "noticias" ? { ...base, title: "", summary: "", cover: asset("/covers/colunata.svg"), coverAlt: "", tags: [], authorId: s.person.id } as AdminNews
          : body.kind === "eventos" ? { ...base, title: "", startsAt: now(), endsAt: now(), mode: "presencial", organizer: "Secretaria-Geral", tags: [], description: [], registrants: [], waitlist: [], pendingRegs: [], reminder: true } as AdminEvent
          : { ...base, title: "", kind: "aviso", mandatory: true, version: 1, body: [], confirmedBy: [], requireConfirm: true, blockPortal: false, reminderDays: 3, escalateDays: 7 } as unknown as AdminNotice) as AnyContent;
        list.unshift(x as never);
      }
      const wasPublished = x.meta.status === "publicado";
      const { meta: m, ...rest } = body.data as Partial<AnyContent>;
      Object.assign(x, rest);
      if (m) { x.meta.featured = m.featured ?? x.meta.featured; x.meta.comments = m.comments ?? x.meta.comments; }
      if (body.kind === "avisos" && body.newVersion && wasPublished) { (x as AdminNotice).version += 1; (x as AdminNotice).confirmedBy = []; }
      if (body.kind === "avisos") (x as AdminNotice).mandatory = (x as AdminNotice).requireConfirm;
      x.meta.status = status;
      x.meta.updatedAt = now();
      x.meta.returnedComment = body.intent === "request" ? undefined : x.meta.returnedComment;
      if (body.aiAssisted) x.meta.aiAssisted = true;
      if (status === "agendado") x.meta.scheduledAt = body.scheduledAt;
      if (status === "publicado" && !wasPublished) x.publishedAt = body.kind === "eventos" ? x.publishedAt : now();
      x.meta.history.unshift({ at: now(), byId: s.person.id, label: status === "publicado" ? "Publicação" : status === "espera" ? "Pedido de publicação" : "Gravação", title: x.title });
      return { id: x.id, status, slug: "slug" in x ? x.slug : x.id };
    }
    case "content.status": {
      const list = collectionOf(body.kind);
      if ((body.status === "publicado" || body.status === "despublicado") && !canPublish(s, body.kind)) fail("O seu perfil não pode publicar nem despublicar.", 403);
      let done = 0;
      for (const id of body.ids) {
        const x = list.find((c) => c.id === id);
        if (!x) continue;
        if (body.status === "lixeira" && body.kind === "avisos" && (x as AdminNotice).confirmedBy.length) fail("Um aviso com confirmações não se apaga, só se encerra.");
        if (body.status === "lixeira" && !canEdit(s, body.kind, x)) continue;
        x.meta.status = body.status;
        x.meta.updatedAt = now();
        done += 1;
      }
      return { done };
    }
    case "content.duplicate":
    case "content.translate": {
      const list = collectionOf(body.kind);
      const x = list.find((c) => c.id === body.id);
      if (!x) fail("não encontrado", 404);
      const id = nextId("dup");
      const copy = { ...structuredClone(x!), id, title: body.action === "content.translate" ? `[EN] ${x!.title}` : `${x!.title} (cópia)` } as AnyContent;
      if ("slug" in copy) (copy as AdminNews).slug = `${(copy as AdminNews).slug}-${id}`;
      copy.meta = { ...copy.meta, status: "rascunho", authorId: s.person.id, langs: body.action === "content.translate" ? ["EN"] : copy.meta.langs, updatedAt: now(), history: [], lockedBy: undefined };
      if (body.action === "content.translate" && !x!.meta.langs.includes("EN")) x!.meta.langs = [...x!.meta.langs, "EN"];
      list.unshift(copy as never);
      return { id };
    }
    case "content.return": {
      if (!canPublish(s, body.kind)) fail("Só quem publica pode devolver.", 403);
      if (!body.comment.trim()) fail("Escreva o comentário para o autor.");
      const x = collectionOf(body.kind).find((c) => c.id === body.id);
      if (!x) fail("não encontrado", 404);
      x!.meta.status = "rascunho";
      x!.meta.returnedComment = body.comment.trim();
      x!.meta.updatedAt = now();
      return { ok: true };
    }
    case "content.tags": {
      collectionOf(body.kind).filter((c) => body.ids.includes(c.id)).forEach((c) => { if ("tags" in c) (c as AdminNews).tags = body.tags; });
      return { ok: true };
    }
    case "content.restoreVersion": {
      const x = collectionOf(body.kind).find((c) => c.id === body.id);
      if (x) { x.title = body.title; x.meta.updatedAt = now(); }
      return { ok: true };
    }
    case "notice.remind": {
      const n = d.notices.find((x) => x.id === body.id);
      return { sent: n ? noticeStats(n).missing.length : 0 };
    }
    case "notice.close": {
      if (!s.can("notice.publish")) fail("Sem permissão.", 403);
      const n = d.notices.find((x) => x.id === body.id);
      if (n) n.closed = true;
      return { ok: true };
    }
    case "event.approveReg":
    case "event.promote": {
      const e = d.events.find((x) => x.id === body.id);
      if (!e) fail("não encontrado", 404);
      const from = body.action === "event.approveReg" ? e!.pendingRegs : e!.waitlist;
      const i = from.indexOf(body.personId);
      if (i >= 0) { from.splice(i, 1); e!.registrants.push(body.personId); }
      return { ok: true };
    }
    case "media.photo": d.photoMeta[body.key] = { ...d.photoMeta[body.key], caption: body.caption, alt: body.alt, credit: body.credit }; return { ok: true };
    case "media.remove": body.keys.forEach((k) => { d.photoMeta[k] = { ...d.photoMeta[k], removed: true }; }); return { ok: true };
    case "media.order": d.albumOrder[body.albumId] = body.keys; return { ok: true };
    case "media.album": {
      if (!s.can("content.draft")) fail("Sem permissão.", 403);
      if (!body.title.trim()) fail("Escreva o título do álbum.");
      const existing = d.extraAlbums.find((a) => a.id === body.id);
      if (existing) { Object.assign(existing, { title: body.title.trim(), happenedAt: body.happenedAt, description: body.description, scopes: body.scopes }); return { id: existing.id }; }
      const id = nextId("al");
      d.extraAlbums.unshift({ id, slug: `${slugify(body.title)}-${id}`, title: body.title.trim(), happenedAt: body.happenedAt, description: body.description, tags: [], cover: asset("/album/f1.svg"), coverAlt: "", total: 0, scopes: body.scopes });
      d.albumOrder[id] = [];
      return { id };
    }
    case "media.upload": {
      const a = albumsAll().find((x) => x.id === body.albumId);
      if (!a) fail("não encontrado", 404);
      const keys = d.albumOrder[body.albumId] ?? baseKeys(a!);
      const added = Array.from({ length: body.count }, () => `${body.albumId}:u${(d.seq += 1)}`);
      d.albumOrder[body.albumId] = [...keys, ...added];
      return { added };
    }
    case "media.move": {
      const fromA = albumsAll().find((x) => x.id === body.from); const toA = albumsAll().find((x) => x.id === body.to);
      if (!fromA || !toA) fail("não encontrado", 404);
      d.albumOrder[body.from] = (d.albumOrder[body.from] ?? baseKeys(fromA!)).filter((k) => !body.keys.includes(k));
      d.albumOrder[body.to] = [...(d.albumOrder[body.to] ?? baseKeys(toA!)), ...body.keys];
      return { ok: true };
    }
    case "media.number": {
      const a = albumsAll().find((x) => x.id === body.albumId);
      if (a) photosOf(a).forEach((p, i) => { const base = (p.caption || a.title).replace(/^\d+\. /, ""); d.photoMeta[p.key!] = { ...d.photoMeta[p.key!], caption: `${i + 1}. ${base}` }; });
      return { ok: true };
    }
    case "media.altAll": body.items.forEach((it) => { d.photoMeta[it.key] = { ...d.photoMeta[it.key], alt: it.alt }; }); return { ok: true };
    case "media.video": {
      if (!body.title.trim()) fail("Escreva o título do vídeo.");
      if (!/^https:\/\/(www\.)?(youtube\.com|youtu\.be|vimeo\.com)\//.test(body.link)) fail("Use uma ligação do YouTube ou do Vimeo.");
      d.extraVideos.unshift({ id: nextId("vid"), title: body.title.trim(), poster: asset("/covers/plenario.svg"), duration: body.duration || "—", publishedAt: now(), tags: [], scopes: body.scopes });
      return { ok: true };
    }
    case "newsletter.save": {
      const e = d.editions.find((x) => x.id === body.id);
      if (e) Object.assign(e, { intro: body.intro, removed: body.removed, order: body.order });
      return { ok: true };
    }
    case "newsletter.send":
    case "newsletter.cancel": {
      if (!s.can("newsletter.send")) fail("Sem permissão.", 403);
      const e = d.editions.find((x) => x.id === body.id);
      if (e) { e.status = body.action === "newsletter.send" ? "enviada" : "cancelada"; e.sentAt = now(); }
      if (body.action === "newsletter.send" || body.action === "newsletter.cancel") d.editions.unshift({ id: nextId("ed-"), status: "rascunho", intro: "", removed: [], order: [] });
      return { ok: true };
    }
    case "newsletter.generate": {
      const e = d.editions.find((x) => x.id === body.id);
      if (e) { e.removed = []; e.order = []; }
      return { ok: true };
    }
  }
}
