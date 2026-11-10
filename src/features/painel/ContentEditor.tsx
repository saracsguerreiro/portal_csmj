"use client";

import { ArrowLeft, Bot, Check, ChevronDown, Eye, History, Lock, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { AdminEvent, AdminNews, AdminNotice } from "@/data/content";
import { people } from "@/data/people";
import { units } from "@/data/units";
import { Alert, Button, ConfirmDialog, Dialog, LoadError, Progress, Radio, ScopeTag, Segmented, SelectField, Sheet, Switch, Tabs, TextArea, TextField, TreeSelect, useToast, type TreeNode } from "@/design-system";
import { BlockRetry } from "@/features/home/BlockRetry";
import { postAdmin } from "@/features/shell/client-api";
import { t } from "@/i18n";
import { asset } from "@/lib/assets";
import { getContent, reach, type Kind } from "@/lib/api-painel";
import { useSession, useVersion } from "@/lib/client";
import { dateShort, timeOf } from "@/lib/format";
import { sanitize } from "@/lib/sanitize";
import { scopeKind, scopeLabel } from "@/lib/scope";
import { useQuery } from "@/lib/use-query";
import { AdminPage, downloadCsv, editHref, publicHref } from "./parts";
import { RichEditor, blocksToHtml } from "./RichEditor";

const A = t.admin;
const E = A.editor;
const COVERS = [
  ["colunata", "Ilustração das colunas de um edifício judicial"], ["livros", "Ilustração de livros de direito numa estante"], ["balcao", "Ilustração de um balcão de atendimento ao público"],
  ["rede", "Ilustração de pontos ligados em rede"], ["tramitacao", "Ilustração de documentos em circulação entre secções"], ["plenario", "Ilustração de uma sala de plenário com bancada"], ["mapa", "Ilustração do mapa de Angola"],
] as const;
const KNOWN_TAGS = ["Institucional", "Formação", "Atendimento", "Tecnologia", "Recursos Humanos", "Inspecção", "Comarcas"];
const strip = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
const datePart = (iso?: string) => (iso ? iso.slice(0, 10) : "");
const timePart = (iso?: string) => (iso ? iso.slice(11, 16) : "");
const compose = (d: string, tm: string) => (d ? `${d}T${tm || "09:00"}:00+01:00` : "");

type Form = {
  title: string; summary: string; html: string; cover: string; coverAlt: string; focus: string; tags: string[]; scopes: string[]; featured: boolean; comments: boolean;
  when: "now" | "later"; schedDate: string; schedTime: string;
  startDate: string; startTime: string; endDate: string; endTime: string; allDay: boolean; repeat: string; mode: "presencial" | "online" | "hibrido"; place: string; link: string;
  withSignup: boolean; capacity: string; deadline: string; approval: boolean; waitlist: string; showGoing: boolean; reminder: boolean;
  number: string; noticeKind: "aviso" | "circular"; body: string; requireConfirm: boolean; blockPortal: boolean; reminderDays: string; escalateDays: string; endsAt: string;
};

function formOf(kind: Kind, x?: AdminNews | AdminEvent | AdminNotice): Form {
  const n = x as AdminNews | undefined, e = x as AdminEvent | undefined, a = x as AdminNotice | undefined;
  return {
    title: x?.title ?? "", summary: n?.summary ?? "", html: kind === "noticias" ? (n?.html ?? blocksToHtml(n?.body)) : "", cover: n?.cover ?? asset("/covers/colunata.svg"), coverAlt: n?.coverAlt ?? "", focus: "Centro",
    tags: (x && "tags" in x ? x.tags : []) ?? [], scopes: x?.scopes ?? ["nacional"], featured: x?.meta.featured ?? false, comments: x?.meta.comments ?? true,
    when: x?.meta.status === "agendado" ? "later" : "now", schedDate: datePart(x?.meta.scheduledAt) || "2026-11-12", schedTime: timePart(x?.meta.scheduledAt) || "09:00",
    startDate: datePart(e?.startsAt) || "2026-11-20", startTime: timePart(e?.startsAt) || "09:00", endDate: datePart(e?.endsAt) || datePart(e?.startsAt) || "2026-11-20", endTime: timePart(e?.endsAt) || "12:00",
    allDay: false, repeat: E.repeatOpts[0], mode: e?.mode ?? "presencial", place: e?.place ?? "", link: "", withSignup: !!e?.capacity || !!e?.deadline, capacity: e?.capacity ? String(e.capacity) : "", deadline: datePart(e?.deadline),
    approval: !!e?.needsApproval, waitlist: E.waitlistOpts[0], showGoing: e?.showAttendees ?? true, reminder: e?.reminder ?? true,
    number: a?.number ?? "", noticeKind: a?.kind ?? "aviso", body: kind === "avisos" ? (a?.body ?? []).join("\n\n") : kind === "eventos" ? (e?.description ?? []).join("\n\n") : "",
    requireConfirm: a?.requireConfirm ?? true, blockPortal: a?.blockPortal ?? false, reminderDays: String(a?.reminderDays ?? 3), escalateDays: String(a?.escalateDays ?? 7), endsAt: datePart(a?.endsAt),
  };
}

function dataOf(kind: Kind, f: Form): Record<string, unknown> {
  const common = { title: f.title.trim(), scopes: f.scopes, meta: { featured: f.featured, comments: f.comments } };
  if (kind === "noticias") return { ...common, summary: f.summary.trim(), html: f.html, body: undefined, cover: f.cover, coverAlt: f.coverAlt.trim(), tags: f.tags };
  const paras = f.body.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  if (kind === "eventos") return { ...common, tags: f.tags, description: paras, mode: f.mode, place: f.place || undefined, startsAt: compose(f.startDate, f.allDay ? "09:00" : f.startTime), endsAt: compose(f.endDate || f.startDate, f.allDay ? "18:00" : f.endTime),
    capacity: f.withSignup && f.capacity ? Number(f.capacity) : undefined, deadline: f.withSignup && f.deadline ? compose(f.deadline, "18:00") : undefined, needsApproval: f.withSignup && f.approval, showAttendees: f.showGoing, reminder: f.reminder };
  return { ...common, number: f.number.trim() || undefined, kind: f.noticeKind, body: paras, requireConfirm: f.requireConfirm, blockPortal: f.requireConfirm && f.blockPortal, reminderDays: Number(f.reminderDays) || 3, escalateDays: Number(f.escalateDays) || 7, endsAt: f.endsAt ? compose(f.endsAt, "23:59") : undefined };
}

function unitTree(allowed: (id: string) => boolean): TreeNode[] {
  const kids = (pid: string): TreeNode[] => units.filter((u) => u.parentId === pid).map((u) => ({ id: u.id, label: u.short, children: kids(u.id) })).filter((n) => allowed(n.id) || n.children!.length).map((n) => (n.children!.length ? n : { id: n.id, label: n.label }));
  return kids("nacional");
}

function Card({ title, children, id }: { title: string; children: ReactNode; id?: string }) {
  return (
    <section aria-labelledby={id ? `${id}-t` : undefined} className="card flex flex-col gap-4 !p-5">
      <h2 id={id ? `${id}-t` : undefined} className="text-[16px] font-semibold leading-6">{title}</h2>
      {children}
    </section>
  );
}

type Suggestion = { action: keyof typeof E.aiActions; text: string; options?: string[] };

export function ContentEditor({ kind }: { kind: Kind }) {
  const s = useSession();
  const q = useQuery();
  const router = useRouter();
  const toast = useToast();
  const id = q.id;
  const v = useVersion();
  const loaded = useMemo(() => (id ? getContent(s, kind, id) : null), [id, kind, v]); // eslint-disable-line react-hooks/exhaustive-deps
  const item = loaded?.item;
  const [f, setF] = useState<Form>(() => formOf(kind, item));
  const [dirty, setDirty] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(item ? Date.now() : null);
  const [, tick] = useState(0);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<{ field: string; msg: string }[]>([]);
  const [menu, setMenu] = useState(false);
  const [preview, setPreview] = useState(false);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [leave, setLeave] = useState<string | null>(null);
  const [returning, setReturning] = useState(false);
  const [returnText, setReturnText] = useState("");
  const [versionDlg, setVersionDlg] = useState(false);
  const [asked, setAsked] = useState(false);
  const [ai, setAi] = useState<Suggestion | null>(null);
  const [aiBusy, setAiBusy] = useState(false);
  const [aiUsed, setAiUsed] = useState(false);
  const [tagText, setTagText] = useState("");
  const [tab, setTab] = useState(q.separador === "inscritos" || q.separador === "confirmacoes" ? q.separador : "conteudo");
  const [whoTab, setWhoTab] = useState<"missing" | "confirmed">("missing");
  const statusNow = item?.meta.status ?? "rascunho";
  const locked = !!loaded?.lockedBy;
  const readOnly = locked || (!!item && !loaded?.editable);
  const canPub = kind === "avisos" ? s.can("notice.publish") : s.can("content.publish");
  const national = s.can("content.publish") || s.can("notice.publish");
  const back = `/painel/${kind}`;

  const set = <K extends keyof Form>(k: K, v: Form[K]) => { setF((p) => ({ ...p, [k]: v })); setDirty(true); };

  useEffect(() => { const i = setInterval(() => tick((n) => n + 1), 1000); return () => clearInterval(i); }, []);
  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  const save = async (intent: "draft" | "publish" | "request" | "schedule", opts: { silent?: boolean; newVersion?: boolean } = {}) => {
    const errs: { field: string; msg: string }[] = [];
    if (!f.title.trim()) errs.push({ field: "f-title", msg: E.titleRequired });
    if (intent !== "draft") {
      if (kind === "noticias" && !f.coverAlt.trim()) errs.push({ field: "f-alt", msg: E.coverAltRequired });
      if (kind === "noticias" && !strip(f.html)) errs.push({ field: "f-body", msg: "Escreva o texto da notícia." });
      if (kind !== "noticias" && !f.body.trim()) errs.push({ field: "f-body", msg: kind === "avisos" ? "Escreva o texto do aviso." : "Escreva a descrição do evento." });
      if (kind === "eventos" && f.mode !== "online" && !f.place.trim()) errs.push({ field: "f-place", msg: "Indique o local." });
      if (kind === "eventos" && compose(f.endDate || f.startDate, f.endTime) < compose(f.startDate, f.startTime)) errs.push({ field: "f-end", msg: "O fim tem de ser depois do início." });
      if (!f.scopes.length) errs.push({ field: "f-scope", msg: "Escolha para quem é." });
    }
    if (errs.length) { if (!opts.silent) { setErrors(errs); requestAnimationFrame(() => document.getElementById("erros")?.focus()); } return; }
    setErrors([]);
    if (intent === "publish" && kind === "avisos" && statusNow === "publicado" && !opts.newVersion && item) {
      const old = item as AdminNotice;
      if (old.title !== f.title.trim() || old.body.join("\n\n") !== f.body.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean).join("\n\n")) { setVersionDlg(true); return; }
    }
    setBusy(!opts.silent);
    try {
      const r = await postAdmin<{ id: string; status: string; slug: string }>({ action: "content.save", kind, id, data: dataOf(kind, f) as never, intent, scheduledAt: intent === "schedule" ? compose(f.schedDate, f.schedTime) : undefined, aiAssisted: aiUsed, newVersion: opts.newVersion });
      setDirty(false);
      setSavedAt(Date.now());
      if (!opts.silent) {
        const msg = intent === "publish" ? E.published[kind] : intent === "request" ? E.requested : intent === "schedule" ? E.scheduledMsg(`${dateShort(compose(f.schedDate, f.schedTime))} ${timeOf(compose(f.schedDate, f.schedTime))}`) : E.draftSaved;
        toast.show({ message: msg });
      }
      if (!id) router.replace(editHref(kind, r.id));
      else if (intent !== "draft") router.refresh();
    } catch (e) { if (!opts.silent) toast.show({ message: (e as Error).message }); }
    finally { setBusy(false); }
  };

  /* Gravação automática a cada 10 s, só para rascunhos */
  const saveRef = useRef(save);
  saveRef.current = save;
  useEffect(() => {
    if (readOnly) return;
    const i = setInterval(() => { if (dirty && (statusNow === "rascunho") && f.title.trim()) void saveRef.current("draft", { silent: true }); }, 10000);
    return () => clearInterval(i);
  }, [dirty, readOnly, statusNow, f.title]);

  const status = async (st: "despublicado" | "lixeira") => {
    if (!id) return;
    try { await postAdmin({ action: "content.status", kind, ids: [id], status: st }); toast.show({ message: st === "lixeira" ? E.trashed : E.unpublished }); setDirty(false); router.push(back); }
    catch (e) { toast.show({ message: (e as Error).message }); }
  };

  const go = (href: string) => (dirty ? setLeave(href) : router.push(href));

  /* Ajudas da IA: a sugestão aparece ao lado e só entra no texto com "Usar". */
  const suggest = (action: Suggestion["action"]) => {
    setAiBusy(true); setAi(null);
    setTimeout(() => {
      const text = strip(f.html || f.body);
      const first = text.split(/(?<=[.!?])\s/).slice(0, 2).join(" ");
      const coverName = COVERS.find(([c]) => f.cover.includes(c));
      const map: Record<Suggestion["action"], Suggestion> = {
        summarize: { action, text: (first || f.title).slice(0, 200) },
        titles: { action, text: "", options: [f.title, `${f.title}: o que muda`, f.title.split(" ").slice(0, 6).join(" ")].filter((v, i, a) => v && a.indexOf(v) === i) },
        tags: { action, text: "", options: KNOWN_TAGS.filter((tg) => normal(text + " " + f.title).includes(normal(tg).slice(0, 6)) && !f.tags.includes(tg)).concat(f.tags.length ? [] : ["Institucional"]).slice(0, 3) },
        fix: { action, text: "Não encontrei erros de ortografia. Corrigi 2 espaços duplicados e 1 vírgula antes de «e»." },
        formal: { action, text: `Informa-se que ${(f.summary || first).replace(/^./, (c) => c.toLowerCase())}` },
        close: { action, text: `Fique a saber: ${f.summary || first}` },
        translate: { action, text: `Vai ser criado um rascunho em inglês de «${f.title}», para rever antes de publicar.` },
        alt: { action, text: coverName ? coverName[1] : "Ilustração vectorial da capa" },
      };
      setAi(map[action]);
      setAiBusy(false);
    }, 700);
  };
  const useSuggestion = async (choice?: string) => {
    if (!ai) return;
    setAiUsed(true);
    if (ai.action === "summarize" || ai.action === "formal" || ai.action === "close") kind === "noticias" ? set("summary", ai.text.slice(0, 200)) : set("body", `${ai.text}\n\n${f.body}`);
    if (ai.action === "titles" && choice) set("title", choice);
    if (ai.action === "tags") set("tags", [...f.tags, ...(choice ? [choice] : ai.options ?? [])].filter((v, i, a) => a.indexOf(v) === i));
    if (ai.action === "fix") set("html", f.html.replace(/ {2,}/g, " ").replace(/&nbsp;&nbsp;/g, "&nbsp;"));
    if (ai.action === "alt") set("coverAlt", ai.text);
    if (ai.action === "translate" && id) { await postAdmin({ action: "content.translate", kind, id }); toast.show({ message: A.list.done.translate }); }
    setAi(null);
  };

  if (id && !loaded) return <AdminPage title={A.list.titles[kind]}><LoadError what={A.list.what}><BlockRetry /></LoadError></AdminPage>;

  const tree = unitTree((uid) => national || s.myUnits.some((u) => u.id === uid || units.find((x) => x.id === uid)?.parentId === u.id));
  const isNational = f.scopes.includes("nacional");
  const people_ = reach(f.scopes);
  const savedSecs = savedAt ? Math.round((Date.now() - savedAt) / 1000) : null;
  const statusLine = <span className="text-ui text-subtle" aria-live="polite">{A.status[statusNow]} · {dirty ? E.unsaved : savedSecs != null ? E.savedAgo(savedSecs) : E.unsaved}</span>;
  const err = (field: string) => errors.find((x) => x.field === field)?.msg;
  const titleCount = f.title.length;
  const waitingReview = canPub && statusNow === "espera" && item?.meta.authorId !== s.person.id;
  const tabs = kind === "eventos" && item ? [{ id: "conteudo", label: E.tabEdit }, { id: "inscritos", label: `${E.tabAttendees} (${loaded?.attendees?.going.length ?? 0})` }]
    : kind === "avisos" && item && (item as AdminNotice).requireConfirm && statusNow === "publicado" ? [{ id: "conteudo", label: E.tabEdit }, { id: "confirmacoes", label: E.tabConfirmations }] : null;

  const primary = canPub
    ? <Button variant="pri" loading={busy} disabled={readOnly} onClick={() => void save(f.when === "later" ? "schedule" : "publish")}>{f.when === "later" ? E.schedule : E.publish}</Button>
    : <Button variant="pri" loading={busy} disabled={readOnly || statusNow === "espera"} onClick={() => void save("request")}>{E.requestPublish}</Button>;

  return (
    <div className="flex min-h-full flex-col">
      {/* Barra de acções fixa */}
      <div className="sticky top-[66px] z-20 border-b border-line bg-surface">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 md:px-6 xl:px-8">
          <button type="button" className="icbtn" aria-label={`${E.back}: ${A.list.titles[kind]}`} title={E.back} onClick={() => go(back)}><ArrowLeft size={20} aria-hidden /></button>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate font-semibold">{f.title || E.newTitle[kind]}</span>
            {statusLine}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="gh" icon={<Eye size={18} aria-hidden />} onClick={() => setPreview(true)}><span className="max-sm:sr-only">{E.preview}</span></Button>
            {!readOnly && statusNow !== "publicado" && <Button className="max-sm:hidden" onClick={() => void save("draft")} disabled={busy}>{E.saveDraft}</Button>}
            {waitingReview && <Button onClick={() => setReturning(true)}>{E.returnIt}</Button>}
            {primary}
            {item && (
              <div className="relative">
                <button type="button" className="icbtn" aria-label={E.more} title={E.more} aria-haspopup="menu" aria-expanded={menu} onClick={() => setMenu((m) => !m)}><ChevronDown size={20} aria-hidden /></button>
                {menu && (
                  <div role="menu" className="menu absolute right-0 top-full z-30 mt-1 w-60" onKeyDown={(e) => e.key === "Escape" && setMenu(false)}>
                    {!readOnly && statusNow !== "publicado" && <button type="button" role="menuitem" className="menu-item sm:hidden" onClick={() => { setMenu(false); void save("draft"); }}>{E.saveDraft}</button>}
                    {statusNow === "publicado" && <Link role="menuitem" className="menu-item" href={publicHref(kind, (item as AdminNews).slug ?? item.id)}>{A.list.row.view}</Link>}
                    <button type="button" role="menuitem" className="menu-item" onClick={() => { setMenu(false); void postAdmin({ action: "content.duplicate", kind, id: item.id }).then(() => toast.show({ message: A.list.done.duplicate })); }}>{E.duplicate}</button>
                    {canPub && statusNow === "publicado" && <button type="button" role="menuitem" className="menu-item" onClick={() => { setMenu(false); void status("despublicado"); }}>{E.unpublish}</button>}
                    {loaded?.editable && !(kind === "avisos" && (item as AdminNotice).confirmedBy.length) && <button type="button" role="menuitem" className="menu-item text-[var(--ds-status-err-fg)]" onClick={() => { setMenu(false); void status("lixeira"); }}>{E.trash}</button>}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-5 px-4 py-6 md:px-6 xl:px-8">
        {locked && (
          <div className="flex flex-wrap items-center gap-3 rounded-[16px] border border-line-strong bg-surface-2 p-4">
            <Lock size={20} aria-hidden className="flex-none" />
            <div className="min-w-0 flex-1"><p className="font-semibold">{E.lockTitle(loaded!.lockedBy!)}</p><p className="text-ui text-subtle">{E.lockBody}</p></div>
            <Button size="sm" disabled={asked} onClick={() => { setAsked(true); toast.show({ message: E.lockAsked(loaded!.lockedBy!) }); }}>{asked ? E.lockAsked(loaded!.lockedBy!) : E.lockAsk}</Button>
          </div>
        )}
        {item?.meta.returnedComment && statusNow === "rascunho" && <Alert tone="warn" title={E.returnedBanner(item.meta.returnedComment)} />}
        {errors.length > 0 && (
          <div id="erros" tabIndex={-1} className="outline-none">
            <Alert tone="err" title={E.errorsTitle(errors.length)}>
              <ul className="mt-1 list-disc pl-5">{errors.map((x) => <li key={x.field}><a className="link inline-block py-1" href={`#${x.field}`}>{x.msg}</a></li>)}</ul>
            </Alert>
          </div>
        )}
        {tabs && <Tabs label={E.tabEdit} tabs={tabs} value={tab} onChange={setTab} />}

        {tab === "inscritos" && loaded?.attendees ? <Attendees kind={kind} id={item!.id} data={loaded.attendees} title={f.title} /> :
         tab === "confirmacoes" && loaded?.notice ? (
          <section className="card flex flex-col gap-4">
            <Progress value={loaded.notice.pct} label={E.progress(loaded.notice.confirmed.length, loaded.notice.total)} />
            <div className="flex flex-wrap gap-2">
              <Button variant="pri" onClick={() => void postAdmin<{ sent: number }>({ action: "notice.remind", id: item!.id }).then((r) => toast.show({ message: E.reminded(r.sent) }))}>{E.remindNow}</Button>
              <Button onClick={() => { downloadCsv("confirmacoes.csv", [["Nome", "Unidade", "Estado", "Data"], ...loaded.notice!.confirmed.map((c) => [c.name, c.unit, "Confirmou", c.at]), ...loaded.notice!.missing.map((m) => [m.name, m.unit, "Falta", ""])]); toast.show({ message: A.list.exported }); }}>{E.exportList}</Button>
            </div>
            <Segmented legend={E.tabConfirmations} value={whoTab} onChange={setWhoTab} options={[{ value: "missing", label: `${E.missingTab} (${loaded.notice.missing.length})` }, { value: "confirmed", label: `${E.confirmedTab} (${loaded.notice.confirmed.length})` }]} />
            <ul className="divide-y divide-[var(--ds-border-subtle)]">
              {(whoTab === "missing" ? loaded.notice.missing.map((m) => ({ k: m.id, name: m.name, unit: m.unit, at: "" })) : loaded.notice.confirmed.map((c, i) => ({ k: `${c.name}${i}`, name: c.name, unit: c.unit, at: c.at }))).map((r) => (
                <li key={r.k} className="flex flex-wrap justify-between gap-2 py-2.5"><span>{r.name}</span><span className="text-ui text-subtle">{r.unit}{r.at ? ` · ${r.at}` : ""}</span></li>
              ))}
            </ul>
          </section>
        ) : (
        <fieldset disabled={readOnly} className="m-0 grid min-w-0 grid-cols-1 gap-5 border-0 p-0 lg:grid-cols-[minmax(0,1fr)_380px]">
          <legend className="sr-only">{f.title || E.newTitle[kind]}</legend>
          {/* Coluna principal */}
          <div className="flex min-w-0 flex-col gap-5">
            <section className="card flex flex-col gap-5">
              {kind === "avisos" && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-[200px_1fr]">
                  <SelectField label={E.kind} value={f.noticeKind} onChange={(e) => set("noticeKind", e.target.value as Form["noticeKind"])} options={[{ value: "aviso", label: E.kinds.aviso }, { value: "circular", label: E.kinds.circular }]} />
                  <TextField label={E.number} hint={E.numberHint} value={f.number} onChange={(e) => set("number", e.target.value)} />
                </div>
              )}
              <TextField id="f-title" label={E.title} required value={f.title} onChange={(e) => set("title", e.target.value)} error={err("f-title")}
                hint={titleCount > 90 ? E.titleLong : E.titleHint(titleCount)} className="[&_.inp]:!text-[20px] [&_.inp]:!font-semibold" />
              {kind === "noticias" && <TextArea label={E.summary} value={f.summary} maxLength={200} rows={2} onChange={(e) => set("summary", e.target.value)} hint={E.summaryHint(f.summary.length)} />}
              <div id="f-body">
                {kind === "noticias"
                  ? <RichEditor label={E.body} hint={err("f-body") ?? E.bodyHint} value={f.html} onChange={(v) => set("html", v)} disabled={readOnly} />
                  : <TextArea label={kind === "avisos" ? E.body : "Descrição"} rows={9} value={f.body} onChange={(e) => set("body", e.target.value)} error={err("f-body")} hint="Separe os parágrafos com uma linha em branco." />}
              </div>
            </section>

            {kind === "eventos" && (
              <>
                <Card title={E.when2} id="quando">
                  <Switch checked={f.allDay} onChange={(e) => set("allDay", e.target.checked)}>{E.allDay}</Switch>
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <TextField type="date" label={E.start} value={f.startDate} onChange={(e) => set("startDate", e.target.value)} />
                    {!f.allDay && <TextField type="time" label="Hora de início" value={f.startTime} onChange={(e) => set("startTime", e.target.value)} />}
                    <TextField id="f-end" type="date" label={E.end} value={f.endDate} min={f.startDate} onChange={(e) => set("endDate", e.target.value)} error={err("f-end")} />
                    {!f.allDay && <TextField type="time" label="Hora de fim" value={f.endTime} onChange={(e) => set("endTime", e.target.value)} />}
                  </div>
                  <SelectField label={E.repeat} value={f.repeat} onChange={(e) => set("repeat", e.target.value)} options={E.repeatOpts.map((o) => ({ value: o, label: o }))} />
                  {item && <p className="text-ui text-subtle">{E.changeNotice}</p>}
                </Card>
                <Card title={E.where} id="onde">
                  <Segmented legend={E.mode} value={f.mode} onChange={(v) => set("mode", v)} options={[{ value: "presencial", label: "Presencial" }, { value: "online", label: "Online" }, { value: "hibrido", label: "Híbrido" }]} />
                  {f.mode !== "online" && <TextField id="f-place" label={E.place} required value={f.place} onChange={(e) => set("place", e.target.value)} error={err("f-place")} />}
                  {f.mode !== "presencial" && <TextField label={E.link} type="url" value={f.link} placeholder="https://" onChange={(e) => set("link", e.target.value)} />}
                </Card>
                <Card title={E.signups} id="inscricoes">
                  <Switch checked={f.withSignup} onChange={(e) => set("withSignup", e.target.checked)}>{E.withSignup}</Switch>
                  {f.withSignup && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <TextField label={E.capacity} type="number" min={1} value={f.capacity} onChange={(e) => set("capacity", e.target.value)} />
                        <TextField label={E.deadline} type="date" value={f.deadline} max={f.startDate} onChange={(e) => set("deadline", e.target.value)} />
                      </div>
                      <Switch checked={f.approval} onChange={(e) => set("approval", e.target.checked)}>{E.approval}</Switch>
                      <SelectField label={E.waitlist} value={f.waitlist} onChange={(e) => set("waitlist", e.target.value)} options={E.waitlistOpts.map((o) => ({ value: o, label: o }))} />
                      <Switch checked={f.showGoing} onChange={(e) => set("showGoing", e.target.checked)}>{E.showGoing}</Switch>
                    </>
                  )}
                </Card>
                <Card title={E.reminders} id="lembretes">
                  <Switch checked={f.reminder} onChange={(e) => set("reminder", e.target.checked)}>{E.eveReminder}</Switch>
                  <p className="text-ui text-subtle">{E.changeNotice}</p>
                </Card>
              </>
            )}

            {kind === "avisos" && (
              <Card title={E.confirmation} id="confirmacao">
                <Switch checked={f.requireConfirm} onChange={(e) => set("requireConfirm", e.target.checked)}>{E.requireConfirm}</Switch>
                {f.requireConfirm && (
                  <>
                    <Switch checked={f.blockPortal} onChange={(e) => set("blockPortal", e.target.checked)}>{E.block}</Switch>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <TextField label={E.remindEvery} type="number" min={1} value={f.reminderDays} onChange={(e) => set("reminderDays", e.target.value)} />
                      <TextField label={E.escalateAfter} type="number" min={1} value={f.escalateDays} onChange={(e) => set("escalateDays", e.target.value)} />
                      <TextField label={E.endDate} type="date" value={f.endsAt} onChange={(e) => set("endsAt", e.target.value)} />
                    </div>
                  </>
                )}
              </Card>
            )}
          </div>

          {/* Coluna lateral */}
          <aside className="flex min-w-0 flex-col gap-5" aria-label="Definições">
            <Card title={E.publication} id="publicacao">
              <div id="f-scope" className="flex flex-col gap-2">
                <fieldset className="flex flex-col gap-2 border-0 p-0">
                  <legend className="field-label mb-1.5">{E.forWhom}</legend>
                  <Radio name="scope" checked={isNational} disabled={!national} onChange={() => set("scopes", ["nacional"])}>{E.national}</Radio>
                  <Radio name="scope" checked={!isNational} onChange={() => set("scopes", f.scopes.filter((x) => x !== "nacional").length ? f.scopes.filter((x) => x !== "nacional") : [s.unit.id === "nacional" ? "secretaria" : s.unit.id])}>{E.onlyUnits}</Radio>
                  {!national && <p className="field-hint">{E.nationalOnlyFor}</p>}
                </fieldset>
                {!isNational && <div className="max-h-[260px] overflow-auto rounded-[12px] border border-line p-2"><TreeSelect label="Unidades" nodes={tree} value={f.scopes} onChange={(v) => set("scopes", v)} /></div>}
                {err("f-scope") && <p className="field-err">{err("f-scope")}</p>}
                <p className="flex items-center gap-2 text-ui"><ScopeTag kind={scopeKind({ scopes: f.scopes })}>{scopeLabel({ scopes: f.scopes.length ? f.scopes : ["nacional"] })}</ScopeTag><span className="text-subtle">{people_} pessoas abrangidas</span></p>
              </div>
              {canPub && statusNow !== "publicado" && (
                <fieldset className="flex flex-col gap-2 border-0 p-0">
                  <legend className="field-label mb-1.5">{E.when}</legend>
                  <Segmented legend={E.when} value={f.when} onChange={(v) => set("when", v)} options={[{ value: "now", label: E.now }, { value: "later", label: E.later }]} />
                  {f.when === "later" && <div className="grid grid-cols-2 gap-3"><TextField type="date" label="Data" min="2026-11-10" value={f.schedDate} onChange={(e) => set("schedDate", e.target.value)} /><TextField type="time" label="Hora" value={f.schedTime} onChange={(e) => set("schedTime", e.target.value)} /></div>}
                </fieldset>
              )}
              {kind !== "avisos" && <Switch checked={f.featured} onChange={(e) => set("featured", e.target.checked)}>{E.featured}</Switch>}
              {kind === "noticias" && <Switch checked={f.comments} onChange={(e) => set("comments", e.target.checked)}>{E.comments}</Switch>}
            </Card>

            {kind === "noticias" && (
              <Card title={E.cover} id="capa">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={f.cover} alt="" className="aspect-[16/9] w-full rounded-[12px] border border-line object-cover" style={{ objectPosition: f.focus === "Topo" ? "top" : f.focus === "Fundo" ? "bottom" : "center" }} />
                <fieldset className="border-0 p-0">
                  <legend className="field-label mb-1.5">{E.chooseCover}</legend>
                  <div className="grid grid-cols-4 gap-2">
                    {COVERS.map(([c, label]) => {
                      const src = asset(`/covers/${c}.svg`);
                      return (
                        <label key={c} className={`relative cursor-pointer overflow-hidden rounded-[8px] border-2 ${f.cover === src ? "border-[var(--ds-border-brand)]" : "border-transparent"}`}>
                          <input type="radio" name="cover" className="sr-only" checked={f.cover === src} onChange={() => set("cover", src)} aria-label={label} />
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={src} alt="" className="aspect-[4/3] w-full object-cover" />
                          {f.cover === src && <span className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-[var(--ds-brand-background-default)] text-[var(--ds-brand-content)]"><Check size={12} aria-hidden /></span>}
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
                <TextField id="f-alt" label={E.coverAlt} required value={f.coverAlt} onChange={(e) => set("coverAlt", e.target.value)} hint={E.coverAltHint} error={err("f-alt")} />
                <Segmented legend={E.focus} value={f.focus} onChange={(v) => set("focus", v)} options={E.focusOpts.map((o) => ({ value: o, label: o }))} />
              </Card>
            )}

            {kind !== "avisos" && (
              <Card title={E.tags} id="etiquetas">
                {f.tags.length > 0 && (
                  <ul className="flex flex-wrap gap-2">
                    {f.tags.map((tg) => <li key={tg} className="fchip">{tg}<button type="button" className="icbtn !h-6 !w-6" aria-label={`Retirar ${tg}`} onClick={() => set("tags", f.tags.filter((x) => x !== tg))}>×</button></li>)}
                  </ul>
                )}
                <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); const v = tagText.trim(); if (v && !f.tags.includes(v)) set("tags", [...f.tags, v]); setTagText(""); }}>
                  <TextField label={E.addTag} className="flex-1" list="known-tags" value={tagText} onChange={(e) => setTagText(e.target.value)} />
                  <datalist id="known-tags">{KNOWN_TAGS.filter((x) => !f.tags.includes(x)).map((x) => <option key={x} value={x} />)}</datalist>
                  <Button type="submit" className="self-end">{tagText.trim() && !KNOWN_TAGS.includes(tagText.trim()) ? E.newTag(tagText.trim()) : E.addTag.split(" ")[0]}</Button>
                </form>
              </Card>
            )}

            {kind === "noticias" && (
              <Card title={E.ai} id="ia">
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(E.aiActions) as Suggestion["action"][]).map((k) => <Button key={k} size="sm" variant="sec" onClick={() => suggest(k)} disabled={aiBusy}>{E.aiActions[k]}</Button>)}
                </div>
                {aiBusy && <p className="flex items-center gap-2 text-ui text-subtle" role="status"><Sparkles size={16} aria-hidden />{E.aiWorking}</p>}
                {ai && (
                  <div className="flex flex-col gap-3 rounded-[16px] border border-line-strong bg-surface-2 p-4" role="region" aria-label={E.aiActions[ai.action]}>
                    <p className="flex items-center gap-1.5 text-label font-semibold text-subtle"><Bot size={14} aria-hidden />{E.aiActions[ai.action]}</p>
                    {ai.text && <p className="text-ui">{ai.text}</p>}
                    {ai.options && (ai.options.length ? <ul className="flex flex-col gap-2">{ai.options.map((o) => <li key={o} className="flex items-center justify-between gap-2"><span className="text-ui">{o}</span><Button size="sm" onClick={() => void useSuggestion(o)}>{E.aiUse}</Button></li>)}</ul> : <p className="text-ui text-subtle">Sem sugestões novas.</p>)}
                    <div className="flex gap-2">
                      {!ai.options && <Button size="sm" variant="pri" onClick={() => void useSuggestion()} disabled={ai.action === "translate" && !id}>{E.aiUse}</Button>}
                      <Button size="sm" variant="gh" onClick={() => setAi(null)}>{E.aiDiscard}</Button>
                    </div>
                  </div>
                )}
                <p className="field-hint">{E.aiNote}{(aiUsed || item?.meta.aiAssisted) && <> · <strong>{E.aiMarked}</strong></>}</p>
              </Card>
            )}

            {kind === "noticias" && (
              <Card title={E.translations} id="traducoes">
                <ul className="flex flex-col gap-1 text-ui">
                  {(item?.meta.langs ?? ["PT"]).map((l) => <li key={l} className="flex items-center justify-between"><span>{l === "PT" ? "Português" : "Inglês"}</span><span className="text-subtle">{l === "PT" ? "Original" : E.translationDraft.split(": ")[1]}</span></li>)}
                </ul>
                {item && !item.meta.langs.includes("EN") && <Button size="sm" onClick={() => void postAdmin({ action: "content.translate", kind, id: item.id }).then(() => toast.show({ message: A.list.done.translate }))}>{E.addTranslation}</Button>}
              </Card>
            )}

            {item && item.meta.history.length > 0 && (
              <Card title={E.versions} id="versoes">
                <ol className="flex flex-col divide-y divide-[var(--ds-border-subtle)]">
                  {item.meta.history.slice(0, 6).map((h, i) => (
                    <li key={`${h.at}${i}`} className="flex items-center gap-3 py-2">
                      <History size={16} aria-hidden className="flex-none text-subtle" />
                      <div className="min-w-0 flex-1 text-ui"><p className="font-semibold">{h.label}</p><p className="text-subtle">{dateShort(h.at)} {timeOf(h.at)} · {people.find((p) => p.id === h.byId)?.name}</p></div>
                      {i > 0 && h.title && !readOnly && <Button size="sm" variant="gh" onClick={() => { set("title", h.title); toast.show({ message: E.restored }); }}>{E.restore}</Button>}
                    </li>
                  ))}
                </ol>
              </Card>
            )}
          </aside>
        </fieldset>
        )}
      </div>

      <Sheet open={preview} onClose={() => setPreview(false)} title={E.previewTitle} status={<span className="text-ui text-subtle">{E.previewLink}</span>}
        footer={<><Segmented legend={E.previewTitle} value={device} onChange={setDevice} options={[{ value: "desktop", label: E.previewDesktop }, { value: "mobile", label: E.previewMobile }]} /><Button onClick={() => { void navigator.clipboard?.writeText(`${location.origin}${location.pathname}?id=${id ?? ""}&pre=1`).catch(() => {}); toast.show({ message: E.previewCopied }); }}>{E.copyPreview}</Button></>}>
        <div className={`mx-auto overflow-hidden rounded-[16px] border border-line bg-surface ${device === "mobile" ? "max-w-[390px]" : ""}`}>
          {kind === "noticias" && /* eslint-disable-next-line @next/next/no-img-element */ <img src={f.cover} alt={f.coverAlt} className="aspect-[16/9] w-full object-cover" />}
          <article className="flex flex-col gap-3 p-5">
            <div className="flex flex-wrap gap-2"><ScopeTag kind={scopeKind({ scopes: f.scopes })}>{scopeLabel({ scopes: f.scopes })}</ScopeTag>{kind === "avisos" && f.number && <span className="text-ui text-subtle">{f.number}</span>}</div>
            <h1 className="text-[28px] font-bold leading-9 tracking-[-0.02em]">{f.title || E.newTitle[kind]}</h1>
            {f.summary && <p className="text-[18px] leading-7 text-copy">{f.summary}</p>}
            {kind === "eventos" && <p className="font-mono text-ui">{dateShort(compose(f.startDate, f.startTime))} · {f.allDay ? E.allDay : `${f.startTime}–${f.endTime}`} · {f.mode === "online" ? "Online" : f.place}</p>}
            {kind === "noticias" ? <div className="prose-read" dangerouslySetInnerHTML={{ __html: sanitize(f.html) }} /> : <div className="prose-read">{f.body.split(/\n{2,}/).filter(Boolean).map((p, i) => <p key={i}>{p}</p>)}</div>}
          </article>
        </div>
      </Sheet>

      <ConfirmDialog open={!!leave} onClose={() => setLeave(null)} title={E.leaveTitle} verb={E.leaveVerb} danger onConfirm={() => { const h = leave!; setLeave(null); setDirty(false); router.push(h); }}>{E.leaveBody}</ConfirmDialog>
      <ConfirmDialog open={versionDlg} onClose={() => setVersionDlg(false)} title={E.versionTitle} verb={E.versionVerb} onConfirm={() => { setVersionDlg(false); void save("publish", { newVersion: true }); }}>
        {E.versionBody(((item as AdminNotice | undefined)?.version ?? 1) + 1)}
      </ConfirmDialog>
      <Dialog open={returning} onClose={() => setReturning(false)} title={E.returnTitle}
        actions={<><Button variant="gh" onClick={() => setReturning(false)}>{t.common.cancel}</Button><Button variant="pri" disabled={!returnText.trim()} onClick={async () => {
          try { await postAdmin({ action: "content.return", kind, id: id!, comment: returnText }); setReturning(false); toast.show({ message: E.returned }); router.push(back); } catch (e) { toast.show({ message: (e as Error).message }); }
        }}>{E.returnVerb}</Button></>}>
        <p className="mb-3">{E.returnBody}</p>
        <TextArea label={E.returnLabel} required rows={3} value={returnText} onChange={(e) => setReturnText(e.target.value)} />
      </Dialog>
    </div>
  );
}

const normal = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

function Attendees({ kind, id, data, title }: { kind: Kind; id: string; data: NonNullable<ReturnType<typeof getContent>>["attendees"] & object; title: string }) {
  const toast = useToast();
  const act = async (action: "event.approveReg" | "event.promote", personId: string) => {
    try { await postAdmin({ action, id, personId }); toast.show({ message: action === "event.approveReg" ? E.approvedReg : E.promoted }); } catch (e) { toast.show({ message: (e as Error).message }); }
  };
  void kind;
  const row = (p: { id: string; name: string; unit: string }, btn?: ReactNode) => <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5"><span>{p.name} <span className="text-ui text-subtle">· {p.unit}</span></span>{btn}</li>;
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      <section className="card flex flex-col gap-3 lg:col-span-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-block font-semibold">{E.attendees} <span className="font-mono text-subtle">{A.list.signups(data.taken || data.going.length, data.capacity)}</span></h2>
          <Button size="sm" onClick={() => { downloadCsv(`inscritos-${title.slice(0, 20)}.csv`, [["Nome", "Unidade", "Estado"], ...data.going.map((p) => [p.name, p.unit, "Inscrito"]), ...data.waitlist.map((p) => [p.name, p.unit, "Lista de espera"]), ...data.pending.map((p) => [p.name, p.unit, "Por aprovar"])]); toast.show({ message: A.list.exported }); }}>{E.exportList}</Button>
        </div>
        {data.capacity ? <Progress value={Math.round(((data.taken || data.going.length) / data.capacity) * 100)} label={`${data.taken || data.going.length} de ${data.capacity} vagas`} /> : null}
        {data.going.length === 0 ? <p className="text-ui text-subtle">{E.noAttendees}</p> : <ul className="divide-y divide-[var(--ds-border-subtle)]">{data.going.map((p) => row(p))}</ul>}
      </section>
      <div className="flex flex-col gap-5">
        <section className="card flex flex-col gap-2">
          <h2 className="text-block font-semibold">{E.pendingRegs} ({data.pending.length})</h2>
          {data.pending.length === 0 ? <p className="text-ui text-subtle">—</p> : <ul className="divide-y divide-[var(--ds-border-subtle)]">{data.pending.map((p) => row(p, <Button size="sm" onClick={() => void act("event.approveReg", p.id)}>{E.approve}</Button>))}</ul>}
        </section>
        <section className="card flex flex-col gap-2">
          <h2 className="text-block font-semibold">{E.waiting} ({data.waitlist.length})</h2>
          {data.waitlist.length === 0 ? <p className="text-ui text-subtle">—</p> : <ul className="divide-y divide-[var(--ds-border-subtle)]">{data.waitlist.map((p) => row(p, <Button size="sm" onClick={() => void act("event.promote", p.id)}>{E.promote}</Button>))}</ul>}
        </section>
      </div>
    </div>
  );
}

