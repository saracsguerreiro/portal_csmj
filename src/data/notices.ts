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
];
