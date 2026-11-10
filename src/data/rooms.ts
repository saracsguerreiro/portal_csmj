import type { Absence, Booking, Room } from "./types";

export const rooms: Room[] = [
  { id: "sala-a", name: "Sala de reuniões A", seats: 12, zone: "Edifício do Conselho", equipment: ["Projector"] },
  { id: "sala-b", name: "Sala de reuniões B", seats: 6, zone: "Edifício do Conselho", equipment: [] },
  { id: "auditorio", name: "Auditório", seats: 80, zone: "Edifício do Conselho", equipment: ["Projector", "Videoconferência"] },
  { id: "plenario", name: "Sala do Plenário", seats: 20, zone: "Edifício do Conselho", equipment: ["Videoconferência"] },
  { id: "belas", name: "Sala de reuniões de Belas", seats: 8, zone: "Comarca de Belas", equipment: ["Projector"] },
];

export const bookings: Booking[] = [
  { id: "b1", roomId: "sala-a", date: "2026-11-09", start: "08:00", end: "09:30", status: "aprovada", personId: "rosa-cambuta", subject: "Reunião de coordenação" },
  { id: "b2", roomId: "sala-a", date: "2026-11-09", start: "14:00", end: "15:30", status: "aprovada", personId: "teresa-sapalo", subject: "Audição de peritos" },
  { id: "b3", roomId: "sala-b", date: "2026-11-09", start: "10:00", end: "11:00", status: "pendente", personId: "joaquim-mbala", subject: "Preparação de inventário" },
  { id: "b4", roomId: "auditorio", date: "2026-11-09", start: "09:00", end: "12:00", status: "aprovada", personId: "luisa-chilombo", subject: "Semana da organização judiciária" },
  { id: "b5", roomId: "plenario", date: "2026-11-09", start: "15:00", end: "17:00", status: "aprovada", personId: "marta-kiala", subject: "Reunião de juízes da comarca" },
  { id: "b6", roomId: "belas", date: "2026-11-09", start: "11:00", end: "12:00", status: "aprovada", personId: "domingos-tchipa", subject: "Atendimento a advogados" },
  { id: "b7", roomId: "auditorio", date: "2026-11-10", start: "09:00", end: "17:00", status: "aprovada", personId: "luisa-chilombo", subject: "Semana da organização judiciária" },
  { id: "b8", roomId: "sala-a", date: "2026-11-10", start: "10:00", end: "12:00", status: "aprovada", personId: "andre-kalunga", subject: "Reunião editorial" },
  { id: "b9", roomId: "auditorio", date: "2026-11-13", start: "08:30", end: "17:30", status: "aprovada", personId: "luisa-chilombo", subject: "Jornadas de Direito Penal" },
  { id: "b10", roomId: "sala-b", date: "2026-11-12", start: "10:00", end: "11:00", status: "pendente", personId: "marta-kiala", subject: "Reunião de secção" },
];

export const absences: Absence[] = [
  { id: "aus1", personId: "domingos-tchipa", start: "2026-11-09", end: "2026-11-13", substituteId: "marta-kiala", reason: "Formação", message: "Estou em formação até 13 de Novembro. Os pedidos de decisão seguem para Marta Kiala.", markedBy: "domingos-tchipa" },
  { id: "aus2", personId: "rosa-cambuta", start: "2026-11-16", end: "2026-11-20", substituteId: "joaquim-mbala", markedBy: "rosa-cambuta" },
  { id: "aus3", personId: "domingos-tchipa", start: "2026-12-14", end: "2026-12-18", substituteId: "marta-kiala", reason: "Férias", markedBy: "domingos-tchipa" },
  { id: "aus4", personId: "marta-kiala", start: "2026-11-26", end: "2026-11-27", substituteId: "domingos-tchipa", reason: "Formação", markedBy: "marta-kiala" },
];
