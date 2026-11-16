"use client";

import { ArrowUpRight, Building2, ChevronLeft, ChevronRight, Eye, FileText, Handshake, Landmark, Lightbulb, Network, Play, Scale, ShieldCheck, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Avatar, Breadcrumbs, Button, Dialog } from "@/design-system";
import { photoOf } from "@/data/photos";
import { usePersonHref } from "@/features/pessoas/parts";
import { PersonSheet } from "@/features/pessoas/PersonSheet";
import { people } from "@/data/people";
import { units } from "@/data/units";
import { t } from "@/i18n";

const a = t.about;

function Img({ id, className = "" }: { id: string; className?: string }) {
  const p = photoOf(id);
  // eslint-disable-next-line @next/next/no-img-element
  return p ? <img src={p.src} alt="" loading="lazy" className={`object-cover ${className}`} /> : null;
}

const VALUES = [
  { icon: Scale, title: "Independência", text: "Garantir que os juízes decidem só de acordo com a lei e a sua consciência." },
  { icon: Eye, title: "Transparência", text: "Explicar as decisões de gestão e publicar os critérios de colocação e avaliação." },
  { icon: Handshake, title: "Proximidade", text: "Estar perto dos tribunais e das pessoas que neles trabalham, em todo o território." },
  { icon: Lightbulb, title: "Inovação", text: "Modernizar a justiça com tramitação electrónica e melhor gestão da informação." },
];

const TIMELINE = [
  { year: "2010", text: "A Constituição da República consagra o Conselho como órgão de gestão e disciplina da magistratura judicial." },
  { year: "2015", text: "Primeiro plano estratégico do Conselho para a gestão dos tribunais." },
  { year: "2020", text: "Gestão processual informatizada nos tribunais da Relação." },
  { year: "2024", text: "Arranque do Projecto JURIS 5.0 para a transformação digital dos tribunais." },
  { year: "2025", text: "Tramitação electrónica nas primeiras comarcas." },
  { year: "2026", text: "Nova intranet para todos os tribunais da jurisdição comum." },
  { year: "2027", text: "Plano de formação com módulos de justiça digital." },
];

