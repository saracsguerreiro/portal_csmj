"use client";

import { Pin, PinOff } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { Shortcut } from "@/data/types";
import { Button, useToast } from "@/design-system";
import { postAction } from "@/features/shell/client-api";
import { NamedIcon } from "@/features/shell/icons";
import { t } from "@/i18n";

const q = t.home.quick;

export function QuickAccess({ all, pinned }: { all: Shortcut[]; pinned: string[] }) {
  const { show } = useToast();
  const [ids, setIds] = useState(pinned);
  const [editing, setEditing] = useState(false);
  const shown = ids.map((id) => all.find((s) => s.id === id)!).filter(Boolean);
  const rest = all.filter((s) => !ids.includes(s.id));

  const finish = async () => {
    setEditing(false);
    try {
      await postAction({ action: "shortcuts.save", ids });
      show({ message: q.saved });
    } catch {
      setIds(pinned);
      show({ message: t.home.needs.failed });
    }
  };

  return (
    <div className="@container flex h-full flex-col">
      <div className="mb-2 flex items-center justify-between gap-4">
        <h2 className="panel-title">{q.title}</h2>
        {editing ? <Button size="sm" variant="sec" onClick={finish}>{q.save}</Button> : <Button size="sm" variant="gh" onClick={() => setEditing(true)}>{q.edit}</Button>}
      </div>
      <ul className="grid grid-cols-4 gap-1 md:grid-cols-2">
        {shown.map((s) => (
          <li key={s.id}>
            {editing ? (
              <button type="button" className="menu-item h-full !flex-col !gap-1 text-center md:@[300px]:!flex-row md:@[300px]:text-left" aria-label={q.unpin(s.label)} onClick={() => setIds((x) => x.filter((v) => v !== s.id))}>
                <PinOff size={18} aria-hidden /><span className="text-label">{s.label}</span>
              </button>
            ) : (
              <Link href={s.href} className="menu-item h-full !flex-col !gap-1 !px-1 text-center md:@[300px]:!flex-row md:@[300px]:!px-3 md:@[300px]:text-left">
                <span className="text-brand"><NamedIcon name={s.icon} /></span>
                <span className="text-label font-medium">{s.label}</span>
              </Link>
            )}
          </li>
        ))}
      </ul>
      {editing && (
        <div className="mt-3 border-t border-line pt-3">
          <p className="text-caption font-semibold text-subtle">{q.available}</p>
          {rest.length === 0 && <p className="text-label">{q.limit}</p>}
          <ul className="mt-1 grid grid-cols-2 gap-1">
            {rest.map((s) => (
              <li key={s.id}>
                <button type="button" className="menu-item" disabled={ids.length >= 8} style={ids.length >= 8 ? { color: "var(--ds-content-disabled)", cursor: "not-allowed" } : undefined} aria-label={q.pin(s.label)} onClick={() => setIds((x) => [...x, s.id])}>
                  <Pin size={18} aria-hidden /><span className="text-label">{s.label}</span>
                </button>
              </li>
            ))}
          </ul>
          {ids.length >= 8 && <p className="field-hint mt-1">{q.limit}</p>}
        </div>
      )}
    </div>
  );
}
