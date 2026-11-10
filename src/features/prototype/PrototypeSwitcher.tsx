"use client";

import { SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button, Segmented, SelectField, Switch, useToast } from "@/design-system";
import { t } from "@/i18n";
import { COOKIE } from "@/lib/cookies";
import { setPrefs } from "@/features/shell/client-api";
import { useShell } from "@/features/shell/ShellContext";

const p = t.prototype;

/** Selector discreto: só existe no protótipo. */
export function PrototypeSwitcher() {
  const { data } = useShell();
  const router = useRouter();
  const pathname = usePathname();
  const { show } = useToast();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const save = async (set: Parameters<typeof setPrefs>[0], reset = false) => {
    await setPrefs(set, reset);
  };

  return (
    <div ref={ref} className="fixed right-2 flex flex-col items-end z-[60] bottom-[calc(64px+env(safe-area-inset-bottom))] md:bottom-3 md:right-3" onKeyDown={(e) => { if (e.key === "Escape" && open) { e.stopPropagation(); setOpen(false); } }}>
      {open && (
        <div className="menu mb-2 ml-auto flex w-[300px] flex-col gap-3 !p-4">
          <p className="text-label font-semibold text-ink">{p.title}</p>
          <div className="flex flex-col gap-1">
            <span className="field-label">{p.area}</span>
            <Segmented legend={p.area} value={pathname.startsWith("/painel") ? "admin" : "portal"} onChange={(v) => { if (v === "admin") router.push("/painel"); else router.push("/"); setOpen(false); }} options={[{ value: "portal", label: p.portal }, { value: "admin", label: p.admin }]} />
          </div>
          <SelectField label={p.profile} options={data.profiles} value={data.profileId} onChange={(e) => save({ [COOKIE.profile]: e.target.value, [COOKIE.unit]: null })} />
          <SelectField label={p.unit} options={data.units} value={data.unit.value} onChange={(e) => save({ [COOKIE.unit]: e.target.value })} />
          <Switch checked={data.failing} onChange={(e) => save({ [COOKIE.fail]: e.target.checked ? "1" : null })}>{p.failure}</Switch>
          <Switch checked={data.blockingNotice} onChange={(e) => save({ [COOKIE.blocking]: e.target.checked ? "1" : null })}>{p.blocking}</Switch>
          <div className="flex items-center justify-between gap-2">
            <Button size="sm" variant="sec" onClick={async () => { await save({}, true); show({ message: p.resetDone }); }}>{p.reset}</Button>
            <Link href="/design-system" className="link-quiet text-label">{p.designSystem}</Link>
          </div>
          <p className="field-hint">{p.note}</p>
        </div>
      )}
      <button type="button" className="icbtn !bg-surface" style={{ boxShadow: "var(--ds-shadow-md)" }} aria-expanded={open} aria-label={p.open} title={p.open} onClick={() => setOpen((o) => !o)}>
        <SlidersHorizontal size={18} aria-hidden />
      </button>
    </div>
  );
}