/** Percurso: cartões que reagem ao rato; com mais de 5 anos, desliza com setas. */
function Timeline() {
  const ref = useRef<HTMLOListElement>(null);
  const [edge, setEdge] = useState({ start: true, end: TIMELINE.length <= 5 });
  const scrollable = TIMELINE.length > 5;
  const update = () => { const el = ref.current; if (el) setEdge({ start: el.scrollLeft <= 2, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 2 }); };
  useEffect(() => { update(); window.addEventListener("resize", update); return () => window.removeEventListener("resize", update); }, []);
  const move = (dir: 1 | -1) => { const el = ref.current; if (!el) return; const card = el.querySelector("li"); el.scrollBy({ left: dir * ((card?.clientWidth ?? 240) + 4), behavior: "smooth" }); };
  return (
    <section aria-labelledby="historia" className="panel flex min-w-0 flex-col gap-6 p-6 md:p-10 xl:col-span-12">
      <div className="flex items-center justify-between gap-4">
        <h2 id="historia" className="panel-title">{a.history}</h2>
        {scrollable && (
          <div className="flex gap-1">
            <button type="button" className="sq-arrow tl-arrow" onClick={() => move(-1)} disabled={edge.start} aria-label={a.prev}><ChevronLeft size={20} aria-hidden /></button>
            <button type="button" className="sq-arrow tl-arrow" onClick={() => move(1)} disabled={edge.end} aria-label={a.next}><ChevronRight size={20} aria-hidden /></button>
          </div>
        )}
      </div>
      <ol ref={ref} onScroll={update} className="timeline flex snap-x snap-mandatory gap-[var(--gap)] overflow-x-auto" aria-label={a.history}>
        {TIMELINE.map((x, i) => (
          <li key={x.year} className="timeline-item group flex-none snap-start" tabIndex={0}>
            <span className={`timeline-year ${i === TIMELINE.length - 1 ? "is-next" : ""}`}>{x.year}</span>
            <p className="timeline-text">{x.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

const DOCS = [
  ["lei-organica-jc", "Lei Orgânica dos Tribunais da Jurisdição Comum", "Legislação"],
  ["regulamento-csmj", "Regulamento interno do CSMJ", "Regulamento"],
  ["lei-organica-relacao", "Lei Orgânica dos Tribunais da Relação", "Legislação"],
  ["manual-etica", "Manual do módulo de ética e deontologia", "Formação"],
] as const;

/** Sobre a instituição em blocos: cabeçalho, números, missão e visão, valores, composição e organização, história, vídeo e documentos. */
export function AboutView() {
  const href = usePersonHref();
  const [video, setVideo] = useState(false);
  const council = people.filter((p) => p.unitId === "plenario").sort((x, y) => (y.role.startsWith("Presidente") ? 1 : 0) - (x.role.startsWith("Presidente") ? 1 : 0));
  const stats = [
    { icon: Landmark, n: units.filter((u) => u.type === "relation").length, label: "Tribunais da Relação", href: "/instituicao/orgaos" },
    { icon: Scale, n: units.filter((u) => u.type === "court").length, label: "Comarcas", href: "/instituicao/orgaos" },
    { icon: Users, n: people.length, label: "Pessoas nesta intranet", href: "/pessoas" },
    { icon: Building2, n: council.length, label: "Membros do Plenário", href: "#composicao" },
  ];
  const poster = photoOf("n22");

  return (
    <div className="grid grid-cols-1 gap-[var(--gap)] xl:grid-cols-12">
      <header className="panel flex flex-col gap-2 p-6 md:px-10 md:py-8 xl:col-span-12">
        <Breadcrumbs items={[{ label: t.peoplePage.title, href: "/pessoas" }, { label: a.title }]} label={t.shell.crumbs} />
        <h1 className="text-page font-bold tracking-[-0.02em]">{a.title}</h1>
        <p className="max-w-[70ch] text-ui text-subtle">{a.tagline}</p>
      </header>

      {/* Números: faixa compacta */}
      <section aria-labelledby="numeros" className="panel flex min-w-0 flex-col gap-4 p-6 md:flex-row md:items-center md:gap-8 md:px-10 xl:col-span-12">
        <h2 id="numeros" className="panel-title flex-none md:w-40">{a.numbers}</h2>
        <ul className="grid flex-1 grid-cols-2 gap-[var(--gap)] lg:grid-cols-4">
          {stats.map(({ icon: Icon, n, label, href: h }) => (
            <li key={label}>
              <Link href={h} className="flex h-full items-center gap-4 bg-[var(--ds-color-brand-700)] px-4 py-3 text-white transition-colors hover:bg-[var(--ds-color-brand-800)]">
                <span className="text-[30px] font-semibold leading-9 tabular-nums">{n}</span>
                <span className="min-w-0 flex-1 text-label font-semibold leading-5">{label}</span>
                <Icon size={20} aria-hidden className="flex-none opacity-80" />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Missão + visão, com o mesmo destaque */}
      <section aria-labelledby="missao" className="panel flex min-w-0 flex-col gap-5 p-6 md:p-10 xl:col-span-6">
        <h2 id="missao" className="panel-title">{a.mission}</h2>
        <p className="border-l-4 border-[var(--ds-color-brand-700)] pl-5 text-[22px] font-semibold leading-8 tracking-[-0.01em] text-ink">O Conselho Superior da Magistratura Judicial é o órgão de gestão e disciplina dos magistrados judiciais.</p>
        <p className="max-w-[68ch] text-read">Garante as condições para que os tribunais da jurisdição comum funcionem com independência e qualidade: nomeia, coloca, avalia e acompanha os juízes, e define as prioridades de gestão dos tribunais.</p>
        <p className="max-w-[68ch] text-read"><b className="font-semibold text-ink">{a.attributions}:</b> {a.attributionsText.charAt(0).toLowerCase() + a.attributionsText.slice(1)}</p>
      </section>
      <section aria-labelledby="visao" className="panel flex min-w-0 flex-col gap-5 p-6 md:p-10 xl:col-span-6">
        <h2 id="visao" className="panel-title">{a.vision}</h2>
        <p className="border-l-4 border-[var(--ds-color-brand-700)] pl-5 text-[22px] font-semibold leading-8 tracking-[-0.01em] text-ink">{a.visionText}</p>
        <p className="max-w-[68ch] text-read">{a.visionMore}</p>
        <p className="max-w-[68ch] text-read">No âmbito do Projecto JURIS 5.0, o Conselho conduz a transformação digital dos tribunais: tramitação electrónica, gestão da informação e comunicação interna.</p>
      </section>

      {/* Valores + fotografia */}
      <section aria-labelledby="valores" className="panel flex min-w-0 flex-col gap-6 p-6 md:p-10 xl:col-span-8">
        <h2 id="valores" className="panel-title">{a.values}</h2>
        <ul className="grid flex-1 gap-[var(--gap)] sm:grid-cols-2">
          {VALUES.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex flex-col gap-3 border border-line p-5">
              <span className="grid h-11 w-11 place-items-center bg-[var(--ds-color-brand-700)] text-white" aria-hidden><Icon size={22} /></span>
              <h3 className="text-[19px] font-semibold leading-6 text-ink">{title}</h3>
              <p className="text-ui text-subtle">{text}</p>
            </li>
          ))}
        </ul>
      </section>
      <figure className="panel relative min-h-[320px] overflow-hidden xl:col-span-4">
        <Img id="n21" className="absolute inset-0 h-full w-full" />
        <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <figcaption className="absolute inset-x-0 bottom-0 p-6 text-[20px] font-semibold leading-7 text-white md:p-8">«{a.quote}»</figcaption>
      </figure>

      {/* Composição + organização */}
      <section aria-labelledby="composicao" className="panel flex min-w-0 scroll-mt-4 flex-col gap-5 p-6 md:p-10 xl:col-span-7">
        <h2 id="composicao" className="panel-title">{a.composition}</h2>
        <p className="max-w-[68ch] text-ui text-subtle">{a.compositionLead}</p>
        <ul className="grid gap-[var(--gap)] sm:grid-cols-2">
          {council.map((p, i) => (
            <li key={p.id} className={i === 0 ? "sm:col-span-2" : ""}>
              <Link href={href(p.slug)} scroll={false} className={`row-link flex h-full items-center gap-4 border p-5 ${i === 0 ? "border-[var(--ds-color-brand-700)] border-l-4" : "border-line"}`}>
                <Avatar initials={p.initials} />
                <span className="min-w-0"><span className="row-title block text-[17px] font-semibold text-ink">{p.name}</span><span className="text-label text-subtle">{p.role}</span></span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-auto bg-surface-2 p-5">
          <h3 className="font-semibold text-ink">{a.plenaryTitle}</h3>
          <p className="mt-1 text-ui text-subtle">{a.plenaryText}</p>
        </div>
      </section>
      <section aria-labelledby="organizacao" className="panel flex min-w-0 flex-col gap-5 p-6 md:p-10 xl:col-span-5">
        <h2 id="organizacao" className="panel-title">{a.organisation}</h2>
        <ol className="flex flex-col" aria-label={a.structure}>
          {[
            { icon: Landmark, title: "Plenário", text: "Decide sobre a gestão e a disciplina dos juízes." },
            { icon: Building2, title: "Secretaria-Geral", text: "Apoia o Plenário e coordena os serviços." },
            { icon: Network, title: "Direcções", text: "Recursos Humanos e Tecnologias de Informação." },
            { icon: ShieldCheck, title: "Tribunais", text: "Tribunais da Relação e comarcas da jurisdição comum." },
          ].map(({ icon: Icon, title, text }, i, arr) => (
            <li key={title} className="relative flex gap-4 pb-5 last:pb-0">
              {i < arr.length - 1 && <span aria-hidden className="absolute left-[21px] top-11 h-[calc(100%-44px)] w-0.5 bg-[var(--ds-border-default)]" />}
              <span className="grid h-11 w-11 flex-none place-items-center border-2 border-[var(--ds-color-brand-700)] bg-surface text-brand" aria-hidden><Icon size={20} /></span>
              <span className="pt-1"><b className="block font-semibold text-ink">{title}</b><span className="text-ui text-subtle">{text}</span></span>
            </li>
          ))}
        </ol>
        <div className="mt-auto flex flex-wrap gap-2 border-t border-line pt-5">
          <Link href="/pessoas/organograma" className="btn btn-pri">{t.org.title}</Link>
          <Link href="/instituicao/orgaos" className="btn btn-sec">{t.organs.title}</Link>
        </div>
      </section>

      {/* Percurso */}
      <Timeline />

      {/* Vídeo + documentos */}
      <section aria-labelledby="video" className="panel flex min-w-0 flex-col gap-5 p-6 md:p-10 xl:col-span-7">
        <h2 id="video" className="panel-title">{a.video}</h2>
        <button type="button" onClick={() => setVideo(true)} className="group relative block flex-1 overflow-hidden bg-surface-2 text-left" aria-label={t.news.playVideo(a.videoTitle)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {poster && <img src={poster.src} alt="" className="aspect-video h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />}
          <span aria-hidden className="absolute inset-0 bg-black/35" />
          <span className="absolute inset-0 grid place-items-center"><span className="grid h-16 w-16 place-items-center bg-[var(--ds-color-brand-700)] text-white transition-transform group-hover:scale-110"><Play size={28} aria-hidden /></span></span>
          <span className="absolute bottom-0 left-0 bg-black/70 px-3 py-1.5 text-label font-semibold text-white">{a.videoTitle} · 3:05</span>
        </button>
      </section>
      <section aria-labelledby="documentos" className="panel flex min-w-0 flex-col gap-5 p-6 md:p-10 xl:col-span-5">
        <h2 id="documentos" className="panel-title">{a.docs}</h2>
        <ul className="flex flex-col gap-[var(--gap)]">
          {DOCS.map(([id, title, kind]) => (
            <li key={id}>
              <Link href={`/documentos/ficheiro/${id}`} className="group flex items-center gap-4 border border-line p-5 hover:border-[var(--ds-color-brand-700)]">
                <span className="grid h-11 w-11 flex-none place-items-center bg-[var(--ds-color-brand-700)] text-white" aria-hidden><FileText size={20} /></span>
                <span className="min-w-0 flex-1"><span className="block text-caption font-semibold uppercase tracking-[0.06em] text-subtle">{kind}</span><span className="block font-semibold text-ink group-hover:underline">{title}</span></span>
                <ArrowUpRight size={20} aria-hidden className="flex-none text-brand" />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <Dialog open={video} onClose={() => setVideo(false)} title={a.videoTitle} actions={<Button variant="sec" onClick={() => setVideo(false)}>{t.common.close}</Button>}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {poster && <img src={poster.src} alt="" className="mb-3 aspect-video w-full object-cover" />}
        <p>{t.news.videoNote}</p>
      </Dialog>
      <PersonSheet />
    </div>
  );
}
