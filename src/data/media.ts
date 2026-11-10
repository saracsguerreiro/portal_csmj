import { asset } from "@/lib/assets";
import type { Album, Edition, Photo, VideoItem } from "./types";

export const albums: Album[] = [
  { id: "a1", slug: "posse-oficiais-2026", title: "Tomada de posse dos novos oficiais de justiça", happenedAt: "2026-11-06T15:00:00+01:00", description: "Cerimónia de tomada de posse no Auditório do Conselho.", tags: ["Pessoas"], cover: asset("/album/f2.svg"), coverAlt: "Colunata do edifício do Conselho", total: 18, scopes: ["nacional"] },
  { id: "a2", slug: "balcao-belas", title: "Inauguração do balcão de atendimento de Belas", happenedAt: "2026-11-07T09:00:00+01:00", description: "Abertura ao público do novo balcão da Comarca de Belas.", tags: ["Atendimento"], cover: asset("/album/f4.svg"), coverAlt: "Arcada de atendimento", total: 12, scopes: ["com-belas"] },
  { id: "a3", slug: "encontro-benguela", title: "Encontro de juízes presidentes em Benguela", happenedAt: "2026-11-06T11:00:00+01:00", description: "Reunião dos juízes presidentes da Relação de Benguela.", tags: ["Institucional"], cover: asset("/album/f5.svg"), coverAlt: "Hemiciclo", total: 9, scopes: ["rel-benguela"] },
  { id: "a4", slug: "sessao-plenaria-outubro", title: "Sessão plenária de Outubro", happenedAt: "2026-10-20T15:00:00+01:00", description: "Sessão ordinária do Plenário do Conselho.", tags: ["Institucional"], cover: asset("/album/f9.svg"), coverAlt: "Hemiciclo do Plenário", total: 14, scopes: ["nacional"] },
  { id: "a5", slug: "semana-atendimento", title: "Semana de atendimento ao cidadão", happenedAt: "2026-11-03T09:00:00+01:00", description: "Atendimento prolongado nas comarcas da Relação de Luanda.", tags: ["Atendimento"], cover: asset("/album/f12.svg"), coverAlt: "Mesas de atendimento", total: 16, scopes: ["rel-luanda"] },
  { id: "a6", slug: "formacao-2025", title: "Formação de oficiais de justiça 2025", happenedAt: "2025-09-15T09:00:00+01:00", description: "Encerramento do curso de formação inicial.", tags: ["Formação"], cover: asset("/album/f7.svg"), coverAlt: "Sala de formação", total: 11, scopes: ["nacional"] },
];

const sizes: [number, number][] = [[1200, 800], [800, 800], [1280, 720], [900, 1200], [1200, 800], [1000, 750]];
const labels = ["Vista da sala", "Chegada dos participantes", "Sessão de abertura", "Mesa da presidência", "Momento de assinatura", "Fotografia de grupo"];

export type PhotoMeta = { caption?: string; alt?: string; credit?: string; removed?: boolean };
/** Alterações feitas no painel (legendas, ordem, fotografias retiradas ou enviadas). */
export const mediaState: { meta: Record<string, PhotoMeta>; order: Record<string, string[]> } = { meta: {}, order: {} };
export const SEED_ALBUM_IDS = new Set(albums.map((a) => a.id));

export const baseKeys = (album: Album) => (SEED_ALBUM_IDS.has(album.id) ? Array.from({ length: Math.min(album.total, 18) }, (_, k) => `${album.id}:${k + 1}`) : []);

/** Fotografias de um álbum, já com as alterações do painel. As últimas do primeiro álbum vêm sem texto alternativo. */
export function photosOf(album: Album, withRemoved = false): Photo[] {
  const keys = mediaState.order[album.id] ?? baseKeys(album);
  return keys.map((key, k) => {
    const part = key.split(":")[1];
    const uploaded = part.startsWith("u");
    const i = uploaded ? (Number(part.slice(1)) % 18) + 1 : Number(part);
    const [w, h] = sizes[i % 6];
    const caption = uploaded ? "" : `${labels[(i - 1) % labels.length]} · ${album.title}`;
    const seedAlt = uploaded || (album.id === "a1" && i > 12) ? "" : caption;
    const m = mediaState.meta[key] ?? {};
    void k;
    return { key, src: asset(`/album/f${i}.svg`), alt: m.alt ?? seedAlt, caption: m.caption ?? caption, w, h, credit: m.credit ?? "Gabinete de comunicação", removed: !!m.removed };
  }).filter((p) => withRemoved || !p.removed);
}

