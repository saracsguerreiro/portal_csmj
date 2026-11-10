import type { Block, NewsItem } from "./types";

const plano: Block[] = [
  { t: "p", text: "O Plenário do Conselho aprovou o plano de formação contínua para 2027. O plano abrange magistrados, oficiais de justiça e funcionários das secretarias, em todas as comarcas." },
  { t: "h2", id: "o-que-muda", text: "O que muda em 2027" },
  { t: "p", text: "Cada pessoa passa a ter um mínimo de 24 horas de formação por ano, contadas para efeitos de avaliação. A proposta foi apresentada por @[Luísa Chilombo](luisa-chilombo) em nome da Secretaria-Geral." },
  { t: "ul", items: ["Módulos presenciais em Luanda e Benguela, nos meses de Março e Setembro.", "Sessões à distância para as comarcas com menos ligações de transporte.", "Registo automático das horas concluídas na ficha de cada pessoa."] },
  { t: "quote", text: "Uma justiça moderna depende de quem nela trabalha todos os dias.", by: "Teresa Sapalo, Juíza Desembargadora" },
  { t: "h2", id: "calendario", text: "Calendário dos módulos" },
  { t: "table", caption: "Módulos previstos por trimestre", head: ["Trimestre", "Tema", "Modalidade", "Horas"], rows: [["Primeiro", "Processo civil", "Presencial", "12"], ["Segundo", "Justiça digital", "Online", "8"], ["Terceiro", "Ética e deontologia", "Híbrido", "6"], ["Quarto", "Gestão de tribunais", "Presencial", "10"]] },
  { t: "callout", title: "Dê a sua opinião", text: "O primeiro trimestre ainda pode mudar. Vote no tema que considera prioritário na enquete abaixo." },
  { t: "live-poll", taskId: "t-enquete" },
  { t: "h2", id: "como-participar", text: "Como participar" },
  { t: "p", text: "As inscrições abrem por módulo na página de eventos. A próxima sessão é já este mês." },
  { t: "live-event", eventId: "e1" },
  { t: "columns", cols: ["Para os magistrados, os módulos contam para a progressão e são marcados em articulação com o juiz presidente de cada comarca.", "Para os oficiais de justiça, a chefia de secção assegura a substituição durante as sessões presenciais."] },
  { t: "details", title: "Quem está dispensado da carga mínima", text: "Estão dispensadas as pessoas em licença prolongada durante mais de seis meses do ano e quem tenha concluído formação equivalente reconhecida pelo Conselho." },
  { t: "img", src: "/album/f2.svg", alt: "Colunata do edifício do Conselho", caption: "Os módulos presenciais de Luanda decorrem no edifício do Conselho." },
  { t: "video", title: "Apresentação do plano de formação", poster: "/covers/plenario.svg", duration: "3:42" },
  { t: "h2", id: "documentos", text: "Documentos e contactos" },
  { t: "file", name: "Plano de formação contínua 2027", format: "PDF", size: "1,2 MB" },
  { t: "live-person", personId: "marcos-kavungo" },
  { t: "live-service", serviceId: "ausencia" },
  { t: "p", text: "Saiba também como correu a [expansão da tramitação electrónica](/comunicacao/noticias/tramitacao-seis-comarcas) e o [encontro de juízes presidentes em Benguela](/comunicacao/noticias/encontro-juizes-benguela)." },
];

const c = {
  ple: ["/covers/plenario.svg", "Hemiciclo de cadeiras visto de cima, com três lugares assinalados a ouro"],
  bal: ["/covers/balcao.svg", "Arcada com cinco balcões de atendimento"],
  col: ["/covers/colunata.svg", "Fachada de tribunal com sete colunas"],
  red: ["/covers/rede.svg", "Rede de tribunais ligados entre si"],
  tra: ["/covers/tramitacao.svg", "Processos a avançar por cinco etapas"],
  liv: ["/covers/livros.svg", "Fileira de livros numa estante"],
};

function item(id: string, slug: string, title: string, summary: string, date: string, cover: string[], scope: string, tags: string[], author: string, paragraphs?: string[]): NewsItem {
  return { id, slug, title, summary, publishedAt: `${date}+01:00`, cover: cover[0], coverAlt: cover[1], tags, authorId: author, scopes: [scope], body: paragraphs?.map((text) => ({ t: "p", text })) };
}

