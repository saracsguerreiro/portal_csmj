"use client";

import { Hand, Heart, Info, List } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Avatar, Button, Sheet, useToast } from "@/design-system";
import type { CommentView } from "@/lib/api-comunicacao";
import { postAction } from "@/features/shell/client-api";
import { t } from "@/i18n";

const n = t.news;

type Kind = "gosto" | "aplauso" | "importante";
const icons = { gosto: Heart, aplauso: Hand, importante: Info } as const;

export function Reactions({ id, base, mine }: { id: string; base: Record<Kind, number>; mine: string | null }) {
  const [current, setCurrent] = useState<string | null>(mine);
  const toggle = async (k: Kind) => {
    const before = current;
    const next = current === k ? null : k;
    setCurrent(next);
    try { await postAction({ action: "reaction.set", id, kind: next }); } catch { setCurrent(before); }
  };
  return (
    <div role="group" aria-label={n.reactionsLabel} className="flex flex-wrap gap-2">
      {(Object.keys(icons) as Kind[]).map((k) => {
        const Icon = icons[k];
        const count = base[k] + (current === k ? 1 : 0) - (mine === k ? 1 : 0);
        return (
          <button key={k} type="button" className="chip" aria-pressed={current === k} onClick={() => toggle(k)}>
            <Icon size={14} aria-hidden />{n.reactions[k]}<span className="tabular-nums">{count}</span>
          </button>
        );
      })}
    </div>
  );
}

/** Texto com menções @[Nome](slug) e ligações [texto](/caminho). */
export function RichText({ text, visibleSlugs }: { text: string; visibleSlugs?: string[] }) {
  const parts: React.ReactNode[] = [];
  const re = /(@)?\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const [, at, label, target] = m;
    if (at) parts.push(<Link key={m.index} className="link" href={`/pessoas/${target}`}>@{label}</Link>);
    else {
      const slug = target.split("/noticias/")[1];
      const allowed = !slug || !visibleSlugs || visibleSlugs.includes(slug);
      parts.push(allowed ? <Link key={m.index} className="link" href={target}>{label}</Link> : <span key={m.index}>{label}</span>);
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}

function Composer({ people, onSend, label, submit, autoFocus, onCancel }: { people: { slug: string; name: string }[]; onSend: (text: string) => Promise<boolean>; label: string; submit: string; autoFocus?: boolean; onCancel?: () => void }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);
  const query = /@([\p{L}]{2,})$/u.exec(text)?.[1];
  const matches = useMemo(() => (query ? people.filter((p) => p.name.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().includes(query.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase())).slice(0, 5) : []), [people, query]);
  const pick = (p: { slug: string; name: string }) => {
    setText((v) => v.replace(/@([\p{L}]{2,})$/u, `@[${p.name}](${p.slug}) `));
    ref.current?.focus();
  };
  const send = async () => {
    if (!text.trim()) return;
    setBusy(true);
    if (await onSend(text)) setText("");
    setBusy(false);
  };
  return (
    <div className="relative flex flex-col gap-2">
      <label className="field-label" htmlFor={`c-${label}`}>{label}</label>
      <textarea id={`c-${label}`} ref={ref} autoFocus={autoFocus} className="inp" rows={3} placeholder={n.commentPlaceholder} value={text} onChange={(e) => setText(e.target.value)} />
      {matches.length > 0 && (
        <ul className="menu absolute left-0 top-full z-10 mt-1 w-72" role="listbox" aria-label={label}>
          {matches.map((p) => <li key={p.slug} role="option" aria-selected={false} className="menu-item" onMouseDown={(e) => e.preventDefault()} onClick={() => pick(p)}>{p.name}</li>)}
        </ul>
      )}
      <div className="flex gap-2">
        <Button variant="pri" size="sm" loading={busy} disabled={!text.trim()} onClick={send}>{submit}</Button>
        {onCancel && <Button variant="gh" size="sm" onClick={onCancel}>{t.common.cancel}</Button>}
      </div>
    </div>
  );
}

