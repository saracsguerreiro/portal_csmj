import type { Shortcut } from "./types";

export const allShortcuts: Shortcut[] = [
  { id: "ferias", label: "Pedir férias", icon: "Palmtree", href: "/servicos/pedir/ferias" },
  { id: "salas", label: "Reservar sala", icon: "DoorOpen", href: "/servicos/salas" },
  { id: "contactos", label: "Contactos", icon: "Contact", href: "/pessoas" },
  { id: "legislacao", label: "Legislação", icon: "Scale", href: "/documentos/legislacao" },
  { id: "modelos", label: "Modelos", icon: "FileText", href: "/documentos/modelos" },
  { id: "ausencias", label: "Ausências", icon: "CalendarOff", href: "/servicos/ausencias" },
  { id: "meus-pedidos", label: "Os meus pedidos", icon: "ClipboardList", href: "/servicos/meus-pedidos" },
  { id: "apoio", label: "Apoio informático", icon: "LifeBuoy", href: "/servicos/pedir/apoio-informatico" },
  { id: "organograma", label: "Organograma", icon: "Network", href: "/pessoas/organograma" },
  { id: "favoritos", label: "Favoritos", icon: "Star", href: "/documentos/favoritos" },
];

export const defaultShortcutIds = ["ferias", "salas", "contactos", "legislacao", "modelos", "ausencias", "meus-pedidos", "apoio"];
