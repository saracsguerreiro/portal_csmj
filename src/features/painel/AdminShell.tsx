"use client";

import { ChevronDown, CircleHelp, ExternalLink, Lock, Menu, PanelLeftClose, PanelLeftOpen, Search } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { adminNav, type AdminGroup } from "@/data/admin-nav";
import { entity } from "@/config/entity";
import { ButtonLink, IconButton, Sheet, ToastProvider } from "@/design-system";
import { PrototypeSwitcher } from "@/features/prototype/PrototypeSwitcher";
import { AccountMenu } from "@/features/shell/AccountMenu";
import { CommandPalette, ShortcutsHelp } from "@/features/shell/CommandPalette";
import { NamedIcon } from "@/features/shell/icons";
import { KeyboardShortcuts } from "@/features/shell/KeyboardShortcuts";
import { NotificationsPanel } from "@/features/shell/NotificationsPanel";
import { ShellProvider, useShell } from "@/features/shell/ShellContext";
import { shellData } from "@/features/shell/shell-data";
import type { PaletteEntry } from "@/features/shell/types";
import { t } from "@/i18n";
import { useSession, useVersion } from "@/lib/client";
import { normalise } from "@/lib/format";
import type { Session } from "@/lib/session";

const A = t.admin;
const MENU_KEY = "csmj_painel_menu";

export function visibleNav(s: Session): AdminGroup[] {
  return adminNav.map((g) => ({ ...g, items: g.items.filter((i) => !i.perms || i.perms.some((p) => s.can(p))) })).filter((g) => g.items.length);
}

function adminPalette(s: Session): PaletteEntry[] {
  const out: PaletteEntry[] = [];
  if (s.can("content.draft")) out.push({ id: "c-noticia", label: A.work.create.noticia, href: "/painel/noticias/nova", group: "actions" }, { id: "c-evento", label: A.work.create.evento, href: "/painel/eventos/novo", group: "actions" });
  if (s.can("notice.publish")) out.push({ id: "c-aviso", label: A.work.create.aviso, href: "/painel/avisos/novo", group: "actions" });
  if (s.profile.approver) out.push({ id: "c-aprovar", label: t.actions.approveRequests, href: "/servicos/aprovacoes", group: "actions" });
  out.push({ id: "c-portal", label: A.shell.viewPortal, href: "/", group: "actions" });
  visibleNav(s).forEach((g) => g.items.forEach((i) => out.push({ id: `g-${i.id}`, label: A.items[i.id as keyof typeof A.items], detail: A.groups[g.id as keyof typeof A.groups], href: i.href, group: "goto" })));
  return out;
}

