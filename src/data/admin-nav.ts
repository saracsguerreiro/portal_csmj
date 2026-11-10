import type { Permission } from "./types";

export type AdminItem = { id: string; href: string; icon: string; perms?: Permission[]; phase?: number };
export type AdminGroup = { id: string; items: AdminItem[] };

/** Menu lateral do painel (secção 5.2). Cada pessoa só vê o que o perfil permite. */
export const adminNav: AdminGroup[] = [
  { id: "trabalho", items: [{ id: "trabalho", href: "/painel", icon: "LayoutDashboard" }] },
  { id: "conteudos", items: [
    { id: "noticias", href: "/painel/noticias", icon: "Newspaper", perms: ["content.draft"] },
    { id: "eventos", href: "/painel/eventos", icon: "CalendarDays", perms: ["content.draft"] },
    { id: "avisos", href: "/painel/avisos", icon: "Megaphone", perms: ["notice.publish"] },
    { id: "multimedia", href: "/painel/multimedia", icon: "Images", perms: ["content.draft"] },
    { id: "newsletter", href: "/painel/newsletter", icon: "Mail", perms: ["newsletter.send"] },
  ] },
  { id: "portal", items: [
    { id: "paginas", href: "/painel/paginas", icon: "PanelsTopLeft", perms: ["portal.build"], phase: 6 },
    { id: "menus", href: "/painel/menus", icon: "ListTree", perms: ["portal.build"], phase: 6 },
    { id: "etiquetas", href: "/painel/etiquetas", icon: "Tags", perms: ["content.publish"], phase: 6 },
  ] },
  { id: "documentos", items: [{ id: "documentos", href: "/painel/documentos", icon: "Library", perms: ["documents.manage"], phase: 6 }] },
  { id: "participacao", items: [
    { id: "enquetes", href: "/painel/enquetes", icon: "Vote", perms: ["polls.create"], phase: 6 },
    { id: "clima", href: "/painel/clima", icon: "HeartPulse", perms: ["climate.manage"], phase: 6 },
    { id: "comentarios", href: "/painel/comentarios", icon: "MessageSquare", perms: ["comments.moderate"], phase: 6 },
  ] },
  { id: "servicos", items: [
    { id: "servicos", href: "/painel/servicos", icon: "Workflow", perms: ["services.design"], phase: 6 },
    { id: "ausencias", href: "/painel/ausencias", icon: "CalendarOff", perms: ["services.design"], phase: 6 },
  ] },
  { id: "pessoas", items: [
    { id: "pessoas", href: "/painel/pessoas", icon: "Users", perms: ["people.manage", "access.grant"], phase: 7 },
    { id: "importar", href: "/painel/pessoas/importar", icon: "Upload", perms: ["people.manage"], phase: 7 },
    { id: "acessos", href: "/painel/pessoas/acessos", icon: "KeyRound", perms: ["access.grant"], phase: 7 },
  ] },
  { id: "instituicao", items: [
    { id: "unidades", href: "/painel/unidades", icon: "Building2", perms: ["system.configure"], phase: 7 },
    { id: "salas", href: "/painel/salas", icon: "DoorOpen", perms: ["system.configure"], phase: 7 },
  ] },
  { id: "analise", items: [
    { id: "indicadores", href: "/painel/indicadores", icon: "BarChart3", perms: ["metrics.view"], phase: 7 },
    { id: "envios", href: "/painel/envios", icon: "Send", perms: ["system.configure"], phase: 7 },
  ] },
  { id: "sistema", items: [
    { id: "definicoes", href: "/painel/sistema/definicoes", icon: "Settings", perms: ["system.configure"], phase: 7 },
    { id: "integracoes", href: "/painel/sistema/integracoes", icon: "Plug", perms: ["system.configure"], phase: 7 },
    { id: "auditoria", href: "/painel/sistema/auditoria", icon: "ScrollText", perms: ["system.configure"], phase: 7 },
    { id: "saude", href: "/painel/sistema/saude", icon: "Activity", perms: ["system.configure"], phase: 7 },
  ] },
];
