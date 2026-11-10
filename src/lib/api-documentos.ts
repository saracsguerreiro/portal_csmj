import { collections, documents } from "@/data/documents";
import { menu } from "@/data/navigation";
import { news } from "@/data/news";
import { people } from "@/data/people";
import type { DocumentItem } from "@/data/types";
import { units } from "@/data/units";
import { canReadDoc } from "./docs";
import { dateLong, dateShort, normalise, relative } from "./format";
import { inScope, scopeKind, scopeLabel } from "./scope";
import type { Session } from "./session";
import { stateOf } from "./store";

const DEFAULT_FAVS = ["doc:lei-organica-jc", "doc:modelo-acta", "pessoa:domingos-tchipa", "pag:/servicos/salas"];

export function favoriteKeys(s: Session) {
  const st = stateOf(s.person.id);
  return st.favorites ?? (s.person.id === "marta-kiala" ? DEFAULT_FAVS : []);
}

export function docRow(d: DocumentItem, s: Session) {
  const keys = favoriteKeys(s);
  return {
    id: d.id, title: d.title, collection: d.collection, collectionId: d.collectionId, folder: d.folder, type: d.type, format: d.format, size: d.size, year: d.year,
    updatedLabel: dateShort(d.updatedAt), updatedRel: relative(d.updatedAt), isNew: d.isNew, outOfDate: !!d.outOfDate, favorite: keys.includes(`doc:${d.id}`),
    scopeLabel: scopeLabel(d), scopeKind: scopeKind(d),
  };
}
export type DocRow = ReturnType<typeof docRow>;

const textMatch = (q: string | undefined, d: DocumentItem) => !q || normalise(`${d.title} ${d.description} ${d.text} ${d.tags.join(" ")}`).includes(normalise(q));

export function docsHome(s: Session, q?: string) {
  if (s.failing) throw new Error("falha simulada");
  const readable = documents.filter((d) => canReadDoc(s, d));
  const keys = favoriteKeys(s).filter((k) => k.startsWith("doc:"));
  return {
    collections: collections.map((c) => ({ ...c, count: readable.filter((d) => d.collectionId === c.id).length })).filter((c) => c.count > 0),
    favorites: keys.map((k) => readable.find((d) => `doc:${d.id}` === k)).filter(Boolean).slice(0, 5).map((d) => docRow(d!, s)),
    favoritesTotal: keys.length,
    recent: [...readable].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 10).map((d) => docRow(d, s)),
    popular: [...readable].sort((a, b) => b.views - a.views).slice(0, 5).map((d) => docRow(d, s)),
    results: q ? readable.filter((d) => textMatch(q, d)).map((d) => docRow(d, s)) : undefined,
  };
}

export function collectionView(s: Session, slug: string, f: { q?: string; tipo?: string; ano?: string; quem?: string; ordem?: string; pasta?: string }) {
  if (s.failing) throw new Error("falha simulada");
  const c = collections.find((x) => x.slug === slug);
  if (!c) return null;
  const folders = c.folders.filter((fo) => !fo.readers || fo.readers.includes(s.profile.id));
  const readable = documents.filter((d) => d.collectionId === c.id && canReadDoc(s, d));
  let items = readable.filter((d) => (!f.pasta || d.folder === f.pasta) && (!f.tipo || d.type === f.tipo) && (!f.ano || String(d.year) === f.ano) && (!f.quem || d.scopes.includes(f.quem)) && textMatch(f.q, d));
  items = [...items].sort((a, b) => (f.ordem === "az" ? a.title.localeCompare(b.title, "pt") : f.ordem === "consultados" ? b.views - a.views : b.updatedAt.localeCompare(a.updatedAt)));
  return {
    collection: { id: c.id, slug: c.slug, name: c.name, description: c.description },
    folders: folders.map((fo) => ({ ...fo, count: readable.filter((d) => d.folder === fo.id).length })),
    types: Array.from(new Set(readable.map((d) => d.type))).sort(),
    years: Array.from(new Set(readable.map((d) => String(d.year)))).sort().reverse(),
    items: items.map((d) => docRow(d, s)),
  };
}

export function docDetail(s: Session, id: string) {
  const d = documents.find((x) => x.id === id);
  if (!d) return { status: "missing" as const };
  if (!canReadDoc(s, d)) return { status: "denied" as const };
  const c = collections.find((x) => x.id === d.collectionId)!;
  const resp = people.find((p) => p.id === d.responsibleId);
  const usedIn = news.filter((n) => inScope(n, s.unit.id) && (n.body ?? []).some((b) => "text" in b && normalise(b.text).includes(normalise(d.title).slice(0, 18)))).map((n) => ({ title: n.title, href: `/comunicacao/noticias/${n.slug}` }));
  return {
    status: "ok" as const,
    doc: { ...docRow(d, s), description: d.description, number: d.number, publishedLabel: dateLong(d.publishedAt), updatedLong: dateLong(d.updatedAt), validLabel: d.validUntil ? dateLong(`${d.validUntil}T12:00:00+01:00`) : undefined, responsible: resp?.name, folderName: c.folders.find((x) => x.id === d.folder)?.name ?? "", collectionSlug: c.slug, tags: d.tags, fileName: d.fileName, versions: d.versions.map((v) => ({ ...v, dateLabel: dateShort(v.date) })), usedIn },
  };
}

/** Favoritos: documentos, páginas e pessoas, pela ordem que a pessoa escolheu. */
export function favoritesView(s: Session) {
  const keys = favoriteKeys(s);
  const pages = menu.flatMap((m) => m.items);
  return keys.map((k) => {
    const [kind, ...rest] = k.split(":");
    const id = rest.join(":");
    if (kind === "doc") { const d = documents.find((x) => x.id === id); return d && canReadDoc(s, d) ? { key: k, kind: "doc" as const, title: d.title, detail: `${d.collection} · ${d.format} ${d.size}`, href: `/documentos/ficheiro/${d.id}` } : null; }
    if (kind === "pessoa") { const p = people.find((x) => x.slug === id); return p ? { key: k, kind: "pessoa" as const, title: p.name, detail: `${p.role} · ${units.find((u) => u.id === p.unitId)?.short}`, href: `/pessoas/${p.slug}` } : null; }
    const pg = pages.find((x) => x.href === id);
    return pg ? { key: k, kind: "pag" as const, title: pg.label, detail: pg.description, href: pg.href } : null;
  }).filter(Boolean) as { key: string; kind: "doc" | "pessoa" | "pag"; title: string; detail: string; href: string }[];
}
