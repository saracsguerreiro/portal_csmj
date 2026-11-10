import type { NotificationItem } from "./types";

export const notifications: NotificationItem[] = [
  { id: "a1", kind: "approval", text: "Isabel Ngola pediu férias e aguarda a sua decisão", at: "2026-11-09T07:10:00+01:00", href: "/servicos/aprovacoes/r11" },
  { id: "a2", kind: "reply", text: "A sua reserva de sala n.º 7 foi devolvida para correcção", at: "2026-11-09T08:40:00+01:00", href: "/servicos/meus-pedidos/r7" },
  { id: "a3", kind: "notice", text: "Novo aviso por confirmar: Circular n.º 12/2026", at: "2026-11-03T09:00:00+01:00", href: "/comunicacao/avisos/circular-12-2026" },
  { id: "a4", kind: "mention", text: "André Kalunga fez uma menção a si num comentário sobre o plano de formação", at: "2026-11-08T17:05:00+01:00", href: "/comunicacao/noticias/plano-formacao-2027", mention: true },
  { id: "a5", kind: "event", text: "A sessão Justiça digital passou para 12 de Novembro", at: "2026-11-08T12:30:00+01:00", href: "/comunicacao/eventos/justica-digital" },
  { id: "a6", kind: "reminder", text: "As inscrições para as Jornadas de Direito Penal terminam a 11 de Novembro", at: "2026-11-07T11:00:00+01:00", href: "/comunicacao/eventos/jornadas-direito-penal", read: true },
  { id: "a7", kind: "newsletter", text: "A newsletter de Outubro já está disponível", at: "2026-10-30T16:00:00+01:00", href: "/comunicacao/newsletter", read: true },
  { id: "a8", kind: "comment", text: "Filomena Tembo respondeu ao seu comentário", at: "2026-10-29T10:15:00+01:00", href: "/comunicacao/noticias/tramitacao-seis-comarcas", read: true },
];
