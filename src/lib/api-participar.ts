import { climate, implementedSuggestions, mySuggestionsSeed, polls } from "@/data/institution";
import { notifications } from "@/data/notifications";
import { dateLong, dateShort, relative } from "./format";
import { inScope } from "./scope";
import type { Session } from "./session";
import { stateOf } from "./store";

export function pollsView(s: Session) {
  if (s.failing) throw new Error("falha simulada");
  const st = stateOf(s.person.id);
  const visible = polls.filter((p) => inScope(p, s.unit.id));
  const view = (p: (typeof polls)[number]) => {
    const key = p.taskId ?? p.id;
    const voted = st.votes.get(key);
    const results = (p.results ?? p.options.map(() => 0)).map((n, i) => n + (voted === p.options[i] ? 1 : 0));
    const total = results.reduce((a, b) => a + b, 0);
    return { ...p, key, voted, closesLabel: dateLong(p.closesAt).replace(/ de \d{4}$/, ""), total, pct: results.map((n) => (total ? Math.round((n / total) * 100) : 0)), results, showResults: !!p.closed || (p.live && !!voted) };
  };
  return { open: visible.filter((p) => !p.closed).slice(0, 3).map(view), closed: visible.filter((p) => p.closed).map(view) };
}

export function climateView(s: Session) {
  const st = stateOf(s.person.id);
  return { ...climate, closesLabel: dateLong(climate.closesAt), submitted: !!st.climate?.submitted, answers: st.climate?.answers ?? {} };
}

export function suggestionsView(s: Session) {
  if (s.failing) throw new Error("falha simulada");
  const st = stateOf(s.person.id);
  const mine = st.suggestions ?? mySuggestionsSeed[s.person.id] ?? [];
  return { mine: mine.map((x) => ({ ...x, atLabel: dateShort(x.at) })), implemented: implementedSuggestions };
}

export const NOTIF_TYPES = [
  { id: "approval", label: "Aprovação pendente" }, { id: "reply", label: "Resposta a pedido" }, { id: "notice", label: "Aviso novo" }, { id: "mention", label: "Menção" },
  { id: "comment", label: "Resposta a comentário" }, { id: "newsletter", label: "Newsletter" }, { id: "event", label: "Evento alterado" }, { id: "reminder", label: "Lembrete de evento" },
] as const;

export function notificationsPage(s: Session, f: { tipo?: string; periodo?: string }) {
  if (s.failing) throw new Error("falha simulada");
  const st = stateOf(s.person.id);
  const now = new Date("2026-11-09T14:00:00+01:00").getTime();
  const days = f.periodo === "d7" ? 7 : f.periodo === "d30" ? 30 : undefined;
  return notifications.filter((n) => (!f.tipo || n.kind === f.tipo) && (!days || now - new Date(n.at).getTime() <= days * 86400000)).map((n) => ({ ...n, read: !!n.read || st.readAll || st.read.has(n.id), atLabel: relative(n.at) }));
}

export function notifPrefs(s: Session) {
  const st = stateOf(s.person.id);
  return NOTIF_TYPES.map((tp) => ({ ...tp, bell: st.notifPrefs[`${tp.id}:bell`] ?? true, email: st.notifPrefs[`${tp.id}:email`] ?? ["approval", "notice", "reply"].includes(tp.id) }));
}
