"use client";

import { Bell, CircleHelp, Globe, LayoutDashboard, LogOut, Monitor, Moon, Sun, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Avatar, Segmented } from "@/design-system";
import { t } from "@/i18n";
import { COOKIE } from "@/lib/cookies";
import { asset } from "@/lib/assets";
import { applyDensity, applyTheme, setPrefs } from "./client-api";
import { useShell } from "./ShellContext";

const a = t.shell;

export function ThemeControl() {
  const { data } = useShell();
  const [theme, setTheme] = useState(data.theme);
  return (
    <Segmented
      legend={a.theme} value={theme}
      onChange={(v) => { setTheme(v); applyTheme(v); }}
      options={[
        { value: "light", label: a.themeLight, icon: <Sun size={14} aria-hidden /> },
        { value: "dark", label: a.themeDark, icon: <Moon size={14} aria-hidden /> },
        { value: "auto", label: a.themeAuto, icon: <Monitor size={14} aria-hidden /> },
      ]}
    />
  );
}

export function DensityControl() {
  const { data } = useShell();
  const [density, setDensity] = useState(data.density);
  return (
    <Segmented
      legend={a.density} value={density}
      onChange={(v) => { setDensity(v); applyDensity(v); }}
      options={[{ value: "comfortable", label: a.densityComfortable }, { value: "compact", label: a.densityCompact }]}
    />
  );
}

export function UnitControl({ quiet }: { quiet?: boolean }) {
  const { data } = useShell();
  const router = useRouter();
  if (data.myUnits.length < 2) return <span className={quiet ? "text-body font-medium text-ink" : "text-body"}>{data.unit.label}</span>;
  return (
    <span className="inp-wrap inline-block">
      <select
        aria-label={a.activeUnit} className={quiet ? "appearance-none [field-sizing:content] bg-transparent pr-6 text-body font-medium text-ink cursor-pointer min-h-11 md:min-h-0" : "inp"} value={data.unit.value}
        onChange={async (e) => { await setPrefs({ [COOKIE.unit]: e.target.value }); }}
      >
        {data.myUnits.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
      </select>
      <svg className="inp-chevron !right-1" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden><path d="m6 9 6 6 6-6" /></svg>
    </span>
  );
}

export async function signOut() {
  await setPrefs({ [COOKIE.out]: "1" });
  window.location.href = asset("/entrar/");
}

export function AccountMenu({ placement }: { placement?: "rail" } = {}) {
  const { data } = useShell();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const close = () => { setOpen(false); button.current?.focus(); };

  return (
    <div ref={ref} className="relative" onKeyDown={(e) => { if (e.key === "Escape" && open) { e.stopPropagation(); close(); } }}>
      <button ref={button} type="button" className="icbtn" aria-haspopup="true" aria-expanded={open} aria-label={a.account} onClick={() => setOpen((o) => !o)}>
        <Avatar initials={data.person.initials} size="sm" />
      </button>
      {open && (
        <div className={`menu absolute z-50 w-[352px] ${placement === "rail" ? "bottom-0 left-full ml-3" : "right-0 top-full mt-2"}`}>
          <div className="flex items-center gap-3 px-3 py-2">
            <Avatar initials={data.person.initials} />
            <div className="min-w-0">
              <p className="truncate font-semibold text-ink">{data.person.name}</p>
              <p className="truncate text-label text-subtle">{data.person.role}</p>
            </div>
          </div>
          <div className="px-3 pb-2">
            <p className="text-caption font-medium text-subtle">{a.activeUnit}</p>
            <UnitControl quiet />
          </div>
          <hr className="rule my-1" />
          <Link className="menu-item" href="/conta" onClick={close}><User size={18} aria-hidden />{a.myAccount}</Link>
          <Link className="menu-item" href="/conta?separador=notificacoes" onClick={close}><Bell size={18} aria-hidden />{a.notificationPrefs}</Link>
          <div className="menu-item !cursor-default hover:!bg-transparent"><Globe size={18} aria-hidden /><span className="flex-1">{a.language}</span><span className="text-label text-subtle">{a.languageValue}</span></div>
          <div className="flex flex-col gap-3 px-3 py-2">
            <div className="flex flex-col gap-1"><span className="text-caption font-medium text-subtle">{a.theme}</span><ThemeControl /></div>
            <div className="flex flex-col gap-1"><span className="text-caption font-medium text-subtle">{a.density}</span><DensityControl /></div>
          </div>
          <hr className="rule my-1" />
          {data.canUseAdmin && <Link className="menu-item" href="/painel" onClick={close}><LayoutDashboard size={18} aria-hidden />{a.goToAdmin}</Link>}
          <Link className="menu-item" href="/ajuda" onClick={close}><CircleHelp size={18} aria-hidden />{a.help}</Link>
          <button type="button" className="menu-item" onClick={signOut}><LogOut size={18} aria-hidden />{a.signOut}</button>
        </div>
      )}
    </div>
  );
}
