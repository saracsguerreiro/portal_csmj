"use client";

import { UrlSheet } from "@/design-system";
import { docDetail } from "@/lib/api-documentos";
import { useSession } from "@/lib/client";
import { useQuery } from "@/lib/use-query";
import { DocDetail, DocMeta } from "./DocDetail";

/** Ficha lateral do documento (?documento=): abre sem sair da lista. */
export function DocSheet() {
  const s = useSession();
  const { documento } = useQuery();
  if (!documento) return null;
  const r = docDetail(s, documento);
  if (r.status !== "ok") return null;
  return <UrlSheet param="documento" title={r.doc.title} status={<DocMeta doc={r.doc} />}><DocDetail doc={r.doc} inSheet /></UrlSheet>;
}
