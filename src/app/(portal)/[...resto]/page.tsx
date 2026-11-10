import { Suspense } from "react";
import { Booted } from "@/features/shell/Booted";
import { entity } from "@/config/entity";
import { documents } from "@/data/documents";
import { menu } from "@/data/navigation";
import { people } from "@/data/people";
import { services } from "@/data/services";
import { allShortcuts } from "@/data/shortcuts";
import { PlaceholderView } from "./view";

export const dynamicParams = false;

/** Páginas das fases seguintes: geradas para todos os destinos que o protótipo já liga. */
export function generateStaticParams() {
  const built = new Set(["/", "/comunicacao/noticias", "/comunicacao/eventos", "/comunicacao/avisos", "/comunicacao/multimedia", "/comunicacao/newsletter", "/servicos", "/servicos/meus-pedidos", "/servicos/aprovacoes", "/servicos/salas", "/servicos/ausencias", "/pesquisa", "/perguntar"]);
  const paths = new Set<string>([
    ...menu.flatMap((m) => m.items.map((i) => i.href)),
    ...allShortcuts.map((s) => s.href),
    ...entity.footer.flatMap((c) => c.links.map((l) => l.href)),
    ...documents.map((d) => `/documentos/ficheiro/${d.id}`),
    ...people.map((p) => `/pessoas/${p.slug}`),
    "/documentos", "/conta", "/ajuda", "/ajuda/acessibilidade", "/ajuda/privacidade", "/notificacoes", "/participar/enquetes", "/participar/clima/2026",
    "/painel", "/painel/noticias/nova", "/painel/eventos/novo", "/painel/paginas/inicio/editar", "/painel/noticias/n1",
  ]);
  services.forEach(() => undefined);
  return [...new Set([...paths].map((p) => p.split("?")[0]))].filter((p) => !built.has(p) && (p.startsWith("/ajuda") || p.startsWith("/painel"))).map((p) => ({ resto: p.split("/").filter(Boolean) }));
}

export default async function Page({ params }: { params: Promise<{ resto: string[] }> }) {
  const { resto } = await params;
  return <Suspense><Booted><PlaceholderView path={`/${resto.join("/")}`} /></Booted></Suspense>;
}
