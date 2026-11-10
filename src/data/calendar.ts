import type { Holiday } from "./types";

/** Calendário institucional. No protótipo, "hoje" é fixo para os dados de exemplo fazerem sentido. */
export const prototypeToday = "2026-11-09";
export const prototypeLastVisit = "2026-11-05T17:00:00+01:00";

export const holidays: Holiday[] = [
  { date: "2026-11-11", name: "Dia da Independência Nacional" },
  { date: "2026-12-25", name: "Natal e Dia da Família" },
  { date: "2027-01-01", name: "Ano Novo" },
  { date: "2027-02-04", name: "Dia do Início da Luta Armada" },
];
