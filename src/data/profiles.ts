import type { Permission, Profile } from "./types";

const editor: Permission[] = ["content.draft", "documents.manage"];
const contentManager: Permission[] = [...editor, "content.publish", "notice.publish", "portal.build", "comments.moderate", "newsletter.send", "polls.create", "metrics.view"];
const peopleManager: Permission[] = ["climate.manage", "access.grant", "metrics.view"];
const admin: Permission[] = [...contentManager, ...peopleManager, "people.manage", "services.design", "system.configure"];

/** Matriz da secção 2.3. "Aprovador" é um colaborador nomeado por um fluxo, não um perfil de permissões. */
export const profiles: Profile[] = [
  { id: "colaborador", label: "Colaborador", personId: "isabel-ngola", permissions: [], approver: false },
  { id: "aprovador", label: "Aprovador", personId: "marta-kiala", permissions: [], approver: true, extraUnits: ["com-luanda"] },
  { id: "redactor", label: "Redactor", personId: "filomena-tembo", permissions: editor, approver: false },
  { id: "gestor-conteudos", label: "Gestor de conteúdos", personId: "andre-kalunga", permissions: contentManager, approver: false, extraUnits: ["rel-luanda", "rel-benguela"] },
  { id: "gestor-pessoas", label: "Gestor de pessoas", personId: "esperanca-nzinga", permissions: peopleManager, approver: true },
  { id: "administrador", label: "Administrador", personId: "celeste-manuel", permissions: admin, approver: true },
];
