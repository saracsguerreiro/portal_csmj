import { asset } from "@/lib/assets";
import { events } from "./events";
import { news } from "./news";
import { notices } from "./notices";
import type { ContentMeta, EventItem, NewsItem, Notice } from "./types";

/** Cópias das sementes, feitas antes de qualquer alteração em tempo real. */
export const SEED_NEWS: NewsItem[] = structuredClone(news);
export const SEED_EVENTS: EventItem[] = structuredClone(events);
export const SEED_NOTICES: Notice[] = structuredClone(notices);
export const STATIC_NEWS_SLUGS = new Set(SEED_NEWS.map((n) => n.slug));
export const STATIC_EVENT_SLUGS = new Set(SEED_EVENTS.map((e) => e.slug));
export const STATIC_NOTICE_IDS = new Set(SEED_NOTICES.map((n) => n.id));

export type AdminNews = NewsItem & { meta: ContentMeta };
export type AdminEvent = EventItem & { meta: ContentMeta; registrants: string[]; waitlist: string[]; pendingRegs: string[]; reminder: boolean };
export type AdminNotice = Notice & { meta: ContentMeta; confirmedBy: { personId: string; at: string }[]; requireConfirm: boolean; blockPortal: boolean; reminderDays: number; escalateDays: number; endsAt?: string; closed?: boolean };

const meta = (authorId: string, at: string, status: ContentMeta["status"] = "publicado", extra: Partial<ContentMeta> = {}): ContentMeta => ({
  status, authorId, langs: ["PT"], featured: false, comments: true, aiAssisted: false, updatedAt: at,
  history: [{ at, byId: authorId, label: status === "publicado" ? "Publicação" : "Gravação", title: "" }], ...extra,
});

const d = (s: string) => `${s}+01:00`;
const draft = (id: string, slug: string, title: string, summary: string, at: string, status: ContentMeta["status"], cover: string, scopes: string[], tags: string[], html: string, extra: Partial<ContentMeta> = {}): AdminNews => ({
  id, slug, title, summary, publishedAt: d(at), cover: asset(cover), coverAlt: "", tags, authorId: "filomena-tembo", scopes, html, meta: meta("filomena-tembo", d(at), status, extra),
});

export function seedAdminNews(): AdminNews[] {
  const published = SEED_NEWS.map((n) => ({ ...structuredClone(n), meta: meta(n.authorId, n.publishedAt, "publicado", { featured: n.id === "n1", lockedBy: n.id === "n3" ? "luisa-chilombo" : undefined, langs: n.id === "n1" ? ["PT", "EN"] : ["PT"] }) }));
  return [
    draft("d1", "visita-comarca-sumbe", "Visita à Comarca do Sumbe", "A Secretária-Geral visitou as novas instalações da comarca e reuniu com os oficiais de justiça.", "2026-11-08T17:20:00", "rascunho", "/covers/colunata.svg", ["rel-benguela"], ["Institucional"], "<p>A Secretária-Geral visitou a Comarca do Sumbe para acompanhar a instalação das novas secções.</p>"),
    draft("d2", "jornadas-o-que-esperar", "Jornadas de Direito Penal: o que esperar", "Programa, oradores e informações práticas para quem vai participar.", "2026-11-07T10:00:00", "rascunho", "/covers/livros.svg", ["nacional"], ["Formação"], "<p>As Jornadas decorrem a 13 de Novembro no Auditório.</p>"),
    draft("d3", "sala-audiencias-benguela", "Nova sala de audiências em Benguela", "A sala tem videoconferência e lugar para 40 pessoas.", "2026-11-09T09:10:00", "espera", "/covers/balcao.svg", ["rel-benguela"], ["Atendimento"], "<p>A nova sala de audiências da Comarca de Benguela já está em funcionamento.</p><h2>Equipamento</h2><ul><li>Videoconferência</li><li>Gravação de audiências</li></ul>"),
    draft("d4", "balanco-atendimento-outubro", "Balanço do atendimento em Outubro", "Mais de 6 000 atendimentos nas comarcas da Relação de Luanda.", "2026-11-09T11:30:00", "espera", "/covers/rede.svg", ["rel-luanda"], ["Atendimento"], "<p>Durante o mês de Outubro, as comarcas registaram mais de 6 000 atendimentos.</p>"),
    draft("d5", "horarios-verao-2025", "Horários de Verão de 2025", "Notícia retirada do portal.", "2025-06-01T09:00:00", "despublicado", "/covers/tramitacao.svg", ["nacional"], ["Institucional"], "<p>Horários de Verão de 2025.</p>"),
    draft("d6", "teste-publicacao", "Teste de publicação", "Movida para a lixeira.", "2026-11-02T09:00:00", "lixeira", "/covers/plenario.svg", ["nacional"], [], "<p>Teste.</p>"),
    ...published,
  ];
}

export function seedAdminEvents(): AdminEvent[] {
  const regs: Record<string, Partial<AdminEvent>> = {
    e1: { registrants: ["marta-kiala", "isabel-ngola", "joaquim-mbala", "rui-lumbo", "victor-ngunza"] },
    e2: { registrants: ["teresa-sapalo", "helena-muhongo", "natalia-wanga", "domingos-tchipa"] },
    e6: { registrants: ["teresa-sapalo", "victor-ngunza"], waitlist: ["helena-muhongo", "natalia-wanga"] },
    e7: { pendingRegs: ["isabel-ngola", "albertina-mussungo"] },
  };
  return SEED_EVENTS.map((e) => ({ ...structuredClone(e), meta: meta("andre-kalunga", e.publishedAt), registrants: [], waitlist: [], pendingRegs: [], reminder: true, ...regs[e.id] }));
}

export function seedAdminNotices(): AdminNotice[] {
  const confirmed = ["luisa-chilombo", "andre-kalunga", "filomena-tembo", "carlos-ndongala", "graca-mukuta", "esperanca-nzinga", "marcos-kavungo", "rui-lumbo", "celeste-manuel", "teresa-sapalo", "paulo-cassoma", "helena-muhongo", "bento-quissanga", "natalia-wanga", "rosa-cambuta", "simao-katchiungo", "victor-ngunza", "augusta-ngueve"];
  const list: AdminNotice[] = SEED_NOTICES.map((n) => ({
    ...structuredClone(n), meta: meta("andre-kalunga", n.publishedAt), requireConfirm: n.mandatory, blockPortal: false, reminderDays: 3, escalateDays: 7,
    confirmedBy: n.id === "nova-intranet" ? confirmed.map((p, i) => ({ personId: p, at: d(`2026-11-0${(i % 8) + 1}T10:00:00`) })) : n.id === "circular-12-2026" ? confirmed.slice(0, 9).map((p) => ({ personId: p, at: d("2026-11-05T10:00:00") })) : [],
  }));
  list.unshift({
    id: "circular-14-2026", title: "Inventário anual de bens", number: "Circular n.º 14/2026", kind: "circular", mandatory: false, publishedAt: d("2026-11-12T09:00:00"), version: 1, scopes: ["nacional"],
    body: ["As unidades enviam o inventário anual de bens até 15 de Dezembro, no modelo disponível em Modelos e formulários."],
    meta: meta("andre-kalunga", d("2026-11-08T15:00:00"), "agendado", { scheduledAt: d("2026-11-12T09:00:00") }), requireConfirm: false, blockPortal: false, reminderDays: 3, escalateDays: 7, confirmedBy: [],
  });
  return list;
}
