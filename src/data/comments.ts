import type { Comment } from "./types";

export const comments: Comment[] = [
  { id: "c1", newsId: "n1", authorId: "joaquim-mbala", text: "As sessões à distância vão ficar gravadas? Na minha secção nem todos podem assistir à mesma hora.", at: "2026-11-08T12:10:00+01:00" },
  { id: "c2", newsId: "n1", authorId: "andre-kalunga", text: "Sim, @[Joaquim Mbala](joaquim-mbala). As gravações ficam disponíveis durante 30 dias em Multimédia.", at: "2026-11-08T17:05:00+01:00", replyTo: "c1" },
  { id: "c3", newsId: "n1", authorId: "natalia-wanga", text: "Boa notícia para as comarcas mais afastadas. Espero que o módulo de gestão de tribunais tenha turma em Benguela.", at: "2026-11-09T08:30:00+01:00" },
  { id: "c4", newsId: "n5", authorId: "victor-ngunza", text: "A equipa de acompanhamento chegou esta semana e tem sido uma grande ajuda.", at: "2026-11-05T10:00:00+01:00" },
];

export const seedReactions: Record<string, { gosto: number; aplauso: number; importante: number }> = {
  n1: { gosto: 34, aplauso: 12, importante: 8 },
  n2: { gosto: 11, aplauso: 6, importante: 1 },
  n5: { gosto: 27, aplauso: 9, importante: 14 },
};
