import type { Unit } from "./types";

export const units: Unit[] = [
  { id: "nacional", name: "Conselho Superior da Magistratura Judicial", short: "Nacional", type: "national", parentId: null },
  { id: "plenario", name: "Plenário do Conselho", short: "Plenário do Conselho", type: "plenary", parentId: "nacional" },
  { id: "secretaria", name: "Secretaria-Geral", short: "Secretaria-Geral", type: "general", parentId: "nacional" },
  { id: "drh", name: "Direcção de Recursos Humanos", short: "Recursos Humanos", type: "directorate", parentId: "secretaria" },
  { id: "dti", name: "Direcção de Tecnologias de Informação", short: "Tecnologias de Informação", type: "directorate", parentId: "secretaria" },
  { id: "rel-luanda", name: "Tribunal da Relação de Luanda", short: "Relação de Luanda", type: "relation", parentId: "nacional" },
  { id: "com-luanda", name: "Comarca de Luanda", short: "Comarca de Luanda", type: "court", parentId: "rel-luanda" },
  { id: "com-belas", name: "Comarca de Belas", short: "Comarca de Belas", type: "court", parentId: "rel-luanda" },
  { id: "com-icolo", name: "Comarca de Icolo e Bengo", short: "Comarca de Icolo e Bengo", type: "court", parentId: "rel-luanda" },
  { id: "rel-benguela", name: "Tribunal da Relação de Benguela", short: "Relação de Benguela", type: "relation", parentId: "nacional" },
  { id: "com-benguela", name: "Comarca de Benguela", short: "Comarca de Benguela", type: "court", parentId: "rel-benguela" },
  { id: "com-sumbe", name: "Comarca do Sumbe", short: "Comarca do Sumbe", type: "court", parentId: "rel-benguela" },
];
