import { COOKIE } from "@/lib/cookies";
import { handleAction, handlePrefs, handleService, type ActionBody, type ServiceBody } from "@/lib/handlers";
import { bump } from "@/lib/prefs";
import { persist } from "@/lib/store";

const latency = () => new Promise((r) => setTimeout(r, 120));
const GENERIC = "Não foi possível guardar. Verifique a ligação e tente outra vez.";

/** Executa uma escrita como se fosse um pedido à API: com latência, erros e actualização da interface. */
async function call<T>(fn: () => T): Promise<T> {
  await latency();
  try {
    const out = fn();
    persist();
    bump();
    return out;
  } catch (e) {
    const status = (e as { status?: number }).status;
    throw new Error(status === 503 ? GENERIC : (e as Error).message || GENERIC);
  }
}

export async function postAction(body: Record<string, unknown>) {
  await call(() => handleAction(body as ActionBody));
}

export async function postService<T = Record<string, unknown>>(body: Record<string, unknown>): Promise<T> {
  return call(() => handleService(body as ServiceBody) as T);
}

export async function setPrefs(set: Partial<Record<(typeof COOKIE)[keyof typeof COOKIE], string | null>>, reset = false) {
  handlePrefs(set as Record<string, string | null>, reset);
  bump();
}

export function applyTheme(theme: "light" | "dark" | "auto") {
  const el = document.documentElement;
  if (theme === "auto") delete el.dataset.theme;
  else el.dataset.theme = theme;
  void setPrefs({ [COOKIE.theme]: theme });
}

export function applyDensity(density: "comfortable" | "compact") {
  document.documentElement.dataset.density = density;
  void setPrefs({ [COOKIE.density]: density });
}

import { search } from "@/lib/api";
import { ask } from "@/lib/api-ia";
import { buildIcs } from "@/lib/handlers";
import { currentSession } from "@/lib/session";

/** Sugestões da caixa de pesquisa: só o que a pessoa pode ler. */
export async function suggest(q: string) {
  await new Promise((r) => setTimeout(r, 80));
  const s = currentSession();
  if (s.failing) throw new Error(GENERIC);
  return search(s, q);
}

/** Perguntar à intranet: a resposta usa apenas conteúdos do âmbito da pessoa. */
export async function askIntranet(q: string) {
  const s = currentSession();
  if (s.failing) throw new Error(GENERIC);
  return ask(s, q);
}

export function downloadIcs(slug?: string) {
  const blob = new Blob([buildIcs(slug)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${slug ?? "eventos-csmj"}.ics`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
