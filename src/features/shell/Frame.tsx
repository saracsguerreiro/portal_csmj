"use client";

import { Bell, CircleHelp, FileText, House, LayoutDashboard, LayoutGrid, LogOut, MessageCircleQuestion, Minus, Newspaper, Plus, Search, User, Users, Vote, X, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { entity } from "@/config/entity";
import { prototypeToday } from "@/data/calendar";
import type { MenuSection } from "@/data/types";
import { Avatar } from "@/design-system";
import { t } from "@/i18n";
import { dateLong, weekday } from "@/lib/format";
import { AccountMenu, DensityControl, signOut, ThemeControl, UnitControl } from "./AccountMenu";
import { NoticeBanner } from "./NoticeBanner";
import { SearchCombobox } from "./SearchCombobox";
import { useShell } from "./ShellContext";

const a = t.shell;
const sectionIcon: Record<string, LucideIcon> = { comunicacao: Newspaper, servicos: LayoutGrid, documentos: FileText, pessoas: Users, participar: Vote };

export function isSectionActive(id: string, href: string, pathname: string) {
  if (id === "pessoas") return pathname.startsWith("/pessoas") || pathname.startsWith("/instituicao");
  if (id === "participar") return pathname.startsWith("/participar");
  return pathname.startsWith(`/${href.split("/")[1]}`);
}

function BellButton({ className, tip }: { className: string; tip?: boolean }) {
  const { open, unread } = useShell();
  return (
    <button type="button" className={`${className} relative`} aria-label={unread ? a.notificationsUnread(unread) : a.notifications} onClick={() => open("notifications")}>
      <Bell size={22} aria-hidden />
      {unread > 0 && <span className="count absolute right-0.5 top-0.5" aria-hidden>{unread > 9 ? "9+" : unread}</span>}
      {tip && <span className="rail-tip" aria-hidden>{a.notifications}</span>}
    </button>
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

/** Conteúdo do menu aberto: a área escolhida em letra grande e as outras em secções que abrem. */
function MenuBody({ active, onClose, closeButton }: { active: MenuSection; onClose: () => void; closeButton?: boolean }) {
  const { data } = useShell();
  const pathname = usePathname();
  const [openId, setOpenId] = useState<string | null>(null);
  useEffect(() => setOpenId(null), [active.id]);
  return (
    <>
      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto bg-surface">
        <div className="px-8 pb-10 pt-9">
          <div className="flex items-start justify-between gap-4">
            <p className="eyebrow" id="menu-area">{active.label}</p>
            {closeButton && <button type="button" className="-mr-3 -mt-3 grid h-12 w-12 place-items-center hover:bg-surface-2" aria-label={t.common.close} onClick={onClose} autoFocus><X size={26} strokeWidth={1.25} aria-hidden /></button>}
          </div>
          <ul className="mt-5 flex flex-col gap-1" aria-labelledby="menu-area">
            {active.items.map((i) => <li key={i.id}><Link href={i.href} className="sm-big" aria-current={pathname === i.href ? "page" : undefined} onClick={onClose}>{i.label}</Link></li>)}
          </ul>
        </div>
        <ul className="mt-auto border-b border-line">
          {data.sections.filter((s) => s.id !== active.id).map((s) => (
            <Accordion key={s.id} id={s.id} label={s.label} openId={openId} setOpenId={setOpenId}>
              <ul>{s.items.map((i) => <li key={i.id}><Link className="sm-sub" href={i.href} onClick={onClose}>{i.label}</Link></li>)}</ul>
            </Accordion>
          ))}
          <li><Link className="sm-row" href="/perguntar" onClick={onClose}>{a.askLink}<MessageCircleQuestion size={20} strokeWidth={1.5} aria-hidden /></Link></li>
          <Accordion id="conta" label={a.myAccount} openId={openId} setOpenId={setOpenId}>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3"><Avatar initials={data.person.initials} /><div><p className="font-semibold text-ink">{data.person.name}</p><p className="text-label text-subtle">{data.person.role}</p></div></div>
              <div className="flex flex-col gap-1"><span className="text-label font-medium text-subtle">{a.activeUnit}</span><UnitControl quiet /></div>
              <div className="flex flex-col items-start gap-1"><span className="text-label font-medium text-subtle">{a.theme}</span><ThemeControl /></div>
              <div className="flex flex-col items-start gap-1"><span className="text-label font-medium text-subtle">{a.density}</span><DensityControl /></div>
              <ul>
                <li><Link className="sm-sub flex items-center gap-2" href="/conta" onClick={onClose}><User size={18} aria-hidden />{a.myAccount}</Link></li>
                {data.canUseAdmin && <li><Link className="sm-sub flex items-center gap-2" href="/painel" onClick={onClose}><LayoutDashboard size={18} aria-hidden />{a.goToAdmin}</Link></li>}
                <li><Link className="sm-sub flex items-center gap-2" href="/ajuda" onClick={onClose}><CircleHelp size={18} aria-hidden />{a.help}</Link></li>
                <li><button type="button" className="sm-sub flex items-center gap-2" onClick={signOut}><LogOut size={18} aria-hidden />{a.signOut}</button></li>
              </ul>
            </div>
          </Accordion>
        </ul>
      </div>
    </>
  );
}

/** Barra lateral vermelha. Passar o rato num ícone abre o menu dessa área; com o teclado, seta para a direita. */
export function SideRail() {
  const { data } = useShell();
  const pathname = usePathname();
  const [openId, setOpenId] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const touch = useRef(false);
  const triggers = useRef<Record<string, HTMLAnchorElement | null>>({});
  const panel = useRef<HTMLDivElement>(null);
  const active = data.sections.find((s) => s.id === openId);

  const schedule = (fn: () => void, ms: number) => { clearTimeout(timer.current); timer.current = setTimeout(fn, ms); };
  const close = useCallback((focusBack = false) => {
    clearTimeout(timer.current);
    setOpenId((cur) => { if (focusBack && cur) triggers.current[cur]?.focus(); return null; });
  }, []);

  useEffect(() => close(), [pathname, close]);
  useEffect(() => {
    if (!openId) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { e.preventDefault(); close(true); } };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [openId, close]);

  const focusNext = useRef(false);
  const openFor = (id: string, focus = false) => {
    clearTimeout(timer.current);
    focusNext.current = focus;
    setOpenId(id);
  };
  useEffect(() => {
    if (openId && focusNext.current) { focusNext.current = false; panel.current?.querySelector<HTMLElement>(".sm-big")?.focus(); }
  }, [openId]);
  const leave = () => schedule(() => setOpenId(null), 120);

  return (
    <div className="contents" onMouseLeave={() => schedule(() => setOpenId(null), 220)}>
      <div className="rail rail-red max-md:!hidden">
        <Link href="/" className="grid h-14 w-14 place-items-center" aria-label={`${entity.name}: ${a.home}`} onMouseEnter={leave}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={entity.logo.symbol} alt="" width={40} height={44} className="h-11 w-auto" />
        </Link>
        <nav className="my-auto" aria-label={a.mainNav}>
          <ul className="flex flex-col items-center gap-2">
            <li onMouseEnter={leave}>
              <Link href="/" className="rail-link" aria-current={pathname === "/" ? "page" : undefined} aria-label={a.home}><House size={22} aria-hidden /><span className="rail-tip" aria-hidden>{a.home}</span></Link>
            </li>
            {data.sections.map((s) => {
              const Icon = sectionIcon[s.id] ?? FileText;
              return (
                <li key={s.id} onMouseEnter={() => schedule(() => openFor(s.id), openId ? 0 : 90)}>
                  <Link
                    ref={(el) => { triggers.current[s.id] = el; }} href={s.href} className="rail-link" data-open={openId === s.id}
                    aria-current={isSectionActive(s.id, s.href, pathname) ? "page" : undefined} aria-label={s.label} aria-haspopup="true" aria-expanded={openId === s.id}
                    onKeyDown={(e) => { if (e.key === "ArrowRight") { e.preventDefault(); openFor(s.id, true); } }}
                    onPointerDown={(e) => { touch.current = e.pointerType === "touch"; }}
                    onClick={(e) => { if (touch.current && openId !== s.id) { e.preventDefault(); openFor(s.id); } }}
                  >
                    <Icon size={22} aria-hidden />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="flex flex-col items-center gap-2" onMouseEnter={leave}>
          <BellButton className="rail-link" tip />
          <AccountMenu placement="rail" />
        </div>
      </div>
      {active && (
        <>
          <div className="flyout-backdrop max-md:hidden" aria-hidden onMouseMove={leave} onClick={() => close()} />
          <div ref={panel} role="dialog" aria-label={`${a.menuTitle}: ${active.label}`} className="flyout max-md:hidden" onMouseEnter={() => clearTimeout(timer.current)}
            onKeyDown={(e) => { if (e.key === "ArrowLeft" && (e.target as HTMLElement).classList.contains("sm-big")) { e.preventDefault(); close(true); } }}>
            <MenuBody active={active} onClose={() => close()} />
          </div>
        </>
      )}
    </div>
  );
}

/** Faixa de topo: pesquisar ou perguntar à esquerda, aviso por confirmar e a data à direita. */
export function TopBand({ searchRef }: { searchRef?: React.RefObject<HTMLInputElement | null> }) {
  const { data } = useShell();
  const home = usePathname() === "/";
  const iso = `${prototypeToday}T12:00:00+01:00`;
  const day = weekday(iso);
  const date = `${day.charAt(0).toUpperCase()}${day.slice(1)}, ${dateLong(iso)}`;
  return (
    <div className={`panel flex flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3 md:min-h-[72px] md:flex-nowrap md:px-8 ${home ? "max-md:hidden" : ""}`}>
      <div className="search-plain min-w-0 max-w-[640px] flex-1 max-md:hidden">
        <SearchCombobox variant="bar" placeholder={a.searchOnly} label={a.searchLabel} inputRef={searchRef} shortcutHint={<kbd className="kbd">/</kbd>} />
      </div>
      {!home && <NoticeBanner compact />}
      <p className="ml-auto flex-none text-ui font-medium text-ink max-md:hidden" title={data.unit.label}>{date}</p>
    </div>
  );
}

/** Barra de topo do telemóvel: símbolo, pesquisa e notificações; o menu está na barra inferior. */
export function MobileTop() {
  const { open } = useShell();
  return (
    <header className="rail-red sticky top-0 z-40 flex h-16 items-center justify-between px-4 md:hidden">
      <Link href="/" className="flex items-center gap-2 text-white no-underline" aria-label={`${entity.name}: ${a.home}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={entity.logo.symbol} alt="" width={32} height={36} className="h-9 w-auto" />
        <span className="eyebrow !text-white">{a.portalName}</span>
      </Link>
      <div className="flex items-center gap-1">
        <button type="button" className="rail-link !h-11 !w-11" aria-label={a.openSearch} onClick={() => open("search")}><Search size={20} aria-hidden /></button>
        <BellButton className="rail-link !h-11 !w-11" />
      </div>
    </header>
  );
}

/** Menu em ecrã inteiro no telemóvel (botão Menu da barra inferior). */
export function SideMenu() {
  const { data, overlay, close } = useShell();
  const pathname = usePathname();
  const ref = useRef<HTMLDialogElement>(null);
  const isOpen = overlay === "drawer";
  const current = data.sections.find((s) => isSectionActive(s.id, s.href, pathname)) ?? data.sections[0];
  const [activeId, setActiveId] = useState(current.id);
  const active = data.sections.find((s) => s.id === activeId) ?? current;

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (isOpen && !d.open) { setActiveId(current.id); d.showModal(); }
    if (!isOpen && d.open) d.close();
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (isOpen) close(); }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <dialog ref={ref} className="sidemenu" aria-label={a.menuTitle} onClose={close} onCancel={(e) => { e.preventDefault(); close(); }} onClick={(e) => { if (e.target === ref.current) close(); }}>
      {isOpen && (
        <div className="flex h-full w-full flex-col">
          <div className="rail-red flex flex-none gap-1 overflow-x-auto px-2 py-2" role="group" aria-label={a.mainNav}>
            {data.sections.map((s) => {
              const Icon = sectionIcon[s.id] ?? FileText;
              return <button key={s.id} type="button" aria-pressed={s.id === active.id} className="rail-link !flex !h-11 !w-auto flex-none gap-2 !px-3 text-label font-semibold" onClick={() => setActiveId(s.id)}><Icon size={18} aria-hidden />{s.label}</button>;
            })}
          </div>
          <div className="flex min-h-0 flex-1"><MenuBody active={active} onClose={close} closeButton /></div>
        </div>
      )}
    </dialog>
  );
}
