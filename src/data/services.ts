import type { Field, RequestItem, ServiceItem, StepDef } from "./types";

const hr: StepDef = { label: "Recursos Humanos", by: "person", personId: "esperanca-nzinga", days: 2 };
const boss: StepDef = { label: "Chefia directa", by: "superior", days: 2 };
const obs: Field = { id: "obs", label: "Observações", type: "textarea", hint: "Opcional. Visível a quem decide." };

export const services: ServiceItem[] = [
  { id: "ferias", slug: "ferias", name: "Pedido de férias", description: "Peça dias de férias e acompanhe a decisão.", category: "Recursos humanos", decider: "Chefia directa e Recursos Humanos", avgDays: 2, icon: "Palmtree", steps: [boss, hr], fields: [
    { id: "periodo", label: "Período", type: "daterange", required: true, hint: "O fim tem de ser depois do início." },
    { id: "tipo", label: "Tipo de férias", type: "radio", required: true, options: ["Férias anuais", "Férias antecipadas"] },
    { id: "substituto", label: "Quem o substitui", type: "person", hint: "Recebe os seus pedidos de decisão durante a ausência." },
    obs,
  ] },
  { id: "ausencia", slug: "ausencia-justificada", name: "Ausência justificada", description: "Justifique uma falta com o respectivo comprovativo.", category: "Recursos humanos", decider: "Chefia directa e Recursos Humanos", avgDays: 2, icon: "CalendarX", steps: [boss, hr], fields: [
    { id: "data", label: "Data da falta", type: "date", required: true },
    { id: "motivo", label: "Motivo", type: "select", required: true, options: ["Doença", "Assistência a familiar", "Consulta médica", "Outro"] },
    { id: "comprovativo", label: "Comprovativo", type: "file", required: true, section: "anexos" },
    obs,
  ] },
  { id: "declaracao", slug: "declaracao-servico", name: "Declaração de serviço", description: "Peça uma declaração para fins oficiais.", category: "Recursos humanos", decider: "Recursos Humanos", avgDays: 1, icon: "FileBadge", steps: [hr], fields: [
    { id: "fim", label: "Para que fim", type: "text", required: true, hint: "Por exemplo: banco, embaixada, escola." },
    { id: "copias", label: "Número de cópias", type: "number", required: true, min: 1, max: 5 },
  ] },
  { id: "sala", slug: "reserva-sala", name: "Reserva de sala", description: "Veja a disponibilidade e reserve uma sala.", category: "Logística", decider: "Secretaria da unidade", avgDays: 1, icon: "DoorOpen", steps: [{ label: "Secretaria da unidade", by: "person", personId: "isabel-ngola", days: 1 }], fields: [] },
  { id: "material", slug: "material", name: "Pedido de material", description: "Requisite material de escritório e equipamento.", category: "Logística", decider: "Património", avgDays: 3, icon: "Package", steps: [{ label: "Património", by: "person", personId: "simao-katchiungo", days: 3 }], fields: [
    { id: "artigos", label: "Artigos", type: "checks", required: true, options: ["Papel A4", "Tinteiros e toner", "Pastas de arquivo", "Material de escrita", "Agrafadores e agrafos"] },
    { id: "quantidade", label: "Quantidade aproximada", type: "text", required: true, hint: "Por exemplo: 5 resmas de papel, 2 toners." },
    { id: "unidade", label: "Entregar na unidade", type: "unit", required: true },
    { id: "urgente", label: "É urgente?", type: "yesno", required: true },
    { id: "data", label: "Precisa até", type: "date" },
    { id: "justificacao", label: "Justificação", type: "textarea", required: true },
    { id: "orcamento", label: "Orçamento ou referência", type: "file", section: "anexos" },
  ] },
  { id: "viatura", slug: "viatura", name: "Pedido de viatura", description: "Peça transporte para deslocações de serviço.", category: "Logística", decider: "Chefia directa e Juiz Presidente", avgDays: 2, icon: "Car", steps: [boss, { label: "Juiz Presidente", by: "person", personId: "domingos-tchipa", days: 1 }], fields: [
    { id: "data", label: "Data da deslocação", type: "date", required: true },
    { id: "destino", label: "Destino", type: "text", required: true },
    { id: "pessoas", label: "Número de pessoas", type: "number", required: true, min: 1, max: 8 },
    obs,
  ] },
  { id: "apoio", slug: "apoio-informatico", name: "Apoio informático", description: "Comunique um problema com equipamento ou sistema.", category: "Tecnologia", decider: "Tecnologias de Informação", avgDays: 1, icon: "LifeBuoy", steps: [{ label: "Tecnologias de Informação", by: "person", personId: "rui-lumbo", days: 1 }], fields: [
    { id: "assunto", label: "O que está a acontecer", type: "text", required: true },
    { id: "equipamento", label: "Equipamento ou sistema", type: "select", required: true, options: ["Computador", "Impressora", "Tramitação electrónica", "Email", "Outro"] },
    { id: "detalhe", label: "Descrição", type: "textarea", required: true, hint: "Diga o que fez antes de o problema aparecer." },
    { id: "captura", label: "Captura de ecrã", type: "file", section: "anexos" },
  ] },
  { id: "acesso", slug: "acesso-sistema", name: "Acesso a sistema", description: "Peça acesso a um sistema JURIS.", category: "Tecnologia", decider: "Chefia directa e Tecnologias de Informação", avgDays: 2, icon: "KeyRound", steps: [boss, { label: "Tecnologias de Informação", by: "person", personId: "celeste-manuel", days: 2 }], fields: [
    { id: "sistema", label: "Sistema", type: "select", required: true, options: ["Tramitação electrónica", "Gestão de processos", "Estatística judicial"] },
    { id: "perfil", label: "Tipo de acesso", type: "radio", required: true, options: ["Consulta", "Edição"] },
    obs,
  ] },
  { id: "sugestao", slug: "sugestao", name: "Sugestão", description: "Proponha uma melhoria à instituição.", category: "Institucional", decider: "Secretaria-Geral", avgDays: 5, icon: "Lightbulb", steps: [{ label: "Secretaria-Geral", by: "person", personId: "luisa-chilombo", days: 5 }], fields: [
    { id: "tema", label: "Tema", type: "select", required: true, options: ["Atendimento", "Instalações", "Tecnologia", "Formação", "Outro"] },
    { id: "texto", label: "A sua sugestão", type: "textarea", required: true },
  ] },
];

