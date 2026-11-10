"use client";

import { Bell, ChevronDown, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { entity } from "@/config/entity";
import { IconButton } from "@/design-system";
import { t } from "@/i18n";
import { AccountMenu } from "./AccountMenu";
import { MegaMenu } from "./MegaMenu";
import { SearchCombobox } from "./SearchCombobox";
import { useShell } from "./ShellContext";

const a = t.shell;

export function BrandMark({ className }: { className?: string }) {
  return (
    <Link href="/" className={["flex flex-none items-center rounded-lg no-underline", className].filter(Boolean).join(" ")} aria-label={`${entity.name}: ${a.home}`}>
      {/* Logótipo completo a partir de 180 px; abaixo disso, só o símbolo (regra do Design System) */}
      <img src={entity.logo.onBrand} alt="" width={200} height={55} className="block h-auto w-[180px] md:max-[1099px]:hidden" />
      <img src={entity.logo.symbol} alt="" width={40} height={44} className="hidden h-11 w-auto md:max-[1099px]:block" />
    </Link>
  );
}

export function GlobalBar({ searchRef }: { searchRef: React.RefObject<HTMLInputElement | null> }) {
  const { data, open, unread } = useShell();
  const pathname = usePathname();
  const [menuId, setMenuId] = useState<string | null>(null);
  const [compact, setCompact] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const triggers = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMenuId(null), [pathname]);

  useEffect(() => {
    if (!menuId) return;
    const onDown = (e: MouseEvent) => { if (!headerRef.current?.contains(e.target as Node)) setMenuId(null); };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [menuId]);

  const closeMenu = () => {
    if (menuId) triggers.current[menuId]?.focus();
    setMenuId(null);
  };

  const section = data.sections.find((x) => x.id === menuId);
  const isActive = (id: string, href: string) => (id === "pessoas" ? pathname.startsWith("/pessoas") || pathname.startsWith("/instituicao") : id === "participar" ? pathname.startsWith("/participar") : pathname.startsWith(`/${href.split("/")[1]}`));

  return (
    <header ref={headerRef} className="brand-bar sticky top-0 z-40">
      <div className="wrap flex items-center justify-between gap-3 transition-[height] duration-200" style={{ height: compact ? 72 : 80 }}>
        <BrandMark />
        <nav aria-label={a.mainNav} className="hidden flex-1 md:block xl:flex-none">
          <ul className="flex items-center gap-0.5">
            <li><Link href="/" className="nav-item" aria-current={pathname === "/" ? "page" : undefined}>{a.home}</Link></li>
            {data.sections.map((s) => (
              <li key={s.id}>
                <button
                  ref={(el) => { triggers.current[s.id] = el; }} type="button" className="nav-item" aria-expanded={menuId === s.id} aria-label={a.openSection(s.label)}
                  data-active={isActive(s.id, s.href) && menuId !== s.id} onClick={() => setMenuId((m) => (m === s.id ? null : s.id))}
                >
                  {s.label}
                  <ChevronDown size={14} aria-hidden className={menuId === s.id ? "rotate-180 transition-transform" : "transition-transform"} />
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-1">
          <div className="mr-1 hidden w-72 xl:block 2xl:w-96">
            <SearchCombobox variant="bar" placeholder={a.searchPlaceholder} label={a.searchLabel} inputRef={searchRef} shortcutHint={<kbd className="kbd">/</kbd>} />
          </div>
          <span className="hidden md:inline-flex xl:hidden">
            <IconButton label={a.openSearch} onClick={() => open("search")}><Search size={20} aria-hidden /></IconButton>
          </span>
          <button type="button" className="icbtn" aria-label={unread ? a.notificationsUnread(unread) : a.notifications} title={a.notifications} onClick={() => open("notifications")}>
            <Bell size={20} aria-hidden />
            {unread > 0 && <span className="count absolute -right-0.5 -top-0.5" aria-hidden>{unread > 9 ? "9+" : unread}</span>}
          </button>
          <span className="hidden md:inline-flex"><AccountMenu /></span>
        </div>
      </div>
      <span className="filete" />
      {section && <MegaMenu section={section} highlight={data.highlight[section.id]} onClose={closeMenu} />}
    </header>
  );
}
