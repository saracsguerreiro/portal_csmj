"use client";

import { ChevronLeft, ChevronRight, Megaphone } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { flushSync } from "react-dom";
import { Button, Checkbox, Dialog, IconButton, ScopeTag, Sheet, useToast, withTransition } from "@/design-system";
import { t } from "@/i18n";
import { postAction } from "./client-api";
import { useShell } from "./ShellContext";
import type { NoticeView } from "./types";

const b = t.banner;

function NoticeBody({ notice }: { notice: NoticeView }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <ScopeTag kind={notice.scopeKind}>{notice.scopeLabel}</ScopeTag>
        <span className="text-caption text-subtle">{b.version(notice.version, notice.publishedLabel)}</span>
      </div>
      <div className="flex max-w-[75ch] flex-col gap-3 text-ui">{notice.body.map((p) => <p key={p}>{p}</p>)}</div>
    </div>
  );
}

export function NoticeBanner() {
  const { data } = useShell();
  const router = useRouter();
  const { show } = useToast();
  const [done, setDone] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [openNotice, setOpenNotice] = useState(false);
  const [checked, setChecked] = useState(false);

  const list = data.pendingNotices.filter((n) => !done.includes(n.id));
  const current = list[Math.min(index, list.length - 1)];

  const closeSheet = useCallback(() => setOpenNotice(false), []);

  if (!current) return null;

  const confirm = async () => {
    const id = current.id;
    setDone((d) => [...d, id]);
    setOpenNotice(false);
    setChecked(false);
    setIndex(0);
    show({ message: b.confirmed });
    try {
      await postAction({ action: "notice.confirm", id });
      router.refresh();
    } catch {
      setDone((d) => d.filter((x) => x !== id));
      show({ message: t.home.needs.failed });
    }
  };

  const open = () => withTransition(() => flushSync(() => setOpenNotice(true)));
  const label = current.number ? `${current.number} · ${current.title}` : current.title;
  const titleName = "notice-title";

  const confirmControls = (
    <>
      <Checkbox checked={checked} onChange={(e) => setChecked(e.target.checked)}>{b.understood}</Checkbox>
      <Button variant="pri" block disabled={!checked} onClick={confirm}>{b.confirm}</Button>
    </>
  );

  if (data.blockingNotice) {
    return (
      <Dialog open title={label} actions={<div className="flex w-full flex-col gap-3">{confirmControls}</div>}>
        <p className="mb-3 font-medium text-ink">{b.blockingLead}</p>
        <NoticeBody notice={current} />
      </Dialog>
    );
  }

  return (
    <section aria-label={b.region} className="notice-band">
      <div className="wrap flex min-h-14 items-center gap-3 py-2">
        <Megaphone size={20} aria-hidden className="flex-none text-brand" />
        <p className="min-w-0 flex-1 text-body font-medium md:truncate">
          <span style={openNotice ? undefined : { viewTransitionName: titleName }}>{label}</span>
        </p>
        {list.length > 1 && (
          <div className="hidden items-center gap-1 md:flex">
            <span className="text-label" aria-live="polite">{b.position(Math.min(index, list.length - 1) + 1, list.length)}</span>
            <IconButton size="sm" label={b.previous} onClick={() => setIndex((i) => (i - 1 + list.length) % list.length)}><ChevronLeft size={16} aria-hidden /></IconButton>
            <IconButton size="sm" label={b.next} onClick={() => setIndex((i) => (i + 1) % list.length)}><ChevronRight size={16} aria-hidden /></IconButton>
          </div>
        )}
        <Button variant="pri" size="sm" onClick={open}>
          <span className="md:hidden">{b.readShort}</span>
          <span className="hidden md:inline">{b.read}</span>
        </Button>
      </div>
      <Sheet open={openNotice} onClose={closeSheet} title={<span style={openNotice ? { viewTransitionName: titleName } : undefined}>{label}</span>} footer={confirmControls}>
        <NoticeBody notice={current} />
      </Sheet>
    </section>
  );
}
