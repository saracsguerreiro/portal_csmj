"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { bump, loadPrefs, versionStore } from "./prefs";
import { currentSession } from "./session";
import { restore } from "./store";

let booted = false;

/** Carrega as preferências e os dados guardados no browser, depois da primeira pintura (sem diferenças de hidratação). */
export function bootClient() {
  if (booted) return;
  booted = true;
  loadPrefs();
  restore();
  bump();
}

export function useVersion() {
  return useSyncExternalStore(versionStore.subscribe, versionStore.get, versionStore.server);
}

export function useSession() {
  const v = useVersion();
  return useMemo(() => currentSession(), [v]); // eslint-disable-line react-hooks/exhaustive-deps
}

/** Carregamento por bloco: esqueleto primeiro, erro isolado se falhar. */
export function useLoad<T>(fn: () => T | Promise<T>, deps: unknown[] = []) {
  const v = useVersion();
  const [state, setState] = useState<{ data?: T; error?: boolean; ready: boolean }>({ ready: false });
  useEffect(() => {
    let alive = true;
    Promise.resolve().then(fn).then((data) => alive && setState({ data, ready: true }), () => alive && setState({ error: true, ready: true }));
    return () => { alive = false; };
  }, [v, ...deps]); // eslint-disable-line react-hooks/exhaustive-deps
  return state;
}