function CommentItem({ c, people, me, onReply, depth }: { c: CommentView; people: { slug: string; name: string }[]; me: CommentView["author"]; onReply: (text: string, to: string) => Promise<boolean>; depth: number }) {
  const [replying, setReplying] = useState(false);
  return (
    <li className="flex gap-3">
      <Avatar initials={c.author.initials} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="text-label"><Link className="font-semibold text-ink hover:underline" href={`/pessoas/${c.author.slug}`}>{c.author.name}</Link> <span className="text-subtle">· {c.author.role} · {c.atLabel}</span></p>
        <p className="mt-1 text-ui"><RichText text={c.text} /></p>
        {depth === 0 && !replying && <button type="button" className="link-quiet mt-1 inline-flex min-h-11 items-center md:min-h-0" onClick={() => setReplying(true)}>{n.reply}</button>}
        {replying && <div className="mt-2"><Composer people={people} label={n.replyTo(c.author.name)} submit={n.sendReply} autoFocus onCancel={() => setReplying(false)} onSend={async (txt) => { const ok = await onReply(txt, c.id); if (ok) setReplying(false); return ok; }} /></div>}
        {c.replies.length > 0 && <ul className="mt-4 flex flex-col gap-4">{c.replies.map((r) => <CommentItem key={r.id} c={r} people={people} me={me} onReply={onReply} depth={depth + 1} />)}</ul>}
      </div>
    </li>
  );
}

export function Comments({ newsId, initial, people, me }: { newsId: string; initial: CommentView[]; people: { slug: string; name: string }[]; me: CommentView["author"] }) {
  const { show } = useToast();
  const [list, setList] = useState(initial);
  const add = async (text: string, replyTo?: string) => {
    const mineC: CommentView = { id: `tmp-${Date.now()}`, author: me, text, atLabel: "agora", replies: [] };
    const before = list;
    setList((l) => (replyTo ? l.map((c) => (c.id === replyTo ? { ...c, replies: [...c.replies, mineC] } : c)) : [...l, mineC]));
    try {
      await postAction({ action: "comment.add", id: newsId, text, replyTo });
      show({ message: n.published });
      return true;
    } catch {
      setList(before);
      show({ message: t.home.needs.failed });
      return false;
    }
  };
  const total = list.reduce((a, c) => a + 1 + c.replies.length, 0);
  return (
    <section aria-labelledby="comentarios" className="flex flex-col gap-6">
      <h2 id="comentarios" className="text-section font-bold">{n.commentsTitle} <span className="text-subtle">({total})</span></h2>
      {list.length === 0 ? <p className="text-body">{n.noComments}</p> : <ul className="flex flex-col gap-6">{list.map((c) => <CommentItem key={c.id} c={c} people={people} me={me} onReply={(txt, to) => add(txt, to)} depth={0} />)}</ul>}
      <Composer people={people} label={n.commentLabel} submit={n.send} onSend={(txt) => add(txt)} />
    </section>
  );
}

/** Índice automático com indicação da secção visível. */
export function Toc({ items }: { items: { id: string; text: string }[] }) {
  const [active, setActive] = useState(items[0]?.id);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setActive(e.target.id)), { rootMargin: "-20% 0px -70% 0px" });
    items.forEach((i) => { const el = document.getElementById(i.id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, [items]);
  if (items.length < 3) return null;
  const list = (onPick?: () => void) => (
    <ul className="flex flex-col border-l border-line">
      {items.map((i) => (
        <li key={i.id}><a href={`#${i.id}`} onClick={onPick} aria-current={active === i.id ? "location" : undefined} className={`-ml-px block border-l-2 py-1.5 pl-3 text-body no-underline ${active === i.id ? "border-[var(--ds-content-brand)] font-semibold text-brand" : "border-transparent hover:text-ink"}`}>{i.text}</a></li>
      ))}
    </ul>
  );
  return (
    <>
      <nav aria-label={n.tocLabel} className="hidden xl:block" data-toc="lateral">
        <p className="mb-2 text-label font-semibold text-ink">{n.onThisPage}</p>
        {list()}
      </nav>
      <div className="xl:hidden">
        <Button size="sm" icon={<List size={16} aria-hidden />} onClick={() => setOpen(true)}>{n.onThisPage}</Button>
        <Sheet open={open} onClose={() => setOpen(false)} title={n.onThisPage}>
          <nav aria-label={n.tocLabel}>{list(() => setOpen(false))}</nav>
        </Sheet>
      </div>
    </>
  );
}
