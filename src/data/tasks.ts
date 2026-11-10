import type { Task } from "./types";

const everyone = ["*"];
const pollOptions = ["Processo civil", "Justiça digital", "Ética e deontologia", "Gestão de tribunais"];

/** Fila "Precisa de si". Os avisos obrigatórios têm a faixa própria e não se repetem aqui. */
export const tasks: Task[] = [
  { id: "t-ferias-isabel", type: "approval", assignees: ["marta-kiala"], title: "Pedido de férias de Isabel Ngola", detail: "12 a 16 de Dezembro · 5 dias", since: "2026-11-09T07:10:00+01:00", href: "/servicos/aprovacoes/decidir?id=r11", action: "approve", requestId: "r11", scopes: ["com-belas"] },
  { id: "t-sala-devolvida", type: "returned", assignees: ["marta-kiala"], title: "Reserva de sala n.º 7 devolvida para correcção", detail: "Falta indicar o número de participantes", since: "2026-11-09T08:40:00+01:00", href: "/servicos/meus-pedidos?pedido=r7", action: "link", actionLabel: "Corrigir", requestId: "r7", scopes: ["com-belas"] },
  { id: "t-acesso-joaquim", type: "approval", assignees: ["celeste-manuel"], title: "Acesso a sistema para Joaquim Mbala", detail: "Tramitação electrónica · Comarca de Luanda", since: "2026-11-08T16:20:00+01:00", href: "/servicos/aprovacoes/decidir?id=r21", action: "approve", requestId: "r21", scopes: ["nacional"] },
  { id: "t-enquete", type: "poll", assignees: everyone, title: "Que formação gostaria de ter no primeiro trimestre de 2027?", detail: "Vota-se até 28 de Novembro · Anónima", since: "2026-11-02T09:00:00+01:00", href: "/participar/enquetes", action: "vote", options: pollOptions, scopes: ["nacional"] },
  { id: "t-evento", type: "event", assignees: everyone, title: "Jornadas de Direito Penal e Processual Penal", detail: "Inscrições até 11 de Novembro · 12 lugares livres", since: "2026-11-07T11:00:00+01:00", href: "/comunicacao/eventos/jornadas-direito-penal", action: "going", actionLabel: "Vou", scopes: ["nacional"] },
  { id: "t-clima", type: "climate", assignees: ["isabel-ngola", "filomena-tembo"], title: "Pesquisa de clima 2026", detail: "Cerca de 8 minutos · resposta anónima", since: "2026-11-01T09:00:00+01:00", href: "/participar/clima/2026", action: "link", actionLabel: "Responder", scopes: ["nacional"] },
];
