/** Preferências e controlos do protótipo (perfil, unidade, tema...). No browser ficam em localStorage. */
const KEY = "csmj_prefs";
let prefs: Record<string, string> = {};
let version = 0;
const listeners = new Set<() => void>();

export function getPref(k: string): string | undefined {
  return prefs[k];
}

export function loadPrefs() {
  try { prefs = JSON.parse(localStorage.getItem(KEY) ?? "{}"); } catch { prefs = {}; }
}

export function writePrefs(set: Record<string, string | null>) {
  for (const [k, v] of Object.entries(set)) { if (v === null) delete prefs[k]; else prefs[k] = v; }
  try { localStorage.setItem(KEY, JSON.stringify(prefs)); } catch { /* bloqueado */ }
}

/** Avisa a interface de que os dados mudaram (substitui o "refresh" do servidor). */
export function bump() {
  version += 1;
  listeners.forEach((l) => l());
}

export const versionStore = {
  subscribe(l: () => void) { listeners.add(l); return () => listeners.delete(l); },
  get: () => version,
  server: () => 0,
};
