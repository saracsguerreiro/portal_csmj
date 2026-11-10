"use client";

import { FileText } from "lucide-react";
import Link from "next/link";
import { Avatar, ButtonLink, PageHeader } from "@/design-system";
import { Toc } from "@/features/comunicacao/discussion";
import { VideoBlock } from "@/features/comunicacao/interactive";
import { usePersonHref } from "@/features/pessoas/parts";
import { PersonSheet } from "@/features/pessoas/PersonSheet";
import { people } from "@/data/people";
import { units } from "@/data/units";
import { t } from "@/i18n";
import { asset } from "@/lib/assets";

const a = t.about;

/** Página institucional montada por blocos (texto, imagem, contagem, pessoas, documentos, vídeo, ligações). */
export function AboutView() {
  const href = usePersonHref();
  const council = people.filter((p) => p.unitId === "plenario");
  const stats = [
    { n: units.filter((u) => u.type === "relation").length, label: "Tribunais da Relação" },
    { n: units.filter((u) => u.type === "court").length, label: "Comarcas" },
    { n: people.length, label: "Pessoas nesta intranet" },
    { n: 2027, label: "Ano do próximo plano de formação" },
  ];
  const toc = [{ id: "missao", text: "Missão" }, { id: "composicao", text: "Composição" }, { id: "numeros", text: "Em números" }, { id: "organizacao", text: "Organização" }, { id: "documentos", text: "Documentos de referência" }];
  return (
    <div className="wrap py-6 md:py-8">
      <div className="grid gap-x-12 xl:grid-cols-[minmax(0,760px)_1fr]">
        <div className="flex min-w-0 flex-col gap-10">
          <PageHeader crumbs={[{ label: t.peoplePage.title, href: "/pessoas" }, { label: a.title }]} title={a.title} description={a.lead} />
          <div className="xl:hidden"><Toc items={toc} /></div>
          <div className="on-brand pattern-brand relative overflow-hidden rounded-[24px] p-8">
            <p className="max-w-[40ch] text-section font-semibold">Gerir a magistratura judicial com independência, transparência e proximidade.</p>
            <span className="filete absolute inset-x-0 bottom-0" />
          </div>
          <section className="prose-read" aria-labelledby="missao">
            <h2 id="missao" className="!mt-0">Missão</h2>
            <p>O Conselho Superior da Magistratura Judicial é o órgão de gestão e disciplina dos magistrados judiciais. Garante as condições para que os tribunais da jurisdição comum funcionem com independência e qualidade.</p>
            <p>No âmbito do Projecto JURIS 5.0, o Conselho conduz a transformação digital dos tribunais: tramitação electrónica, gestão da informação e comunicação interna.</p>
            <figure><img src={asset("/covers/colunata.svg")} alt="Fachada de tribunal com colunas" className="cover-img w-full rounded-[16px]" /><figcaption>O edifício do Conselho, em Luanda.</figcaption></figure>
          </section>
          <section aria-labelledby="composicao">
            <h2 id="composicao" className="mb-4 text-section font-bold">Composição</h2>
            <ul className="grid gap-3 sm:grid-cols-2">{council.map((p) => <li key={p.id}><Link href={href(p.slug)} scroll={false} className="row-link flex items-center gap-3 rounded-[16px] border border-[var(--ds-border-card)] p-4"><Avatar initials={p.initials} /><span><span className="row-title block font-semibold text-ink">{p.name}</span><span className="text-label">{p.role}</span></span></Link></li>)}</ul>
          </section>
          <section aria-labelledby="numeros">
            <h2 id="numeros" className="mb-4 text-section font-bold">Em números</h2>
            <dl className="grid grid-cols-2 gap-4 md:grid-cols-4">{stats.map((x) => <div key={x.label} className="border-t-2 border-[var(--ds-accent-gold)] pt-3"><dd className="text-display font-semibold leading-none tracking-[-0.02em] text-ink tabular-nums">{x.n}</dd><dt className="mt-2 text-label">{x.label}</dt></div>)}</dl>
          </section>
          <hr className="rule" />
          <section aria-labelledby="organizacao" className="flex flex-col items-start gap-3">
            <h2 id="organizacao" className="text-section font-bold">Organização</h2>
            <p className="max-w-[75ch] text-ui">O Conselho funciona em Plenário e apoia-se na Secretaria-Geral, que integra as Direcções de Recursos Humanos e de Tecnologias de Informação. Os tribunais da jurisdição comum organizam-se em Tribunais da Relação e comarcas.</p>
            <div className="flex flex-wrap gap-2"><ButtonLink href="/pessoas/organograma">{t.org.title}</ButtonLink><ButtonLink variant="gh" href="/instituicao/orgaos">{t.organs.title}</ButtonLink></div>
          </section>
          <VideoBlock title="O Conselho em três minutos" poster={asset("/covers/plenario.svg")} duration="3:05" />
          <section aria-labelledby="documentos">
            <h2 id="documentos" className="mb-3 text-section font-bold">Documentos de referência</h2>
            <ul className="flex flex-col gap-2">{[["lei-organica-jc", "Lei Orgânica dos Tribunais da Jurisdição Comum"], ["regulamento-csmj", "Regulamento interno do CSMJ"]].map(([id, title]) => <li key={id}><Link href={`/documentos/ficheiro/${id}`} className="row-link flex items-center gap-3 rounded-[16px] border border-[var(--ds-border-card)] p-4"><FileText size={22} aria-hidden className="text-brand" /><span className="row-title font-semibold text-ink">{title}</span></Link></li>)}</ul>
          </section>
        </div>
        <aside className="hidden xl:block"><div className="sticky top-28"><Toc items={toc} /></div></aside>
      </div>
      <PersonSheet />
    </div>
  );
}
