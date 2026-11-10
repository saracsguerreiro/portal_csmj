import "server-only";
import { documents } from "@/data/documents";
import { events } from "@/data/events";
import { news } from "@/data/news";
import { notices } from "@/data/notices";
import { people } from "@/data/people";
import { services } from "@/data/services";
import { units } from "@/data/units";
import { dateLong, normalise, timeOf, dayOfMonth, monthLong } from "./format";
import { inScope } from "./scope";
import type { Session } from "./session";
import { searchAll } from "./api-pesquisa";

export type Source = { n: number; type: "service" | "document" | "notice" | "news" | "event" | "person"; title: string; excerpt: string; href: string };
export type Segment = { text: string } | { cite: number };
export type Answer = { found: boolean; segments: Segment[]; sources: Source[]; followUps: string[] };

type Cand = Omit<Source, "n"> & { scopes: string[] };

/** Catálogo de fontes que a pessoa pode ler. A IA nunca vê o resto. */
function catalogue(s: Session): Record<string, Cand> {
  const c: Record<string, Cand> = {};
  const ok = (scopes: string[]) => inScope({ scopes }, s.unit.id);
  services.forEach((x) => (c[`s:${x.id}`] = { type: "service", title: x.name, excerpt: `${x.description} Decide: ${x.decider}. Resposta média em ${x.avgDays} ${x.avgDays === 1 ? "dia" : "dias"}.`, href: `/servicos/pedir/${x.slug}`, scopes: ["nacional"] }));
  documents.filter((d) => ok(d.scopes)).forEach((d) => (c[`d:${d.id}`] = { type: "document", title: d.title, excerpt: `${d.collection} · ${d.type} · ${d.format}, ${d.size}. Actualizado em ${dateLong(d.updatedAt)}.`, href: `/documentos/ficheiro/${d.id}`, scopes: d.scopes }));
  notices.filter((n) => ok(n.scopes)).forEach((n) => (c[`a:${n.id}`] = { type: "notice", title: n.number ? `${n.number} · ${n.title}` : n.title, excerpt: n.body[0], href: `/comunicacao/avisos/${n.id}`, scopes: n.scopes }));
  news.filter((n) => ok(n.scopes)).forEach((n) => (c[`n:${n.id}`] = { type: "news", title: n.title, excerpt: n.summary, href: `/comunicacao/noticias/${n.slug}`, scopes: n.scopes }));
  events.filter((e) => ok(e.scopes)).forEach((e) => (c[`e:${e.id}`] = { type: "event", title: e.title, excerpt: `${dateLong(e.startsAt)}, ${timeOf(e.startsAt)} · ${e.place ?? "Online"}. ${e.description[0]}`, href: `/comunicacao/eventos/${e.slug}`, scopes: e.scopes }));
  people.forEach((p) => (c[`p:${p.id}`] = { type: "person", title: p.name, excerpt: `${p.role} · ${units.find((u) => u.id === p.unitId)?.name} · extensão ${p.extension}`, href: `/pessoas/${p.slug}`, scopes: ["nacional"] }));
  return c;
}

type Piece = string | [string];
type Intent = { re: RegExp; build: (c: Record<string, Cand>, s: Session) => { pieces: Piece[]; follow: string[] } | null };

