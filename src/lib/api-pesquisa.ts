import "server-only";
import { documents } from "@/data/documents";
import { events } from "@/data/events";
import { albums, videos } from "@/data/media";
import { menu } from "@/data/navigation";
import { news } from "@/data/news";
import { notices } from "@/data/notices";
import { people } from "@/data/people";
import { services } from "@/data/services";
import { units } from "@/data/units";
import { dateShort, normalise } from "./format";
import { inPeriod } from "./api-comunicacao";
import { inScope, scopeLabel } from "./scope";
import type { Session } from "./session";

export type Group = "people" | "services" | "documents" | "news" | "events" | "pages" | "media";
export type Part = { text: string; mark: boolean };
export type Result = { id: string; group: Group; title: Part[]; detail: string; snippet?: Part[]; href: string; date?: string; scopes?: string[]; format?: string; tags?: string[]; score: number };

const words = (q: string) => normalise(q).split(/\s+/).filter((w) => w.length > 1);

/** Famílias de palavras: "magistrado" encontra "magistrados", sem acentos nem maiúsculas. */
function stem(w: string) {
  return w.replace(/(oes|aes|ais|eis|ns|es|s)$/, "").replace(/(a|o|e)$/, "");
}

function matches(q: string, text: string) {
  const hay = normalise(text);
  return words(q).every((w) => hay.includes(stem(w)));
}

export function highlight(text: string, q: string): Part[] {
  const stems = words(q).map(stem).filter((w) => w.length > 1);
  if (!stems.length) return [{ text, mark: false }];
  const norm = normalise(text);
  const marks = new Array(text.length).fill(false);
  const isL = (ch: string | undefined) => !!ch && /[\p{L}\p{N}]/u.test(ch);
  stems.forEach((st) => {
    let i = norm.indexOf(st);
    while (i >= 0) {
      let a = i; let b = i + st.length;
      while (isL(norm[a - 1])) a--;
      while (isL(norm[b])) b++;
      for (let k = a; k < b; k++) marks[k] = true;
      i = norm.indexOf(st, i + 1);
    }
  });
  const parts: Part[] = [];
  for (let i = 0; i < text.length; i++) {
    const last = parts[parts.length - 1];
    if (last && last.mark === marks[i]) last.text += text[i]; else parts.push({ text: text[i], mark: marks[i] });
  }
  return parts;
}

function snippet(text: string, q: string) {
  const n = normalise(text);
  const st = words(q).map(stem)[0] ?? "";
  const at = Math.max(0, n.indexOf(st) - 60);
  const cut = (at > 0 ? "…" : "") + text.slice(at, at + 180) + (text.length > at + 180 ? "…" : "");
  return highlight(cut, q);
}

export function searchAll(s: Session, q: string, f: { periodo?: string; quem?: string; ficheiro?: string }) {
  if (s.failing) throw new Error("falha simulada");
  const out: Result[] = [];
  const titleScore = (title: string, tags: string[] = []) => (matches(q, title) ? 2 : 0) + (tags.some((x) => matches(q, x)) ? 3 : 0);
  const okScope = (scopes: string[]) => inScope({ scopes }, s.unit.id) && (!f.quem || scopes.includes(f.quem));
  const add = (r: Omit<Result, "title" | "score"> & { rawTitle: string; body: string; tags?: string[] }) => {
    if (!matches(q, `${r.rawTitle} ${r.body} ${(r.tags ?? []).join(" ")}`)) return;
    if (r.date && !inPeriod(r.date, f.periodo)) return;
    out.push({ ...r, title: highlight(r.rawTitle, q), snippet: r.body ? snippet(r.body, q) : undefined, score: titleScore(r.rawTitle, r.tags) });
  };
  people.forEach((p) => add({ id: p.id, group: "people", rawTitle: p.name, body: `${p.role} ${units.find((u) => u.id === p.unitId)?.name} ${p.extension}`, detail: `${p.role} · ${units.find((u) => u.id === p.unitId)?.short}`, href: `/pessoas/${p.slug}` }));
  services.forEach((x) => add({ id: x.id, group: "services", rawTitle: x.name, body: `${x.description} ${x.category}`, detail: `${x.category} · Decide: ${x.decider}`, href: `/servicos/pedir/${x.slug}` }));
  documents.filter((d) => okScope(d.scopes) && (!f.ficheiro || d.format === f.ficheiro)).forEach((d) => add({ id: d.id, group: "documents", rawTitle: d.title, body: `${d.collection} ${d.type}`, detail: `${d.collection} · ${d.format} ${d.size} · ${dateShort(d.updatedAt)}`, href: `/documentos/ficheiro/${d.id}`, date: d.updatedAt, format: d.format }));
  if (!f.ficheiro) {
    news.filter((n) => okScope(n.scopes)).forEach((n) => add({ id: n.id, group: "news", rawTitle: n.title, body: `${n.summary} ${(n.body ?? []).map((b) => ("text" in b ? b.text : "")).join(" ")}`, tags: n.tags, detail: `${scopeLabel(n)} · ${dateShort(n.publishedAt)}`, href: `/comunicacao/noticias/${n.slug}`, date: n.publishedAt }));
    notices.filter((n) => okScope(n.scopes)).forEach((n) => add({ id: n.id, group: "news", rawTitle: n.number ? `${n.number} · ${n.title}` : n.title, body: n.body.join(" "), detail: `Aviso · ${scopeLabel(n)} · ${dateShort(n.publishedAt)}`, href: `/comunicacao/avisos/${n.id}`, date: n.publishedAt }));
    events.filter((e) => okScope(e.scopes)).forEach((e) => add({ id: e.id, group: "events", rawTitle: e.title, body: e.description.join(" "), tags: e.tags, detail: `${dateShort(e.startsAt)} · ${e.place ?? "Online"} · ${scopeLabel(e)}`, href: `/comunicacao/eventos/${e.slug}`, date: e.startsAt }));
    menu.flatMap((m) => m.items.filter((i) => i.requires !== "approver" || s.profile.approver)).forEach((i) => add({ id: i.id, group: "pages", rawTitle: i.label, body: i.description, detail: i.description, href: i.href }));
    albums.filter((a) => okScope(a.scopes)).forEach((a) => add({ id: a.id, group: "media", rawTitle: a.title, body: a.description, tags: a.tags, detail: `Álbum · ${dateShort(a.happenedAt)}`, href: `/comunicacao/multimedia/${a.slug}`, date: a.happenedAt }));
    videos.filter((v) => okScope(v.scopes)).forEach((v) => add({ id: v.id, group: "media", rawTitle: v.title, body: v.tags.join(" "), detail: `Vídeo · ${v.duration}`, href: "/comunicacao/multimedia?separador=videos", date: v.publishedAt }));
  }
  out.sort((a, b) => b.score - a.score);
  return out;
}

const vocabulary = () => Array.from(new Set([...news.map((n) => n.title), ...documents.map((d) => d.title), ...services.map((x) => x.name), ...people.map((p) => p.name)].flatMap((t) => normalise(t).split(/\W+/)).filter((w) => w.length > 3)));

function lev(a: string, b: string) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...new Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}

/** Sugestões de grafia quando não há resultados. */
export function suggest(q: string) {
  const vocab = vocabulary();
  const fixed = words(q).map((w) => vocab.reduce((best, v) => (lev(w, v) < lev(w, best) ? v : best), vocab[0]));
  const s = fixed.join(" ");
  return s && s !== normalise(q) ? s : undefined;
}
