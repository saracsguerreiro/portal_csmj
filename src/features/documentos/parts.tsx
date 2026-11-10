"use client";

import { Copy, Download, ExternalLink, FileSpreadsheet, FileText, Star } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ActionMenu, IconButton, ScopeTag, StatusBadge, useToast } from "@/design-system";
import { postAction } from "@/features/shell/client-api";
import { t } from "@/i18n";
import type { DocRow } from "@/lib/api-documentos";
import { asset } from "@/lib/assets";

const d = t.docs;

export function DocIcon({ format, size = 20 }: { format: string; size?: number }) {
  const Icon = format === "XLSX" ? FileSpreadsheet : FileText;
  return <Icon size={size} aria-hidden className="flex-none text-brand" />;
}

/** Estrela de favorito, optimista, para documentos, pessoas e páginas. */
export function StarToggle({ favKey, active, name }: { favKey: string; active: boolean; name: string }) {
  const { show } = useToast();
  const [on, setOn] = useState(active);
  const toggle = async () => {
    const next = !on;
    setOn(next);
    try {
      await postAction({ action: "fav.toggle", key: favKey });
      show({ message: next ? d.starred : d.unstarred, onUndo: async () => { setOn(!next); await postAction({ action: "fav.toggle", key: favKey }).catch(() => {}); } });
    } catch {
      setOn(!next);
      show({ message: t.home.needs.failed });
    }
  };
  return (
    <IconButton label={on ? d.unstar(name) : d.star(name)} aria-pressed={on} onClick={toggle}>
      <Star size={20} aria-hidden fill={on ? "var(--ds-accent-gold)" : "none"} style={{ color: on ? "var(--ds-color-gold-700)" : undefined }} />
    </IconButton>
  );
}

export function useDocActions() {
  const { show } = useToast();
  return {
    copy: async (id: string) => { try { await navigator.clipboard.writeText(`${window.location.origin}${asset(`/documentos/ficheiro/${id}/`)}`); } catch { /* sem permissão */ } show({ message: d.copied }); },
    download: () => show({ message: "No protótipo os ficheiros não são descarregados." }),
  };
}

/** Linha de documento: título legível (nunca o nome do ficheiro), metadados, estrela e menu ⋯. Abre a ficha lateral. */
export function DocRowItem({ doc, showCollection }: { doc: DocRow; showCollection?: boolean }) {
  const pathname = usePathname();
  const params = useSearchParams();
  const acts = useDocActions();
  const router = useRouter();
  const next = new URLSearchParams(params.toString());
  next.set("documento", doc.id);
  const href = `${pathname}?${next}`;
  return (
    <li className="flex items-center gap-2 py-2.5">
      <Link href={href} scroll={false} className="row-link flex min-w-0 flex-1 gap-3">
        <DocIcon format={doc.format} />
        <span className="min-w-0">
          <span className="row-title block font-semibold text-ink">{doc.title}</span>
          <span className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-caption text-subtle">
            <span>{[showCollection ? doc.collection : doc.type, doc.year, `${doc.format} ${doc.size}`, `${d.updated.toLowerCase()} ${doc.updatedLabel}`].join(" · ")}</span>
            {doc.scopeKind !== "national" && <ScopeTag kind={doc.scopeKind}>{doc.scopeLabel}</ScopeTag>}
            {doc.outOfDate && <StatusBadge tone="warn">{d.outOfDate}</StatusBadge>}
            {doc.isNew && <StatusBadge tone="brand">{d.isNew}</StatusBadge>}
          </span>
        </span>
      </Link>
      <StarToggle favKey={`doc:${doc.id}`} active={doc.favorite} name={doc.title} />
      <ActionMenu label={d.more(doc.title)} items={[
        { label: d.open, icon: <ExternalLink size={18} aria-hidden />, onSelect: () => router.push(href, { scroll: false }) },
        { label: d.download, icon: <Download size={18} aria-hidden />, onSelect: acts.download },
        { label: d.copyLink, icon: <Copy size={18} aria-hidden />, onSelect: () => acts.copy(doc.id) },
      ]} />
    </li>
  );
}

/** Pré-visualização desenhada da primeira página (o protótipo não tem os ficheiros). */
export function DocPreview({ title, number }: { title: string; number?: string }) {
  return (
    <figure aria-label={d.preview} className="mx-auto w-full max-w-[280px] rounded-[8px] border border-line-strong bg-white p-6 text-black" style={{ aspectRatio: "1 / 1.414" }}>
      <div className="mx-auto mb-4 h-8 w-8 rounded-full" style={{ background: "#852418" }} aria-hidden />
      <p className="text-center text-[11px] font-bold leading-4">{title}</p>
      {number && <p className="mt-1 text-center text-[9px]">{number}</p>}
      <div className="mt-5 flex flex-col gap-1.5" aria-hidden>
        {Array.from({ length: 11 }, (_, i) => <span key={i} className="block h-[3px] rounded bg-[#D4D4D4]" style={{ width: `${[100, 94, 98, 70, 100, 96, 88, 100, 92, 60, 85][i]}%` }} />)}
      </div>
    </figure>
  );
}
