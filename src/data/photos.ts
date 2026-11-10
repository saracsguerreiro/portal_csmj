import { asset } from "@/lib/assets";

/** Fotografias de exemplo (licença Unsplash), a trocar pelas fotografias do CSMJ. */
const list: Record<string, { alt: string; source: string }> = {
  n1: { alt: "Reunião numa sala de conselho com computadores portáteis", source: "https://unsplash.com/photos/1573164574511-73c773193279" },
  n2: { alt: "Duas funcionárias a trabalhar com computadores portáteis", source: "https://unsplash.com/photos/1573164574048-f968d7ee9f20" },
  n3: { alt: "Pessoa de fato perante três membros sentados a uma mesa de madeira", source: "https://unsplash.com/photos/1596574027151-2ce81d85af3e" },
  n4: { alt: "Grupo reunido à volta de uma mesa com computadores", source: "https://unsplash.com/photos/1573164574572-cb89e39749b4" },
  n5: { alt: "Mãos a usar o telemóvel e o computador portátil", source: "https://unsplash.com/photos/1573164574230-db1d5e960238" },
  n6: { alt: "Pessoas reunidas à volta de uma mesa comprida", source: "https://unsplash.com/photos/1744973055006-a1c7dd30da62" },
  n7: { alt: "Edifício com colunas e relógio na fachada", source: "https://unsplash.com/photos/1636652966850-5ac4d02370e9" },
  n8: { alt: "Três colegas sentadas à mesa numa sala de trabalho", source: "https://unsplash.com/photos/1573164574397-dd250bc8a598" },
  n9: { alt: "Livros numa estante de madeira escura", source: "https://unsplash.com/photos/1505664194779-8beaceb93744" },
  n10: { alt: "Vista da cidade sob um céu azul com nuvens", source: "https://unsplash.com/photos/1743172140481-5c7044dd23d6" },
  n11: { alt: "Grupo de mulheres com livros nas mãos", source: "https://unsplash.com/photos/1666281269793-da06484657e8" },
  n12: { alt: "Sala de tribunal vazia com painéis de madeira", source: "https://unsplash.com/photos/1711003596872-aa68f08a4b8e" },
  n13: { alt: "Homem a escrever num documento", source: "https://unsplash.com/photos/1450101499163-c8848c66ca85" },
  n14: { alt: "Funcionária a trabalhar ao computador", source: "https://unsplash.com/photos/1573164574144-649081e9421a" },
  n15: { alt: "Homem a assinar um documento com uma caneta", source: "https://unsplash.com/photos/1763729805496-b5dbf7f00c79" },
  n16: { alt: "Mulher sentada a uma mesa com vários papéis", source: "https://unsplash.com/photos/1635859890085-ec8cb5466806" },
  n17: { alt: "Duas pessoas a rever documentos numa mesa", source: "https://unsplash.com/photos/1775163024488-e88e4a71179f" },
  n18: { alt: "Estátua da Justiça com a espada erguida", source: "https://unsplash.com/photos/1589829545856-d10d557cf95f" },
  n19: { alt: "Rua com carros estacionados junto a edifícios", source: "https://unsplash.com/photos/1630343350724-2eafe052719f" },
  d1: { alt: "Rua de cidade com edifícios altos", source: "https://unsplash.com/photos/1682107845065-f89ebccb1523" },
  d2: { alt: "Pilha de livros sobre uma mesa", source: "https://unsplash.com/photos/1491841573634-28140fc7ced7" },
  d3: { alt: "Sala de tribunal com bancada de madeira", source: "https://unsplash.com/photos/1660784670019-33a36fd82515" },
  d4: { alt: "Livros numa estante de vidro", source: "https://unsplash.com/photos/1479142506502-19b3a3b7ff33" },
};

export const photoOf = (id: string) => (list[id] ? { src: asset(`/photos/${id}.jpg`), alt: list[id].alt } : null);
export const photoLibrary = Object.keys(list).map((id) => ({ id, src: asset(`/photos/${id}.jpg`), alt: list[id].alt }));

/** Fotografia de cada evento (reaproveita a biblioteca de exemplo). */
const eventPhotos: Record<string, string> = { e1: "n5", e2: "d3", e3: "n18", e4: "n4", e5: "n12", e6: "n15", e7: "n2", e8: "n7" };
export const eventPhotoOf = (id: string) => photoOf(eventPhotos[id] ?? "n12");
