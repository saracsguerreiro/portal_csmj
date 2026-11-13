import type { MenuSection } from "./types";

export const menu: MenuSection[] = [
  { id: "comunicacao", label: "Comunicação", href: "/comunicacao/noticias", items: [
    { id: "noticias", label: "Notícias", description: "A vida da instituição, em todas as unidades", icon: "Newspaper", href: "/comunicacao/noticias" },
    { id: "eventos", label: "Eventos", description: "O que vai acontecer e como se inscrever", icon: "CalendarDays", href: "/comunicacao/eventos" },
    { id: "avisos", label: "Avisos e circulares", description: "Regras e directrizes a confirmar", icon: "Megaphone", href: "/comunicacao/avisos" },
    { id: "multimedia", label: "Multimédia", description: "Álbuns de fotografias e vídeos", icon: "Images", href: "/comunicacao/multimedia" },
    { id: "newsletter", label: "Newsletter", description: "Edições anteriores e subscrição", icon: "Mail", href: "/comunicacao/newsletter" },
  ]},
  { id: "servicos", label: "Serviços", href: "/servicos", items: [
    { id: "pedidos", label: "Pedidos", description: "Faça um pedido novo e acompanhe cada decisão", icon: "ClipboardList", href: "/servicos" },
    { id: "aprovacoes", label: "Aprovações", description: "Pedidos à espera da sua decisão", icon: "Stamp", href: "/servicos/aprovacoes", requires: "approver" },
    { id: "salas", label: "Reserva de salas", description: "Disponibilidade por sala e por hora", icon: "DoorOpen", href: "/servicos/salas" },
    { id: "ausencias", label: "Ausências", description: "Marque ausências e indique substituto", icon: "CalendarOff", href: "/servicos/ausencias" },
  ]},
  { id: "documentos", label: "Documentos", href: "/documentos", items: [
    { id: "legislacao", label: "Legislação", description: "Leis, códigos e diplomas", icon: "Scale", href: "/documentos/legislacao" },
    { id: "regulamentos", label: "Regulamentos internos", description: "Normas de funcionamento da instituição", icon: "BookOpenText", href: "/documentos/regulamentos" },
    { id: "modelos", label: "Modelos e formulários", description: "Actas, requerimentos e declarações", icon: "FileText", href: "/documentos/modelos" },
    { id: "biblioteca", label: "Biblioteca", description: "Todas as colecções num só lugar", icon: "Library", href: "/documentos" },
    { id: "favoritos", label: "Favoritos", description: "O que guardou para ter à mão", icon: "Star", href: "/documentos/favoritos" },
  ]},
  { id: "pessoas", label: "Pessoas", href: "/pessoas", items: [
    { id: "contactos", label: "Contactos", description: "Encontre e contacte qualquer colega", icon: "Contact", href: "/pessoas" },
    { id: "organograma", label: "Organograma", description: "Unidades, responsáveis e equipas", icon: "Network", href: "/pessoas/organograma" },
    { id: "orgaos", label: "Órgãos do sistema judicial", description: "Tribunais da Relação e comarcas", icon: "Landmark", href: "/instituicao/orgaos" },
    { id: "sobre", label: "Sobre a instituição", description: "Missão, história e composição", icon: "Info", href: "/instituicao/sobre" },
    { id: "novos", label: "Novos colegas", description: "Quem chegou nos últimos 60 dias", icon: "UserPlus", href: "/pessoas/novos-colegas" },
  ]},
  { id: "participar", label: "Participar", href: "/participar/enquetes", items: [
    { id: "enquetes", label: "Enquetes", description: "Dê a sua opinião em votações curtas", icon: "Vote", href: "/participar/enquetes" },
    { id: "clima", label: "Pesquisa de clima", description: "Questionário anónimo sobre o trabalho", icon: "HeartPulse", href: "/participar/clima/2026" },
    { id: "sugestoes", label: "Caixa de sugestões", description: "Proponha melhorias à instituição", icon: "Lightbulb", href: "/participar/sugestoes" },
  ]},
];