function SideNav({ s, collapsed, onNavigate }: { s: Session; collapsed: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  const [q, setQ] = useState("");
  const [closed, setClosed] = useState<string[]>([]);
  useEffect(() => { try { setClosed(JSON.parse(localStorage.getItem(`${MENU_KEY}_grupos`) ?? "[]")); } catch { /* bloqueado */ } }, []);
  const toggleGroup = (id: string) => setClosed((c) => { const n = c.includes(id) ? c.filter((x) => x !== id) : [...c, id]; try { localStorage.setItem(`${MENU_KEY}_grupos`, JSON.stringify(n)); } catch { /* bloqueado */ } return n; });
  const groups = visibleNav(s).map((g) => ({ ...g, items: g.items.filter((i) => !q || normalise(A.items[i.id as keyof typeof A.items]).includes(normalise(q))) })).filter((g) => g.items.length);
  const isActive = (href: string) => (href === "/painel" ? pathname === "/painel" || pathname === "/painel/" : pathname.startsWith(href));
  return (
    <nav aria-label={A.shell.menu} className="flex h-full flex-col gap-3">
      {!collapsed && <label className="search-box mx-3 !h-10"><span className="sr-only">{A.shell.filter}</span><Search size={16} aria-hidden /><input type="search" placeholder={A.shell.filter} value={q} onChange={(e) => setQ(e.target.value)} /></label>}
      <div className="flex-1 overflow-y-auto px-3 pb-6">
        {groups.length === 0 && <p className="px-3 text-label text-subtle">{A.shell.noMatch}</p>}
        {groups.map((g) => {
          const open = q || collapsed || !closed.includes(g.id) || g.items.some((i) => isActive(i.href));
          const single = g.items.length === 1 && g.id === "trabalho";
          return (
            <div key={g.id} className="mb-1">
              {!single && !collapsed && (
                <button type="button" className="flex min-h-9 w-full items-center justify-between rounded-lg px-3 text-caption font-semibold text-subtle hover:text-ink" aria-expanded={!!open} onClick={() => toggleGroup(g.id)}>
                  {A.groups[g.id as keyof typeof A.groups]}<ChevronDown size={14} aria-hidden className={open ? "rotate-180" : ""} />
                </button>
              )}
              {open && (
                <ul className="flex flex-col gap-0.5">
                  {g.items.map((i) => {
                    const label = A.items[i.id as keyof typeof A.items];
                    const active = isActive(i.href);
                    return (
                      <li key={i.id}>
                        <Link href={i.href} onClick={onNavigate} aria-current={active ? "page" : undefined} title={collapsed ? label : undefined} aria-label={collapsed ? label : undefined}
                          className={`flex min-h-11 items-center gap-3 rounded-full px-3 text-body no-underline transition-colors ${active ? "bg-toned font-semibold text-brand" : "text-copy hover:bg-[var(--ds-black-wash)] hover:text-ink"} ${collapsed ? "justify-center" : ""}`}>
                          <NamedIcon name={i.icon} />
                          {!collapsed && <span className="flex-1 truncate">{label}</span>}
                          {!collapsed && i.phase && <span className="text-caption text-subtle">F{i.phase}</span>}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}

function TopBar({ s, collapsed, setCollapsed, openDrawer }: { s: Session; collapsed: boolean; setCollapsed: (v: boolean) => void; openDrawer: () => void }) {
  const { open, unread } = useShell();
  return (
    <header className="brand-bar sticky top-0 z-40">
      <div className="flex h-16 items-center gap-3 px-4">
        <span className="lg:hidden"><IconButton label={A.shell.openMenu} onClick={openDrawer}><Menu size={20} aria-hidden /></IconButton></span>
        <span className="hidden lg:inline-flex"><IconButton label={collapsed ? A.shell.expand : A.shell.collapse} onClick={() => setCollapsed(!collapsed)}>{collapsed ? <PanelLeftOpen size={20} aria-hidden /> : <PanelLeftClose size={20} aria-hidden />}</IconButton></span>
        <Link href="/painel" className="flex items-center gap-3 rounded-lg no-underline" aria-label={`${A.shell.title} · ${entity.name}`}>
          <img src={entity.logo.symbol} alt="" width={30} height={33} className="h-8 w-auto" />
          <span className="flex flex-col leading-tight"><span className="text-ui font-bold">{A.shell.title}</span><span className="text-caption opacity-80">{entity.shortName}</span></span>
        </Link>
        <button type="button" onClick={() => open("palette")} className="search-box mx-auto hidden w-full max-w-md !cursor-pointer md:flex" aria-label={t.palette.label}>
          <Search size={16} aria-hidden /><span className="flex-1 text-left text-body text-[#5c5c5c]">{A.shell.palette}</span><kbd className="kbd">Ctrl K</kbd>
        </button>
        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <ButtonLink href="/" variant="on-brand" size="sm" className="hidden sm:inline-flex" icon={<ExternalLink size={14} aria-hidden />}>{A.shell.viewPortal}</ButtonLink>
          <button type="button" className="icbtn" aria-label={unread ? t.shell.notificationsUnread(unread) : t.shell.notifications} title={t.shell.notifications} onClick={() => open("notifications")}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
            {unread > 0 && <span className="count absolute -right-0.5 -top-0.5" aria-hidden>{unread > 9 ? "9+" : unread}</span>}
          </button>
          <IconButton label={A.shell.help} onClick={() => open("help")}><CircleHelp size={20} aria-hidden /></IconButton>
          <AccountMenu />
        </div>
      </div>
      <span className="filete" />
    </header>
  );
}

function Forbidden() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-[640px] items-center px-4">
      <div className="empty w-full !items-start !p-8 !text-left">
        <Lock size={32} aria-hidden className="text-brand" />
        <h1 className="mt-2 text-page font-bold">{A.shell.forbiddenTitle}</h1>
        <p className="text-ui">{A.shell.forbiddenLead}</p>
        <ButtonLink variant="pri" href="/" className="mt-3">{A.shell.viewPortal}</ButtonLink>
      </div>
    </div>
  );
}

/** Elementos globais do painel (6.10): barra superior, menu lateral recolhível, paleta de comandos. */
export function AdminShell({ children }: { children: ReactNode }) {
  const s = useSession();
  const v = useVersion();
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsedState] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  useEffect(() => { try { setCollapsedState(localStorage.getItem(MENU_KEY) === "recolhido"); } catch { /* bloqueado */ } }, []);
  useEffect(() => { if (v > 0 && s.signedOut) router.replace(`/entrar?volta=${encodeURIComponent(pathname)}`); }, [v, s.signedOut, router, pathname]);
  useEffect(() => setDrawer(false), [pathname]);
  const setCollapsed = (c: boolean) => { setCollapsedState(c); try { localStorage.setItem(MENU_KEY, c ? "recolhido" : "aberto"); } catch { /* bloqueado */ } };
  const data = useMemo(() => shellData(s, adminPalette(s)), [s, v]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <ShellProvider key={`${s.person.id}-${s.unit.id}`} data={data}>
      <ToastProvider>
        <a href="#conteudo" className="btn btn-pri skip-link">{t.shell.skip}</a>
        <TopBar s={s} collapsed={collapsed} setCollapsed={setCollapsed} openDrawer={() => setDrawer(true)} />
        <div className="flex">
          <aside className={`sticky top-[66px] hidden h-[calc(100dvh-66px)] flex-none border-r border-line pt-4 transition-[width] duration-200 lg:block ${collapsed ? "w-[72px]" : "w-[260px]"}`}>
            <SideNav s={s} collapsed={collapsed} />
          </aside>
          <main id="conteudo" tabIndex={-1} className="min-w-0 flex-1 outline-none">{v > 0 && !s.canUseAdmin ? <Forbidden /> : children}</main>
        </div>
        <Sheet open={drawer} onClose={() => setDrawer(false)} title={A.shell.menu} narrow><SideNav s={s} collapsed={false} onNavigate={() => setDrawer(false)} /></Sheet>
        <NotificationsPanel />
        <CommandPalette />
        <ShortcutsHelp />
        <KeyboardShortcuts searchRef={searchRef} />
        <PrototypeSwitcher />
      </ToastProvider>
    </ShellProvider>
  );
}

/** Página das áreas do painel que chegam numa fase seguinte. */
export function AdminPlaceholder({ phase, title }: { phase: number; title: string }) {
  return (
    <div className="px-6 py-8 md:px-8">
      <h1 className="text-page font-bold tracking-[-0.02em]">{title}</h1>
      <p className="mt-1 max-w-[75ch] text-ui">{A.shell.phaseLead}</p>
      <p className="mt-3"><span className="bdg bdg-info">{A.shell.phase(phase)}</span></p>
      <ButtonLink href="/painel" variant="pri" className="mt-6">{A.items.trabalho}</ButtonLink>
    </div>
  );
}
