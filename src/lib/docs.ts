import { prototypeToday } from "@/data/calendar";
import { collections } from "@/data/documents";
import type { DocumentItem } from "@/data/types";
import { inScope } from "./scope";
import type { Session } from "./session";

/** Um documento só aparece a quem o pode ler: âmbito, leitores da pasta e validade. Caducados não aparecem em lado nenhum. */
export function canReadDoc(s: Session, d: DocumentItem) {
  if (!inScope(d, s.unit.id)) return false;
  if (d.validUntil && d.validUntil < prototypeToday) return false;
  const folder = collections.find((c) => c.id === d.collectionId)?.folders.find((f) => f.id === d.folder);
  return !folder?.readers || folder.readers.includes(s.profile.id);
}
