/* Forma dos dados: a mesma que uma API devolveria. */
export type UnitType = "national" | "plenary" | "general" | "directorate" | "relation" | "court";
export type Unit = { id: string; name: string; short: string; type: UnitType; parentId: string | null };

export type ProfileId = "colaborador" | "aprovador" | "redactor" | "gestor-conteudos" | "gestor-pessoas" | "administrador";
export type Profile = { id: ProfileId; label: string; personId: string; permissions: Permission[]; approver: boolean; extraUnits?: string[] };
export type Permission =
  | "content.draft" | "content.publish" | "notice.publish" | "portal.build" | "comments.moderate" | "newsletter.send"
  | "documents.manage" | "polls.create" | "climate.manage" | "access.grant" | "people.manage" | "services.design"
  | "metrics.view" | "system.configure";

export type Person = { id: string; slug: string; name: string; initials: string; role: string; unitId: string; email: string; extension: string; birthday?: string; joinedAt?: string; phone?: string; mobile?: string; room?: string; sector: string; showBirthday?: boolean };

export type Scoped = { scopes: string[] };

export type Block =
  | { t: "p"; text: string } | { t: "h2"; id: string; text: string } | { t: "ul"; items: string[] } | { t: "quote"; text: string; by: string }
  | { t: "callout"; title: string; text: string } | { t: "table"; caption: string; head: string[]; rows: string[][] }
  | { t: "img"; src: string; alt: string; caption?: string } | { t: "gallery"; images: { src: string; alt: string }[] }
  | { t: "video"; title: string; poster: string; duration: string } | { t: "details"; title: string; text: string }
  | { t: "columns"; cols: [string, string] } | { t: "file"; name: string; format: string; size: string } | { t: "button"; label: string; href: string }
  | { t: "live-poll"; taskId: string } | { t: "live-person"; personId: string } | { t: "live-event"; eventId: string } | { t: "live-service"; serviceId: string };
export type NewsItem = Scoped & { id: string; slug: string; title: string; summary: string; publishedAt: string; cover: string; coverAlt: string; tags: string[]; authorId: string; caption?: string; body?: Block[]; html?: string };
export type Comment = { id: string; newsId: string; authorId: string; text: string; at: string; replyTo?: string };
export type EventMode = "online" | "presencial" | "hibrido";
export type EventItem = Scoped & { id: string; slug: string; title: string; startsAt: string; endsAt: string; mode: EventMode; place?: string; address?: string; capacity?: number; taken?: number; deadline?: string; needsApproval?: boolean; publishedAt: string; organizer: string; tags: string[]; description: string[]; programme?: { time: string; title: string }[]; speakers?: string[]; showAttendees?: boolean };
export type Rsvp = "none" | "going" | "waitlist" | "pending";
export type Notice = Scoped & { id: string; title: string; number?: string; kind: "aviso" | "circular"; mandatory: boolean; publishedAt: string; version: number; body: string[]; changed?: number[]; updatedAt?: string; attachments?: { name: string; format: string; size: string }[] };
export type DocumentItem = Scoped & {
  id: string; title: string; collection: string; type: string; format: string; size: string; updatedAt: string; isNew: boolean;
  collectionId: string; folder: string; description: string; number?: string; year: number; publishedAt: string; validUntil?: string; outOfDate?: boolean;
  responsibleId: string; versions: { label: string; date: string }[]; tags: string[]; views: number; text: string; fileName: string;
};
export type Collection = { id: string; slug: string; name: string; description: string; icon: string; folders: { id: string; name: string; readers?: string[] }[] };
export type FieldType = "text" | "textarea" | "number" | "date" | "daterange" | "select" | "radio" | "checks" | "yesno" | "file" | "person" | "unit";
export type Field = { id: string; label: string; type: FieldType; required?: boolean; hint?: string; options?: string[]; min?: number; max?: number; section?: "dados" | "anexos" };
/** Passo de decisão: por superior hierárquico ou por pessoa nomeada. */
export type StepDef = { label: string; by: "superior" | "person"; personId?: string; days: number };
export type ServiceItem = { id: string; slug: string; name: string; description: string; category: string; decider: string; avgDays: number; icon: string; steps: StepDef[]; fields: Field[] };
export type RequestStatus = "rascunho" | "enviado" | "em-analise" | "devolvido" | "aprovado" | "recusado" | "cancelado";
export type StepState = "done" | "current" | "waiting" | "returned" | "refused";
export type RequestStep = { label: string; deciderId: string; state: StepState; at?: string; byId?: string; comment?: string; due?: string };
export type RequestItem = { id: string; number: number; serviceId: string; personId: string; status: RequestStatus; createdAt: string; updatedAt: string; summary: string; answers: Record<string, string>; steps: RequestStep[] };
export type Room = { id: string; name: string; seats: number; zone: string; equipment: string[] };
export type Booking = { id: string; roomId: string; date: string; start: string; end: string; status: "aprovada" | "pendente"; personId: string; subject: string };
export type Absence = { id: string; personId: string; start: string; end: string; substituteId: string; reason?: string; message?: string; markedBy: string };

export type TaskType = "approval" | "returned" | "poll" | "climate" | "event" | "reply";
export type Task = Scoped & {
  id: string; type: TaskType; assignees: string[]; title: string; detail: string; since: string; href: string;
  action: "approve" | "link" | "vote" | "going"; actionLabel?: string; options?: string[]; requestId?: string;
};

export type NotificationKind = "approval" | "reply" | "notice" | "mention" | "comment" | "newsletter" | "event" | "reminder";
export type NotificationItem = { id: string; kind: NotificationKind; text: string; at: string; href: string; mention?: boolean; personIds?: string[]; read?: boolean };

export type Shortcut = { id: string; label: string; icon: string; href: string };
export type MenuItem = { id: string; label: string; description: string; icon: string; href: string; requires?: "approver" };
export type MenuSection = { id: string; label: string; href: string; items: MenuItem[] };
export type Holiday = { date: string; name: string };
export type ApiList<T> = { data: T[]; meta: { total: number } };

export type Album = Scoped & { id: string; slug: string; title: string; happenedAt: string; description: string; tags: string[]; cover: string; coverAlt: string; total: number };
export type Photo = { src: string; alt: string; caption: string; w: number; h: number; credit: string; key?: string; removed?: boolean };
export type VideoItem = Scoped & { id: string; title: string; poster: string; duration: string; publishedAt: string; tags: string[] };
export type Edition = { id: string; number: number; sentAt: string; intro: string; sections: { title: string; items: { title: string; href: string; scopes: string[] }[] }[] };
export type Poll = Scoped & { id: string; taskId?: string; question: string; description: string; closesAt: string; anonymous: boolean; options: string[]; results?: number[]; closed?: boolean; live?: boolean };
export type ClimateQuestion = { id: string; text: string; kind: "scale5" | "scale10" | "single" | "multi" | "text"; options?: string[] };
export type ClimateTheme = { id: string; title: string; questions: ClimateQuestion[] };
export type Suggestion = { id: string; theme: string; text: string; status: "Recebida" | "Em análise" | "Respondida"; at: string; answer?: string; anonymous: boolean };
export type ContentStatus = "rascunho" | "espera" | "agendado" | "publicado" | "despublicado" | "lixeira";
export type ContentMeta = {
  status: ContentStatus; authorId: string; langs: string[]; featured: boolean; comments: boolean; aiAssisted: boolean;
  lockedBy?: string; scheduledAt?: string; updatedAt: string; returnedComment?: string;
  history: { at: string; byId: string; label: string; title: string }[];
};
