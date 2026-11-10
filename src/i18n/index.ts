import { ptAO } from "./pt-AO";
import { admin } from "./pt-AO-admin";

const dict = { ...ptAO, admin };
export type Dict = typeof dict;

/** Idioma activo. O inglês junta-se aqui através de `en.ts` quando for activado. */
export const t: Dict = dict;
export const locale = "pt-AO";
