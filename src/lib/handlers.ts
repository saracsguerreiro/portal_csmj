/** Pontos de escrita do protótipo. Numa API real seriam recursos HTTP com permissões verificadas no servidor;
 *  aqui correm no browser com as mesmas regras, para o protótipo poder ser publicado como site estático. */
import { notices } from "@/data/notices";
import { services } from "@/data/services";
import { rooms } from "@/data/rooms";
import { holidays } from "@/data/calendar";
import { events } from "@/data/events";
import { effectiveDecider, HOURS, stepDecider } from "./api-servicos";
import { inScope } from "./scope";
import { currentSession } from "./session";
import { db, extra, resetStore, stateOf } from "./store";
import { writePrefs } from "./prefs";
import { favoriteKeys } from "./api-documentos";
import { mySuggestionsSeed } from "@/data/institution";

export class ApiError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}
const fail = (msg: string, status = 400): never => { throw new ApiError(msg, status); };

export function handlePrefs(set: Record<string, string | null>, reset = false) {
  if (reset) resetStore();
  writePrefs(set);
}

export type ActionBody =
  | { action: "task.done" | "task.undo" | "task.postpone" | "task.unpostpone"; id: string }
  | { action: "notice.confirm"; id: string }
  | { action: "notifications.readAll" }
  | { action: "shortcuts.save"; ids: string[] }
  | { action: "event.set"; id: string; value: "none" | "going" | "waitlist" | "pending" }
  | { action: "reaction.set"; id: string; kind: string | null }
  | { action: "saved.toggle"; id: string }
  | { action: "poll.vote"; id: string; option: string }
  | { action: "comment.add"; id: string; text: string; replyTo?: string }
  | { action: "fav.toggle"; key: string }
  | { action: "fav.order"; keys: string[] }
  | { action: "climate.save"; answers: Record<string, string>; submit: boolean }
  | { action: "suggestion.add"; theme: string; text: string; anonymous: boolean }
  | { action: "welcome"; slug: string; text: string }
  | { action: "notif.pref"; key: string; value: boolean }
  | { action: "profile.save"; fields: Record<string, string> }
  | { action: "session.end"; id: string };

const stamp = () => new Intl.DateTimeFormat("pt-PT", { dateStyle: "short", timeStyle: "short", timeZone: "Africa/Luanda" }).format(new Date());

/** Ponto único de escrita do protótipo. Numa API real seriam recursos separados, com permissões verificadas. */
export function handleAction(body: ActionBody) {
  const s = currentSession();
  if (s.failing) fail("unavailable", 503);
  const st = stateOf(s.person.id);
  switch (body.action) {
    case "task.done":
      st.doneTasks.add(body.id);
      if (body.id === "t-evento") st.rsvp.set("e2", "going");
      break;
    case "task.undo":
      st.doneTasks.delete(body.id);
      if (body.id === "t-evento") st.rsvp.delete("e2");
      break;
    case "task.postpone": st.postponed.add(body.id); break;
    case "task.unpostpone": st.postponed.delete(body.id); break;
    case "notice.confirm": {
      const n = notices.find((x) => x.id === body.id);
      if (!n) fail("not-found", 404);
      st.confirmed.set(`${n!.id}:${n!.version}`, stamp());
      break;
    }
    case "notifications.readAll": st.readAll = true; break;
    case "shortcuts.save": st.shortcuts = body.ids.slice(0, 8); break;
    case "event.set":
      if (body.value === "none") st.rsvp.delete(body.id); else st.rsvp.set(body.id, body.value);
      if (body.id === "e2") { if (body.value === "none") st.doneTasks.delete("t-evento"); else st.doneTasks.add("t-evento"); }
      break;
    case "reaction.set":
      if (body.kind) st.reacted.set(body.id, body.kind); else st.reacted.delete(body.id);
      break;
    case "saved.toggle":
      if (st.saved.has(body.id)) st.saved.delete(body.id); else st.saved.add(body.id);
      break;
    case "poll.vote":
      st.votes.set(body.id, body.option);
      st.doneTasks.add(body.id);
      break;
    case "fav.toggle": {
      const keys = favoriteKeys(s);
      st.favorites = keys.includes(body.key) ? keys.filter((k) => k !== body.key) : [...keys, body.key];
      break;
    }
    case "fav.order": st.favorites = body.keys; break;
    case "climate.save":
      st.climate = { answers: body.answers, submitted: body.submit };
      if (body.submit) st.doneTasks.add("t-clima");
      break;
    case "suggestion.add": {
      if (!body.text.trim()) fail("Escreva a sua sugestão.");
      const list = st.suggestions ?? [...(mySuggestionsSeed[s.person.id] ?? [])];
      st.suggestions = [{ id: `s${Date.now()}`, theme: body.theme, text: body.text.trim(), status: "Recebida", at: new Date().toISOString(), anonymous: body.anonymous }, ...list];
      break;
    }
    case "welcome":
      if (!body.text.trim()) fail("Escreva a sua mensagem de boas-vindas.");
      if (!st.welcomes.includes(body.slug)) st.welcomes.push(body.slug);
      break;
    case "notif.pref": st.notifPrefs[body.key] = body.value; break;
    case "profile.save": st.profile = { ...st.profile, ...body.fields }; break;
    case "session.end": st.endedSessions.push(body.id); break;
    case "comment.add": {
      const text = body.text.trim();
      if (!text) fail("Escreva o comentário.");
      extra.comments.push({ id: `x${Date.now()}`, newsId: body.id, authorId: s.person.id, text, at: new Date().toISOString(), replyTo: body.replyTo });
      break;
    }
  }
  return { ok: true };
}

