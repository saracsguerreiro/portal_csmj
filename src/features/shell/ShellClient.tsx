"use client";

import { usePathname } from "next/navigation";
import { useRef } from "react";
import type { ReactNode } from "react";
import { ToastProvider } from "@/design-system";
import { PrototypeSwitcher } from "@/features/prototype/PrototypeSwitcher";
import { AskOverlay, BottomBar, SearchOverlay } from "./BottomBar";
import { MobileTop, SideMenu, SideRail, TopRow } from "./Frame";
import { CommandPalette, ShortcutsHelp } from "./CommandPalette";
import { KeyboardShortcuts } from "./KeyboardShortcuts";
import { NoticeBanner } from "./NoticeBanner";
import { OfflineBanner } from "./OfflineBanner";
import { NotificationsPanel } from "./NotificationsPanel";
import { ShellProvider } from "./ShellContext";
import type { ShellData } from "./types";
import { HomeSearchRef } from "./home-search";

export function ShellClient({ data, children, footer, skipLabel }: { data: ShellData; children: ReactNode; footer: ReactNode; skipLabel: string }) {
  const searchRef = useRef<HTMLInputElement>(null);
  const home = usePathname() === "/";
  return (
    <ShellProvider data={data}>
      <ToastProvider>
        <a href="#conteudo" className="btn btn-pri skip-link">{skipLabel}</a>
        <div className="frame has-bottom-bar">
          <SideRail />
          <div className="flex min-w-0 flex-1 flex-col gap-[var(--gap)]">
            <MobileTop />
            <OfflineBanner />
            <NoticeBanner />
            <main id="conteudo" tabIndex={-1} className={`flex-1 outline-none ${home ? "" : "panel"}`}>
              {home ? <HomeSearchRef.Provider value={searchRef}>{children}</HomeSearchRef.Provider> : <><TopRow searchRef={searchRef} className="wrap pt-6" />{children}</>}
            </main>
            <div className="panel">{footer}</div>
          </div>
        </div>
        <BottomBar />
        <NotificationsPanel />
        <SearchOverlay />
        <AskOverlay />
        <SideMenu />
        <CommandPalette />
        <ShortcutsHelp />
        <KeyboardShortcuts searchRef={searchRef} />
        <PrototypeSwitcher />
      </ToastProvider>
    </ShellProvider>
  );
}
