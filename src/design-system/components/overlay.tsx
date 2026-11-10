"use client";

import { X } from "lucide-react";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import { t } from "@/i18n";
import { Button, IconButton } from "./Button";

/* Continuidade: usa a View Transitions API quando existe e o movimento é permitido */
export function withTransition(update: () => void) {
  const d = document as Document & { startViewTransition?: (cb: () => void) => unknown };
  if (d.startViewTransition && !matchMedia("(prefers-reduced-motion: reduce)").matches) d.startViewTransition(update);
  else update();
}

/* Diálogo e ficha assentam em <dialog>: foco preso, Escape e fundo inerte nativos */
function useNativeDialog(open: boolean, onClose: (() => void) | undefined) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onCancel = (e: Event) => {
      e.preventDefault();
      onClose?.();
    };
    el.addEventListener("cancel", onCancel);
    return () => el.removeEventListener("cancel", onCancel);
  }, [onClose]);
  const onBackdrop = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === ref.current) onClose?.();
  };
  return { ref, onBackdrop };
}

export function Dialog({ open, onClose, title, children, actions, labelledBy }: { open: boolean; onClose?: () => void; title: string; children: ReactNode; actions: ReactNode; labelledBy?: string }) {
  const { ref, onBackdrop } = useNativeDialog(open, onClose);
  if (!open) return <dialog ref={ref} className="dlg" aria-label={title} />;
  return (
    <dialog ref={ref} className="dlg" aria-labelledby={labelledBy ?? "dlg-title"} onClick={onBackdrop}>
      <h2 id={labelledBy ?? "dlg-title"} className="text-[20px] leading-7 font-bold">{title}</h2>
      <div className="mt-2 text-body">{children}</div>
      <div className="mt-6 flex flex-wrap justify-end gap-2">{actions}</div>
    </dialog>
  );
}

export function ConfirmDialog({ open, onClose, onConfirm, title, children, verb, danger }: { open: boolean; onClose: () => void; onConfirm: () => void; title: string; children: ReactNode; verb: string; danger?: boolean }) {
  return (
    <Dialog open={open} onClose={onClose} title={title} actions={<><Button variant="gh" onClick={onClose}>{t.common.cancel}</Button><Button variant={danger ? "dng" : "pri"} onClick={onConfirm}>{verb}</Button></>}>
      {children}
    </Dialog>
  );
}

export function Sheet({ open, onClose, title, status, children, footer, narrow, viewName }: { open: boolean; onClose: () => void; title: ReactNode; status?: ReactNode; children: ReactNode; footer?: ReactNode; narrow?: boolean; viewName?: string }) {
  const { ref, onBackdrop } = useNativeDialog(open, onClose);
  return (
    <dialog ref={ref} className={["sheet", narrow && "sheet-narrow"].filter(Boolean).join(" ")} aria-labelledby="sheet-title" onClick={onBackdrop} style={viewName ? { viewTransitionName: viewName } : undefined}>
      {open && (
        <>
          <header className="sheet-head">
            <div className="flex-1 min-w-0">
              <h2 id="sheet-title" className="text-block font-semibold">{title}</h2>
              {status && <div className="mt-1 flex flex-wrap items-center gap-2">{status}</div>}
            </div>
            <IconButton label={t.common.close} onClick={onClose}><X size={20} aria-hidden /></IconButton>
          </header>
          <div className="sheet-body">{children}</div>
          {footer && <footer className="sheet-foot">{footer}</footer>}
        </>
      )}
    </dialog>
  );
}

/* Mensagens temporárias, anunciadas a leitores de ecrã */
type ToastInput = { message: string; onUndo?: () => void; duration?: number };
type ToastItem = ToastInput & { id: number };

const ToastCtx = createContext<{ show: (t: ToastInput) => void }>({ show: () => {} });

export const useToast = () => useContext(ToastCtx);

function ToastRow({ item, onDone }: { item: ToastItem; onDone: (id: number) => void }) {
  const [paused, setPaused] = useState(false);
  const left = useRef(item.duration ?? (item.onUndo ? 8000 : 4000));
  useEffect(() => {
    if (paused) return;
    const started = Date.now();
    const timer = setTimeout(() => onDone(item.id), left.current);
    return () => {
      clearTimeout(timer);
      left.current -= Date.now() - started;
    };
  }, [paused, item.id, onDone]);
  return (
    <div className="toast" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
      <span className={item.onUndo ? "" : "pr-2.5"}>{item.message}</span>
      {item.onUndo && <button type="button" className="toast-undo" onClick={() => { item.onUndo?.(); onDone(item.id); }}>{t.common.undo}</button>}
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const counter = useRef(0);
  const show = useCallback((input: ToastInput) => setItems((p) => [...p.slice(-2), { ...input, id: ++counter.current }]), []);
  const done = useCallback((id: number) => setItems((p) => p.filter((x) => x.id !== id)), []);
  return (
    <ToastCtx.Provider value={{ show }}>
      {children}
      <div role="status" aria-live="polite" className="fixed left-1/2 z-[70] flex w-max max-w-[calc(100vw-32px)] -translate-x-1/2 flex-col items-center gap-2 bottom-[calc(88px+env(safe-area-inset-bottom))] md:bottom-6">
        {items.map((i) => <ToastRow key={i.id} item={i} onDone={done} />)}
      </div>
    </ToastCtx.Provider>
  );
}

/* Separadores com navegação por setas */
export function Tabs({ label, tabs, value, onChange }: { label: string; tabs: { id: string; label: string; disabled?: boolean; force?: string }[]; value: string; onChange: (id: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const onKey = (e: KeyboardEvent) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const enabled = tabs.filter((x) => !x.disabled);
    const i = enabled.findIndex((x) => x.id === value);
    const next = enabled[(i + (e.key === "ArrowRight" ? 1 : -1) + enabled.length) % enabled.length];
    onChange(next.id);
    ref.current?.querySelector<HTMLElement>(`[data-tab="${next.id}"]`)?.focus();
  };
  return (
    <div className="tabs" role="tablist" aria-label={label} ref={ref} onKeyDown={onKey}>
      {tabs.map((x) => (
        <button key={x.id} type="button" role="tab" data-tab={x.id} data-force={x.force} className="tb" aria-selected={value === x.id} tabIndex={value === x.id ? 0 : -1} disabled={x.disabled} onClick={() => onChange(x.id)}>
          {x.label}
        </button>
      ))}
    </div>
  );
}