export type ServiceBody =
  | { action: "request.save"; serviceId: string; answers: Record<string, string>; summary: string; draftId?: string; send: boolean }
  | { action: "request.cancel" | "request.duplicate"; id: string }
  | { action: "request.resubmit"; id: string; answers: Record<string, string> }
  | { action: "decision"; id: string; verdict: "approve" | "return" | "refuse"; comment?: string }
  | { action: "decision.undo"; id: string }
  | { action: "booking.create"; roomId: string; date: string; start: string; end: string; subject: string; people: number }
  | { action: "booking.cancel" | "booking.restore"; id: string }
  | { action: "absence.save"; id?: string; start: string; end: string; substituteId: string; reason?: string; message?: string }
  | { action: "absence.end" | "absence.restore"; id: string; end?: string };

const nowIso = () => new Date().toISOString();
const err = (msg: string, status = 400): never => fail(msg, status);

/** Escrita dos serviços. Todas as regras são verificadas aqui, nunca só na interface. */
export function handleService(body: ServiceBody): Record<string, unknown> {
  const s = currentSession();
  if (s.failing) err("unavailable", 503);
  const d = db();
  const me = s.person.id;

  switch (body.action) {
    case "request.save": {
      const svc = services.find((x) => x.id === body.serviceId);
      if (!svc) return err("serviço inexistente", 404);
      const missing = svc.fields.filter((f) => f.required && !body.answers[f.id]?.trim());
      if (body.send && missing.length) return err(`Faltam campos obrigatórios: ${missing.map((f) => f.label).join(", ")}`);
      let r = body.draftId ? d.requests.find((x) => x.id === body.draftId && x.personId === me) : undefined;
      if (!r) {
        d.seq += 1;
        r = { id: `r${d.seq}`, number: d.seq, serviceId: svc.id, personId: me, status: "rascunho", createdAt: nowIso(), updatedAt: nowIso(), summary: body.summary, answers: {}, steps: [] };
        d.requests.push(r);
      }
      r.answers = body.answers;
      r.summary = body.summary;
      r.updatedAt = nowIso();
      r.steps = svc.steps.map((st, i) => ({ label: st.label, deciderId: stepDecider(svc, i, me), state: body.send && i === 0 ? "current" : "waiting", due: body.send && i === 0 ? new Date(Date.now() + st.days * 86400000).toISOString() : undefined }));
      if (body.send) r.status = "em-analise";
      const first = r.steps[0];
      const eff = first ? effectiveDecider(first.deciderId, me) : undefined;
      return ({ id: r.id, number: r.number, next: first ? { step: first.label, who: eff?.id } : undefined });
    }
    case "request.cancel": {
      const r = d.requests.find((x) => x.id === body.id && x.personId === me);
      if (!r || !["em-analise", "devolvido", "rascunho"].includes(r.status) || r.steps.some((x) => x.state === "done")) return err("Este pedido já não pode ser cancelado.");
      r.status = "cancelado"; r.updatedAt = nowIso();
      return ({ ok: true });
    }
    case "request.duplicate": {
      const r = d.requests.find((x) => x.id === body.id && x.personId === me);
      if (!r) return err("não encontrado", 404);
      d.seq += 1;
      const copy = { ...structuredClone(r), id: `r${d.seq}`, number: d.seq, status: "rascunho" as const, createdAt: nowIso(), updatedAt: nowIso() };
      copy.steps = copy.steps.map((x) => ({ label: x.label, deciderId: x.deciderId, state: "waiting" as const }));
      d.requests.push(copy);
      return ({ id: copy.id });
    }
    case "request.resubmit": {
      const r = d.requests.find((x) => x.id === body.id && x.personId === me && x.status === "devolvido");
      if (!r) return err("Este pedido não está devolvido.");
      r.answers = { ...r.answers, ...body.answers };
      const i = r.steps.findIndex((x) => x.state === "returned");
      r.steps[i] = { ...r.steps[i], state: "current", due: new Date(Date.now() + 86400000).toISOString() };
      r.status = "em-analise"; r.updatedAt = nowIso();
      return ({ ok: true });
    }
    case "decision": {
      const r = d.requests.find((x) => x.id === body.id);
      const i = r ? r.steps.findIndex((x) => x.state === "current") : -1;
      if (!r || i < 0) return err("Este pedido já foi decidido.", 409);
      if (r.personId === me) return err("Ninguém decide os próprios pedidos.", 403);
      if (effectiveDecider(r.steps[i].deciderId, r.personId).id !== me) return err("Não é quem decide este passo.", 403);
      if (body.verdict !== "approve" && !body.comment?.trim()) return err("Escreva o motivo para quem pediu.");
      const step = r.steps[i];
      Object.assign(step, { at: nowIso(), byId: me, comment: body.comment?.trim() || undefined, state: body.verdict === "approve" ? "done" : body.verdict === "return" ? "returned" : "refused" });
      if (body.verdict === "approve") {
        if (r.steps[i + 1]) { r.steps[i + 1].state = "current"; r.steps[i + 1].due = new Date(Date.now() + 2 * 86400000).toISOString(); } else r.status = "aprovado";
      } else r.status = body.verdict === "return" ? "devolvido" : "recusado";
      r.updatedAt = nowIso();
      return ({ ok: true, status: r.status });
    }
    case "decision.undo": {
      const r = d.requests.find((x) => x.id === body.id);
      const i = r ? r.steps.map((x) => x.byId).lastIndexOf(me) : -1;
      if (!r || i < 0 || r.steps[i].state !== "done") return err("Já não é possível desfazer.");
      if (r.steps[i + 1]) { r.steps[i + 1].state = "waiting"; r.steps[i + 1].due = undefined; }
      Object.assign(r.steps[i], { state: "current", at: undefined, byId: undefined, comment: undefined });
      r.status = "em-analise";
      return ({ ok: true });
    }
    case "booking.create": {
      const room = rooms.find((x) => x.id === body.roomId);
      if (!room) return err("sala inexistente", 404);
      if (holidays.some((h) => h.date === body.date)) return err("Neste dia não há reservas: é feriado.");
      const a = HOURS.indexOf(body.start); const b = body.end === "18:00" ? 20 : HOURS.indexOf(body.end);
      if (a < 0 || b <= a) return err("Escolha uma hora de fim depois da hora de início.");
      if (body.people > room.seats) return err(`A ${room.name} tem ${room.seats} lugares.`);
      const clash = d.bookings.some((x) => x.roomId === room.id && x.date === body.date && x.start < body.end && x.end > body.start);
      if (clash) return err("Este horário já não está livre. Escolha outro espaço na grelha.", 409);
      d.seq += 1;
      d.bookings.push({ id: `b${d.seq}`, roomId: room.id, date: body.date, start: body.start, end: body.end, status: "pendente", personId: me, subject: body.subject.trim() || "Reunião" });
      return ({ id: `b${d.seq}` });
    }
    case "booking.cancel": {
      const i = d.bookings.findIndex((x) => x.id === body.id && x.personId === me);
      if (i < 0) return err("não encontrada", 404);
      const [removed] = d.bookings.splice(i, 1);
      d.trash[removed.id] = removed;
      return ({ ok: true });
    }
    case "booking.restore": {
      if (d.trash[body.id]) { d.bookings.push(d.trash[body.id]); delete d.trash[body.id]; }
      return ({ ok: true });
    }
    case "absence.save": {
      if (!body.start || !body.end || body.end < body.start) return err("A data de fim tem de ser depois da data de início.");
      if (!body.substituteId) return err("Escolha quem o substitui.");
      if (body.substituteId === me) return err("Escolha outra pessoa para o substituir.");
      const subAway = d.absences.find((a) => a.personId === body.substituteId && a.start <= body.end && a.end >= body.start);
      let a = body.id ? d.absences.find((x) => x.id === body.id && x.personId === me) : undefined;
      if (!a) { d.seq += 1; a = { id: `aus${d.seq}`, personId: me, start: "", end: "", substituteId: "", markedBy: me }; d.absences.push(a); }
      Object.assign(a, { start: body.start, end: body.end, substituteId: body.substituteId, reason: body.reason || undefined, message: body.message || undefined });
      return ({ id: a.id, warning: subAway ? "O substituto também está ausente em parte deste período. Os pedidos seguem para o substituto dele." : undefined });
    }
    case "absence.end": {
      const a = d.absences.find((x) => x.id === body.id && x.personId === me);
      if (!a) return err("não encontrada", 404);
      const before = a.end;
      a.end = "2026-11-08";
      return ({ ok: true, before });
    }
    case "absence.restore": {
      const a = d.absences.find((x) => x.id === body.id && x.personId === me);
      if (a && body.end) a.end = body.end;
      return ({ ok: true });
    }
  }
}

export function buildIcs(only?: string) {
  const s = currentSession();
  const list = events.filter((e) => inScope(e, s.unit.id) && (!only || e.slug === only));
  return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//CSMJ//Intranet//PT", ...list.flatMap((e) => ["BEGIN:VEVENT", `UID:${e.id}@intranet.csmj`, `DTSTAMP:${stamp2(e.publishedAt)}`, `DTSTART:${stamp2(e.startsAt)}`, `DTEND:${stamp2(e.endsAt)}`, `SUMMARY:${e.title}`, `LOCATION:${e.place ?? "Online"}`, "END:VEVENT"]), "END:VCALENDAR"].join("\r\n");
}
const stamp2 = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
