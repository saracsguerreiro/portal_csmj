"use client";

import { Bell, CircleHelp, FileText, House, LayoutDashboard, LayoutGrid, LogOut, Menu, MessageCircleQuestion, Minus, Newspaper, Plus, Search, User, Users, Vote, X, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { entity } from "@/config/entity";
import { Avatar } from "@/design-system";
import { t } from "@/i18n";
import { prototypeToday } from "@/data/calendar";
import { dateLong, weekday } from "@/lib/format";
import { AccountMenu, DensityControl, signOut, ThemeControl, UnitControl } from "./AccountMenu";
import { SearchCombobox } from "./SearchCombobox";
import { useShell } from "./ShellContext";

const a = t.shell;
const sectionIcon: Record<string, LucideIcon> = { comunicacao: Newspaper, servicos: LayoutGrid, documentos: FileText, pessoas: Users, participar: Vote };

export function isSectionActive(id: string, href: string, pathname: string) {
  if (id === "pessoas") return pathname.startsWith("/pessoas") || pathname.startsWith("/instituicao");
  if (id === "participar") return pathname.startsWith("/participar");
  return pathname.startsWith(`/${href.split("/")[1]}`);
}

function Bellbutton({ className = "rail-link" }: { className?: string }) {
  const { open, unread } = useShell();
  return (
    <button type="button" className={className} aria-label={unread ? a.notificationsUnread(unread) : a.notifications} onClick={() => open("notifications")}>
      <Bell size={22} aria-hidden />
      {unread > 0 && <span className="count absolute right-1 top-1" aria-hidden>{unread > 9 ? "9+" : unread}</span>}
      {className === "rail-link" && <span className="rail-tip" aria-hidden>{a.notifications}</span>}
    </button>
  );
}

/** Barra lateral estreita: símbolo, menu, uma entrada por área e a conta em baixo. */
export function SideRail() {
  const { data, open } = useShell();
  const pathname = usePathname();
  return (
    <div className="panel rail max-md:!hidden">
      <Link href="/" className="grid h-14 w-14 place-items-center" aria-label={`${entity.name}: ${a.home}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={entity.logo.symbol} alt="" width={40} height={44} className="h-11 w-auto" />
      </Link>
      <button type="button" className="mt-8 grid h-12 w-12 place-items-center bg-[var(--ds-brand-background-default)] text-[var(--ds-brand-content)] hover:bg-[var(--ds-brand-background-hover)]" aria-label={a.openMenu} aria-haspopup="dialog" onClick={() => open("drawer")}>
        <Menu size={22} aria-hidden />
      </button>
      <nav className="my-auto" aria-label={a.mainNav}>
        <ul className="flex flex-col items-center gap-2">
          <li><Link href="/" className="rail-link" aria-current={pathname === "/" ? "page" : undefined} aria-label={a.home}><House size={22} aria-hidden /><span className="rail-tip" aria-hidden>{a.home}</span></Link></li>
          {data.sections.map((s) => {
            const Icon = sectionIcon[s.id] ?? FileText;
            return (
              <li key={s.id}>
                <Link href={s.href} className="rail-link" aria-current={isSectionActive(s.id, s.href, pathname) ? "page" : undefined} aria-label={s.label}>
                  <Icon size={22} aria-hidden /><span className="rail-tip" aria-hidden>{s.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="flex flex-col items-center gap-2">
        <Bellbutton />
        <AccountMenu placement="rail" />
      </div>
    </div>
  );
}

/** Linha de topo dos painéis de conteúdo: pesquisa à esquerda, onde está e a data à direita. */
export function TopRow({ searchRef, className = "" }: { searchRef?: React.RefObject<HTMLInputElement | null>; className?: string }) {
  const { data } = useShell();
  const iso = `${prototypeToday}T12:00:00+01:00`;
  return (
    <div className={`flex items-center justify-between gap-6 max-md:hidden ${className}`}>
      <div className="search-plain w-full min-w-[220px] max-w-[420px]">
        <SearchCombobox variant="bar" placeholder={a.searchPlaceholder} label={a.searchLabel} inputRef={searchRef} shortcutHint={<kbd className="kbd">/</kbd>} />
      </div>
      <p className="min-w-0 truncate text-right text-ui text-subtle">{weekday(iso).charAt(0).toUpperCase() + weekday(iso).slice(1)}, {dateLong(iso).replace(/ de \d{4}$/, "")} · {data.unit.label}</p>
    </div>
  );
}

/** Barra de topo do telemóvel: símbolo e notificações; o resto está na barra inferior e no menu. */
export function MobileTop() {
  const { open } = useShell();
  return (
    <header className="panel sticky top-0 z-40 flex h-16 items-center justify-between border-b border-line px-4 md:hidden">
      <Link href="/" className="flex items-center gap-2 no-underline" aria-label={`${entity.name}: ${a.home}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={entity.logo.symbol} alt="" width={32} height={36} className="h-9 w-auto" />
        <span className="eyebrow">{entity.productName} {entity.shortName}</span>
      </Link>
      <div className="flex items-center gap-1">
        <button type="button" className="icbtn" aria-label={a.openSearch} onClick={() => open("search")}><Search size={20} aria-hidden /></button>
        <Bellbutton className="icbtn" />
      </div>
    </header>
  );
}

function Accordion({ id, label, openId, setOpenId, children }: { id: string; label: string; openId: string | null; setOpenId: (v: string | null) => void; children: ReactNode }) {
  const on = openId === id;
  return (
    <li>
      <button type="button" className="sm-row" aria-expanded={on} aria-controls={`sm-${id}`} onClick={() => setOpenId(on ? null : id)}>
        {label}{on ? <Minus size={22} strokeWidth={1.5} aria-hidden /> : <Plus size={22} strokeWidth={1.5} aria-hidden />}
      </button>
      <div id={`sm-${id}`} hidden={!on} className="px-8 pb-5 pt-1">{children}</div>
    </li>
  );
}

/** Menu completo: abre pela esquerda, com acessos rápidos em letra grande e as áreas em secções que abrem. */
export function SideMenu() {
  const { data, overlay, close, open, unread } = useShell();
  const pathname = usePathname();
  const ref = useRef<HTMLDialogElement>(null);
  const isOpen = overlay === "drawer";
  const current = data.sections.find((s) => isSectionActive(s.id, s.href, pathname))?.id ?? null;
  const [openId, setOpenId] = useState<string | null>(current);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (isOpen && !d.open) { setOpenId(current); d.showModal(); }
    if (!isOpen && d.open) d.close();
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (isOpen) close(); }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  const quick = [
    { href: "/", label: a.home },
    { href: "/servicos", label: t.shell.menuQuick.request },
    { href: "/servicos/meus-pedidos", label: t.shell.menuQuick.myRequests },
    { href: "/documentos", label: t.shell.menuQuick.library },
    { href: "/pessoas", label: t.shell.menuQuick.contacts },
  ];

  return (
    <dialog ref={ref} className="sidemenu" aria-label={a.menuTitle} onClose={close} onCancel={(e) => { e.preventDefault(); close(); }} onClick={(e) => { if (e.target === ref.current) close(); }}>
      {isOpen && (
        <>
          <div className="flex w-[88px] flex-none flex-col items-center border-r border-line bg-surface py-6 max-sm:w-16">
            <button type="button" className="grid h-12 w-12 place-items-center hover:bg-surface-2" aria-label={t.common.close} onClick={close} autoFocus><X size={28} strokeWidth={1.25} aria-hidden /></button>
            <p className="vtext my-auto max-sm:hidden">{entity.name} · {entity.programme}</p>
            <div className="mt-auto flex flex-col items-center gap-3">
              <button type="button" className="icbtn relative" aria-label={unread ? a.notificationsUnread(unread) : a.notifications} onClick={() => open("notifications")}>
                <Bell size={22} aria-hidden />{unread > 0 && <span className="count absolute -right-0.5 -top-0.5" aria-hidden>{unread > 9 ? "9+" : unread}</span>}
              </button>
              <Link href="/conta" className="icbtn" aria-label={a.myAccount}><Avatar initials={data.person.initials} size="sm" /></Link>
              <span className="text-label font-semibold text-ink" title={a.language}>PT</span>
            </div>
          </div>
          <div className="flex min-w-0 flex-1 flex-col overflow-y-auto bg-surface">
            <div className="px-8 pb-10 pt-9">
              <p className="eyebrow">{t.shell.menuQuick.title}</p>
              <ul className="mt-5 flex flex-col gap-1">
                {quick.map((q) => <li key={q.href}><Link href={q.href} className="sm-big" aria-current={pathname === q.href ? "page" : undefined}>{q.label}</Link></li>)}
              </ul>
            </div>
            <ul className="mt-auto border-b border-line">
              {data.sections.map((s) => (
                <Accordion key={s.id} id={s.id} label={s.label} openId={openId} setOpenId={setOpenId}>
                  <ul>{s.items.map((i) => <li key={i.id}><Link className="sm-sub" href={i.href} aria-current={pathname === i.href ? "page" : undefined}>{i.label}</Link></li>)}</ul>
                </Accordion>
              ))}
              <li><Link className="sm-row" href="/perguntar">{a.askLink}<MessageCircleQuestion size={20} strokeWidth={1.5} aria-hidden /></Link></li>
              <Accordion id="conta" label={a.myAccount} openId={openId} setOpenId={setOpenId}>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3"><Avatar initials={data.person.initials} /><div><p className="font-semibold text-ink">{data.person.name}</p><p className="text-label text-subtle">{data.person.role}</p></div></div>
                  <div className="flex flex-col gap-1"><span className="text-label font-medium text-subtle">{a.activeUnit}</span><UnitControl quiet /></div>
                  <div className="flex flex-col items-start gap-1"><span className="text-label font-medium text-subtle">{a.theme}</span><ThemeControl /></div>
                  <div className="flex flex-col items-start gap-1"><span className="text-label font-medium text-subtle">{a.density}</span><DensityControl /></div>
                  <ul>
                    <li><Link className="sm-sub flex items-center gap-2" href="/conta"><User size={18} aria-hidden />{a.myAccount}</Link></li>
                    {data.canUseAdmin && <li><Link className="sm-sub flex items-center gap-2" href="/painel"><LayoutDashboard size={18} aria-hidden />{a.goToAdmin}</Link></li>}
                    <li><Link className="sm-sub flex items-center gap-2" href="/ajuda"><CircleHelp size={18} aria-hidden />{a.help}</Link></li>
                    <li><button type="button" className="sm-sub flex items-center gap-2" onClick={signOut}><LogOut size={18} aria-hidden />{a.signOut}</button></li>
                  </ul>
                </div>
              </Accordion>
            </ul>
          </div>
        </>
      )}
    </dialog>
  );
}
