"use client";

import { useRef } from "react";
import type { ReactNode } from "react";
import { ToastProvider } from "@/design-system";
import { PrototypeSwitcher } from "@/features/prototype/PrototypeSwitcher";
import { AskOverlay, BottomBar, Drawer, SearchOverlay } from "./BottomBar";
import { CommandPalette, ShortcutsHelp } from "./CommandPalette";
import { GlobalBar } from "./GlobalBar";
import { KeyboardShortcuts } from "./KeyboardShortcuts";
import { NoticeBanner } from "./NoticeBanner";
import { NotificationsPanel } from "./NotificationsPanel";
import { ShellProvider } from "./ShellContext";
import type { ShellData } from "./types";

export function ShellClient({ data, children, footer, skipLabel }: { data: ShellData; children: ReactNode; footer: ReactNode; skipLabel: string }) {
  const searchRef = useRef<HTMLInputElement>(null);
  return (
    <ShellProvider data={data}>
      <ToastProvider>
        <a href="#conteudo" className="btn btn-pri skip-link">{skipLabel}</a>
        <GlobalBar searchRef={searchRef} />
        <NoticeBanner />
        <main id="conteudo" tabIndex={-1} className="outline-none">{children}</main>
        {footer}
        <BottomBar />
        <NotificationsPanel />
        <SearchOverlay />
        <AskOverlay />
        <Drawer />
        <CommandPalette />
        <ShortcutsHelp />
        <KeyboardShortcuts searchRef={searchRef} />
        <PrototypeSwitcher />
      </ToastProvider>
    </ShellProvider>
  );
}
