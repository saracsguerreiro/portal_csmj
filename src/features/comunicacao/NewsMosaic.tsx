"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { t } from "@/i18n";
import { NewsCover } from "./content";

const n = t.news;
type Item = { id: string; slug: string; title: string; summary: string; cover: string; coverAlt: string; scopeLabel: string; dateLabel: string };

/** Padrão do mosaico em blocos de dez: grandes, altos, largos e pequenos, para a grelha não ficar monótona. */
const SPANS = ["md:col-span-2 md:row-span-2", "", "", "md:row-span-2", "md:col-span-2", "", "", "md:col-span-2 md:row-span-2", "", ""];
const STEP = 6;

function Tile({ item, index }: { item: Item; index: number }) {
  const ref = useRef<HTMLLIElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) { setShown(true); return; }
    const io = new IntersectionObserver((entries) => { if (entries.some((e) => e.isIntersecting)) { setShown(true); io.disconnect(); } }, { rootMargin: "0px 0px -8% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const big = SPANS[index % SPANS.length].includes("row-span-2") && SPANS[index % SPANS.length].includes("col-span-2");
  return (
    <li ref={ref} className={`mosaic-tile ${SPANS[index % SPANS.length]} ${index % 2 ? "from-right" : "from-left"} ${shown ? "is-in" : ""}`} style={{ transitionDelay: `${(index % STEP) * 70}ms` }}>
      <Link href={`/comunicacao/noticias/${item.slug}`} className="group relative block h-full w-full overflow-hidden bg-surface-2">
        <NewsCover slug={item.slug} src={item.cover} alt={item.coverAlt} eager={index < 4} className="absolute inset-0 !h-full transition-transform duration-700 group-hover:scale-105 group-focus-visible:scale-105" />
        <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-colors duration-300 group-hover:bg-black/70 group-focus-visible:bg-black/70" />
        <span className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-5 text-white md:p-6">
          <span className="mosaic-more text-label font-semibold uppercase tracking-[0.06em] text-white/85">{item.scopeLabel} · {item.dateLabel}</span>
          <span className={`font-semibold tracking-[-0.01em] ${big ? "text-[24px] leading-8 md:text-[32px] md:leading-10" : "text-[18px] leading-6"}`}>{item.title}</span>
          <span className="mosaic-more line-clamp-3 text-[15px] leading-6 text-white/90">{item.summary}</span>
          <span className="mosaic-more inline-flex items-center gap-2 pt-1 text-ui font-semibold">{n.seeNews}<ArrowRight size={18} aria-hidden /></span>
        </span>
      </Link>
    </li>
  );
}

/** Mosaico de notícias: os quadrados entram pela esquerda ou pela direita e, ao descer, aparecem mais. */
export function NewsMosaic({ items }: { items: Item[] }) {
  const [count, setCount] = useState(10);
  const sentinel = useRef<HTMLDivElement>(null);
  const more = count < items.length;
  useEffect(() => setCount(10), [items]);
  useEffect(() => {
    const el = sentinel.current;
    if (!el || !more || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver((entries) => { if (entries.some((e) => e.isIntersecting)) setCount((c) => c + STEP); }, { rootMargin: "0px 0px 300px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [more, count]);
  return (
    <>
      <ul className="mosaic grid grid-flow-row-dense grid-cols-1 gap-1 md:grid-cols-4" aria-label={n.title}>
        {items.slice(0, count).map((item, i) => <Tile key={item.id} item={item} index={i} />)}
      </ul>
      <div ref={sentinel} className="flex flex-col items-center gap-2 py-4">
        {more ? <button type="button" className="btn btn-sec" onClick={() => setCount((c) => c + STEP)}>{n.more}</button> : <p className="text-ui text-subtle">{n.allShown(items.length)}</p>}
      </div>
    </>
  );
}
