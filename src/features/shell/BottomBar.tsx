"use client";

import { FileText, House, LayoutGrid, LogOut, Maximize2, Menu, MessageCircle, Search, User, Bell, CircleHelp, LayoutDashboard, Globe, X } from "lucide-react";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sheet } from "@/design-system";
import { t } from "@/i18n";
import { DensityControl, signOut, ThemeControl, UnitControl } from "./AccountMenu";
import { NamedIcon } from "./icons";
import { SearchCombobox } from "./SearchCombobox";
import { AskConversation } from "@/features/ia/AskConversation";
import { useShell } from "./ShellContext";

const a = t.shell;

export function BottomBar() {
  const pathname = usePathname();
  const { open, unread } = useShell();
  return (
    <nav aria-label={a.bottomNav} className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface md:hidden" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <ul className="flex">
        <li className="flex flex-1"><Link className="bottom-item" href="/" aria-current={pathname === "/" ? "page" : undefined}><House size={22} aria-hidden />{a.bottom.home}</Link></li>
        <li className="flex flex-1"><Link className="bottom-item" href="/servicos" aria-current={pathname.startsWith("/servicos") ? "page" : undefined}><LayoutGrid size={22} aria-hidden />{a.bottom.services}</Link></li>
        <li className="flex flex-1"><button type="button" className="bottom-item" onClick={() => open("search")}><Search size={22} aria-hidden />{a.bottom.search}</button></li>
        <li className="flex flex-1"><Link className="bottom-item" href="/documentos" aria-current={pathname.startsWith("/documentos") ? "page" : undefined}><FileText size={22} aria-hidden />{a.bottom.documents}</Link></li>
        <li className="flex flex-1">
          <button type="button" className="bottom-item relative" onClick={() => open("drawer")} aria-label={unread ? `${a.bottom.menu}, ${a.notificationsUnread(unread)}` : a.bottom.menu}>
            <span className="relative">
              <Menu size={22} aria-hidden />
              {unread > 0 && <span className="count absolute -right-3 -top-2" aria-hidden>{unread > 9 ? "9+" : unread}</span>}
            </span>
            {a.bottom.menu}
          </button>
        </li>
      </ul>
    </nav>
  );
}

export function SearchOverlay() {
  const { overlay, close } = useShell();
  return (
    <Sheet open={overlay === "search"} onClose={close} title={t.search.title}>
      {overlay === "search" && <SearchCombobox variant="overlay" autoFocus placeholder={a.searchPlaceholder} label={a.searchLabel} onNavigate={close} />}
    </Sheet>
  );
}

/** Chat flutuante: um botão no canto que abre uma janela de conversa com a intranet. */
export function AskOverlay() {
  const { overlay, close, open, askQuery } = useShell();
  const isOpen = overlay === "ask";
  const panel = useRef<HTMLDivElement>(null);
  const fab = useRef<HTMLButtonElement>(null);
  const was = useRef(false);
  useEffect(() => {
    if (isOpen) requestAnimationFrame(() => panel.current?.querySelector<HTMLElement>("textarea")?.focus());
    else if (was.current) fab.current?.focus();
    was.current = isOpen;
  }, [isOpen]);
  return (
    <>
      {isOpen && (
        <div ref={panel} role="dialog" aria-labelledby="chat-title" className="chat-panel" onKeyDown={(e) => { if (e.key === "Escape") { e.stopPropagation(); close(); } }}>
          <header className="flex items-center justify-between gap-3 bg-[var(--ds-color-brand-700)] px-4 py-3 text-white">
            <div className="flex items-center gap-2.5"><MessageCircle size={20} aria-hidden /><h2 id="chat-title" className="text-ui font-semibold !text-white">{t.ask.chatTitle}</h2></div>
            <div className="flex items-center gap-1">
              <Link href={`/perguntar${askQuery ? `?q=${encodeURIComponent(askQuery)}` : ""}`} onClick={close} className="grid h-9 w-9 place-items-center hover:bg-white/15" aria-label={t.ask.openPage} title={t.ask.openPage}><Maximize2 size={16} aria-hidden /></Link>
              <button type="button" className="grid h-9 w-9 place-items-center hover:bg-white/15" aria-label={t.common.close} onClick={close}><X size={18} aria-hidden /></button>
            </div>
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 pt-4"><AskConversation key={askQuery} initial={askQuery || undefined} compact docked greeting={t.ask.greeting} /></div>
        </div>
      )}
      <button ref={fab} type="button" className="chat-fab" aria-label={isOpen ? t.common.close : t.ask.greeting} aria-expanded={isOpen} onClick={() => (isOpen ? close() : open("ask"))}>
        {isOpen ? <X size={24} aria-hidden /> : <MessageCircle size={24} aria-hidden />}
        {!isOpen && <span className="chat-fab-label">{t.ask.greeting}</span>}
      </button>
    </>
  );
}

export function Drawer() {
  const { data, overlay, close, open, unread } = useShell();
  const sections = data.sections.filter((s) => ["comunicacao", "pessoas", "participar"].includes(s.id));
  return (
    <Sheet open={overlay === "drawer"} onClose={close} title={a.menuTitle}>
      <div className="flex flex-col gap-5">
        {sections.map((s) => (
          <section key={s.id} aria-label={s.label}>
            <h3 className="mb-1 px-3 text-label font-semibold text-subtle">{s.label}</h3>
            <ul>{s.items.map((i) => <li key={i.id}><Link className="menu-item" href={i.href} onClick={close}><NamedIcon name={i.icon} />{i.label}</Link></li>)}</ul>
          </section>
        ))}
        <hr className="rule" />
        <ul>
          <li><button type="button" className="menu-item" onClick={() => open("notifications")}><Bell size={20} aria-hidden /><span className="flex-1">{a.notifications}</span>{unread > 0 && <span className="count">{unread}</span>}</button></li>
          <li><Link className="menu-item" href="/conta" onClick={close}><User size={20} aria-hidden />{a.myAccount}</Link></li>
          {data.canUseAdmin && <li><Link className="menu-item" href="/painel" onClick={close}><LayoutDashboard size={20} aria-hidden />{a.goToAdmin}</Link></li>}
          <li><Link className="menu-item" href="/ajuda" onClick={close}><CircleHelp size={20} aria-hidden />{a.help}</Link></li>
          <li className="menu-item !cursor-default hover:!bg-transparent"><Globe size={20} aria-hidden /><span className="flex-1">{a.language}</span><span className="text-label text-subtle">{a.languageValue}</span></li>
        </ul>
        <div className="flex flex-col gap-3 px-3">
          <div className="flex flex-col gap-1"><span className="text-label font-medium text-subtle">{a.activeUnit}</span><UnitControl quiet /></div>
          <div className="flex flex-col items-start gap-1"><span className="text-label font-medium text-subtle">{a.theme}</span><ThemeControl /></div>
          <div className="flex flex-col items-start gap-1"><span className="text-label font-medium text-subtle">{a.density}</span><DensityControl /></div>
        </div>
        <button type="button" className="menu-item" onClick={signOut}><LogOut size={20} aria-hidden />{a.signOut}</button>
      </div>
    </Sheet>
  );
}
