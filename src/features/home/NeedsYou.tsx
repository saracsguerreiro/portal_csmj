"use client";

import { CalendarClock, Check, HeartPulse, Inbox, MessageSquareReply, Stamp, Undo2, Vote, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import type { Task, TaskType } from "@/data/types";
import { BlockHeader, Button, ButtonLink, EmptyState, Radio, ScopeTag, useToast } from "@/design-system";
import type { ScopeKind } from "@/design-system/components/display";
import { postAction } from "@/features/shell/client-api";
import { t } from "@/i18n";

const n = t.home.needs;

export type TaskView = Task & { sinceLabel: string; scopeLabel: string; scopeKind: ScopeKind };

const typeIcon: Record<TaskType, LucideIcon> = { approval: Stamp, returned: Undo2, poll: Vote, climate: HeartPulse, event: CalendarClock, reply: MessageSquareReply };

const SWIPE = 96;

function TaskRow({ task, primary, onApprove, onPostpone, onVote, onGoing }: { task: TaskView; primary: boolean; onApprove: () => void; onPostpone: () => void; onVote: () => void; onGoing: () => void }) {
  const [mode, setMode] = useState<"idle" | "confirm" | "vote">("idle");
  const [choice, setChoice] = useState("");
  const [dx, setDx] = useState(0);
  const drag = useRef<{ x: number; y: number; on: boolean } | null>(null);
  const Icon = typeIcon[task.type];
  const canApprove = task.action === "approve";

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse" || mode !== "idle") return;
    drag.current = { x: e.clientX, y: e.clientY, on: false };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const mx = e.clientX - d.x;
    const my = e.clientY - d.y;
    if (!d.on && Math.abs(my) > Math.abs(mx) && Math.abs(my) > 8) { drag.current = null; return; }
    if (Math.abs(mx) > 8) d.on = true;
    if (d.on) setDx(canApprove ? mx : Math.min(mx, 0));
  };
  const onPointerEnd = () => {
    if (drag.current?.on) {
      if (dx >= SWIPE && canApprove) onApprove();
      else if (dx <= -SWIPE) onPostpone();
    }
    drag.current = null;
    setDx(0);
  };

  const action = () => {
    if (task.action === "approve") return (
      <>
        <Button variant={primary ? "pri" : "sec"} size="sm" icon={<Check size={14} aria-hidden />} onClick={() => setMode("confirm")}>{n.approve}</Button>
        <ButtonLink variant="gh" size="sm" href={task.href} className="hidden md:inline-flex">{n.returnIt}</ButtonLink>
      </>
    );
    if (task.action === "vote") return <Button variant={primary ? "pri" : "sec"} size="sm" onClick={() => setMode("vote")}>{n.vote}</Button>;
    if (task.action === "going") return <Button variant={primary ? "pri" : "sec"} size="sm" onClick={onGoing}>{task.actionLabel}</Button>;
    return <ButtonLink variant={primary ? "pri" : "sec"} size="sm" href={task.href}>{task.actionLabel}</ButtonLink>;
  };

  return (
    <li className="relative overflow-hidden">
      {dx !== 0 && (
        <div aria-hidden className="absolute inset-0 flex items-center justify-between px-4 text-body font-semibold" style={{ background: dx > 0 ? "var(--ds-status-ok-bg)" : "var(--ds-status-info-bg)", color: dx > 0 ? "var(--ds-status-ok-fg)" : "var(--ds-status-info-fg)" }}>
          <span>{dx > 0 ? n.approve : ""}</span>
          <span>{dx < 0 ? n.postpone : ""}</span>
        </div>
      )}
      <div
        className="relative bg-surface py-3 [touch-action:pan-y]" style={{ transform: dx ? `translateX(${dx}px)` : undefined }}
        onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerEnd} onPointerCancel={onPointerEnd}
      >
        <div className="flex flex-col gap-2 @xl:flex-row @xl:items-center @xl:gap-4">
          <div className="flex min-w-0 flex-1 gap-3">
            <Icon size={20} aria-hidden className="mt-0.5 flex-none text-brand" />
            <div className="min-w-0">
              <Link href={task.href} className="row-link"><span className="row-title block font-semibold text-ink">{task.title}</span></Link>
              <p className="text-label">{task.detail}</p>
              <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-caption text-subtle">
                <span>{n.type[task.type]} · {task.sinceLabel}</span>
                <ScopeTag kind={task.scopeKind}>{task.scopeLabel}</ScopeTag>
              </p>
            </div>
          </div>
          {mode === "idle" && (
            <div className="flex flex-none gap-2 pl-8 @xl:pl-0">
              {action()}
              <Button variant="gh" size="sm" className="md:hidden" onClick={onPostpone}>{n.postpone}</Button>
            </div>
          )}
          {mode === "confirm" && (
            <div className="flex flex-none flex-wrap items-center gap-2 pl-8 @xl:pl-0">
              <span className="text-label font-medium text-ink" role="status">{n.confirmApprove}</span>
              <Button variant="pri" size="sm" autoFocus onClick={onApprove}>{n.confirm}</Button>
              <Button variant="gh" size="sm" onClick={() => setMode("idle")}>{n.keep}</Button>
            </div>
          )}
        </div>
        {mode === "vote" && (
          <fieldset className="mt-3 pl-8">
            <legend className="field-label">{n.voteLegend}</legend>
            <div className="mt-2 flex flex-col gap-2">
              {task.options?.map((o) => <Radio key={o} name={task.id} value={o} checked={choice === o} onChange={() => setChoice(o)}>{o}</Radio>)}
            </div>
            <p className="field-hint mt-2">{n.voteFinal}</p>
            <div className="mt-3 flex gap-2">
              <Button variant="pri" size="sm" disabled={!choice} onClick={onVote}>{n.confirmVote}</Button>
              <Button variant="gh" size="sm" onClick={() => setMode("idle")}>{n.keep}</Button>
            </div>
          </fieldset>
        )}
      </div>
    </li>
  );
}

