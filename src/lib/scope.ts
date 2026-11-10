import { units } from "@/data/units";
import type { ScopeKind } from "@/design-system/components/display";
import type { Scoped, Unit } from "@/data/types";

function ancestry(unitId: string): string[] {
  const out: string[] = [];
  let cur: Unit | undefined = units.find((u) => u.id === unitId);
  while (cur) {
    out.push(cur.id);
    cur = units.find((u) => u.id === cur!.parentId);
  }
  return out;
}

/** O conteúdo de cima desce para as unidades de baixo; o de baixo não sobe. */
export function inScope(item: Scoped, unitId: string) {
  const line = ancestry(unitId);
  return item.scopes.some((s) => line.includes(s));
}

export function scopeLabel(item: Scoped) {
  return item.scopes.map((s) => units.find((u) => u.id === s)?.short ?? s).join(" · ");
}

export function scopeKind(item: Scoped): ScopeKind {
  const u = units.find((x) => x.id === item.scopes[0]);
  if (!u || u.type === "national") return "national";
  if (u.type === "relation") return "relation";
  if (u.type === "court") return "court";
  return "unit";
}
