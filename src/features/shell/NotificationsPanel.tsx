"use client";

import { AtSign, Bell, CalendarClock, CalendarDays, Mail, Megaphone, MessageSquare, Reply, Stamp, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { NotificationKind } from "@/data/types";
import { Button, ButtonLink, EmptyState, Sheet, Tabs, useToast } from "@/design-system";
import { t } from "@/i18n";
import { postAction } from "./client-api";
import { useShell } from "./ShellContext";

const n = t.notifications;

const kindIcon: Record<NotificationKind, LucideIcon> = { approval: Stamp, reply: Reply, notice: Megaphone, mention: AtSign, comment: MessageSquare, newsletter: Mail, event: CalendarDays, reminder: CalendarClock };

export function NotificationsPanel() {
  const { data, overlay, close, setUnread, unread } = useShell();
  const { show } = useToast();
  const [tab, setTab] = useState("all");
  const [allRead, setAllRead] = useState(false);

  const items = useMemo(() => data.notifications.map((x) => ({ ...x, read: x.read || allRead })), [data.notifications, allRead]);
  const visible = items.filter((x) => (tab === "unread" ? !x.read : tab === "mentions" ? x.mention : true));

  const markAll = async () => {
    const before = allRead;
    setAllRead(true);
    setUnread(0);
    show({ message: n.allMarked });
    try {
      await postAction({ action: "notifications.readAll" });
    } catch {
      setAllRead(before);
      setUnread(1);
      show({ message: t.home.needs.failed });
    }
  };

  const emptyText = tab === "unread" ? n.emptyUnread : tab === "mentions" ? n.emptyMentions : n.emptyAll;

  return (
    <Sheet
      open={overlay === "notifications"} onClose={close} narrow title={n.title}
      footer={
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Button variant="gh" size="sm" disabled={unread === 0} onClick={markAll}>{n.markAll}</Button>
          <div className="flex gap-2">
            <ButtonLink variant="gh" size="sm" href="/conta?separador=notificacoes" onClick={close}>{n.prefs}</ButtonLink>
            <ButtonLink variant="sec" size="sm" href="/notificacoes" onClick={close}>{n.seeAll}</ButtonLink>
          </div>
        </div>
      }
    >
      <div className="-mt-3 mb-2">
        <Tabs label={n.tabs} value={tab} onChange={setTab} tabs={[{ id: "all", label: n.all }, { id: "unread", label: n.unread }, { id: "mentions", label: n.mentions }]} />
      </div>
      {visible.length === 0 ? (
        <EmptyState plain icon={<Bell size={24} aria-hidden />} title={emptyText} />
      ) : (
        <ul className="divide-y divide-[var(--ds-border-subtle)]">
          {visible.map((x) => {
            const Icon = kindIcon[x.kind];
            return (
              <li key={x.id}>
                <Link href={x.href} onClick={close} className="row-link flex gap-3 py-3">
                  <Icon size={20} aria-hidden className="mt-0.5 flex-none text-subtle" />
                  <span className="min-w-0 flex-1">
                    <span className={`row-title block text-body ${x.read ? "" : "font-semibold text-ink"}`}>{x.text}</span>
                    <span className="mt-0.5 block text-caption text-subtle">{x.atLabel}</span>
                  </span>
                  {!x.read && <span className="mt-1.5 h-2 w-2 flex-none rounded-full" style={{ background: "var(--ds-brand-background-default)" }} role="img" aria-label={n.newLabel} />}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </Sheet>
  );
}
