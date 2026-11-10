import "server-only";

/** Estado em memória: substitui o que uma API real guardaria. Reposto ao reiniciar. */
type PersonState = { doneTasks: Set<string>; postponed: Set<string>; confirmed: Map<string, string>; readAll: boolean; read: Set<string>; shortcuts?: string[]; rsvp: Map<string, "going" | "waitlist" | "pending">; reacted: Map<string, string>; saved: Set<string>; votes: Map<string, string> };
type Extra = { comments: import("@/data/types").Comment[] };

const g = globalThis as unknown as { __csmjStore?: Map<string, PersonState> };
const store = (g.__csmjStore ??= new Map());
const g2 = globalThis as unknown as { __csmjExtra?: Extra };
export const extra: Extra = (g2.__csmjExtra ??= { comments: [] });

export function stateOf(personId: string): PersonState {
  if (!store.has(personId)) store.set(personId, { doneTasks: new Set(), postponed: new Set(), confirmed: new Map(), readAll: false, read: new Set(), rsvp: new Map(), reacted: new Map(), saved: new Set(), votes: new Map() });
  return store.get(personId)!;
}

import { requests as seedRequests } from "@/data/services";
import { absences as seedAbsences, bookings as seedBookings } from "@/data/rooms";
import type { Absence, Booking, RequestItem } from "@/data/types";

type Db = { requests: RequestItem[]; bookings: Booking[]; absences: Absence[]; seq: number };
const g3 = globalThis as unknown as { __csmjDb?: Db };
const fresh = (): Db => ({ requests: structuredClone(seedRequests), bookings: structuredClone(seedBookings), absences: structuredClone(seedAbsences), seq: 30 });

/** Pedidos, reservas e ausências partilhados entre pessoas (decisões cruzam perfis). */
export function db(): Db {
  return (g3.__csmjDb ??= fresh());
}

export function resetStore() {
  g3.__csmjDb = fresh();
  store.clear();
  extra.comments = [];
}