export const news: NewsItem[] = [
  { ...item("n1", "plano-formacao-2027", "Conselho aprova plano de formação contínua para 2027", "O plano cobre magistrados e oficiais de justiça, com módulos presenciais em Luanda e Benguela e sessões à distância para as restantes comarcas.", "2026-11-08T10:30:00", c.ple, "nacional", ["Formação"], "andre-kalunga"), body: plano, caption: "O Plenário do Conselho reunido em sessão ordinária." },
  item("n2", "balcao-atendimento-belas", "Comarca de Belas inaugura novo balcão de atendimento", "O novo balcão concentra a entrega de requerimentos e o pedido de certidões num único ponto.", "2026-11-07T09:00:00", c.bal, "com-belas", ["Atendimento"], "filomena-tembo", ["O novo balcão da Comarca de Belas abriu ao público com quatro postos de atendimento e uma senha única para todos os serviços.", "O juiz presidente, Domingos Tchipa, sublinhou que o tempo médio de espera deverá descer para metade até ao fim do ano."]),
  item("n3", "novos-oficiais-posse", "Novos oficiais de justiça tomam posse", "Os novos oficiais iniciam funções em comarcas das duas Relações depois de concluída a formação inicial.", "2026-11-06T15:00:00", c.col, "nacional", ["Pessoas"], "andre-kalunga", ["Os novos oficiais de justiça tomaram posse numa cerimónia presidida pela Secretária-Geral.", "A colocação nas comarcas teve em conta as necessidades identificadas no último levantamento de pessoal."]),
  item("n4", "encontro-juizes-benguela", "Relação de Benguela realiza encontro de juízes presidentes", "O encontro reuniu os juízes presidentes das comarcas para alinhar critérios de gestão processual.", "2026-11-06T11:00:00", c.red, "rel-benguela", ["Institucional"], "filomena-tembo", ["Os juízes presidentes das comarcas de Benguela e do Sumbe reuniram-se para alinhar critérios de distribuição e de gestão processual.", "As conclusões serão partilhadas com o Conselho até ao final do mês."]),
  item("n5", "tramitacao-seis-comarcas", "Tramitação electrónica chega a mais seis comarcas", "A expansão faz parte do Projecto JURIS 5.0 e prevê acompanhamento local durante as primeiras semanas.", "2026-11-04T08:30:00", c.tra, "nacional", ["JURIS 5.0"], "andre-kalunga", ["A tramitação electrónica de processos passa a estar disponível em mais seis comarcas, no âmbito do Projecto JURIS 5.0.", "Cada comarca conta com uma equipa de acompanhamento durante as primeiras quatro semanas."]),
  item("n6", "semana-atendimento-cidadao", "Semana de atendimento ao cidadão regista 2 400 atendimentos", "As comarcas da Relação de Luanda prolongaram o horário durante a semana de atendimento.", "2026-11-03T16:00:00", c.liv, "rel-luanda", ["Atendimento"], "filomena-tembo", ["Durante cinco dias, as comarcas da Relação de Luanda prolongaram o horário de atendimento até às 18h.", "Os pedidos de certidão foram o motivo mais frequente de deslocação."]),
  item("n7", "calendario-inspeccoes-2027", "Secretaria-Geral publica calendário de inspecções de 2027", "As inspecções ordinárias decorrem entre Fevereiro e Outubro, com aviso às comarcas com 30 dias de antecedência.", "2026-10-30T10:00:00", c.col, "nacional", ["Institucional"], "andre-kalunga", ["O calendário abrange todas as comarcas e distribui as inspecções ordinárias ao longo de nove meses.", "Cada comarca recebe aviso com 30 dias de antecedência."]),
  item("n8", "sumbe-reforca-oficiais", "Comarca do Sumbe reforça equipa de oficiais", "A comarca recebe três novos oficiais de justiça para as secções cível e criminal.", "2026-10-28T09:30:00", c.bal, "com-sumbe", ["Pessoas"], "filomena-tembo", ["Os novos oficiais integram as secções cível e criminal da Comarca do Sumbe.", "O reforço responde ao aumento de processos entrados este ano."]),
  item("n9", "guia-arquivo-digital", "Novo guia de arquivo digital disponível", "O guia explica como organizar e guardar os processos electrónicos concluídos.", "2026-10-26T11:00:00", c.tra, "nacional", ["JURIS 5.0", "Legislação"], "filomena-tembo", ["O guia descreve, passo a passo, como organizar os processos electrónicos concluídos.", "Está disponível na colecção de regulamentos internos."]),
  item("n10", "luanda-alarga-horario", "Comarca de Luanda alarga horário de atendimento", "A secretaria passa a atender até às 16h30 nos dias úteis.", "2026-10-23T14:00:00", c.bal, "com-luanda", ["Atendimento"], "filomena-tembo", ["A secretaria da Comarca de Luanda passa a atender até às 16h30 nos dias úteis.", "A medida resulta da avaliação feita durante o primeiro semestre."]),
  item("n11", "processual-benguela", "Formação em direito processual chega a Benguela", "Duas turmas de oficiais de justiça concluíram o módulo de direito processual.", "2026-10-21T10:00:00", c.liv, "rel-benguela", ["Formação"], "filomena-tembo", ["Duas turmas de oficiais de justiça concluíram o módulo de direito processual em Benguela.", "Novas turmas abrem no início do próximo ano."]),
  item("n12", "sessao-plenaria-outubro", "Conselho reúne em sessão plenária ordinária", "O Plenário analisou o movimento judicial e o relatório de actividades do semestre.", "2026-10-20T17:00:00", c.ple, "nacional", ["Institucional"], "andre-kalunga", ["O Plenário analisou o movimento judicial e aprovou o relatório de actividades do primeiro semestre.", "A próxima sessão ordinária está marcada para Dezembro."]),
  item("n13", "balanco-terceiro-trimestre", "Relação de Luanda apresenta balanço do terceiro trimestre", "O número de processos findos aumentou em comparação com o trimestre anterior.", "2026-10-16T10:00:00", c.red, "rel-luanda", ["Institucional"], "filomena-tembo", ["O balanço mostra um aumento do número de processos findos em todas as comarcas da Relação.", "Os dados detalhados foram enviados aos juízes presidentes."]),
  item("n14", "icolo-equipamento", "Comarca de Icolo e Bengo recebe equipamento informático", "As secções passam a dispor de novos computadores e digitalizadores.", "2026-10-14T09:00:00", c.tra, "com-icolo", ["JURIS 5.0"], "filomena-tembo", ["As secções da comarca passam a dispor de novos computadores e digitalizadores.", "A instalação foi acompanhada pela Direcção de Tecnologias de Informação."]),
  item("n15", "modelo-unico-acta", "Tribunais adoptam modelo único de acta", "O modelo está disponível em Modelos e formulários e aplica-se a partir de Janeiro.", "2026-10-12T15:30:00", c.liv, "nacional", ["Legislação"], "andre-kalunga", ["O novo modelo de acta aplica-se a partir de Janeiro em todas as comarcas.", "O ficheiro está disponível na colecção Modelos e formulários."]),
  item("n16", "procedimentos-ferias", "Direcção de Recursos Humanos actualiza procedimentos de férias", "Os pedidos de férias passam a ser feitos e acompanhados na intranet.", "2026-10-09T10:00:00", c.col, "nacional", ["Pessoas"], "andre-kalunga", ["Os pedidos de férias passam a ser feitos na intranet e decididos primeiro pela chefia directa e depois pelos Recursos Humanos.", "Os pedidos em papel são aceites até ao final do ano."]),
  item("n17", "belas-encontro-advogados", "Comarca de Belas promove encontro com advogados", "O encontro serviu para esclarecer procedimentos da nova secretaria.", "2026-10-07T16:00:00", c.bal, "com-belas", ["Atendimento"], "filomena-tembo", ["A comarca reuniu-se com advogados da região para esclarecer os procedimentos da nova secretaria.", "Foi criado um contacto próprio para as questões mais frequentes."]),
  item("n18", "etica-plenario", "Ética judicial em debate no Plenário", "Os vogais discutiram a actualização do código de conduta.", "2026-10-05T11:00:00", c.ple, "nacional", ["Formação", "Institucional"], "andre-kalunga", ["Os vogais do Conselho discutiram a actualização do código de conduta dos magistrados.", "Uma proposta de texto será apresentada na próxima sessão."]),
  item("n19", "balcoes-moveis", "Justiça de proximidade: balcões móveis em teste", "Dois balcões móveis percorrem municípios afastados das sedes de comarca.", "2026-10-02T09:00:00", c.red, "rel-luanda", ["Atendimento"], "filomena-tembo", ["Dois balcões móveis percorrem, durante três meses, municípios afastados das sedes de comarca.", "O resultado do teste decidirá o alargamento a outras Relações."]),
];
