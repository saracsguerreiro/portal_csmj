"use client";

import { AtSign, Bell, CalendarClock, CalendarDays, Mail, Megaphone, MessageSquare, Reply, Stamp, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button, ButtonLink, EmptyState, FilterBar, LoadError, PageHeader, useToast } from "@/design-system";
import { postAction } from "@/features/shell/client-api";
import { BlockRetry } from "@/features/home/BlockRetry";
import type { NotificationKind } from "@/data/types";
import { t } from "@/i18n";
import { NOTIF_TYPES, notificationsPage } from "@/lib/api-participar";
import { useSession } from "@/lib/client";
import { useQuery } from "@/lib/use-query";

const n = t.notifPage;
const icons: Record<NotificationKind, LucideIcon> = { approval: Stamp, reply: Reply, notice: Megaphone, mention: AtSign, comment: MessageSquare, newsletter: Mail, event: CalendarDays, reminder: CalendarClock };

export function NotificationsView() {
  const s = useSession();
  const f = useQuery();
  const { show } = useToast();
  const [allRead, setAllRead] = useState(false);
  let items;
  try { items = notificationsPage(s, f); } catch { items = null; }
  const unread = items?.filter((x) => !x.read && !allRead).length ?? 0;
  return (
    <div className="wrap flex flex-col gap-6 py-6 md:py-8">
      <PageHeader title={n.title} description={n.lead} actions={<><ButtonLink variant="gh" href="/conta?separador=notificacoes">{t.notifications.prefs}</ButtonLink><Button disabled={unread === 0} onClick={async () => { setAllRead(true); try { await postAction({ action: "notifications.readAll" }); show({ message: t.notifications.allMarked }); } catch { setAllRead(false); } }}>{t.notifications.markAll}</Button></>} />
      <FilterBar filters={[{ key: "tipo", label: n.type, options: NOTIF_TYPES.map((x) => ({ value: x.id, label: x.label })) }, { key: "periodo", label: n.period, options: Object.entries(n.periods).map(([value, label]) => ({ value, label })) }]} />
      {!items ? <LoadError what={n.what}><BlockRetry /></LoadError> : items.length === 0 ? <EmptyState icon={<Bell size={24} aria-hidden />} title={n.empty} /> : (
        <ul className="card !py-1 divide-y divide-[var(--ds-border-subtle)]">
          {items.map((x) => { const Icon = icons[x.kind]; const read = x.read || allRead; return (
            <li key={x.id}><Link href={x.href} className="row-link flex gap-3 py-3"><Icon size={20} aria-hidden className="mt-0.5 flex-none text-subtle" /><span className="min-w-0 flex-1"><span className={`row-title block text-body ${read ? "" : "font-semibold text-ink"}`}>{x.text}</span><span className="text-caption text-subtle">{x.atLabel}</span></span>{!read && <span className="mt-1.5 h-2 w-2 flex-none rounded-full" style={{ background: "var(--ds-brand-background-default)" }} role="img" aria-label={t.notifications.newLabel} />}</Link></li>
          ); })}
        </ul>
      )}
    </div>
  );
}
