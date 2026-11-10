"use client";

import { ArrowRightLeft, Contact, CornerDownLeft, FileText, Search, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Dialog, Button } from "@/design-system";
import { t } from "@/i18n";
import { normalise } from "@/lib/format";
import { useSuggestions } from "./SearchCombobox";
import { useShell } from "./ShellContext";

const p = t.palette;

type Row = { key: string; label: string; detail?: string; href: string; icon: React.ReactNode; group: string };

export function CommandPalette() {
  const { data, overlay, close } = useShell();
  const router = useRouter();
  const ref = useRef<HTMLDialogElement>(null);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const isOpen = overlay === "palette";
  const { hits } = useSuggestions(isOpen ? q : "");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (isOpen && !el.open) { setQ(""); setActive(0); el.showModal(); }
    if (!isOpen && el.open) el.close();
  }, [isOpen]);

  const rows = useMemo<Row[]>(() => {
    const m = normalise(q.trim());
    const local = data.palette.filter((e) => !m || normalise(`${e.label} ${e.detail ?? ""}`).includes(m));
    const icon = (g: string) => (g === "actions" ? <Zap size={18} aria-hidden /> : <ArrowRightLeft size={18} aria-hidden />);
    const out: Row[] = [
      ...local.filter((e) => e.group === "actions").map((e) => ({ key: e.id, label: e.label, detail: e.detail, href: e.href, icon: icon("actions"), group: p.actions })),
      ...local.filter((e) => e.group === "goto").slice(0, m ? 8 : 6).map((e) => ({ key: e.id, label: e.label, detail: e.detail, href: e.href, icon: icon("goto"), group: p.goTo })),
      ...hits.filter((h) => h.group === "people").map((h) => ({ key: `p-${h.id}`, label: h.title, detail: h.detail, href: h.href, icon: <Contact size={18} aria-hidden />, group: p.people })),
      ...hits.filter((h) => h.group === "documents").map((h) => ({ key: `d-${h.id}`, label: h.title, detail: h.detail, href: h.href, icon: <FileText size={18} aria-hidden />, group: p.documents })),
    ];
    return out;
  }, [data.palette, q, hits]);

  useEffect(() => setActive(0), [q]);

  const go = (r: Row) => { close(); router.push(r.href); };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, rows.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    if (e.key === "Enter" && rows[active]) { e.preventDefault(); go(rows[active]); }
  };

  useEffect(() => {
    if (isOpen) ref.current?.querySelector(`[data-active="true"]`)?.scrollIntoView({ block: "nearest" });
  }, [active, isOpen]);

  const groups = Array.from(new Set(rows.map((r) => r.group)));

  return (
    <dialog ref={ref} className="pal" aria-label={p.label} onClick={(e) => { if (e.target === ref.current) close(); }} onCancel={(e) => { e.preventDefault(); close(); }}>
      {isOpen && (
        <>
          <div className="flex items-center gap-3 border-b border-line px-5">
            <Search size={20} aria-hidden className="text-subtle" />
            <input
              autoFocus value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={onKeyDown} placeholder={p.placeholder} aria-label={p.label}
              role="combobox" aria-expanded aria-controls="pal-list" aria-autocomplete="list" aria-activedescendant={rows[active] ? `pal-${rows[active].key}` : undefined}
              className="h-14 flex-1 bg-transparent text-ui text-ink outline-none placeholder:text-subtle"
            />
          </div>
          <ul id="pal-list" role="listbox" aria-label={p.label} className="flex-1 overflow-y-auto p-2">
            {rows.length === 0 && <li role="presentation" className="p-4 text-body text-subtle">{p.empty}</li>}
            {groups.map((g) => (
              <li key={g} role="group" aria-label={g}>
                <div role="presentation" className="px-3 pb-1 pt-2 text-caption font-semibold text-subtle">{g}</div>
                <ul role="presentation">
                  {rows.filter((r) => r.group === g).map((r) => {
                    const i = rows.indexOf(r);
                    return (
                      <li key={r.key} id={`pal-${r.key}`} role="option" aria-selected={i === active} data-active={i === active} className="menu-item" onMouseEnter={() => setActive(i)} onClick={() => go(r)}>
                        {r.icon}
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-medium">{r.label}</span>
                          {r.detail && <span className="block truncate text-caption text-subtle">{r.detail}</span>}
                        </span>
                        {i === active && <CornerDownLeft size={16} aria-hidden />}
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
          </ul>
          <p className="hidden border-t border-line px-5 py-2 text-caption text-subtle md:block">{p.hint}</p>
        </>
      )}
    </dialog>
  );
}

export function ShortcutsHelp() {
  const { overlay, close } = useShell();
  const s = t.shortcuts;
  const rows: [string, React.ReactNode][] = [
    [s.search, <kbd key="s" className="kbd">/</kbd>],
    [s.home, <span key="h" className="inline-flex items-center gap-1"><kbd className="kbd">g</kbd><span className="text-caption">{s.then}</span><kbd className="kbd">i</kbd></span>],
    [s.help, <kbd key="q" className="kbd">?</kbd>],
    [s.palette, <span key="p" className="inline-flex items-center gap-1"><kbd className="kbd">Ctrl</kbd><kbd className="kbd">K</kbd></span>],
  ];
  return (
    <Dialog open={overlay === "help"} onClose={close} title={s.title} actions={<Button variant="sec" onClick={close}>{t.common.close}</Button>}>
      <dl className="divide-y divide-[var(--ds-border-subtle)]">
        {rows.map(([l, k]) => <div key={l} className="flex items-center justify-between py-2.5"><dt>{l}</dt><dd>{k}</dd></div>)}
      </dl>
    </Dialog>
  );
}
