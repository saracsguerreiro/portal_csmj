"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import type { MenuSection } from "@/data/types";
import { t } from "@/i18n";
import { NamedIcon } from "./icons";
import type { HighlightView } from "./types";

/** Abre ao clicar; setas percorrem, Tab fica dentro, Escape fecha e devolve o foco. */
export function MegaMenu({ section, highlight, onClose }: { section: MenuSection; highlight: HighlightView; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.querySelector<HTMLElement>("a")?.focus();
  }, [section.id]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const links = Array.from(ref.current?.querySelectorAll<HTMLElement>("a") ?? []);
    const i = links.indexOf(document.activeElement as HTMLElement);
    if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); onClose(); return; }
    if (e.key === "ArrowDown" || e.key === "ArrowRight") { e.preventDefault(); links[(i + 1) % links.length]?.focus(); }
    if (e.key === "ArrowUp" || e.key === "ArrowLeft") { e.preventDefault(); links[(i - 1 + links.length) % links.length]?.focus(); }
    if (e.key === "Tab") { e.preventDefault(); links[(i + (e.shiftKey ? -1 : 1) + links.length) % links.length]?.focus(); }
  };

  return (
    <div ref={ref} onKeyDown={onKeyDown} role="group" aria-label={section.label} className="absolute inset-x-0 top-full border-t border-line bg-surface" style={{ boxShadow: "var(--ds-shadow-lg)" }}>
      <div className="wrap grid grid-cols-12 gap-6 py-6">
        <ul className="col-span-8 grid grid-cols-2 gap-1">
          {section.items.map((item) => (
            <li key={item.id}>
              <Link href={item.href} onClick={onClose} className="menu-item items-start !p-3">
                <span className="mt-0.5 text-brand"><NamedIcon name={item.icon} /></span>
                <span className="min-w-0">
                  <span className="block font-semibold">{item.label}</span>
                  <span className="block text-label text-subtle">{item.description}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
        {highlight && (
          <div className="col-span-4 border-l border-line pl-6">
            <p className="sr-only">{t.shell.highlight}</p>
            <p className="text-caption font-semibold text-subtle">{highlight.label}</p>
            <Link href={highlight.href} onClick={onClose} className="row-link mt-1 rounded-sm">
              <span className="row-title block text-block font-semibold text-ink">{highlight.title}</span>
              {highlight.detail && <span className="mt-1 block text-body">{highlight.detail}</span>}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
