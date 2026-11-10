import { ButtonLink, PageHeader, StatusBadge } from "@/design-system";
import { t } from "@/i18n";

const PHASES: [RegExp, number][] = [
  [/^\/(comunicacao|pesquisa|perguntar)/, 2],
  [/^\/servicos/, 3],
  [/^\/(documentos|pessoas|instituicao|participar|notificacoes|conta)/, 4],
  [/^\/painel\/(paginas|menus|etiquetas|documentos|enquetes|clima|comentarios|servicos|ausencias)/, 6],
  [/^\/painel\/(pessoas|unidades|salas|indicadores|envios|sistema)/, 7],
  [/^\/painel/, 5],
];

export default async function Placeholder({ params, searchParams }: { params: Promise<{ resto: string[] }>; searchParams: Promise<{ q?: string }> }) {
  const { resto } = await params;
  const { q } = await searchParams;
  const path = `/${resto.join("/")}`;
  const phase = PHASES.find(([r]) => r.test(path))?.[1];
  const title = resto[resto.length - 1].replaceAll("-", " ");
  const heading = title.charAt(0).toUpperCase() + title.slice(1);
  return (
    <div className="wrap py-8">
      <PageHeader title={heading} description={phase ? t.placeholder.lead : t.placeholder.pageNotFound} />
      <div className="mt-4 flex flex-wrap items-center gap-3">
        {phase && <StatusBadge tone="info">{t.placeholder.phase(phase)}</StatusBadge>}
        {q && <span className="text-body">{t.placeholder.query(q)}</span>}
      </div>
      <ButtonLink href="/" variant="pri" className="mt-6">{t.placeholder.backHome}</ButtonLink>
    </div>
  );
}
