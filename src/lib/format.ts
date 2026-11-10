import { entity } from "@/config/entity";

const tz = { timeZone: entity.timeZone } as const;

export const dateLong = (iso: string) => new Intl.DateTimeFormat("pt-PT", { ...tz, day: "numeric", month: "long", year: "numeric" }).format(new Date(iso)).replace(/ de ([a-zç]+) de /, (_m, mo: string) => ` de ${mo[0].toUpperCase()}${mo.slice(1)} de `);
export const dateShort = (iso: string) => new Intl.DateTimeFormat("pt-PT", { ...tz, day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(iso));
export const dayOfMonth = (iso: string) => Number(new Intl.DateTimeFormat("pt-PT", { ...tz, day: "numeric" }).format(new Date(iso)));
export const monthShort = (iso: string) => { const m = new Intl.DateTimeFormat("pt-PT", { ...tz, month: "short" }).format(new Date(iso)).replace(".", ""); return m[0].toUpperCase() + m.slice(1); };
export const monthLong = (iso: string) => { const m = new Intl.DateTimeFormat("pt-PT", { ...tz, month: "long" }).format(new Date(iso)); return m[0].toUpperCase() + m.slice(1); };
export const weekday = (iso: string) => new Intl.DateTimeFormat("pt-PT", { ...tz, weekday: "long" }).format(new Date(iso));
export const timeOf = (iso: string) => new Intl.DateTimeFormat("pt-PT", { ...tz, hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(iso)).replace(":00", "h").replace(":", "h").replace(/^0/, "");

/** Tempo relativo até 7 dias; depois disso, data curta. O "agora" do protótipo é fixo. */
export function relative(iso: string, nowIso = "2026-11-09T14:00:00+01:00") {
  const diffMin = Math.round((new Date(nowIso).getTime() - new Date(iso).getTime()) / 60000);
  if (diffMin < 60) return `há ${Math.max(diffMin, 1)} min`;
  const h = Math.round(diffMin / 60);
  if (h < 24) return `há ${h} h`;
  const d = Math.round(h / 24);
  if (d === 1) return "ontem";
  if (d <= 7) return `há ${d} dias`;
  return dateShort(iso);
}

export function normalise(s: string) {
  return s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}
