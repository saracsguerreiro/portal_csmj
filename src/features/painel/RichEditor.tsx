"use client";

import { Bold, Heading2, Heading3, Italic, Link2, List, ListOrdered, Minus, MessageSquareQuote, Pilcrow, Redo2, Strikethrough, Underline, Undo2, PanelTop } from "lucide-react";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import type { Block } from "@/data/types";
import { t } from "@/i18n";
import { sanitize } from "@/lib/sanitize";

const E = t.admin.editor;
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Converte os blocos antigos das sementes em HTML que o editor sabe abrir. */
export function blocksToHtml(blocks: Block[] = []) {
  return blocks.map((b) => {
    switch (b.t) {
      case "p": return `<p>${esc(b.text)}</p>`;
      case "h2": return `<h2>${esc(b.text)}</h2>`;
      case "ul": return `<ul>${b.items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>`;
      case "quote": return `<blockquote>${esc(b.text)}${b.by ? `<br>— ${esc(b.by)}` : ""}</blockquote>`;
      case "callout": return `<aside class="callout"><strong>${esc(b.title)}</strong> ${esc(b.text)}</aside>`;
      case "details": return `<h3>${esc(b.title)}</h3><p>${esc(b.text)}</p>`;
      case "columns": return b.cols.map((c) => `<p>${esc(c)}</p>`).join("");
      case "img": return `<figure><img src="${b.src}" alt="${esc(b.alt)}">${b.caption ? `<figcaption>${esc(b.caption)}</figcaption>` : ""}</figure>`;
      default: return "";
    }
  }).join("");
}

type Tool = { id: keyof typeof E.tools; icon: ReactNode; run: () => void };

const SLASH: { id: keyof typeof E.tools; cmd: [string, string?] }[] = [
  { id: "p", cmd: ["formatBlock", "p"] }, { id: "h2", cmd: ["formatBlock", "h2"] }, { id: "h3", cmd: ["formatBlock", "h3"] },
  { id: "ul", cmd: ["insertUnorderedList"] }, { id: "ol", cmd: ["insertOrderedList"] }, { id: "quote", cmd: ["formatBlock", "blockquote"] },
  { id: "callout", cmd: ["insertHTML", '<aside class="callout"><strong>Atenção.</strong> Texto do destaque.</aside><p><br></p>'] }, { id: "hr", cmd: ["insertHorizontalRule"] },
];

