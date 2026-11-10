"use client";

import { useState } from "react";
import { Avatar, Button, EmptyState, PageHeader, StatusBadge, TextArea, useToast } from "@/design-system";
import { PersonSheet } from "@/features/pessoas/PersonSheet";
import { usePersonHref } from "@/features/pessoas/parts";
import { postAction } from "@/features/shell/client-api";
import { t } from "@/i18n";
import { newcomers } from "@/lib/api-pessoas";
import { useSession } from "@/lib/client";
import Link from "next/link";

const pp = t.peoplePage;

function Welcome({ slug, name, done }: { slug: string; name: string; done: boolean }) {
  const { show } = useToast();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  if (done) return <StatusBadge tone="ok">{pp.sent}</StatusBadge>;
  if (!open) return <Button size="sm" onClick={() => setOpen(true)}>{pp.welcome}</Button>;
  return (
    <div className="flex w-full flex-col gap-2">
      <TextArea label={pp.welcomeLabel(name)} autoFocus rows={2} value={text} error={error} onChange={(e) => { setText(e.target.value); setError(""); }} />
      <div className="flex gap-2">
        <Button size="sm" variant="pri" onClick={async () => { try { await postAction({ action: "welcome", slug, text }); show({ message: pp.welcomed }); } catch (e) { setError((e as Error).message); } }}>{pp.welcomeSend}</Button>
        <Button size="sm" variant="gh" onClick={() => setOpen(false)}>{t.common.cancel}</Button>
      </div>
    </div>
  );
}

export function NewcomersView() {
  const s = useSession();
  const list = newcomers(s);
  const href = usePersonHref();
  return (
    <div className="wrap flex flex-col gap-6 py-6 md:py-8">
      <PageHeader crumbs={[{ label: pp.title, href: "/pessoas" }, { label: pp.newTitle }]} title={pp.newTitle} description={pp.newLead} />
      {list.length === 0 ? <EmptyState title={pp.noNew} /> : (
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {list.map((p) => (
            <li key={p.id} className="card flex flex-col gap-3">
              <Link href={href(p.slug)} scroll={false} className="row-link flex items-center gap-3">
                <Avatar initials={p.initials} size="lg" />
                <span><span className="row-title block text-block font-semibold text-ink">{p.name}</span><span className="block text-body">{p.role}</span><span className="block text-caption text-subtle">{p.unit} · {pp.joined(p.joinedLabel)}</span></span>
              </Link>
              <p className="text-caption text-subtle">{pp.welcomes(p.welcomes)}</p>
              <Welcome slug={p.slug} name={p.name.split(" ")[0]} done={p.welcomed} />
            </li>
          ))}
        </ul>
      )}
      <PersonSheet />
    </div>
  );
}
