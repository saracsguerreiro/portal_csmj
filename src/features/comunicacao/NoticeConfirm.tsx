"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Checkbox, useToast } from "@/design-system";
import { postAction } from "@/features/shell/client-api";
import { t } from "@/i18n";

const b = t.banner;

/** Barra fixa de confirmação: "Tomei conhecimento" só fica activo depois de marcar. */
export function NoticeConfirm({ id }: { id: string }) {
  const router = useRouter();
  const { show } = useToast();
  const [checked, setChecked] = useState(false);
  const [busy, setBusy] = useState(false);
  const confirm = async () => {
    setBusy(true);
    try {
      await postAction({ action: "notice.confirm", id });
      show({ message: b.confirmed });
      router.refresh();
    } catch {
      show({ message: t.home.needs.failed });
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="sticky bottom-[calc(56px+env(safe-area-inset-bottom))] z-30 -mx-4 mt-8 border-t border-line bg-surface px-4 py-3 md:bottom-0 md:mx-0 md:rounded-[16px] md:border md:px-5" style={{ boxShadow: "var(--ds-shadow-md)" }}>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Checkbox checked={checked} onChange={(e) => setChecked(e.target.checked)}>{b.understood}</Checkbox>
        <Button variant="pri" disabled={!checked} loading={busy} onClick={confirm}>{b.confirm}</Button>
      </div>
    </div>
  );
}
