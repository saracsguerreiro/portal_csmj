import type { Notice } from "./types";

export const notices: Notice[] = [
  {
    id: "circular-12-2026", title: "Horário de funcionamento no período festivo", number: "Circular n.º 12/2026", kind: "circular", mandatory: true, publishedAt: "2026-11-03T09:00:00+01:00", version: 1, attachments: [{ name: "Modelo de escala de turno", format: "DOCX", size: "36 KB" }], scopes: ["nacional"],
    body: [
      "Entre 24 de Dezembro e 2 de Janeiro, as secretarias judiciais funcionam em horário reduzido, das 8h às 13h, salvo nos dias de feriado nacional.",
      "Os actos urgentes continuam assegurados pelo serviço de turno. Cada comarca publica a sua escala até 15 de Dezembro.",
      "As chefias confirmam a escala junto da Secretaria-Geral e informam as equipas por esta intranet.",
    ],
  },
  {
    id: "nova-intranet", title: "Utilização da nova intranet", kind: "aviso", mandatory: true, publishedAt: "2026-10-28T09:00:00+01:00", version: 2, updatedAt: "2026-11-02T09:00:00+01:00", changed: [1], attachments: [{ name: "Guia rápido da intranet", format: "PDF", size: "420 KB" }], scopes: ["nacional"],
    body: [
      "A intranet passa a ser o canal oficial para avisos, circulares e pedidos internos em todas as unidades.",
      "Os avisos obrigatórios têm de ser confirmados por cada pessoa. Se o texto mudar, a confirmação é pedida outra vez.",
      "Quem precisar de ajuda pode contactar a Direcção de Tecnologias de Informação.",
    ],
  },
  {
    id: "circular-13-2026", title: "Procedimentos de arquivo", number: "Circular n.º 13/2026", kind: "circular", mandatory: false, publishedAt: "2026-11-05T09:00:00+01:00", version: 1, scopes: ["rel-luanda"],
    body: ["Os processos findos são remetidos ao arquivo por lotes mensais, acompanhados da respectiva guia."],
  },
  {
    id: "aviso-parque-belas", title: "Obras no parque de estacionamento", kind: "aviso", mandatory: false, publishedAt: "2026-10-22T09:00:00+01:00", version: 1, scopes: ["com-belas"],
    body: ["Entre 2 e 20 de Novembro o parque da Comarca de Belas funciona com metade dos lugares. Os lugares reservados mantêm-se."],
  },
  {
    id: "circular-11-2026", title: "Prazos de entrega da estatística trimestral", number: "Circular n.º 11/2026", kind: "circular", mandatory: false, publishedAt: "2026-10-02T09:00:00+01:00", version: 1, scopes: ["nacional"],
    body: ["As comarcas entregam a estatística do quarto trimestre até 15 de Janeiro, através do formulário disponível em Modelos e formulários."],
  },
  {
    id: "circular-07-2025", title: "Uso de assinatura electrónica nos actos internos", number: "Circular n.º 7/2025", kind: "circular", mandatory: false, publishedAt: "2025-06-12T09:00:00+01:00", version: 1, scopes: ["nacional"],
    body: ["Os actos internos da Secretaria-Geral passam a poder ser assinados electronicamente, nos termos do Regulamento interno."],
  },
  {
    id: "aviso-manutencao-juris", title: "Manutenção programada do sistema JURIS", kind: "aviso", mandatory: false, publishedAt: "2026-11-06T16:00:00+01:00", version: 1, scopes: ["nacional"],
    body: ["No sábado, 14 de Novembro, entre as 8h e as 14h, o sistema JURIS fica indisponível para actualização.", "Os actos urgentes durante esse período seguem o procedimento em papel previsto no Regulamento interno."],
  },
  {
    id: "aviso-vacinacao", title: "Campanha de vacinação para funcionários", kind: "aviso", mandatory: false, publishedAt: "2026-10-15T09:00:00+01:00", version: 1, scopes: ["rel-luanda"],
    body: ["A campanha decorre de 20 a 30 de Outubro no posto médico do Tribunal da Relação de Luanda, das 9h às 15h. A inscrição é feita na secretaria de cada comarca."],
  },
  {
    id: "circular-10-2026", title: "Calendário das férias judiciais de 2027", number: "Circular n.º 10/2026", kind: "circular", mandatory: false, publishedAt: "2026-09-25T09:00:00+01:00", version: 1, scopes: ["nacional"],
    attachments: [{ name: "Calendário das férias judiciais 2027", format: "PDF", size: "180 KB" }],
    body: ["As férias judiciais de 2027 decorrem de 22 de Dezembro a 3 de Janeiro, na Páscoa e de 16 de Julho a 31 de Agosto.", "Os juízes presidentes aprovam os mapas de turno até 30 dias antes de cada período."],
  },
  {
    id: "circular-09-2026", title: "Uniformização dos modelos de citação e notificação", number: "Circular n.º 9/2026", kind: "circular", mandatory: false, publishedAt: "2026-09-10T09:00:00+01:00", version: 1, scopes: ["nacional"],
    attachments: [{ name: "Modelos de citação", format: "DOCX", size: "64 KB" }, { name: "Modelos de notificação", format: "DOCX", size: "58 KB" }],
    body: ["A partir de 1 de Outubro, as secretarias usam apenas os modelos de citação e notificação publicados em Modelos e formulários.", "Os modelos antigos deixam de ser aceites nos processos electrónicos."],
  },
  {
    id: "circular-08-2026", title: "Regras de acesso ao edifício do Conselho", number: "Circular n.º 8/2026", kind: "circular", mandatory: false, publishedAt: "2026-08-20T09:00:00+01:00", version: 1, scopes: ["secretaria"],
    body: ["O acesso ao edifício passa a ser feito com o cartão de identificação, das 7h30 às 19h. Fora deste horário é necessária autorização da Secretaria-Geral.", "Os visitantes são registados na recepção e acompanhados durante a visita."],
  },
  {
    id: "circular-06-2026", title: "Recolha de dados para o relatório anual", number: "Circular n.º 6/2026", kind: "circular", mandatory: false, publishedAt: "2026-06-15T09:00:00+01:00", version: 1, scopes: ["nacional"],
    body: ["Cada comarca envia até 31 de Julho os dados de movimento processual e de pessoal, no formulário do relatório anual.", "A Direcção de Tecnologias de Informação disponibiliza apoio no preenchimento."],
  },
  {
    id: "circular-05-2026", title: "Normas de utilização das viaturas de serviço", number: "Circular n.º 5/2026", kind: "circular", mandatory: false, publishedAt: "2026-05-08T09:00:00+01:00", version: 1, scopes: ["nacional"],
    attachments: [{ name: "Normas de utilização de viaturas", format: "PDF", size: "240 KB" }],
    body: ["As viaturas de serviço são pedidas pela intranet com pelo menos dois dias úteis de antecedência.", "O condutor regista os quilómetros à saída e à chegada e comunica qualquer avaria no próprio dia."],
  },
  {
    id: "circular-04-2026", title: "Procedimento de reclamação de vencimentos", number: "Circular n.º 4/2026", kind: "circular", mandatory: false, publishedAt: "2026-04-02T09:00:00+01:00", version: 1, scopes: ["nacional"],
    body: ["As reclamações sobre vencimentos são apresentadas à Direcção de Recursos Humanos até ao dia 10 do mês seguinte, pelo serviço «Apoio de recursos humanos»."],
  },
  {
    id: "circular-12-2025", title: "Encerramento do ano judicial de 2025", number: "Circular n.º 12/2025", kind: "circular", mandatory: false, publishedAt: "2025-12-05T09:00:00+01:00", version: 1, scopes: ["nacional"],
    body: ["A sessão de encerramento do ano judicial realiza-se a 18 de Dezembro, no Auditório do Conselho. Os juízes presidentes confirmam a presença até 10 de Dezembro."],
  },
];
