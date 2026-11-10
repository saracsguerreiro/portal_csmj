import { COOKIE } from "@/lib/cookies";

export async function postAction(body: Record<string, unknown>) {
  const res = await fetch("/api/accoes", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  if (!res.ok) throw new Error("falhou");
}

export async function setPrefs(set: Partial<Record<(typeof COOKIE)[keyof typeof COOKIE], string | null>>, reset = false) {
  await fetch("/api/prototipo", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ set, reset }) });
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

export async function postService<T = Record<string, unknown>>(body: Record<string, unknown>): Promise<T> {
  const res = await fetch("/api/servicos", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Não foi possível guardar. Verifique a ligação e tente outra vez.");
  return data as T;
}