const intents: Intent[] = [
  { re: /f[eé]rias/, build: () => ({ pieces: ["Para pedir férias, abra Serviços e escolha Pedido de férias.", ["s:ferias"], " O pedido é decidido primeiro pela chefia directa e depois pelos Recursos Humanos, com resposta média em 2 dias.", ["s:ferias"], " Desde Outubro, os pedidos em papel só são aceites até ao final do ano.", ["n:n16"]], follow: ["Como marco uma ausência com substituto?", "Quem decide o meu pedido se a chefia estiver ausente?"] }) },
  { re: /hor[aá]rio|festiv|natal|fim de ano/, build: () => ({ pieces: ["Entre 24 de Dezembro e 2 de Janeiro as secretarias funcionam das 8h às 13h, salvo nos feriados nacionais.", ["a:circular-12-2026"], " Os actos urgentes são assegurados pelo serviço de turno, e cada comarca publica a sua escala até 15 de Dezembro.", ["a:circular-12-2026"]], follow: ["Já confirmei a Circular n.º 12/2026?", "Onde está o modelo da escala de turno?"] }) },
  { re: /arquivo|processos findos/, build: () => ({ pieces: ["Os processos findos são remetidos ao arquivo por lotes mensais, com a respectiva guia.", ["a:circular-13-2026"], " O guia de arquivo digital explica como organizar os processos electrónicos concluídos.", ["n:n9"]], follow: ["Onde está o guia de arquivo digital?"] }) },
  { re: /pr[oó]xim|eventos|agenda|forma[cç][aã]o|amanh/, build: (c) => {
    const ev = events.filter((e) => c[`e:${e.id}`] && e.startsAt >= "2026-11-10").sort((a, b) => a.startsAt.localeCompare(b.startsAt)).slice(0, 3);
    if (!ev.length) return null;
    const pieces: Piece[] = ["Os próximos eventos para a sua unidade são:"];
    ev.forEach((e, i) => pieces.push(`${i ? ";" : ""} ${e.title}, a ${dayOfMonth(e.startsAt)} de ${monthLong(e.startsAt)} às ${timeOf(e.startsAt)}`, [`e:${e.id}`]));
    pieces.push(". Pode inscrever-se na página de cada evento.");
    return { pieces, follow: ["Ainda há lugares nas Jornadas de Direito Penal?", "Como adiciono os eventos ao meu calendário?"] };
  } },
  { re: /lei org[aâ]nica|compet[eê]ncia|c[oó]digo/, build: () => ({ pieces: ["A Lei Orgânica dos Tribunais da Jurisdição Comum está na colecção Legislação, em PDF, actualizada a 12 de Outubro de 2026.", ["d:lei-organica-jc"], " A colecção inclui também a Lei Orgânica dos Tribunais da Relação.", ["d:lei-organica-relacao"]], follow: ["Onde encontro o Código de Processo Penal?", "Como guardo um documento nos favoritos?"] }) },
  { re: /tramita|juris/, build: () => ({ pieces: ["A tramitação electrónica chegou a mais seis comarcas, com acompanhamento local nas primeiras quatro semanas.", ["n:n5"], " Há uma sessão prática online a 12 de Novembro, às 14h.", ["e:e1"]], follow: ["Como me inscrevo na sessão Justiça digital?"] }) },
  { re: /intranet|confirmar.*aviso|aviso obrigat/, build: () => ({ pieces: ["Os avisos obrigatórios têm de ser confirmados por cada pessoa com «Tomei conhecimento». Se o texto mudar, a confirmação é pedida outra vez.", ["a:nova-intranet"]], follow: ["Que avisos tenho por confirmar?"] }) },
];

export function ask(s: Session, question: string): Answer {
  if (s.failing) throw new Error("falha simulada");
  const q = normalise(question);
  const c = catalogue(s);
  for (const it of intents) {
    if (!it.re.test(q)) continue;
    const built = it.build(c, s);
    if (!built) continue;
    const keys = built.pieces.filter((p) => Array.isArray(p)).map((p) => (p as [string])[0]);
    if (keys.some((k) => !c[k])) continue;
    const order = Array.from(new Set(keys));
    const sources = order.map((k, i) => { const { scopes: _s, ...rest } = c[k]; void _s; return { ...rest, n: i + 1 }; });
    const segments: Segment[] = built.pieces.map((p) => (Array.isArray(p) ? { cite: order.indexOf(p[0]) + 1 } : { text: p }));
    return { found: true, segments, sources, followUps: built.follow };
  }
  const hits = searchAll(s, question, {}).filter((h) => h.group !== "pages").slice(0, 3);
  if (!hits.length) return { found: false, segments: [], sources: [], followUps: ["Como peço férias?", "Quais são os próximos eventos?"] };
  const typeOf = { people: "person", services: "service", documents: "document", news: "news", events: "event", media: "news", pages: "news" } as const;
  const sources: Source[] = hits.map((h, i) => ({ n: i + 1, type: typeOf[h.group], title: h.title.map((p) => p.text).join(""), excerpt: h.snippet?.map((p) => p.text).join("") ?? h.detail, href: h.href }));
  const segments: Segment[] = [{ text: "Não encontrei uma resposta directa, mas estes conteúdos tratam do assunto: " }, ...sources.flatMap((x, i) => [{ text: `${i ? "; " : ""}${x.title}` }, { cite: x.n }] as Segment[]), { text: "." }];
  return { found: true, segments, sources, followUps: [] };
}
