import type { RequestStatus } from "@/data/types";
import type { Tone } from "@/design-system/components/display";

export const statusTone: Record<RequestStatus, Tone> = { rascunho: "neu", enviado: "info", "em-analise": "info", devolvido: "warn", aprovado: "ok", recusado: "err", cancelado: "neu" };
export const statusLabel: Record<RequestStatus, string> = { rascunho: "Rascunho", enviado: "Enviado", "em-analise": "Em análise", devolvido: "Devolvido para correcção", aprovado: "Aprovado", recusado: "Recusado", cancelado: "Cancelado" };
