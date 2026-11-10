"use client";

import { ArrowLeft, ArrowRight, Bot, ImagePlus, Images, Play, Plus, Upload } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { units } from "@/data/units";
import { Alert, Button, Checkbox, ConfirmDialog, Dialog, EmptyState, LinkTabs, LoadError, Progress, SelectField, Sheet, TextArea, TextField, useToast } from "@/design-system";
import { BlockRetry } from "@/features/home/BlockRetry";
import { postAdmin } from "@/features/shell/client-api";
import { t } from "@/i18n";
import { albumAdmin, mediaAdmin } from "@/lib/api-painel";
import { useSession, useVersion } from "@/lib/client";
import { withParams } from "@/lib/params";
import { useQuery } from "@/lib/use-query";
import { AdminPage } from "./parts";

const A = t.admin;
const M = A.media;
const scopeOptions = units.filter((u) => ["national", "relation", "general", "court"].includes(u.type)).map((u) => ({ value: u.id, label: u.short }));

function AlbumDialog({ open, onClose, initial }: { open: boolean; onClose: () => void; initial?: { id: string; title: string; happenedAt: string; description: string; scopes: string[] } }) {
  const router = useRouter();
  const toast = useToast();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [date, setDate] = useState(initial?.happenedAt.slice(0, 10) ?? "2026-11-10");
  const [desc, setDesc] = useState(initial?.description ?? "");
  const [scope, setScope] = useState(initial?.scopes[0] ?? "nacional");
  const [err, setErr] = useState<string>();
  const save = async () => {
    if (!title.trim()) { setErr("Escreva o título do álbum."); return; }
    try {
      const r = await postAdmin<{ id: string }>({ action: "media.album", id: initial?.id, title, happenedAt: `${date}T10:00:00+01:00`, description: desc, scopes: [scope] });
      onClose();
      toast.show({ message: initial ? "Álbum guardado" : "Álbum criado" });
      if (!initial) router.push(`/painel/multimedia/album?id=${r.id}`);
    } catch (e) { toast.show({ message: (e as Error).message }); }
  };
  return (
    <Dialog open={open} onClose={onClose} title={initial ? M.albumFields : M.newAlbum} actions={<><Button variant="gh" onClick={onClose}>{t.common.cancel}</Button><Button variant="pri" onClick={() => void save()}>{initial ? M.savePhoto : M.newAlbum}</Button></>}>
      <div className="flex flex-col gap-4">
        <TextField label="Título" required value={title} onChange={(e) => { setTitle(e.target.value); setErr(undefined); }} error={err} />
        <TextField label={M.happened} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <TextArea label={M.description} rows={3} value={desc} onChange={(e) => setDesc(e.target.value)} />
        <SelectField label="Para quem" value={scope} onChange={(e) => setScope(e.target.value)} options={scopeOptions} />
      </div>
    </Dialog>
  );
}

