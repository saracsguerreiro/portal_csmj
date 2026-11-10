"use client";

import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { ShellData } from "./types";

type Overlay = "none" | "notifications" | "search" | "drawer" | "palette" | "help" | "ask";

type Ctx = {
  data: ShellData;
  overlay: Overlay;
  open: (o: Overlay) => void;
  close: () => void;
  unread: number;
  setUnread: (n: number) => void;
  askQuery: string;
  openAsk: (q: string) => void;
};

const ShellCtx = createContext<Ctx | null>(null);

export function ShellProvider({ data, children }: { data: ShellData; children: ReactNode }) {
  const [overlay, setOverlay] = useState<Overlay>("none");
  const [readAll, setReadAll] = useState(false);
  const [askQuery, setAskQuery] = useState("");
  const unread = readAll ? 0 : data.notifications.filter((n) => !n.read).length;
  const value = useMemo<Ctx>(() => ({ data, overlay, open: setOverlay, close: () => setOverlay("none"), unread, setUnread: (n) => setReadAll(n === 0), askQuery, openAsk: (q) => { setAskQuery(q); setOverlay("ask"); } }), [data, overlay, unread, askQuery]);
  return <ShellCtx.Provider value={value}>{children}</ShellCtx.Provider>;
}

export function useShell() {
  const c = useContext(ShellCtx);
  if (!c) throw new Error("useShell fora do ShellProvider");
  return c;
}

export function useShellOptional() {
  return useContext(ShellCtx);
}