/** Superior hierárquico: decide os passos "Chefia directa". */
export const superiors: Record<string, string> = {
  "isabel-ngola": "marta-kiala", "marta-kiala": "domingos-tchipa", "joaquim-mbala": "rosa-cambuta", "rosa-cambuta": "teresa-sapalo",
  "filomena-tembo": "andre-kalunga", "andre-kalunga": "luisa-chilombo", "marcos-kavungo": "esperanca-nzinga", "esperanca-nzinga": "luisa-chilombo",
  "rui-lumbo": "celeste-manuel", "celeste-manuel": "luisa-chilombo", "bento-quissanga": "natalia-wanga", "natalia-wanga": "paulo-cassoma",
  "albertina-mussungo": "victor-ngunza", "ernesto-bunga": "helena-muhongo", "simao-katchiungo": "luisa-chilombo", "adao-sebastiao": "luisa-chilombo",
};

/** Uso de cada serviço por pessoa: os mais usados aparecem primeiro. */
export const usage: Record<string, string[]> = { "marta-kiala": ["sala", "ferias"], "isabel-ngola": ["material", "ferias", "apoio"] };

const d = (s: string) => `${s}+01:00`;

export const requests: RequestItem[] = [
  { id: "r7", number: 7, serviceId: "sala", personId: "marta-kiala", status: "devolvido", createdAt: d("2026-11-07T10:00:00"), updatedAt: d("2026-11-09T08:40:00"), summary: "Sala de reuniões A · 12 Nov, 10h às 11h", answers: { sala: "Sala de reuniões A", dia: "12 de Novembro de 2026", horas: "10h às 11h", assunto: "Reunião de secção", participantes: "" },
    steps: [{ label: "Secretaria da unidade", deciderId: "isabel-ngola", state: "returned", at: d("2026-11-09T08:40:00"), byId: "isabel-ngola", comment: "Falta indicar o número de participantes para confirmar a sala." }] },
  { id: "r9", number: 9, serviceId: "ferias", personId: "marta-kiala", status: "em-analise", createdAt: d("2026-11-03T12:00:00"), updatedAt: d("2026-11-05T12:00:00"), summary: "22 Dez a 2 Jan · 8 dias úteis", answers: { periodo: "22/12/2026 a 02/01/2027", tipo: "Férias anuais", substituto: "Domingos Tchipa" },
    steps: [{ label: "Chefia directa", deciderId: "domingos-tchipa", state: "done", at: d("2026-11-05T12:00:00"), byId: "domingos-tchipa", comment: "Aprovado. Garantir a passagem dos processos urgentes." }, { label: "Recursos Humanos", deciderId: "esperanca-nzinga", state: "current", due: d("2026-11-09T12:00:00") }] },
  { id: "r11", number: 11, serviceId: "ferias", personId: "isabel-ngola", status: "em-analise", createdAt: d("2026-11-09T07:10:00"), updatedAt: d("2026-11-09T07:10:00"), summary: "12 a 16 Dez · 5 dias", answers: { periodo: "12/12/2026 a 16/12/2026", tipo: "Férias anuais", substituto: "Albertina Mussungo", obs: "Deslocação familiar ao Huambo." },
    steps: [{ label: "Chefia directa", deciderId: "marta-kiala", state: "current", due: d("2026-11-11T07:10:00") }, { label: "Recursos Humanos", deciderId: "esperanca-nzinga", state: "waiting" }] },
  { id: "r14", number: 14, serviceId: "viatura", personId: "isabel-ngola", status: "em-analise", createdAt: d("2026-11-06T09:00:00"), updatedAt: d("2026-11-07T15:00:00"), summary: "18 Nov · Comarca de Icolo e Bengo · 3 pessoas", answers: { data: "18/11/2026", destino: "Comarca de Icolo e Bengo", pessoas: "3", obs: "Entrega de processos físicos para digitalização." },
    steps: [{ label: "Chefia directa", deciderId: "marta-kiala", state: "done", at: d("2026-11-07T15:00:00"), byId: "marta-kiala" }, { label: "Juiz Presidente", deciderId: "domingos-tchipa", state: "current", due: d("2026-11-08T15:00:00") }] },
  { id: "r13", number: 13, serviceId: "material", personId: "isabel-ngola", status: "rascunho", createdAt: d("2026-11-08T16:00:00"), updatedAt: d("2026-11-08T16:00:00"), summary: "Papel A4 e toner", answers: { artigos: "Papel A4, Tinteiros e toner", quantidade: "5 resmas, 2 toners" }, steps: [{ label: "Património", deciderId: "simao-katchiungo", state: "waiting" }] },
  { id: "r5", number: 5, serviceId: "declaracao", personId: "isabel-ngola", status: "aprovado", createdAt: d("2026-10-28T09:00:00"), updatedAt: d("2026-10-29T11:00:00"), summary: "Para o banco · 1 cópia", answers: { fim: "Banco", copias: "1" }, steps: [{ label: "Recursos Humanos", deciderId: "esperanca-nzinga", state: "done", at: d("2026-10-29T11:00:00"), byId: "esperanca-nzinga" }] },
  { id: "r4", number: 4, serviceId: "apoio", personId: "marta-kiala", status: "aprovado", createdAt: d("2026-10-20T09:00:00"), updatedAt: d("2026-10-20T15:00:00"), summary: "Impressora da secção sem ligação", answers: { assunto: "Impressora sem ligação", equipamento: "Impressora", detalhe: "Deixou de imprimir depois da mudança de sala." }, steps: [{ label: "Tecnologias de Informação", deciderId: "rui-lumbo", state: "done", at: d("2026-10-20T15:00:00"), byId: "rui-lumbo", comment: "Cabo de rede substituído." }] },
  { id: "r3", number: 3, serviceId: "declaracao", personId: "isabel-ngola", status: "aprovado", createdAt: d("2026-10-02T09:00:00"), updatedAt: d("2026-10-02T15:00:00"), summary: "Para a escola · 2 cópias", answers: { fim: "Escola", copias: "2" }, steps: [{ label: "Recursos Humanos", deciderId: "esperanca-nzinga", state: "done", at: d("2026-10-02T15:00:00"), byId: "marta-kiala" }] },
  { id: "r17", number: 17, serviceId: "ausencia", personId: "isabel-ngola", status: "em-analise", createdAt: d("2026-11-05T09:00:00"), updatedAt: d("2026-11-06T10:00:00"), summary: "5 Nov · Consulta médica", answers: { data: "05/11/2026", motivo: "Consulta médica", comprovativo: "declaracao-consulta.pdf" },
    steps: [{ label: "Chefia directa", deciderId: "marta-kiala", state: "done", at: d("2026-11-06T10:00:00"), byId: "domingos-tchipa", comment: "Decidido pelo juiz presidente na ausência da chefia." }, { label: "Recursos Humanos", deciderId: "esperanca-nzinga", state: "current", due: d("2026-11-10T10:00:00") }] },
  { id: "r12", number: 12, serviceId: "material", personId: "filomena-tembo", status: "em-analise", createdAt: d("2026-11-07T07:10:00"), updatedAt: d("2026-11-07T07:10:00"), summary: "Pastas de arquivo", answers: { artigos: "Pastas de arquivo", quantidade: "20 pastas" }, steps: [{ label: "Património", deciderId: "simao-katchiungo", state: "current", due: d("2026-11-10T07:10:00") }] },
  { id: "r21", number: 21, serviceId: "acesso", personId: "joaquim-mbala", status: "em-analise", createdAt: d("2026-11-08T10:00:00"), updatedAt: d("2026-11-08T16:20:00"), summary: "Tramitação electrónica · Edição", answers: { sistema: "Tramitação electrónica", perfil: "Edição" },
    steps: [{ label: "Chefia directa", deciderId: "rosa-cambuta", state: "done", at: d("2026-11-08T16:20:00"), byId: "rosa-cambuta" }, { label: "Tecnologias de Informação", deciderId: "celeste-manuel", state: "current", due: d("2026-11-10T16:20:00") }] },
];