/** Editor de texto rico: barra de formatação, menu "/" e atalhos de teclado comuns. */
export function RichEditor({ label, hint, value, onChange, disabled }: { label: string; hint?: string; value: string; onChange: (html: string) => void; disabled?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();
  const [slash, setSlash] = useState<{ x: number; y: number; i: number } | null>(null);
  const last = useRef(value);

  useEffect(() => {
    if (ref.current && value !== last.current) { ref.current.innerHTML = sanitize(value); last.current = value; }
  }, [value]);
  useEffect(() => { if (ref.current) ref.current.innerHTML = sanitize(value); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const emit = () => { const html = ref.current?.innerHTML ?? ""; last.current = html; onChange(html); };
  const exec = (cmd: string, arg?: string) => { ref.current?.focus(); document.execCommand(cmd, false, arg); emit(); };

  const tools: Tool[][] = [
    [{ id: "p", icon: <Pilcrow size={16} />, run: () => exec("formatBlock", "p") }, { id: "h2", icon: <Heading2 size={16} />, run: () => exec("formatBlock", "h2") }, { id: "h3", icon: <Heading3 size={16} />, run: () => exec("formatBlock", "h3") }],
    [{ id: "bold", icon: <Bold size={16} />, run: () => exec("bold") }, { id: "italic", icon: <Italic size={16} />, run: () => exec("italic") }, { id: "underline", icon: <Underline size={16} />, run: () => exec("underline") }, { id: "strike", icon: <Strikethrough size={16} />, run: () => exec("strikeThrough") },
      { id: "link", icon: <Link2 size={16} />, run: () => { const u = window.prompt(E.linkPrompt, "https://"); if (u) exec("createLink", u); } }],
    [{ id: "ul", icon: <List size={16} />, run: () => exec("insertUnorderedList") }, { id: "ol", icon: <ListOrdered size={16} />, run: () => exec("insertOrderedList") }, { id: "quote", icon: <MessageSquareQuote size={16} />, run: () => exec("formatBlock", "blockquote") },
      { id: "callout", icon: <PanelTop size={16} />, run: () => exec("insertHTML", SLASH[6].cmd[1]) }, { id: "hr", icon: <Minus size={16} />, run: () => exec("insertHorizontalRule") }],
    [{ id: "undo", icon: <Undo2 size={16} />, run: () => exec("undo") }, { id: "redo", icon: <Redo2 size={16} />, run: () => exec("redo") }],
  ];

  const pick = (i: number) => {
    const item = SLASH[i];
    setSlash(null);
    document.execCommand("delete");
    exec(item.cmd[0], item.cmd[1]);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (slash) {
      if (e.key === "ArrowDown") { e.preventDefault(); setSlash({ ...slash, i: (slash.i + 1) % SLASH.length }); return; }
      if (e.key === "ArrowUp") { e.preventDefault(); setSlash({ ...slash, i: (slash.i - 1 + SLASH.length) % SLASH.length }); return; }
      if (e.key === "Enter") { e.preventDefault(); pick(slash.i); return; }
      if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); setSlash(null); return; }
      setSlash(null);
    }
    if (e.key === "/") {
      const sel = window.getSelection();
      const node = sel?.anchorNode;
      const text = node?.nodeType === 3 ? node.textContent ?? "" : (node as HTMLElement | null)?.textContent ?? "";
      if (!text.trim()) {
        const r = sel?.rangeCount ? sel.getRangeAt(0).getBoundingClientRect() : null;
        const box = ref.current!.getBoundingClientRect();
        setTimeout(() => setSlash({ x: (r?.left || box.left + 16) - box.left, y: (r?.bottom || box.top + 32) - box.top + 6, i: 0 }), 0);
      }
    }
  };

  return (
    <div className="field">
      <span id={`${id}-l`} className="field-label">{label}</span>
      <div className={`overflow-hidden rounded-[16px] border border-line-strong bg-surface focus-within:border-[var(--ds-border-focus,var(--ds-border-brand))] ${disabled ? "opacity-60" : ""}`}>
        <div role="toolbar" aria-label={E.toolbar} aria-controls={id} className="flex flex-wrap items-center gap-0.5 border-b border-line bg-surface-2 px-2 py-1.5">
          {tools.map((group, gi) => (
            <div key={gi} className={`flex gap-0.5 ${gi ? "border-l border-line pl-1.5 ml-1" : ""}`}>
              {group.map((tl) => (
                <button key={tl.id} type="button" className="icbtn !h-8 !w-8" aria-label={E.tools[tl.id]} title={E.tools[tl.id]} disabled={disabled} onMouseDown={(e) => e.preventDefault()} onClick={tl.run}>
                  <span aria-hidden>{tl.icon}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
        <div className="relative">
          <div
            ref={ref} id={id} role="textbox" aria-multiline="true" aria-labelledby={`${id}-l`} aria-describedby={hint ? `${id}-h` : undefined}
            contentEditable={!disabled} suppressContentEditableWarning
            className="prose-read prose-editor min-h-[320px] px-5 py-4 outline-none"
            onInput={emit} onKeyDown={onKeyDown} onBlur={() => setTimeout(() => setSlash(null), 150)}
          />
          {slash && (
            <div role="listbox" aria-label={E.slashTitle} className="menu absolute z-30 w-56" style={{ left: Math.max(8, slash.x), top: slash.y }}>
              <p className="px-3 pb-1 pt-2 text-label text-subtle">{E.slashTitle}</p>
              {SLASH.map((s, i) => (
                <button key={s.id} type="button" role="option" aria-selected={i === slash.i} className={`menu-item w-full ${i === slash.i ? "bg-hover" : ""}`} onMouseDown={(e) => { e.preventDefault(); pick(i); }}>{E.tools[s.id]}</button>
              ))}
            </div>
          )}
        </div>
      </div>
      {hint && <span id={`${id}-h`} className="field-hint">{hint}</span>}
    </div>
  );
}
