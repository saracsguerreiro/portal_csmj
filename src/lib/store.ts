/** Estado do protótipo: substitui o que uma API real guardaria. No browser fica guardado em localStorage. */
import { requests as seedRequests } from "@/data/services";
import { absences as seedAbsences, bookings as seedBookings } from "@/data/rooms";
import type { Absence, Booking, Comment, RequestItem, Suggestion } from "@/data/types";

type PersonState = { doneTasks: Set<string>; postponed: Set<string>; confirmed: Map<string, string>; readAll: boolean; read: Set<string>; shortcuts?: string[]; rsvp: Map<string, "going" | "waitlist" | "pending">; reacted: Map<string, string>; saved: Set<string>; votes: Map<string, string>; favorites?: string[]; climate?: { answers: Record<string, string>; submitted: boolean }; suggestions?: Suggestion[]; welcomes: string[]; notifPrefs: Record<string, boolean>; profile: Record<string, string>; endedSessions: string[] };
type Extra = { comments: Comment[] };
type Db = { requests: RequestItem[]; bookings: Booking[]; absences: Absence[]; seq: number; trash: Record<string, Booking> };

const fresh = (): Db => ({ requests: structuredClone(seedRequests), bookings: structuredClone(seedBookings), absences: structuredClone(seedAbsences), seq: 30, trash: {} });
const emptyPerson = (): PersonState => ({ doneTasks: new Set(), postponed: new Set(), confirmed: new Map(), readAll: false, read: new Set(), rsvp: new Map(), reacted: new Map(), saved: new Set(), votes: new Map(), welcomes: [], notifPrefs: {}, profile: {}, endedSessions: [] });

let people = new Map<string, PersonState>();
export const extra: Extra = { comments: [] };
let database: Db = fresh();

export function stateOf(personId: string): PersonState {
  if (!people.has(personId)) people.set(personId, emptyPerson());
  return people.get(personId)!;
}

/** Pedidos, reservas e ausências partilhados entre perfis (as decisões cruzam pessoas). */
export function db(): Db {
  return database;
}

export function resetStore() {
  database = fresh();
  people = new Map();
  extra.comments = [];
  persist();
}

const KEY = "csmj_dados_v1";

export function persist() {
  if (typeof window === "undefined") return;
  const ser = Object.fromEntries([...people].map(([k, v]) => [k, { ...v, doneTasks: [...v.doneTasks], postponed: [...v.postponed], confirmed: [...v.confirmed], read: [...v.read], rsvp: [...v.rsvp], reacted: [...v.reacted], saved: [...v.saved], votes: [...v.votes] }]));
  try { localStorage.setItem(KEY, JSON.stringify({ people: ser, comments: extra.comments, db: database })); } catch { /* sem espaço ou bloqueado */ }
}

export function restore() {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    people = new Map(Object.entries(data.people ?? {}).map(([k, v]) => {
      const x = v as Record<string, unknown>;
      return [k, { ...emptyPerson(), ...x, doneTasks: new Set(x.doneTasks as string[]), postponed: new Set(x.postponed as string[]), confirmed: new Map(x.confirmed as [string, string][]), read: new Set(x.read as string[]), rsvp: new Map(x.rsvp as [string, "going"][]), reacted: new Map(x.reacted as [string, string][]), saved: new Set(x.saved as string[]), votes: new Map(x.votes as [string, string][]) } as PersonState];
    }));
    extra.comments = data.comments ?? [];
    database = { ...fresh(), ...data.db };
  } catch { /* dados antigos ou corrompidos: começa de novo */ }
}
