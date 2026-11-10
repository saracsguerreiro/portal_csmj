"use client";

import { LoaderCircle, MessageCircleQuestion, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { ReactNode, RefObject } from "react";
import { t } from "@/i18n";
import { useShellOptional } from "./ShellContext";

const s = t.search;

export type Hit = { id: string; group: "people" | "services" | "documents" | "news" | "pages"; title: string; detail: string; href: string };

const ORDER: Hit["group"][] = ["people", "services", "documents", "news", "pages"];

export function useSuggestions(query: string) {
  const [hits, setHits] = useState<Hit[]>([]);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) { setHits([]); setLoading(false); setFailed(false); return; }
    const ctl = new AbortController();
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/pesquisa?q=${encodeURIComponent(q)}`, { signal: ctl.signal });
        if (!res.ok) throw new Error();
        setHits((await res.json()).data);
        setFailed(false);
      } catch (e) {
        if ((e as Error).name !== "AbortError") { setHits([]); setFailed(true); }
      } finally {
        if (!ctl.signal.aborted) setLoading(false);
      }
    }, 120);
    return () => { clearTimeout(timer); ctl.abort(); };
  }, [query]);
  return { hits, loading, failed };
}

type Props = {
  variant: "bar" | "overlay" | "today";
  placeholder: string;
  label: string;
  inputRef?: RefObject<HTMLInputElement | null>;
  autoFocus?: boolean;
  suggest?: boolean;
  onSubmit?: (q: string) => void;
  onNavigate?: () => void;
  shortcutHint?: ReactNode;
  trailing?: ReactNode;
  icon?: ReactNode;
};

export function SearchCombobox({ variant, placeholder, label, inputRef, autoFocus, suggest = true, onSubmit, onNavigate, shortcutHint, trailing, icon }: Props) {
  const router = useRouter();
  const listId = useId();
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const wrap = useRef<HTMLDivElement>(null);
  const { hits, loading, failed } = useSuggestions(suggest ? value : "");

  const ordered = useMemo(() => ORDER.flatMap((g) => hits.filter((h) => h.group === g)), [hits]);
  const q = value.trim();
  const showing = suggest && open && q.length >= 2;
  const askIndex = ordered.length;

  useEffect(() => { setActive(-1); }, [value]);

  const go = (href: string) => {
    setOpen(false);
    setValue("");
    onNavigate?.();
    router.push(href);
  };
  const shell = useShellOptional();
  const ask = () => {
    if (shell && !window.location.pathname.startsWith("/perguntar")) { setOpen(false); setValue(""); onNavigate?.(); shell.openAsk(q); }
    else go(`/perguntar?q=${encodeURIComponent(q)}`);
  };
  const submit = () => {
    if (!q) return;
    if (onSubmit) { onSubmit(q); setOpen(false); return; }
    go(`/pesquisa?q=${encodeURIComponent(q)}`);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape" && showing) { e.preventDefault(); e.stopPropagation(); setOpen(false); return; }
    if (!showing && e.key !== "Enter") return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => (a + 1 > askIndex ? 0 : a + 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => (a <= 0 ? askIndex : a - 1)); }
    if (e.key === "Enter") {
      e.preventDefault();
      if (showing && active >= 0) { if (active === askIndex) ask(); else go(ordered[active].href); }
      else submit();
    }
  };

  const groups = ORDER.map((g) => ({ g, items: ordered.filter((h) => h.group === g) })).filter((x) => x.items.length);
  const leading = loading ? <LoaderCircle size={18} className="spin text-subtle" aria-hidden /> : (icon ?? <Search size={18} className="text-subtle" aria-hidden />);

  const input = (
    <input
      ref={inputRef} type="search" autoFocus={autoFocus} autoComplete="off" placeholder={placeholder} aria-label={label} value={value}
      role="combobox" aria-autocomplete="list" aria-expanded={showing} aria-controls={showing ? listId : undefined}
      aria-activedescendant={showing && active >= 0 ? `${listId}-${active}` : undefined}
      onChange={(e) => { setValue(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)} onKeyDown={onKeyDown}
    />
  );

  let idx = -1;
  return (
    <div ref={wrap} className="relative" onBlur={(e) => { if (!wrap.current?.contains(e.relatedTarget as Node)) setOpen(false); }}>
      <div className={variant === "today" ? "today-box" : "search-box"}>
        {leading}
        {input}
        {shortcutHint && !value && <span className="hidden xl:inline-flex">{shortcutHint}</span>}
        {trailing}
      </div>
      {showing && (
        <div className={variant === "overlay" ? "mt-3" : "menu absolute left-0 right-0 z-50 mt-2 max-h-[min(60vh,480px)] overflow-y-auto"}>
          <ul id={listId} role="listbox" aria-label={label}>
            {groups.map(({ g, items }) => (
              <li key={g} role="group" aria-labelledby={`${listId}-${g}`} className="mb-1">
                <div id={`${listId}-${g}`} role="presentation" className="px-3 pb-1 pt-2 text-caption font-semibold text-subtle">{s.groups[g]}</div>
                <ul role="presentation">
                  {items.map((h) => {
                    idx += 1;
                    const i = idx;
                    return (
                      <li key={`${g}-${h.id}`} id={`${listId}-${i}`} role="option" aria-selected={active === i} data-active={active === i} className="menu-item" onMouseDown={(e) => e.preventDefault()} onMouseEnter={() => setActive(i)} onClick={() => go(h.href)}>
                        <span className="min-w-0">
                          <span className="block truncate font-medium">{h.title}</span>
                          <span className="block truncate text-caption text-subtle">{h.detail}</span>
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
            {!loading && !failed && ordered.length === 0 && <li role="presentation" className="px-3 py-2 text-body text-subtle">{s.empty}</li>}
            {failed && <li role="presentation" className="px-3 py-2 text-body">{s.error}</li>}
            <li id={`${listId}-${askIndex}`} role="option" aria-selected={active === askIndex} data-active={active === askIndex} className="menu-item border-t border-line" onMouseDown={(e) => e.preventDefault()} onMouseEnter={() => setActive(askIndex)} onClick={ask}>
              <MessageCircleQuestion size={18} aria-hidden />
              <span className="min-w-0 truncate font-medium">{s.ask(q)}</span>
            </li>
          </ul>
          <span className="sr-only" role="status">{loading ? s.loading : s.resultsCount(ordered.length)}</span>
        </div>
      )}
    </div>
  );
}