/** A06: álbuns e vídeos. */
export function MediaList() {
  const s = useSession();
  const f = useQuery();
  const toast = useToast();
  const [albumDlg, setAlbumDlg] = useState(f.novo === "1");
  const [videoDlg, setVideoDlg] = useState(false);
  const [video, setVideo] = useState({ title: "", link: "", duration: "", scope: "nacional" });
  let data: ReturnType<typeof mediaAdmin> | null;
  try { data = mediaAdmin(s); } catch { data = null; }
  const tab = f.separador === "videos" ? "videos" : "albuns";
  const tabs = (["albuns", "videos"] as const).map((k) => ({ href: withParams("/painel/multimedia", {}, { separador: k === "albuns" ? undefined : k }), label: M.tabs[k], current: tab === k, count: k === "albuns" ? data?.albums.length : data?.videos.length }));
  const firstNoAlt = data?.albums.find((a) => a.noAlt > 0);

  const addVideo = async () => {
    try { await postAdmin({ action: "media.video", title: video.title, link: video.link, duration: video.duration, scopes: [video.scope] }); setVideoDlg(false); setVideo({ title: "", link: "", duration: "", scope: "nacional" }); toast.show({ message: "Vídeo adicionado" }); }
    catch (e) { toast.show({ message: (e as Error).message }); }
  };

  return (
    <AdminPage title={M.title} lead={M.lead} crumbs={[{ label: A.items.trabalho, href: "/painel" }, { label: M.title }]}
      actions={tab === "albuns" ? <Button variant="pri" icon={<Plus size={18} aria-hidden />} onClick={() => setAlbumDlg(true)}>{M.newAlbum}</Button> : <Button variant="pri" icon={<Plus size={18} aria-hidden />} onClick={() => setVideoDlg(true)}>Novo vídeo</Button>}>
      {!data ? <LoadError what={M.what}><BlockRetry /></LoadError> : (
        <>
          <LinkTabs label={M.title} tabs={tabs} />
          {tab === "albuns" ? (
            <>
              {firstNoAlt && (
                <div className="flex flex-wrap items-center gap-3 rounded-[16px] border border-line-strong bg-surface-2 p-4">
                  <Bot size={20} aria-hidden className="flex-none" />
                  <p className="min-w-0 flex-1 text-ui">{M.noAltCount(data.noAltTotal)}</p>
                  <Link className="btn btn-sec btn-sm" href={`/painel/multimedia/album?id=${firstNoAlt.id}&alt=1`}>{M.suggestAlt}</Link>
                </div>
              )}
              <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                {data.albums.map((a) => (
                  <li key={a.id}>
                    <Link href={`/painel/multimedia/album?id=${a.id}`} className="card group flex h-full flex-col overflow-hidden !p-0 transition-colors hover:border-[var(--ds-border-default)]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {a.count ? <img src={a.cover} alt="" className="aspect-[3/2] w-full object-cover" /> : <span className="grid aspect-[3/2] w-full place-items-center bg-surface-2 text-subtle"><Images size={32} aria-hidden /></span>}
                      <span className="flex flex-1 flex-col gap-1 p-4">
                        <span className="font-semibold group-hover:underline">{a.title}</span>
                        <span className="text-ui text-subtle">{a.dateLabel} · {M.photos(a.count)} · {a.scopeLabel}</span>
                        {a.noAlt > 0 && <span className="mt-1"><span className="bdg bdg-warn">{M.noAltCount(a.noAlt)}</span></span>}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <ul className="card !py-1 divide-y divide-[var(--ds-border-subtle)]">
              {data.videos.map((v) => (
                <li key={v.id} className="flex items-center gap-4 py-3">
                  <span className="relative flex-none overflow-hidden rounded-[10px]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={v.poster} alt="" className="aspect-video w-28 object-cover" />
                    <span className="absolute inset-0 grid place-items-center"><span className="grid h-8 w-8 place-items-center rounded-full bg-black/60 text-white"><Play size={14} aria-hidden /></span></span>
                  </span>
                  <div className="min-w-0 flex-1"><p className="font-semibold">{v.title}</p><p className="text-ui text-subtle">{v.dateLabel} · {v.scopeLabel}</p></div>
                  <span className="font-mono text-ui text-subtle">{v.duration}</span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
      {albumDlg && <AlbumDialog open onClose={() => setAlbumDlg(false)} />}
      <Dialog open={videoDlg} onClose={() => setVideoDlg(false)} title="Novo vídeo" actions={<><Button variant="gh" onClick={() => setVideoDlg(false)}>{t.common.cancel}</Button><Button variant="pri" onClick={() => void addVideo()}>Adicionar vídeo</Button></>}>
        <div className="flex flex-col gap-4">
          <TextField label="Título" required value={video.title} onChange={(e) => setVideo({ ...video, title: e.target.value })} />
          <TextField label={M.videoLink} type="url" required placeholder="https://www.youtube.com/…" value={video.link} onChange={(e) => setVideo({ ...video, link: e.target.value })} />
          <TextField label={M.duration} placeholder="3:42" value={video.duration} onChange={(e) => setVideo({ ...video, duration: e.target.value })} />
          <SelectField label="Para quem" value={video.scope} onChange={(e) => setVideo({ ...video, scope: e.target.value })} options={scopeOptions} />
        </div>
      </Dialog>
    </AdminPage>
  );
}

/** A06: editor de álbum. */
export function AlbumEditor() {
  const s = useSession();
  const v = useVersion();
  const f = useQuery();
  const toast = useToast();
  const data = albumAdmin(s, f.id ?? "");
  const [sel, setSel] = useState<string[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  const [meta, setMeta] = useState({ caption: "", alt: "", credit: "" });
  const [upload, setUpload] = useState<{ done: number; total: number } | null>(null);
  const [over, setOver] = useState(false);
  const [drag, setDrag] = useState<string | null>(null);
  const [moveDlg, setMoveDlg] = useState(false);
  const [moveTo, setMoveTo] = useState("");
  const [removeDlg, setRemoveDlg] = useState(false);
  const [altDlg, setAltDlg] = useState(f.alt === "1");
  const [alts, setAlts] = useState<Record<string, string>>({});
  const [editFields, setEditFields] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  void v;

  const noAlt = data?.photos.filter((p) => !p.alt) ?? [];
  useEffect(() => {
    if (altDlg && data) setAlts(Object.fromEntries(noAlt.map((p, i) => [p.key!, `${["Pessoas reunidas na sala do Conselho", "Participantes sentados durante a cerimónia", "Mesa da presidência com microfones", "Aperto de mão entre dois magistrados", "Grupo de oficiais de justiça em fila", "Vista geral do auditório"][i % 6]}, ${data.album.title.toLowerCase()}`])));
  }, [altDlg]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!data) return <AdminPage title={M.title}><EmptyState title="Este álbum não existe."><Link className="link" href="/painel/multimedia">{M.title}</Link></EmptyState></AdminPage>;
  const { album, photos } = data;
  const keys = photos.map((p) => p.key!);
  const others = mediaAdmin(s).albums.filter((a) => a.id !== album.id);

  const run = async (fn: () => Promise<unknown>, msg: string) => { try { await fn(); toast.show({ message: msg }); } catch (e) { toast.show({ message: (e as Error).message }); } };
  const reorder = (from: number, to: number) => {
    if (to < 0 || to >= keys.length) return;
    const next = [...keys];
    const [k] = next.splice(from, 1);
    next.splice(to, 0, k);
    void postAdmin({ action: "media.order", albumId: album.id, keys: next });
  };
  const doUpload = (n: number) => {
    if (!n) return;
    setUpload({ done: 0, total: n });
    let done = 0;
    const step = () => {
      done += 1;
      setUpload({ done, total: n });
      if (done < n) setTimeout(step, 260);
      else { void postAdmin({ action: "media.upload", albumId: album.id, count: n }).then(() => { setUpload(null); toast.show({ message: M.uploaded }); }); }
    };
    setTimeout(step, 260);
  };
  const photo = photos.find((p) => p.key === open);

  return (
    <AdminPage title={album.title} lead={`${M.photos(photos.length)} · ${data.scopeLabel}`} crumbs={[{ label: A.items.trabalho, href: "/painel" }, { label: M.title, href: "/painel/multimedia" }, { label: album.title }]}
      actions={<>
        {album.id.startsWith("al") && <Button onClick={() => setEditFields(true)}>{M.albumFields}</Button>}
        {noAlt.length > 0 && <Button icon={<Bot size={18} aria-hidden />} onClick={() => setAltDlg(true)}>{M.suggestAlt}</Button>}
        <Button variant="pri" icon={<Upload size={18} aria-hidden />} onClick={() => fileRef.current?.click()}>{M.upload}</Button>
      </>}>
      <input ref={fileRef} type="file" accept="image/*" multiple className="sr-only" tabIndex={-1} aria-hidden onChange={(e) => { doUpload(e.target.files?.length ?? 0); e.target.value = ""; }} />
      {noAlt.length > 0 && <Alert tone="warn" title={M.noAltCount(noAlt.length)}>{M.altReview}</Alert>}
      <div
        className={`flex flex-col items-center gap-2 rounded-[20px] border-2 border-dashed p-6 text-center ${over ? "border-[var(--ds-border-brand)] bg-[var(--ds-color-brand-50)]" : "border-line-strong"}`}
        onDragOver={(e) => { if (e.dataTransfer.types.includes("Files")) { e.preventDefault(); setOver(true); } }} onDragLeave={() => setOver(false)}
        onDrop={(e) => { if (e.dataTransfer.files.length) { e.preventDefault(); setOver(false); doUpload(e.dataTransfer.files.length); } }}>
        <ImagePlus size={28} aria-hidden className="text-subtle" />
        <p className="text-ui">{M.dropHint}</p>
        <Button size="sm" onClick={() => fileRef.current?.click()}>{M.upload}</Button>
        {upload && <div className="w-full max-w-md"><Progress value={Math.round((upload.done / upload.total) * 100)} label={M.uploading(upload.done, upload.total)} /></div>}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Checkbox checked={sel.length > 0 && sel.length === keys.length} onChange={() => setSel(sel.length === keys.length ? [] : keys)}>Seleccionar todas</Checkbox>
        <p className="text-ui text-subtle">{M.reorderHint}</p>
      </div>

      {photos.length === 0 ? <EmptyState title="Ainda não há fotografias neste álbum." /> : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6">
          {photos.map((p, i) => (
            <li key={p.key} draggable onDragStart={() => setDrag(p.key!)} onDragEnd={() => setDrag(null)} onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); if (drag && drag !== p.key) reorder(keys.indexOf(drag), i); setDrag(null); }}
              className={`group relative overflow-hidden rounded-[16px] border bg-surface ${sel.includes(p.key!) ? "border-[var(--ds-border-brand)] ring-2 ring-[var(--ds-border-brand)]" : "border-line"} ${drag === p.key ? "opacity-50" : ""}`}>
              <button type="button" className="block w-full text-left" onClick={() => { setOpen(p.key!); setMeta({ caption: p.caption, alt: p.alt, credit: p.credit }); }} aria-label={`${M.photo(i + 1)}: ${p.caption || M.missingAlt}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.src} alt="" className="aspect-square w-full object-cover" />
              </button>
              <div className="absolute left-2 top-2 rounded-full bg-surface px-1.5 py-1"><Checkbox checked={sel.includes(p.key!)} onChange={() => setSel((x) => (x.includes(p.key!) ? x.filter((k) => k !== p.key) : [...x, p.key!]))} aria-label={M.selectPhoto(i + 1)}><span className="sr-only">{M.selectPhoto(i + 1)}</span></Checkbox></div>
              {!p.alt && <span className="bdg bdg-warn absolute bottom-12 left-2">{M.missingAlt}</span>}
              <div className="flex items-center gap-1 px-2 py-1.5">
                <span className="min-w-0 flex-1 truncate font-mono text-label text-subtle">{i + 1}</span>
                <button type="button" className="icbtn !h-8 !w-8" aria-label={`Mover ${M.photo(i + 1)} para trás`} disabled={i === 0} onClick={() => reorder(i, i - 1)}><ArrowLeft size={14} aria-hidden /></button>
                <button type="button" className="icbtn !h-8 !w-8" aria-label={`Mover ${M.photo(i + 1)} para a frente`} disabled={i === photos.length - 1} onClick={() => reorder(i, i + 1)}><ArrowRight size={14} aria-hidden /></button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {sel.length > 0 && (
        <div role="region" aria-label={M.selectedN(sel.length)} className="sticky bottom-[calc(16px+env(safe-area-inset-bottom))] z-20 mx-auto flex w-full max-w-[760px] flex-wrap items-center gap-2 rounded-[20px] border border-line-strong bg-surface p-2 pl-4 shadow-[var(--ds-shadow-3)]">
          <span className="mr-auto text-ui font-semibold" aria-live="polite">{M.selectedN(sel.length)}</span>
          <Button size="sm" onClick={() => { setMoveTo(others[0]?.id ?? ""); setMoveDlg(true); }}>{M.move}</Button>
          <Button size="sm" onClick={() => void run(() => postAdmin({ action: "media.number", albumId: album.id }), M.numbered)}>{M.number}</Button>
          <Button size="sm" variant="dng" onClick={() => setRemoveDlg(true)}>{M.remove}</Button>
          <Button size="sm" variant="gh" onClick={() => setSel([])}>{t.common.cancel}</Button>
        </div>
      )}

      <Sheet open={!!photo} onClose={() => setOpen(null)} title={photo ? M.photo(keys.indexOf(photo.key!) + 1) : ""}
        footer={<Button variant="pri" onClick={() => { const k = open!; setOpen(null); void run(() => postAdmin({ action: "media.photo", key: k, ...meta }), M.photoSaved); }}>{M.savePhoto}</Button>}>
        {photo && (
          <div className="flex flex-col gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo.src} alt={meta.alt} className="w-full rounded-[12px] border border-line" />
            <TextField label={M.caption} value={meta.caption} onChange={(e) => setMeta({ ...meta, caption: e.target.value })} />
            <TextField label={M.alt} required hint={A.editor.coverAltHint} value={meta.alt} onChange={(e) => setMeta({ ...meta, alt: e.target.value })} />
            <TextField label={M.credit} value={meta.credit} onChange={(e) => setMeta({ ...meta, credit: e.target.value })} />
          </div>
        )}
      </Sheet>

      <Dialog open={moveDlg} onClose={() => setMoveDlg(false)} title={M.move} actions={<><Button variant="gh" onClick={() => setMoveDlg(false)}>{t.common.cancel}</Button><Button variant="pri" disabled={!moveTo} onClick={() => { setMoveDlg(false); const ks = sel; setSel([]); void run(() => postAdmin({ action: "media.move", keys: ks, from: album.id, to: moveTo }), M.moved); }}>{M.move}</Button></>}>
        <SelectField label="Álbum de destino" value={moveTo} onChange={(e) => setMoveTo(e.target.value)} options={others.map((a) => ({ value: a.id, label: a.title }))} />
      </Dialog>
      <ConfirmDialog open={removeDlg} onClose={() => setRemoveDlg(false)} danger title={`${M.remove} ${M.selectedN(sel.length).toLowerCase()}?`} verb={M.remove}
        onConfirm={() => { setRemoveDlg(false); const ks = sel; setSel([]); void run(() => postAdmin({ action: "media.remove", keys: ks }), M.removed); }}>
        As fotografias deixam de aparecer no portal.
      </ConfirmDialog>
      <Dialog open={altDlg} onClose={() => setAltDlg(false)} title={M.suggestAlt}
        actions={<><Button variant="gh" onClick={() => setAltDlg(false)}>{t.common.cancel}</Button><Button variant="pri" onClick={() => { setAltDlg(false); void run(() => postAdmin({ action: "media.altAll", items: Object.entries(alts).filter(([, a]) => a.trim()).map(([key, alt]) => ({ key, alt })) }), M.altApplied); }}>{M.savePhoto}</Button></>}>
        <p className="mb-3 text-ui text-subtle">{M.altReview} {A.editor.aiNote}</p>
        <ul className="flex max-h-[50vh] flex-col gap-3 overflow-auto pr-1">
          {noAlt.map((p) => (
            <li key={p.key} className="flex gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.src} alt="" className="h-16 w-16 flex-none rounded-[8px] object-cover" />
              <TextField className="flex-1" label={M.photo(keys.indexOf(p.key!) + 1)} value={alts[p.key!] ?? ""} onChange={(e) => setAlts({ ...alts, [p.key!]: e.target.value })} />
            </li>
          ))}
        </ul>
      </Dialog>
      {editFields && <AlbumDialog open onClose={() => setEditFields(false)} initial={album} />}
    </AdminPage>
  );
}
