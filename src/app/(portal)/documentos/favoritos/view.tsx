"use client";

import { ArrowDown, ArrowUp, FileText, GripVertical, LayoutGrid, Star, User } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { EmptyState, IconButton, LinkTabs, PageHeader, useToast } from "@/design-system";
import { postAction } from "@/features/shell/client-api";
import { t } from "@/i18n";
import { favoritesView } from "@/lib/api-documentos";
import { useSession } from "@/lib/client";
import { useQuery } from "@/lib/use-query";

const d = t.docs;
const icons = { doc: FileText, pag: LayoutGrid, pessoa: User } as const;

export function FavoritesView() {
  const s = useSession();
  const { separador } = useQuery();
  const tab = (separador === "paginas" ? "pag" : separador === "pessoas" ? "pessoa" : "doc") as "doc" | "pag" | "pessoa";
  const all = favoritesView(s);
  const { show } = useToast();
  const [order, setOrder] = useState(all.map((x) => x.key));
  const [dragging, setDragging] = useState<string | null>(null);
  useEffect(() => setOrder(all.map((x) => x.key)), [all.map((x) => x.key).join("|")]); // eslint-disable-line react-hooks/exhaustive-deps
  const items = order.map((k) => all.find((x) => x.key === k)!).filter((x) => x && x.kind === tab);

  const save = async (keys: string[]) => {
    setOrder(keys);
    try { await postAction({ action: "fav.order", keys }); show({ message: d.reordered }); } catch { show({ message: t.home.needs.failed }); }
  };
  const move = (key: string, dir: -1 | 1) => {
    const same = order.filter((k) => all.find((x) => x.key === k)?.kind === tab);
    const i = same.indexOf(key);
    const j = i + dir;
    if (j < 0 || j >= same.length) return;
    const swapped = [...same];
    [swapped[i], swapped[j]] = [swapped[j], swapped[i]];
    const others = order.filter((k) => !same.includes(k));
    void save([...swapped, ...others]);
    requestAnimationFrame(() => document.querySelector<HTMLElement>(`[data-fav="${key}"] [data-dir="${dir}"]`)?.focus());
  };
  const remove = async (key: string) => {
    const before = order;
    setOrder(order.filter((k) => k !== key));
    try {
      await postAction({ action: "fav.toggle", key });
      show({ message: d.unstarred, onUndo: async () => { await postAction({ action: "fav.order", keys: before }).catch(() => {}); setOrder(before); } });
    } catch { setOrder(before); }
  };

  const tabs = (["doc", "pag", "pessoa"] as const).map((k) => ({ href: k === "doc" ? "/documentos/favoritos" : `/documentos/favoritos?separador=${k === "pag" ? "paginas" : "pessoas"}`, label: d.favTabs[k], current: tab === k, count: all.filter((x) => x.kind === k).length }));

  return (
    <div className="wrap flex flex-col gap-6 py-6 md:py-8">
      <PageHeader crumbs={[{ label: d.title, href: "/documentos" }, { label: d.favTitle }]} title={d.favTitle} description={d.favLead} />
      <LinkTabs label={d.favTitle} tabs={tabs} />
      {items.length === 0 ? <EmptyState icon={<Star size={24} aria-hidden />} title={d.favEmpty} /> : (
        <ul className="card !py-1 divide-y divide-[var(--ds-border-subtle)]">
          {items.map((x, i) => {
            const Icon = icons[x.kind];
            return (
              <li key={x.key} data-fav={x.key} draggable onDragStart={() => setDragging(x.key)} onDragEnd={() => setDragging(null)} onDragOver={(e) => e.preventDefault()}
                onDrop={() => { if (!dragging || dragging === x.key) return; const keys = order.filter((k) => k !== dragging); keys.splice(keys.indexOf(x.key), 0, dragging); void save(keys); }}
                className={`flex items-center gap-2 py-2 ${dragging === x.key ? "opacity-50" : ""}`}>
                <GripVertical size={18} aria-hidden className="hidden flex-none cursor-grab text-subtle md:block" />
                <Link href={x.href} className="row-link flex min-w-0 flex-1 gap-3"><Icon size={20} aria-hidden className="mt-0.5 flex-none text-brand" /><span className="min-w-0"><span className="row-title block font-semibold text-ink">{x.title}</span><span className="block truncate text-caption text-subtle">{x.detail}</span></span></Link>
                <IconButton size="sm" label={d.moveUp(x.title)} data-dir={-1} disabled={i === 0} onClick={() => move(x.key, -1)}><ArrowUp size={16} aria-hidden /></IconButton>
                <IconButton size="sm" label={d.moveDown(x.title)} data-dir={1} disabled={i === items.length - 1} onClick={() => move(x.key, 1)}><ArrowDown size={16} aria-hidden /></IconButton>
                <IconButton label={d.removeFav(x.title)} onClick={() => remove(x.key)}><Star size={20} aria-hidden fill="var(--ds-accent-gold)" style={{ color: "var(--ds-color-gold-700)" }} /></IconButton>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
