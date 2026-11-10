"use client";

import { ButtonLink, PageHeader, StatusBadge } from "@/design-system";
import { t } from "@/i18n";
import { useQuery } from "@/lib/use-query";

const PHASES: [RegExp, number][] = [
  [/^\/servicos/, 3],
  [/^\/(documentos|pessoas|instituicao|participar|notificacoes|conta|ajuda)/, 4],
  [/^\/painel\/(paginas|menus|etiquetas|documentos|enquetes|clima|comentarios|servicos|ausencias)/, 6],
  [/^\/painel\/(pessoas|unidades|salas|indicadores|envios|sistema)/, 7],
  [/^\/painel/, 5],
];

export function PlaceholderView({ path }: { path: string }) {
  const { q } = useQuery();
  const phase = PHASES.find(([r]) => r.test(path))?.[1];
  const last = path.split("/").filter(Boolean).at(-1) ?? "";
  const title = last.replaceAll("-", " ");
  return (
    <div className="wrap py-8">
      <PageHeader title={title.charAt(0).toUpperCase() + title.slice(1)} description={phase ? t.placeholder.lead : t.placeholder.pageNotFound} />
      <div className="mt-4 flex flex-wrap items-center gap-3">
        {phase && <StatusBadge tone="info">{t.placeholder.phase(phase)}</StatusBadge>}
        {q && <span className="text-body">{t.placeholder.query(q)}</span>}
      </div>
      <ButtonLink href="/" variant="pri" className="mt-6">{t.placeholder.backHome}</ButtonLink>
    </div>
  );
}
