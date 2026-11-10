import { NextResponse } from "next/server";
import { services } from "@/data/services";
import { rooms } from "@/data/rooms";
import { holidays } from "@/data/calendar";
import { effectiveDecider, HOURS, stepDecider } from "@/lib/api-servicos";
import { getSession } from "@/lib/session";
import { db } from "@/lib/store";

type Body =
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
const err = (msg: string, status = 400) => NextResponse.json({ error: msg }, { status });

/** Escrita dos serviços. Todas as regras são verificadas aqui, nunca só na interface. */
export async function POST(req: Request) {
  const s = await getSession();
  if (s.failing) return err("unavailable", 503);
  const body = (await req.json()) as Body;
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
      return NextResponse.json({ id: r.id, number: r.number, next: first ? { step: first.label, who: eff?.id } : undefined });
    }
    case "request.cancel": {
      const r = d.requests.find((x) => x.id === body.id && x.personId === me);
      if (!r || !["em-analise", "devolvido", "rascunho"].includes(r.status) || r.steps.some((x) => x.state === "done")) return err("Este pedido já não pode ser cancelado.");
      r.status = "cancelado"; r.updatedAt = nowIso();
      return NextResponse.json({ ok: true });
    }
    case "request.duplicate": {
      const r = d.requests.find((x) => x.id === body.id && x.personId === me);
      if (!r) return err("não encontrado", 404);
      d.seq += 1;
      const copy = { ...structuredClone(r), id: `r${d.seq}`, number: d.seq, status: "rascunho" as const, createdAt: nowIso(), updatedAt: nowIso() };
      copy.steps = copy.steps.map((x) => ({ label: x.label, deciderId: x.deciderId, state: "waiting" as const }));
      d.requests.push(copy);
      return NextResponse.json({ id: copy.id });
    }
    case "request.resubmit": {
      const r = d.requests.find((x) => x.id === body.id && x.personId === me && x.status === "devolvido");
      if (!r) return err("Este pedido não está devolvido.");
      r.answers = { ...r.answers, ...body.answers };
      const i = r.steps.findIndex((x) => x.state === "returned");
      r.steps[i] = { ...r.steps[i], state: "current", due: new Date(Date.now() + 86400000).toISOString() };
      r.status = "em-analise"; r.updatedAt = nowIso();
      return NextResponse.json({ ok: true });
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
      return NextResponse.json({ ok: true, status: r.status });
    }
    case "decision.undo": {
      const r = d.requests.find((x) => x.id === body.id);
      const i = r ? r.steps.map((x) => x.byId).lastIndexOf(me) : -1;
      if (!r || i < 0 || r.steps[i].state !== "done") return err("Já não é possível desfazer.");
      if (r.steps[i + 1]) { r.steps[i + 1].state = "waiting"; r.steps[i + 1].due = undefined; }
      Object.assign(r.steps[i], { state: "current", at: undefined, byId: undefined, comment: undefined });
      r.status = "em-analise";
      return NextResponse.json({ ok: true });
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
      return NextResponse.json({ id: `b${d.seq}` });
    }
    case "booking.cancel": {
      const i = d.bookings.findIndex((x) => x.id === body.id && x.personId === me);
      if (i < 0) return err("não encontrada", 404);
      const [removed] = d.bookings.splice(i, 1);
      (globalThis as unknown as { __csmjTrash?: Record<string, unknown> }).__csmjTrash = { ...((globalThis as unknown as { __csmjTrash?: Record<string, unknown> }).__csmjTrash ?? {}), [removed.id]: removed };
      return NextResponse.json({ ok: true });
    }
    case "booking.restore": {
      const trash = (globalThis as unknown as { __csmjTrash?: Record<string, typeof d.bookings[number]> }).__csmjTrash ?? {};
      if (trash[body.id]) d.bookings.push(trash[body.id]);
      return NextResponse.json({ ok: true });
    }
    case "absence.save": {
      if (!body.start || !body.end || body.end < body.start) return err("A data de fim tem de ser depois da data de início.");
      if (!body.substituteId) return err("Escolha quem o substitui.");
      if (body.substituteId === me) return err("Escolha outra pessoa para o substituir.");
      const subAway = d.absences.find((a) => a.personId === body.substituteId && a.start <= body.end && a.end >= body.start);
      let a = body.id ? d.absences.find((x) => x.id === body.id && x.personId === me) : undefined;
      if (!a) { d.seq += 1; a = { id: `aus${d.seq}`, personId: me, start: "", end: "", substituteId: "", markedBy: me }; d.absences.push(a); }
      Object.assign(a, { start: body.start, end: body.end, substituteId: body.substituteId, reason: body.reason || undefined, message: body.message || undefined });
      return NextResponse.json({ id: a.id, warning: subAway ? "O substituto também está ausente em parte deste período. Os pedidos seguem para o substituto dele." : undefined });
    }
    case "absence.end": {
      const a = d.absences.find((x) => x.id === body.id && x.personId === me);
      if (!a) return err("não encontrada", 404);
      const before = a.end;
      a.end = "2026-11-08";
      return NextResponse.json({ ok: true, before });
    }
    case "absence.restore": {
      const a = d.absences.find((x) => x.id === body.id && x.personId === me);
      if (a && body.end) a.end = body.end;
      return NextResponse.json({ ok: true });
    }
  }
}
