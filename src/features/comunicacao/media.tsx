"use client";

import { ChevronLeft, ChevronRight, Download, Play, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Dialog, Button, IconButton } from "@/design-system";
import type { Photo } from "@/data/types";
import { t } from "@/i18n";

const m = t.media;

/** Grelha justificada e visualizador em ecrã inteiro (setas, teclado, deslizar). */
export function PhotoGrid({ photos }: { photos: Photo[] }) {
  const [index, setIndex] = useState<number | null>(null);
  const ref = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const touch = useRef<number | null>(null);
  const go = useCallback((d: number) => setIndex((i) => (i === null ? i : (i + d + photos.length) % photos.length)), [photos.length]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (index !== null && !el.open) el.showModal();
    if (index === null && el.open) { el.close(); opener.current?.focus(); }
  }, [index]);

  const p = index !== null ? photos[index] : null;
  return (
    <>
      <ul className="flex flex-wrap gap-2 after:block after:flex-[10] after:content-['']">
        {photos.map((ph, i) => (
          <li key={ph.src + i} style={{ flexGrow: (ph.w / ph.h) * 100, flexBasis: (ph.w / ph.h) * 180 }} className="relative">
            <button type="button" className="block w-full overflow-hidden rounded-[12px]" aria-label={m.openPhoto(i + 1, photos.length)} onClick={(e) => { opener.current = e.currentTarget; setIndex(i); }}>
              <img src={ph.src} alt={ph.alt} loading="lazy" className="cover-img block h-full w-full object-cover transition-transform duration-200 hover:scale-[1.02]" style={{ aspectRatio: `${ph.w}/${ph.h}` }} />
            </button>
          </li>
        ))}
      </ul>
      <dialog
        ref={ref} aria-label={p?.caption} className="m-0 h-dvh max-h-none w-screen max-w-none border-0 bg-[#121212] p-0 text-white backdrop:bg-black/80"
        onCancel={(e) => { e.preventDefault(); setIndex(null); }}
        onKeyDown={(e) => { if (e.key === "ArrowRight") go(1); if (e.key === "ArrowLeft") go(-1); }}
        onTouchStart={(e) => { touch.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => { if (touch.current === null) return; const d = e.changedTouches[0].clientX - touch.current; if (Math.abs(d) > 50) go(d < 0 ? 1 : -1); touch.current = null; }}
      >
        {p && index !== null && (
          <div data-theme="dark" className="flex h-full flex-col">
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <span className="text-body font-semibold" aria-live="polite">{m.counter(index + 1, photos.length)}</span>
              <span className="flex gap-1">
                <a className="icbtn !text-white" href={p.src} download aria-label={m.download} title={m.download}><Download size={20} aria-hidden /></a>
                <IconButton label={t.common.close} className="!text-white" onClick={() => setIndex(null)}><X size={22} aria-hidden /></IconButton>
              </span>
            </div>
            <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 md:px-16">
              <img src={p.src} alt={p.alt} className="max-h-full max-w-full rounded-lg object-contain" />
              <span className="absolute left-2 top-1/2 hidden -translate-y-1/2 md:block"><IconButton label={m.prev} className="!bg-white/10 !text-white" onClick={() => go(-1)}><ChevronLeft size={24} aria-hidden /></IconButton></span>
              <span className="absolute right-2 top-1/2 hidden -translate-y-1/2 md:block"><IconButton label={m.next} className="!bg-white/10 !text-white" onClick={() => go(1)}><ChevronRight size={24} aria-hidden /></IconButton></span>
            </div>
            <p className="px-4 py-4 text-center text-body text-[#C8C8C8]">{p.caption} · {m.credit}: {p.credit}</p>
            <div className="flex justify-center gap-4 pb-4 md:hidden">
              <IconButton label={m.prev} className="!text-white" onClick={() => go(-1)}><ChevronLeft size={24} aria-hidden /></IconButton>
              <IconButton label={m.next} className="!text-white" onClick={() => go(1)}><ChevronRight size={24} aria-hidden /></IconButton>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}

export function VideoCard({ title, poster, duration, date }: { title: string; poster: string; duration: string; date: string }) {
  const [open, setOpen] = useState(false);
  return (
    <article>
      <button type="button" className="row-link group flex w-full flex-col gap-2 text-left" onClick={() => setOpen(true)} aria-label={m.play(title)}>
        <span className="relative block overflow-hidden rounded-[16px]">
          <img src={poster} alt="" loading="lazy" className="cover-img aspect-video w-full object-cover" />
          <span className="absolute inset-0 grid place-items-center"><span className="grid h-12 w-12 place-items-center rounded-full text-white" style={{ background: "var(--ds-surface-brand)" }}><Play size={22} aria-hidden /></span></span>
          <span className="absolute bottom-2 right-2 rounded-full px-2 py-0.5 text-caption font-semibold text-white" style={{ background: "var(--ds-surface-toast)" }}>{duration}</span>
        </span>
        <span className="row-title font-semibold text-ink">{title}</span>
        <span className="text-caption text-subtle">{date}</span>
      </button>
      <Dialog open={open} onClose={() => setOpen(false)} title={title} actions={<Button variant="sec" onClick={() => setOpen(false)}>{t.common.close}</Button>}>
        <img src={poster} alt="" className="cover-img mb-3 aspect-video w-full rounded-[12px] object-cover" />
        <p>{t.news.videoNote}</p>
      </Dialog>
    </article>
  );
}