export function NeedsYou({ items, total }: { items: TaskView[]; total: number }) {
  const { show } = useToast();
  const [hidden, setHidden] = useState<string[]>([]);
  const heading = useRef<HTMLHeadingElement>(null);
  const visible = items.filter((x) => !hidden.includes(x.id));
  const count = total - hidden.length;

  /** Interface optimista: reflecte de imediato e reverte com mensagem clara se falhar. */
  const act = async (task: TaskView, action: string, message: string, undoAction?: string) => {
    setHidden((h) => [...h, task.id]);
    heading.current?.focus();
    const restore = () => setHidden((h) => h.filter((x) => x !== task.id));
    show({
      message,
      onUndo: undoAction ? async () => {
        restore();
        try { await postAction({ action: undoAction, id: task.id }); } catch { setHidden((h) => [...h, task.id]); show({ message: n.failed }); }
      } : undefined,
    });
    try {
      await postAction({ action, id: task.id });
    } catch {
      restore();
      show({ message: n.failed });
    }
  };

  const seeAll = total > 5 ? <Link href="/notificacoes" className="link-quiet">{n.seeAll}</Link> : undefined;

  return (
    <div className="@container">
      <div className="flex items-center justify-between gap-4 mb-1">
        <h2 ref={heading} tabIndex={-1} className="panel-title flex items-center gap-2 outline-none">
          {n.title}
          {count > 0 && <span className="count" aria-label={n.count(count)}>{count}</span>}
        </h2>
        {seeAll}
      </div>
      {visible.length === 0 ? (
        <EmptyState icon={<Inbox size={24} aria-hidden />} title={n.empty}>{n.emptyHint}</EmptyState>
      ) : (
        <ul className="divide-y divide-[var(--ds-border-subtle)]">
          {visible.map((task, i) => (
            <TaskRow
              key={task.id} task={task} primary={i === 0}
              onApprove={() => act(task, "task.done", n.approved, "task.undo")}
              onPostpone={() => act(task, "task.postpone", n.postponed, "task.unpostpone")}
              onVote={() => act(task, "task.done", n.voted)}
              onGoing={() => act(task, "task.done", n.going, "task.undo")}
            />
          ))}
        </ul>
      )}
      <p className="mt-2 text-caption text-subtle md:hidden">{n.swipeHint}</p>
    </div>
  );
}

export { BlockHeader };
