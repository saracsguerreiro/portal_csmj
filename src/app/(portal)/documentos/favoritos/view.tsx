"use client";

import { ArrowDown, ArrowUp, FileText, GripVertical, LayoutGrid, Star, User } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Breadcrumbs, EmptyState, IconButton, LinkTabs, useToast } from "@/design-system";
import { DocSheet } from "@/features/documentos/DocSheet";
import { DocShortcuts, OtherCollections } from "@/features/documentos/Shortcuts";
import { postAction } from "@/features/shell/client-api";
import { t } from "@/i18n";
import { favoritesView, importantDocs, otherCollections } from "@/lib/api-documentos";
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
    <div className="grid grid-cols-1 gap-[var(--gap)] xl:grid-cols-12">
      <header className="panel flex flex-col gap-2 p-6 md:px-10 md:py-8 xl:col-span-12">
        <Breadcrumbs items={[{ label: d.title, href: "/documentos" }, { label: d.favTitle }]} label={t.shell.crumbs} />
        <h1 className="text-page font-bold tracking-[-0.02em]">{d.favTitle}</h1>
        <p className="max-w-[70ch] text-ui text-subtle">{d.favLead}</p>
      </header>
      <section className="panel flex min-w-0 flex-col gap-4 p-6 md:p-10 xl:col-span-8" aria-labelledby="fav-lista">
        <h2 id="fav-lista" className="panel-title">{d.favList}</h2>
        <LinkTabs label={d.favTitle} tabs={tabs} />
        {items.length === 0 ? <EmptyState plain icon={<Star size={24} aria-hidden />} title={d.favEmpty} /> : (
          <ul className="divide-y divide-[var(--ds-border-subtle)]">
            {items.map((x, i) => {
              const Icon = icons[x.kind];
              return (
                <li key={x.key} data-fav={x.key} draggable onDragStart={() => setDragging(x.key)} onDragEnd={() => setDragging(null)} onDragOver={(e) => e.preventDefault()}
                  onDrop={() => { if (!dragging || dragging === x.key) return; const keys = order.filter((k) => k !== dragging); keys.splice(keys.indexOf(x.key), 0, dragging); void save(keys); }}
                  className={`flex items-center gap-2 py-2.5 ${dragging === x.key ? "opacity-50" : ""}`}>
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
      </section>
      <aside className="flex min-w-0 flex-col gap-[var(--gap)] xl:col-span-4" aria-label={d.shortcuts}>
        <DocShortcuts items={importantDocs(s)} lead={d.shortcutsLeadAll} />
        <OtherCollections items={otherCollections()} hideFavorites />
      </aside>
      <DocSheet />
    </div>
  );
}
