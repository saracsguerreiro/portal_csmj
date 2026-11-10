import { ErrorPage, type ErrorKind } from "@/features/erros/ErrorPage";

export const dynamicParams = false;

/** Páginas de erro para consulta no protótipo (P38). */
export function generateStaticParams() {
  return ["404", "403", "sem-ligacao", "manutencao", "geral"].map((tipo) => ({ tipo }));
}

export default async function Page({ params }: { params: Promise<{ tipo: string }> }) {
  const { tipo } = await params;
  return <ErrorPage kind={tipo as ErrorKind} code={tipo === "geral" ? "CSMJ-500-7F3A" : undefined} />;
}
