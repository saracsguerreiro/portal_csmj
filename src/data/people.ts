import type { Person } from "./types";

type Row = [string, string, string, string, string?, string?];

const rows: Row[] = [
  ["marta-kiala", "Marta Kiala", "Juíza de Direito", "com-belas"],
  ["domingos-tchipa", "Domingos Tchipa", "Juiz Presidente", "com-belas", "11-12"],
  ["isabel-ngola", "Isabel Ngola", "Oficial de Justiça", "com-belas", "11-09"],
  ["joaquim-mbala", "Joaquim Mbala", "Escrivão", "com-luanda"],
  ["teresa-sapalo", "Teresa Sapalo", "Juíza Desembargadora", "rel-luanda"],
  ["paulo-cassoma", "Paulo Cassoma", "Juiz Presidente", "rel-benguela"],
  ["helena-muhongo", "Helena Muhongo", "Juíza de Direito", "com-sumbe"],
  ["rui-lumbo", "Rui Lumbo", "Técnico de Informática", "dti", undefined, "2026-10-26"],
  ["esperanca-nzinga", "Esperança Nzinga", "Directora", "drh"],
  ["marcos-kavungo", "Marcos Kavungo", "Técnico de Recursos Humanos", "drh"],
  ["luisa-chilombo", "Luísa Chilombo", "Secretária-Geral", "secretaria"],
  ["andre-kalunga", "André Kalunga", "Assessor de Comunicação", "secretaria"],
  ["filomena-tembo", "Filomena Tembo", "Redactora", "secretaria"],
  ["carlos-ndongala", "Carlos Ndongala", "Vogal do Conselho", "plenario"],
  ["graca-mukuta", "Graça Mukuta", "Vogal do Conselho", "plenario"],
  ["adao-sebastiao", "Adão Sebastião", "Motorista", "secretaria"],
  ["rosa-cambuta", "Rosa Cambuta", "Chefe de Secção", "com-luanda", "11-14"],
  ["bento-quissanga", "Bento Quissanga", "Oficial de Justiça", "com-benguela"],
  ["natalia-wanga", "Natália Wanga", "Juíza de Direito", "com-benguela", undefined, "2026-10-19"],
  ["simao-katchiungo", "Simão Katchiungo", "Técnico de Património", "secretaria"],
  ["albertina-mussungo", "Albertina Mussungo", "Assistente Administrativa", "com-icolo", undefined, "2026-10-30"],
  ["victor-ngunza", "Victor Ngunza", "Juiz de Direito", "com-icolo"],
  ["celeste-manuel", "Celeste Manuel", "Directora", "dti"],
  ["ernesto-bunga", "Ernesto Bunga", "Escrivão", "com-sumbe"],
  ["augusta-ngueve", "Augusta Ngueve", "Presidente do Conselho", "plenario"],
];

const sectorOf = (role: string, unit: string) =>
  /Juiz|Juíza|Vogal|Presidente do Conselho/.test(role) ? "Magistratura" : unit === "dti" ? "Tecnologia" : unit === "drh" ? "Recursos humanos" : /Comunicação|Redactora/.test(role) ? "Comunicação" : /Oficial|Escrivão|Chefe de Secção|Assistente/.test(role) ? "Secretaria judicial" : "Administração";

/** Dados de contacto fictícios: só aparecem quando existem (campos vazios não se mostram). */
const extra: Record<string, Partial<Person>> = {
  "marta-kiala": { room: "Gabinete 2.04", phone: "+244 222 410 204", showBirthday: false },
  "domingos-tchipa": { room: "Gabinete 1.01", phone: "+244 222 410 101", mobile: "+244 923 000 101", showBirthday: true },
  "isabel-ngola": { room: "Secretaria · balcão 3", showBirthday: true },
  "luisa-chilombo": { room: "Gabinete da Secretária-Geral", phone: "+244 222 000 010", mobile: "+244 923 000 010" },
  "celeste-manuel": { room: "Piso 3 · sala 3.10", phone: "+244 222 000 310" },
  "esperanca-nzinga": { room: "Piso 2 · sala 2.20", phone: "+244 222 000 220" },
  "augusta-ngueve": { room: "Gabinete da Presidência", phone: "+244 222 000 001" },
  "rosa-cambuta": { showBirthday: true },
};

export const people: Person[] = rows.map(([id, name, role, unitId, birthday, joinedAt], i) => {
  const parts = name.split(" ");
  const ascii = name.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().split(" ").join(".");
  return { id, slug: id, name, initials: parts[0][0] + parts[parts.length - 1][0], role, unitId, email: `${ascii}@exemplo.ao`, extension: String(2100 + i * 7), birthday, joinedAt, sector: sectorOf(role, unitId), ...extra[id] };
});
