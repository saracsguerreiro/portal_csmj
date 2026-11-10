import type { Poll, ClimateTheme, Suggestion } from "./types";

/** Responsável de cada unidade (organograma e órgãos). */
export const heads: Record<string, string> = {
  nacional: "augusta-ngueve", plenario: "augusta-ngueve", secretaria: "luisa-chilombo", drh: "esperanca-nzinga", dti: "celeste-manuel",
  "rel-luanda": "teresa-sapalo", "com-belas": "domingos-tchipa", "com-icolo": "victor-ngunza", "com-luanda": "rosa-cambuta",
  "rel-benguela": "paulo-cassoma", "com-benguela": "natalia-wanga", "com-sumbe": "helena-muhongo",
};

export const unitInfo: Record<string, { address: string; phone: string; email: string }> = {
  nacional: { address: "Luanda", phone: "+244 222 000 000", email: "secretariado@exemplo.ao" },
  "rel-luanda": { address: "Luanda", phone: "+244 222 100 000", email: "relacao.luanda@exemplo.ao" },
  "com-luanda": { address: "Luanda", phone: "+244 222 110 000", email: "comarca.luanda@exemplo.ao" },
  "com-belas": { address: "Belas, Luanda", phone: "+244 222 410 000", email: "comarca.belas@exemplo.ao" },
  "com-icolo": { address: "Icolo e Bengo", phone: "+244 222 420 000", email: "comarca.icolo@exemplo.ao" },
  "rel-benguela": { address: "Benguela", phone: "+244 272 100 000", email: "relacao.benguela@exemplo.ao" },
  "com-benguela": { address: "Benguela", phone: "+244 272 110 000", email: "comarca.benguela@exemplo.ao" },
  "com-sumbe": { address: "Sumbe, Cuanza Sul", phone: "+244 236 100 000", email: "comarca.sumbe@exemplo.ao" },
};

export const polls: Poll[] = [
  { id: "p1", taskId: "t-enquete", question: "Que formação gostaria de ter no primeiro trimestre de 2027?", description: "O resultado ajuda a definir o primeiro módulo do plano de formação.", closesAt: "2026-11-28T23:59:00+01:00", anonymous: true, options: ["Processo civil", "Justiça digital", "Ética e deontologia", "Gestão de tribunais"], results: [41, 87, 33, 52], scopes: ["nacional"] },
  { id: "p2", question: "Que horário prefere para as sessões de formação online?", description: "As sessões têm cerca de duas horas.", closesAt: "2026-11-20T23:59:00+01:00", anonymous: false, options: ["Manhã, das 9h às 11h", "Início da tarde, das 14h às 16h", "Fim da tarde, das 16h às 18h"], results: [30, 58, 12], live: true, scopes: ["nacional"] },
  { id: "p3", question: "O novo balcão de atendimento facilitou o seu trabalho?", description: "Só para quem trabalha na Comarca de Belas.", closesAt: "2026-11-30T23:59:00+01:00", anonymous: true, options: ["Sim, bastante", "Um pouco", "Ainda não notei diferença"], results: [9, 6, 3], scopes: ["com-belas"] },
  { id: "p4", question: "Que tema deve ter a próxima newsletter especial?", description: "Votação encerrada.", closesAt: "2026-10-15T23:59:00+01:00", anonymous: true, options: ["Justiça digital", "Formação", "Pessoas e carreiras"], results: [124, 98, 156], closed: true, scopes: ["nacional"] },
  { id: "p5", question: "Prefere receber a newsletter à sexta ou à segunda-feira?", description: "Votação encerrada.", closesAt: "2026-09-30T23:59:00+01:00", anonymous: true, options: ["Sexta-feira", "Segunda-feira"], results: [201, 143], closed: true, scopes: ["nacional"] },
];

export const climate = {
  id: "2026", title: "Pesquisa de clima 2026", objective: "Perceber como as pessoas se sentem no trabalho e o que a instituição deve melhorar em 2027.",
  minutes: 8, closesAt: "2026-11-30T23:59:00+01:00", resultsOn: "Fevereiro de 2027",
  themes: [
    { id: "trabalho", title: "O seu trabalho", questions: [
      { id: "q1", text: "Tenho os meios necessários para fazer bem o meu trabalho.", kind: "scale5" },
      { id: "q2", text: "Sei o que se espera de mim.", kind: "scale5" },
      { id: "q3", text: "Que meios lhe fazem mais falta?", kind: "multi", options: ["Equipamento informático", "Espaço de trabalho", "Formação", "Pessoas na equipa"] },
    ] },
    { id: "chefia", title: "A sua chefia", questions: [
      { id: "q4", text: "A minha chefia dá-me retorno sobre o meu trabalho.", kind: "scale5" },
      { id: "q5", text: "Com que frequência tem reuniões de equipa?", kind: "single", options: ["Semanalmente", "Mensalmente", "Raramente", "Nunca"] },
    ] },
    { id: "instituicao", title: "A instituição", questions: [
      { id: "q6", text: "De 0 a 10, recomendaria a instituição como local de trabalho?", kind: "scale10" },
      { id: "q7", text: "O que mudaria primeiro?", kind: "text" },
    ] },
  ] as ClimateTheme[],
  results2025: [
    { theme: "O seu trabalho", national: 3.6, units: [{ name: "Relação de Luanda", value: 3.7, n: 48 }, { name: "Relação de Benguela", value: 3.5, n: 31 }, { name: "Direcção de Tecnologias de Informação", value: null, n: 7 }] },
    { theme: "A sua chefia", national: 3.9, units: [{ name: "Relação de Luanda", value: 4.0, n: 48 }, { name: "Relação de Benguela", value: 3.8, n: 31 }, { name: "Direcção de Tecnologias de Informação", value: null, n: 7 }] },
    { theme: "A instituição", national: 3.4, units: [{ name: "Relação de Luanda", value: 3.3, n: 48 }, { name: "Relação de Benguela", value: 3.6, n: 31 }, { name: "Direcção de Tecnologias de Informação", value: null, n: 7 }] },
  ],
};

export const suggestionThemes = ["Atendimento", "Instalações", "Tecnologia", "Formação", "Comunicação interna", "Outro"];

export const mySuggestionsSeed: Record<string, Suggestion[]> = {
  "marta-kiala": [
    { id: "s1", theme: "Tecnologia", text: "Permitir assinar as actas electronicamente a partir do telemóvel.", status: "Em análise", at: "2026-10-20T10:00:00+01:00", anonymous: false },
    { id: "s2", theme: "Instalações", text: "Colocar sinalização para a nova secretaria na entrada principal.", status: "Respondida", at: "2026-09-12T10:00:00+01:00", answer: "A sinalização foi instalada a 30 de Setembro. Obrigado pela sugestão.", anonymous: false },
  ],
};

export const implementedSuggestions = [
  { title: "Senha única no balcão de atendimento de Belas", detail: "Sugerida por um oficial de justiça da comarca. Em funcionamento desde Novembro." },
  { title: "Newsletter também em versão para telemóvel", detail: "Sugestão anónima. Disponível desde a edição n.º 40." },
  { title: "Reserva de salas na intranet", detail: "Sugerida pela Secretaria-Geral. Substitui os pedidos em papel." },
];