export const videos: VideoItem[] = [
  { id: "v1", title: "Apresentação do plano de formação", poster: asset("/covers/plenario.svg"), duration: "3:42", publishedAt: "2026-11-08T12:00:00+01:00", tags: ["Formação"], scopes: ["nacional"] },
  { id: "v2", title: "Como funciona a tramitação electrónica", poster: asset("/covers/tramitacao.svg"), duration: "6:15", publishedAt: "2026-11-04T10:00:00+01:00", tags: ["JURIS 5.0"], scopes: ["nacional"] },
  { id: "v3", title: "O novo balcão de atendimento de Belas", poster: asset("/covers/balcao.svg"), duration: "2:08", publishedAt: "2026-11-07T15:00:00+01:00", tags: ["Atendimento"], scopes: ["com-belas"] },
  { id: "v4", title: "Mensagem da Secretária-Geral", poster: asset("/covers/colunata.svg"), duration: "1:54", publishedAt: "2026-10-30T15:00:00+01:00", tags: ["Institucional"], scopes: ["nacional"] },
];

const n = "nacional";

export const editions: Edition[] = [
  { id: "ed-44", number: 44, sentAt: "2026-11-06T16:00:00+01:00", intro: "Esta semana destacamos o plano de formação, a posse dos novos oficiais e as datas a reter até ao fim do mês.", sections: [
    { title: "Em destaque", items: [{ title: "Conselho aprova plano de formação contínua para 2027", href: "/comunicacao/noticias/plano-formacao-2027", scopes: [n] }, { title: "Novos oficiais de justiça tomam posse", href: "/comunicacao/noticias/novos-oficiais-posse", scopes: [n] }] },
    { title: "Na sua zona", items: [{ title: "Comarca de Belas inaugura novo balcão de atendimento", href: "/comunicacao/noticias/balcao-atendimento-belas", scopes: ["com-belas"] }, { title: "Relação de Benguela realiza encontro de juízes presidentes", href: "/comunicacao/noticias/encontro-juizes-benguela", scopes: ["rel-benguela"] }] },
    { title: "Agenda", items: [{ title: "Justiça digital: tramitação electrónica de processos", href: "/comunicacao/eventos/justica-digital", scopes: [n] }, { title: "Jornadas de Direito Penal e Processual Penal", href: "/comunicacao/eventos/jornadas-direito-penal", scopes: [n] }] },
  ]},
  { id: "ed-43", number: 43, sentAt: "2026-10-30T16:00:00+01:00", intro: "Calendário de inspecções, novo guia de arquivo digital e reforço de equipas.", sections: [
    { title: "Em destaque", items: [{ title: "Secretaria-Geral publica calendário de inspecções de 2027", href: "/comunicacao/noticias/calendario-inspeccoes-2027", scopes: [n] }, { title: "Novo guia de arquivo digital disponível", href: "/comunicacao/noticias/guia-arquivo-digital", scopes: [n] }] },
  ]},
  { id: "ed-42", number: 42, sentAt: "2026-10-23T16:00:00+01:00", intro: "Sessão plenária de Outubro e alargamento do atendimento em Luanda.", sections: [
    { title: "Em destaque", items: [{ title: "Conselho reúne em sessão plenária ordinária", href: "/comunicacao/noticias/sessao-plenaria-outubro", scopes: [n] }, { title: "Comarca de Luanda alarga horário de atendimento", href: "/comunicacao/noticias/luanda-alarga-horario", scopes: ["com-luanda"] }] },
  ]},
  { id: "ed-41", number: 41, sentAt: "2026-10-16T16:00:00+01:00", intro: "Balanço do terceiro trimestre e modelo único de acta.", sections: [
    { title: "Em destaque", items: [{ title: "Tribunais adoptam modelo único de acta", href: "/comunicacao/noticias/modelo-unico-acta", scopes: [n] }] },
  ]},
  { id: "ed-36", number: 36, sentAt: "2026-09-11T16:00:00+01:00", intro: "Regresso às actividades e novas datas de formação.", sections: [{ title: "Em destaque", items: [{ title: "Ética judicial em debate no Plenário", href: "/comunicacao/noticias/etica-plenario", scopes: [n] }] }] },
];
