"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, ConfirmDialog, TextField, useToast } from "@/design-system";
import { postService } from "@/features/shell/client-api";
import { t } from "@/i18n";

const v = t.services;

/** Acções do pedido: corrigir e reenviar, cancelar, duplicar. */
export function RequestActions({ id, status, canCancel, answers }: { id: string; status: string; canCancel: boolean; answers: { key: string; label: string; value: string }[] }) {
  const router = useRouter();
  const { show } = useToast();
  const [confirm, setConfirm] = useState(false);
  const [fixing, setFixing] = useState(false);
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const run = async (body: Record<string, unknown>, message: string) => {
    setBusy(true);
    setError("");
    try {
      const res = await postService<{ id?: string }>(body);
      show({ message });
      router.refresh();
      return res;
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const emptyOnes = answers.filter((a) => !a.value);
  const filled = answers.filter((a) => a.value);
  return (
    <div className="flex flex-col gap-3">
      {status === "devolvido" && fixing && (
        <div className="flex flex-col gap-3">
          {[...emptyOnes, ...filled].map((a, i) => (
            <TextField key={a.key} autoFocus={i === 0} label={a.label} required={!a.value} defaultValue={a.value} onChange={(e) => setEdits((x) => ({ ...x, [a.key]: e.target.value }))} />
          ))}
        </div>
      )}
      {error && <p className="field-err" role="alert">{error}</p>}
      <div className="flex flex-wrap gap-2">
        {status === "devolvido" && (fixing
          ? <Button variant="pri" loading={busy} onClick={async () => { const r = await run({ action: "request.resubmit", id, answers: edits }, v.resubmitted); if (r) setFixing(false); }}>{v.resubmit}</Button>
          : <Button variant="pri" onClick={() => setFixing(true)}>{v.fix}</Button>)}
        {canCancel && <Button variant="gh" onClick={() => setConfirm(true)}>{v.cancel}</Button>}
        <Button variant="gh" loading={busy && !fixing} onClick={async () => { const r = await run({ action: "request.duplicate", id }, v.duplicated); if (r?.id) router.push(`/servicos/meus-pedidos?separador=rascunhos`); }}>{v.duplicate}</Button>
      </div>
      <ConfirmDialog open={confirm} onClose={() => setConfirm(false)} title={v.cancelTitle} verb={v.cancel} danger onConfirm={async () => { setConfirm(false); await run({ action: "request.cancel", id }, v.cancelled); }}>
        {v.cancelBody}
      </ConfirmDialog>
    </div>
  );
}
